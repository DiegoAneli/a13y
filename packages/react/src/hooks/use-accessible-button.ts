/**
 * @a13y/react - useAccessibleButton
 * Type-safe button hook with keyboard support
 */

import type { AriaRole } from 'react';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Button press event (mouse or keyboard)
 */
export interface PressEvent {
  type: 'mouse' | 'keyboard';
  key?: string;
}

/**
 * Props for useAccessibleButton
 */
export interface UseAccessibleButtonProps {
  /**
   * Accessible label for the button
   * Required if button content is not text (e.g., icon-only)
   */
  label?: string;

  /**
   * Press handler - called on click or Enter/Space
   */
  onPress: (event: PressEvent) => void;

  /**
   * Whether the button is disabled
   */
  isDisabled?: boolean;

  /**
   * ARIA role override
   * @default 'button'
   */
  role?: Extract<AriaRole, 'button' | 'link'>;

  /**
   * Element type - only 'button' or 'a' allowed
   * @default 'button'
   */
  elementType?: 'button' | 'a';
}

/**
 * Button props returned by the hook
 */
export interface AccessibleButtonProps {
  role: AriaRole;
  tabIndex: number;
  'aria-label'?: string;
  'aria-disabled'?: boolean;
  disabled?: boolean;
  onPointerDown: (event: React.PointerEvent) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Return type
 */
export interface UseAccessibleButtonReturn {
  buttonProps: AccessibleButtonProps;
  isPressed: boolean;
}

/**
 * Hook for creating accessible buttons
 *
 * Features:
 * - Keyboard support (Enter, Space)
 * - Disabled state handling
 * - Automatic ARIA attributes
 * - Development-time validation
 *
 * @example
 * ```tsx
 * const { buttonProps } = useAccessibleButton({
 *   label: 'Delete item',
 *   onPress: () => console.log('Pressed!'),
 * });
 *
 * return <button {...buttonProps}>🗑️</button>;
 * ```
 */
export const useAccessibleButton = (props: UseAccessibleButtonProps): UseAccessibleButtonReturn => {
  const { label, onPress, isDisabled = false, role = 'button', elementType = 'button' } = props;

  const buttonRef = useRef<HTMLElement | null>(null);
  const isPressedRef = useRef(false);

  // Development-time validation
  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      import('@a13y/devtools/runtime/invariants').then(
        ({ assertHasAccessibleName, assertKeyboardAccessible }) => {
          if (buttonRef.current) {
            // Validate accessible name
            assertHasAccessibleName(buttonRef.current, 'useAccessibleButton');

            // Validate keyboard accessibility
            assertKeyboardAccessible(buttonRef.current, 'useAccessibleButton');
          }
        }
      );
    }
  }, []);

  const handlePress = useCallback(
    (event: PressEvent) => {
      if (isDisabled) {
        return;
      }
      onPress(event);
    },
    [onPress, isDisabled]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      isPressedRef.current = true;
      handlePress({ type: 'mouse' });
    },
    [handlePress, isDisabled]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      // Enter or Space activates button
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePress({ type: 'keyboard', key: event.key });
      }
    },
    [handlePress, isDisabled]
  );

  const buttonProps: AccessibleButtonProps = {
    role,
    tabIndex: isDisabled ? -1 : 0,
    'aria-label': label,
    'aria-disabled': isDisabled ? true : undefined,
    disabled: elementType === 'button' ? isDisabled : undefined,
    onPointerDown: handlePointerDown,
    onKeyDown: handleKeyDown,
  };

  return {
    buttonProps,
    isPressed: isPressedRef.current,
  };
};
