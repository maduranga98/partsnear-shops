import { NavLink, Outlet } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Bell, 
  Globe, 
  FileText, 
  Database, 
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';

const SETTINGS_TABS = [
  { id: 'account', label: 'Account', icon: User, path: '/settings/account' },
  { id: 'subscription', label: 'Subscription', icon: CreditCard, path: '/settings/subscription' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/settings/notifications' },
  { id: 'language', label: 'Language', icon: Globe, path: '/settings/language' },
  { id: 'templates', label: 'Invoice & Receipt', icon: FileText, path: '/settings/templates' },
  { id: 'auto-reply', label: 'Auto-Replies', icon: MessageSquare, path: '/settings/auto-reply' },
  { id: 'data', label: 'Data Management', icon: Database, path: '/settings/data' },
  { id: 'security', label: 'Security', icon: ShieldCheck, path: '/settings/security' },
];

const SettingsLayout = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your shop preferences and account details</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <Card className="p-2 space-y-1">
            {SETTINGS_TABS.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                  )
                }
              >
                <tab.icon size={18} />
                {tab.label}
              </NavLink>
            ))}
          </Card>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
