import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  ArrowRight,
  Filter,
  RefreshCw,
  Plus,
  History,
  Settings,
  DollarSign
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopParts } from '../../services/parts';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { cn } from '../../utils/helpers';

const InventoryDashboard = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalCostValue: 0,
    totalSellingValue: 0,
    lowStockList: [],
    outOfStockList: [],
    overstockedList: []
  });
  const [filter, setFilter] = useState('all');

  const fetchInventoryData = async () => {
    if (!shop?.id) return;
    setLoading(true);
    try {
      const parts = await getShopParts(shop.id);
      
      const lowStockThreshold = 5; // Default threshold
      
      const lowStock = parts.filter(p => p.quantity > 0 && p.quantity <= (p.lowStockThreshold || lowStockThreshold));
      const outOfStock = parts.filter(p => p.quantity <= 0);
      const inStock = parts.filter(p => p.quantity > (p.lowStockThreshold || lowStockThreshold));
      
      const totalCostValue = parts.reduce((acc, p) => acc + (Number(p.costPrice || 0) * (p.quantity || 0)), 0);
      const totalSellingValue = parts.reduce((acc, p) => acc + (Number(p.sellingPrice || 0) * (p.quantity || 0)), 0);

      setStats({
        totalItems: parts.length,
        inStock: inStock.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        totalCostValue,
        totalSellingValue,
        lowStockList: lowStock,
        outOfStockList: outOfStock,
        overstockedList: parts.filter(p => p.quantity > 50) // Arbitrary overstock logic for now
      });
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [shop?.id]);

  const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
    <Card className="p-6 border-none ring-1 ring-border/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-text-primary">{value}</h3>
          {subValue && <p className="text-[11px] text-text-secondary mt-1">{subValue}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-${color}/10 text-${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );

  const StockHealthBar = () => {
    const total = stats.totalItems || 1;
    const inStockPct = (stats.inStock / total) * 100;
    const lowStockPct = (stats.lowStock / total) * 100;
    const outOfStockPct = (stats.outOfStock / total) * 100;

    return (
      <Card className="p-6 border-none ring-1 ring-border/50">
        <h3 className="text-sm font-bold text-text-primary mb-6">Stock Health</h3>
        <div className="space-y-6">
          <div className="h-4 w-full bg-surface-2 rounded-full overflow-hidden flex">
            <div className="h-full bg-success transition-all duration-500" style={{ width: `${inStockPct}%` }} />
            <div className="h-full bg-warning transition-all duration-500" style={{ width: `${lowStockPct}%` }} />
            <div className="h-full bg-error transition-all duration-500" style={{ width: `${outOfStockPct}%` }} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-[11px] font-bold text-text-secondary">Healthy</span>
              </div>
              <p className="text-lg font-black text-text-primary">{Math.round(inStockPct)}%</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-[11px] font-bold text-text-secondary">Low Stock</span>
              </div>
              <p className="text-lg font-black text-text-primary">{Math.round(lowStockPct)}%</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-error" />
                <span className="text-[11px] font-bold text-text-secondary">Out of Stock</span>
              </div>
              <p className="text-lg font-black text-text-primary">{Math.round(outOfStockPct)}%</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const AlertItem = ({ part, type }) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-border/50">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white uppercase",
          type === 'out' ? "bg-error" : "bg-warning"
        )}>
          {part.name?.[0]}
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-text-primary">{part.name}</h4>
          <p className="text-[11px] text-text-secondary">PN: {part.partNumber || 'N/A'}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={type === 'out' ? 'error' : 'warning'} size="sm">
          {part.quantity} left
        </Badge>
        <button 
          onClick={() => navigate(ROUTES.INVENTORY_ADD, { state: { partId: part.id } })}
          className="text-[11px] font-bold text-primary mt-1 flex items-center justify-end gap-1 hover:underline"
        >
          Restock <Plus size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Stock Overview"
        subtitle="Monitor and manage your shop's inventory levels efficiently."
        actions={
          <div className="flex gap-3">
            <Button variant="outline" icon={History} onClick={() => navigate('/inventory/history')}>History</Button>
            <Button icon={Plus} onClick={() => navigate('/inventory/adjust')}>Adjust Stock</Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Items" value={stats.totalItems} icon={Package} color="primary" />
        <StatCard title="In Stock" value={stats.inStock} icon={CheckCircle2} color="success" />
        <StatCard title="Low Stock" value={stats.lowStock} icon={AlertTriangle} color="warning" />
        <StatCard title="Out of Stock" value={stats.outOfStock} icon={AlertCircle} color="error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Parts', icon: Package },
              { id: 'low', label: 'Low Stock', icon: AlertTriangle },
              { id: 'out', label: 'Out of Stock', icon: AlertCircle },
              { id: 'over', label: 'Overstocked', icon: TrendingDown },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all",
                  filter === f.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/25" 
                    : "bg-surface text-text-secondary hover:bg-surface-2 shadow-sm"
                )}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            ))}
          </div>

          {/* List Based on Filter */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-text-primary">
                {filter === 'all' && 'Inventory List'}
                {filter === 'low' && 'Low Stock Alerts'}
                {filter === 'out' && 'Out of Stock Items'}
                {filter === 'over' && 'Overstocked items'}
              </h3>
              <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchInventoryData}>Refresh</Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
              ) : (
                <>
                  {filter === 'low' && stats.lowStockList.map(p => <AlertItem key={p.id} part={p} type="low" />)}
                  {filter === 'out' && stats.outOfStockList.map(p => <AlertItem key={p.id} part={p} type="out" />)}
                  {filter === 'over' && stats.overstockedList.map(p => <AlertItem key={p.id} part={p} type="over" />)}
                  {filter === 'all' && stats.totalItems > 0 && (
                    <div className="text-center py-12">
                      <p className="text-text-secondary text-sm">Please select a filter to view specific stock alerts.</p>
                      <Button variant="ghost" className="mt-4" onClick={() => navigate(ROUTES.PARTS)}>View Full Catalog</Button>
                    </div>
                  )}
                  {((filter === 'low' && stats.lowStock === 0) || 
                    (filter === 'out' && stats.outOfStock === 0)) && (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 size={24} />
                      </div>
                      <p className="text-sm text-text-muted font-medium">All stock levels are healthy!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Stock Health Bar */}
          <StockHealthBar />

          {/* Stock Value Card */}
          <Card className="p-6 border-none ring-1 ring-border/50 bg-navy text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-sm font-bold opacity-80 mb-4 flex items-center gap-2">
                <DollarSign size={16} /> Stock Value
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">Total at Cost</p>
                  <h4 className="text-2xl font-black">LKR {stats.totalCostValue.toLocaleString()}</h4>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">Total at Selling</p>
                  <h4 className="text-2xl font-black">LKR {stats.totalSellingValue.toLocaleString()}</h4>
                </div>
                
                <div className="pt-4 border-t border-white/10 text-[11px] opacity-70 italic">
                  * Based on current quantities and prices in catalog.
                </div>
              </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
          </Card>

          {/* Quick Config */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Settings size={16} /> Configuration
            </h3>
            <p className="text-[12px] text-text-secondary mb-4">
              Manage how your shop handles stock alerts and thresholds.
            </p>
            <Button variant="outline" className="w-full justify-start" icon={Settings}>Alert Configuration</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
