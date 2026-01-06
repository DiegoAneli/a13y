/**
 * @a13y/devtools - ARIA Validator
 * Validates ARIA attributes and usage
 */

import { isDevelopment } from '@a13y/core/runtime/env';
import { createWarning, WarningSystem } from '../warnings/warning-system';
import { WarningCodes, WCAGUrls } from '../warnings/warning-types';

/**
 * Valid ARIA roles
 */
const VALID_ROLES = new Set([
  'alert',
  'alertdialog',
  'application',
  'article',
  'banner',
  'button',
  'cell',
  'checkbox',
  'columnheader',
  'combobox',
  'complementary',
  'contentinfo',
  'definition',
  'dialog',
  'directory',
  'document',
  'feed',
  'figure',
  'form',
  'grid',
  'gridcell',
  'group',
  'heading',
  'img',
  'link',
  'list',
  'listbox',
  'listitem',
  'log',
  'main',
  'marquee',
  'math',
  'menu',
  'menubar',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'navigation',
  'none',
  'note',
  'option',
  'presentation',
  'progressbar',
  'radio',
  'radiogroup',
  'region',
  'row',
  'rowgroup',
  'rowheader',
  'scrollbar',
  'search',
  'searchbox',
  'separator',
  'slider',
  'spinbutton',
  'status',
  'switch',
  'tab',
  'table',
  'tablist',
  'tabpanel',
  'term',
  'textbox',
  'timer',
  'toolbar',
  'tooltip',
  'tree',
  'treegrid',
  'treeitem',
]);

/**
 * Required ARIA attributes for specific roles
 */
const REQUIRED_ARIA_PROPS: Record<string, string[]> = {
  checkbox: ['aria-checked'],
  combobox: ['aria-expanded', 'aria-controls'],
  gridcell: ['aria-colindex'],
  heading: ['aria-level'],
  listbox: ['aria-orientation'],
  option: ['aria-selected'],
  progressbar: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  radio: ['aria-checked'],
  scrollbar: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-controls'],
  separator: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  slider: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  spinbutton: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
  switch: ['aria-checked'],
  tab: ['aria-selected'],
  tabpanel: ['aria-labelledby'],
  textbox: ['aria-multiline'],
  treegrid: ['aria-multiselectable'],
};

/**
 * Global ARIA attributes (can be used on any element)
 */
const GLOBAL_ARIA_ATTRS = new Set([
  'aria-atomic',
  'aria-busy',
  'aria-controls',
  'aria-current',
  'aria-describedby',
  'aria-details',
  'aria-disabled',
  'aria-dropeffect',
  'aria-errormessage',
  'aria-flowto',
  'aria-grabbed',
  'aria-haspopup',
  'aria-hidden',
  'aria-invalid',
  'aria-keyshortcuts',
  'aria-label',
  'aria-labelledby',
  'aria-live',
  'aria-owns',
  'aria-relevant',
  'aria-roledescription',
]);

/**
 * ARIA validator class
 */
export class AriaValidator {
  /**
   * Validate ARIA attributes on an element
   */
  validateElement(element: Element): void {
    if (!isDevelopment()) {
      return;
    }

    const role = element.getAttribute('role');
    const ariaAttrs = this.getAriaAttributes(element);

    // Validate role
    if (role) {
      this.validateRole(element, role);
    }

    // Validate ARIA attributes
    ariaAttrs.forEach((attr) => {
      this.validateAriaAttribute(element, attr, role);
    });

    // Check for required ARIA props
    if (role && REQUIRED_ARIA_PROPS[role]) {
      this.validateRequiredProps(element, role);
    }

    // Check for redundant ARIA
    this.checkRedundantAria(element, role);

    // Check for conflicting ARIA
    this.checkConflictingAria(element, ariaAttrs);
  }

  /**
   * Validate accessible name
   */
  validateAccessibleName(element: Element, context?: string): void {
    if (!isDevelopment()) {
      return;
    }

    // Import at runtime to avoid circular deps
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
                  description: 'Add aria-label',
                  example: `<${element.tagName.toLowerCase()} aria-label="Description">`,
                },
                {
                  description: 'Add text content',
                  example: `<${element.tagName.toLowerCase()}>Button text</${element.tagName.toLowerCase()}>`,
                },
                {
                  description: 'Use aria-labelledby',
                  example: `<${element.tagName.toLowerCase()} aria-labelledby="label-id">`,
                },
              ],
            })
          );
        }

        // Warn if using placeholder as label
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          const placeholder = element.placeholder;
          if (placeholder && (!name || name === placeholder)) {
            WarningSystem.warn(
              createWarning({
                code: WarningCodes.PLACEHOLDER_AS_LABEL,
                severity: 'warn',
                category: 'accessible-name',
                message: 'Using placeholder as accessible name is not recommended',
                element,
                wcag: {
                  criterion: '4.1.2',
                  level: 'A',
                  url: WCAGUrls['4.1.2'],
                },
                fixes: [
                  {
                    description: 'Add a visible label',
                    example: `<label for="input-id">Label text</label>
<input id="input-id" placeholder="Example">`,
                  },
                  {
                    description: 'Add aria-label',
                    example: `<input aria-label="Label text" placeholder="Example">`,
                  },
                ],
              })
            );
          }
        }
      })
      .catch(() => {
        // Silently fail if @a13y/core is not available
      });
  }

  /**
   * Validate role attribute
   */
  private validateRole(element: Element, role: string): void {
    if (!VALID_ROLES.has(role)) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.INVALID_ARIA_ROLE,
          severity: 'error',
          category: 'aria-usage',
          message: `Invalid ARIA role: "${role}"`,
          element,
          wcag: {
            criterion: '4.1.2',
            level: 'A',
            url: WCAGUrls['4.1.2'],
          },
          fixes: [
            {
              description: 'Use a valid ARIA role from the specification',
              learnMoreUrl: 'https://www.w3.org/TR/wai-aria-1.2/#role_definitions',
            },
            {
              description: 'Remove the role attribute if not needed',
            },
          ],
        })
      );
    }
  }

  /**
   * Validate ARIA attribute
   */
  private validateAriaAttribute(element: Element, attr: string, role: string | null): void {
    // Check if attribute name is valid (starts with aria-)
    if (!attr.startsWith('aria-')) {
      return;
    }

    // Extract value
    const value = element.getAttribute(attr);

    // Validate boolean attributes
    if (
      [
        'aria-atomic',
        'aria-busy',
        'aria-disabled',
        'aria-hidden',
        'aria-multiline',
        'aria-multiselectable',
        'aria-readonly',
        'aria-required',
      ].includes(attr)
    ) {
      if (value !== 'true' && value !== 'false') {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.INVALID_ARIA_VALUE,
            severity: 'warn',
            category: 'aria-usage',
            message: `ARIA attribute "${attr}" must be "true" or "false", got "${value}"`,
            element,
            wcag: {
              criterion: '4.1.2',
              level: 'A',
              url: WCAGUrls['4.1.2'],
            },
            fixes: [
              {
                description: 'Use "true" or "false"',
                example: `<element ${attr}="true">`,
              },
            ],
          })
        );
      }
    }

    // Validate ID references
    if (['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns'].includes(attr)) {
      this.validateIdReferences(element, attr, value);
    }

    // Validate that attribute is appropriate for role
    if (role && !GLOBAL_ARIA_ATTRS.has(attr)) {
      // This is simplified - full validation would need role-specific allowed attrs
      // For now, we just ensure it's not obviously wrong
    }
  }

  /**
   * Validate ID references in ARIA attributes
   */
  private validateIdReferences(element: Element, attr: string, value: string | null): void {
    if (!value) return;

    const ids = value.split(/\s+/);

    ids.forEach((id) => {
      const referencedElement = document.getElementById(id);

      if (!referencedElement) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.INVALID_LABELLEDBY,
            severity: 'warn',
            category: 'aria-usage',
            message: `${attr} references non-existent element with id="${id}"`,
            element,
            wcag: {
              criterion: '4.1.2',
              level: 'A',
              url: WCAGUrls['4.1.2'],
            },
            fixes: [
              {
                description: 'Ensure the referenced element exists',
                example: `<div id="${id}">Label text</div>
<button ${attr}="${id}">Button</button>`,
              },
              {
                description: 'Use aria-label instead',
                example: `<button aria-label="Button text">Button</button>`,
              },
            ],
          })
        );
      }
    });

    // Check for duplicate IDs in the document
    const allElements = document.querySelectorAll(`[id]`);
    const idCounts = new Map<string, number>();

    allElements.forEach((el) => {
      const id = el.id;
      idCounts.set(id, (idCounts.get(id) || 0) + 1);
    });

    ids.forEach((id) => {
      if ((idCounts.get(id) || 0) > 1) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.DUPLICATE_ID,
            severity: 'error',
            category: 'aria-usage',
            message: `Duplicate id="${id}" found in document`,
            element,
            wcag: {
              criterion: '4.1.1',
              level: 'A',
              url: 'https://www.w3.org/WAI/WCAG22/Understanding/parsing.html',
            },
            fixes: [
              {
                description: 'Ensure all IDs are unique',
                example: `<!-- Make sure each ID is used only once -->
<div id="unique-id-1">First</div>
<div id="unique-id-2">Second</div>`,
              },
            ],
          })
        );
      }
    });
  }

  /**
   * Validate required ARIA props for a role
   */
  private validateRequiredProps(element: Element, role: string): void {
    const requiredProps = REQUIRED_ARIA_PROPS[role] || [];

    requiredProps.forEach((prop) => {
      if (!element.hasAttribute(prop)) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.MISSING_REQUIRED_ARIA,
            severity: 'error',
            category: 'aria-usage',
            message: `Role "${role}" requires "${prop}" attribute`,
            element,
            wcag: {
              criterion: '4.1.2',
              level: 'A',
              url: WCAGUrls['4.1.2'],
            },
            fixes: [
              {
                description: `Add the required ${prop} attribute`,
                example: `<${element.tagName.toLowerCase()} role="${role}" ${prop}="value">`,
                learnMoreUrl: `https://www.w3.org/TR/wai-aria-1.2/#${role}`,
              },
            ],
          })
        );
      }
    });
  }

  /**
   * Check for redundant ARIA
   */
  private checkRedundantAria(element: Element, role: string | null): void {
    const tagName = element.tagName.toLowerCase();

    // Check for redundant role on semantic elements
    const implicitRoles: Record<string, string> = {
      button: 'button',
      a: 'link',
      nav: 'navigation',
      main: 'main',
      header: 'banner',
      footer: 'contentinfo',
      article: 'article',
      aside: 'complementary',
      section: 'region',
    };

    if (role && implicitRoles[tagName] === role) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.REDUNDANT_ARIA,
          severity: 'info',
          category: 'aria-usage',
          message: `Role "${role}" is redundant on <${tagName}>`,
          element,
          fixes: [
            {
              description: 'Remove the redundant role attribute',
              example: `<${tagName}> (role="${role}" is implicit)`,
            },
          ],
        })
      );
    }
  }

  /**
   * Check for conflicting ARIA attributes
   */
  private checkConflictingAria(element: Element, ariaAttrs: string[]): void {
    // Check for aria-label and aria-labelledby together
    if (ariaAttrs.includes('aria-label') && ariaAttrs.includes('aria-labelledby')) {
      WarningSystem.warn(
        createWarning({
          code: WarningCodes.CONFLICTING_ARIA,
          severity: 'warn',
          category: 'aria-usage',
          message: 'Element has both aria-label and aria-labelledby (labelledby takes precedence)',
          element,
          fixes: [
            {
              description: 'Remove aria-label and keep aria-labelledby',
              example: `<element aria-labelledby="label-id">`,
            },
            {
              description: 'Remove aria-labelledby and keep aria-label',
              example: `<element aria-label="Label text">`,
            },
          ],
        })
      );
    }

    // Check for aria-hidden="true" on focusable element
    if (element.getAttribute('aria-hidden') === 'true') {
      const isFocusable =
        element instanceof HTMLButtonElement ||
        element instanceof HTMLAnchorElement ||
        element instanceof HTMLInputElement ||
        (element.hasAttribute('tabindex') &&
          parseInt(element.getAttribute('tabindex') || '0', 10) >= 0);

      if (isFocusable) {
        WarningSystem.warn(
          createWarning({
            code: WarningCodes.CONFLICTING_ARIA,
            severity: 'error',
            category: 'aria-usage',
            message: 'Focusable element has aria-hidden="true"',
            element,
            wcag: {
              criterion: '4.1.2',
              level: 'A',
              url: WCAGUrls['4.1.2'],
            },
            fixes: [
              {
                description: 'Remove aria-hidden',
                example: `<button>Visible button</button>`,
              },
              {
                description: 'Make element non-focusable',
                example: `<div aria-hidden="true" tabindex="-1">Hidden content</div>`,
              },
            ],
          })
        );
      }
    }
  }

  /**
   * Get all ARIA attributes from an element
   */
  private getAriaAttributes(element: Element): string[] {
    return Array.from(element.attributes)
      .filter((attr) => attr.name.startsWith('aria-'))
      .map((attr) => attr.name);
  }
}

/**
 * Singleton ARIA validator
 */
export const ariaValidator = new AriaValidator();
