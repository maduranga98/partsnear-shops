import { Inbox } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Button from './Button';

/**
 * Empty state component with illustration, title, description, and action
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description,
  action,
  actionLabel = 'Get Started',
  actionIcon,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-5">
        <Icon size={28} className="text-text-muted" />
      </div>

      <h3 className="text-[16px] font-heading font-semibold text-text-primary mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-[13px] font-body text-text-secondary max-w-sm mb-5">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant="primary"
          size="md"
          icon={actionIcon}
          onClick={action}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
