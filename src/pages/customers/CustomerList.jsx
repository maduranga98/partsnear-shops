import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MoreVertical, 
  Edit2, 
  Eye, 
  UserPlus,
  CreditCard,
  DollarSign,
  Filter,
  Users
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../hooks/useAuth';
import { TIERS, hasTierAccess } from '../../config/tiers';
import { getShopCustomers } from '../../services/customers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { CUSTOMER_TAGS } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FeatureLock from '../../components/ui/FeatureLock';

const CustomerList = () => {
  const { shop } = useShop();
  const { userTier } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [creditFilter, setCreditFilter] = useState('all');

  if (!hasTierAccess(userTier, TIERS.PRO)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FeatureLock 
          title="Customer Relationship Management"
          description="Build long-term loyalty and track customer lifetime value with our advanced CRM tools."
          features={[
             "Detailed customer buying profiles",
             "Automatic vehicle registration per client",
             "Credit balance & limit management",
             "Automated payment reminders",
             "Customer-specific discounts & tags"
          ]}
          requiredTier="Pro"
        />
      </div>
    );
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const data = await getShopCustomers(shop.id);
        setCustomers(data);
      } catch (error) {
        notify.error('Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [shop?.id]);

  const filteredCustomers = customers.filter(c => {
    const searchMatch = (c.name?.toLowerCase().includes(search.toLowerCase()) || 
                       c.phone?.includes(search));
    
    if (!searchMatch) return false;
    
    if (tagFilter !== 'all' && !c.tags?.includes(tagFilter)) return false;
    
    if (creditFilter === 'outstanding' && (c.creditBalance || 0) <= 0) return false;
    if (creditFilter === 'over_limit' && (c.creditBalance || 0) > (c.creditLimit || 0)) return false;
    
    return true;
  });

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary uppercase">
            {name?.[0]}
          </div>
          <div>
            <div className="font-bold text-text-primary text-[14px]">{name}</div>
            <div className="text-[11px] text-text-muted">{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Tags',
      accessor: 'tags',
      render: (tags) => (
        <div className="flex flex-wrap gap-1">
          {tags?.map((t, i) => (
            <Badge key={i} variant="gray" size="sm" className="bg-surface-3">
               {t}
            </Badge>
          ))}
        </div>
      )
    },
    {
      header: 'Credit Balance',
      accessor: 'creditBalance',
      render: (balance, row) => (
        <div className="space-y-0.5">
          <div className={cn(
            "font-black text-[13px]",
            (balance || 0) > 0 ? "text-error" : "text-success"
          )}>
            Rs. {(balance || 0).toLocaleString()}
          </div>
          {row.creditLimit > 0 && (
            <div className="text-[10px] text-text-muted italic">
              Limit: Rs. {row.creditLimit.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Total Spent',
      accessor: 'totalSpent',
      render: (spent) => (
        <div className="font-bold text-text-primary">
          Rs. {(spent || 0).toLocaleString()}
        </div>
      )
    },
    {
      header: 'Last Visit',
      accessor: 'lastVisit',
      render: (date) => (
        <div className="text-[12px] text-text-secondary">
          {date ? date.toDate().toLocaleDateString() : 'New'}
        </div>
      )
    },
    {
      header: '',
      accessor: 'id',
      render: (id) => (
        <div className="flex justify-end gap-1">
           <button 
             onClick={() => navigate(`/customers/${id}`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
           >
             <Eye size={16} />
           </button>
           <button 
             onClick={() => navigate(`/customers/${id}/edit`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
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
        title="Customer Database"
        subtitle="Manage your customer relationships, vehicles, and credit accounts."
        actions={
          <Button icon={UserPlus} onClick={() => navigate('/customers/add')}>
            Add New Customer
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="p-4 border-none ring-1 ring-border/50 bg-primary/5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Customers</p>
               <h3 className="text-xl font-black text-text-primary">{customers.length}</h3>
            </div>
         </Card>
         <Card className="p-4 border-none ring-1 ring-border/50 bg-error/5 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-error/10 text-error">
               <CreditCard size={24} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Credit</p>
               <h3 className="text-xl font-black text-text-primary">
                 Rs. {customers.reduce((acc, c) => acc + (c.creditBalance || 0), 0).toLocaleString()}
               </h3>
            </div>
         </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-none ring-1 ring-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="lg:col-span-1">
              <Input 
                 placeholder="Search by name or phone..." 
                 icon={Search} 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
           <Select 
              placeholder="Filter by Tag"
              options={[{ label: 'All Tags', value: 'all' }, ...CUSTOMER_TAGS.map(t => ({ label: t, value: t }))]}
              value={tagFilter}
              onChange={(opt) => setTagFilter(opt.value)}
           />
           <Select 
              placeholder="Credit Status"
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Outstanding Balance', value: 'outstanding' },
                { label: 'Over Credit Limit', value: 'over_limit' },
              ]}
              value={creditFilter}
              onChange={(opt) => setCreditFilter(opt.value)}
           />
        </div>
      </Card>

      <Card className="border-none ring-1 ring-border/50">
        <Table 
          columns={columns}
          data={filteredCustomers}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage="No customers found matching your filters."
        />
      </Card>
    </div>
  );
};

export default CustomerList;

// Helper function for conditional class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
