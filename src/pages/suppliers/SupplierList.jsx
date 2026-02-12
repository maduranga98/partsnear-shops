import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Star, 
  MoreVertical, 
  Edit2, 
  Eye, 
  Package,
  ExternalLink,
  Users
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopSuppliers } from '../../services/suppliers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const SupplierList = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const data = await getShopSuppliers(shop.id);
        setSuppliers(data);
      } catch (error) {
        notify.error('Failed to fetch suppliers');
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, [shop?.id]);

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Supplier Name',
      accessor: 'name',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary uppercase">
            {name?.[0]}
          </div>
          <div>
            <div className="font-bold text-text-primary text-[14px]">{name}</div>
            <div className="text-[11px] text-text-muted">{row.contactPerson || 'General Contact'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      render: (phone, row) => (
        <div className="space-y-1 text-[12px] text-text-secondary">
          <div className="flex items-center gap-2"><Phone size={12} className="text-text-muted" /> {phone}</div>
          <div className="flex items-center gap-2"><Mail size={12} className="text-text-muted" /> {row.email}</div>
        </div>
      )
    },
    {
      header: 'Categories',
      accessor: 'categories',
      render: (cats) => (
        <div className="flex flex-wrap gap-1">
          {cats?.slice(0, 3).map((c, i) => (
            <Badge key={i} variant="gray" size="sm" className="bg-surface-3">
               {c}
            </Badge>
          ))}
          {cats?.length > 3 && <span className="text-[10px] text-text-muted mt-1">+{cats.length - 3} more</span>}
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (rating) => (
        <div className="flex items-center gap-1">
          <Star size={14} className={cn(rating ? "text-warning fill-warning" : "text-text-muted")} />
          <span className="font-bold text-[13px]">{rating || '—'}</span>
        </div>
      )
    },
    {
      header: '',
      accessor: 'id',
      render: (id) => (
        <div className="flex justify-end gap-1">
           <button 
             onClick={() => navigate(`/suppliers/${id}`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
             title="View Details"
           >
             <Eye size={16} />
           </button>
           <button 
             onClick={() => navigate(`/suppliers/${id}/edit`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
             title="Edit"
           >
             <Edit2 size={16} />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Supplier Management"
        subtitle="Manage your relationships with parts suppliers and wholesalers."
        actions={
          <Button icon={Plus} onClick={() => navigate('/suppliers/add')}>
            Add Supplier
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="p-4 border-none ring-1 ring-border/50 bg-primary/5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Suppliers</p>
               <h3 className="text-xl font-black text-text-primary">{suppliers.length}</h3>
            </div>
         </Card>
         <Card className="p-4 border-none ring-1 ring-border/50 bg-success/5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-success/10 text-success">
               <Package size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active POs</p>
               <h3 className="text-xl font-black text-text-primary">0</h3>
            </div>
         </Card>
      </div>

      <Card className="border-none ring-1 ring-border/50">
        <div className="p-6 border-b border-border">
           <div className="w-full sm:w-64">
              <Input 
                placeholder="Search by name..." 
                icon={Search} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <Table 
          columns={columns}
          data={filteredSuppliers}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage="No suppliers found. Add your first supplier to get started!"
        />
      </Card>
    </div>
  );
};

export default SupplierList;
