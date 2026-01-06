/**
 * @a13y/core - Focus Manager
 * Manages focus restoration and visible focus indicators
 */

import { assertBrowser, devWarn } from '../env/environment';
import { FocusManagementError } from '../errors/accessibility-errors';

/**
 * Focus restoration stack
 * Stores history of focused elements for restoration
 */
class FocusStack {
  private stack: HTMLElement[] = [];
  private readonly maxSize = 10;

  push(element: HTMLElement): void {
    // Remove element if already in stack
    this.stack = this.stack.filter((el) => el !== element);

    // Add to top of stack
    this.stack.push(element);

    // Limit stack size
    if (this.stack.length > this.maxSize) {
      this.stack.shift();
    }
  }

  pop(): HTMLElement | null {
    return this.stack.pop() || null;
  }

  peek(): HTMLElement | null {
    return this.stack[this.stack.length - 1] || null;
  }

  clear(): void {
    this.stack = [];
  }

  has(element: HTMLElement): boolean {
    return this.stack.includes(element);
  }
}

/**
 * Global focus manager instance
 */
class FocusManagerClass {
  private focusStack = new FocusStack();
  private isTrackingFocus = false;
  private lastFocusedElement: HTMLElement | null = null;

  /**
   * Start tracking focus changes
   */
  startTracking(): void {
    if (this.isTrackingFocus) {
      return;
    }

    assertBrowser('FocusManager.startTracking');

    // Track focus changes
    document.addEventListener('focusin', this.handleFocusIn, true);

    this.isTrackingFocus = true;
  }

  /**
   * Stop tracking focus changes
   */
  stopTracking(): void {
    if (!this.isTrackingFocus) {
      return;
    }

    document.removeEventListener('focusin', this.handleFocusIn, true);
    this.isTrackingFocus = false;
    this.focusStack.clear();
  }

  private handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (target && target !== document.body) {
      this.lastFocusedElement = target;
      this.focusStack.push(target);
    }
  };

  /**
   * Save current focus for later restoration
   * Returns a restore function
   */
  saveFocus(): () => void {
    assertBrowser('FocusManager.saveFocus');

    const elementToRestore = (document.activeElement as HTMLElement) || this.lastFocusedElement;

    return () => {
      if (elementToRestore && document.body.contains(elementToRestore)) {
        this.restoreFocus(elementToRestore);
      } else {
        devWarn(false, 'Cannot restore focus: saved element no longer exists in the document');
      }
    };
  }

  /**
   * Restore focus to a specific element or last focused element
   */
  restoreFocus(element?: HTMLElement): void {
    assertBrowser('FocusManager.restoreFocus');

    const targetElement = element || this.focusStack.pop() || this.lastFocusedElement;

    if (!targetElement) {
      devWarn(false, 'Cannot restore focus: no element to restore to');
      return;
    }

    if (!document.body.contains(targetElement)) {
      devWarn(false, 'Cannot restore focus: element no longer exists in the document');
      return;
    }

    try {
      targetElement.focus();
    } catch (error) {
      throw new FocusManagementError(
        `Failed to restore focus to element: ${error instanceof Error ? error.message : String(error)}`,
        targetElement
      );
    }
  }

  /**
   * Move focus to an element with optional delay
   */
  moveFocus(element: HTMLElement, options: { delay?: number } = {}): void {
    assertBrowser('FocusManager.moveFocus');

    if (!document.body.contains(element)) {
      throw new FocusManagementError('Cannot move focus: element not in document', element);
    }

    const doFocus = (): void => {
      try {
        element.focus();
      } catch (error) {
        throw new FocusManagementError(
          `Failed to move focus: ${error instanceof Error ? error.message : String(error)}`,
          element
        );
      }
    };

    if (options.delay && options.delay > 0) {
      setTimeout(doFocus, options.delay);
    } else {
      doFocus();
    }
  }

  /**
   * Get the currently focused element
   */
  getCurrentFocus(): HTMLElement | null {
    assertBrowser('FocusManager.getCurrentFocus');
    return (document.activeElement as HTMLElement) || null;
  }

  /**
   * Check if focus is within a container
   */
  isFocusWithin(container: Element): boolean {
    assertBrowser('FocusManager.isFocusWithin');
    const activeElement = document.activeElement;
    return activeElement ? container.contains(activeElement) : false;
  }
}

/**
 * Singleton instance of FocusManager
 */
export const FocusManager = new FocusManagerClass();

/**
 * Visible focus indicator utilities
 */
export class FocusVisible {
  private static isUsingKeyboard = false;
  private static isListening = false;

  /**
   * Initialize focus-visible detection
   * Adds data-focus-visible-added attribute to elements when they should show focus ring
   */
  static init(): void {
    if (FocusVisible.isListening) {
      return;
    }

    assertBrowser('FocusVisible.init');

    // Mouse/touch interaction = not using keyboard
    document.addEventListener('mousedown', () => {
      FocusVisible.isUsingKeyboard = false;
    });

    document.addEventListener('touchstart', () => {
      FocusVisible.isUsingKeyboard = false;
    });

    // Keyboard interaction = using keyboard
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') {
        FocusVisible.isUsingKeyboard = true;
      }
    });

    // On focus, add attribute if using keyboard
    document.addEventListener(
      'focusin',
      (event) => {
        const target = event.target as HTMLElement;
        if (FocusVisible.isUsingKeyboard && target) {
          target.setAttribute('data-focus-visible-added', '');
        }
      },
      true
    );

    // On blur, remove attribute
    document.addEventListener(
      'focusout',
      (event) => {
        const target = event.target as HTMLElement;
        if (target) {
          target.removeAttribute('data-focus-visible-added');
        }
      },
      true
    );

    FocusVisible.isListening = true;
  }

  /**
   * Check if the current interaction is using keyboard
   */
  static isKeyboardMode(): boolean {
    return FocusVisible.isUsingKeyboard;
  }

  /**
   * Cleanup focus-visible listeners
   */
  static destroy(): void {
    FocusVisible.isListening = false;
    FocusVisible.isUsingKeyboard = false;
    // Note: We don't remove listeners as they're using capture and hard to track
  }
}
