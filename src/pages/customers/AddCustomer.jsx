import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Tag, 
  Info,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { addCustomer, updateCustomer, getCustomerById } from '../../services/customers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { CUSTOMER_TAGS } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const AddCustomer = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nic: '',
    creditLimit: 0,
    tags: [],
    notes: ''
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (isEdit) {
        try {
          const data = await getCustomerById(id);
          if (data) setFormData(data);
          else notify.error('Customer not found');
        } catch (error) {
          notify.error('Failed to load customer data');
        } finally {
          setFetching(false);
        }
      }
    };
    fetchCustomer();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      return notify.error('Name and Phone are required');
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateCustomer(id, formData);
        notify.success('Customer updated successfully');
      } else {
        await addCustomer(shop.id, formData);
        notify.success('Customer added successfully');
      }
      navigate('/customers');
    } catch (error) {
      notify.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-text-muted">Loading customer details...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={isEdit ? 'Edit Customer' : 'Add New Customer'}
          className="mb-0"
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                  <User size={16} className="text-primary" /> Basic Profile
               </h3>
               
               <div className="space-y-6">
                  <Input 
                     label="Full Name" 
                     placeholder="e.g. Kamal Perera" 
                     required
                     value={formData.name}
                     onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <Input 
                        label="Phone Number" 
                        placeholder="e.g. 077 123 4567" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                     />
                     <Input 
                        label="Email Address (Optional)" 
                        type="email" 
                        placeholder="e.g. kamal@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                     />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <Input 
                        label="NIC / National ID" 
                        placeholder="e.g. 199012345678" 
                        value={formData.nic}
                        onChange={(e) => setFormData(prev => ({ ...prev, nic: e.target.value }))}
                     />
                     <Input 
                        label="Home Address" 
                        placeholder="e.g. No. 45, Flower Rd, Colombo 03"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                     />
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" /> Credit & Accounting
               </h3>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <Input 
                           label="Monthly Credit Limit" 
                           type="number"
                           placeholder="0.00"
                           icon={DollarSign}
                           value={formData.creditLimit}
                           onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: Number(e.target.value) }))}
                        />
                        <p className="text-[10px] text-text-muted">Maximum outstanding balance allowed for this customer.</p>
                     </div>
                     <div className="space-y-1">
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Customer Tags</label>
                        <Select 
                           isMulti
                           placeholder="Select tags..."
                           options={CUSTOMER_TAGS.map(t => ({ label: t, value: t }))}
                           value={formData.tags?.map(t => ({ label: t, value: t }))}
                           onChange={(opts) => setFormData(prev => ({ ...prev, tags: opts.map(o => o.value) }))}
                        />
                     </div>
                  </div>

                  <Input 
                     label="Internal Notes" 
                     placeholder="Special instructions or background info..." 
                     value={formData.notes}
                     onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
               </div>
            </Card>
         </div>

         <div className="space-y-6">
            <Card className="p-6 border-none ring-1 ring-border/50 bg-primary/5 border-primary/10">
               <div className="flex items-center gap-3 text-primary mb-4">
                  <ShieldCheck size={24} />
                  <h4 className="text-[14px] font-black uppercase tracking-tight">Trust & Safety</h4>
               </div>
               <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                  Providing a NIC and verified phone number helps prevent credit defaults and builds trust for long-term loyalty rewards.
               </p>
               <div className="p-3 rounded-xl bg-white/50 border border-border text-[11px] text-text-muted">
                  Credit limits are strictly enforced at the POS.
               </div>
            </Card>

            <div className="pt-4">
               <Button className="w-full h-12 text-lg font-black" loading={loading} type="submit" icon={Save}>
                  {isEdit ? 'Update Profile' : 'Register Customer'}
               </Button>
               <Button variant="ghost" className="w-full mt-2" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
         </div>
      </form>
    </div>
  );
};

export default AddCustomer;
