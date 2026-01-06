/**
 * @a13y/react - AccessibleDialog Component
 * Type-safe dialog component with enforced title
 */

import type { ReactNode } from 'react';
import { useAccessibleDialog } from '../hooks/use-accessible-dialog';

/**
 * Props for AccessibleDialog
 */
export interface AccessibleDialogProps {
  /**
   * Whether dialog is open
   */
  isOpen: boolean;

  /**
   * Called when dialog should close
   */
  onClose: () => void;

  /**
   * Dialog title - REQUIRED for accessibility
   * This will be announced to screen readers
   */
  title: string;

  /**
   * Dialog content
   */
  children: ReactNode;

  /**
   * Optional description
   * Provides additional context to screen readers
   */
  description?: string;

  /**
   * ARIA role
   */
  role?: 'dialog' | 'alertdialog';

  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;

  /**
   * Custom className for dialog container
   */
  className?: string;

  /**
   * Custom className for backdrop
   */
  backdropClassName?: string;
}

/**
 * Accessible Dialog Component
 *
 * Features:
 * - Focus trap with Tab/Shift+Tab cycling
 * - Escape key to close
 * - Focus restoration on close
 * - Click outside to close
 * - Required title for screen readers
 * - Body scroll lock when open
 *
 * @example
 * ```tsx
 * <AccessibleDialog
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   description="This action cannot be undone"
 * >
 *   <p>Are you sure you want to delete this item?</p>
 *   <button onClick={handleConfirm}>Confirm</button>
 *   <button onClick={() => setIsOpen(false)}>Cancel</button>
 * </AccessibleDialog>
 * ```
 */
export const AccessibleDialog = (props: AccessibleDialogProps) => {
  const {
    isOpen,
    onClose,
    title,
    children,
    description,
    role = 'dialog',
    showCloseButton = true,
    className = '',
    backdropClassName = '',
  } = props;

  const { dialogProps, titleProps, descriptionProps, backdropProps, close } = useAccessibleDialog({
    isOpen,
    onClose,
    title,
    description,
    role,
    isModal: true,
    closeOnBackdropClick: true,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {backdropProps && (
        <div
          {...backdropProps}
          className={backdropClassName}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        />
      )}

      {/* Dialog */}
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
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          maxWidth: '32rem',
          width: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 51,
        }}
      >
        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={close}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        )}

        {/* Title */}
        <h2
          {...titleProps}
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: description ? '0.5rem' : '1rem',
            paddingRight: showCloseButton ? '2rem' : 0,
          }}
        >
          {title}
        </h2>

        {/* Description */}
        {descriptionProps && description && (
          <p
            {...descriptionProps}
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '1rem',
            }}
          >
            {description}
          </p>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </>
  );
};
