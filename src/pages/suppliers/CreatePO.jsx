import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  Save, 
  Send, 
  ShoppingBag,
  User,
  Package,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { getShopSuppliers, createPurchaseOrder } from '../../services/suppliers';
import { getShopParts } from '../../services/parts';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import { cn } from '../../utils/helpers';

const CreatePO = () => {
  const { shop } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotification();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);
  
  const [orderData, setOrderData] = useState({
    supplierId: location.state?.supplierId || '',
    items: [],
    shipping: 0,
    tax: 0,
    notes: '',
    status: 'Draft'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!shop?.id) return;
      try {
        const [supData, partData] = await Promise.all([
          getShopSuppliers(shop.id),
          getShopParts(shop.id)
        ]);
        setSuppliers(supData);
        setParts(partData);
      } catch (error) {
        notify.error('Failed to load data');
      }
    };
    fetchData();
  }, [shop?.id]);

  const addItem = (part) => {
    if (orderData.items.find(i => i.partId === part.id)) {
      return notify.error('Item already added');
    }
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, {
        partId: part.id,
        name: part.name,
        partNumber: part.partNumber,
        quantity: 1,
        unitCost: part.costPrice || 0,
        total: part.costPrice || 0
      }]
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index][field] = Number(value);
    newItems[index].total = newItems[index].quantity * newItems[index].unitCost;
    setOrderData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const subtotal = orderData.items.reduce((acc, item) => acc + item.total, 0);
  const total = subtotal + Number(orderData.shipping) + Number(orderData.tax);

  const handleSave = async (status = 'Draft') => {
    if (!orderData.supplierId) return notify.error('Please select a supplier');
    if (orderData.items.length === 0) return notify.error('Please add at least one item');
    
    setLoading(true);
    try {
      await createPurchaseOrder(shop.id, {
        ...orderData,
        status,
        subtotal,
        total,
        staffId: user?.uid
      });
      notify.success(`Purchase order created as ${status}`);
      navigate('/purchase-orders');
    } catch (error) {
      notify.error('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary">
          <ArrowLeft size={20} />
        </button>
        <PageHeader title="Create Purchase Order" className="mb-0" />
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4 mb-8">
         {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
               <div className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                 step === s ? "bg-primary text-white scale-110 shadow-lg" : 
                 step > s ? "bg-success text-white" : "bg-surface-2 text-text-muted"
               )}>
                  {step > s ? <CheckCircle2 size={20} /> : s}
               </div>
               {s < 3 && <div className={cn("w-12 h-0.5 mx-2", step > s ? "bg-success" : "bg-surface-2")} />}
            </div>
         ))}
      </div>

      {/* Step 1: Supplier & Basic Info */}
      {step === 1 && (
        <Card className="p-8 border-none ring-1 ring-border/50 space-y-8 max-w-2xl mx-auto">
           <div className="space-y-2 text-center">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                 <User size={32} />
              </div>
              <h3 className="text-xl font-black text-text-primary">Step 1: Select Supplier</h3>
              <p className="text-sm text-text-secondary">Choose the supplier you are ordering from.</p>
           </div>

           <div className="space-y-6">
              <Select 
                 label="Select Supplier"
                 options={suppliers.map(s => ({ label: s.name, value: s.id }))}
                 value={orderData.supplierId}
                 onChange={(opt) => setOrderData(prev => ({ ...prev, supplierId: opt.value }))}
              />
              <Input 
                 label="Internal Notes"
                 placeholder="Any specific instructions for this order..."
                 value={orderData.notes}
                 onChange={(e) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
              />
              <Button 
                className="w-full h-12" 
                disabled={!orderData.supplierId}
                onClick={() => setStep(2)}
                icon={ArrowRight}
              >
                Next Step: Add Items
              </Button>
           </div>
        </Card>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <Card className="p-6 border-none ring-1 ring-border/50">
                  <div className="flex items-center justify-between gap-4 mb-6">
                     <h3 className="text-sm font-bold text-text-primary">Selected Items ({orderData.items.length})</h3>
                  </div>
                  
                  <div className="space-y-4">
                     {orderData.items.length === 0 ? (
                        <div className="py-12 text-center space-y-3">
                           <Package className="mx-auto text-text-muted opacity-20" size={48} />
                           <p className="text-sm text-text-secondary">Your order is empty. Select parts from the list.</p>
                        </div>
                     ) : (
                        orderData.items.map((item, index) => (
                           <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-surface border border-border/50">
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-text-primary">{item.name}</p>
                                 <p className="text-[10px] text-text-muted">PN: {item.partNumber}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="w-24">
                                    <Input 
                                      type="number" 
                                      label="Qty"
                                      value={item.quantity} 
                                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                      className="h-9 text-center"
                                    />
                                 </div>
                                 <div className="w-32">
                                    <Input 
                                      type="number" 
                                      label="Price"
                                      value={item.unitCost} 
                                      onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                                      className="h-9 text-right"
                                    />
                                 </div>
                                 <div className="text-right w-24">
                                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Subtotal</p>
                                    <p className="text-sm font-black text-text-primary">Rs. {item.total?.toLocaleString()}</p>
                                 </div>
                                 <button onClick={() => removeItem(index)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </Card>

               <div className="flex justify-between">
                  <Button variant="ghost" icon={ChevronLeft} onClick={() => setStep(1)}>Back</Button>
                  <Button 
                    disabled={orderData.items.length === 0}
                    onClick={() => setStep(3)}
                    icon={ArrowRight}
                  >
                     Finalize Totals
                  </Button>
               </div>
            </div>

            <div className="space-y-6">
               <Card className="p-6 border-none ring-1 ring-border/50">
                  <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                     <Search size={16} className="text-primary" /> Select Parts
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                     {parts.map((p) => (
                        <div 
                          key={p.id} 
                          className="p-3 rounded-xl border border-border/50 hover:bg-surface-2 cursor-pointer transition-colors group flex items-center justify-between"
                          onClick={() => addItem(p)}
                        >
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-text-primary truncate">{p.name}</p>
                              <p className="text-[10px] text-text-muted">PN: {p.partNumber}</p>
                           </div>
                           <Plus size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                     ))}
                  </div>
               </Card>
            </div>
         </div>
      )}

      {/* Step 3: Totals & Review */}
      {step === 3 && (
        <Card className="p-8 border-none ring-1 ring-border/50 max-w-2xl mx-auto">
           <div className="space-y-8">
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 rounded-3xl bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={32} />
                 </div>
                 <h3 className="text-xl font-black text-text-primary">Final Review</h3>
                 <p className="text-sm text-text-secondary">Summary of items and additional costs.</p>
              </div>

              <div className="space-y-6 py-6 border-y border-border/50">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Items Subtotal</span>
                    <span className="font-bold text-text-primary">Rs. {subtotal.toLocaleString()}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <Input 
                      label="Shipping/Freight" 
                      type="number" 
                      value={orderData.shipping}
                      onChange={(e) => setOrderData(prev => ({ ...prev, shipping: e.target.value }))}
                    />
                    <Input 
                      label="Tax (VAT/NBT)" 
                      type="number" 
                      value={orderData.tax}
                      onChange={(e) => setOrderData(prev => ({ ...prev, tax: e.target.value }))}
                    />
                 </div>
                 <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-lg font-black text-text-primary">Total Amount</span>
                    <span className="text-2xl font-black text-primary underline decoration-primary/30 underline-offset-8">
                       Rs. {total.toLocaleString()}
                    </span>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>Back to Items</Button>
                 <Button variant="ghost" className="flex-1 h-12" loading={loading} onClick={() => handleSave('Draft')} icon={Save}>
                    Save as Draft
                 </Button>
                 <Button className="flex-1 h-12 shadow-lg shadow-primary/25" loading={loading} onClick={() => handleSave('Ordered')} icon={Send}>
                    Mark as Ordered
                 </Button>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
};

export default CreatePO;
