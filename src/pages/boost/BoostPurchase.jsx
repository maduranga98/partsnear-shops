import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  Crown, 
  MapPin, 
  Search, 
  Check, 
  ArrowRight,
  Eye,
  Info
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const BOOST_TYPES = [
  {
    id: 'spotlight',
    name: 'Spotlight',
    price: 500,
    period: 'week',
    description: 'Priority in search results for specific parts.',
    icon: Search,
    color: 'primary',
    features: ['Search priority', 'LKR 500/week']
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 1500,
    period: 'month',
    description: 'Top placement + "Featured" badge for your shop.',
    icon: ShieldCheck,
    color: 'navy',
    popular: true,
    features: ['Top placement', 'Featured badge', 'LKR 1,500/mo']
  },
  {
    id: 'premium',
    name: 'Premium Placement',
    price: 3000,
    period: 'month',
    description: 'Top placement + badge + larger map pin + homepage.',
    icon: Crown,
    color: 'primary',
    features: ['Homepage visibility', 'Enhanced Map Pin', 'LKR 3,000/mo']
  }
];

const BoostPurchase = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('featured');
  const [selectedPart, setSelectedPart] = useState(null);
  
  const mockParts = [
    { id: 1, name: 'Brake Pads - Toyota Corolla', brand: 'Akebono' },
    { id: 2, name: 'Oil Filter - Nissan', brand: 'Genuine' },
    { id: 3, name: 'Spark Plugs - Honda Civic', brand: 'NGK' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-text-primary flex items-center justify-center gap-3">
          <Zap className="text-primary" fill="currentColor" size={40} />
          Choose Your Boost
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">Get more customers by promoting your shop or specific parts to the top of search results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BOOST_TYPES.map((type) => (
          <div
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`cursor-pointer relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${
              selectedType === type.id
                ? `border-${type.color} bg-${type.color}/5 shadow-xl shadow-${type.color}/10 scale-[1.02]`
                : 'border-border bg-white hover:border-text-muted hover:shadow-md'
            }`}
          >
            {type.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border-4 border-white shadow-sm z-10">
                Most Effective
              </div>
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
              selectedType === type.id ? `bg-${type.color} text-white` : `bg-${type.color}/10 text-${type.color}`
            }`}>
              <type.icon size={24} />
            </div>

            <h3 className="text-xl font-bold text-text-primary">{type.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-text-primary">LKR {type.price.toLocaleString()}</span>
              <span className="text-text-secondary text-xs uppercase font-bold tracking-tighter">/{type.period}</span>
            </div>
            
            <p className="mt-4 text-sm text-text-secondary leading-relaxed h-10">
              {type.description}
            </p>

            <ul className="mt-8 space-y-3 flex-1">
              {type.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold text-text-body">
                  <div className={`w-4 h-4 rounded-full bg-${type.color}/10 flex items-center justify-center shrink-0`}>
                    <Check size={10} className={`text-${type.color}`} strokeWidth={4} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <div className={`mt-8 w-full py-3 rounded-2xl text-center font-bold text-sm transition-all ${
              selectedType === type.id 
                ? `bg-${type.color} text-white shadow-lg` 
                : 'bg-surface-2 text-text-secondary'
            }`}>
              {selectedType === type.id ? 'Selected Option' : 'Select Boost'}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        {/* Selection Area */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Search size={20} className="text-primary" />
              1. What would you like to boost?
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setSelectedPart(null)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${!selectedPart ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white hover:border-text-muted'}`}
              >
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!selectedPart ? 'bg-primary text-white' : 'bg-surface-3 text-text-muted'}`}>
                      <MapPin size={20} />
                   </div>
                   <div className="text-left">
                      <p className="font-bold text-sm text-text-primary">Boost My Shop</p>
                      <p className="text-xs text-text-muted">Promote your entire business listing</p>
                   </div>
                </div>
                {!selectedPart && <Check size={20} className="text-primary" />}
              </button>

              <div className="p-4 rounded-2xl border-2 border-border bg-surface-1/50 space-y-3">
                 <p className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Or Boost a Specific Part</p>
                 <div className="space-y-2">
                    {mockParts.map(part => (
                       <button
                          key={part.id}
                          onClick={() => setSelectedPart(part.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedPart === part.id ? 'border-primary bg-white shadow-sm' : 'border-transparent bg-white/50 hover:bg-white'}`}
                       >
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-text-muted text-[10px] font-bold">IMAGE</div>
                             <div className="text-left leading-tight">
                                <p className="font-bold text-xs text-text-primary">{part.name}</p>
                                <p className="text-[10px] text-text-muted">{part.brand}</p>
                             </div>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              2. Review & Pay
            </h3>
            <Card className="p-6 space-y-6">
               <div className="flex justify-between items-center">
                  <div>
                     <p className="text-xs font-bold text-text-muted uppercase">Selection</p>
                     <p className="font-bold text-text-primary capitalize">{selectedType} Boost</p>
                  </div>
                  <Badge variant="primary">LKR {BOOST_TYPES.find(t => t.id === selectedType).price.toLocaleString()}</Badge>
               </div>
               <Button className="w-full h-12 text-base font-black" onClick={() => navigate('/billing/checkout')}>Proceed to Checkout</Button>
            </Card>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="space-y-4 lg:sticky lg:top-8 self-start">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <Eye size={16} className="text-text-muted" />
                 <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Live Preview</span>
              </div>
              <Badge variant="navy">Search Results</Badge>
           </div>
           
           <div className="bg-surface-2 p-8 rounded-[40px] border border-border shadow-inner relative overflow-hidden">
              {/* Mock Search Input */}
              <div className="absolute top-0 left-0 w-full h-16 bg-white border-b border-border flex items-center px-6 gap-3">
                 <Search size={16} className="text-text-muted" />
                 <div className="h-4 bg-surface-2 rounded-full w-48" />
              </div>

              <div className="mt-12 space-y-4">
                 <p className="text-[10px] font-bold text-text-muted pl-1">Sponsored Results</p>
                 
                 {/* Boosted Card Preview */}
                 <div className={`p-5 rounded-3xl bg-white border-2 transition-all duration-500 shadow-xl ${
                    selectedType === 'premium' ? 'ring-4 ring-primary/20 scale-[1.05]' : 'border-primary ring-2 ring-primary/5'
                 }`}>
                    <div className="flex gap-4">
                       <div className={`rounded-2xl bg-surface-3 flex items-center justify-center text-text-muted font-bold transition-all duration-500 ${
                          selectedType === 'premium' ? 'w-24 h-24 text-xs' : 'w-20 h-20 text-[10px]'
                       }`}>
                          PHOTO
                       </div>
                       <div className="space-y-2 flex-1 pt-1">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                   <h4 className="font-bold text-text-primary text-sm">
                                      {selectedPart ? mockParts.find(p => p.id === selectedPart).name : 'Your Shop Name'}
                                   </h4>
                                   {(selectedType === 'featured' || selectedType === 'premium') && (
                                      <Badge variant="success" className="text-[8px] px-1.5 py-0">FEATURED</Badge>
                                   )}
                                </div>
                                <p className="text-[10px] text-text-muted">Available in Shop • Colombo 10</p>
                             </div>
                             <p className="text-sm font-black text-primary">LKR 4,500</p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4">
                             <div className="h-7 w-20 bg-primary/10 rounded-lg" />
                             <div className="h-7 w-7 bg-surface-3 rounded-lg" />
                          </div>
                       </div>
                    </div>
                    {selectedType === 'premium' && (
                       <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-[10px] text-text-secondary font-medium">
                          <Info size={12} className="text-primary" />
                          Premium placement includes larger display and homepage spotlight.
                       </div>
                    )}
                 </div>

                 <p className="text-[10px] font-bold text-text-muted pl-1 pt-4">Organic Results</p>
                 {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-border opacity-60">
                       <div className="flex gap-3">
                          <div className="w-12 h-12 bg-surface-3 rounded-lg" />
                          <div className="space-y-2 flex-1 pt-1">
                             <div className="h-2 bg-surface-3 rounded w-1/2" />
                             <div className="h-2 bg-surface-2 rounded w-1/3" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BoostPurchase;
