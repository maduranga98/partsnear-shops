import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Calculator,
  Save,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { getShopParts } from '../../services/parts';
import { adjustStock } from '../../services/inventory';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { cn } from '../../utils/helpers';

const StockTake = () => {
  const { shop } = useShop(); 
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState([]);
  const [counts, setCounts] = useState({}); // { partId: physicalCount }
  const [filterOnlyDiscrepancies, setFilterOnlyDiscrepancies] = useState(false);
  const [search, setSearch] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const data = await getShopParts(shop.id);
        setParts(data);
        
        // Initialize counts with expected values if user wants, 
        // but usually physical count starts empty or zero for true audit
        const initialCounts = {};
        data.forEach(p => {
          initialCounts[p.id] = p.quantity || 0;
        });
        setCounts(initialCounts);
      } catch (error) {
        notify.error('Failed to fetch parts');
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [shop?.id]);

  const handleCountChange = (partId, value) => {
    setCounts(prev => ({ ...prev, [partId]: Number(value) }));
  };

  const getDiscrepancy = (part) => {
    const expected = part.quantity || 0;
    const physical = counts[part.id] ?? expected;
    return physical - expected;
  };

  const filteredParts = parts.filter(p => {
    const searchMatch = p.name?.toLowerCase().includes(search.toLowerCase()) || 
                      p.partNumber?.toLowerCase().includes(search.toLowerCase());
    if (!searchMatch) return false;
    
    if (filterOnlyDiscrepancies) {
      return getDiscrepancy(p) !== 0;
    }
    return true;
  });

  const discrepancies = parts.filter(p => getDiscrepancy(p) !== 0).map(p => ({
    part: p,
    expected: p.quantity,
    actual: counts[p.id],
    diff: getDiscrepancy(p)
  }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create adjustments for all parts with discrepancies
      for (const item of discrepancies) {
        await adjustStock(item.part.id, {
          quantity: item.actual,
          type: 'set',
          reason: 'stocktake',
          note: `Physical count adjustment from stock take. Discrepancy: ${item.diff > 0 ? '+' : ''}${item.diff}`,
          staffId: user?.uid,
          shopId: shop.id,
          previousQuantity: item.expected
        });
      }
      notify.success(`Stock take completed. ${discrepancies.length} adjustments made.`);
      navigate(ROUTES.INVENTORY);
    } catch (error) {
      notify.error('Failed to complete stock take');
    } finally {
      setIsSubmitting(false);
      setShowReview(false);
    }
  };

  const columns = [
    {
      header: 'Part Details',
      accessor: 'name',
      render: (name, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-text-primary text-[13px]">{name}</div>
          <div className="text-[11px] text-text-muted">PN: {row.partNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Expected',
      accessor: 'quantity',
      render: (qty) => <span className="font-bold text-text-secondary">{qty} units</span>
    },
    {
      header: 'Physical Count',
      accessor: 'id',
      render: (id) => (
        <div className="max-w-[100px]">
          <Input 
            type="number" 
            value={counts[id]} 
            onChange={(e) => handleCountChange(id, e.target.value)}
            className="text-center h-8 font-bold"
          />
        </div>
      )
    },
    {
      header: 'Discrepancy',
      accessor: 'id',
      render: (_, row) => {
        const diff = getDiscrepancy(row);
        if (diff === 0) return <span className="text-[11px] text-text-muted">Match</span>;
        return (
          <Badge variant={diff > 0 ? 'success' : 'error'} size="sm" className="font-bold">
            {diff > 0 ? '+' : ''}{diff}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Stock Take / Audit"
        subtitle="Perform physical inventory counts and reconcile with system levels."
        actions={
          <div className="flex gap-3">
             <Button variant="outline" icon={RefreshCw} onClick={() => window.location.reload()}>Reset Audit</Button>
             <Button 
               icon={ClipboardCheck} 
               onClick={() => setShowReview(true)}
               disabled={discrepancies.length === 0}
             >
                Review & Apply ({discrepancies.length})
             </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 border-none ring-1 ring-border/50 bg-primary/5">
           <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Total Parts to Audit</p>
           <h3 className="text-2xl font-black text-text-primary">{parts.length}</h3>
        </Card>
        <Card className="p-4 border-none ring-1 ring-border/50 bg-success/5">
           <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-1">Matching Items</p>
           <h3 className="text-2xl font-black text-text-primary">{parts.length - discrepancies.length}</h3>
        </Card>
        <Card className="p-4 border-none ring-1 ring-border/50 bg-error/5">
           <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Items with Discrepancy</p>
           <h3 className="text-2xl font-black text-text-primary">{discrepancies.length}</h3>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-4 border-none ring-1 ring-border/50">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
           <div className="w-full sm:w-64">
              <Input 
                 placeholder="Search by name or PN..." 
                 icon={Search} 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Button
             variant={filterOnlyDiscrepancies ? 'success' : 'outline'}
             size="sm"
             icon={Filter}
             onClick={() => setFilterOnlyDiscrepancies(!filterOnlyDiscrepancies)}
           >
              {filterOnlyDiscrepancies ? 'Showing Discrepancies Only' : 'Show All Items'}
           </Button>
        </div>
      </Card>

      {/* Audit Table */}
      <Card className="border-none ring-1 ring-border/50 overflow-hidden">
        <Table 
          columns={columns}
          data={filteredParts}
          loading={loading}
          pageSize={20}
          paginated
          emptyMessage="No parts found matching your criteria."
        />
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        title="Review & Apply Adjustments"
        size="lg"
      >
        <div className="space-y-6">
           <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 flex gap-3 text-warning">
              <AlertTriangle className="shrink-0" size={20} />
              <p className="text-[12px] leading-relaxed">
                 You are about to adjust <strong>{discrepancies.length} parts</strong> based on your physical count. This will create "Stock Take" movement entries for each change.
              </p>
           </div>

           <div className="max-h-60 overflow-y-auto border border-border rounded-xl">
              <table className="w-full text-[12px] text-left">
                 <thead className="bg-surface sticky top-0">
                    <tr>
                       <th className="p-3 border-b border-border">Part Name</th>
                       <th className="p-3 border-b border-border text-center">Expected</th>
                       <th className="p-3 border-b border-border text-center">Actual</th>
                       <th className="p-3 border-b border-border text-center">Adjustment</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {discrepancies.map((item) => (
                       <tr key={item.part.id}>
                          <td className="p-3 font-medium">{item.part.name}</td>
                          <td className="p-3 text-center">{item.expected}</td>
                          <td className="p-3 text-center font-bold">{item.actual}</td>
                          <td className="p-3 text-center">
                             <Badge variant={item.diff > 0 ? 'success' : 'error'} size="sm">
                                {item.diff > 0 ? '+' : ''}{item.diff}
                             </Badge>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowReview(false)}>Cancel</Button>
              <Button loading={isSubmitting} onClick={handleSubmit} icon={ClipboardCheck}>
                 Confirm & Adjust All
              </Button>
           </div>
        </div>
      </Modal>

      <div className="p-6 bg-navy text-white rounded-3xl overflow-hidden relative">
         <div className="relative z-10 space-y-2">
            <h4 className="text-sm font-bold opacity-80 mb-4">Stock Take Instructions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[12px] opacity-70 leading-relaxed">
               <p>
                  1. Print out your catalog list if preferred, or use a tablet to enter counts real-time.
                  <br />
                  2. Walk through your shelves and count the physical units of each item.
                  <br />
                  3. Enter the physical count into the "Physical Count" column on the left.
               </p>
               <p>
                  4. The system automatically calculates the discrepancy.
                  <br />
                  5. Click "Review & Apply" to see a summary of all changes before finalizing.
                  <br />
                  6. Once confirmed, system levels will be updated to match physical counts.
               </p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>
    </div>
  );
};

export default StockTake;
