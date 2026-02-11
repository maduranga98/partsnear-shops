import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Tooltip component
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  if (!content) return children;

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-darkest border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-darkest border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-darkest border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-darkest border-y-transparent border-l-transparent',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            'absolute z-[60] px-2.5 py-1.5 text-[11px] font-body text-white bg-darkest rounded-[var(--radius-sm)] shadow-md whitespace-nowrap pointer-events-none',
            'animate-in fade-in duration-150',
            positionStyles[position],
            className
          )}
        >
          {content}
          <span
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowStyles[position]
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
