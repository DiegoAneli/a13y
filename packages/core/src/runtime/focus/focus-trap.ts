/**
 * @a13y/core - Focus Trap
 * Traps focus within a container element (e.g., for modals/dialogs)
 */

import { getFocusableElements } from '../aria/aria-utils';
import { assertBrowser, devWarn } from '../env/environment';
import { FocusManagementError } from '../errors/accessibility-errors';

export interface FocusTrapOptions {
  /**
   * Element to focus when trap is activated
   * If not provided, focuses the first focusable element
   */
  initialFocus?: HTMLElement;

  /**
   * Element to focus when trap is deactivated
   * If not provided, returns focus to previously focused element
   */
  returnFocus?: HTMLElement | boolean;

  /**
   * Allow clicking outside to deactivate the trap
   * @default false
   */
  clickOutsideDeactivates?: boolean;

  /**
   * Callback when user tries to escape (e.g., pressing Escape key)
   */
  onEscape?: () => void;
}

export interface FocusTrap {
  /**
   * Activate the focus trap
   */
  activate: () => void;

  /**
   * Deactivate the focus trap
   */
  deactivate: () => void;

  /**
   * Check if the trap is currently active
   */
  isActive: () => boolean;

  /**
   * Update the trap's focusable elements
   * Call this if the container's children change
   */
  update: () => void;
}

/**
 * Create a focus trap for a container element
 * Returns an object with activate/deactivate methods
 */
export const createFocusTrap = (
  container: HTMLElement,
  options: FocusTrapOptions = {}
): FocusTrap => {
  assertBrowser('createFocusTrap');

  let isActive = false;
  let previouslyFocusedElement: HTMLElement | null = null;
  let focusableElements: HTMLElement[] = [];

  const updateFocusableElements = (): void => {
    focusableElements = getFocusableElements(container);

    if (isActive && focusableElements.length === 0) {
      devWarn(
        false,
        'Focus trap container has no focusable elements. ' +
          'Add at least one focusable element or set tabindex="-1" on the container.'
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') {
      if (event.key === 'Escape' && options.onEscape) {
        options.onEscape();
      }
      return;
    }

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (!firstElement || !lastElement) {
      return;
    }

    // Shift + Tab
    if (event.shiftKey) {
      if (activeElement === firstElement || !container.contains(activeElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    }
    // Tab
    else {
      if (activeElement === lastElement || !container.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (!options.clickOutsideDeactivates) {
      return;
    }

    const target = event.target as Node;
    if (!container.contains(target)) {
      deactivate();
    }
  };

  const activate = (): void => {
    if (isActive) {
      devWarn(false, 'Focus trap is already active');
      return;
    }

    // Store previously focused element
    previouslyFocusedElement = document.activeElement as HTMLElement;

    // Update focusable elements
    updateFocusableElements();

    if (focusableElements.length === 0) {
      // If no focusable elements, make container focusable
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
        container.focus();
        focusableElements = [container];
      } else {
        throw new FocusManagementError(
          'Focus trap container has no focusable elements and no tabindex attribute',
          container
        );
      }
    }

    // Focus initial element
    const initialFocus = options.initialFocus || focusableElements[0];
    if (initialFocus) {
      // Use setTimeout to ensure focus happens after render
      setTimeout(() => {
        initialFocus.focus();
      }, 0);
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    if (options.clickOutsideDeactivates) {
      document.addEventListener('mousedown', handleClickOutside, true);
    }

    isActive = true;
  };

  const deactivate = (): void => {
    if (!isActive) {
      return;
    }

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('mousedown', handleClickOutside, true);

    // Restore focus
    if (options.returnFocus !== false) {
      const returnTarget =
        typeof options.returnFocus === 'object' && options.returnFocus instanceof HTMLElement
          ? options.returnFocus
          : previouslyFocusedElement;

      if (returnTarget && document.body.contains(returnTarget)) {
        setTimeout(() => {
          returnTarget.focus();
        }, 0);
      }
    }

    isActive = false;
    previouslyFocusedElement = null;
  };

  return {
    activate,
    deactivate,
    isActive: () => isActive,
    update: updateFocusableElements,
  };
};
