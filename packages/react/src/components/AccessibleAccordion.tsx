/**
 * AccessibleAccordion Component
 * Fully accessible accordion with ARIA attributes and keyboard navigation
 */

import React, { useState, type ReactNode } from 'react';
import { useId } from '../hooks/use-id';

export interface AccordionItem {
  /** Unique identifier for the item */
  id: string;
  /** Title/header for the accordion item */
  title: string;
  /** Content to display when expanded */
  content: ReactNode;
  /** Whether this item is disabled */
  disabled?: boolean;
}

export interface AccessibleAccordionProps {
  /** Array of accordion items */
  items: AccordionItem[];
  /** Allow multiple items to be open at once */
  allowMultiple?: boolean;
  /** IDs of items that should be open by default */
  defaultOpenItems?: string[];
  /** Callback when item is toggled */
  onToggle?: (itemId: string, isOpen: boolean) => void;
  /** Optional className for the container */
  className?: string;
  /** Optional className for each item */
  itemClassName?: string;
  /** Optional className for headers */
  headerClassName?: string;
  /** Optional className for content */
  contentClassName?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible accordion component with keyboard navigation
 *
 * @example
 * ```tsx
 * const items = [
 *   {
 *     id: '1',
 *     title: 'What is accessibility?',
 *     content: 'Accessibility ensures that people with disabilities can use your website.'
 *   },
 *   {
 *     id: '2',
 *     title: 'Why is it important?',
 *     content: 'It makes your content available to everyone, regardless of ability.'
 *   }
 * ];
 *
 * <AccessibleAccordion
 *   items={items}
 *   allowMultiple={false}
 *   defaultOpenItems={['1']}
 * />
 * ```
 */
export const AccessibleAccordion: React.FC<AccessibleAccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenItems = [],
  onToggle,
  className = '',
  itemClassName = '',
  headerClassName = '',
  contentClassName = '',
  style = {},
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(defaultOpenItems)
  );

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const newOpenItems = new Set(prev);

      if (newOpenItems.has(itemId)) {
        newOpenItems.delete(itemId);
        onToggle?.(itemId, false);
      } else {
        if (!allowMultiple) {
          newOpenItems.clear();
        }
        newOpenItems.add(itemId);
        onToggle?.(itemId, true);
      }

      return newOpenItems;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent, itemId: string, index: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item?.disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleItem(itemId);
        break;

      case 'ArrowDown':
        event.preventDefault();
        focusNextItem(index);
        break;

      case 'ArrowUp':
        event.preventDefault();
        focusPreviousItem(index);
        break;

      case 'Home':
        event.preventDefault();
        focusFirstItem();
        break;

      case 'End':
        event.preventDefault();
        focusLastItem();
        break;
    }
  };

  const focusNextItem = (currentIndex: number) => {
    const nextIndex = (currentIndex + 1) % items.length;
    focusItemByIndex(nextIndex);
  };

  const focusPreviousItem = (currentIndex: number) => {
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    focusItemByIndex(prevIndex);
  };

  const focusFirstItem = () => {
    focusItemByIndex(0);
  };

  const focusLastItem = () => {
    focusItemByIndex(items.length - 1);
  };

  const focusItemByIndex = (index: number) => {
    const button = document.querySelector(
      `[data-accordion-button][data-index="${index}"]`
    ) as HTMLButtonElement;
    button?.focus();
  };

  const containerStyles: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    ...style,
  };

  const itemStyles: React.CSSProperties = {
    borderBottom: '1px solid #e5e7eb',
  };

  const headerStyles: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#fff',
    border: 'none',
    textAlign: 'left',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  };

  const contentStyles: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#f9fafb',
  };

  const iconStyles = (isOpen: boolean): React.CSSProperties => ({
    transition: 'transform 0.2s',
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  });

  return (
    <div className={className} style={containerStyles}>
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        const buttonId = useId(`accordion-button-${item.id}`);
        const panelId = useId(`accordion-panel-${item.id}`);

        return (
          <div
            key={item.id}
            className={itemClassName}
            style={{ ...itemStyles, borderBottom: index === items.length - 1 ? 'none' : itemStyles.borderBottom }}
          >
            <h3 style={{ margin: 0 }}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={item.disabled}
                disabled={item.disabled}
                onClick={() => !item.disabled && toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id, index)}
                className={headerClassName}
                style={{
                  ...headerStyles,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  opacity: item.disabled ? 0.6 : 1,
                }}
                data-accordion-button
                data-index={index}
                onMouseEnter={(e) => !item.disabled && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <span>{item.title}</span>
                <span aria-hidden="true" style={iconStyles(isOpen)}>
                  ▼
                </span>
              </button>
            </h3>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={contentClassName}
                style={contentStyles}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
