import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Database,
  Calendar,
  User,
  Package
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useShop } from '../../context/ShopContext';
import { getStockMovements } from '../../services/inventory';
import { getShopParts } from '../../services/parts';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { ADJUSTMENT_REASONS } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/helpers';

const MovementHistory = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [parts, setParts] = useState({}); // Mapping of partId to part name/PN
  const [filters, setFilters] = useState({
    type: 'all',
    reason: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const [movementsData, partsData] = await Promise.all([
          getStockMovements(shop.id),
          getShopParts(shop.id)
        ]);

        // Create parts mapping for quick lookup
        const partsMap = {};
        partsData.forEach(p => {
          partsMap[p.id] = { name: p.name, partNumber: p.partNumber };
        });
        setParts(partsMap);
        setMovements(movementsData);
      } catch (error) {
        notify.error('Failed to fetch movement history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shop?.id]);

  const filteredMovements = movements.filter(m => {
    if (filters.type !== 'all' && m.type !== filters.type) return false;
    if (filters.reason !== 'all' && m.reason !== filters.reason) return false;
    
    if (filters.search) {
      const part = parts[m.partId];
      const searchStr = filters.search.toLowerCase();
      const matchName = part?.name?.toLowerCase().includes(searchStr);
      const matchPN = part?.partNumber?.toLowerCase().includes(searchStr);
      if (!matchName && !matchPN) return false;
    }
    
    if (filters.startDate && new Date(m.createdAt?.toDate()) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(m.createdAt?.toDate()) > new Date(filters.endDate)) return false;
    
    return true;
  });

  const handleExport = () => {
    const exportData = filteredMovements.map(m => ({
      Date: m.createdAt?.toDate()?.toLocaleDateString(),
      Time: m.createdAt?.toDate()?.toLocaleTimeString(),
      Part: parts[m.partId]?.name || 'Unknown',
      PartNumber: parts[m.partId]?.partNumber || 'N/A',
      Type: m.type?.toUpperCase(),
      Quantity: m.quantity,
      Previous: m.previousQuantity,
      New: m.newQuantity,
      Reason: m.reason,
      Note: m.note || '',
      Staff: m.staffId || 'System'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockMovements");
    XLSX.writeFile(wb, `Stock_Movements_${shop.shopName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      render: (val) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-primary text-[13px]">{val?.toDate()?.toLocaleDateString()}</span>
          <span className="text-[11px] text-text-muted">{val?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      header: 'Part Details',
      accessor: 'partId',
      render: (id) => (
        <div className="space-y-0.5">
          <div className="font-bold text-text-primary text-[13px] line-clamp-1">{parts[id]?.name || 'Deleted Part'}</div>
          <div className="text-[11px] text-text-muted">PN: {parts[id]?.partNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (type) => (
        <div className="flex items-center gap-2">
          {type === 'in' ? (
            <div className="p-1.5 rounded-lg bg-success/10 text-success">
              <ArrowDownLeft size={14} />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-error/10 text-error">
              <ArrowUpRight size={14} />
            </div>
          )}
          <span className={cn("text-[11px] font-bold uppercase tracking-wider", type === 'in' ? "text-success" : "text-error")}>
            {type === 'in' ? 'Stock In' : 'Stock Out'}
          </span>
        </div>
      )
    },
    {
      header: 'Quantity Change',
      accessor: 'quantity',
      render: (qty, row) => (
        <div className="space-y-0.5">
          <div className="font-black text-text-primary">
            {row.type === 'in' ? '+' : '-'}{qty} units
          </div>
          <div className="text-[11px] text-text-muted">
            {row.previousQuantity} <span className="text-[10px] opacity-50 px-1">→</span> {row.newQuantity}
          </div>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (reason, row) => (
        <div className="space-y-0.5">
          <Badge variant="gray" size="sm" className="bg-surface-3 capitalize">
            {reason.replace('-', ' ')}
          </Badge>
          {row.note && <div className="text-[10px] text-text-muted max-w-[150px] truncate" title={row.note}>{row.note}</div>}
        </div>
      )
    },
    {
      header: 'Staff',
      accessor: 'staffId',
      render: (staffId) => (
        <div className="flex items-center gap-2 text-text-secondary text-[12px] font-medium">
          <User size={12} className="text-text-muted" />
          <span className="truncate max-w-[100px]">{staffId?.slice(-6) || 'System'}</span>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Movement History"
        subtitle="Full audit trail of every stock adjustment, sale, and receipt."
        actions={
          <div className="flex gap-3">
             <Button variant="outline" icon={Download} onClick={handleExport}>Export to Excel</Button>
             <Button variant="ghost" icon={RefreshCw} onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        }
      />

      {/* Advanced Filters */}
      <Card className="p-6 border-none ring-1 ring-border/50 bg-surface/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
             <Input 
                placeholder="Search part or PN..." 
                icon={Search} 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
             />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'in', label: 'Stock In Only' },
              { value: 'out', label: 'Stock Out Only' },
            ]}
            value={filters.type}
            onChange={(opt) => setFilters(prev => ({ ...prev, type: opt.value }))}
          />
          <Select 
            options={[{ value: 'all', label: 'All Reasons' }, ...ADJUSTMENT_REASONS]}
            value={filters.reason}
            onChange={(opt) => setFilters(prev => ({ ...prev, reason: opt.value }))}
          />
          <Input 
            type="date" 
            label="From" 
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
          />
          <Input 
            type="date" 
            label="To" 
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </Card>

      {/* Movements Table */}
      <Card className="border-none ring-1 ring-border/50">
        <Table 
          columns={columns}
          data={filteredMovements}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage="No stock movements found matching your filters."
          className="[&_table]:min-w-[900px]"
        />
      </Card>

      {/* Mobile Disclaimer */}
      <div className="lg:hidden p-4 rounded-xl bg-primary/5 text-primary text-xs flex items-center gap-3">
         <Info size={16} />
         <p>Detailed view and exports are best experienced on a desktop browser.</p>
      </div>
    </div>
  );
};

export default MovementHistory;
