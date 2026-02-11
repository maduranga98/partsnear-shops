import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Dropdown menu component
 */
const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const alignStyles = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 min-w-[180px] bg-white border border-border rounded-[var(--radius-md)] shadow-lg',
            'animate-in fade-in slide-in-from-top-1 duration-150',
            'py-1',
            alignStyles[align],
            className
          )}
        >
          {typeof children === 'function'
            ? children({ close: () => setIsOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
};

/**
 * Dropdown item
 */
export const DropdownItem = ({
  children,
  icon: Icon,
  onClick,
  danger = false,
  disabled = false,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-body text-left',
      'transition-colors duration-100',
      danger
        ? 'text-error hover:bg-error-bg'
        : 'text-text-body hover:bg-surface',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
  >
    {Icon && <Icon size={15} className="shrink-0" />}
    {children}
  </button>
);

/**
 * Dropdown divider
 */
export const DropdownDivider = () => (
  <div className="my-1 border-t border-border" />
);

/**
 * Dropdown label/header
 */
export const DropdownLabel = ({ children }) => (
  <div className="px-3 py-1.5 text-[11px] font-heading font-semibold text-text-muted uppercase tracking-wider">
    {children}
  </div>
);

export default Dropdown;
