import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Building2, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Tag,
  Loader2
} from 'lucide-react';
import { TIERS, TIER_DETAILS } from '../../config/tiers';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const notify = useNotification();

  const planId = searchParams.get('plan') || TIERS.BASIC;
  const billingCycle = searchParams.get('cycle') || 'monthly';
  
  const [method, setMethod] = useState('card'); // 'card' or 'bank'
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const plan = TIER_DETAILS[planId];
  const originalPrice = billingCycle === 'monthly' ? plan.price : plan.price * 10; // 10 months for 12 months
  const [total, setTotal] = useState(originalPrice);

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setTotal(originalPrice * 0.9);
      setPromoApplied(true);
      notify.success('Promo code applied! 10% discount.');
    } else {
      notify.error('Invalid promo code');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (method === 'card') {
        // PayHere Integration logic would go here
        // For now, we simulate success
        await new Promise(r => setTimeout(r, 2000));
      } else {
        if (!receipt) {
          notify.error('Please upload your bank transfer receipt');
          setLoading(false);
          return;
        }
        // Upload receipt logic
        await new Promise(r => setTimeout(r, 2000));
      }

      // Update user tier
      await updateProfile({
        tier: planId,
        subscriptionStatus: method === 'card' ? 'active' : 'pending_verification',
        subscriptionCycle: billingCycle,
        lastPaymentAmount: total,
        lastPaymentDate: new Date().toISOString(),
        renewalDate: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
      });

      notify.success(method === 'card' ? 'Subscription activated!' : 'Receipt uploaded. We will verify it shortly.');
      navigate('/settings/subscription');
    } catch (err) {
      notify.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>Back</Button>
        <h1 className="text-2xl font-black text-text-primary">Finish Your Subscription</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Selection */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Payment Method
            </h3>

            <div className="grid gap-3">
              <button
                onClick={() => setMethod('card')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  method === 'card' ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-text-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'card' ? 'bg-primary text-white' : 'bg-surface-3 text-text-muted'}`}>
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-text-primary">Pay with Card</p>
                    <p className="text-xs text-text-muted">Visa, Mastercard via PayHere</p>
                  </div>
                </div>
                {method === 'card' && <CheckCircle2 size={20} className="text-primary" />}
              </button>

              <button
                onClick={() => setMethod('bank')}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  method === 'bank' ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-text-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${method === 'bank' ? 'bg-primary text-white' : 'bg-surface-3 text-text-muted'}`}>
                    <Building2 size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-text-primary">Bank Transfer</p>
                    <p className="text-xs text-text-muted">LKR bank deposit or transfer</p>
                  </div>
                </div>
                {method === 'bank' && <CheckCircle2 size={20} className="text-primary" />}
              </button>
            </div>

            {method === 'bank' && (
              <div className="mt-6 p-4 bg-surface-2 rounded-2xl border border-dashed border-border space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-text-muted uppercase">Bank Details</p>
                  <p className="text-sm font-bold text-text-primary">Commercial Bank</p>
                  <p className="text-sm text-text-secondary">Acc: 1000234567 | PartsNear PVT LTD</p>
                  <p className="text-xs text-text-muted italic">Include shop name in reference</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-muted uppercase">Upload Receipt</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-white transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={24} className="text-text-muted mb-2" />
                      <p className="text-xs text-text-muted">{receipt ? receipt.name : 'Click to upload receipt'}</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setReceipt(e.target.files[0])}
                      accept="image/*,.pdf"
                    />
                  </label>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4">
              <Tag size={20} className="text-primary" />
              Promo Code
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                disabled={promoApplied}
                className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={applyPromo}
                disabled={promoApplied || !promoCode}
              >
                {promoApplied ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-8 bg-navy text-white space-y-8 sticky top-6 overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="relative">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{plan.name} Plan</p>
                    <p className="text-sm text-white/60 capitalize">{billingCycle} Billing</p>
                  </div>
                  <p className="font-bold">LKR {originalPrice.toLocaleString()}</p>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center text-primary-light">
                    <p className="text-sm">Promo Discount (10%)</p>
                    <p className="text-sm">- LKR {(originalPrice * 0.1).toLocaleString()}</p>
                  </div>
                )}

                <div className="h-px bg-white/10 my-6" />

                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">Total Amount</p>
                  <p className="text-3xl font-black">LKR {total.toLocaleString()}</p>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 size={16} className="text-primary" />
                    Instant feature unlock
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle2 size={16} className="text-primary" />
                    Secure encrypted payment
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full py-4 text-base relative z-10"
              onClick={handleCheckout}
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {method === 'card' ? 'Pay & Activate' : 'Upload & Submit'}
            </Button>

            <p className="text-[10px] text-white/40 text-center relative z-10">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
