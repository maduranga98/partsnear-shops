import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn, formatFileSize } from '../../utils/helpers';
import Button from './Button';

/**
 * Image Upload component with drag/drop, preview, and validation
 */
const ImageUpload = ({
  value = [],
  onChange,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  accept = 'image/png, image/jpeg, image/webp',
  label,
  helperText,
  error,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const currentFiles = Array.isArray(value) ? value : value ? [value] : [];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Invalid file type. Only images are allowed.';
    }
    if (file.size > maxSize) {
      return `File too large. Max size is ${formatFileSize(maxSize)}.`;
    }
    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      // You might want to show these errors via toast or callback
      console.warn('File validation errors:', errors);
      // For now, we'll just ignore invalid files or could set error state if we had one internal to this component
    }

    if (validFiles.length > 0) {
      if (multiple) {
        const remainingSlots = maxFiles - currentFiles.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);
        if (filesToAdd.length > 0) {
          // In a real app, you might upload these immediately and get URLs back,
          // or pass the File objects up. Assuming we pass File objects or standard URL.createObjectURL for preview.
          // For this component, let's assume we pass File objects mixed with existing URL strings if any.
          // To preview local files, we'll need to create object URLs in the parent or handle it here.
          // Let's pass the raw File objects up.
          onChange([...currentFiles, ...filesToAdd]);
        }
      } else {
        onChange(validFiles[0]);
      }
    }
  };

  const removeFile = (index) => {
    if (multiple) {
      const newFiles = [...currentFiles];
      newFiles.splice(index, 1);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  const openFileDialog = () => {
    inputRef.current.click();
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-[13px] font-body font-medium text-text-body">
          {label}
        </label>
      )}

      {/* Drop Zone */}
      {(multiple ? currentFiles.length < maxFiles : !value) && (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[var(--radius-lg)] transition-colors cursor-pointer',
            dragActive
              ? 'border-primary bg-primary-bg/10'
              : 'border-border hover:border-text-secondary hover:bg-surface',
            error && 'border-error bg-error-bg/10'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            multiple={multiple}
            accept={accept}
            onChange={handleChange}
          />

          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center mb-3 text-text-muted">
            <Upload size={20} />
          </div>

          <p className="text-[14px] font-heading font-semibold text-text-primary text-center">
            Click to upload <span className="text-text-secondary font-body font-normal">or drag and drop</span>
          </p>
          <p className="text-[12px] text-text-muted mt-1 text-center">
            SVG, PNG, JPG or WEBP (max. {formatFileSize(maxSize)})
          </p>
        </div>
      )}

      {/* Previews */}
      {currentFiles.length > 0 && (
        <div className={cn('grid gap-4 mt-2', multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1')}>
          {currentFiles.map((file, index) => {
            let previewUrl = null;
            if (typeof file === 'string') {
                previewUrl = file;
            } else if (file instanceof File) {
                previewUrl = URL.createObjectURL(file);
            }

            return (
              <div key={index} className="relative group border border-border rounded-[var(--radius-md)] overflow-hidden bg-surface-2 aspect-square flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onLoad={() => {
                        if (file instanceof File) URL.revokeObjectURL(previewUrl)
                    }}
                  />
                ) : (
                    <ImageIcon className="text-text-muted" size={32} />
                )}

                <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-darkest/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                >
                    <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(error || helperText) && (
        <p className={cn('text-[12px]', error ? 'text-error' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
