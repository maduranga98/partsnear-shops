import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Car, 
  ShoppingBag, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  DollarSign,
  History,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { 
  getCustomerById, 
  getCustomerVehicles, 
  addVehicle, 
  removeVehicle,
  getCreditHistory,
  recordCreditPayment
} from '../../services/customers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { VEHICLE_MAKES, PAYMENT_METHODS } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/helpers';

const CustomerDetail = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab ] = useState('profile');

  // Sub-data states
  const [vehicles, setVehicles] = useState([]);
  const [history, setHistory] = useState([]);

  // Modals
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [customerData, vehicleData, historyData] = await Promise.all([
          getCustomerById(id),
          getCustomerVehicles(id),
          getCreditHistory(id)
        ]);
        
        if (customerData) {
          setCustomer(customerData);
          setVehicles(vehicleData);
          setHistory(historyData);
        } else {
          notify.error('Customer not found');
          navigate('/customers');
        }
      } catch (error) {
        notify.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading customer records...</div>;
  if (!customer) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'history', label: 'History', icon: History },
    { id: 'credit', label: 'Credit Account', icon: CreditCard },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/customers')} className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary">
             <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black uppercase">
               {customer.name?.[0]}
            </div>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-text-primary tracking-tight">{customer.name}</h1>
                  <div className="flex gap-1">
                    {customer.tags?.map((t, i) => (
                      <Badge key={i} variant="gray" size="sm">{t}</Badge>
                    ))}
                  </div>
               </div>
               <p className="text-sm text-text-secondary mt-1">{customer.phone}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
           <Button variant="outline" className="flex-1 sm:flex-none" icon={Edit2} onClick={() => navigate(`/customers/${id}/edit`)}>Edit Profile</Button>
           <Button className="flex-1 sm:flex-none" icon={DollarSign} onClick={() => setShowPaymentModal(true)}>Record Payment</Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Spent', value: `Rs. ${(customer.totalSpent || 0).toLocaleString()}`, icon: ShoppingBag, color: 'primary' },
           { label: 'Credit Balance', value: `Rs. ${(customer.creditBalance || 0).toLocaleString()}`, icon: CreditCard, color: customer.creditBalance > 0 ? 'error' : 'success' },
           { label: 'Visit Count', value: customer.visitCount || 0, icon: History, color: 'gray' },
           { label: 'Loyalty Points', value: customer.loyaltyPoints || 0, icon: CheckCircle2, color: 'warning' },
         ].map((stat, i) => (
           <Card key={i} className="p-4 border-none ring-1 ring-border/50 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", `bg-${stat.color}/10 text-${stat.color}`)}>
                 <stat.icon size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-lg font-black text-text-primary">{stat.value}</h3>
              </div>
           </Card>
         ))}
      </div>

      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto no-scrollbar">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
               activeTab === tab.id 
                 ? "border-primary text-primary bg-primary/5" 
                 : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface-2"
             )}
           >
             <tab.icon size={16} />
             {tab.label}
           </button>
         ))}
      </div>

      <div className="animate-in slide-in-from-bottom-2 duration-300">
         {activeTab === 'profile' && <ProfileTab customer={customer} />}
         {activeTab === 'vehicles' && (
           <VehiclesTab 
             vehicles={vehicles} 
             onAdd={() => setShowVehicleModal(true)} 
             onRemove={async (vid) => {
               if (window.confirm('Remove this vehicle?')) {
                 await removeVehicle(id, vid);
                 setVehicles(prev => prev.filter(v => v.id !== vid));
                 notify.success('Vehicle removed');
               }
             }}
           />
         )}
         {activeTab === 'credit' && <CreditTab history={history} customer={customer} />}
         {activeTab === 'history' && <HistoryTab id={id} />}
      </div>

      {/* Add Vehicle Modal */}
      <VehicleModal 
        isOpen={showVehicleModal} 
        onClose={() => setShowVehicleModal(false)}
        onSave={async (data) => {
          const newV = await addVehicle(id, data);
          setVehicles(prev => [...prev, newV]);
          setShowVehicleModal(false);
          notify.success('Vehicle added');
        }}
      />

      {/* Record Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        customer={customer}
        onSave={async (data) => {
          await recordCreditPayment(id, { ...data, shopId: shop.id });
          setCustomer(prev => ({ ...prev, creditBalance: prev.creditBalance - data.amount }));
          const newHistory = await getCreditHistory(id);
          setHistory(newHistory);
          setShowPaymentModal(false);
          notify.success('Payment recorded successfully');
        }}
      />
    </div>
  );
};

// --- Sub-components (Tab Views) ---

const ProfileTab = ({ customer }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     <Card className="p-8 border-none ring-1 ring-border/50 space-y-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted">Contact Information</h3>
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-2 rounded-xl text-text-secondary"><Phone size={18} /></div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-text-muted">Phone Number</p>
                 <p className="text-[15px] font-bold text-text-primary">{customer.phone}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-2 rounded-xl text-text-secondary"><Mail size={18} /></div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-text-muted">Email Address</p>
                 <p className="text-[15px] font-bold text-text-primary">{customer.email || 'N/A'}</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-2 rounded-xl text-text-secondary"><MapPin size={18} /></div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-text-muted">Registered Address</p>
                 <p className="text-[15px] font-bold text-text-primary">{customer.address || 'N/A'}</p>
              </div>
           </div>
        </div>
     </Card>

     <Card className="p-8 border-none ring-1 ring-border/50 space-y-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted">Identity & Notes</h3>
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-surface-2 rounded-xl text-text-secondary"><FileText size={18} /></div>
              <div>
                 <p className="text-[10px] uppercase font-bold text-text-muted">NIC / National ID</p>
                 <p className="text-[15px] font-bold text-text-primary">{customer.nic || 'N/A'}</p>
              </div>
           </div>
           <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-text-muted">Internal Notes</p>
              <p className="text-[13px] text-text-secondary leading-relaxed bg-surface-2 p-4 rounded-2xl italic">
                 "{customer.notes || 'No internal notes found for this customer profile.'}"
              </p>
           </div>
        </div>
     </Card>
  </div>
);

const VehiclesTab = ({ vehicles, onAdd, onRemove }) => (
  <div className="space-y-6">
     <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-text-primary">Registered Vehicles ({vehicles.length})</h3>
        <Button size="sm" icon={Plus} onClick={onAdd}>Add Vehicle</Button>
     </div>
     
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
           <Card key={v.id} className="p-6 border-none ring-1 ring-border/50 hover:ring-primary/30 transition-all group">
              <div className="flex items-start justify-between">
                 <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-4">
                    <Car size={24} />
                 </div>
                 <button onClick={() => onRemove(v.id)} className="p-2 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 rounded-lg">
                    <Trash2 size={16} />
                 </button>
              </div>
              <h4 className="text-lg font-black text-text-primary tracking-tight">{v.make} {v.model}</h4>
              <p className="text-sm text-text-muted mb-4">{v.year}</p>
              <div className="inline-block px-3 py-1 bg-surface-3 rounded-lg border border-border/50 text-xs font-black uppercase tracking-widest text-text-primary">
                 {v.plateNumber}
              </div>
           </Card>
        ))}
        {vehicles.length === 0 && (
           <div className="sm:col-span-3 py-20 text-center border-2 border-dashed border-border/50 rounded-3xl space-y-4">
              <Car className="mx-auto text-text-muted opacity-20" size={64} />
              <p className="text-text-secondary text-sm">No vehicles registered for this customer yet.</p>
              <Button variant="outline" size="sm" onClick={onAdd}>Register First Vehicle</Button>
           </div>
        )}
     </div>
  </div>
);

const CreditTab = ({ history, customer }) => {
  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (val) => <span className="text-[12px] text-text-secondary">{val?.toDate().toLocaleDateString()}</span>
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (type) => (
        <Badge variant={type === 'payment' ? 'success' : 'error'}>
          {type === 'payment' ? 'Payment' : 'Credit Sale'}
        </Badge>
      )
    },
    {
      header: 'Method/Ref',
      accessor: 'method',
      render: (val, row) => <span className="text-[12px] font-bold text-text-primary">{val} {row.reference ? `(${row.reference})` : ''}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (val) => <span className="font-black text-text-primary">Rs. {val?.toLocaleString()}</span>
    }
  ];

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border-none ring-1 ring-border/50 space-y-6 bg-error/5">
             <div className="flex items-center gap-3 text-error">
                <AlertCircle size={24} />
                <h3 className="text-sm font-black uppercase tracking-widest">Credit Status</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Outstanding</p>
                   <p className="text-2xl font-black text-text-primary">Rs. {(customer.creditBalance || 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Limit Available</p>
                   <p className="text-xl font-black text-text-secondary">Rs. {((customer.creditLimit || 0) - (customer.creditBalance || 0)).toLocaleString()}</p>
                </div>
             </div>
             <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-500", (customer.creditBalance / customer.creditLimit) > 0.8 ? 'bg-error' : 'bg-primary')} 
                  style={{ width: `${Math.min((customer.creditBalance / customer.creditLimit) * 100, 100)}%` }} 
                />
             </div>
          </Card>

          <Card className="p-8 border-none ring-1 ring-border/50 space-y-6 flex flex-col justify-center">
             <Button variant="outline" className="w-full h-12" icon={FileText}>Generate Statement (PDF)</Button>
             <Button variant="ghost" className="w-full h-12" icon={Mail}>Send Payment Reminder</Button>
          </Card>
       </div>

       <Card className="border-none ring-1 ring-border/50">
          <div className="p-6 border-b border-border">
             <h3 className="text-sm font-bold text-text-primary">Credit & Payment Ledger</h3>
          </div>
          <Table columns={columns} data={history} emptyMessage="No credit transactions found." />
       </Card>
    </div>
  );
};

const HistoryTab = ({ id }) => (
  <Card className="p-20 text-center border-none ring-1 ring-border/50 space-y-4">
     <ShoppingBag className="mx-auto text-text-muted opacity-20" size={64} />
     <p className="text-text-secondary text-sm font-bold">Purchase history integration from POS module coming soon.</p>
  </Card>
);

// --- Modals ---

const VehicleModal = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({ make: '', model: '', year: new Date().getFullYear(), plateNumber: '' });
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Vehicle">
       <div className="space-y-6 p-2">
          <Select 
            label="Make" 
            options={VEHICLE_MAKES.map(m => ({ label: m, value: m }))}
            value={data.make}
            onChange={(opt) => setData(prev => ({ ...prev, make: opt.value }))}
          />
          <Input 
            label="Model" 
            placeholder="e.g. Corolla" 
            value={data.model} 
            onChange={(e) => setData(prev => ({ ...prev, model: e.target.value }))} 
          />
          <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Year" 
               type="number"
               value={data.year} 
               onChange={(e) => setData(prev => ({ ...prev, year: Number(e.target.value) }))} 
             />
             <Input 
               label="Plate Number" 
               placeholder="ABC-1234" 
               value={data.plateNumber} 
               onChange={(e) => setData(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))} 
             />
          </div>
          <div className="flex gap-3 pt-4">
             <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
             <Button className="flex-1" onClick={() => onSave(data)} disabled={!data.make || !data.model || !data.plateNumber}>Save Vehicle</Button>
          </div>
       </div>
    </Modal>
  );
};

const PaymentModal = ({ isOpen, onClose, onSave, customer }) => {
  const [data, setData] = useState({ amount: 0, method: 'Cash', reference: '' });
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Credit Payment">
       <div className="space-y-6 p-2">
          <div className="p-4 rounded-xl bg-surface-2 border border-border">
             <p className="text-xs text-text-muted">Currently Outstanding</p>
             <p className="text-2xl font-black text-error">Rs. {(customer.creditBalance || 0).toLocaleString()}</p>
          </div>
          <Input 
            label="Payment Amount" 
            type="number" 
            icon={DollarSign}
            value={data.amount} 
            onChange={(e) => setData(prev => ({ ...prev, amount: Number(e.target.value) }))} 
          />
          <Select 
            label="Payment Method" 
            options={PAYMENT_METHODS.map(m => ({ label: m, value: m }))}
            value={data.method}
            onChange={(opt) => setData(prev => ({ ...prev, method: opt.value }))}
          />
          <Input 
            label="Reference (Optional)" 
            placeholder="e.g. Bank slip #, Check #" 
            value={data.reference} 
            onChange={(e) => setData(prev => ({ ...prev, reference: e.target.value }))} 
          />
          <div className="flex gap-3 pt-4">
             <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
             <Button className="flex-1" onClick={() => onSave(data)} disabled={data.amount <= 0}>Record Payment</Button>
          </div>
       </div>
    </Modal>
  );
};

export default CustomerDetail;
