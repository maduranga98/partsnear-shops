import { useState, useEffect } from 'react';
import { 
  Info, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  Clock, 
  Settings, 
  Save, 
  Eye, 
  QrCode, 
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useShop } from '../../context/ShopContext';
import { updateShopProfile, calculateProfileCompletion } from '../../services/shop';
import { uploadFile } from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import ImageUpload from '../../components/ui/ImageUpload';
import Select from '../../components/ui/Select';
import { VEHICLE_MAKES, PART_CATEGORIES } from '../../utils/constants';
import { copyToClipboard } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import ProfilePreview from './ProfilePreview';

const DISTRICTS = [
  { value: 'Colombo', label: 'Colombo' },
  { value: 'Gampaha', label: 'Gampaha' },
  { value: 'Kalutara', label: 'Kalutara' },
  { value: 'Kandy', label: 'Kandy' },
  { value: 'Matale', label: 'Matale' },
  { value: 'Nuwara Eliya', label: 'Nuwara Eliya' },
  { value: 'Galle', label: 'Galle' },
  { value: 'Matara', label: 'Matara' },
  { value: 'Hambantota', label: 'Hambantota' },
  { value: 'Jaffna', label: 'Jaffna' },
  { value: 'Kilinochchi', label: 'Kilinochchi' },
  { value: 'Mannar', label: 'Mannar' },
  { value: 'Vavuniya', label: 'Vavuniya' },
  { value: 'Mullaitivu', label: 'Mullaitivu' },
  { value: 'Batticaloa', label: 'Batticaloa' },
  { value: 'Ampara', label: 'Ampara' },
  { value: 'Trincomalee', label: 'Trincomalee' },
  { value: 'Kurunegala', label: 'Kurunegala' },
  { value: 'Puttalam', label: 'Puttalam' },
  { value: 'Anuradhapura', label: 'Anuradhapura' },
  { value: 'Polonnaruwa', label: 'Polonnaruwa' },
  { value: 'Badulla', label: 'Badulla' },
  { value: 'Moneragala', label: 'Moneragala' },
  { value: 'Ratnapura', label: 'Ratnapura' },
  { value: 'Kegalle', label: 'Kegalle' },
];

// Sub-components for Tabs
// Note: These will be extracted to separate files if they become too large
const MediaTab = ({ shop, onUpdate }) => {
  const [logo, setLogo] = useState(shop?.logo || null);
  const [coverPhoto, setCoverPhoto] = useState(shop?.coverPhoto || null);
  const [gallery, setGallery] = useState(shop?.gallery || []);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {};
      
      if (logo instanceof File) {
        updates.logo = await uploadFile(logo, `shops/${shop.id}/branding`);
      }
      if (coverPhoto instanceof File) {
        updates.coverPhoto = await uploadFile(coverPhoto, `shops/${shop.id}/branding`);
      }
      
      // Handle gallery uploads
      const galleryUrls = await Promise.all(
        gallery.map(item => item instanceof File ? uploadFile(item, `shops/${shop.id}/gallery`) : item)
      );
      updates.gallery = galleryUrls;

      await onUpdate(updates);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageUpload
          label="Shop Logo"
          value={logo}
          onChange={setLogo}
          helperText="Recommended: Square, min 400x400px"
        />
        <ImageUpload
          label="Cover Photo"
          value={coverPhoto}
          onChange={setCoverPhoto}
          helperText="Recommended: 1200x400px"
        />
      </div>
      
      <div className="space-y-4">
        <ImageUpload
          label="Shop Gallery"
          value={gallery}
          onChange={setGallery}
          multiple
          maxFiles={10}
          helperText="Upload photos of your shop, equipment, and team (Max 10)"
        />
      </div>

      <Button onClick={handleSave} loading={loading} icon={Save}>
        Save Media
      </Button>
    </div>
  );
};

const BasicInfoTab = ({ shop, onUpdate }) => {
  const [formData, setFormData] = useState({
    shopName: shop?.shopName || '',
    tagline: shop?.tagline || '',
    description: shop?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Input
        label="Shop Name"
        name="shopName"
        value={formData.shopName}
        onChange={handleChange}
        placeholder="Enter your shop's full name"
        required
      />
      <Input
        label="Tagline"
        name="tagline"
        value={formData.tagline}
        onChange={handleChange}
        placeholder="A short punchy line for your shop"
      />
      <div className="space-y-1.5">
        <label className="text-[13px] font-bold text-text-primary">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full bg-white border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          placeholder="Describe what your shop does, your history, and expertise..."
        />
      </div>
      <Button 
        onClick={handleSave} 
        loading={loading} 
        icon={Save}
        className="w-full sm:w-auto"
      >
        Save Changes
      </Button>
    </div>
  );
};

const ContactTab = ({ shop, onUpdate }) => {
  const [formData, setFormData] = useState({
    phones: shop?.phones || [shop?.phone || ''],
    email: shop?.email || '',
    whatsapp: shop?.whatsapp || '',
    facebook: shop?.facebook || '',
  });
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const addPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const removePhone = (index) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <label className="text-[13px] font-bold text-text-primary">Phone Numbers</label>
        {formData.phones.map((phone, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={phone}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              placeholder="+94 77 123 4567"
              className="flex-1"
            />
            {formData.phones.length > 1 && (
              <Button 
                variant="ghost" 
                onClick={() => removePhone(index)}
                className="text-error hover:text-error hover:bg-error/5"
              >
                Delete
              </Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addPhone} className="text-[12px]">
          + Add Another Phone
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Business Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="shop@example.com"
        />
        <Input
          label="WhatsApp Number"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="+94 77 123 4567"
        />
      </div>

      <Input
        label="Facebook Page URL"
        name="facebook"
        value={formData.facebook}
        onChange={handleChange}
        placeholder="https://facebook.com/yourshop"
      />

      <Button onClick={handleSave} loading={loading} icon={Save}>
        Save Contact Info
      </Button>
    </div>
  );
};

const HoursTab = ({ shop, onUpdate }) => {
  const defaultHours = {
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '08:00', close: '14:00', closed: false },
    sunday: { open: '08:00', close: '14:00', closed: true },
  };

  const [hours, setHours] = useState(shop?.hours || defaultHours);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  };

  const updateTime = (day, field, value) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({ hours });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="divide-y divide-border border rounded-xl overflow-hidden bg-white">
        {Object.keys(hours).map((day) => (
          <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-4 min-w-[120px]">
              <div 
                onClick={() => toggleDay(day)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                  !hours[day].closed ? 'bg-success' : 'bg-border'
                }`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${
                  !hours[day].closed ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className="text-sm font-bold text-text-primary capitalize">{day}</span>
            </div>

            {!hours[day].closed ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={hours[day].open}
                  onChange={(e) => updateTime(day, 'open', e.target.value)}
                  className="bg-surface-2 border border-border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="text-text-muted">to</span>
                <input
                  type="time"
                  value={hours[day].close}
                  onChange={(e) => updateTime(day, 'close', e.target.value)}
                  className="bg-surface-2 border border-border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ) : (
              <span className="text-sm text-text-muted font-medium">Closed</span>
            )}
          </div>
        ))}
      </div>

      <Button onClick={handleSave} loading={loading} icon={Save}>
        Save Schedule
      </Button>
    </div>
  );
};

const SpecializationsTab = ({ shop, onUpdate }) => {
  const [formData, setFormData] = useState({
    brands: shop?.brands || [],
    categories: shop?.categories || [],
    types: shop?.types || [],
    conditions: shop?.conditions || [],
  });
  const [loading, setLoading] = useState(false);

  const toggleItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter(i => i !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  const SelectionGroup = ({ title, items, field }) => (
    <div className="space-y-4">
      <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = formData[field].includes(item);
          return (
            <button
              key={item}
              onClick={() => toggleItem(field, item)}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white border-border text-text-secondary hover:border-text-muted'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-4xl">
      <SelectionGroup
        title="Vehicle Brands"
        items={VEHICLE_MAKES}
        field="brands"
      />
      <SelectionGroup
        title="Part Categories"
        items={PART_CATEGORIES}
        field="categories"
      />
      
      <Button onClick={handleSave} loading={loading} icon={Save}>
        Save Specializations
      </Button>
    </div>
  );
};

const QRModal = ({ isOpen, onClose, shop }) => {
  const shopUrl = `https://partsnear.lk/shop/${shop?.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shopUrl)}`;

  const handleDownload = async () => {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${shop?.shopName || 'shop'}-qr.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shop QR Code" size="sm">
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="p-4 bg-white rounded-2xl shadow-xl ring-1 ring-border">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>
        <div className="text-center">
          <p className="text-sm text-text-secondary">Scan to visit your shop profile</p>
          <p className="text-[12px] font-medium text-text-muted mt-1 truncate max-w-xs">{shopUrl}</p>
        </div>
        <Button onClick={handleDownload} className="w-full">Download QR Code</Button>
      </div>
    </Modal>
  );
};

const EditProfile = () => {
  const { shop, refreshShop } = useShop();
  const notify = useNotification();
  const [completion, setCompletion] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (shop) {
      setCompletion(calculateProfileCompletion(shop));
    }
  }, [shop]);

  const handleUpdate = async (data) => {
    try {
      await updateShopProfile(shop.id, data);
      await refreshShop();
      notify.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      notify.error('Failed to update profile');
    }
  };

  const handleCopyLink = async () => {
    const url = `https://partsnear.lk/shop/${shop?.id}`;
    if (await copyToClipboard(url)) {
      notify.success('Link copied to clipboard');
    }
  };

  const tabs = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: Info,
      content: <BasicInfoTab shop={shop} onUpdate={handleUpdate} />
    },
    {
      id: 'media',
      label: 'Media',
      icon: ImageIcon,
      content: <MediaTab shop={shop} onUpdate={handleUpdate} />
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      content: <LocationTab shop={shop} onUpdate={handleUpdate} />
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Phone,
      content: <ContactTab shop={shop} onUpdate={handleUpdate} />
    },
    {
      id: 'hours',
      label: 'Hours',
      icon: Clock,
      content: <HoursTab shop={shop} onUpdate={handleUpdate} />
    },
    {
      id: 'specializations',
      label: 'Specializations',
      icon: Settings,
      content: <SpecializationsTab shop={shop} onUpdate={handleUpdate} />
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Shop Profile</h1>
          <p className="text-text-secondary mt-1">Manage how your shop appears to customers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Eye} onClick={() => setIsPreviewOpen(true)}>Preview</Button>
          <Button variant="outline" icon={QrCode} onClick={() => setIsQRModalOpen(true)}>QR Code</Button>
          <Button icon={Share2} onClick={handleCopyLink}>Share Link</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Stats & Completion */}
        <div className="space-y-6">
          <Card className="p-6 overflow-hidden relative border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              Profile Completion
              {completion === 100 && <CheckCircle2 size={16} className="text-success" />}
            </h3>
            
            <div className="relative h-4 bg-surface-2 rounded-full overflow-hidden mb-2">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span className={completion < 70 ? 'text-warning' : 'text-success'}>
                {completion}% Complete
              </span>
              <span className="text-text-muted">100% Recommended</span>
            </div>

            {completion < 100 && (
              <div className="mt-4 p-3 bg-warning/5 rounded-lg border border-warning/10 flex gap-2">
                <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                <p className="text-[11px] text-warning-dark font-medium leading-relaxed">
                  Complete your profile to increase your visibility in search results.
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 border-none ring-1 ring-border/50">
            <h3 className="text-sm font-bold text-text-primary mb-4">Public Info</h3>
            <div className="space-y-4">
              <div className="text-[12px]">
                <p className="text-text-muted font-bold uppercase tracking-wider mb-1">Public URL</p>
                <div className="bg-surface-2 p-2 rounded border border-border flex items-center justify-between group">
                  <span className="text-text-primary truncate mr-2">partsnear.lk/shop/{shop?.id?.slice(0, 8)}</span>
                  <button 
                    onClick={handleCopyLink}
                    className="text-primary hover:text-primary-dark font-bold shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="text-[12px]">
                <p className="text-text-muted font-bold uppercase tracking-wider mb-1">Subscription Tier</p>
                <Badge variant={shop?.tier === 'pro' ? 'navy' : shop?.tier === 'basic' ? 'primary' : 'gray'}>
                  {shop?.tier?.toUpperCase() || 'FREE'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="lg:col-span-3">
          <Card className="border-none ring-1 ring-border/50 overflow-hidden">
            <Tabs 
              tabs={tabs} 
              variant="underline" 
              className="p-1 px-4"
              contentClassName="p-6 sm:p-8"
            />
          </Card>
        </div>
      </div>
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        variant="fullscreen"
        title="Profile Preview"
      >
        <ProfilePreview shop={shop} />
      </Modal>

      <QRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        shop={shop} 
      />
    </div>
  );
};

export default EditProfile;
