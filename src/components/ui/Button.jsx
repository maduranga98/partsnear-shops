import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-light active:bg-primary-dark focus-visible:ring-primary/30',
  secondary:
    'bg-navy text-white hover:bg-navy-light active:bg-deep-blue focus-visible:ring-navy/30',
  outline:
    'border-2 border-primary text-primary hover:bg-primary-bg active:bg-primary/10 focus-visible:ring-primary/30',
  ghost:
    'text-text-body hover:bg-surface-2 active:bg-border focus-visible:ring-text-secondary/30',
  success:
    'bg-success text-white hover:bg-success/90 active:bg-success/80 focus-visible:ring-success/30',
  danger:
    'bg-error text-white hover:bg-error/90 active:bg-error/80 focus-visible:ring-error/30',
};

const sizes = {
  sm: 'h-8 px-3 text-[12px] gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-[var(--radius-md)]',
  lg: 'h-12 px-6 text-[14px] gap-2.5 rounded-[var(--radius-md)]',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-heading font-semibold',
          'transition-all duration-[var(--transition-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
