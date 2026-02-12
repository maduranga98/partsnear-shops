import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Activity, 
  ShoppingBag, 
  Clock, 
  Calendar,
  User,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getShopStaff, getActivityLogs } from '../../services/staff';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/helpers';

const StaffDetail = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!shop?.id || !id) return;
      setLoading(true);
      try {
        const staffList = await getShopStaff(shop.id);
        const staffMember = staffList.find(s => s.id === id);
        
        if (staffMember) {
          setMember(staffMember);
          const logData = await getActivityLogs(shop.id, id);
          setLogs(logData);
        } else {
          notify.error('Staff member not found');
          navigate('/staff');
        }
      } catch (error) {
        notify.error('Failed to load staff details');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, [id, shop?.id]);

  if (loading) return <div className="p-8 text-center text-text-muted">Loading staff records...</div>;
  if (!member) return null;

  const logColumns = [
    {
      header: 'Time',
      accessor: 'timestamp',
      render: (val) => <span className="text-[11px] text-text-muted">{val?.toDate().toLocaleString()}</span>
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (action) => <Badge variant="gray" size="sm" className="font-bold">{action}</Badge>
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (details) => <span className="text-[12px] text-text-secondary">{details}</span>
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/staff')} className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary">
           <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-3xl bg-surface-2 text-text-primary flex items-center justify-center text-2xl font-black uppercase ring-1 ring-border/50">
              {member.displayName?.[0] || 'U'}
           </div>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-black text-text-primary tracking-tight">{member.displayName}</h1>
                 <Badge variant="primary">{member.role}</Badge>
              </div>
              <p className="text-sm text-text-secondary mt-1">{member.email}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Sales', value: member.salesCount || 0, icon: ShoppingBag, color: 'primary' },
           { label: 'Avg. Order', value: `Rs. ${(member.avgSaleValue || 0).toLocaleString()}`, icon: Activity, color: 'success' },
           { label: 'Last Active', value: member.lastActive?.toDate().toLocaleDateString() || 'Today', icon: Clock, color: 'warning' },
           { label: 'Status', value: member.status || 'Active', icon: CheckCircle2, color: 'success' },
         ].map((stat, i) => (
           <Card key={i} className="p-4 border-none ring-1 ring-border/50 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", `bg-${stat.color}/10 text-${stat.color}`)}>
                 <stat.icon size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                 <h3 className="text-lg font-black text-text-primary">{stat.value}</h3>
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <Card className="lg:col-span-2 border-none ring-1 ring-border/50">
            <div className="p-6 border-b border-border flex justify-between items-center">
               <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted">Activity Log</h3>
               <Button variant="ghost" size="sm" icon={Calendar}>Filter by Date</Button>
            </div>
            <Table 
              columns={logColumns} 
              data={logs} 
              emptyMessage="No activity logs found for this staff member."
            />
         </Card>

         <div className="space-y-6">
            <Card className="p-8 border-none ring-1 ring-border/50 space-y-6">
               <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted">Security Controls</h3>
               <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12" icon={Shield}>Manage Permissions</Button>
                  <Button variant="outline" className="w-full justify-start h-12" icon={Activity}>Full Log Export</Button>
                  <div className="pt-4 border-t border-border mt-4">
                     <Button variant="error" className="w-full h-12" icon={AlertCircle}>Deactivate Account</Button>
                     <p className="text-[10px] text-text-muted mt-2 text-center">Account data will be preserved for audit logs.</p>
                  </div>
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50 bg-warning/5 border-warning/10">
               <div className="flex items-center gap-3 text-warning mb-4">
                  <Activity size={24} />
                  <h4 className="text-[14px] font-black uppercase tracking-tight">Performance Insight</h4>
               </div>
               <p className="text-[12px] text-text-secondary leading-relaxed">
                  {member.displayName}'s sales volume is <strong>12% higher</strong> than the shop average this month.
               </p>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default StaffDetail;
