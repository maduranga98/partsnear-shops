import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/helpers';

const variants = {
  success: {
    bg: 'bg-success-bg border-success/20',
    icon: CheckCircle,
    iconColor: 'text-success',
  },
  warning: {
    bg: 'bg-warning-bg border-warning/20',
    icon: AlertTriangle,
    iconColor: 'text-warning',
  },
  error: {
    bg: 'bg-error-bg border-error/20',
    icon: AlertCircle,
    iconColor: 'text-error',
  },
  info: {
    bg: 'bg-info-bg border-info/20',
    icon: Info,
    iconColor: 'text-info',
  },
};

/**
 * Alert component (inline alerts)
 */
const Alert = ({
  children,
  title,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className,
  icon: CustomIcon,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const config = variants[variant];
  const IconComponent = CustomIcon || config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-[var(--radius-md)] border',
        config.bg,
        className
      )}
    >
      <IconComponent size={18} className={cn('shrink-0 mt-0.5', config.iconColor)} />

      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-[13px] font-heading font-semibold text-text-primary mb-0.5">
            {title}
          </p>
        )}
        <div className="text-[13px] font-body text-text-body">{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 p-0.5 rounded text-text-secondary hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
