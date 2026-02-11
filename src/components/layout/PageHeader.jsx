import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';

/**
 * Page Header with breadcrumbs, title, and actions
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-2 text-[12px] text-text-muted">
          <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <ChevronRight size={12} />
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-secondary font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-heading font-bold text-text-primary leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary mt-1 text-[14px]">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
