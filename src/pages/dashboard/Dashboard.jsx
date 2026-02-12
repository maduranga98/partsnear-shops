import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useShop } from '../../context/ShopContext';
import { getShopParts } from '../../services/parts';
import { getRecentInquiries } from '../../services/inquiries';
import { calculateProfileCompletion } from '../../services/shop';
import { ROUTES } from '../../config/routes';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Dashboard = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalParts: 0,
    activeParts: 0,
    inactiveParts: 0,
    lowStock: 0,
    recentInquiries: [],
    lowStockParts: [],
    categoryData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const [parts, inquiries] = await Promise.all([
          getShopParts(shop.id),
          getRecentInquiries(shop.id, 5)
        ]);

        // Process parts for stats
        const active = parts.filter(p => p.status === 'active').length;
        const lowStock = parts.filter(p => p.stock > 0 && p.stock <= 5);
        
        // Category distribution
        const catMap = {};
        parts.forEach(p => {
          catMap[p.category] = (catMap[p.category] || 0) + 1;
        });
        const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

        setStats({
          totalParts: parts.length,
          activeParts: active,
          inactiveParts: parts.length - active,
          lowStock: lowStock.length,
          recentInquiries: inquiries,
          lowStockParts: lowStock.slice(0, 5),
          categoryData
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [shop?.id]);

  const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const completion = calculateProfileCompletion(shop);

  const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <Card className="p-6 border-none ring-1 ring-border/50">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-black text-text-primary">{value}</h3>
          {subValue && <p className="text-[11px] text-text-secondary mt-1">{subValue}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-${color}/10 text-${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Good morning, {shop?.shopName || 'Shop Owner'}
            </h1>
            {shop?.verified && (
              <Badge variant="navy" size="sm" className="bg-navy/5 text-navy border-none ring-1 ring-navy/10 gap-1 mt-1">
                <CheckCircle2 size={12} /> Verified
              </Badge>
            )}
          </div>
          <p className="text-text-secondary">Here's what's happening with your shop today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} onClick={() => navigate(ROUTES.PARTS_ADD)}>Add Part</Button>
          <Button variant="outline" icon={Zap}>Boost Listing</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Parts" 
          value={stats.totalParts} 
          subValue={`${stats.activeParts} active, ${stats.inactiveParts} draft`} 
          icon={Package} 
          color="primary" 
        />
        <StatCard 
          title="Views Today" 
          value="128" 
          subValue="+12% from yesterday" 
          icon={Eye} 
          color="navy" 
        />
        <StatCard 
          title="Customer Inquiries" 
          value={stats.recentInquiries.length} 
          subValue="3 pending response" 
          icon={MessageSquare} 
          color="success" 
        />
        <StatCard 
          title="Profile Visits" 
          value="45" 
          subValue="Average 12m duration" 
          icon={TrendingUp} 
          color="warning" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Column (v8) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Add Part', icon: Plus, path: ROUTES.PARTS_ADD, color: 'primary' },
                { label: 'View Inquiries', icon: MessageSquare, path: ROUTES.INQUIRIES, color: 'success' },
                { label: 'Edit Profile', icon: Edit3, path: ROUTES.PROFILE, color: 'navy' },
                { label: 'Subscription', icon: Star, path: ROUTES.SUBSCRIPTION, color: 'warning' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-surface transition-all group"
                >
                  <div className={`p-3 rounded-xl bg-${action.color}/10 text-${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon size={20} />
                  </div>
                  <span className="text-[12px] font-bold text-text-secondary">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Inquiries */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-text-primary">Recent Inquiries</h3>
              <button 
                onClick={() => navigate(ROUTES.INQUIRIES)}
                className="text-[12px] font-bold text-primary flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            {stats.recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center font-bold text-primary uppercase">
                        {inquiry.customerName?.[0] || 'C'}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-text-primary">{inquiry.customerName}</h4>
                        <p className="text-[11px] text-text-secondary">Needs: {inquiry.partRequested}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={inquiry.status === 'new' ? 'primary' : 'gray'} size="sm">
                        {inquiry.status}
                      </Badge>
                      <p className="text-[10px] text-text-muted mt-1 flex items-center justify-end gap-1">
                        <Clock size={10} /> 2m ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-3 text-text-muted">
                  <MessageSquare size={20} />
                </div>
                <p className="text-sm text-text-muted font-medium">No recent inquiries found.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (v4) */}
        <div className="space-y-8">
          {/* Profile Completion */}
          <Card className="p-6 border-none ring-1 ring-border/50 overflow-hidden relative">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              Profile Completion
              {completion === 100 && <CheckCircle2 size={16} className="text-success" />}
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-surface-2"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeWidth="6"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * completion) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="34"
                    cx="40"
                    cy="40"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-text-primary">
                  {completion}%
                </div>
              </div>
              <div>
                <p className="text-[11px] text-text-secondary leading-tight">
                  {completion < 100 
                    ? "Complete your profile to increase your visibility by up to 40%." 
                    : "Your profile is fully optimized and visible to all customers!"}
                </p>
                {completion < 100 && (
                  <button 
                    onClick={() => navigate(ROUTES.PROFILE)}
                    className="text-[11px] font-bold text-primary mt-2 flex items-center gap-1"
                  >
                    Finish Setup <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Category Distribution Chart */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-6">Inventory by Category</h3>
            <div className="h-[200px] w-full">
              {stats.categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-[12px] font-medium">
                  Add parts to see analytics
                </div>
              )}
            </div>
            {stats.categoryData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {stats.categoryData.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-text-secondary truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Low Stock Alert */}
          {stats.lowStockParts.length > 0 && (
            <Card className="p-6 border-none ring-1 ring-border/50 bg-error/5 border-error/10">
              <h3 className="text-sm font-bold text-error flex items-center gap-2 mb-4">
                <AlertTriangle size={16} /> Low Stock Alert
              </h3>
              <div className="space-y-3">
                {stats.lowStockParts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between text-[12px]">
                    <span className="font-medium text-text-primary truncate mr-2">{part.name}</span>
                    <span className="font-bold text-error">{part.stock} left</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-4 text-error hover:bg-error/10"
                onClick={() => navigate(ROUTES.PARTS)}
              >
                Manage Stock
              </Button>
            </Card>
          )}

          {/* Subscription Status */}
          <Card className="p-6 border-none ring-1 ring-border/50 bg-navy text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Current Plan</p>
            <h3 className="text-xl font-black mt-1 capitalize">{shop?.tier || 'Free'} Plan</h3>
            <p className="text-[11px] opacity-80 mt-2">Active until March 15, 2026</p>
            <Button 
              className="w-full mt-6 bg-white text-navy hover:bg-white/90 border-none"
              onClick={() => navigate(ROUTES.SUBSCRIPTION)}
            >
              Upgrade Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
