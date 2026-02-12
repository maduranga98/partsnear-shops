import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Search, 
  DollarSign, 
  AlertTriangle, 
  ArrowRight, 
  Printer, 
  Mail, 
  Filter,
  ChevronRight,
  User,
  LayoutDashboard
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getOutstandingBalances } from '../../services/customers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { cn } from '../../utils/helpers';

const CreditManagement = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchBalances = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const data = await getOutstandingBalances(shop.id);
        setCustomers(data);
      } catch (error) {
        notify.error('Failed to fetch outstanding balances');
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [shop?.id]);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  const stats = {
    totalOutstanding: customers.reduce((acc, c) => acc + (c.creditBalance || 0), 0),
    count: customers.length,
    critical: customers.filter(c => (c.creditBalance || 0) > (c.creditLimit || 0)).length
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center font-bold text-text-secondary uppercase text-[12px]">
            {name?.[0]}
          </div>
          <div>
            <div className="font-bold text-text-primary text-[13px]">{name}</div>
            <div className="text-[10px] text-text-muted">{row.phone}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Credit Limit',
      accessor: 'creditLimit',
      render: (limit) => <span className="text-[12px] text-text-secondary">Rs. {limit?.toLocaleString()}</span>
    },
    {
      header: 'Outstanding Balance',
      accessor: 'creditBalance',
      render: (balance, row) => (
        <div className="flex flex-col">
          <span className={cn(
            "font-black text-[14px]",
            balance > row.creditLimit ? "text-error" : "text-text-primary"
          )}>
            Rs. {balance?.toLocaleString()}
          </span>
          <div className="w-24 h-1 bg-surface-2 rounded-full mt-1 overflow-hidden">
             <div 
               className={cn("h-full", balance > row.creditLimit ? "bg-error" : "bg-primary")} 
               style={{ width: `${Math.min((balance / (row.creditLimit || 1)) * 100, 100)}%` }} 
             />
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'id',
      render: (_, row) => (
        row.creditBalance > row.creditLimit ? 
        <Badge variant="error" size="sm">Over Limit</Badge> : 
        <Badge variant="warning" size="sm">Active Credit</Badge>
      )
    },
    {
      header: '',
      accessor: 'id',
      render: (id) => (
        <div className="flex justify-end gap-2">
           <button 
             onClick={() => navigate(`/customers/${id}`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
           >
             View Ledger <ChevronRight size={14} />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Credit Account Management"
        subtitle="Monitor outstanding balances, credit limits, and collections."
        actions={
          <div className="flex gap-2">
             <Button variant="outline" icon={Printer}>Export Report</Button>
             <Button onClick={() => navigate('/customers')} icon={User}>Go to CRM</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6 border-none ring-1 ring-border/50 bg-error/5 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-error/10 text-error">
               <DollarSign size={28} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Outstanding</p>
               <h3 className="text-2xl font-black text-text-primary">Rs. {stats.totalOutstanding.toLocaleString()}</h3>
            </div>
         </Card>
         <Card className="p-6 border-none ring-1 ring-border/50 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-warning/10 text-warning">
               <AlertTriangle size={28} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Critical (Over Limit)</p>
               <h3 className="text-2xl font-black text-text-primary">{stats.critical} Customers</h3>
            </div>
         </Card>
         <Card className="p-6 border-none ring-1 ring-border/50 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-surface-2 text-text-secondary">
               <CreditCard size={28} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Accounts</p>
               <h3 className="text-2xl font-black text-text-primary">{stats.count}</h3>
            </div>
         </Card>
      </div>

      <Card className="border-none ring-1 ring-border/50">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
           <h3 className="text-sm font-bold text-text-primary">Outstanding Balance Report</h3>
           <div className="w-full sm:w-64">
              <Input 
                 placeholder="Search customer..." 
                 icon={Search} 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <Table 
          columns={columns}
          data={filteredCustomers}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage="No outstanding credit balances found. Great job on collections!"
        />
      </Card>
    </div>
  );
};

export default CreditManagement;
