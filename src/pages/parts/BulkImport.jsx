import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Database,
  Loader2,
  Trash2,
  Table as TableIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useShop } from '../../context/ShopContext';
import { bulkAddParts } from '../../services/parts';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../config/routes';
import { PART_CATEGORIES, PART_CONDITIONS, PART_TYPES } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

const BulkImport = () => {
  const { shop } = useShop();
  const navigate = useNavigate();
  const notify = useNotification();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview, 4: Result
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappings, setMappings] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [importResults, setImportResults] = useState(null);

  const SYSTEM_FIELDS = [
    { key: 'name', label: 'Part Name', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'subCategory', label: 'Sub-category', required: false },
    { key: 'brand', label: 'Brand', required: false },
    { key: 'partNumber', label: 'Part Number', required: false },
    { key: 'price', label: 'Price (LKR)', required: true },
    { key: 'stock', label: 'Stock Quantity', required: true },
    { key: 'condition', label: 'Condition', required: false },
    { key: 'type', label: 'Part Type', required: false },
    { key: 'description', label: 'Description', required: false },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      const fileHeaders = data[0] || [];
      const fileRows = data.slice(1);
      
      setHeaders(fileHeaders);
      setRawData(fileRows);
      
      // Auto-mapping logic
      const initialMappings = {};
      SYSTEM_FIELDS.forEach(field => {
        const match = fileHeaders.find(h => h.toLowerCase().includes(field.label.toLowerCase()) || h.toLowerCase().includes(field.key.toLowerCase()));
        if (match) initialMappings[field.key] = match;
      });
      setMappings(initialMappings);
      
      setStep(2);
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [SYSTEM_FIELDS.map(f => f.label)];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "partsnear_parts_template.xlsx");
  };

  const generatePreview = () => {
    const preview = rawData.slice(0, 10).map(row => {
      const item = {};
      SYSTEM_FIELDS.forEach(field => {
        const headerIndex = headers.indexOf(mappings[field.key]);
        item[field.key] = headerIndex > -1 ? row[headerIndex] : '';
      });
      return item;
    });
    setPreviewData(preview);
    setStep(3);
  };

  const processImport = async () => {
    setLoading(true);
    try {
      const finalizedData = rawData.map(row => {
        const item = { 
          status: 'active',
          images: [],
          compatibility: [],
          specifications: {}
        };
        SYSTEM_FIELDS.forEach(field => {
          const headerIndex = headers.indexOf(mappings[field.key]);
          const val = headerIndex > -1 ? row[headerIndex] : '';
          
          if (field.key === 'price') item[field.key] = parseFloat(val) || 0;
          else if (field.key === 'stock') item[field.key] = parseInt(val) || 0;
          else item[field.key] = val || '';
        });
        return item;
      });

      const results = await bulkAddParts(shop.id, finalizedData);
      setImportResults(results);
      setStep(4);
      notify.success(`Successfully imported ${results.success} parts!`);
    } catch (error) {
      console.error(error);
      notify.error('Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(ROUTES.PARTS)}
          className="p-2 h-10 w-10 rounded-full hover:bg-surface-2 transition-colors flex items-center justify-center text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Bulk Import Parts</h1>
          <p className="text-text-secondary text-sm">Step {step} of 4: {['Upload File', 'Map Columns', 'Review Data', 'Complete'][step-1]}</p>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 p-6 space-y-6 bg-surface-2/50 border-none ring-1 ring-border/50">
             <div className="p-4 bg-white rounded-2xl border border-border/50">
               <h3 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                 <Download size={16} className="text-primary" /> Download Template
               </h3>
               <p className="text-xs text-text-muted mb-4">Use our standardized template to ensure data compatibility.</p>
               <Button variant="outline" size="sm" className="w-full" onClick={downloadTemplate}>
                 Download .XLSX
               </Button>
             </div>
             <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Import Tips</h4>
               <ul className="space-y-3">
                 {[
                   'Keep column headers clearly named.',
                   'Price and Stock must be numbers.',
                   'Brand and Part Number are highly recommended.',
                   'Limit 500 records per upload.'
                 ].map((t, i) => (
                   <li key={i} className="flex gap-2 text-[11px] text-text-secondary font-medium">
                     <CheckCircle2 size={12} className="text-success shrink-0 mt-0.5" /> {t}
                   </li>
                 ))}
               </ul>
             </div>
          </Card>

          <Card className="md:col-span-2 p-12 border-none ring-1 ring-border/50 flex flex-col items-center justify-center text-center space-y-6">
             <div 
               className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary cursor-pointer border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all hover:bg-primary/10"
               onClick={() => fileInputRef.current?.click()}
             >
               <Upload size={32} />
             </div>
             <div>
               <h2 className="text-xl font-black text-text-primary mb-2">Select CSV or Excel File</h2>
               <p className="text-sm text-text-muted max-w-sm">Drag and drop your catalog file here or click to browse files from your computer.</p>
             </div>
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               accept=".csv, .xlsx, .xls"
               onChange={handleFileUpload}
             />
             <Button loading={loading} onClick={() => fileInputRef.current?.click()}>
               Browse Files
             </Button>
          </Card>
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 2 && (
        <Card className="p-6 border-none ring-1 ring-border/50 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Map File Columns</h3>
              <p className="text-[12px] text-text-muted">We've auto-matched some columns for you.</p>
           </div>
           
           <div className="space-y-3">
              {SYSTEM_FIELDS.map((field) => (
                <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-3 rounded-xl bg-surface hover:bg-surface-2 transition-all group">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mappings[field.key] ? 'bg-success/10 text-success' : 'bg-surface-3 text-text-muted'}`}>
                         <Database size={16} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-text-primary">{field.label} {field.required && <span className="text-error">*</span>}</p>
                         <p className="text-[10px] text-text-muted">System field identifier: {field.key}</p>
                      </div>
                   </div>
                   <Select 
                     options={headers.map(h => ({ label: h, value: h }))}
                     placeholder="Select column from your file..."
                     value={mappings[field.key]}
                     onChange={(opt) => setMappings(prev => ({ ...prev, [field.key]: opt.value }))}
                   />
                </div>
              ))}
           </div>

           <div className="flex justify-end pt-6 border-t border-border">
              <Button onClick={generatePreview} disabled={SYSTEM_FIELDS.filter(f => f.required).some(f => !mappings[f.key])}>
                Review Data <ArrowRight size={18} className="ml-2" />
              </Button>
           </div>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="p-6 border-none ring-1 ring-border/50">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-text-primary">Review First 10 Rows</h3>
               <Badge variant="navy">Total Rows to Process: {rawData.length}</Badge>
             </div>
             
             <div className="overflow-x-auto border border-border rounded-xl">
               <table className="w-full text-left text-sm">
                 <thead className="bg-surface-2">
                   <tr>
                     {SYSTEM_FIELDS.map(f => (
                       <th key={f.key} className="p-3 font-bold text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">{f.label}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {previewData.map((row, i) => (
                     <tr key={i} className="hover:bg-surface/50 transition-colors">
                       {SYSTEM_FIELDS.map(f => (
                         <td key={f.key} className="p-3 text-text-body whitespace-nowrap max-w-[200px] truncate">
                           {row[f.key] || <span className="text-error font-bold italic opacity-30">Empty</span>}
                         </td>
                       ))}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Card>

          <div className="flex justify-between items-center p-6 bg-primary/5 rounded-2xl ring-1 ring-primary/20">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                   <AlertCircle size={24} />
                </div>
                <div>
                   <h4 className="font-bold text-primary">Ready to publish?</h4>
                   <p className="text-xs text-text-secondary">Double check the data above. Importing {rawData.length} records cannot be easily undone.</p>
                </div>
             </div>
             <Button onClick={processImport} loading={loading} icon={Database}>
                Start Bulk Import
             </Button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && (
        <Card className="p-12 border-none ring-1 ring-border/50 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 rounded-full bg-success/10 text-success flex items-center justify-center animate-bounce-subtle">
             <CheckCircle2 size={48} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-text-primary mb-2">Import Successful!</h2>
             <p className="text-text-secondary">We've finished processing your catalog file.</p>
           </div>
           
           <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="p-4 rounded-2xl bg-surface ring-1 ring-border/50">
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Uploaded</p>
                 <p className="text-2xl font-black text-success">{importResults.success}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface ring-1 ring-border/50">
                 <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Failed</p>
                 <p className="text-2xl font-black text-error">{importResults.failed}</p>
              </div>
           </div>

           {importResults.errors.length > 0 && (
             <div className="w-full text-left bg-error/5 p-4 rounded-xl border border-error/10 max-h-40 overflow-y-auto">
               <h4 className="text-xs font-bold text-error mb-2">Error Log</h4>
               <ul className="space-y-1">
                 {importResults.errors.slice(0, 10).map((err, i) => (
                   <li key={i} className="text-[11px] text-error font-medium">• {err}</li>
                 ))}
                 {importResults.errors.length > 10 && <li className="text-[11px] text-error font-bold">And {importResults.errors.length - 10} more...</li>}
               </ul>
             </div>
           )}

           <div className="flex gap-4">
              <Button onClick={() => navigate(ROUTES.PARTS)}>Go to Catalog</Button>
              <Button variant="outline" onClick={() => setStep(1)}>Import Another</Button>
           </div>
        </Card>
      )}
    </div>
  );
};

export default BulkImport;
