/**
 * @a13y/core - Accessibility Errors
 * Custom error classes for accessibility violations
 */

/**
 * Base error class for all accessibility-related errors
 */
export class AccessibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccessibilityError';
    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AccessibilityError);
    }
  }
}

/**
 * Error thrown when focus management operations fail
 */
export class FocusManagementError extends AccessibilityError {
  constructor(
    message: string,
    public readonly element?: Element
  ) {
    super(message);
    this.name = 'FocusManagementError';
  }
}

/**
 * Error thrown when an element is missing a required accessible name
 */
export class MissingAccessibleNameError extends AccessibilityError {
  constructor(public readonly element: Element) {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    super(
      `Element <${tagName}>${role ? ` with role="${role}"` : ''} is missing an accessible name. ` +
        `Provide one of: aria-label, aria-labelledby, or text content.`
    );
    this.name = 'MissingAccessibleNameError';
  }
}

/**
 * Error thrown when ARIA attributes are invalid or misused
 */
export class InvalidAriaError extends AccessibilityError {
  constructor(
    message: string,
    public readonly element: Element,
    public readonly attribute?: string
  ) {
    super(message);
    this.name = 'InvalidAriaError';
  }
}

/**
 * Error thrown when keyboard navigation is not properly implemented
 */
export class KeyboardNavigationError extends AccessibilityError {
  constructor(
    message: string,
    public readonly element?: Element
  ) {
    super(message);
    this.name = 'KeyboardNavigationError';
  }
}

/**
 * Error thrown when live region announcement fails
 */
export class AnnouncementError extends AccessibilityError {
  constructor(message: string) {
    super(message);
    this.name = 'AnnouncementError';
  }
}
