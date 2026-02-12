import { useState } from 'react';
import { ChevronRight, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { VEHICLE_MAKES, PART_CATEGORIES } from '../../../utils/constants';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';

const CONDITIONS = [
  { value: 'brand_new', label: 'Brand New' },
  { value: 'reconditioned', label: 'Reconditioned' },
  { value: 'used', label: 'Used' },
];

const VEHICLE_TYPES = [
  { value: 'Car', label: 'Cars' },
  { value: 'Van', label: 'Vans' },
  { value: 'Suv', label: 'SUVs' },
  { value: 'Truck', label: 'Trucks' },
  { value: 'Bike', label: 'Bikes' },
];

const Step3 = ({ data, onBack, onNext, loading }) => {
  const [formData, setFormData] = useState({
    brands: data.brands || [],
    categories: data.categories || [],
    types: data.types || [],
    conditions: data.conditions || [],
  });

  const toggleItem = (field, value) => {
    setFormData(prev => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter(i => i !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  const SelectionGroup = ({ title, items, field, gridClass = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
        {title}
        {formData[field].length > 0 && (
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {formData[field].length} selected
          </span>
        )}
      </h4>
      <div className={`grid gap-2 ${gridClass}`}>
        {items.map((item) => {
          const value = typeof item === 'string' ? item : item.value;
          const label = typeof item === 'string' ? item : item.label;
          const isSelected = formData[field].includes(value);

          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleItem(field, value)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[13px] font-medium transition-all ${
                isSelected
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-border text-text-secondary hover:border-text-muted'
              }`}
            >
              {label}
              {isSelected && <Check size={14} />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Business Specializations</h2>
        <p className="text-text-secondary mt-2">What kind of parts and vehicles do you specialize in?</p>
      </div>

      <div className="space-y-8">
        <SelectionGroup
          title="Vehicle Categories"
          items={VEHICLE_TYPES}
          field="types"
          gridClass="grid-cols-2 md:grid-cols-5"
        />

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

        <SelectionGroup
          title="Item Conditions"
          items={CONDITIONS}
          field="conditions"
          gridClass="grid-cols-1 sm:grid-cols-3"
        />
      </div>

      <div className="flex justify-between pt-8 border-t border-border">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleSubmit} loading={loading} icon={ArrowRight} iconPosition="right">
          Continue to Quick Add
        </Button>
      </div>
    </div>
  );
};

export default Step3;
