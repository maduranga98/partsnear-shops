import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  UserX, 
  CheckCircle2, 
  Clock, 
  User,
  MoreHorizontal,
  Edit2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../hooks/useAuth';
import { TIERS, hasTierAccess } from '../../config/tiers';
import { getShopStaff, getPendingInvitations, inviteStaff, updateStaffRole, deactivateStaff } from '../../services/staff';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { STAFF_ROLES } from '../../utils/constants';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FeatureLock from '../../components/ui/FeatureLock';
import { cn } from '../../utils/helpers';

const StaffList = () => {
  const { shop } = useShop();
  const { userTier } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting ] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'Cashier' });

  if (!hasTierAccess(userTier, TIERS.PRO)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FeatureLock 
          title="Team & Security Controls"
          description="Grow your team safely with role-based permissions and granular activity tracking."
          features={[
             "Multi-user access for staff",
             "RBAC (Owner, Manager, Cashier)",
             "Detailed activity & audit logs",
             "Role-specific feature restrictions",
             "Secure team invitations"
          ]}
          requiredTier="Pro"
        />
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const [staffData, inviteData] = await Promise.all([
          getShopStaff(shop.id),
          getPendingInvitations(shop.id)
        ]);
        setStaff(staffData);
        setInvites(inviteData);
      } catch (error) {
        notify.error('Failed to fetch team data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shop?.id]);

  const handleInvite = async () => {
    if (!inviteData.email) return notify.error('Email is required');
    setInviting(true);
    try {
      const newInvite = await inviteStaff(shop.id, inviteData.email, inviteData.role);
      setInvites(prev => [...prev, newInvite]);
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'Cashier' });
      notify.success('Invitation sent successfully');
    } catch (error) {
      notify.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (staffId, newRole) => {
    try {
      await updateStaffRole(staffId, newRole);
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, role: newRole } : s));
      notify.success(`Role updated to ${newRole}`);
    } catch (error) {
      notify.error('Failed to update role');
    }
  };

  const staffColumns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      render: (name, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary text-[14px]">
            {row.displayName?.[0] || 'U'}
          </div>
          <div>
            <div className="font-bold text-text-primary text-[14px]">{row.displayName || 'Unknown User'}</div>
            <div className="text-[11px] text-text-muted">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (role, row) => (
        <div className="w-40">
           <Select 
             size="sm"
             options={Object.values(STAFF_ROLES).map(r => ({ label: r, value: r }))}
             value={role}
             disabled={role === STAFF_ROLES.OWNER}
             onChange={(opt) => handleRoleChange(row.id, opt.value)}
           />
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : 'gray'}>
          {status || 'Active'}
        </Badge>
      )
    },
    {
      header: '',
      accessor: 'id',
      render: (id, row) => (
        <div className="flex justify-end gap-1">
           <button 
             onClick={() => navigate(`/staff/${id}`)}
             className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
           >
             <Shield size={16} />
           </button>
           {row.role !== STAFF_ROLES.OWNER && (
             <button className="p-2 text-text-secondary hover:text-error hover:bg-error/5 rounded-lg transition-colors">
                <UserX size={16} />
             </button>
           )}
        </div>
      )
    }
  ];

  const inviteColumns = [
    {
      header: 'Email Address',
      accessor: 'email',
      render: (email) => <span className="text-[13px] font-bold text-text-primary">{email}</span>
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (role) => <Badge variant="gray">{role}</Badge>
    },
    {
      header: 'Sent Date',
      accessor: 'invitedAt',
      render: (val) => <span className="text-[11px] text-text-muted">{val?.toDate().toLocaleDateString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: () => (
        <div className="flex items-center gap-2 text-warning animate-pulse">
          <Clock size={12} />
          <span className="text-[10px] font-black uppercase">Pending</span>
        </div>
      )
    },
    {
      header: '',
      accessor: 'id',
      render: () => (
        <button className="text-[11px] font-bold text-text-muted hover:text-error transition-colors px-3 py-1">
          Revoke
        </button>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Staff Management"
        subtitle="Manage your team, assign roles, and track activity across your shop."
        actions={
          <Button icon={UserPlus} onClick={() => setShowInviteModal(true)}>
            Invite New Staff
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <Card className="border-none ring-1 ring-border/50">
               <div className="p-6 border-b border-border">
                  <h3 className="text-sm font-bold text-text-primary">Current Team ({staff.length})</h3>
               </div>
               <Table 
                 columns={staffColumns} 
                 data={staff} 
                 loading={loading}
                 emptyMessage="No staff members found. Invite your team to get started!"
               />
            </Card>

            {invites.length > 0 && (
               <Card className="border-none ring-1 ring-border/50">
                  <div className="p-6 border-b border-border bg-warning/5">
                     <h3 className="text-sm font-bold text-warning flex items-center gap-2">
                        <Clock size={16} /> Pending Invitations
                     </h3>
                  </div>
                  <Table columns={inviteColumns} data={invites} loading={loading} />
               </Card>
            )}
         </div>

         <div className="space-y-6">
            <Card className="p-6 border-none ring-1 ring-border/50 space-y-6">
               <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 uppercase tracking-widest text-text-muted">
                  <Shield size={16} className="text-primary" /> Role Privileges
               </h3>
               <div className="space-y-4">
                  {[
                    { role: 'Owner', desc: 'Full uncontrolled access to everything.' },
                    { role: 'Manager', desc: 'All tools + staff but no billing control.' },
                    { role: 'Cashier', desc: 'Can only access POS, Sales & Customers.' },
                    { role: 'Inventory', desc: 'Restricted to Stock & Supplier modules.' },
                    { role: 'Viewer', desc: 'Read-only access to Analytics & Dashboard.' },
                  ].map((r, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-xl bg-surface-2 border border-border/50">
                       <div className="w-1 h-8 bg-primary/20 rounded-full" />
                       <div>
                          <p className="text-xs font-bold text-text-primary">{r.role}</p>
                          <p className="text-[10px] text-text-muted">{r.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50 bg-primary/5 border-primary/10">
               <div className="flex items-center gap-3 text-primary mb-4">
                  <CheckCircle2 size={24} />
                  <h4 className="text-[14px] font-black uppercase tracking-tight">Security Tip</h4>
               </div>
               <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                  Regularly audit staff roles. Use the <strong>Activity Log</strong> on individual staff profiles to monitor changes made to inventory or sales.
               </p>
               <Button variant="outline" className="w-full text-[11px]" size="sm">View Global Audit Log</Button>
            </Card>
         </div>
      </div>

      <Modal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
        title="Invite Staff Member"
      >
         <div className="space-y-6 p-2">
            <Input 
              label="Email Address" 
              type="email"
              placeholder="e.g. staff@partsnear.com" 
              value={inviteData.email} 
              onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))} 
            />
            <Select 
              label="Assign Role" 
              options={Object.values(STAFF_ROLES).filter(r => r !== 'Owner').map(r => ({ label: r, value: r }))}
              value={inviteData.role}
              onChange={(opt) => setInviteData(prev => ({ ...prev, role: opt.value }))}
            />
            <div className="flex gap-3 pt-4">
               <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>Cancel</Button>
               <Button className="flex-1" loading={inviting} onClick={handleInvite} icon={Mail}>Send Invitation</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default StaffList;
