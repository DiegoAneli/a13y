/**
 * @a13y/react - Hooks
 * Type-safe React hooks for accessibility
 */

export type {
  AccessibleButtonProps,
  PressEvent,
  UseAccessibleButtonProps,
  UseAccessibleButtonReturn,
} from './use-accessible-button';
export { useAccessibleButton } from './use-accessible-button';
export type {
  DialogBackdropProps,
  DialogContainerProps,
  DialogDescriptionProps,
  DialogTitleProps,
  UseAccessibleDialogProps,
  UseAccessibleDialogReturn,
} from './use-accessible-dialog';
export { useAccessibleDialog } from './use-accessible-dialog';
export type {
  UseFocusTrapProps,
  UseFocusTrapReturn,
} from './use-focus-trap';
export { useFocusTrap } from './use-focus-trap';
export type {
  NavigableItemProps,
  UseKeyboardNavigationProps,
  UseKeyboardNavigationReturn,
} from './use-keyboard-navigation';
export { useKeyboardNavigation } from './use-keyboard-navigation';

export type {
  FieldConfig,
  FieldProps,
  FieldValidator,
  FormConfig,
  FormState,
  FormValidator,
  UseAccessibleFormReturn,
} from './use-accessible-form';
export { useAccessibleForm } from './use-accessible-form';

export type {
  RequireLabel,
  UseFormFieldProps,
  UseFormFieldReturn,
} from './use-form-field';
export { useFormField } from './use-form-field';

// New utility hooks
export { useId } from './use-id';
export { useReducedMotion } from './use-reduced-motion';
export { useClickOutside } from './use-click-outside';
export { useMediaQuery } from './use-media-query';
export type {
  AriaLivePoliteness,
  UseAriaLiveReturn,
} from './use-aria-live';
export { useAriaLive } from './use-aria-live';
export { useAnnounce } from './use-announce';
