import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { cn } from '../../utils/helpers';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      type = 'text',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      className,
      inputClassName,
      required = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-') || Math.random().toString(36).slice(2)}`;
    const isPassword = type === 'password';
    const isSearch = type === 'search';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const sizeStyles = {
      sm: 'h-8 text-[12px] px-2.5',
      md: 'h-10 text-[13px] px-3',
      lg: 'h-12 text-[14px] px-4',
    };

    const SearchIcon = isSearch ? Search : null;
    const LeftIcon = isSearch ? SearchIcon : iconPosition === 'left' ? Icon : null;
    const RightIcon = !isSearch && iconPosition === 'right' ? Icon : null;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-body font-medium text-text-body"
          >
            {label}
            {required && <span className="text-primary ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <LeftIcon size={16} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full rounded-[var(--radius-md)] border border-border bg-white font-body',
              'text-text-primary placeholder:text-text-muted',
              'transition-all duration-[var(--transition-fast)]',
              'hover:border-text-secondary',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-2',
              error && 'border-error focus:border-error focus:ring-error/10',
              sizeStyles[size],
              LeftIcon && 'pl-9',
              (RightIcon || isPassword) && 'pr-9',
              inputClassName
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {RightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <RightIcon size={16} />
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'text-[12px]',
              error ? 'text-error' : 'text-text-secondary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
