import { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  MousePointer2, 
  MessageSquare, 
  Calendar,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const BoostDashboard = () => {
  const navigate = useNavigate();

  const activeBoosts = [
    { id: 1, type: 'Spotlight', target: 'Brake Pads - Toyota', status: 'Active', impressions: 1240, clicks: 86, inquiries: 12, expiry: 'Feb 15, 2026' },
  ];

  const stats = [
    { label: 'Total Impressions', value: '4.2k', change: '+12%', icon: TrendingUp, color: 'primary' },
    { label: 'Boost Clicks', value: '312', change: '+8%', icon: MousePointer2, color: 'navy' },
    { label: 'Inquiries from Boost', value: '45', change: '+15%', icon: MessageSquare, color: 'success' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary flex items-center gap-2">
            <Zap className="text-primary" fill="currentColor" />
            Boost Dashboard
          </h1>
          <p className="text-text-secondary">Track your shop visibility and performance</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/boost/purchase')}>New Boost</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 overflow-hidden relative group">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-4">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 text-${stat.color} flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-text-primary">{stat.value}</span>
                    <span className="text-xs font-bold text-success">{stat.change}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Background Decoration */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
          </Card>
        ))}
      </div>

      {/* Active Boosts */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-text-primary">Active Boosts</h3>
          <Badge variant="success" className="animate-pulse">Live Now</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Targeted Part</th>
                <th className="px-6 py-4 text-center">Impressions</th>
                <th className="px-6 py-4 text-center">Clicks</th>
                <th className="px-6 py-4 text-center">Inquiries</th>
                <th className="px-6 py-4">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeBoosts.map((boost) => (
                <tr key={boost.id} className="hover:bg-surface-1 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {boost.type === 'Spotlight' && <ShieldCheck size={14} className="text-primary" />}
                       <span className="text-sm font-bold text-text-primary">{boost.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{boost.target}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-sm">{boost.impressions.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-bold text-sm">{boost.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center font-bold text-sm text-success">{boost.inquiries.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-text-muted font-medium">{boost.expiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROI Calculation Callout */}
      <Card className="p-8 bg-navy text-white overflow-hidden relative">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
               <h3 className="text-2xl font-bold">Estimated ROI: 4.8x</h3>
               <p className="text-white/60 max-w-sm">Every LKR 1,000 spent on boosts has generated approximately LKR 4,800 in potential inquiry value this month.</p>
            </div>
            <div className="flex gap-4">
               <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold text-white/60 uppercase">Ad Spend</p>
                  <p className="text-xl font-black">LKR 9,500</p>
               </div>
               <div className="p-4 bg-primary/20 rounded-2xl border border-primary/40 text-center min-w-[120px]">
                  <p className="text-[10px] font-bold text-primary-light uppercase">Conversion</p>
                  <p className="text-xl font-black">14.4%</p>
               </div>
            </div>
         </div>
         {/* Decoration */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
      </Card>
      
      <div className="flex justify-center pt-4">
         <Button variant="ghost" icon={ArrowUpRight}>Learn more about Boost</Button>
      </div>
    </div>
  );
};

export default BoostDashboard;
