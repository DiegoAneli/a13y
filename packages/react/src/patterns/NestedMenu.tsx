/**
 * @a13y/react - NestedMenu Pattern
 * Multi-level dropdown menu with keyboard navigation
 */

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAccessibleButton } from '../hooks/use-accessible-button';
import { useKeyboardNavigation } from '../hooks/use-keyboard-navigation';

/**
 * Menu item with optional submenu
 */
export interface NestedMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /**
   * Action when item is selected
   * Omit for items with submenu
   */
  onPress?: () => void;
  /**
   * Submenu items
   */
  submenu?: NestedMenuItem[];
}

/**
 * Props for NestedMenu
 */
export interface NestedMenuProps {
  /**
   * Menu trigger label for screen readers
   */
  label: string;
  /**
   * Trigger content
   */
  trigger: ReactNode;
  /**
   * Menu items (can have nested submenus)
   */
  items: NestedMenuItem[];
  /**
   * Custom className for trigger
   */
  className?: string;
}

/**
 * Nested Menu Component
 *
 * Multi-level dropdown menu with full keyboard navigation:
 * - Arrow Up/Down: Navigate items
 * - Arrow Right: Open submenu
 * - Arrow Left: Close submenu and return to parent
 * - Enter/Space: Select item or open submenu
 * - Escape: Close current menu level
 *
 * Pattern Explanation:
 * - Each submenu level maintains its own navigation state
 * - Arrow Right on item with submenu opens it
 * - Arrow Left closes submenu and returns focus to parent item
 * - Screen readers announce submenu availability via aria-haspopup
 * - Submenus are positioned relative to parent items
 * - Focus is trapped within the active menu level
 *
 * @example
 * ```tsx
 * <NestedMenu
 *   label="File menu"
 *   trigger="File ▼"
 *   items={[
 *     {
 *       id: 'new',
 *       label: 'New',
 *       submenu: [
 *         { id: 'file', label: 'File', onPress: () => console.log('New File') },
 *         { id: 'folder', label: 'Folder', onPress: () => console.log('New Folder') },
 *       ],
 *     },
 *     { id: 'open', label: 'Open', onPress: () => console.log('Open') },
 *     {
 *       id: 'recent',
 *       label: 'Open Recent',
 *       submenu: [
 *         { id: 'file1', label: 'document.txt', onPress: () => {} },
 *         { id: 'file2', label: 'project.json', onPress: () => {} },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export const NestedMenu = (props: NestedMenuProps) => {
  const { label, trigger, items, className = '' } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  // Trigger button
  const { buttonProps } = useAccessibleButton({
    label,
    onPress: () => setIsOpen(!isOpen),
  });

  // Close menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setOpenSubmenuId(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        {...buttonProps}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={className}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          backgroundColor: 'white',
          cursor: 'pointer',
        }}
      >
        {trigger}
      </button>

      {isOpen && (
        <MenuLevel
          items={items}
          onClose={() => setIsOpen(false)}
          openSubmenuId={openSubmenuId}
          onSubmenuChange={setOpenSubmenuId}
          depth={0}
        />
      )}
    </div>
  );
};

/**
 * Single menu level (supports recursion for submenus)
 */
interface MenuLevelProps {
  items: NestedMenuItem[];
  onClose: () => void;
  openSubmenuId: string | null;
  onSubmenuChange: (id: string | null) => void;
  depth: number;
}

const MenuLevel = (props: MenuLevelProps) => {
  const { items, onClose, openSubmenuId, onSubmenuChange, depth } = props;

  const menuRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const { getItemProps, setCurrentIndex } = useKeyboardNavigation({
    orientation: 'vertical',
    loop: true,
  });

  const handleItemKeyDown = (e: React.KeyboardEvent, item: NestedMenuItem) => {
    // Arrow Right: Open submenu
    if (e.key === 'ArrowRight' && item.submenu) {
      e.preventDefault();
      e.stopPropagation();
      onSubmenuChange(item.id);
    }

    // Arrow Left: Close submenu (only if this is a submenu)
    if (e.key === 'ArrowLeft' && depth > 0) {
      e.preventDefault();
      e.stopPropagation();
      onSubmenuChange(null);
    }

    // Enter/Space: Execute action or open submenu
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();

      if (item.submenu) {
        onSubmenuChange(item.id);
      } else if (item.onPress && !item.disabled) {
        item.onPress();
        onClose();
      }
    }
  };

  const handleItemClick = (item: NestedMenuItem) => {
    if (item.disabled) return;

    if (item.submenu) {
      onSubmenuChange(openSubmenuId === item.id ? null : item.id);
    } else if (item.onPress) {
      item.onPress();
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      style={{
        position: depth === 0 ? 'absolute' : 'absolute',
        top: depth === 0 ? 'calc(100% + 0.25rem)' : 0,
        left: depth === 0 ? 0 : '100%',
        minWidth: '12rem',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.375rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        padding: '0.25rem',
        zIndex: 50 + depth,
      }}
    >
      {items.map((item, index) => {
        const itemProps = getItemProps(index);
        const hasSubmenu = !!item.submenu;
        const isSubmenuOpen = openSubmenuId === item.id;

        return (
          <div key={item.id} style={{ position: 'relative' }}>
            <button
              {...itemProps}
              role="menuitem"
              aria-haspopup={hasSubmenu ? 'true' : undefined}
              aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
              disabled={item.disabled}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleItemKeyDown(e, item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
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
                  setCurrentIndex(index);
                  if (hasSubmenu) {
                    onSubmenuChange(item.id);
                  }
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </span>
              {hasSubmenu && <span aria-hidden="true">▶</span>}
            </button>

            {/* Render submenu recursively */}
            {hasSubmenu && isSubmenuOpen && item.submenu && (
              <MenuLevel
                items={item.submenu}
                onClose={onClose}
                openSubmenuId={null}
                onSubmenuChange={() => {}}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
