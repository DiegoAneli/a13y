/**
 * AccessibleDrawer Component
 * Accessible drawer/sidebar with focus trap and proper ARIA attributes
 */

import React, { useEffect, type ReactNode } from 'react';
import { useId } from '../hooks/use-id';
import { useFocusTrap } from '../hooks/use-focus-trap';
import { useReducedMotion } from '../hooks/use-reduced-motion';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface AccessibleDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Side from which the drawer appears */
  side?: DrawerSide;
  /** Whether drawer is modal (blocks interaction with background) */
  modal?: boolean;
  /** Drawer title */
  title?: string;
  /** Drawer content */
  children: ReactNode;
  /** Optional className for the drawer */
  className?: string;
  /** Optional className for the backdrop */
  backdropClassName?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible drawer/sidebar component with focus trap
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <AccessibleDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   side="right"
 *   modal
 *   title="Settings"
 * >
 *   <div>Drawer content here</div>
 * </AccessibleDrawer>
 * ```
 */
export const AccessibleDrawer: React.FC<AccessibleDrawerProps> = ({
  isOpen,
  onClose,
  side = 'right',
  modal = true,
  title,
  children,
  className = '',
  backdropClassName = '',
  style = {},
}) => {
  const drawerId = useId('drawer');
  const titleId = useId('drawer-title');

  const { trapRef } = useFocusTrap({
    isActive: isOpen && modal,
    onEscape: onClose,
  });

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen && modal) {
      // Prevent body scroll when modal drawer is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, modal]);

  if (!isOpen) return null;

  const getDrawerPosition = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 1000,
      backgroundColor: '#fff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: prefersReducedMotion ? 'none' : 'transform 0.3s ease-in-out',
    };

    switch (side) {
      case 'left':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '80vw',
        };
      case 'right':
        return {
          ...baseStyles,
          top: 0,
          right: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '80vw',
        };
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          height: '320px',
          maxHeight: '80vh',
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          height: '320px',
          maxHeight: '80vh',
        };
      default:
        return baseStyles;
    }
  };

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
    opacity: isOpen ? 1 : 0,
    transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease-in-out',
  };

  const drawerStyles: React.CSSProperties = {
    ...getDrawerPosition(),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    ...style,
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  };

  const closeButtonStyles: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    transition: 'background-color 0.2s',
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  };

  return (
    <>
      {modal && (
        <div
          className={backdropClassName}
          style={backdropStyles}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={modal ? (trapRef as React.RefObject<HTMLDivElement>) : null}
        id={drawerId}
        role="dialog"
        aria-modal={modal}
        aria-labelledby={title ? titleId : undefined}
        className={className}
        style={drawerStyles}
      >
        <div style={headerStyles}>
          {title && (
            <h2 id={titleId} style={titleStyles}>
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={closeButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        <div style={contentStyles}>{children}</div>
      </div>
    </>
  );
};
