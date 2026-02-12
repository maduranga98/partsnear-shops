import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  CreditCard, 
  ArrowUpRight, 
  Calendar, 
  AlertCircle,
  Package,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { TIER_DETAILS, TIERS } from '../../config/tiers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Subscription = () => {
  const { userTier, subscriptionStatus, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const currentPlan = TIER_DETAILS[userTier] || TIER_DETAILS[TIERS.BASIC];
  const nextRenewal = userProfile?.renewalDate ? new Date(userProfile.renewalDate).toLocaleDateString() : 'Mar 12, 2026'; // Mock for now

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Current Plan Card */}
      <Card className="p-8 border-none ring-1 ring-border/50 bg-gradient-to-br from-white to-surface-2">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <Badge variant="primary" className="px-3 py-1">Current Plan</Badge>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-text-primary capitalize">{currentPlan.name} Plan</h2>
              <p className="text-text-secondary flex items-center gap-2">
                <Calendar size={16} />
                Next renewal on {nextRenewal}
              </p>
            </div>
            
            <div className="flex items-center gap-6 pt-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-text-primary">LKR {currentPlan.price.toLocaleString()}</span>
                <span className="text-xs text-text-muted">per month</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-text-primary">{currentPlan.partsLimit === -1 ? 'Unlimited' : currentPlan.partsLimit}</span>
                <span className="text-xs text-text-muted">parts limit</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button 
              icon={ArrowUpRight} 
              onClick={() => navigate('/billing/plans')}
            >
              Change Plan
            </Button>
            <Button variant="outline" icon={CreditCard}>
              View Receipts
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPlan.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-text-body">
              <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Check size={12} className="text-success" />
              </div>
              {feature}
            </div>
          ))}
        </div>
      </Card>

      {/* Usage Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Parts Usage</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-text-primary">142</span>
              <span className="text-sm text-text-muted">/ {currentPlan.partsLimit === -1 ? '∞' : currentPlan.partsLimit}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Days Left</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-text-primary">28</span>
              <span className="text-sm text-text-muted">days</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          {subscriptionStatus === 'active' ? (
            <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Check size={24} />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
          )}
          <div>
            <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Status</p>
            <span className={`text-xl font-bold capitalize ${subscriptionStatus === 'active' ? 'text-success' : 'text-error'}`}>
              {subscriptionStatus}
            </span>
          </div>
        </Card>
      </div>

      {/* Payment Method */}
      <Card className="p-6">
        <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-primary" />
          General Payment Info
        </h3>
        <div className="bg-surface-2 rounded-xl p-4 flex items-center justify-between border border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-7 bg-navy rounded flex items-center justify-center text-[10px] text-white font-bold">
              VISA
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Visa ending in 4242</p>
              <p className="text-xs text-text-muted">Expires 12/28</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
      </Card>
      
      {/* Cancel Action */}
      <div className="pt-4 text-center">
        <button className="text-sm text-text-muted hover:text-error transition-colors flex items-center gap-2 mx-auto">
          <AlertCircle size={14} />
          Cancel subscription
        </button>
      </div>
    </div>
  );
};

export default Subscription;
