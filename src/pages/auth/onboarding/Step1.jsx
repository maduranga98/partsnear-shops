import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Store, Phone, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../context/NotificationContext';
import { validate, validators } from '../../../utils/validators';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const Step1 = ({ data, onNext, loading }) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    shopName: data.shopName || userProfile?.shopName || '',
    displayName: data.displayName || userProfile?.displayName || '',
    phone: data.phone || userProfile?.phone || '',
    email: data.email || userProfile?.email || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    newErrors.shopName = validate(formData.shopName, validators.required);
    newErrors.displayName = validate(formData.displayName, validators.required);
    newErrors.phone = validate(formData.phone, validators.required, validators.phone);
    newErrors.email = validate(formData.email, validators.required, validators.email);

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Basic Information</h2>
        <p className="text-text-secondary mt-2">Let's start with your shop and contact details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Shop Name"
          name="shopName"
          placeholder="e.g. PartsNear Auto Parts"
          value={formData.shopName}
          onChange={handleChange}
          error={errors.shopName}
          icon={Store}
          required
        />
        <Input
          label="Owner/Manager Name"
          name="displayName"
          placeholder="e.g. John Doe"
          value={formData.displayName}
          onChange={handleChange}
          error={errors.displayName}
          icon={User}
          required
        />
        <Input
          label="Contact Phone"
          name="phone"
          type="tel"
          placeholder="+1234567890"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          icon={Phone}
          required
        />
        <Input
          label="Contact Email"
          name="email"
          type="email"
          placeholder="shop@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
          required
          disabled={true} // Email usually comes from auth and shouldn't change here
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" loading={loading} icon={ArrowRight} iconPosition="right">
          Continue to Location
        </Button>
      </div>
    </form>
  );
};

export default Step1;
