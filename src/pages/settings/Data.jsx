import { useState } from 'react';
import { 
  Database, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  AlertCircle,
  FileArchive,
  Loader2,
  Check
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const DataManagement = () => {
  const { userProfile } = useAuth();
  const notify = useNotification();
  const [downloading, setDownloading] = useState(null); // 'parts', 'customers', 'sales'

  const handleExport = async (type) => {
    setDownloading(type);
    try {
      // Logic for CSV generation and download
      await new Promise(r => setTimeout(r, 1500));
      notify.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } catch (err) {
      notify.error(`Failed to export ${type}`);
    } finally {
      setDownloading(null);
    }
  };

  const ExportItem = ({ id, title, description, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-2xl border border-border">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{title}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        loading={downloading === id}
        onClick={() => handleExport(id)}
        icon={Download}
      >
        Export CSV
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Database className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-text-primary">Data Export</h2>
          </div>
          <Badge variant="success" className="animate-pulse">Active Snapshot</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <ExportItem 
            id="parts" 
            title="Parts Catalog" 
            description="All listed parts with stock, prices, and location" 
            icon={FileSpreadsheet} 
          />
          <ExportItem 
            id="customers" 
            title="Customer List" 
            description="Contact details and credit history for all customers" 
            icon={Database} 
          />
          <ExportItem 
            id="sales" 
            title="Sales History" 
            description="Detailed log of all transactions and invoices" 
            icon={FileArchive} 
          />
        </div>

        <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/20 flex items-start gap-4">
          <AlertCircle className="text-primary shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-primary">Regular Backups</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              We recommend exporting your data at the end of each month for your local records. 
              Only owners can perform full data exports.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-error/50 bg-error/5">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="text-error" size={24} />
          <div>
            <h2 className="text-xl font-bold text-text-primary">Danger Zone</h2>
            <p className="text-sm text-text-secondary">Highly sensitive actions for your account</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-error/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm font-bold text-text-primary">Deactivate Account</p>
            <p className="text-xs text-text-muted">Temporarily hide your shop from Search results</p>
          </div>
          <Button variant="outline" className="border-error text-error hover:bg-error/10">Deactivate Now</Button>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-white border border-error/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-sm font-bold text-text-primary">Delete All Data</p>
            <p className="text-xs text-text-muted">Permanent removal of all shop records and files</p>
          </div>
          <Button variant="navy" className="bg-error hover:bg-error/90 border-none whitespace-nowrap">Delete Everything</Button>
        </div>
      </Card>
      
      <div className="text-center text-[10px] text-text-muted italic">
        Last full backup generated: 12 minutes ago
      </div>
    </div>
  );
};

export default DataManagement;
