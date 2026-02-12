import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, X, Tag, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const BarcodePrintModal = ({ isOpen, onClose, part }) => {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Label_${part?.barcode || 'Part'}`,
  });

  if (!part) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Part Label & Barcode">
      <div className="space-y-8">
        {/* Label Preview */}
        <div className="flex justify-center p-8 bg-surface-2 rounded-2xl border-2 border-dashed border-border/50">
          <div 
            ref={printRef}
            className="bg-white p-6 rounded shadow-sm border border-border w-[300px] flex flex-col items-center text-center font-sans print:m-0 print:shadow-none print:border-none"
          >
            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight mb-1 truncate w-full">
              {part.name}
            </h3>
            <p className="text-[10px] text-text-muted font-bold mb-4 uppercase">
              {part.brand} • {part.partNumber}
            </p>
            
            <div className="mb-4">
              <Barcode 
                value={part.barcode} 
                width={1.2} 
                height={50} 
                fontSize={12}
                background="transparent"
              />
            </div>
            
            <div className="flex items-center justify-between w-full mt-2 pt-4 border-t border-border/50">
               <div className="text-left">
                  <p className="text-[10px] font-black text-text-muted uppercase">Price</p>
                  <p className="text-sm font-black text-primary">Rs. {part.price.toLocaleString()}</p>
               </div>
               <div className="p-1 bg-white border border-border rounded-lg">
                  <QRCodeSVG value={`https://partsnear.com/p/${part.id}`} size={40} />
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button icon={Printer} onClick={() => handlePrint()} className="flex-1">
             Print Label
           </Button>
           <Button variant="outline" icon={Download} onClick={onClose} className="flex-1">
             Download PNG
           </Button>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl flex items-start gap-3">
           <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
           <p className="text-[11px] text-text-secondary leading-relaxed">
             <span className="font-bold text-primary">Pro Tip:</span> You can use these labels on your physical inventory shelves or directly on part packaging for quick scanning with the mobile app.
           </p>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodePrintModal;
