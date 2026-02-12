import React from 'react';
import { Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Card from './Card';
import { cn } from '../../utils/helpers';

const FeatureLock = ({ 
  title, 
  description, 
  features = [], 
  previewImage, 
  requiredTier = 'Pro' 
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[600px] w-full rounded-3xl overflow-hidden border border-border/50 bg-surface-1">
      {/* Background Preview (Blured) */}
      <div className="absolute inset-0 opacity-40 grayscale-[0.5] blur-md pointer-events-none select-none">
        {previewImage ? (
          <img src={previewImage} alt="Feature Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-surface-2 grid grid-cols-3 gap-4 p-8">
             {[...Array(6)].map((_, i) => (
               <Card key={i} className="h-40 bg-white/50 border-none shadow-sm" />
             ))}
          </div>
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-gradient-to-b from-transparent via-surface-1/80 to-surface-1">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest border border-primary/20">
              <Sparkles size={14} /> Premium Feature
           </div>
           
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-text-primary tracking-tighter sm:text-5xl">
                {title}
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed max-w-lg mx-auto">
                {description}
              </p>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white/50 border border-border/50">
                   <div className="p-1.5 rounded-lg bg-success/10 text-success">
                      <ShieldCheck size={16} />
                   </div>
                   <span className="text-sm font-bold text-text-primary">{f}</span>
                </div>
              ))}
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-10 h-14 text-lg font-black" 
                onClick={() => navigate('/subscription')}
                icon={ArrowRight}
              >
                Upgrade to {requiredTier}
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto h-14 font-bold"
                onClick={() => navigate(-1)}
              >
                Learn More
              </Button>
           </div>
           
           <div className="flex items-center justify-center gap-2 text-text-muted text-xs font-bold">
              <Lock size={12} /> Securely locked for your current plan
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureLock;
