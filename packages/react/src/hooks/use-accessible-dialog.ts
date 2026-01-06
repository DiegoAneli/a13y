/**
 * @a13y/react - useAccessibleDialog
 * Type-safe dialog/modal hook with full ARIA support
 */

import type { AriaRole } from 'react';
import { useEffect, useId, useRef } from 'react';
import { useFocusTrap } from './use-focus-trap';

/**
 * Props for useAccessibleDialog
 */
export interface UseAccessibleDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;

  /**
   * Callback when dialog should close
   * Called on Escape key or backdrop click
   */
  onClose: () => void;

  /**
   * Dialog title - REQUIRED for accessibility
   * This becomes the aria-labelledby target
   */
  title: string;

  /**
   * Optional dialog description
   * This becomes the aria-describedby target
   */
  description?: string;

  /**
   * ARIA role
   * @default 'dialog'
   */
  role?: Extract<AriaRole, 'dialog' | 'alertdialog'>;

  /**
   * Whether dialog is modal (blocking)
   * @default true
   */
  isModal?: boolean;

  /**
   * Whether clicking backdrop closes dialog
   * @default true
   */
  closeOnBackdropClick?: boolean;
}

/**
 * Dialog container props
 */
export interface DialogContainerProps {
  ref: React.RefObject<HTMLElement | null>;
  role: AriaRole;
  'aria-labelledby': string;
  'aria-describedby'?: string;
  'aria-modal': boolean;
  tabIndex: -1;
}

/**
 * Title props
 */
export interface DialogTitleProps {
  id: string;
}

/**
 * Description props
 */
export interface DialogDescriptionProps {
  id: string;
}

/**
 * Backdrop props
 */
export interface DialogBackdropProps {
  onClick: () => void;
  'aria-hidden': true;
}

/**
 * Return type
 */
export interface UseAccessibleDialogReturn {
  dialogProps: DialogContainerProps;
  titleProps: DialogTitleProps;
  descriptionProps: DialogDescriptionProps | null;
  backdropProps: DialogBackdropProps | null;
  close: () => void;
}

/**
 * Hook for creating accessible dialogs/modals
 *
 * Features:
 * - Focus trap with Tab/Shift+Tab cycling
 * - Escape key to close
 * - Focus restoration on close
 * - ARIA attributes (modal, labelledby, describedby)
 * - Backdrop click handling
 * - Development-time validation
 *
 * @example
 * ```tsx
 * const { dialogProps, titleProps, descriptionProps, backdropProps } =
 *   useAccessibleDialog({
 *     isOpen,
 *     onClose: () => setIsOpen(false),
 *     title: 'Delete Item',
 *     description: 'This action cannot be undone',
 *   });
 *
 * if (!isOpen) return null;
 *
 * return (
 *   <>
 *     <div {...backdropProps} />
 *     <div {...dialogProps}>
 *       <h2 {...titleProps}>Delete Item</h2>
 *       <p {...descriptionProps}>This action cannot be undone</p>
 *       <button onClick={close}>Cancel</button>
 *     </div>
 *   </>
 * );
 * ```
 */
export const useAccessibleDialog = (props: UseAccessibleDialogProps): UseAccessibleDialogReturn => {
  const {
    isOpen,
    onClose,
    title,
    description,
    role = 'dialog',
    isModal = true,
    closeOnBackdropClick = true,
  } = props;

  // Compile-time validation: title is required
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (!title || title.trim().length === 0) {
      throw new Error(
        '@a13y/react [useAccessibleDialog]: "title" prop is required for accessibility'
      );
    }
  }

  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Focus trap
  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    onEscape: onClose,
    restoreFocus: true,
    autoFocus: true,
  });

  // Sync refs (trapRef and dialogRef point to same element)
  useEffect(() => {
    if (dialogRef.current && trapRef.current !== dialogRef.current) {
      (trapRef as React.MutableRefObject<HTMLElement | null>).current = dialogRef.current;
    }
  }, [trapRef]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (!isOpen || !isModal) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isModal]);

  // Development-time validation
  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && __DEV__ && isOpen) {
      import('@a13y/devtools/runtime/invariants').then(
        ({ assertHasAccessibleName, assertValidAriaAttributes }) => {
          if (dialogRef.current) {
            assertHasAccessibleName(dialogRef.current, 'useAccessibleDialog');
            assertValidAriaAttributes(dialogRef.current);
          }
        }
      );
    }
  }, [isOpen]);

  const dialogProps: DialogContainerProps = {
    ref: dialogRef,
    role,
    'aria-labelledby': titleId,
    'aria-describedby': description ? descriptionId : undefined,
    'aria-modal': isModal,
    tabIndex: -1,
  };

  const titleProps: DialogTitleProps = {
    id: titleId,
  };

  const descriptionProps: DialogDescriptionProps | null = description
    ? { id: descriptionId }
    : null;

  const backdropProps: DialogBackdropProps | null =
    closeOnBackdropClick && isModal
      ? {
          onClick: onClose,
          'aria-hidden': true,
        }
      : null;

  return {
    dialogProps,
    titleProps,
    descriptionProps,
    backdropProps,
    close: onClose,
  };
};
