import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'si', name: 'Sinhala', native: 'සිංහල' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
];

const LanguageSettings = () => {
  const { userProfile, updateProfile } = useAuth();
  const [selected, setSelected] = useState(userProfile?.language || 'en');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ language: selected });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-text-primary">Display Language</h2>
        </div>

        <div className="grid gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelected(lang.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                selected === lang.id
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.01]'
                  : 'border-border bg-white hover:border-text-muted'
              }`}
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-bold text-text-primary">{lang.native}</span>
                <span className="text-xs text-text-muted">{lang.name}</span>
              </div>
              {selected === lang.id && (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} loading={loading}>Save Settings</Button>
        </div>
      </Card>

      <Card className="p-4 bg-surface-2 border-dashed flex items-center gap-3">
        <div className="text-primary"><Globe size={20} /></div>
        <p className="text-xs text-text-secondary leading-relaxed font-medium">
          PartsNear is available in multiple languages to support local auto professionals. 
          Some admin sections might still be in English.
        </p>
      </Card>
    </div>
  );
};

export default LanguageSettings;
