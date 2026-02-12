import { useState } from 'react';
import { FileText, Printer, Upload, Image as ImageIcon, Check, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const TemplatesSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice'); // 'invoice' or 'thermal'

  const [settings, setSettings] = useState({
    invoicePrefix: userProfile?.invoicePrefix || 'PN-',
    invoiceLogo: userProfile?.invoiceLogo || null,
    headerText: userProfile?.headerText || '',
    footerText: userProfile?.footerText || 'Thank you for your business!',
    showTax: userProfile?.showTax ?? true,
    thermalHeader: userProfile?.thermalHeader || 'PARTSNEAR SHOP',
    thermalFooter: userProfile?.thermalFooter || 'Please retain your receipt',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ templates: settings });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-1">
        <div className="flex">
          <button
            onClick={() => setActiveTab('invoice')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'invoice' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface-2'
            }`}
          >
            <FileText size={18} />
            Standard Invoice
          </button>
          <button
            onClick={() => setActiveTab('thermal')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'thermal' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-surface-2'
            }`}
          >
            <Printer size={18} />
            Thermal Receipt
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-text-primary capitalize">{activeTab} Template Editor</h3>
            <Badge variant="navy">Pro Feature</Badge>
          </div>

          <div className="space-y-6">
            {activeTab === 'invoice' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Shop Logo</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-surface-2 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-text-muted">
                      <ImageIcon size={32} className="mb-2" />
                      <p className="text-xs font-medium">Click to upload logo</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Invoice Number Prefix</label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={handleChange}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g. PN-"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Footer Message</label>
                  <textarea
                    name="footerText"
                    value={settings.footerText}
                    onChange={handleChange}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                    placeholder="e.g. Thank you for your business!"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border">
                  <span className="text-sm font-bold text-text-primary">Show Tax Column</span>
                  <button
                    onClick={() => handleChange({ target: { name: 'showTax', type: 'checkbox', checked: !settings.showTax } })}
                    className={`w-10 h-5 rounded-full relative p-1 transition-all ${settings.showTax ? 'bg-primary' : 'bg-surface-3'}`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${settings.showTax ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Header Text (centered)</label>
                  <input
                    type="text"
                    name="thermalHeader"
                    value={settings.thermalHeader}
                    onChange={handleChange}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Footer Text (centered)</label>
                  <textarea
                    name="thermalFooter"
                    value={settings.thermalFooter}
                    onChange={handleChange}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                  />
                </div>

                <Button variant="outline" className="w-full h-12 border-dashed">
                  <Printer size={18} />
                  Print Test Receipt
                </Button>
              </>
            )}
            
            <Button className="w-full h-12 mt-4" onClick={handleSave} loading={loading}>Save Template</Button>
          </div>
        </Card>

        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Eye size={16} className="text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Live Preview</span>
          </div>

          <div className={`bg-white border border-border rounded-3xl p-8 shadow-sm ${activeTab === 'thermal' ? 'max-w-sm mx-auto' : ''}`}>
            {activeTab === 'invoice' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-surface-3 rounded-xl flex items-center justify-center text-text-muted">
                    <ImageIcon size={32} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-xl font-black text-text-primary">INVOICE</h4>
                    <p className="text-xs text-text-muted">{settings.invoicePrefix}001234</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-4 bg-surface-2 rounded w-1/4" />
                  <div className="h-3 bg-surface-2 rounded w-1/3 opacity-60" />
                </div>

                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b-2 border-surface-3 text-text-muted">
                      <th className="py-2">DESCRIPTION</th>
                      <th className="py-2 text-right">QTY</th>
                      <th className="py-2 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-primary">
                    <tr className="border-b border-surface-2">
                      <td className="py-3 font-bold">Brake Pads - Toyota</td>
                      <td className="py-3 text-right">1</td>
                      <td className="py-3 text-right">LKR 4,500.00</td>
                    </tr>
                    <tr className="border-b border-surface-2">
                      <td className="py-3 font-bold">Oil Filter</td>
                      <td className="py-3 text-right">2</td>
                      <td className="py-3 text-right">LKR 2,400.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-end gap-12">
                  <div className="text-right space-y-2">
                    <p className="text-xs text-text-muted">Subtotal</p>
                    {settings.showTax && <p className="text-xs text-text-muted">Tax (0%)</p>}
                    <p className="text-sm font-black text-text-primary">Total</p>
                  </div>
                  <div className="text-right space-y-2 font-bold">
                    <p className="text-xs">LKR 6,900.00</p>
                    {settings.showTax && <p className="text-xs">LKR 0.00</p>}
                    <p className="text-sm">LKR 6,900.00</p>
                  </div>
                </div>

                <div className="pt-12 border-t border-border text-center">
                  <p className="text-[10px] text-text-muted italic">{settings.footerText}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-[10px] text-center">
                <div className="space-y-1">
                  <p className="font-bold text-xs">{settings.thermalHeader}</p>
                  <p>123 High Level Rd, Colombo</p>
                  <p>Tel: 011-2345678</p>
                </div>
                <div className="border-y border-dashed border-border py-2 text-left">
                  <div className="flex justify-between">
                    <span>Invoice: {settings.invoicePrefix}456</span>
                    <span>12/02/2026</span>
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>Brake Pads x 1</span>
                    <span>4,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Oil Filter x 2</span>
                    <span>2,400.00</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-border pt-2 text-right">
                  <div className="flex justify-between font-bold text-xs uppercase">
                    <span>Total</span>
                    <span>6,900.00</span>
                  </div>
                </div>
                <div className="pt-4 italic">
                  <p>{settings.thermalFooter}</p>
                  <p className="mt-2">*** Thank You ***</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesSettings;
