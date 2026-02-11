import { forwardRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';

/**
 * DatePicker component (Wrapper around native date input for now)
 */
const DatePicker = forwardRef(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      min,
      max,
      disabled = false,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-[13px] font-body font-medium text-text-body">
            {label}
            {required && <span className="text-primary ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <CalendarIcon size={16} />
          </div>

          <input
            ref={ref}
            type="date"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            disabled={disabled}
            className={cn(
              'w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] border border-border bg-white font-body text-[13px]',
              'text-text-primary placeholder:text-text-muted',
              'transition-all duration-[var(--transition-fast)]',
              'hover:border-text-secondary',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-2',
              error && 'border-error focus:border-error focus:ring-error/10'
            )}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <p className={cn('text-[12px]', error ? 'text-error' : 'text-text-secondary')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
