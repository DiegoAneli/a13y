/**
 * @a13y/devtools - Keyboard Validator
 * Validates keyboard accessibility
 */

import { isDevelopment } from '@a13y/core/runtime/env';
import { createWarning, WarningSystem } from '../warnings/warning-system';
import { WarningCodes, WCAGUrls } from '../warnings/warning-types';

/**
 * Interactive element that should be keyboard accessible
 */
interface InteractiveElement {
  element: Element;
  hasClickHandler: boolean;
  hasKeyHandler: boolean;
  isFocusable: boolean;
}

/**
 * Keyboard validator class
 */
export class KeyboardValidator {
  /**
   * Validate that interactive elements are keyboard accessible
   */
  validateInteractiveElement(element: Element): void {
    if (!isDevelopment()) {
      return;
    }

    const info = this.analyzeElement(element);

    // Check if element has click handler but no keyboard access
    if (info.hasClickHandler && !info.isFocusable) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.NOT_KEYBOARD_ACCESSIBLE,
          severity: 'error',
          category: 'keyboard-navigation',
          message: 'Interactive element is not keyboard accessible',
          element,
          wcag: {
            criterion: '2.1.1',
            level: 'A',
            url: WCAGUrls['2.1.1'],
          },
          fixes: [
            {
              description: 'Use a semantic button element',
              example: `<button onClick={handleClick}>Click me</button>`,
            },
            {
              description: 'Add tabindex="0" and keyboard handlers',
              example: `<div
  tabindex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>`,
            },
          ],
        })
      );
    }

    // Check if element has click but no keyboard handler
    if (info.hasClickHandler && info.isFocusable && !info.hasKeyHandler) {
      // Only warn for non-semantic elements
      const isSemanticInteractive =
        element instanceof HTMLButtonElement ||
        (element instanceof HTMLAnchorElement && element.hasAttribute('href')) ||
        element instanceof HTMLInputElement;

      if (!isSemanticInteractive) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.MISSING_KEYBOARD_HANDLER,
            severity: 'warn',
            category: 'keyboard-navigation',
            message: 'Element has click handler but no keyboard event handler',
            element,
            wcag: {
              criterion: '2.1.1',
              level: 'A',
              url: WCAGUrls['2.1.1'],
            },
            fixes: [
              {
                description: 'Add onKeyDown handler for Enter and Space keys',
                example: `element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // Trigger click or custom action
  }
});`,
              },
            ],
          })
        );
      }
    }

    // Check for divs/spans styled as buttons
    this.checkForDivButton(element);
  }

  /**
   * Validate that a container's children are reachable via keyboard
   */
  validateContainer(container: Element): void {
    if (!isDevelopment()) {
      return;
    }

    const interactiveElements = this.findInteractiveElements(container);

    interactiveElements.forEach((info) => {
      if (info.hasClickHandler && !info.isFocusable) {
        this.validateInteractiveElement(info.element);
      }
    });
  }

  /**
   * Validate roving tabindex implementation
   */
  validateRovingTabindex(container: Element): void {
    if (!isDevelopment()) {
      return;
    }

    const items = Array.from(container.children);
    const tabindexValues = items.map((item) =>
      item.hasAttribute('tabindex') ? parseInt(item.getAttribute('tabindex') || '0', 10) : null
    );

    // Check if exactly one item has tabindex="0" and others have tabindex="-1"
    const zeroCount = tabindexValues.filter((v) => v === 0).length;
    const negativeOneCount = tabindexValues.filter((v) => v === -1).length;

    if (zeroCount !== 1 || negativeOneCount !== items.length - 1) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.ROVING_TABINDEX_BROKEN,
          severity: 'warn',
          category: 'keyboard-navigation',
          message: 'Roving tabindex pattern is not correctly implemented',
          element: container,
          wcag: {
            criterion: '2.1.1',
            level: 'A',
            url: WCAGUrls['2.1.1'],
          },
          fixes: [
            {
              description: 'Set exactly one item to tabindex="0" and all others to tabindex="-1"',
              example: `<!-- Correct roving tabindex -->
<div role="toolbar">
  <button tabindex="0">First (active)</button>
  <button tabindex="-1">Second</button>
  <button tabindex="-1">Third</button>
</div>`,
            },
            {
              description: 'Use RovingTabindexManager from @a13y/core',
              example: `import { RovingTabindexManager } from '@a13y/core/runtime/keyboard';

const manager = new RovingTabindexManager(toolbar, {
  orientation: 'horizontal',
});
manager.init();`,
            },
          ],
        })
      );
    }
  }

  /**
   * Check for escape key handler in dialogs/modals
   */
  validateEscapeHandler(container: Element, shouldHaveEscape: boolean): void {
    if (!isDevelopment() || !shouldHaveEscape) {
      return;
    }

    // Check if container or any child has keydown listener
    // This is a simplified check - in practice, we'd need to track listeners
    const hasEscapeAttr = container.hasAttribute('data-escape-closes');

    if (!hasEscapeAttr) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.MISSING_ESC_HANDLER,
          severity: 'warn',
          category: 'keyboard-navigation',
          message: 'Dialog/Modal should close on Escape key',
          element: container,
          wcag: {
            criterion: '2.1.2',
            level: 'A',
            url: WCAGUrls['2.1.2'],
          },
          fixes: [
            {
              description: 'Add Escape key handler',
              example: `container.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDialog();
  }
});`,
            },
            {
              description: 'Use createFocusTrap with onEscape callback',
              example: `import { createFocusTrap } from '@a13y/core/runtime/focus';

const trap = createFocusTrap(dialog, {
  onEscape: () => closeDialog(),
});`,
            },
          ],
        })
      );
    }
  }

  /**
   * Analyze an element for keyboard accessibility
   */
  private analyzeElement(element: Element): InteractiveElement {
    // Check for click handlers (including React/Vue event handlers)
    const hasClickHandler =
      element.hasAttribute('onclick') ||
      element.hasAttribute('@click') ||
      element.hasAttribute('v-on:click') ||
      // Check for React synthetic events (harder to detect)
      Object.keys(element).some((key) => key.startsWith('__react'));

    // Check for keyboard handlers
    const hasKeyHandler =
      element.hasAttribute('onkeydown') ||
      element.hasAttribute('onkeyup') ||
      element.hasAttribute('onkeypress') ||
      element.hasAttribute('@keydown') ||
      element.hasAttribute('v-on:keydown');

    // Check if focusable
    const isFocusable = this.isFocusable(element);

    return {
      element,
      hasClickHandler,
      hasKeyHandler,
      isFocusable,
    };
  }

  /**
   * Check if element is focusable
   */
  private isFocusable(element: Element): boolean {
    // Semantic interactive elements
    if (
      element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement ||
      (element instanceof HTMLAnchorElement && element.hasAttribute('href'))
    ) {
      return true;
    }

    // Elements with tabindex >= 0
    const tabindex = element.getAttribute('tabindex');
    if (tabindex !== null && parseInt(tabindex, 10) >= 0) {
      return true;
    }

    return false;
  }

  /**
   * Find all interactive elements in a container
   */
  private findInteractiveElements(container: Element): InteractiveElement[] {
    const elements: InteractiveElement[] = [];

    // Find elements with click handlers
    const clickableSelector = '[onclick], [data-clickable]';
    const clickables = container.querySelectorAll(clickableSelector);

    clickables.forEach((element) => {
      elements.push(this.analyzeElement(element));
    });

    return elements;
  }

  /**
   * Check for div/span styled as button (antipattern)
   */
  private checkForDivButton(element: Element): void {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'div' || tagName === 'span') {
      const role = element.getAttribute('role');
      const hasClickHandler =
        element.hasAttribute('onclick') ||
        Object.keys(element).some((key) => key.startsWith('__react'));

      if ((role === 'button' || hasClickHandler) && !this.isFocusable(element)) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.DIV_BUTTON,
            severity: 'warn',
            category: 'semantic-html',
            message: `<${tagName}> used as button - use <button> instead`,
            element,
            fixes: [
              {
                description: 'Use a semantic <button> element',
                example: `<!-- Instead of -->
<div role="button" onClick={handleClick}>Click me</div>

<!-- Use -->
<button onClick={handleClick}>Click me</button>`,
              },
              {
                description: 'If you must use a div, add tabindex and keyboard handlers',
                example: `<div
  role="button"
  tabindex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>`,
              },
            ],
          })
        );
      }
    }
  }
}

/**
 * Singleton keyboard validator
 */
export const keyboardValidator = new KeyboardValidator();
