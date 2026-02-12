import { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Settings, 
  Clock, 
  Package, 
  MessageSquare, 
  ShieldCheck,
  Zap,
  MoreVertical,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, requestPermission } = useNotification();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? n.unread : true);
    const matchesSearch = n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'inquiry': return <MessageSquare size={16} className="text-primary" />;
      case 'stock': return <Package size={16} className="text-warning" />;
      case 'subscription': return <Zap size={16} className="text-success" />;
      case 'review': return <CheckCircle2 size={16} className="text-info" />;
      default: return <Bell size={16} className="text-text-muted" />;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: 'Unread', badge: unreadCount },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Notifications</h1>
          <p className="text-text-secondary mt-1">Stay updated with your shop activities</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={ShieldCheck} onClick={requestPermission}>
            Enable Desktop Alerts
          </Button>
          <Button variant="outline" size="sm" icon={CheckCircle2} onClick={markAllAsRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        </div>
      </div>

      <Card className="border-none ring-1 ring-border/50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border bg-surface/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            variant="pills"
          />
          <div className="relative max-w-xs w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Filter notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-border">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <div 
                key={n.id}
                className={cn(
                  "group flex gap-4 p-4 sm:p-6 hover:bg-surface transition-all relative border-l-4",
                  n.unread ? "border-primary bg-primary/5" : "border-transparent"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                  n.unread ? "bg-white border-primary/20" : "bg-surface-2 border-border"
                )}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3 className={cn(
                      "text-[15px] font-bold truncate",
                      n.unread ? "text-text-primary" : "text-text-body"
                    )}>
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-text-muted font-medium whitespace-nowrap pt-0.5">
                      {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {n.message}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {n.link && (
                      <Link 
                        to={n.link} 
                        onClick={() => n.unread && markAsRead(n.id)}
                        className="text-[12px] font-bold text-primary hover:underline"
                      >
                        Check detail
                      </Link>
                    )}
                    {n.unread && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="text-[12px] font-bold text-text-muted hover:text-text-primary"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                <button className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-error transition-all absolute top-4 right-4 sm:static">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4 text-text-muted">
                <Bell size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">No notifications found</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                {searchQuery ? `We couldn't find any results for "${searchQuery}"` : "Notifications from your shop activity will appear here."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;
