/**
 * @a13y/react - useFocusTrap
 * Focus trap hook for modals and dialogs
 */

import type { FocusTrap } from '@a13y/core/runtime/focus';
import { useEffect, useRef } from 'react';

/**
 * Props for useFocusTrap
 */
export interface UseFocusTrapProps {
  /**
   * Whether the focus trap is active
   */
  isActive: boolean;

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void;

  /**
   * Whether to restore focus when trap is deactivated
   * @default true
   */
  restoreFocus?: boolean;

  /**
   * Whether to auto-focus first element when activated
   * @default true
   */
  autoFocus?: boolean;
}

/**
 * Return type
 */
export interface UseFocusTrapReturn {
  /**
   * Ref to attach to the container element
   */
  trapRef: React.RefObject<HTMLElement | null>;
}

/**
 * Hook for creating focus traps
 *
 * Features:
 * - Traps Tab/Shift+Tab within container
 * - Handles Escape key
 * - Restores focus on deactivation
 * - Auto-focuses first element
 * - Development-time validation
 *
 * @example
 * ```tsx
 * const { trapRef } = useFocusTrap({
 *   isActive: isOpen,
 *   onEscape: () => setIsOpen(false),
 * });
 *
 * return (
 *   <div ref={trapRef} role="dialog">
 *     <button>Close</button>
 *   </div>
 * );
 * ```
 */
export const useFocusTrap = (props: UseFocusTrapProps): UseFocusTrapReturn => {
  const { isActive, onEscape, restoreFocus = true, autoFocus = true } = props;

  const trapRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !trapRef.current) {
      return;
    }

    // Save previous focus
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Create focus trap
    import('@a13y/core/runtime/focus').then(({ createFocusTrap }) => {
      if (!trapRef.current) {
        return;
      }

      const options: import('@a13y/core/runtime/focus').FocusTrapOptions = {
        returnFocus: false,
        onEscape: onEscape,
      };

      // Only set initialFocus if autoFocus is enabled
      if (autoFocus) {
        // undefined means auto-focus first focusable element
        options.initialFocus = undefined;
      }

      const trap = createFocusTrap(trapRef.current, options);

      trap.activate();
      focusTrapRef.current = trap;

      // Development-time validation
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        import('@a13y/devtools/runtime/validators').then(({ focusValidator }) => {
          if (trapRef.current) {
            focusValidator.validateFocusTrap(trapRef.current, true);
          }
        });
      }
    });

    // Cleanup
    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        focusTrapRef.current = null;
      }

      // Restore focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();

        // Validate focus restoration in dev
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          import('@a13y/devtools/runtime/validators').then(({ focusValidator }) => {
            if (previousFocusRef.current) {
              focusValidator.expectFocusRestoration(
                previousFocusRef.current,
                'focus trap deactivation'
              );
            }
          });
        }
      }
    };
  }, [isActive, onEscape, restoreFocus, autoFocus]);

  return {
    trapRef,
  };
};
