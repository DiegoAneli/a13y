/**
 * @a13y/core - ARIA Utilities
 * Utilities for working with ARIA attributes and accessible names
 */

import { assertBrowser, devWarn } from '../env/environment';
import { InvalidAriaError, MissingAccessibleNameError } from '../errors/accessibility-errors';

/**
 * Get the accessible name of an element
 * Follows the accessible name computation algorithm
 * https://www.w3.org/TR/accname-1.2/
 */
export const getAccessibleName = (element: Element): string => {
  assertBrowser('getAccessibleName');

  // 1. aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(/\s+/);
    const labels = ids
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (labels.length > 0) {
      return labels.join(' ');
    }
  }

  // 2. aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel?.trim()) {
    return ariaLabel.trim();
  }

  // 3. For <label> association (form elements)
  if (element instanceof HTMLElement && 'labels' in element) {
    const labels = (element as HTMLInputElement).labels;
    if (labels && labels.length > 0) {
      return Array.from(labels)
        .map((label) => label.textContent?.trim())
        .filter(Boolean)
        .join(' ');
    }
  }

  // 4. Text content (for buttons, links, etc.)
  if (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLAnchorElement ||
    element.getAttribute('role') === 'button' ||
    element.getAttribute('role') === 'link'
  ) {
    const text = element.textContent?.trim();
    if (text) {
      return text;
    }
  }

  // 5. alt attribute (images)
  if (element instanceof HTMLImageElement) {
    return element.alt;
  }

  // 6. title attribute (fallback)
  const title = element.getAttribute('title');
  if (title?.trim()) {
    return title.trim();
  }

  // 7. placeholder (for inputs, last resort)
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const placeholder = element.placeholder;
    if (placeholder?.trim()) {
      devWarn(
        false,
        `Element is using placeholder as accessible name. Consider using a proper label instead.`
      );
      return placeholder.trim();
    }
  }

  return '';
};

/**
 * Check if an element has an accessible name
 */
export const hasAccessibleName = (element: Element): boolean => {
  return getAccessibleName(element).length > 0;
};

/**
 * Assert that an element has an accessible name
 * Throws MissingAccessibleNameError if not
 */
export const assertAccessibleName = (element: Element): void => {
  if (!hasAccessibleName(element)) {
    throw new MissingAccessibleNameError(element);
  }
};

/**
 * Set ARIA attribute safely with validation
 */
export const setAriaAttribute = (
  element: Element,
  attribute: string,
  value: string | boolean | number | null
): void => {
  assertBrowser('setAriaAttribute');

  if (!attribute.startsWith('aria-')) {
    throw new InvalidAriaError(
      `Invalid ARIA attribute: "${attribute}". ARIA attributes must start with "aria-".`,
      element,
      attribute
    );
  }

  if (value === null) {
    element.removeAttribute(attribute);
  } else if (typeof value === 'boolean') {
    element.setAttribute(attribute, String(value));
  } else {
    element.setAttribute(attribute, String(value));
  }
};

/**
 * Get ARIA attribute value with type safety
 */
export const getAriaAttribute = (element: Element, attribute: string): string | null => {
  assertBrowser('getAriaAttribute');

  if (!attribute.startsWith('aria-')) {
    throw new InvalidAriaError(
      `Invalid ARIA attribute: "${attribute}". ARIA attributes must start with "aria-".`,
      element,
      attribute
    );
  }

  return element.getAttribute(attribute);
};

/**
 * Check if element has a specific ARIA role
 */
export const hasRole = (element: Element, role: string): boolean => {
  return element.getAttribute('role') === role;
};

/**
 * Get all focusable elements within a container
 * Includes elements with tabindex >= 0 and naturally focusable elements
 */
export const getFocusableElements = (container: Element): HTMLElement[] => {
  assertBrowser('getFocusableElements');

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
  ].join(',');

  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];

  // Filter out elements that are not visible or have aria-hidden="true"
  return elements.filter((el) => {
    // Check if element or any ancestor has aria-hidden="true"
    let current: Element | null = el;
    while (current) {
      if (current.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      current = current.parentElement;
    }

    // Check if element is visible (basic check)
    if (el instanceof HTMLElement) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || el.offsetParent === null) {
        return false;
      }
    }

    return true;
  });
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element: Element): boolean => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const container = element.parentElement || document.body;
  const focusableElements = getFocusableElements(container);
  return focusableElements.includes(element);
};

/**
 * Generate a unique ID for ARIA relationships
 * Useful for aria-labelledby, aria-describedby, etc.
 */
let idCounter = 0;
export const generateAriaId = (prefix = 'a13y'): string => {
  return `${prefix}-${Date.now()}-${++idCounter}`;
};
