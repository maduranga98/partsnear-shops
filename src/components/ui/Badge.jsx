import { cn } from '../../utils/helpers';

const variants = {
  success: 'bg-success-bg text-success border-success/20',
  warning: 'bg-warning-bg text-warning border-warning/20',
  error: 'bg-error-bg text-error border-error/20',
  info: 'bg-info-bg text-info border-info/20',
  neutral: 'bg-surface-2 text-text-secondary border-border',
  primary: 'bg-primary-bg text-primary border-primary/20',
};

const dotColors = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-text-muted',
  primary: 'bg-primary',
};

/**
 * Badge / Status Badge component
 */
const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className,
}) => {
  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-[12px] px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-body font-medium rounded-[var(--radius-full)] border whitespace-nowrap',
        variants[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

export default Badge;
