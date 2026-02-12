import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MessageCircle, 
  Clock, 
  User, 
  Package, 
  ChevronLeft,
  Send,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Calendar,
  AlertCircle,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { getInquiry, updateInquiryStatus, sendReply } from '../../services/inquiries';
import { getShopParts } from '../../services/parts';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';

const InquiryDetail = () => {
  const { id } = useParams();
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();

  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [shopParts, setShopParts] = useState([]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [inquiryData, partsData] = await Promise.all([
          getInquiry(id),
          getShopParts(shop.id)
        ]);
        setInquiry(inquiryData);
        setShopParts(partsData);
      } catch (error) {
        console.error(error);
        notify.error('Failed to load inquiry details');
      } finally {
        setLoading(false);
      }
    };
    if (id && shop?.id) fetchData();
  }, [id, shop?.id]);

  const handleReply = async (text = replyText) => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await sendReply(id, {
        senderId: shop.id,
        senderName: shop.shopName,
        text,
        type: 'response'
      });
      setReplyText('');
      // Reload inquiry to show new reply
      const updated = await getInquiry(id);
      setInquiry(updated);
      notify.success('Reply sent successfully');
    } catch (error) {
      console.error(error);
      notify.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateInquiryStatus(id, status);
      setInquiry(prev => ({ ...prev, status }));
      notify.success(`Status updated to ${status}`);
    } catch (error) {
      console.error(error);
      notify.error('Failed to update status');
    }
  };

  const templates = [
    { label: 'Available', text: `Hi ${inquiry?.customerName}, this part is available in stock. Price is LKR ` },
    { label: 'Out of Stock', text: `Hi ${inquiry?.customerName}, unfortunately this part is currently out of stock. We can order it for you in 3-5 days.` },
    { label: 'Visit Shop', text: `Hi ${inquiry?.customerName}, please visit our shop to check the part quality and confirm the fit.` },
  ];

  const handlePartSelect = (part) => {
    const text = `Hi ${inquiry?.customerName}, we have "${part.name}" available. \nPrice: LKR ${part.price.toLocaleString()}\nCondition: ${part.condition}\nWarranty: ${part.specifications?.warranty || 'Checking'}`;
    setReplyText(text);
    setShowQuoteModal(false);
  };

  const openWhatsApp = () => {
    if (!inquiry?.customerPhone) return;
    const phone = inquiry.customerPhone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${inquiry.customerName}, this is ${shop.shopName} responding to your inquiry for ${inquiry.partRequested}.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (loading) return <div className="p-8 text-center"><Clock className="animate-spin mx-auto text-primary" /></div>;
  if (!inquiry) return <div className="p-8 text-center text-error">Inquiry not found</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(ROUTES.INQUIRIES)}
            className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">Inquiry Details</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={inquiry.status === 'new' ? 'primary' : inquiry.status === 'closed' ? 'gray' : 'success'}>
                {inquiry.status}
              </Badge>
              <span className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                <Clock size={12} /> Received 2 hours ago
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" icon={Phone} onClick={() => window.open(`tel:${inquiry.customerPhone}`)}>Call</Button>
           <Button variant="outline" size="sm" icon={MessageCircle} onClick={openWhatsApp}>WhatsApp</Button>
           {inquiry.status !== 'closed' && (
             <Button variant="outline" size="sm" icon={CheckCircle2} onClick={() => handleStatusChange('closed')}>Mark as Closed</Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inquiry Content */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wider mb-6">Customer Request</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Part Requested</label>
                  <p className="text-lg font-bold text-text-primary">{inquiry.partRequested}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Vehicle Details</label>
                  <p className="text-sm font-bold text-text-primary">{inquiry.vehicleDetails || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Customer Message</label>
                <div className="p-4 bg-surface-2/50 rounded-xl border border-border/50">
                   <p className="text-sm text-text-body italic">"{inquiry.message || 'No additional message.'}"</p>
                </div>
              </div>

              {inquiry.images?.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Reference Images</label>
                  <div className="flex gap-2">
                    {inquiry.images.map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-surface-2 group relative cursor-zoom-in">
                        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Conversation History */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-text-primary pl-1">Conversation</h3>
             <div className="space-y-4">
               {inquiry.replies?.map((reply, i) => (
                 <div key={i} className={`flex ${reply.senderId === shop.id ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                     reply.senderId === shop.id 
                      ? 'bg-navy text-white rounded-tr-none' 
                      : 'bg-surface ring-1 ring-border/50 rounded-tl-none'
                   }`}>
                     <p className="whitespace-pre-wrap">{reply.text}</p>
                     <p className={`text-[10px] mt-2 opacity-60 ${reply.senderId === shop.id ? 'text-right' : 'text-left'}`}>
                       {new Date(reply.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </p>
                   </div>
                 </div>
               ))}
               {!inquiry.replies?.length && (
                 <div className="p-8 text-center bg-surface/50 rounded-2xl border border-dashed border-border">
                   <p className="text-xs text-text-muted font-medium">No replies yet. Send your first response to the customer.</p>
                 </div>
               )}
             </div>
          </div>

          {/* Reply Area */}
          <Card className="p-6 border-none ring-1 ring-border/50">
            <div className="flex flex-wrap gap-2 mb-4">
               {templates.map((t, i) => (
                 <button 
                  key={i} 
                  onClick={() => setReplyText(t.text)}
                  className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[11px] font-bold text-text-secondary transition-colors"
                 >
                   {t.label}
                 </button>
               ))}
               <button 
                onClick={() => setShowQuoteModal(true)}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg text-[11px] font-bold text-primary transition-colors flex items-center gap-1"
               >
                 <Package size={12} /> Generate Quote
               </button>
            </div>
            <textarea 
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response here..."
              className="w-full bg-white border border-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none mb-4"
            />
            <div className="flex justify-end">
               <Button 
                icon={Send} 
                className="px-8 shadow-lg shadow-primary/20" 
                onClick={() => handleReply()} 
                loading={isSending}
                disabled={!replyText.trim()}
               >
                 Send Response
               </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-6">Customer Profile</h3>
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-2xl text-primary border border-primary/10">
                 {inquiry.customerName?.[0] || 'C'}
               </div>
               <div>
                 <h4 className="font-bold text-text-primary">{inquiry.customerName}</h4>
                 <p className="text-[12px] text-text-muted mt-0.5">Customer since Jan 2026</p>
                 <div className="flex items-center gap-1 text-[11px] font-bold text-success mt-1">
                   <CheckCircle2 size={12} /> 12 Successful Orders
                 </div>
               </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-border/50">
               <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Phone Number</label>
                  <p className="text-sm font-bold text-text-primary">{inquiry.customerPhone}</p>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Active Interests</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                     <Badge variant="navy" size="sm">Suspension</Badge>
                     <Badge variant="navy" size="sm">Toyota Corolla</Badge>
                  </div>
               </div>
            </div>
          </Card>

          <Card className="p-6 border-none ring-1 ring-border/50 bg-surface-2">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-4">Internal Notes</h3>
            <textarea 
              rows={3}
              placeholder="Add a private note..."
              className="w-full bg-white border border-border rounded-lg p-3 text-[12px] focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <p className="text-[10px] text-text-muted mt-2">Notes are only visible to your shop staff.</p>
          </Card>
        </div>
      </div>

      {/* Quote Generation Modal */}
      <Modal 
        isOpen={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)}
        title="Generate Part Quote"
      >
        <div className="space-y-4">
          <Input 
            placeholder="Search parts catalog..." 
            icon={Package}
            className="mb-4"
          />
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {shopParts.map(part => (
              <button 
                key={part.id}
                onClick={() => handlePartSelect(part)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border transition-all text-left group"
              >
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-border shrink-0">
                  {part.images?.[0] && <img src={part.images[0]} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-text-primary group-hover:text-primary transition-colors">{part.name}</h4>
                  <p className="text-[11px] text-text-muted">Stock: {part.stock} • LKR {part.price.toLocaleString()}</p>
                </div>
                <Plus size={16} className="text-text-muted group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InquiryDetail;
