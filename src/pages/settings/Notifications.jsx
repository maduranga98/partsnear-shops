import { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Clock,
  Settings2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const NotificationSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [preferences, setPreferences] = useState({
    inApp: {
      inquiries: true,
      stockAlerts: true,
      system: true,
    },
    push: {
      inquiries: true,
      stockAlerts: false,
      system: true,
    },
    email: {
      inquiries: true,
      billing: true,
      marketing: false,
    },
    sms: {
      urgent: true,
      otp: true,
    }
  });

  const togglePreference = (category, type) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ notificationPrefs: preferences });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const NotificationRow = ({ title, icon: Icon, category, type }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-text-muted"><Icon size={18} /></div>
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </div>
      <button
        onClick={() => togglePreference(category, type)}
        className={`w-10 h-5 rounded-full relative p-1 transition-all duration-300 ${preferences[category][type] ? 'bg-primary' : 'bg-surface-3'}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${preferences[category][type] ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-text-primary">General Notifications</h2>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell size={14} /> In-App & Push
            </h3>
            <div className="bg-surface-2 rounded-2xl px-6 border border-border">
              <NotificationRow title="New Inquiry received" icon={MessageSquare} category="inApp" type="inquiries" />
              <NotificationRow title="Low stock alerts" icon={AlertTriangle} category="inApp" type="stockAlerts" />
              <NotificationRow title="System updates" icon={Settings2} category="inApp" type="system" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Mail size={14} /> Email Notifications
            </h3>
            <div className="bg-surface-2 rounded-2xl px-6 border border-border">
              <NotificationRow title="New inquiries" icon={Mail} category="email" type="inquiries" />
              <NotificationRow title="Billing & Invoices" icon={Mail} category="email" type="billing" />
              <NotificationRow title="Marketing & Tips" icon={Mail} category="email" type="marketing" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Smartphone size={14} /> SMS Alerts
            </h3>
            <div className="bg-surface-2 rounded-2xl px-6 border border-border">
              <NotificationRow title="Urgent inquiries" icon={ स्मार्टफोन } category="sms" type="urgent" />
              <NotificationRow title="One-time passwords (OTP)" icon={ स्मार्टफोन } category="sms" type="otp" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} loading={loading}>Save Preferences</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-navy" size={24} />
          <div>
            <h2 className="text-xl font-bold text-text-primary">Quiet Hours</h2>
            <p className="text-sm text-text-secondary">Disable notifications during specific times</p>
          </div>
        </div>
        
        <div className="p-4 rounded-2xl bg-surface-2 border border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Enable Quiet Hours</p>
              <p className="text-xs text-text-muted">Currently disabled</p>
            </div>
          </div>
          <button className="w-12 h-6 bg-border rounded-full relative p-1 transition-all">
            <div className="w-4 h-4 bg-white rounded-full transition-transform" />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
