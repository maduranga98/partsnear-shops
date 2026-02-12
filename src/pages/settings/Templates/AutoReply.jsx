import { useState } from 'react';
import { MessageSquare, Plus, Save, Trash2, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AutoReplySettings = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Standard Confirmation', content: 'Hi! Thanks for inquiring about {partName}. Yes, it is available for LKR {price}. Let me know if you would like to reserve it!' },
    { id: 2, name: 'Out of Stock', content: 'Hello, unfortunately the {partName} is currently out of stock. Would you like us to notify you when it arrives?' },
  ]);

  const addTemplate = () => {
    setTemplates([...templates, { id: Date.now(), name: 'New Template', content: '' }]);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-primary" size={24} />
            <h2 className="text-xl font-bold text-text-primary">Auto-Reply Templates</h2>
          </div>
          <Button size="sm" icon={Plus} onClick={addTemplate}>Add Template</Button>
        </div>

        <div className="space-y-6">
          {templates.map((template) => (
            <div key={template.id} className="p-6 rounded-2xl bg-surface-2 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => {
                    const newTemplates = templates.map(t => t.id === template.id ? { ...t, name: e.target.value } : t);
                    setTemplates(newTemplates);
                  }}
                  className="bg-transparent font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-2 py-1"
                />
                <button 
                  onClick={() => setTemplates(templates.filter(t => t.id !== template.id))}
                  className="text-text-muted hover:text-error transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <textarea
                value={template.content}
                onChange={(e) => {
                  const newTemplates = templates.map(t => t.id === template.id ? { ...t, content: e.target.value } : t);
                  setTemplates(newTemplates);
                }}
                className="w-full bg-white border border-border rounded-xl p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Write your template here..."
              />

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 text-[10px] text-text-muted font-bold">
                  <span className="bg-surface-3 px-2 py-1 rounded">{"{partName}"}</span>
                  <span className="bg-surface-3 px-2 py-1 rounded">{"{price}"}</span>
                  <span className="bg-surface-3 px-2 py-1 rounded">{"{shopName}"}</span>
                  <span className="bg-surface-3 px-2 py-1 rounded">{"{shopPhone}"}</span>
                </div>
                <Button variant="ghost" size="sm" icon={Save}>Save</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-surface-2 border-dashed flex items-center gap-4">
        <HelpCircle className="text-primary shrink-0" size={20} />
        <p className="text-xs text-text-secondary leading-relaxed font-medium">
          Use the variables above in your templates. We will automatically replace them 
          with the actual part details when you use a template to reply to an inquiry.
        </p>
      </Card>
    </div>
  );
};

export default AutoReplySettings;
