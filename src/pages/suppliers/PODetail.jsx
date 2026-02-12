import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  FileText,
  Package,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { getPurchaseOrders, updatePOStatus, getShopSuppliers, receiveGoods } from '../../services/suppliers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

const PODetail = () => {
  const { shop } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [po, setPo] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiving, setReceiving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!shop?.id || !id) return;
      setLoading(true);
      try {
        const [poData, suppliers] = await Promise.all([
          getPurchaseOrders(shop.id),
          getShopSuppliers(shop.id)
        ]);
        const order = poData.find(p => p.id === id);
        if (order) {
          setPo(order);
          setSupplier(suppliers.find(s => s.id === order.supplierId));
        } else {
          notify.error('PO not found');
        }
      } catch (error) {
        notify.error('Failed to fetch PO data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, shop?.id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updatePOStatus(id, newStatus);
      setPo(prev => ({ ...prev, status: newStatus }));
      notify.success(`PO status updated to ${newStatus}`);
    } catch (error) {
      notify.error('Failed to update status');
    }
  };

  const handleReceive = async () => {
    setReceiving(true);
    try {
      await receiveGoods(id, po.items, shop.id, user?.uid);
      setPo(prev => ({ ...prev, status: 'Received' }));
      notify.success('Goods received and stock updated successfully');
      setShowReceiveModal(false);
    } catch (error) {
      notify.error('Failed to receive goods');
    } finally {
      setReceiving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading PO...</div>;
  if (!po) return <div className="p-8 text-center">PO not found</div>;

  const columns = [
    {
      header: 'Part Details',
      accessor: 'name',
      render: (name, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-text-primary text-[13px]">{name}</div>
          <div className="text-[11px] text-text-muted">PN: {row.partNumber}</div>
        </div>
      )
    },
    {
      header: 'Ordered Qty',
      accessor: 'quantity',
      render: (qty) => <span className="font-bold text-text-primary">{qty} units</span>
    },
    {
      header: 'Unit Cost',
      accessor: 'unitCost',
      render: (cost) => <span>Rs. {cost?.toLocaleString()}</span>
    },
    {
      header: 'Line Total',
      accessor: 'total',
      render: (total) => <span className="font-black text-text-primary">Rs. {total?.toLocaleString()}</span>
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary">
             <ArrowLeft size={20} />
          </button>
          <div>
             <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-text-primary tracking-tight">PO {po.poNumber}</h1>
                <Badge variant={po.status === 'Draft' ? 'gray' : po.status === 'Received' ? 'success' : 'warning'}>
                   {po.status}
                </Badge>
             </div>
             <p className="text-sm text-text-secondary mt-1">Ordered from {supplier?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" icon={Printer}>Print PO</Button>
           {po.status === 'Draft' && (
              <Button onClick={() => handleStatusUpdate('Ordered')} icon={Truck}>Mark as Ordered</Button>
           )}
           {po.status === 'Ordered' && (
              <Button onClick={() => setShowReceiveModal(true)} icon={CheckCircle2}>Receive Goods</Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Items Table */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="border-none ring-1 ring-border/50">
               <div className="p-6 border-b border-border">
                  <h3 className="text-sm font-bold text-text-primary">Ordered Items</h3>
               </div>
               <Table columns={columns} data={po.items} />
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-4 text-text-muted uppercase tracking-widest">Order Notes</h3>
               <p className="text-xs text-text-secondary leading-relaxed italic">
                  "{po.notes || 'No notes provided for this order.'}"
               </p>
            </Card>
         </div>

         {/* Order Summary & Meta */}
         <div className="space-y-6">
            <Card className="p-6 border-none ring-1 ring-border/50 space-y-6">
               <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-primary" /> Cost Summary
               </h3>
               <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center text-text-muted">
                     <span>Subtotal</span>
                     <span>Rs. {po.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                     <span>Shipping</span>
                     <span>Rs. {po.shipping?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                     <span>Tax</span>
                     <span>Rs. {po.tax?.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                     <span className="font-black text-text-primary">Total Amount</span>
                     <span className="text-xl font-black text-primary">Rs. {po.total?.toLocaleString()}</span>
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-primary" /> Order Timeline
               </h3>
               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="w-1 h-12 bg-success rounded-full" />
                     <div>
                        <p className="text-xs font-bold text-text-primary">Order Created</p>
                        <p className="text-[10px] text-text-muted">{po.createdAt?.toDate().toLocaleString()}</p>
                     </div>
                  </div>
                  {po.status !== 'Draft' && (
                     <div className="flex gap-4">
                        <div className={cn("w-1 h-12 rounded-full", po.status === 'Received' ? 'bg-success' : 'bg-warning')} />
                        <div>
                           <p className="text-xs font-bold text-text-primary">Status: {po.status}</p>
                           <p className="text-[10px] text-text-muted">Updated on {po.updatedAt?.toDate().toLocaleString()}</p>
                        </div>
                     </div>
                  )}
               </div>
            </Card>
         </div>
      </div>

      {/* Receive Confirmation Modal */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title="Confirm Goods Receipt"
      >
        <div className="space-y-6">
           <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 text-primary">
              <Package className="shrink-0" size={20} />
              <p className="text-[12px] leading-relaxed">
                 By confirming, items in this purchase order will be <strong>added to your current stock levels</strong> automatically.
              </p>
           </div>
           
           <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowReceiveModal(false)}>Cancel</Button>
              <Button loading={receiving} onClick={handleReceive} icon={CheckCircle2}>
                 Confirm & Update Stock
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default PODetail;
