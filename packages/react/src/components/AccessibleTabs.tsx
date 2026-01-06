/**
 * @a13y/react - AccessibleTabs Component
 * Tab interface with keyboard navigation
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useKeyboardNavigation } from '../hooks/use-keyboard-navigation';

/**
 * Tab definition
 */
export interface Tab {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Tab label - REQUIRED for accessibility
   */
  label: string;

  /**
   * Tab panel content
   */
  content: ReactNode;

  /**
   * Whether tab is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon
   */
  icon?: ReactNode;
}

/**
 * Props for AccessibleTabs
 */
export interface AccessibleTabsProps {
  /**
   * Tabs configuration - REQUIRED
   * Must have at least one tab
   */
  tabs: [Tab, ...Tab[]]; // Non-empty array

  /**
   * Initially selected tab index
   */
  defaultTab?: number;

  /**
   * Controlled selected tab index
   */
  selectedTab?: number;

  /**
   * Called when tab changes
   */
  onTabChange?: (index: number) => void;

  /**
   * Custom className for tabs container
   */
  className?: string;

  /**
   * Custom className for panel
   */
  panelClassName?: string;
}

/**
 * Accessible Tabs Component
 *
 * Tab interface following WAI-ARIA Tabs pattern:
 * - Arrow Left/Right to navigate tabs
 * - Home/End to jump to first/last
 * - Automatic panel switching
 * - Proper ARIA attributes
 *
 * @example
 * ```tsx
 * <AccessibleTabs
 *   tabs={[
 *     {
 *       id: 'account',
 *       label: 'Account',
 *       content: <div>Account settings...</div>,
 *     },
 *     {
 *       id: 'security',
 *       label: 'Security',
 *       content: <div>Security settings...</div>,
 *     },
 *     {
 *       id: 'billing',
 *       label: 'Billing',
 *       content: <div>Billing information...</div>,
 *       disabled: true,
 *     },
 *   ]}
 * />
 * ```
 */
export const AccessibleTabs = (props: AccessibleTabsProps) => {
  const {
    tabs,
    defaultTab = 0,
    selectedTab: controlledTab,
    onTabChange,
    className = '',
    panelClassName = '',
  } = props;

  const isControlled = controlledTab !== undefined;
  const [uncontrolledTab, setUncontrolledTab] = useState(defaultTab);
  const selectedIndex = isControlled ? controlledTab : uncontrolledTab;

  // Keyboard navigation
  const { getItemProps, setCurrentIndex } = useKeyboardNavigation({
    orientation: 'horizontal',
    loop: false,
    currentIndex: selectedIndex,
    onNavigate: (index) => {
      // Skip disabled tabs
      if (tabs[index]?.disabled) {
        return;
      }

      if (!isControlled) {
        setUncontrolledTab(index);
      }
      onTabChange?.(index);
    },
  });

  const handleTabClick = (index: number) => {
    if (tabs[index]?.disabled) {
      return;
    }

    setCurrentIndex(index);

    if (!isControlled) {
      setUncontrolledTab(index);
    }
    onTabChange?.(index);
  };

  const selectedTab = tabs[selectedIndex];

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          gap: '0.25rem',
        }}
      >
        {tabs.map((tab, index) => {
          const itemProps = getItemProps(index);
          const isSelected = index === selectedIndex;

          return (
            <button
              key={tab.id}
              {...itemProps}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => handleTabClick(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: isSelected ? 600 : 400,
                color: tab.disabled ? '#9ca3af' : isSelected ? '#2563eb' : '#6b7280',
                borderBottom: isSelected ? '2px solid #2563eb' : 'none',
                marginBottom: '-2px',
                opacity: tab.disabled ? 0.5 : 1,
                transition: 'color 0.2s',
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {selectedTab && (
        <div
          id={`panel-${selectedTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${selectedTab.id}`}
          className={panelClassName}
          style={{
            padding: '1.5rem',
          }}
        >
          {selectedTab.content}
        </div>
      )}
    </div>
  );
};
