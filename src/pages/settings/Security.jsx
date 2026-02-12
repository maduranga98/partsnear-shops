import { ShieldCheck, Lock, Smartphone, LogOut } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SecuritySettings = () => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-text-primary">Security Overview</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-success/5 border border-success/20 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Your account is secure</p>
              <p className="text-xs text-text-secondary">2-Factor Authentication is currently active for your phone number.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Login History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-text-muted" />
                  <span className="font-medium">iPhone 15 Pro • Colombo, LK</span>
                </div>
                <span className="text-text-muted">Today at 12:45 PM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <LogOut size={14} className="text-text-muted" />
                  <span className="font-medium">Chrome on Windows • Kandy, LK</span>
                </div>
                <span className="text-text-muted">Yesterday at 09:12 AM</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button variant="outline" className="w-full">Sign Out All Other Devices</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecuritySettings;
