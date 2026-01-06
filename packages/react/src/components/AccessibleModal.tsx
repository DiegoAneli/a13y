/**
 * @a13y/react - AccessibleModal Component
 * Full-screen modal with header, body, footer sections
 */

import type { ReactNode } from 'react';
import { useAccessibleDialog } from '../hooks/use-accessible-dialog';

/**
 * Props for AccessibleModal
 */
export interface AccessibleModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Modal title - REQUIRED
   */
  title: string;

  /**
   * Modal body content
   */
  children: ReactNode;

  /**
   * Footer content (typically action buttons)
   */
  footer?: ReactNode;

  /**
   * Modal size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  /**
   * Whether modal can be closed by clicking outside
   */
  closeOnBackdropClick?: boolean;

  /**
   * Custom className for modal container
   */
  className?: string;
}

/**
 * Accessible Modal Component
 *
 * Full-featured modal with header, body, and footer sections.
 *
 * @example
 * ```tsx
 * <AccessibleModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Edit Profile"
 *   size="md"
 *   footer={
 *     <>
 *       <AccessibleButton onPress={() => setIsOpen(false)}>
 *         Cancel
 *       </AccessibleButton>
 *       <AccessibleButton onPress={handleSave} variant="primary">
 *         Save Changes
 *       </AccessibleButton>
 *     </>
 *   }
 * >
 *   <form>
 *     <input type="text" placeholder="Name" />
 *     <input type="email" placeholder="Email" />
 *   </form>
 * </AccessibleModal>
 * ```
 */
export const AccessibleModal = (props: AccessibleModalProps) => {
  const {
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnBackdropClick = false,
    className = '',
  } = props;

  const { dialogProps, titleProps, backdropProps, close } = useAccessibleDialog({
    isOpen,
    onClose,
    title,
    role: 'dialog',
    isModal: true,
    closeOnBackdropClick,
  });

  if (!isOpen) {
    return null;
  }

  // Size variants
  const sizeStyles: Record<NonNullable<AccessibleModalProps['size']>, React.CSSProperties> = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '48rem' },
    xl: { maxWidth: '64rem' },
    full: { maxWidth: '95vw', maxHeight: '95vh' },
  };

  return (
    <>
      {/* Backdrop */}
      {backdropProps && (
        <div
          {...backdropProps}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        />
      )}

      {/* Modal */}
      <div
        ref={dialogProps.ref as React.RefObject<HTMLDivElement>}
        role={dialogProps.role}
        aria-labelledby={dialogProps['aria-labelledby']}
        aria-describedby={dialogProps['aria-describedby']}
        aria-modal={dialogProps['aria-modal']}
        tabIndex={dialogProps.tabIndex}
        className={className}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 51,
          ...sizeStyles[size],
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            {...titleProps}
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={close}
            aria-label="Close modal"
            style={{
              padding: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              color: '#6b7280',
              borderRadius: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
