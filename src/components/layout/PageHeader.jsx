import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers';

/**
 * Page Header with dynamic breadcrumbs, title, and actions
 */
const PageHeader = ({
  title,
  subtitle,
  actions,
  className,
  customBreadcrumbs, // Optional: override automatic breadcrumbs
}) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Generate breadcrumbs from URL if not provided
  const breadcrumbs = customBreadcrumbs || pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

    return { label, path: last ? null : to };
  });

  return (
    <div className={cn('mb-8', className)}>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
        <Link to="/" className="flex items-center gap-1.5 hover:text-primary transition-colors">
          <Home size={12} />
          {pathnames.length === 0 && <span className="text-primary">Dashboard</span>}
        </Link>
        
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-border" strokeWidth={3} />
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-primary transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-text-secondary">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>

      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-black text-text-primary leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-[14px] font-medium max-w-2xl">{subtitle}</p>
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
