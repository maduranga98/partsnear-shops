import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  ChevronLeft,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { addPart, updatePart, getPart } from '../../services/parts';
import { uploadFile } from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { 
  VEHICLE_MAKES, 
  PART_CATEGORIES, 
  PART_SUB_CATEGORIES, 
  PART_SPECIFICATIONS,
  PART_CONDITIONS,
  PART_TYPES,
  PART_STATUS
} from '../../utils/constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ImageUpload from '../../components/ui/ImageUpload';
import Badge from '../../components/ui/Badge';

const AddPart = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const { id } = useParams();
  const notify = useNotification();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    brand: '',
    partNumber: '',
    type: 'Aftermarket',
    condition: 'New',
    description: '',
    price: '',
    discountPrice: '',
    stock: 0,
    images: [],
    compatibility: [{ make: '', model: '', yearStart: '', yearEnd: '' }],
    specifications: {},
    status: PART_STATUS.ACTIVE,
  });

  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [categorySpecs, setCategorySpecs] = useState([]);

  useEffect(() => {
    const fetchPart = async () => {
      if (id) {
        setLoading(true);
        try {
          const partData = await getPart(id);
          if (partData) {
            setFormData({
              ...partData,
              price: partData.price.toString(),
              discountPrice: partData.discountPrice?.toString() || '',
              stock: partData.stock.toString(),
            });
          }
        } catch (error) {
          console.error(error);
          notify.error('Failed to fetch part details');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPart();
  }, [id]);

  useEffect(() => {
    if (formData.category) {
      setAvailableSubCategories(PART_SUB_CATEGORIES[formData.category] || []);
      setCategorySpecs(PART_SPECIFICATIONS[formData.category] || []);
      // Reset subcategory and specs when category changes
      setFormData(prev => ({ 
        ...prev, 
        subCategory: '', 
        specifications: {} 
      }));
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [name]: value }
    }));
  };

  const handleCompatibilityChange = (index, field, value) => {
    const newCompatibility = [...formData.compatibility];
    newCompatibility[index][field] = value;
    setFormData(prev => ({ ...prev, compatibility: newCompatibility }));
  };

  const addCompatibilityRow = () => {
    setFormData(prev => ({
      ...prev,
      compatibility: [...prev.compatibility, { make: '', model: '', yearStart: '', yearEnd: '' }]
    }));
  };

  const removeCompatibilityRow = (index) => {
    const newComp = formData.compatibility.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, compatibility: newComp }));
  };

  const handleSubmit = async (e, forceStatus) => {
    if (e) e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      notify.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        shopId: shop.id,
        status: forceStatus || formData.status,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock),
      };

      if (isEdit) {
        await updatePart(id, dataToSave);
        notify.success('Part updated successfully');
      } else {
        await addPart(dataToSave);
        notify.success('Part added successfully');
      }
      navigate(ROUTES.PARTS);
    } catch (error) {
      console.error(error);
      notify.error('Failed to save part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(ROUTES.PARTS)}
            className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight">
              {isEdit ? 'Edit Part' : 'Add New Part'}
            </h1>
            <p className="text-text-secondary text-sm">Fill in the details to list your item in the catalog</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => handleSubmit(null, PART_STATUS.DRAFT)}>
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} loading={loading} icon={Save}>
            {isEdit ? 'Update Part' : 'Publish Part'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px]">1</span>
              Basic Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Part Name / Title"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Brake Pads for Toyota Corolla 2020"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  options={PART_CATEGORIES.map(c => ({ value: c, label: c }))}
                  value={formData.category}
                  onChange={(opt) => setFormData(prev => ({ ...prev, category: opt.value }))}
                  placeholder="Select Category"
                  required
                />
                <Select
                  label="Sub-category"
                  options={availableSubCategories.map(c => ({ value: c, label: c }))}
                  value={formData.subCategory}
                  onChange={(opt) => setFormData(prev => ({ ...prev, subCategory: opt.value }))}
                  disabled={!formData.category}
                  placeholder="Select Sub-category"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Brand / Manufacturer"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Bosch, Brembo, Genuine"
                />
                <Input
                  label="Part Number / OEM Number"
                  name="partNumber"
                  value={formData.partNumber}
                  onChange={handleChange}
                  placeholder="e.g. 04465-02390"
                />
              </div>
            </div>
          </Card>

          {/* Dynamic Specifications */}
          {categorySpecs.length > 0 && (
            <Card className="p-6 space-y-6">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px]">2</span>
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categorySpecs.map((spec) => (
                  <div key={spec.name}>
                    {spec.type === 'select' ? (
                      <Select
                        label={spec.label}
                        options={spec.options.map(o => ({ value: o, label: o }))}
                        value={formData.specifications[spec.name] || ''}
                        onChange={(opt) => handleSpecChange(spec.name, opt.value)}
                        placeholder={`Select ${spec.label}`}
                      />
                    ) : (
                      <div className="relative">
                        <Input
                          label={spec.label}
                          type={spec.type}
                          value={formData.specifications[spec.name] || ''}
                          onChange={(e) => handleSpecChange(spec.name, e.target.value)}
                          placeholder={`Enter ${spec.label}`}
                        />
                        {spec.unit && (
                          <span className="absolute right-3 bottom-2.5 text-[12px] font-bold text-text-muted">
                            {spec.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Vehicle Compatibility */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[12px]">3</span>
                Vehicle Compatibility
              </h2>
              <Button type="button" variant="outline" size="sm" onClick={addCompatibilityRow} icon={Plus}>
                Add Another
              </Button>
            </div>
            <div className="space-y-4">
              {formData.compatibility.map((comp, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-surface-2/50 p-4 rounded-xl border border-border/50 group">
                  <div className="flex-1 min-w-[140px]">
                    <Select
                      label={index === 0 ? "Make" : ""}
                      options={VEHICLE_MAKES.map(m => ({ value: m, label: m }))}
                      value={comp.make}
                      onChange={(opt) => handleCompatibilityChange(index, 'make', opt.value)}
                      placeholder="Make"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Input
                      label={index === 0 ? "Model" : ""}
                      value={comp.model}
                      onChange={(e) => handleCompatibilityChange(index, 'model', e.target.value)}
                      placeholder="e.g. Corolla"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label={index === 0 ? "Year From" : ""}
                      value={comp.yearStart}
                      onChange={(e) => handleCompatibilityChange(index, 'yearStart', e.target.value)}
                      placeholder="2015"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label={index === 0 ? "Year To" : ""}
                      value={comp.yearEnd}
                      onChange={(e) => handleCompatibilityChange(index, 'yearEnd', e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                  {formData.compatibility.length > 1 && (
                    <button 
                      onClick={() => removeCompatibilityRow(index)}
                      className="p-2.5 text-text-muted hover:text-error transition-colors mb-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Images */}
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">Product Images</h2>
            <ImageUpload
              multiple
              maxCount={5}
              value={formData.images}
              onChange={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
              onUpload={async (file) => uploadFile(file, `shops/${shop.id}/parts`)}
            />
            <p className="text-[11px] text-text-muted">
              Upload up to 5 clear images. The first image will be the main cover.
            </p>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="p-6 space-y-6">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">Pricing & Inventory</h2>
            <div className="space-y-4">
              <Input
                label="Price (Rs.)"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              <Input
                label="Discounted Price (Optional)"
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="0.00"
              />
              <Input
                label="Stock Quantity"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
              />
              <Select
                label="Condition"
                options={PART_CONDITIONS.map(c => ({ value: c, label: c }))}
                value={formData.condition}
                onChange={(opt) => setFormData(prev => ({ ...prev, condition: opt.value }))}
              />
              <Select
                label="Part Type"
                options={PART_TYPES.map(t => ({ value: t, label: t }))}
                value={formData.type}
                onChange={(opt) => setFormData(prev => ({ ...prev, type: opt.value }))}
              />
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wider">Description</h2>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full bg-white border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              placeholder="Provide more details about the part, its condition, and warranty if any..."
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddPart;
