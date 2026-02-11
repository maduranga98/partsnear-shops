import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User, Store } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { validate, validators } from '../../utils/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import logo from '../../assets/logo.png';

const Register = () => {
  const { register } = useAuth();
  const notify = useNotification();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    shopName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    newErrors.displayName = validate(formData.displayName, validators.required);
    newErrors.shopName = validate(formData.shopName, validators.required);
    newErrors.email = validate(formData.email, validators.required, validators.email);
    newErrors.phone = validate(formData.phone, validators.required, validators.phone);
    newErrors.password = validate(formData.password, validators.required, validators.password);
    newErrors.confirmPassword = validate(formData.confirmPassword, validators.required, validators.confirmPassword(formData.password));

    // Filter out nulls
    Object.keys(newErrors).forEach(key => {
        if (!newErrors[key]) delete newErrors[key];
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        phone: formData.phone,
        shopName: formData.shopName,
      });
      notify.success('Account created! Please verify your email.');
      navigate('/verify-email');
    } catch (err) {
      console.error(err);
      if (err.message.includes('email-already-in-use')) {
        setErrors({ email: 'Email already in use' });
      } else {
        notify.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4 py-8">
      <Card className="w-full max-w-lg p-8 shadow-xl border-border/50">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="PartsNear" className="h-12 w-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary">Create an Account</h1>
          <p className="text-text-secondary text-sm">Join PartsNear to grow your business</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your Name"
              name="displayName"
              placeholder="John Doe"
              value={formData.displayName}
              onChange={handleChange}
              error={errors.displayName}
              icon={User}
              disabled={loading}
              required
            />
            <Input
              label="Shop Name"
              name="shopName"
              placeholder="Auto Parts Pro"
              value={formData.shopName}
              onChange={handleChange}
              error={errors.shopName}
              icon={Store}
              disabled={loading}
              required
            />
          </div>

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            disabled={loading}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
            disabled={loading}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              disabled={loading}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={Lock}
              disabled={loading}
              required
            />
          </div>

          <div className="text-xs text-text-secondary mt-2">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </div>

          <Button type="submit" variant="primary" loading={loading} fullWidth className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
