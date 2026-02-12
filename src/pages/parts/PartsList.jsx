import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Eye,
  AlertCircle,
  Package,
  TrendingUp,
  AlertTriangle,
  Upload,
  Tag
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopParts, deletePart, duplicatePart } from '../../services/parts';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { PART_STATUS, STOCK_STATUS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Modal';
import BarcodePrintModal from '../../components/parts/BarcodePrintModal';

const PartsList = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);
  const [partForBarcode, setPartForBarcode] = useState(null);

  const fetchParts = async () => {
    if (!shop?.id) return;
    setLoading(true);
    try {
      const data = await getShopParts(shop.id);
      setParts(data);
    } catch (error) {
      console.error(error);
      notify.error('Failed to fetch parts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [shop?.id]);

  const handleDelete = async () => {
    if (!partToDelete) return;
    setIsDeleting(true);
    try {
      await deletePart(partToDelete.id);
      notify.success('Part deleted successfully');
      setParts(parts.filter(p => p.id !== partToDelete.id));
      setPartToDelete(null);
    } catch (error) {
      console.error(error);
      notify.error('Failed to delete part');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const newId = await duplicatePart(id);
      notify.success('Part duplicated successfully');
      fetchParts();
    } catch (error) {
      console.error(error);
      notify.error('Failed to duplicate part');
    }
  };

  const columns = [
    {
      header: 'Part Details',
      accessor: 'name',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-surface-2 overflow-hidden shrink-0 border border-border">
            {row.images?.[0] ? (
              <img src={row.images[0]} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <ImageIcon size={20} />
              </div>
            )}
          </div>
          <div>
             <div className="font-bold text-text-primary line-clamp-1">{name}</div>
             <div className="text-[11px] text-text-muted">{row.brand || 'No Brand'} • {row.partNumber || 'No Part #'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (cat, row) => (
        <div className="space-y-1">
          <div className="text-text-primary font-medium">{cat}</div>
          <div className="text-[11px] text-text-muted">{row.subCategory || 'General'}</div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (price, row) => (
        <div className="space-y-1">
          {row.discountPrice ? (
            <>
              <div className="font-bold text-text-primary">Rs. {row.discountPrice.toLocaleString()}</div>
              <div className="text-[11px] text-text-muted line-through">Rs. {price.toLocaleString()}</div>
            </>
          ) : (
            <div className="font-bold text-text-primary">Rs. {price.toLocaleString()}</div>
          )}
        </div>
      )
    },
    {
      header: 'Stock',
      accessor: 'stock',
      render: (stock) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-text-primary">{stock} units</span>
          <Badge variant={stock > 10 ? 'success' : stock > 0 ? 'warning' : 'danger'} size="sm">
            {stock > 10 ? 'In Stock' : stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </Badge>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => (
        <Badge variant={status === PART_STATUS.ACTIVE ? 'success' : 'gray'}>
          {status?.toUpperCase() || 'DRAFT'}
        </Badge>
      )
    },
    {
      header: '',
      accessor: 'actions',
      sortable: false,
      headerClassName: 'w-10',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            onClick={() => setPartForBarcode(row)}
            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Barcode/Label"
          >
            <Tag size={16} />
          </button>
          <button 
            onClick={() => navigate(ROUTES.PARTS_EDIT.replace(':id', row.id))}
            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => handleDuplicate(row.id)}
            className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={() => setPartToDelete(row)}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const stats = [
    { label: 'Total Parts', value: parts.length, icon: Package, color: 'primary' },
    { label: 'Low Stock', value: parts.filter(p => p.stock > 0 && p.stock <= 10).length, icon: AlertTriangle, color: 'warning' },
    { label: 'Out of Stock', value: parts.filter(p => p.stock === 0).length, icon: AlertCircle, color: 'error' },
    { label: 'Top Selling', value: '—', icon: TrendingUp, color: 'success' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Parts Catalog</h1>
          <p className="text-text-secondary mt-1">Manage your inventory and product listings</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Upload} onClick={() => navigate('/parts/import')}>
            Bulk Import
          </Button>
          <Button icon={Plus} onClick={() => navigate(ROUTES.PARTS_ADD)}>
            Add New Part
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 flex items-center gap-4 border-none ring-1 ring-border/50">
            <div className={`p-3 rounded-xl bg-${stat.color}/10 text-${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-text-primary">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-none ring-1 ring-border/50">
        <Table 
          columns={columns}
          data={parts}
          loading={loading}
          pageSize={10}
          paginated
          emptyMessage="No parts found. Start by adding your first part!"
          className="[&_table]:min-w-[800px]"
        />
      </Card>

      <ConfirmDialog 
        isOpen={!!partToDelete}
        onClose={() => setPartToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Part"
        message={`Are you sure you want to delete "${partToDelete?.name}"? This action cannot be undone.`}
        loading={isDeleting}
      />

      <BarcodePrintModal 
        isOpen={!!partForBarcode}
        onClose={() => setPartForBarcode(null)}
        part={partForBarcode}
      />
    </div>
  );
};

export default PartsList;
