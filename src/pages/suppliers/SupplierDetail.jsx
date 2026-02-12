import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  History, 
  FileText, 
  DollarSign, 
  Package,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopSuppliers } from '../../services/suppliers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';

const SupplierDetail = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]); // Mock or fetch from POs

  useEffect(() => {
    const fetchData = async () => {
      if (!shop?.id || !id) return;
      setLoading(true);
      try {
        const suppliers = await getShopSuppliers(shop.id);
        const data = suppliers.find(s => s.id === id);
        if (data) setSupplier(data);
        else notify.error('Supplier not found');
      } catch (error) {
        notify.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, shop?.id]);

  if (!supplier && !loading) return <div className="p-8 text-center">Supplier not found</div>;

  const poColumns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      render: (val) => <span className="font-bold text-primary">{val}</span>
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (val) => val?.toDate().toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => <Badge variant={status === 'Received' ? 'success' : 'warning'}>{status}</Badge>
    },
    {
      header: 'Total Value',
      accessor: 'total',
      render: (val) => <span className="font-bold">Rs. {val?.toLocaleString()}</span>
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl uppercase">
                {supplier?.name?.[0]}
             </div>
             <div>
                <h1 className="text-2xl font-black text-text-primary tracking-tight">{supplier?.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <Badge variant="gray" size="sm">{supplier?.contactPerson}</Badge>
                   <div className="flex items-center gap-1 text-warning">
                      <Star size={12} className="fill-warning" />
                      <span className="text-xs font-bold">{supplier?.rating} / 5</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" icon={Edit2} onClick={() => navigate(`/suppliers/${id}/edit`)}>Edit Profile</Button>
           <Button icon={FileText} onClick={() => navigate('/purchase-orders/create', { state: { supplierId: id } })}>Create PO</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Left: Contact & Info */}
         <div className="space-y-6">
            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-6">Contact Information</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface hover:bg-surface-2 transition-colors">
                     <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-muted">
                        <Phone size={18} />
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Phone</p>
                        <p className="text-sm font-bold text-text-primary">{supplier?.phone || 'N/A'}</p>
                     </div>
                     <ExternalLink size={14} className="text-text-muted" />
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-surface hover:bg-surface-2 transition-colors">
                     <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-muted">
                        <Mail size={18} />
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Email</p>
                        <p className="text-sm font-bold text-text-primary">{supplier?.email || 'N/A'}</p>
                     </div>
                     <ExternalLink size={14} className="text-text-muted" />
                  </div>
                  <div className="flex items-start gap-4 p-3 rounded-2xl bg-surface hover:bg-surface-2 transition-colors">
                     <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-text-muted mt-1">
                        <MapPin size={18} />
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Address</p>
                        <p className="text-sm font-bold text-text-primary leading-relaxed">{supplier?.address || 'N/A'}</p>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-6">Payment Terms</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                     <span className="text-xs text-text-muted">Terms</span>
                     <Badge variant="navy" className="capitalize">{supplier?.paymentTerms}</Badge>
                  </div>
                  {supplier?.paymentTerms === 'credit' && (
                     <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-xs text-text-muted">Credit Days</span>
                        <span className="font-bold text-sm">{supplier?.creditDays} Days</span>
                     </div>
                  )}
                  <div className="pt-2">
                     <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Internal Notes</p>
                     <p className="text-xs text-text-secondary leading-relaxed italic">"{supplier?.notes || 'No notes available.'}"</p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Middle/Right: History & Stats */}
         <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <Card className="p-6 border-none ring-1 ring-border/50 bg-primary text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Spend</p>
                  <h3 className="text-3xl font-black mt-1">Rs. 0</h3>
                  <div className="flex items-center gap-2 mt-4 text-[11px] opacity-80">
                     <History size={14} /> From 0 orders
                  </div>
               </Card>
               <Card className="p-6 border-none ring-1 ring-border/50 bg-navy text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Supply Strength</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                     {supplier?.categories?.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-white/10 text-[10px] font-bold border border-white/10">
                           {c}
                        </span>
                     ))}
                  </div>
               </Card>
            </div>

            <Card className="border-none ring-1 ring-border/50">
               <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                     <History size={16} className="text-primary" /> Purchase History
                  </h3>
               </div>
               <Table 
                 columns={poColumns}
                 data={[]}
                 emptyMessage="No purchase orders found for this supplier."
               />
               <div className="p-4 border-t border-border bg-surface/30">
                  <button className="w-full text-xs font-bold text-primary flex items-center justify-center gap-2 hover:underline">
                     See All Orders <ChevronRight size={14} />
                  </button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
