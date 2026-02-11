import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { validate } from '../../utils/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import logo from '../../assets/logo.png';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const notify = useNotification();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validate(email, (val) => (!val ? 'Email is required' : null));
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      notify.success('Password reset email sent');
    } catch (err) {
      console.error(err);
      notify.error('Failed to send reset email. Please check the address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-border/50">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="PartsNear" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">Reset Password</h1>
          <p className="text-text-secondary text-sm text-center mt-2">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-success-bg rounded-full flex items-center justify-center text-success mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Check your email</h3>
            <p className="text-text-secondary text-sm mb-8">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
            >
              Try another email
            </Button>
            <Link
              to="/login"
              className="mt-4 text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1.5"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              error={error}
              icon={Mail}
              disabled={loading}
              required
            />

            <Button type="submit" variant="primary" loading={loading} fullWidth>
                Send Reset Link
            </Button>

            <div className="flex justify-center">
              <Link
                to="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
