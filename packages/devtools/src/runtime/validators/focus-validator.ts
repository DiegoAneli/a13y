/**
 * @a13y/devtools - Focus Validator
 * Validates focus management and visual focus indicators
 */

import { isDevelopment } from '@a13y/core/runtime/env';
import { createWarning, WarningSystem } from '../warnings/warning-system';
import { WarningCodes, WCAGUrls } from '../warnings/warning-types';

/**
 * Focus validator class
 */
export class FocusValidator {
  private focusHistory: Element[] = [];
  private isActive = false;

  /**
   * Start monitoring focus changes
   */
  start(): void {
    if (!isDevelopment() || this.isActive) {
      return;
    }

    document.addEventListener('focusin', this.handleFocusIn);
    document.addEventListener('focusout', this.handleFocusOut);

    this.isActive = true;
  }

  /**
   * Stop monitoring focus changes
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    document.removeEventListener('focusin', this.handleFocusIn);
    document.removeEventListener('focusout', this.handleFocusOut);

    this.isActive = false;
    this.focusHistory = [];
  }

  /**
   * Validate that focus is visible
   */
  validateFocusVisible(element: Element): void {
    if (!isDevelopment()) {
      return;
    }

    if (!(element instanceof HTMLElement)) {
      return;
    }

    // Check if element has visible focus indicator
    const computedStyle = window.getComputedStyle(element);
    const outline = computedStyle.outline;
    const outlineWidth = computedStyle.outlineWidth;

    const hasFocusIndicator = outline !== 'none' && outlineWidth !== '0px' && outlineWidth !== '0';

    if (!hasFocusIndicator) {
      // Check for custom focus styles (data-focus-visible-added or :focus-visible support)
      const hasCustomFocus =
        element.hasAttribute('data-focus-visible-added') || element.matches(':focus-visible');

      if (!hasCustomFocus) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.FOCUS_NOT_VISIBLE,
            severity: 'warn',
            category: 'focus-management',
            message: 'Focused element has no visible focus indicator',
            element,
            wcag: {
              criterion: '2.4.7',
              level: 'AA',
              url: WCAGUrls['2.4.7'],
            },
            fixes: [
              {
                description: 'Add a visible outline or border on focus',
                example: `.my-element:focus {
  outline: 2px solid blue;
  outline-offset: 2px;
}`,
              },
              {
                description: 'Use :focus-visible for keyboard-only focus indicators',
                example: `.my-element:focus-visible {
  outline: 2px solid blue;
}`,
              },
              {
                description: 'Use FocusVisible from @a13y/core',
                example: `import { FocusVisible } from '@a13y/core/runtime/focus';
FocusVisible.init();

// Then in CSS:
[data-focus-visible-added] {
  outline: 2px solid blue;
}`,
              },
            ],
          })
        );
      }
    }
  }

  /**
   * Validate focus trap
   */
  validateFocusTrap(container: Element, expectedTrapped: boolean): void {
    if (!isDevelopment()) {
      return;
    }

    // Simulate Tab key to check if focus escapes
    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length === 0) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.FOCUS_TRAP_BROKEN,
          severity: 'error',
          category: 'focus-management',
          message: 'Focus trap container has no focusable elements',
          element: container,
          wcag: {
            criterion: '2.1.2',
            level: 'A',
            url: WCAGUrls['2.1.2'],
          },
          fixes: [
            {
              description: 'Add at least one focusable element inside the container',
              example: `<div role="dialog">
  <button>Close</button>
</div>`,
            },
            {
              description: 'Make container focusable with tabindex="-1"',
              example: `<div role="dialog" tabindex="-1">
  Content
</div>`,
            },
          ],
        })
      );
    }

    if (expectedTrapped && focusableElements.length > 0) {
      const lastElement = focusableElements[focusableElements.length - 1];

      // Check if Tab from last element returns to first
      if (document.activeElement === lastElement) {
        // This is a simplified check - in real usage, we'd need to simulate Tab
        // For now, we'll just warn if the setup looks suspicious
        const hasTabHandler = container.getAttribute('data-focus-trap') === 'true';

        if (!hasTabHandler) {
          WarningSystem.warn(
            createWarning({
              code: WarningCodes.FOCUS_TRAP_BROKEN,
              severity: 'warn',
              category: 'focus-management',
              message: 'Focus trap may not be working correctly',
              element: container,
              wcag: {
                criterion: '2.1.2',
                level: 'A',
                url: WCAGUrls['2.1.2'],
              },
              fixes: [
                {
                  description: 'Use createFocusTrap from @a13y/core',
                  example: `import { createFocusTrap } from '@a13y/core/runtime/focus';

const trap = createFocusTrap(container);
trap.activate();`,
                },
              ],
            })
          );
        }
      }
    }
  }

  /**
   * Validate focus order
   */
  validateFocusOrder(container: Element): void {
    if (!isDevelopment()) {
      return;
    }

    const focusableElements = this.getFocusableElements(container);

    // Check for positive tabindex (creates confusing tab order)
    focusableElements.forEach((element) => {
      const tabindex = element.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex, 10) > 0) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.FOCUS_ORDER_INVALID,
            severity: 'warn',
            category: 'focus-management',
            message: `Positive tabindex (${tabindex}) creates confusing focus order`,
            element,
            wcag: {
              criterion: '2.4.3',
              level: 'A',
              url: WCAGUrls['2.4.3'],
            },
            fixes: [
              {
                description: 'Remove positive tabindex and restructure DOM',
                example: `<!-- Instead of using tabindex to change order -->
<div tabindex="2">Second</div>
<div tabindex="1">First</div>

<!-- Restructure DOM to match desired order -->
<div tabindex="0">First</div>
<div tabindex="0">Second</div>`,
              },
            ],
          })
        );
      }
    });

    // Check for non-sequential visual order
    // This would require measuring element positions - simplified for now
  }

  /**
   * Track focus restoration after actions
   */
  expectFocusRestoration(expectedElement: Element, action: string): void {
    if (!isDevelopment()) {
      return;
    }

    // Wait for async operations to complete
    setTimeout(() => {
      if (document.activeElement !== expectedElement) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.FOCUS_NOT_RESTORED,
            severity: 'warn',
            category: 'focus-management',
            message: `Focus was not restored after ${action}`,
            element: expectedElement,
            wcag: {
              criterion: '2.4.3',
              level: 'A',
              url: WCAGUrls['2.4.3'],
            },
            fixes: [
              {
                description: 'Restore focus to the expected element',
                example: `// Save focus before action
const returnElement = document.activeElement;

// Perform action
performAction();

// Restore focus
returnElement?.focus();`,
              },
              {
                description: 'Use FocusManager.saveFocus()',
                example: `import { FocusManager } from '@a13y/core/runtime/focus';

const restore = FocusManager.saveFocus();
performAction();
restore();`,
              },
            ],
          })
        );
      }
    }, 100);
  }

  private handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as Element;

    if (target && target !== document.body) {
      this.focusHistory.push(target);

      // Keep history limited
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }

      // Validate focus visible
      this.validateFocusVisible(target);
    }
  };

  private handleFocusOut = (_event: FocusEvent): void => {
    // Track focus changes
  };

  private getFocusableElements(container: Element): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }
}

/**
 * Singleton focus validator
 */
export const focusValidator = new FocusValidator();
