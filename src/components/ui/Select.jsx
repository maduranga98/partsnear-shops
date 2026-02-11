import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

/**
 * Select / Multi-Select with search
 */
const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  multiple = false,
  clearable = false,
  disabled = false,
  error,
  helperText,
  required = false,
  className,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const exists = currentValues.find((v) => v === option.value);
      if (exists) {
        onChange(currentValues.filter((v) => v !== option.value));
      } else {
        onChange([...currentValues, option.value]);
      }
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const getDisplayValue = () => {
    if (multiple) {
      const selected = Array.isArray(value) ? value : [];
      if (selected.length === 0) return placeholder;
      const labels = selected
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean);
      return labels.length <= 2 ? labels.join(', ') : `${labels.length} selected`;
    }
    const selected = options.find((o) => o.value === value);
    return selected ? selected.label : placeholder;
  };

  const isSelected = (optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value !== '' && value !== null && value !== undefined;

  const sizeStyles = {
    sm: 'h-8 text-[12px] px-2.5',
    md: 'h-10 text-[13px] px-3',
    lg: 'h-12 text-[14px] px-4',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label className="text-[13px] font-body font-medium text-text-body">
          {label}
          {required && <span className="text-primary ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            'w-full flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-white font-body',
            'transition-all duration-[var(--transition-fast)]',
            'hover:border-text-secondary',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-2',
            isOpen && 'border-primary ring-2 ring-primary/10',
            error && 'border-error focus:border-error focus:ring-error/10',
            sizeStyles[size]
          )}
        >
          <span
            className={cn(
              'truncate text-left',
              !hasValue && 'text-text-muted'
            )}
          >
            {getDisplayValue()}
          </span>

          <div className="flex items-center gap-1 ml-2 shrink-0">
            {clearable && hasValue && (
              <span
                onClick={handleClear}
                className="text-text-muted hover:text-text-body p-0.5 rounded-full hover:bg-surface-2 transition-colors"
              >
                <X size={14} />
              </span>
            )}
            <ChevronDown
              size={16}
              className={cn(
                'text-text-muted transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-[var(--radius-md)] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {searchable && (
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-8 pl-8 pr-3 text-[12px] border border-border rounded-[var(--radius-sm)] bg-surface font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-[12px] text-text-muted">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] font-body',
                      'transition-colors duration-100',
                      'hover:bg-surface',
                      isSelected(option.value)
                        ? 'text-primary bg-primary-bg/50'
                        : 'text-text-body'
                    )}
                  >
                    {multiple && (
                      <span
                        className={cn(
                          'w-4 h-4 border rounded flex items-center justify-center shrink-0 transition-colors',
                          isSelected(option.value)
                            ? 'bg-primary border-primary text-white'
                            : 'border-border'
                        )}
                      >
                        {isSelected(option.value) && <Check size={10} />}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {!multiple && isSelected(option.value) && (
                      <Check size={14} className="ml-auto text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={cn('text-[12px]', error ? 'text-error' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
