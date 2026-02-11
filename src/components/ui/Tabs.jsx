import { useState } from 'react';
import { cn } from '../../utils/helpers';

/**
 * Tabs component — horizontal and vertical
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  orientation = 'horizontal',
  variant = 'underline',
  className,
  contentClassName,
}) => {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id || '');
  const currentTab = activeTab ?? internalActive;

  const handleChange = (tabId) => {
    if (onChange) {
      onChange(tabId);
    } else {
      setInternalActive(tabId);
    }
  };

  const activeTabData = tabs.find((t) => t.id === currentTab);

  return (
    <div
      className={cn(
        orientation === 'vertical' && 'flex gap-6',
        className
      )}
    >
      {/* Tab list */}
      <div
        role="tablist"
        className={cn(
          orientation === 'horizontal' && 'flex items-center gap-0',
          orientation === 'horizontal' && variant === 'underline' && 'border-b border-border',
          orientation === 'horizontal' && variant === 'pills' && 'bg-surface rounded-[var(--radius-md)] p-1 gap-1',
          orientation === 'vertical' && 'flex flex-col gap-0.5 min-w-[180px] shrink-0',
          orientation === 'vertical' && variant === 'underline' && 'border-r border-border pr-4',
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={currentTab === tab.id}
            onClick={() => handleChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              'flex items-center gap-2 font-heading font-semibold text-[13px] transition-all duration-[var(--transition-fast)] whitespace-nowrap',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              // Horizontal underline
              orientation === 'horizontal' && variant === 'underline' && [
                'px-4 py-2.5 border-b-2 -mb-px',
                currentTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border',
              ],
              // Horizontal pills
              orientation === 'horizontal' && variant === 'pills' && [
                'px-3 py-1.5 rounded-[var(--radius-sm)]',
                currentTab === tab.id
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary',
              ],
              // Vertical
              orientation === 'vertical' && [
                'px-3 py-2 rounded-[var(--radius-sm)] text-left',
                currentTab === tab.id
                  ? 'bg-primary-bg text-primary'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary',
              ]
            )}
          >
            {tab.icon && <tab.icon size={15} />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-body',
                currentTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-2 text-text-muted'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTabData?.content && (
        <div
          role="tabpanel"
          className={cn(
            'flex-1',
            orientation === 'horizontal' && 'mt-4',
            contentClassName
          )}
        >
          {activeTabData.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;
