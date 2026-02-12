import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  Info,
  Package,
  Search
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopParts } from '../../services/parts';
import { updateStockThreshold, updateGlobalAlertSettings } from '../../services/inventory';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { cn } from '../../utils/helpers';

const AlertsConfig = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [globalSettings, setGlobalSettings] = useState({
    defaultThreshold: 5,
    channels: {
      inApp: true,
      push: false,
      email: true
    }
  });

  useEffect(() => {
    if (shop?.inventoryAlertSettings) {
      setGlobalSettings(shop.inventoryAlertSettings);
    }
    
    const fetchParts = async () => {
      if (!shop?.id) return;
      try {
        const data = await getShopParts(shop.id);
        setParts(data);
      } catch (error) {
        notify.error('Failed to fetch parts');
      }
    };
    fetchParts();
  }, [shop]);

  const handleGlobalSave = async () => {
    setLoading(true);
    try {
      await updateGlobalAlertSettings(shop.id, globalSettings);
      notify.success('Global alert settings updated');
    } catch (error) {
      notify.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePartThresholdChange = async (partId, threshold) => {
    try {
      await updateStockThreshold(partId, Number(threshold));
      setParts(parts.map(p => p.id === partId ? { ...p, lowStockThreshold: threshold } : p));
      notify.success('Threshold updated');
    } catch (error) {
      notify.error('Failed to update threshold');
    }
  };

  const filteredParts = parts.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.partNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const ChannelToggle = ({ id, label, icon: Icon, active, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border/50 hover:bg-surface-2 transition-colors">
       <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            active ? "bg-primary/10 text-primary" : "bg-text-muted/10 text-text-muted"
          )}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{label}</p>
            <p className="text-[10px] text-text-muted">Receive alerts via {label.toLowerCase()}</p>
          </div>
       </div>
       <button
         onClick={() => onChange(!active)}
         className={cn(
           "w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out",
           active ? "bg-primary" : "bg-text-muted/30"
         )}
       >
         <div className={cn(
           "absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200",
           active ? "translate-x-5" : "translate-x-0"
         )} />
       </button>
    </div>
  );

  const columns = [
    {
      header: 'Part Details',
      accessor: 'name',
      render: (name, row) => (
        <div className="space-y-0.5">
          <div className="font-bold text-text-primary text-[13px]">{name}</div>
          <div className="text-[11px] text-text-muted">PN: {row.partNumber || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Current Stock',
      accessor: 'quantity',
      render: (qty) => (
        <Badge variant={qty > 10 ? 'success' : qty > 0 ? 'warning' : 'error'} size="sm">
          {qty} units
        </Badge>
      )
    },
    {
      header: 'Low Stock Threshold',
      accessor: 'lowStockThreshold',
      render: (threshold, row) => (
        <div className="flex items-center gap-2 max-w-[100px]">
          <Input 
            type="number"
            value={threshold || ''}
            placeholder={globalSettings.defaultThreshold}
            className="text-center h-8 text-[12px]"
            onChange={(e) => handlePartThresholdChange(row.id, e.target.value)}
          />
        </div>
      )
    },
    {
      header: 'Reorder Point',
      accessor: 'reorderPoint',
      render: (point, row) => (
        <div className="flex items-center gap-2 max-w-[100px]">
          <Input 
            type="number"
            value={point || ''}
            placeholder={(row.lowStockThreshold || globalSettings.defaultThreshold) + 2}
            className="text-center h-8 text-[12px]"
            onChange={(e) => {
              // We can use the same function or a new one for reorder point
              updateStockThreshold(row.id, { reorderPoint: Number(e.target.value) });
            }}
          />
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Alert Configuration"
        subtitle="Manage stock thresholds and notification channels."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Global Settings */}
        <div className="space-y-6">
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-6 flex items-center gap-2">
              <Settings className="text-primary" size={16} /> Global Settings
            </h3>
            
            <div className="space-y-6">
              <Input 
                 label="Default Threshold"
                 type="number"
                 value={globalSettings.defaultThreshold}
                 onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultThreshold: Number(e.target.value) }))}
                 helperText="Applies to all parts unless overridden."
              />

              <div className="space-y-3">
                 <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Notification Channels</label>
                 <ChannelToggle 
                    label="In-App Notifications" 
                    icon={Bell} 
                    active={globalSettings.channels.inApp}
                    onChange={(val) => setGlobalSettings(prev => ({ ...prev, channels: { ...prev.channels, inApp: val } }))}
                 />
                 <ChannelToggle 
                    label="Email Alerts" 
                    icon={Mail} 
                    active={globalSettings.channels.email}
                    onChange={(val) => setGlobalSettings(prev => ({ ...prev, channels: { ...prev.channels, email: val } }))}
                 />
                 <ChannelToggle 
                    label="Push Notifications" 
                    icon={Smartphone} 
                    active={globalSettings.channels.push}
                    onChange={(val) => setGlobalSettings(prev => ({ ...prev, channels: { ...prev.channels, push: val } }))}
                 />
              </div>

              <div className="pt-4 border-t border-border">
                 <Button onClick={handleGlobalSave} loading={loading} icon={Save} className="w-full">
                    Save Global Settings
                 </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none ring-1 ring-border/50 bg-primary/5 border-primary/10">
             <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                <Info size={16} /> Pro Tip
             </h4>
             <p className="text-xs text-text-secondary leading-relaxed">
                Set custom thresholds for high-volume parts to ensure you have enough buffer time to restock before running out completely.
             </p>
          </Card>
        </div>

        {/* Per-Part Override */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-6 border-none ring-1 ring-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                 <h3 className="text-sm font-bold text-text-primary">Per-Part Threshold Overrides</h3>
                 <div className="w-full sm:w-64">
                    <Input 
                      placeholder="Search parts..." 
                      icon={Search} 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                 </div>
              </div>

              <Table 
                columns={columns}
                data={filteredParts}
                pageSize={10}
                paginated
                emptyMessage="No parts found."
                className="[&_table]:min-w-[500px]"
              />
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AlertsConfig;
