import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Button from './Button';

/**
 * Pagination component
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first, last, and pages around current
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className="w-8 px-0"
      >
        <ChevronsLeft size={14} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-8 px-0"
      >
        <ChevronLeft size={14} />
      </Button>

      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="text-text-muted text-[12px] px-1">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[13px] font-heading font-semibold transition-colors',
                currentPage === page
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
              )}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-8 px-0"
      >
        <ChevronRight size={14} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="w-8 px-0"
      >
        <ChevronsRight size={14} />
      </Button>
    </div>
  );
};

export default Pagination;
