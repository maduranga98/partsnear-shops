import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  History
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { addSupplier, updateSupplier, getShopSuppliers } from '../../services/suppliers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { PART_CATEGORIES } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/helpers';

const AddSupplier = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    categories: [],
    paymentTerms: 'cash', // cash, credit, advance
    creditDays: 30,
    rating: 3,
    notes: ''
  });

  useEffect(() => {
    const fetchSupplier = async () => {
      if (isEdit && shop?.id) {
        setLoading(true);
        try {
          const suppliers = await getShopSuppliers(shop.id);
          const supplier = suppliers.find(s => s.id === id);
          if (supplier) setFormData(supplier);
        } catch (error) {
          notify.error('Failed to fetch supplier data');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSupplier();
  }, [id, shop?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return notify.error('Supplier name is required');
    
    setLoading(true);
    try {
      if (isEdit) {
        await updateSupplier(id, formData);
        notify.success('Supplier updated successfully');
      } else {
        await addSupplier(shop.id, formData);
        notify.success('Supplier added successfully');
      }
      navigate(ROUTES.SUPPLIERS);
    } catch (error) {
      notify.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

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
          title={isEdit ? 'Edit Supplier' : 'Add New Supplier'}
          className="mb-0"
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                  <Briefcase size={16} className="text-primary" /> Basic Information
               </h3>
               
               <div className="space-y-6">
                  <Input 
                     label="Supplier Name" 
                     placeholder="e.g. Lanka Auto Parts Pvt Ltd" 
                     required
                     value={formData.name}
                     onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <Input 
                        label="Contact Person" 
                        placeholder="Name of your contact" 
                        value={formData.contactPerson}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                     />
                     <Input 
                        label="Email Address" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                     />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <Input 
                        label="Phone Number" 
                        placeholder="e.g. 071 234 5678" 
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                     />
                     <Input 
                        label="Full Address" 
                        placeholder="Street, City, Province" 
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                     />
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
                  <History size={16} className="text-primary" /> Terms & Specialization
               </h3>
               
               <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Categories Supplied</label>
                    <Select 
                       isMulti
                       options={PART_CATEGORIES.map(c => ({ label: c, value: c }))}
                       value={formData.categories.map(c => ({ label: c, value: c }))}
                       onChange={(opts) => setFormData(prev => ({ ...prev, categories: opts.map(o => o.value) }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <Select 
                        label="Payment Terms"
                        options={[
                           { label: 'Cash', value: 'cash' },
                           { label: 'Credit', value: 'credit' },
                           { label: 'Advance', value: 'advance' },
                        ]}
                        value={formData.paymentTerms}
                        onChange={(opt) => setFormData(prev => ({ ...prev, paymentTerms: opt.value }))}
                     />
                     {formData.paymentTerms === 'credit' && (
                        <Input 
                           label="Credit Period (Days)" 
                           type="number" 
                           value={formData.creditDays}
                           onChange={(e) => setFormData(prev => ({ ...prev, creditDays: e.target.value }))}
                        />
                     )}
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
            <Card className="p-6 border-none ring-1 ring-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-4">Supplier Rating</h3>
               <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex gap-2 text-warning">
                     {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                           key={s} 
                           size={32} 
                           className={cn("cursor-pointer transition-all", s <= formData.rating ? "fill-warning" : "text-text-muted opacity-30")}
                           onClick={() => setFormData(prev => ({ ...prev, rating: s }))}
                        />
                     ))}
                  </div>
                  <Badge variant="warning">{formData.rating} Stars Rating</Badge>
               </div>
            </Card>

            <div className="pt-4">
               <Button className="w-full h-12 text-lg font-black" loading={loading} type="submit" icon={Save}>
                  {isEdit ? 'Update Supplier' : 'Save Supplier'}
               </Button>
               <Button variant="ghost" className="w-full mt-2" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
         </div>
      </form>
    </div>
  );
};

export default AddSupplier;
