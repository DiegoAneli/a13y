/**
 * AccessibleBreadcrumb Component
 * Accessible breadcrumb navigation with proper ARIA attributes
 */

import React, { type ReactNode } from 'react';

export interface BreadcrumbItem {
  /** Label to display */
  label: string;
  /** Optional href for link */
  href?: string;
  /** Optional click handler (alternative to href) */
  onClick?: () => void;
}

export interface AccessibleBreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Optional separator between items */
  separator?: ReactNode;
  /** Optional aria-label for the navigation */
  ariaLabel?: string;
  /** Optional className for the nav element */
  className?: string;
  /** Optional className for items */
  itemClassName?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible breadcrumb navigation component
 *
 * @example
 * ```tsx
 * const items = [
 *   { label: 'Home', href: '/' },
 *   { label: 'Products', href: '/products' },
 *   { label: 'Electronics', href: '/products/electronics' },
 *   { label: 'Laptops' }
 * ];
 *
 * <AccessibleBreadcrumb items={items} />
 * ```
 */
export const AccessibleBreadcrumb: React.FC<AccessibleBreadcrumbProps> = ({
  items,
  separator = '/',
  ariaLabel = 'Breadcrumb',
  className = '',
  itemClassName = '',
  style = {},
}) => {
  if (items.length === 0) return null;

  const navStyles: React.CSSProperties = {
    ...style,
  };

  const listStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    flexWrap: 'wrap',
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const linkStyles: React.CSSProperties = {
    color: '#3b82f6',
    textDecoration: 'none',
    transition: 'color 0.2s',
  };

  const currentStyles: React.CSSProperties = {
    color: '#6b7280',
    fontWeight: 500,
  };

  const separatorStyles: React.CSSProperties = {
    color: '#9ca3af',
    userSelect: 'none',
  };

  return (
    <nav aria-label={ariaLabel} className={className} style={navStyles}>
      <ol style={listStyles}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast;

          return (
            <li key={index} className={itemClassName} style={itemStyles}>
              {isCurrent ? (
                <span aria-current="page" style={currentStyles}>
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  style={linkStyles}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
                >
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  style={{
                    ...linkStyles,
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
                >
                  {item.label}
                </button>
              ) : (
                <span style={currentStyles}>{item.label}</span>
              )}
              {!isLast && (
                <span aria-hidden="true" style={separatorStyles}>
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
