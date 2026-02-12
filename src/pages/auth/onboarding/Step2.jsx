import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Search, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/helpers';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

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

const containerStyle = {
  width: '100%',
  height: '350px'
};

const defaultCenter = {
  lat: 6.9271,
  lng: 79.8612 // Colombo
};

const Step2 = ({ data, onBack, onNext, loading: submitLoading }) => {
  const [formData, setFormData] = useState({
    address: data.address || '',
    district: data.district || 'Colombo',
    lat: data.lat || defaultCenter.lat,
    lng: data.lng || defaultCenter.lng,
  });
  const [errors, setErrors] = useState({});

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onMarkerDragEnd = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setFormData(prev => ({ ...prev, lat: newLat, lng: newLng }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDistrictChange = (option) => {
    setFormData(prev => ({ ...prev, district: option.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.address) {
      setErrors({ address: 'Address is required' });
      return;
    }
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Shop Location</h2>
        <p className="text-text-secondary mt-2">Mark your shop location and provide the address</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Full Address"
            name="address"
            placeholder="No. 123, Main Street..."
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            icon={MapPin}
            required
          />
          <Select
            label="District"
            options={DISTRICTS}
            value={formData.district}
            onChange={handleDistrictChange}
            placeholder="Select District"
            required
          />
          <div className="p-4 bg-surface-2 rounded-lg border border-border">
            <h4 className="text-[12px] font-bold text-text-muted uppercase mb-2">Coordinates (GPS)</h4>
            <div className="flex gap-4 text-[13px] font-medium text-text-primary">
              <div><span className="text-text-secondary">Lat:</span> {formData.lat.toFixed(6)}</div>
              <div><span className="text-text-secondary">Lng:</span> {formData.lng.toFixed(6)}</div>
            </div>
            <p className="text-[11px] text-text-secondary mt-2">Drag the pin on the map to adjust precisely</p>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden relative min-h-[350px]">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lat: formData.lat, lng: formData.lng }}
              zoom={13}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              <Marker
                position={{ lat: formData.lat, lng: formData.lng }}
                draggable={true}
                onDragEnd={onMarkerDragEnd}
                animation={2} // DROP
              />
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2 text-text-muted gap-2">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-sm">Loading Map...</p>
              {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                <p className="text-[10px] text-error px-4 text-center mt-2">
                  Missing Google Maps API Key. Please provide one in .env
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={submitLoading}>
          Back
        </Button>
        <Button onClick={handleSubmit} loading={submitLoading} icon={ArrowRight} iconPosition="right">
          Continue to Specializations
        </Button>
      </div>
    </div>
  );
};

export default Step2;
