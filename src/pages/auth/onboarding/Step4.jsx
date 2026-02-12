import { useState } from 'react';
import { Plus, Trash2, ArrowRight, Package, Image as ImageIcon } from 'lucide-react';
import { VEHICLE_MAKES, PART_CATEGORIES } from '../../../utils/constants';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Table from '../../../components/ui/Table';

const Step4 = ({ data, onBack, onNext, loading }) => {
  const [parts, setParts] = useState(data.parts || [
    { id: Date.now(), name: '', category: '', make: '', price: '', stock: '1' }
  ]);

  const addRow = () => {
    setParts([...parts, { id: Date.now(), name: '', category: '', make: '', price: '', stock: '1' }]);
  };

  const removeRow = (id) => {
    if (parts.length > 1) {
      setParts(parts.filter(p => p.id !== id));
    }
  };

  const updatePart = (id, field, value) => {
    setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty rows
    const validParts = parts.filter(p => p.name && p.category && p.make);
    onNext({ parts: validParts });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Quick Start: Add Parts</h2>
        <p className="text-text-secondary mt-2">Add your first few parts to get your shop running immediately.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[12px] font-bold text-text-muted uppercase tracking-wider">
              <th className="py-3 px-2">Part Name / Model</th>
              <th className="py-3 px-2">Make</th>
              <th className="py-3 px-2">Category</th>
              <th className="py-3 px-2">Price (LKR)</th>
              <th className="py-3 px-2 w-20 text-center">Qty</th>
              <th className="py-3 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {parts.map((part) => (
              <tr key={part.id} className="group hover:bg-surface transition-colors">
                <td className="py-3 px-2">
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => updatePart(part.id, 'name', e.target.value)}
                    placeholder="e.g. Brake Pads"
                    className="w-full bg-transparent border-none focus:ring-0 text-[13px] font-medium placeholder:text-text-muted/50 p-0"
                  />
                </td>
                <td className="py-3 px-2">
                  <select
                    value={part.make}
                    onChange={(e) => updatePart(part.id, 'make', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-[13px] p-0"
                  >
                    <option value="">Select Make</option>
                    {VEHICLE_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </td>
                <td className="py-3 px-2">
                  <select
                    value={part.category}
                    onChange={(e) => updatePart(part.id, 'category', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-[13px] p-0"
                  >
                    <option value="">Category</option>
                    {PART_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    value={part.price}
                    onChange={(e) => updatePart(part.id, 'price', e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none focus:ring-0 text-[13px] p-0"
                  />
                </td>
                <td className="py-3 px-2">
                  <input
                    type="number"
                    value={part.stock}
                    onChange={(e) => updatePart(part.id, 'stock', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-[13px] text-center p-0"
                  />
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => removeRow(part.id)}
                    className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 flex items-center gap-2 text-primary font-bold text-sm hover:text-primary-dark transition-colors"
      >
        <Plus size={18} /> Add another row
      </button>

      <div className="bg-primary/5 p-4 rounded-lg flex items-start gap-3 mt-8 border border-primary/10">
        <Package className="text-primary shrink-0" size={20} />
        <div>
          <p className="text-[13px] font-bold text-primary">Pro Tip: Bulk Upload</p>
          <p className="text-[12px] text-primary/80">Once you complete onboarding, you can use our Excel bulk upload tool to import thousands of parts at once.</p>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-border mt-8">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSubmit} disabled={loading}>
            Skip for Now
          </Button>
          <Button onClick={handleSubmit} loading={loading} icon={ArrowRight} iconPosition="right">
            Continue to Billing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step4;
