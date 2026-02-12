import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getRecentInquiries, updateInquiryStatus } from '../../services/inquiries';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import Card from '../../components/ui/Card';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const InquiryList = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!shop?.id) return;
      setLoading(true);
      try {
        const data = await getRecentInquiries(shop.id, 50); // Fetch more for the list
        setInquiries(data);
      } catch (error) {
        console.error(error);
        notify.error('Failed to fetch inquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [shop?.id]);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesTab = activeTab === 'all' || inquiry.status === activeTab;
    const matchesSearch = 
      inquiry.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.partRequested?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All Inquiries' },
    { id: 'new', label: 'New', badge: inquiries.filter(i => i.status === 'new').length },
    { id: 'replied', label: 'Replied' },
    { id: 'closed', label: 'Closed' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Customer Inquiries</h1>
          <p className="text-text-secondary mt-1">Manage and respond to parts requests from customers</p>
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
              placeholder="Search inquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-border">
          {loading ? (
            <div className="py-20 text-center">
              <Clock className="animate-spin mx-auto mb-2 text-primary" size={24} />
              <p className="text-sm text-text-secondary">Loading inquiries...</p>
            </div>
          ) : filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id}
                onClick={() => navigate(`/inquiries/${inquiry.id}`)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="flex gap-4 items-start sm:items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg shrink-0 group-hover:scale-110 transition-transform">
                    {inquiry.customerName?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary flex items-center gap-2">
                      {inquiry.customerName}
                      {inquiry.status === 'new' && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </h3>
                    <p className="text-sm text-text-body mt-1">
                      <span className="font-medium text-text-primary">Part:</span> {inquiry.partRequested}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> 2 hours ago</span>
                      <span className="flex items-center gap-1 capitalize"><AlertCircle size={12} /> {inquiry.vehicleDetails || 'Generic vehicle'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-none border-border">
                  <div className="text-right hidden md:block">
                     <Badge variant={inquiry.status === 'new' ? 'primary' : inquiry.status === 'closed' ? 'gray' : 'success'}>
                        {inquiry.status}
                     </Badge>
                  </div>
                  <ChevronRight size={20} className="text-text-muted group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4 text-text-muted">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">No inquiries found</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                {searchQuery ? `We couldn't find any results for "${searchQuery}"` : "Inquiries from customers will appear here when they request parts from your shop."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InquiryList;
