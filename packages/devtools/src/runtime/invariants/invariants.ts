/**
 * @a13y/devtools - Invariants
 * Development-only assertions for accessibility constraints
 */

import { isDevelopment } from '@a13y/core/runtime/env';
import { createWarning, WarningSystem } from '../warnings/warning-system';
import { WarningCodes, WCAGUrls } from '../warnings/warning-types';

/**
 * Assert that a condition is true, throw error if false (development only)
 */
export const invariant = (condition: boolean, message: string): void => {
  if (!isDevelopment()) {
    return;
  }

  if (!condition) {
    throw new Error(`[@a13y/devtools] Invariant violation: ${message}`);
  }
};

/**
 * Assert that an element has an accessible name
 */
export const assertHasAccessibleName = (element: Element, context?: string): void => {
  if (!isDevelopment()) {
    return;
  }

  // Import getAccessibleName at runtime to avoid circular deps
  import('@a13y/core/runtime/aria')
    .then(({ getAccessibleName }) => {
      const name = getAccessibleName(element);

      if (!name || name.trim().length === 0) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.MISSING_ACCESSIBLE_NAME,
            severity: 'error',
            category: 'accessible-name',
            message: `Element is missing an accessible name${context ? ` in ${context}` : ''}`,
            element,
            wcag: {
              criterion: '4.1.2',
              level: 'A',
              url: WCAGUrls['4.1.2'],
            },
            fixes: [
              {
                description: 'Add an aria-label attribute',
                example: `<${element.tagName.toLowerCase()} aria-label="Descriptive name">`,
              },
              {
                description: 'Add text content',
                example: `<${element.tagName.toLowerCase()}>Click me</${element.tagName.toLowerCase()}>`,
              },
              {
                description: 'Use aria-labelledby to reference another element',
                example: `<${element.tagName.toLowerCase()} aria-labelledby="label-id">`,
              },
            ],
          })
        );
      }
    })
    .catch(() => {
      // Silently fail if @a13y/core is not available
    });
};

/**
 * Assert that an element is keyboard accessible
 */
export const assertKeyboardAccessible = (element: Element, context?: string): void => {
  if (!isDevelopment()) {
    return;
  }

  const isButton = element instanceof HTMLButtonElement;
  const isLink = element instanceof HTMLAnchorElement && element.hasAttribute('href');
  const isInput = element instanceof HTMLInputElement;
  const hasTabindex = element.hasAttribute('tabindex');
  const tabindex = hasTabindex ? parseInt(element.getAttribute('tabindex') || '0', 10) : -1;

  // Check if element is naturally keyboard accessible or has tabindex >= 0
  const isAccessible = isButton || isLink || isInput || (hasTabindex && tabindex >= 0);

  if (!isAccessible) {
    WarningSystem.warn(
      createWarning({
        code: WarningCodes.NOT_KEYBOARD_ACCESSIBLE,
        severity: 'error',
        category: 'keyboard-navigation',
        message: `Element is not keyboard accessible${context ? ` in ${context}` : ''}`,
        element,
        wcag: {
          criterion: '2.1.1',
          level: 'A',
          url: WCAGUrls['2.1.1'],
        },
        fixes: [
          {
            description: 'Use a semantic HTML element (button, a, input)',
            example: `<button type="button">Click me</button>`,
          },
          {
            description: 'Add tabindex="0" to make it focusable',
            example: `<${element.tagName.toLowerCase()} tabindex="0">`,
          },
          {
            description: 'Add keyboard event handlers (Enter, Space)',
            example: `element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    // Handle activation
  }
});`,
          },
        ],
      })
    );
  }

  // Check for click handler without keyboard handler
  const hasClickHandler = element.getAttribute('onclick') !== null;
  if (hasClickHandler && !isButton && !isLink) {
    WarningSystem.warn(
      createWarning({
        code: WarningCodes.MISSING_KEYBOARD_HANDLER,
        severity: 'warn',
        category: 'keyboard-navigation',
        message: `Element has click handler but no keyboard handlers${context ? ` in ${context}` : ''}`,
        element,
        wcag: {
          criterion: '2.1.1',
          level: 'A',
          url: WCAGUrls['2.1.1'],
        },
        fixes: [
          {
            description: 'Add onKeyDown handler for Enter and Space keys',
            example: `const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onClick(e);
  }
};`,
          },
        ],
      })
    );
  }
};

/**
 * Assert that tabindex value is valid
 */
export const assertValidTabindex = (element: Element): void => {
  if (!isDevelopment()) {
    return;
  }

  const tabindex = element.getAttribute('tabindex');
  if (tabindex === null) {
    return;
  }

  const value = parseInt(tabindex, 10);

  // Warn about positive tabindex (antipattern)
  if (value > 0) {
    WarningSystem.warn(
      createWarning({
        code: WarningCodes.INVALID_TABINDEX,
        severity: 'warn',
        category: 'keyboard-navigation',
        message: `Positive tabindex (${value}) creates confusing tab order`,
        element,
        wcag: {
          criterion: '2.4.3',
          level: 'A',
          url: WCAGUrls['2.4.3'],
        },
        fixes: [
          {
            description: 'Use tabindex="0" to add element to natural tab order',
            example: `<div tabindex="0">Focusable in natural order</div>`,
          },
          {
            description: 'Use tabindex="-1" to remove from tab order (programmatic focus only)',
            example: `<div tabindex="-1">Not in tab order</div>`,
          },
          {
            description: 'Restructure DOM to achieve desired focus order',
            learnMoreUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
          },
        ],
      })
    );
  }
};

/**
 * Assert that ARIA attributes are valid for the element's role
 */
export const assertValidAriaAttributes = (element: Element): void => {
  if (!isDevelopment()) {
    return;
  }

  const role = element.getAttribute('role');
  const ariaAttributes = Array.from(element.attributes).filter((attr) =>
    attr.name.startsWith('aria-')
  );

  // Check for ARIA attributes without role
  if (!role && ariaAttributes.length > 0 && !isSemanticElement(element)) {
    WarningSystem.warn(
      createWarning({
        code: WarningCodes.MISSING_REQUIRED_ARIA,
        severity: 'warn',
        category: 'aria-usage',
        message: 'Element has ARIA attributes but no explicit role',
        element,
        wcag: {
          criterion: '4.1.2',
          level: 'A',
          url: WCAGUrls['4.1.2'],
        },
        fixes: [
          {
            description: 'Add an appropriate role attribute',
            example: `<div role="button" aria-pressed="false">Toggle</div>`,
          },
          {
            description: 'Use a semantic HTML element instead',
            example: `<button aria-pressed="false">Toggle</button>`,
          },
        ],
      })
    );
  }

  // Check for redundant ARIA on semantic elements
  if (role && isSemanticElement(element)) {
    const semanticRole = getImplicitRole(element);
    if (role === semanticRole) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.REDUNDANT_ARIA,
          severity: 'info',
          category: 'aria-usage',
          message: `Role "${role}" is redundant on <${element.tagName.toLowerCase()}>`,
          element,
          fixes: [
            {
              description: 'Remove the redundant role attribute',
              example: `<${element.tagName.toLowerCase()}> (role="${role}" is implicit)`,
            },
          ],
        })
      );
    }
  }
};

/**
 * Assert that focus is visible after an action
 */
export const assertFocusVisible = (context?: string): void => {
  if (!isDevelopment()) {
    return;
  }

  // Delay check to allow focus to settle
  setTimeout(() => {
    const activeElement = document.activeElement;

    if (!activeElement || activeElement === document.body) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.FOCUS_LOST,
          severity: 'warn',
          category: 'focus-management',
          message: `Focus was lost${context ? ` after ${context}` : ''}`,
          wcag: {
            criterion: '2.4.3',
            level: 'A',
            url: WCAGUrls['2.4.3'],
          },
          fixes: [
            {
              description: 'Ensure focus is moved to an appropriate element',
              example: `// After closing dialog
const returnElement = document.getElementById('trigger-button');
returnElement?.focus();`,
            },
            {
              description: 'Use FocusManager to save and restore focus',
              example: `import { FocusManager } from '@a13y/core/runtime/focus';

const restore = FocusManager.saveFocus();
// ... perform action ...
restore();`,
            },
          ],
        })
      );
    }
  }, 100);
};

/**
 * Check if element is a semantic HTML element
 */
const isSemanticElement = (element: Element): boolean => {
  const tag = element.tagName.toLowerCase();
  const semanticTags = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    'nav',
    'main',
    'article',
    'section',
    'header',
    'footer',
    'aside',
  ];
  return semanticTags.includes(tag);
};

/**
 * Get implicit ARIA role of an element
 */
const getImplicitRole = (element: Element): string | null => {
  const tag = element.tagName.toLowerCase();

  const roleMap: Record<string, string> = {
    button: 'button',
    a: 'link',
    nav: 'navigation',
    main: 'main',
    article: 'article',
    section: 'region',
    header: 'banner',
    footer: 'contentinfo',
    aside: 'complementary',
  };

  return roleMap[tag] || null;
};
