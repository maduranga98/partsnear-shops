import { cn } from '../../utils/helpers';

/**
 * Card component with variants: stat, content, action
 */
const Card = ({
  children,
  variant = 'content',
  className,
  onClick,
  hoverable = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-border rounded-[var(--radius-lg)]',
        'transition-all duration-[var(--transition-normal)]',
        padding && 'p-5',
        hoverable && 'hover:shadow-md hover:border-border/80 hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Stat Card — for dashboard KPIs
 */
export const StatCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconBg = 'bg-primary-bg',
  iconColor = 'text-primary',
  className,
}) => {
  const changeColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-text-secondary',
  };

  return (
    <Card className={cn('flex items-start justify-between', className)}>
      <div className="flex-1">
        <p className="text-[12px] font-body font-medium text-text-secondary uppercase tracking-wider mb-1">
          {title}
        </p>
        <p className="text-[24px] font-heading font-bold text-text-primary leading-tight">
          {value}
        </p>
        {change !== undefined && (
          <p className={cn('text-[12px] font-body mt-1', changeColors[changeType])}>
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : ''} {change}
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0', iconBg)}>
          <Icon size={20} className={iconColor} />
        </div>
      )}
    </Card>
  );
};

/**
 * Action Card — with clickable action
 */
export const ActionCard = ({
  title,
  description,
  icon: Icon,
  action,
  actionLabel = 'View',
  className,
}) => {
  return (
    <Card className={cn('flex items-center gap-4', className)} hoverable onClick={action}>
      {Icon && (
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-primary-bg flex items-center justify-center shrink-0">
          <Icon size={24} className="text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-heading font-semibold text-text-primary truncate">
          {title}
        </h3>
        {description && (
          <p className="text-[12px] font-body text-text-secondary mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
      <span className="text-[12px] font-heading font-semibold text-primary shrink-0">
        {actionLabel} →
      </span>
    </Card>
  );
};

export default Card;
