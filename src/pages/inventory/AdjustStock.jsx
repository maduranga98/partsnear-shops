import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  ChevronRight, 
  Plus, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  Upload,
  Download,
  Database,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useShop } from '../../context/ShopContext';
import { getShopParts } from '../../services/parts';
import { adjustStock } from '../../services/inventory';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { ADJUSTMENT_REASONS } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { cn } from '../../utils/helpers';

const AdjustStock = () => {
  const { shop, user } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [adjustment, setAdjustment] = useState({
    type: 'add', // 'add', 'subtract', 'set'
    quantity: 0,
    reason: 'correction',
    note: ''
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchData, setBatchData] = useState([]);

  useEffect(() => {
    const fetchParts = async () => {
      if (!shop?.id) return;
      try {
        const data = await getShopParts(shop.id);
        setParts(data);
        
        // If partId passed in state, select it
        if (location.state?.partId) {
          const part = data.find(p => p.id === location.state.partId);
          if (part) setSelectedPart(part);
        }
      } catch (error) {
        notify.error('Failed to fetch parts');
      }
    };
    fetchParts();
  }, [shop?.id, location.state]);

  const handleAdjust = async () => {
    if (!selectedPart || !adjustment.quantity) return;
    
    setLoading(true);
    try {
      await adjustStock(selectedPart.id, {
        quantity: adjustment.type === 'subtract' ? -Math.abs(adjustment.quantity) : Number(adjustment.quantity),
        type: adjustment.type,
        reason: adjustment.reason,
        note: adjustment.note,
        staffId: user?.uid,
        shopId: shop.id,
        previousQuantity: selectedPart.quantity || 0
      });
      
      notify.success('Stock adjusted successfully');
      navigate(ROUTES.INVENTORY);
    } catch (error) {
      notify.error('Failed to adjust stock');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Basic validation of CSV headers: need partId (or barcode) and quantity
      setBatchData(data);
      setIsBatchMode(true);
    };
    reader.readAsBinaryString(file);
  };

  const processBatch = async () => {
    setLoading(true);
    let successCount = 0;
    try {
      for (const row of batchData) {
        const partId = row.partId || parts.find(p => p.barcode === row.barcode)?.id;
        if (!partId) continue;

        const part = parts.find(p => p.id === partId);
        if (!part) continue;

        await adjustStock(partId, {
          quantity: Number(row.quantity),
          type: 'set',
          reason: 'Correction (Batch)',
          staffId: user?.uid,
          shopId: shop.id,
          previousQuantity: part.quantity || 0
        });
        successCount++;
      }
      notify.success(`Successfully updated ${successCount} parts`);
      navigate(ROUTES.INVENTORY);
    } catch (error) {
      notify.error('Batch update failed mid-way');
    } finally {
      setLoading(false);
    }
  };

  const newQuantity = adjustment.type === 'set' 
    ? adjustment.quantity 
    : (selectedPart?.quantity || 0) + (adjustment.type === 'subtract' ? -adjustment.quantity : Number(adjustment.quantity));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Adjust Stock"
        subtitle="Manually update stock levels with reason codes and history tracking."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Selection & Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-6">Adjustment Form</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select Part</label>
                <Select 
                  options={parts.map(p => ({ 
                    label: `${p.name} (${p.partNumber || 'No PN'})`, 
                    value: p.id,
                    part: p 
                  }))}
                  value={selectedPart?.id}
                  onChange={(opt) => setSelectedPart(opt.part)}
                  placeholder="Search for a part..."
                  isSearchable
                />
              </div>

              {selectedPart && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-surface-2 ring-1 ring-border/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Current Stock</p>
                    <p className="text-2xl font-black text-text-primary">{selectedPart.quantity || 0} units</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Expected Status</p>
                    <Badge variant={newQuantity > 5 ? 'success' : newQuantity > 0 ? 'warning' : 'error'}>
                      {newQuantity > 5 ? 'In Stock' : newQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Adjustment Type</label>
                  <div className="flex gap-2 p-1 bg-surface-2 rounded-xl ring-1 ring-border/50">
                    {[
                      { id: 'add', icon: Plus, label: 'Add' },
                      { id: 'subtract', icon: Minus, label: 'Remove' },
                      { id: 'set', icon: Database, label: 'Set Total' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setAdjustment(prev => ({ ...prev, type: t.id }))}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all",
                          adjustment.type === t.id 
                            ? "bg-white text-primary shadow-sm" 
                            : "text-text-muted hover:text-text-primary"
                        )}
                      >
                        <t.icon size={14} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input 
                  label="Quantity"
                  type="number"
                  placeholder="Enter positive number"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Reason Code</label>
                  <Select 
                    options={ADJUSTMENT_REASONS}
                    value={adjustment.reason}
                    onChange={(opt) => setAdjustment(prev => ({ ...prev, reason: opt.value }))}
                  />
                </div>
                <Input 
                  label="Internal Note (Optional)"
                  placeholder="Reference number or description..."
                  value={adjustment.note}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, note: e.target.value }))}
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center">
                 <div className="text-text-secondary text-xs">
                    Resulting Quantity: <span className="font-bold text-text-primary">{newQuantity} units</span>
                 </div>
                 <Button 
                   disabled={!selectedPart || !adjustment.quantity || adjustment.quantity <= 0}
                   onClick={() => setShowConfirm(true)}
                 >
                    Apply Adjustment
                 </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card className="p-6 border-none ring-1 ring-border/50 bg-primary/5 border-primary/10">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Upload size={16} /> Batch Adjustment
            </h3>
            <p className="text-[12px] text-text-secondary mb-6 leading-relaxed">
              Have a list of stock updates? Upload a CSV or Excel file to update multiple items at once.
            </p>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                icon={Download}
                onClick={() => {
                  const template = [['partId', 'barcode', 'quantity', 'note']];
                  const ws = XLSX.utils.aoa_to_sheet(template);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "StockUpdate");
                  XLSX.writeFile(wb, "stock_update_template.xlsx");
                }}
              >
                Get Template
              </Button>
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx" />
              <Button className="w-full" icon={Upload} onClick={() => fileInputRef.current?.click()}>
                Upload File
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Info size={16} /> Guidelines
            </h3>
            <ul className="space-y-4">
              {[
                { title: 'Reason Codes', text: 'Always select a correct reason for accurate financial and auditing reports.' },
                { title: 'Zero Stock', text: 'Setting stock to zero will trigger "Out of Stock" alerts on the shop front.' },
                { title: 'Auditing', text: 'All manual adjustments are logged with your name and timestamp for accountability.' }
              ].map((g, i) => (
                <li key={i} className="space-y-1">
                  <p className="text-[11px] font-bold text-text-primary">{g.title}</p>
                  <p className="text-[10px] text-text-muted leading-relaxed">{g.text}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={showConfirm} 
        onClose={() => setShowConfirm(false)}
        title="Confirm Adjustment"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface-2 border border-border">
             <h4 className="font-bold text-text-primary mb-1">{selectedPart?.name}</h4>
             <p className="text-xs text-text-muted">PN: {selectedPart?.partNumber || 'N/A'} • Barcode: {selectedPart?.barcode}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 py-4 border-y border-border">
            <div className="text-center">
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Before</p>
               <p className="text-2xl font-black text-text-secondary">{selectedPart?.quantity || 0}</p>
            </div>
            <div className="text-center relative">
               <div className="absolute top-1/2 -left-4 -translate-y-1/2 text-primary">
                  <ChevronRight size={20} strokeWidth={3} />
               </div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">After</p>
               <p className="text-2xl font-black text-primary">{newQuantity}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-navy/5 text-navy border border-navy/10">
             <AlertCircle size={18} className="shrink-0 mt-0.5" />
             <div className="text-xs">
                <p className="font-bold mb-1">Accountability Check</p>
                <p className="opacity-80">This change will be logged under your account <strong>({user?.email})</strong>. Ensure the quantity and reason code are correct before proceeding.</p>
             </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button loading={loading} onClick={handleAdjust}>Confirm & Apply</Button>
          </div>
        </div>
      </Modal>

      {/* Batch Processing Modal */}
      <Modal
        isOpen={isBatchMode}
        onClose={() => setIsBatchMode(false)}
        title="Process Batch Adjustment"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            We found <span className="font-bold text-text-primary">{batchData.length} records</span> in your file. These will all be set as "Set Total" adjustments with "Correction (Batch)" reason.
          </p>

          <div className="max-h-60 overflow-y-auto border border-border rounded-xl">
             <table className="w-full text-xs text-left">
                <thead className="bg-surface sticky top-0">
                   <tr>
                      <th className="p-3 border-b border-border">Part ID / Barcode</th>
                      <th className="p-3 border-b border-border text-center">New Qty</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border">
                   {batchData.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-surface/50">
                         <td className="p-3 font-medium">{row.partId || row.barcode || 'N/A'}</td>
                         <td className="p-3 text-center font-bold text-primary">{row.quantity}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          <div className="flex gap-3 justify-end">
             <Button variant="outline" onClick={() => setIsBatchMode(false)}>Cancel</Button>
             <Button loading={loading} onClick={processBatch} icon={CheckCircle2}>Apply All Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdjustStock;
