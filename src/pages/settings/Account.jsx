import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Smartphone,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AccountSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    twoFactorEnabled: userProfile?.twoFactorEnabled || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      notify.success('Profile updated successfully');
    } catch (err) {
      notify.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Personal Information</h2>
            <p className="text-sm text-text-secondary">Update your profile and contact details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase px-1">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm opacity-60 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-muted uppercase px-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-surface-2 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6">Security</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-2 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Password</p>
                <p className="text-xs text-text-muted">Last changed 3 months ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-2 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Two-Factor Authentication</p>
                <p className="text-xs text-text-muted">Secure your account with SMS codes</p>
              </div>
            </div>
            <button
              onClick={() => handleChange({ target: { name: 'twoFactorEnabled', type: 'checkbox', checked: !formData.twoFactorEnabled } })}
              className={`w-12 h-6 rounded-full relative p-1 transition-all duration-300 ${formData.twoFactorEnabled ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Smartphone size={20} className="text-primary" />
          Active Sessions
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="text-text-muted"><Smartphone size={24} /></div>
              <div>
                <p className="text-sm font-bold text-text-primary">iPhone 15 Pro • Colombo, LK</p>
                <p className="text-xs text-success font-medium">Active Now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="text-text-muted"><LogOut size={24} /></div>
              <div>
                <p className="text-sm font-bold text-text-primary">Chrome on Windows • Kandy, LK</p>
                <p className="text-xs text-text-muted font-medium">Last active 2 days ago</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-error">Logout</Button>
          </div>
        </div>
      </Card>

      <div className="p-6 bg-error/5 rounded-2xl border border-error/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-error" size={24} />
          <div>
            <h4 className="text-sm font-bold text-text-primary">Delete Account</h4>
            <p className="text-xs text-text-secondary">Permanently remove your shop and all data</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="border-error text-error hover:bg-error/10">Delete Account</Button>
      </div>
    </div>
  );
};

export default AccountSettings;
