import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import logo from '../../assets/logo.png';

// Import all steps
import Step1 from './onboarding/Step1';
import Step2 from './onboarding/Step2';
import Step3 from './onboarding/Step3';
import Step4 from './onboarding/Step4';
import Step5 from './onboarding/Step5';

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Specializations' },
  { id: 4, title: 'First Parts' },
  { id: 5, title: 'Plan' },
];

const Onboarding = () => {
  const { userProfile, loading: authLoading, updateProfile } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync state with user profile once it's loaded
  useEffect(() => {
    if (userProfile && !initialized) {
      if (userProfile.onboardingStep && typeof userProfile.onboardingStep === 'number') {
        setCurrentStep(userProfile.onboardingStep);
      }
      if (userProfile.onboardingData) {
        setOnboardingData(userProfile.onboardingData);
      }
      setInitialized(true);
    }
  }, [userProfile, initialized]);

  const handleNext = async (stepData) => {
    const newData = { ...onboardingData, ...stepData };
    setOnboardingData(newData);
    
    setLoading(true);
    try {
      if (currentStep < STEPS.length) {
        const nextStep = currentStep + 1;
        await updateProfile({
          onboardingStep: nextStep,
          onboardingData: newData
        });
        setCurrentStep(nextStep);
        window.scrollTo(0, 0);
      } else {
        // Final completion
        await updateProfile({
          onboardingStep: 'completed',
          onboardingData: newData,
          onboarded: true,
          tier: newData.tier || 'free'
        });
        notify.success('Onboarding complete! Welcome to PartsNear.');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      notify.error('Failed to save progress');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  if (authLoading || (!initialized && userProfile)) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-text-secondary font-medium">Preparing your setup...</p>
      </div>
    </div>
  );

  // If already onboarded, redirect away
  if (userProfile?.onboarded) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col py-12 px-4 sm:px-6">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex flex-col items-center mb-12">
          <img src={logo} alt="PartsNear" className="h-10 w-auto mb-8" />
          
          {/* Progress Bar Container */}
          <div className="w-full relative">
            {/* Background Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-10" />
            
            {/* Progress Line */}
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-700 ease-in-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {/* Steps Icons */}
            <div className="flex justify-between w-full">
              {STEPS.map((step) => (
                <div key={step.id} className="flex flex-col items-center group">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ring-4 ring-surface ${
                      currentStep > step.id 
                      ? 'bg-success border-success text-white shadow-success/20' 
                      : currentStep === step.id
                      ? 'bg-white border-primary text-primary shadow-xl shadow-primary/20 scale-110 z-10'
                      : 'bg-white border-border text-text-muted'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={20} strokeWidth={3} /> : <span className="text-[14px] font-bold">{step.id}</span>}
                  </div>
                  <span className={`mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                    currentStep === step.id ? 'text-primary' : 'text-text-muted'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          <Card className="p-8 sm:p-12 shadow-2xl border-none ring-1 ring-border/50">
            {currentStep === 1 && (
              <Step1 
                data={onboardingData} 
                onNext={handleNext} 
                loading={loading} 
              />
            )}
            {currentStep === 2 && (
              <Step2 
                data={onboardingData} 
                onBack={handleBack} 
                onNext={handleNext} 
                loading={loading} 
              />
            )}
            {currentStep === 3 && (
              <Step3 
                data={onboardingData} 
                onBack={handleBack} 
                onNext={handleNext} 
                loading={loading} 
              />
            )}
            {currentStep === 4 && (
              <Step4 
                data={onboardingData} 
                onBack={handleBack} 
                onNext={handleNext} 
                loading={loading} 
              />
            )}
            {currentStep === 5 && (
              <Step5 
                data={onboardingData} 
                onBack={handleBack} 
                onNext={handleNext} 
                loading={loading} 
              />
            )}
          </Card>
          
          {/* Subtle decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-navy/5 rounded-full blur-3xl -z-10" />
        </div>

        <div className="mt-12 text-center text-[12px] text-text-muted flex flex-col items-center gap-2">
          <p>© 2026 PartsNear. Built for auto professionals.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
