import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../hooks/useAuth';
import { TIERS, hasTierAccess } from '../../config/tiers';
import { 
  getRevenueAnalytics, 
  getProductAnalytics, 
  getCustomerAnalytics, 
  getInventoryAnalytics 
} from '../../services/analytics';
import { useNotification } from '../../context/NotificationContext';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import FeatureLock from '../../components/ui/FeatureLock';
import { cn } from '../../utils/helpers';

const AnalyticsDashboard = () => {
  const { shop } = useShop();
  const { userTier } = useAuth();
  const notify = useNotification();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [data, setData] = useState({
    revenue: null,
    products: null,
    customers: null,
    inventory: null
  });

  if (!hasTierAccess(userTier, TIERS.PRO)) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <FeatureLock 
          title="Intelligent Business Insights"
          description="Transform your shop data into actionable insights and stay ahead of the competition."
          features={[
             "Revenue & Growth tracking charts",
             "Profit margin & Top product analysis",
             "Customer retention & churn metrics",
             "Inventory valuation & turnover rates",
             "Exportable monthly business reports"
          ]}
          requiredTier="Pro"
        />
      </div>
    );
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const start = new Date();
        start.setDate(start.getDate() - (dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90));

        const [rev, prod, cust, inv] = await Promise.all([
          getRevenueAnalytics(shop.id, start, new Date()),
          getProductAnalytics(shop.id, start, new Date()),
          getCustomerAnalytics(shop.id, start, new Date()),
          getInventoryAnalytics(shop.id)
        ]);

        setData({ revenue: rev, products: prod, customers: cust, inventory: inv });
      } catch (error) {
        notify.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [shop?.id, dateRange]);

  if (loading) return <div className="p-8 text-center text-text-muted">Analyzing your business performance...</div>;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <PageHeader 
        title="Advanced Analytics"
        subtitle="Data-driven insights into your revenue, inventory, and customer behavior."
        actions={
          <div className="flex gap-3">
             <Select 
               className="w-40"
               options={[
                 { label: 'Last 7 Days', value: '7d' },
                 { label: 'Last 30 Days', value: '30d' },
                 { label: 'Last 90 Days', value: '90d' },
               ]}
               value={dateRange}
               onChange={(opt) => setDateRange(opt.value)}
             />
             <Button variant="outline" icon={Download}>Export Data</Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <KPICard 
           title="Total Revenue" 
           value={`Rs. ${data.revenue?.totalRevenue.toLocaleString()}`}
           trend={data.revenue?.revenueGrowth}
           icon={DollarSign}
           color="primary"
         />
         <KPICard 
           title="Avg. Sale Value" 
           value={`Rs. ${data.revenue?.avgSaleValue.toLocaleString()}`}
           icon={ShoppingBag}
           color="success"
         />
         <KPICard 
           title="Total Customers" 
           value={data.customers?.totalCustomers}
           trend={8.5}
           icon={Users}
           color="warning"
         />
         <KPICard 
           title="Inventory Value" 
           value={`Rs. ${data.inventory?.inventoryValue.toLocaleString()}`}
           icon={Package}
           color="gray"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Revenue Chart */}
         <Card className="lg:col-span-2 p-6 border-none ring-1 ring-border/50">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted">Revenue Trend</h3>
               <div className="flex items-center gap-4 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Current Period</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-surface-3" /> Previous</div>
               </div>
            </div>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenue?.dailyRevenue}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: '#64748B' }} 
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: '#64748B' }} 
                       tickFormatter={(value) => `Rs.${value/1000}k`}
                     />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                       formatter={(val) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="value" 
                       stroke="#3B82F6" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorRev)" 
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Sales Breakdown Pie */}
         <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted mb-8">Payment Methods</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={data.revenue?.paymentBreakdown}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {data.revenue?.paymentBreakdown.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Top Selling Products */}
         <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted mb-6">Top Selling Parts</h3>
            <div className="space-y-4">
               {data.products?.topSellers.map((prod, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-2 transition-transform hover:scale-[1.01]">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                           {i + 1}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-text-primary">{prod.name}</p>
                           <p className="text-[10px] text-text-muted uppercase font-bold">{prod.quantity} sold</p>
                        </div>
                     </div>
                     <p className="font-black text-text-primary text-[14px]">Rs. {prod.revenue.toLocaleString()}</p>
                  </div>
               ))}
            </div>
         </Card>

         {/* Customer Spend */}
         <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-text-muted mb-6">Valuable Customers</h3>
            <div className="space-y-4">
               {data.customers?.topCustomers.map((cust, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-2 border border-transparent hover:border-primary/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                           {cust.name?.[0]}
                        </div>
                        <p className="text-sm font-bold text-text-primary">{cust.name}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-text-muted uppercase font-bold">Total Spent</p>
                        <p className="font-black text-primary text-[14px]">Rs. {cust.spent.toLocaleString()}</p>
                     </div>
                  </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, icon: Icon, color }) => (
  <Card className="p-6 border-none ring-1 ring-border/50 relative overflow-hidden group">
     <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full -mr-12 -mt-12", `bg-${color}`)} />
     <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", `bg-${color}/10 text-${color}`)}>
           <Icon size={24} />
        </div>
        {trend && (
           <div className={cn(
             "px-2 py-1 rounded-lg flex items-center gap-1 text-[11px] font-black",
             trend > 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
           )}>
              {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {Math.abs(trend)}%
           </div>
        )}
     </div>
     <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{title}</p>
     <h3 className="text-2xl font-black text-text-primary tracking-tight">{value}</h3>
  </Card>
);

export default AnalyticsDashboard;
