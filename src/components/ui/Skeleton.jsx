import { cn } from '../../utils/helpers';

/**
 * Skeleton loader component
 */
const Skeleton = ({
  variant = 'line',
  width,
  height,
  className,
  count = 1,
  circle = false,
}) => {
  const baseStyles = 'bg-surface-2 animate-pulse rounded-[var(--radius-sm)]';

  const getStyles = () => {
    if (circle) {
      return {
        width: width || 40,
        height: height || width || 40,
        borderRadius: '50%',
      };
    }

    switch (variant) {
      case 'line':
        return { width: width || '100%', height: height || 14 };
      case 'circle':
        return {
          width: width || 40,
          height: height || width || 40,
          borderRadius: '50%',
        };
      case 'card':
        return { width: width || '100%', height: height || 120 };
      case 'table-row':
        return { width: width || '100%', height: height || 48 };
      case 'avatar':
        return {
          width: width || 36,
          height: height || 36,
          borderRadius: '50%',
        };
      default:
        return { width: width || '100%', height: height || 14 };
    }
  };

  const styles = getStyles();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={baseStyles}
          style={{
            width: typeof styles.width === 'number' ? `${styles.width}px` : styles.width,
            height: typeof styles.height === 'number' ? `${styles.height}px` : styles.height,
            borderRadius: styles.borderRadius,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pre-built skeleton layouts
 */
export const CardSkeleton = ({ className }) => (
  <div className={cn('bg-white border border-border rounded-[var(--radius-lg)] p-5', className)}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="avatar" />
      <div className="flex-1">
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} className="mt-1.5" />
      </div>
    </div>
    <Skeleton width="100%" height={12} count={3} />
  </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex items-center gap-4 py-3 px-4">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} width={i === 0 ? '30%' : '20%'} height={14} className="flex-1" />
    ))}
  </div>
);

export default Skeleton;
