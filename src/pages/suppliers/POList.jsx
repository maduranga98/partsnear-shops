import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  MoreVertical,
  Printer,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getPurchaseOrders, getShopSuppliers } from '../../services/suppliers';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const POList = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const [poData, supplierData] = await Promise.all([
          getPurchaseOrders(shop.id),
          getShopSuppliers(shop.id)
        ]);
        
        const supMap = {};
        supplierData.forEach(s => supMap[s.id] = s.name);
        setSuppliers(supMap);
        setPos(poData);
      } catch (error) {
        notify.error('Failed to fetch purchase orders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shop?.id]);

  const filteredPOs = pos.filter(po => 
    po.poNumber?.toLowerCase().includes(search.toLowerCase()) || 
    suppliers[po.supplierId]?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Draft': return <Badge variant="gray">{status}</Badge>;
      case 'Ordered': return <Badge variant="warning">{status}</Badge>;
      case 'Received': return <Badge variant="success">{status}</Badge>;
      case 'Cancelled': return <Badge variant="error">{status}</Badge>;
      default: return <Badge variant="gray">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'PO Number',
      accessor: 'poNumber',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-primary text-[14px]">{val}</span>
          <span className="text-[10px] text-text-muted">{row.createdAt?.toDate().toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: 'Supplier',
      accessor: 'supplierId',
      render: (id) => <span className="font-bold text-text-primary text-[13px]">{suppliers[id] || 'Loading...'}</span>
    },
    {
      header: 'Order Details',
      accessor: 'items',
      render: (items) => (
        <div className="text-[12px] text-text-secondary">
          {items?.length || 0} items
        </div>
      )
    },
    {
      header: 'Total Value',
      accessor: 'total',
      render: (val) => <span className="font-black text-text-primary">Rs. {val?.toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => getStatusBadge(status)
    },
    {
      header: '',
      accessor: 'id',
      render: (id) => (
        <div className="flex justify-end gap-1">
           <button 
             onClick={() => navigate(`/purchase-orders/${id}`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
           >
             <Eye size={16} />
           </button>
           <button 
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
           >
             <Printer size={16} />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Purchase Orders"
        subtitle="Manage inventory procurement and supplier orders."
        actions={
          <Button icon={Plus} onClick={() => navigate('/purchase-orders/create')}>
            Create New PO
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Pending Orders', value: pos.filter(p => p.status === 'Ordered').length, icon: Truck, color: 'warning' },
           { label: 'Received (MTD)', value: pos.filter(p => p.status === 'Received').length, icon: CheckCircle2, color: 'success' },
           { label: 'Drafts', value: pos.filter(p => p.status === 'Draft').length, icon: FileText, color: 'gray' }
         ].map((stat, i) => (
           <Card key={i} className={`p-4 border-none ring-1 ring-border/50 bg-${stat.color}/5 flex items-center gap-4`}>
              <div className={`p-3 rounded-2xl bg-${stat.color}/10 text-${stat.color}`}>
                 <stat.icon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-xl font-black text-text-primary">{stat.value}</h3>
              </div>
           </Card>
         ))}
      </div>

      <Card className="border-none ring-1 ring-border/50">
        <div className="p-6 border-b border-border">
           <div className="w-full sm:w-64">
              <Input 
                placeholder="Search by PO# or Supplier..." 
                icon={Search} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
        <Table 
          columns={columns}
          data={filteredPOs}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage="No purchase orders found. Create your first order to restock inventory!"
        />
      </Card>
    </div>
  );
};

export default POList;
