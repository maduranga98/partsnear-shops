import { useState } from 'react';
import { Check, ArrowRight, Zap, Shield, Crown } from 'lucide-react';
import { TIERS } from '../../../config/tiers';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const Step5 = ({ onBack, onNext, loading }) => {
  const [selectedPlan, setSelectedPlan] = useState(TIERS.BASIC);

  const plans = [
    {
      id: TIERS.BASIC,
      name: 'Basic',
      price: '2,500',
      description: 'Ideal for small shops starting out.',
      icon: Zap,
      features: [
        'Up to 500 parts',
        'Inventory Management',
        'Public Store Profile',
        'Basic Dashboard',
        'Email Support',
      ],
      color: 'gray'
    },
    {
      id: TIERS.STANDARD,
      name: 'Standard',
      price: '5,000',
      description: 'Expand your business visibility.',
      icon: Shield,
      features: [
        'Up to 2,000 parts',
        'Everything in Basic',
        'Customer CRM',
        'Advanced Analytics',
        'Staff Management (3 users)',
        'Priority Support',
      ],
      color: 'primary',
      popular: true
    },
    {
      id: TIERS.PREMIUM,
      name: 'Premium',
      price: '10,000',
      description: 'Advanced tools for busy professionals.',
      icon: Crown,
      features: [
        'Unlimited parts',
        'Everything in Standard',
        'POS System',
        'Multi-staff Management',
        'Advanced Reports',
        'Personal Account Manager',
        'Boost (10 per month)',
      ],
      color: 'navy'
    }
  ];

  const handleSubmit = () => {
    onNext({ tier: selectedPlan });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Select Your Plan</h2>
        <p className="text-text-secondary mt-2">Choose the plan that fits your business needs. You can switch any time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`cursor-pointer relative flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 ${
              selectedPlan === plan.id
                ? plan.id === TIERS.PRO ? 'border-navy bg-navy/5' : 'border-primary bg-primary/5'
                : 'border-border bg-white hover:border-text-muted hover:shadow-md'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full border-4 border-white shadow-sm">
                Most Popular
              </div>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              plan.id === TIERS.PRO ? 'bg-navy/10 text-navy' : 'bg-primary/10 text-primary'
            }`}>
              <plan.icon size={24} />
            </div>

            <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-text-primary">LKR {plan.price}</span>
              <span className="text-text-secondary text-sm">/mo</span>
            </div>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed">
              {plan.description}
            </p>

            <ul className="mt-8 space-y-4 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-text-body">
                  <Check size={16} className="text-success mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`mt-8 w-full py-3 rounded-xl font-bold text-sm transition-all ${
                selectedPlan === plan.id
                  ? plan.id === TIERS.PRO ? 'bg-navy text-white shadow-lg' : 'bg-primary text-white shadow-lg'
                  : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-surface-2 p-6 rounded-2xl border border-border text-center">
        <p className="text-sm text-text-secondary italic">
          Looking for a custom solution? <a href="#" className="text-primary font-bold hover:underline">Contact sales</a> for Enterprise pricing and dedicated support.
        </p>
      </div>

      <div className="flex justify-between pt-8 border-t border-border">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleSubmit} loading={loading} icon={Check} iconPosition="right">
          Complete Registration
        </Button>
      </div>
    </div>
  );
};

export default Step5;
