import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import logo from '../../assets/logo.png';

const VerifyEmail = () => {
  const { user, isEmailVerified, resendVerification, logout, refreshProfile } = useAuth();
  const notify = useNotification();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // If already verified, redirect to dashboard
  if (isEmailVerified) {
    return <Navigate to="/" replace />;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerification();
      notify.success('Verification email sent!');
    } catch (err) {
      console.error(err);
      if (err.message.includes('too-many-requests')) {
        notify.error('Please wait before requesting another email.');
      } else {
        notify.error('Failed to send verification email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await user.reload();
      await refreshProfile();
      if (user.emailVerified) {
        notify.success('Email verified successfully!');
      } else {
        notify.info('Email not yet verified. Please check your inbox.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-border/50 text-center">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="PartsNear" className="h-12 w-auto mb-4" />
          <div className="w-16 h-16 bg-primary-bg rounded-full flex items-center justify-center text-primary mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Verify your email</h1>
          <p className="text-text-secondary text-sm mt-2">
            We've sent a verification link to <strong>{user.email}</strong>.
            Please click on the link to verify your account.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <Button 
            variant="primary" 
            onClick={handleCheckStatus} 
            loading={checking}
            icon={RefreshCw}
          >
            I've verified my email
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleResend} 
            loading={loading}
          >
            Resend verification email
          </Button>

          <div className="mt-6 pt-6 border-t border-border">
             <button 
                onClick={logout}
                className="text-sm text-text-secondary hover:text-text-primary flex items-center justify-center gap-1.5 mx-auto transition-colors"
             >
                <LogOut size={16} /> Sign Out
             </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
