import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { validate } from '../../utils/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import logo from '../../assets/logo.png';

const Login = () => {
  const { login, googleSignIn, phoneLogin, verifyOTP } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const emailError = validate(email, (val) => (!val ? 'Email is required' : null));
    const passwordError = validate(password, (val) => (!val ? 'Password is required' : null));

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      notify.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      notify.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await googleSignIn();
      notify.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      notify.error('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return;
    }

    setLoading(true);
    try {
        // In a real app, you'd likely format the phone number to E.164
      const result = await phoneLogin(phone, 'recaptcha-container');
      setConfirmationResult(result);
      notify.success('OTP sent successfully');
      setErrors({});
    } catch (err) {
      console.error(err);
      notify.error('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: 'Please enter the OTP' });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(confirmationResult, otp);
      notify.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      notify.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const emailContent = (
    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mt-4">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
            setEmail(e.target.value);
            setErrors({ ...errors, email: null });
        }}
        error={errors.email}
        icon={Mail}
        disabled={loading}
      />
      <div className="flex flex-col gap-1.5">
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: null });
          }}
          error={errors.password}
          icon={Lock}
          disabled={loading}
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-[12px] text-primary hover:text-primary-dark font-medium transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
      <Button type="submit" variant="primary" loading={loading} fullWidth className="mt-2">
        Sign In
      </Button>
    </form>
  );

  const phoneContent = (
    <div className="mt-4">
      {!confirmationResult ? (
        <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => {
                setPhone(e.target.value);
                setErrors({ ...errors, phone: null });
            }}
            error={errors.phone}
            icon={Phone}
            disabled={loading}
          />
          <div id="recaptcha-container"></div>
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Send OTP
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
          <Input
            label="Enter OTP"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => {
                setOtp(e.target.value);
                setErrors({ ...errors, otp: null });
            }}
            error={errors.otp}
            disabled={loading}
            className="text-center tracking-widest text-lg"
          />
          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Verify & Sign In
          </Button>
          <button
            type="button"
            onClick={() => {
                setConfirmationResult(null);
                setOtp('');
            }}
            className="text-[12px] text-text-secondary hover:text-text-primary underline text-center"
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-border/50">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="PartsNear" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary text-sm">Sign in to your account</p>
        </div>

        <Tabs
          tabs={[
            { id: 'email', label: 'Email', icon: Mail, content: emailContent },
            { id: 'phone', label: 'Phone', icon: Phone, content: phoneContent },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          className="w-full"
          contentClassName="mt-6"
        />

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-text-muted">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          fullWidth
          onClick={handleGoogleLogin}
          disabled={loading}
          className="relative"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
