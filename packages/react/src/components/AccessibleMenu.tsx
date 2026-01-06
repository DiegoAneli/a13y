/**
 * @a13y/react - AccessibleMenu Component
 * Dropdown menu with keyboard navigation
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useAccessibleButton } from '../hooks/use-accessible-button';
import { useFocusTrap } from '../hooks/use-focus-trap';
import { useKeyboardNavigation } from '../hooks/use-keyboard-navigation';

/**
 * Menu item definition
 */
export interface MenuItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Item label
   */
  label: string;

  /**
   * Click handler
   */
  onPress: () => void;

  /**
   * Whether item is disabled
   */
  disabled?: boolean;

  /**
   * Optional icon
   */
  icon?: ReactNode;
}

/**
 * Props for AccessibleMenu
 */
export interface AccessibleMenuProps {
  /**
   * Menu trigger button label
   */
  label: string;

  /**
   * Trigger button content
   */
  trigger: ReactNode;

  /**
   * Menu items
   */
  items: MenuItem[];

  /**
   * Custom className for trigger button
   */
  className?: string;

  /**
   * Custom className for menu container
   */
  menuClassName?: string;
}

/**
 * Accessible Menu Component
 *
 * Dropdown menu with full keyboard navigation:
 * - Arrow Up/Down to navigate items
 * - Enter/Space to select
 * - Escape to close
 * - Focus trap when open
 *
 * @example
 * ```tsx
 * <AccessibleMenu
 *   label="Open actions menu"
 *   trigger="Actions ▼"
 *   items={[
 *     { id: 'edit', label: 'Edit', onPress: () => console.log('Edit') },
 *     { id: 'delete', label: 'Delete', onPress: () => console.log('Delete'), disabled: true },
 *     { id: 'share', label: 'Share', onPress: () => console.log('Share') },
 *   ]}
 * />
 * ```
 */
export const AccessibleMenu = (props: AccessibleMenuProps) => {
  const { label, trigger, items, className = '', menuClassName = '' } = props;

  const [isOpen, setIsOpen] = useState(false);

  // Trigger button
  const { buttonProps: triggerProps } = useAccessibleButton({
    label,
    onPress: () => setIsOpen(!isOpen),
  });

  // Focus trap for menu
  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    onEscape: () => setIsOpen(false),
    restoreFocus: true,
  });

  // Keyboard navigation for menu items
  const { getItemProps } = useKeyboardNavigation({
    orientation: 'vertical',
    loop: true,
  });

  const handleItemPress = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }
    item.onPress();
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger */}
      <button
        {...triggerProps}
        className={className}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        {trigger}
      </button>

      {/* Menu */}
      {isOpen && (
        <div
          ref={trapRef as React.RefObject<HTMLDivElement>}
          role="menu"
          aria-orientation="vertical"
          className={menuClassName}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.25rem)',
            left: 0,
            minWidth: '12rem',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '0.25rem',
            zIndex: 50,
          }}
        >
          {items.map((item, index) => {
            const itemProps = getItemProps(index);

            return (
              <button
                key={item.id}
                {...itemProps}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleItemPress(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  borderRadius: '0.25rem',
                  color: item.disabled ? '#9ca3af' : '#111827',
                  opacity: item.disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
