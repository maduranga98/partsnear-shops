import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Shield, Crown, Info } from 'lucide-react';
import { TIERS, TIER_DETAILS } from '../../config/tiers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const PlanComparison = () => {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const navigate = useNavigate();

  const plans = [
    {
      id: TIERS.BASIC,
      name: 'Basic',
      price: billingCycle === 'monthly' ? 2500 : 25000,
      description: 'Ideal for small shops starting out.',
      icon: Zap,
      color: 'gray',
      popular: false
    },
    {
      id: TIERS.STANDARD,
      name: 'Standard',
      price: billingCycle === 'monthly' ? 5000 : 50000,
      description: 'Expand your business visibility.',
      icon: Shield,
      color: 'primary',
      popular: true
    },
    {
      id: TIERS.PREMIUM,
      name: 'Premium',
      price: billingCycle === 'monthly' ? 10000 : 100000,
      description: 'Advanced tools for busy professionals.',
      icon: Crown,
      color: 'navy',
      popular: false
    }
  ];

  const handleSelect = (planId) => {
    navigate(`/billing/checkout?plan=${planId}&cycle=${billingCycle}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-text-primary">Ready to Grow Your Shop?</h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Choose a plan that fits your business. Start small and upgrade as you scale.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-text-primary' : 'text-text-muted'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-14 h-8 bg-surface-3 rounded-full relative p-1 transition-all duration-300 ring-1 ring-border"
          >
            <div className={`w-6 h-6 bg-primary rounded-full shadow-lg transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${billingCycle === 'annual' ? 'text-text-primary' : 'text-text-muted'}`}>Annual</span>
            <Badge variant="success" className="text-[10px] animate-pulse">Save 2 Months</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl ${
              plan.popular
                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                : 'border-border bg-white'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full border-4 border-white shadow-lg">
                Recommended
              </div>
            )}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
              plan.id === TIERS.PREMIUM ? 'bg-navy/10 text-navy' : 'bg-primary/10 text-primary'
            }`}>
              <plan.icon size={28} />
            </div>

            <h3 className="text-2xl font-bold text-text-primary">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-text-primary">LKR {plan.price.toLocaleString()}</span>
              <span className="text-text-secondary text-sm font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <p className="mt-4 text text-text-secondary leading-relaxed h-12">
              {plan.description}
            </p>

            <ul className="mt-10 space-y-5 flex-1">
              {TIER_DETAILS[plan.id].features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px] text-text-body font-medium">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-success" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? 'primary' : 'outline'}
              className="mt-10 w-full py-4 rounded-2xl text-base"
              onClick={() => handleSelect(plan.id)}
            >
              Get Started with {plan.name}
            </Button>
          </div>
        ))}
      </div>

      <Card className="p-8 bg-surface-2 border-dashed border-2 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-full bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-bold text-text-primary">Looking for a custom solution?</h4>
            <p className="text-sm text-text-secondary">Enterprise plans with multi-location support and API access are available.</p>
          </div>
        </div>
        <Button variant="navy" className="whitespace-nowrap rounded-xl">Contact Sales</Button>
      </Card>
      
      <div className="text-center pt-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
};

export default PlanComparison;
