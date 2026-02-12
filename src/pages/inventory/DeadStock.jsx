import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  Trash2, 
  TrendingDown, 
  DollarSign, 
  AlertCircle, 
  Calendar,
  ChevronRight,
  RefreshCw,
  MinusCircle,
  Tag,
  Archive
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopParts } from '../../services/parts';
import { getDeadStock } from '../../services/inventory';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/helpers';

const DeadStock = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [deadParts, setDeadParts] = useState([]);
  const [days, setDays] = useState(60);
  const [totalValue, setTotalValue] = useState(0);

  const fetchDeadStock = async () => {
    if (!shop?.id) return;
    setLoading(true);
    try {
      // In a real app, this would be a specialized API call.
      // For now, we use our service function which filters parts.
      const data = await getDeadStock(shop.id, Number(days));
      
      const value = data.reduce((acc, p) => acc + (Number(p.costPrice || 0) * (p.quantity || 0)), 0);
      setTotalValue(value);
      setDeadParts(data);
    } catch (error) {
      notify.error('Failed to fetch dead stock report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadStock();
  }, [shop?.id, days]);

  const columns = [
    {
      header: 'Part Details',
      accessor: 'name',
      render: (name, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-text-primary text-[13px]">{name}</div>
          <div className="text-[11px] text-text-muted">PN: {row.partNumber || 'N/A'} • {row.brand}</div>
        </div>
      )
    },
    {
      header: 'Available Stock',
      accessor: 'quantity',
      render: (qty) => <span className="font-bold text-text-primary">{qty} units</span>
    },
    {
      header: 'Tied Up Value',
      accessor: 'costPrice',
      render: (price, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-text-primary">Rs. {(Number(price || 0) * (row.quantity || 0)).toLocaleString()}</div>
          <div className="text-[10px] text-text-muted">at unit cost Rs. {Number(price || 0).toLocaleString()}</div>
        </div>
      )
    },
    {
      header: 'Last Sale / Movement',
      accessor: 'lastSoldAt',
      render: (val) => (
        <div className="flex items-center gap-2 text-text-secondary text-[12px]">
          <Calendar size={12} className="text-text-muted" />
          {val ? val.toDate().toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      header: 'Suggested Action',
      accessor: 'id',
      render: () => (
        <div className="flex gap-2">
           <Badge variant="warning" size="sm" className="cursor-pointer hover:bg-warning/20">Discount</Badge>
           <Badge variant="gray" size="sm" className="cursor-pointer hover:bg-gray/20">Return</Badge>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dead Stock Report"
        subtitle="Identify inventory that hasn't moved recently and optimize your cash flow."
        actions={
          <div className="flex gap-3">
             <Button variant="ghost" icon={RefreshCw} onClick={fetchDeadStock}>Refresh</Button>
          </div>
        }
      />

      {/* Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-none ring-1 ring-border/50 bg-error/5 relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-1">Tied Up Capital</p>
              <h3 className="text-3xl font-black text-text-primary">Rs. {totalValue.toLocaleString()}</h3>
              <p className="text-xs text-text-secondary mt-2">Locked in {deadParts.length} slow-moving parts.</p>
           </div>
           <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-error/5 rotate-12" />
        </Card>

        <Card className="p-6 border-none ring-1 ring-border/50 lg:col-span-2">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1">
                 <h4 className="text-sm font-bold text-text-primary">Configure Threshold</h4>
                 <p className="text-xs text-text-secondary">Show parts with no sales activity in the last:</p>
              </div>
              <div className="flex gap-2">
                 {[30, 60, 90, 180].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[12px] font-bold transition-all",
                        days === d 
                          ? "bg-primary text-white shadow-lg shadow-primary/25" 
                          : "bg-surface text-text-secondary hover:bg-surface-2"
                      )}
                    >
                      {d} Days
                    </button>
                 ))}
              </div>
           </div>
        </Card>
      </div>

      {/* Dead Stock Table */}
      <Card className="border-none ring-1 ring-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between">
           <h3 className="text-sm font-bold text-text-primary">Inventory with no activity in {days}+ days</h3>
           <div className="flex items-center gap-2 text-text-muted text-[11px] font-medium">
              <AlertCircle size={14} className="text-warning" />
              Showing {deadParts.length} items
           </div>
        </div>
        <Table 
          columns={columns}
          data={deadParts}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage={`Hurray! No dead stock found for the last ${days} days.`}
        />
      </Card>

      {/* Suggested Actions Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { 
             title: 'Clearance Discount', 
             icon: Tag, 
             color: 'primary',
             text: 'Create a "Clearance" section on your profile and offer 20-40% off to move stock fast.' 
           },
           { 
             title: 'Return to Supplier', 
             icon: Archive, 
             color: 'warning',
             text: 'Check if your parts supplier offers a buy-back or credit exchange for unsold items.' 
           },
           { 
             title: 'Bundle & Save', 
             icon: Plus, 
             color: 'success',
             text: 'Bundle dead stock with high-margin items to increase the value and reduce inventory.' 
           }
         ].map((action, i) => (
           <Card key={i} className="p-6 border-none ring-1 ring-border/50 hover:bg-surface transition-colors cursor-pointer group">
              <div className={`w-12 h-12 rounded-2xl bg-${action.color}/10 text-${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                 <action.icon size={24} />
              </div>
              <h4 className="text-[14px] font-black text-text-primary mb-2">{action.title}</h4>
              <p className="text-[12px] text-text-secondary leading-relaxed">{action.text}</p>
           </Card>
         ))}
      </div>
    </div>
  );
};

export default DeadStock;
