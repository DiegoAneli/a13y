/**
 * @a13y/devtools - Warning Types
 * Type definitions for accessibility warnings
 */

/**
 * Warning severity level
 */
export type WarningSeverity = 'error' | 'warn' | 'info';

/**
 * WCAG level for the violation
 */
export type WCAGLevel = 'A' | 'AA' | 'AAA';

/**
 * Category of accessibility issue
 */
export type WarningCategory =
  | 'focus-management'
  | 'keyboard-navigation'
  | 'aria-usage'
  | 'accessible-name'
  | 'semantic-html'
  | 'wcag-compliance'
  | 'performance';

/**
 * Fix suggestion for a warning
 */
export interface FixSuggestion {
  /**
   * Description of how to fix the issue
   */
  description: string;

  /**
   * Code example showing the fix
   */
  example?: string;

  /**
   * Link to documentation
   */
  learnMoreUrl?: string;
}

/**
 * Accessibility warning
 */
export interface AccessibilityWarning {
  /**
   * Unique warning code (e.g., "A13Y001")
   */
  code: string;

  /**
   * Severity level
   */
  severity: WarningSeverity;

  /**
   * Category of the issue
   */
  category: WarningCategory;

  /**
   * Human-readable message
   */
  message: string;

  /**
   * Element that caused the warning
   */
  element?: Element;

  /**
   * WCAG criterion violated
   */
  wcag?: {
    criterion: string;
    level: WCAGLevel;
    url: string;
  };

  /**
   * Suggestions for fixing the issue
   */
  fixes: FixSuggestion[];

  /**
   * Additional context
   */
  context?: Record<string, unknown>;
}

/**
 * Warning code definitions
 */
export const WarningCodes = {
  // Focus Management (001-099)
  FOCUS_LOST: 'A13Y001',
  FOCUS_NOT_VISIBLE: 'A13Y002',
  FOCUS_TRAP_BROKEN: 'A13Y003',
  FOCUS_ORDER_INVALID: 'A13Y004',
  FOCUS_NOT_RESTORED: 'A13Y005',

  // Keyboard Navigation (100-199)
  NOT_KEYBOARD_ACCESSIBLE: 'A13Y100',
  MISSING_KEYBOARD_HANDLER: 'A13Y101',
  INVALID_TABINDEX: 'A13Y102',
  ROVING_TABINDEX_BROKEN: 'A13Y103',
  MISSING_ESC_HANDLER: 'A13Y104',

  // Accessible Name (200-299)
  MISSING_ACCESSIBLE_NAME: 'A13Y200',
  EMPTY_ACCESSIBLE_NAME: 'A13Y201',
  DUPLICATE_ID: 'A13Y202',
  INVALID_LABELLEDBY: 'A13Y203',
  PLACEHOLDER_AS_LABEL: 'A13Y204',

  // ARIA Usage (300-399)
  INVALID_ARIA_ROLE: 'A13Y300',
  INVALID_ARIA_ATTRIBUTE: 'A13Y301',
  CONFLICTING_ARIA: 'A13Y302',
  REDUNDANT_ARIA: 'A13Y303',
  MISSING_REQUIRED_ARIA: 'A13Y304',
  INVALID_ARIA_VALUE: 'A13Y305',

  // Semantic HTML (400-499)
  DIV_BUTTON: 'A13Y400',
  DIV_LINK: 'A13Y401',
  MISSING_LANDMARK: 'A13Y402',
  INVALID_NESTING: 'A13Y403',

  // WCAG Compliance (500-599)
  CONTRAST_INSUFFICIENT: 'A13Y500',
  TARGET_SIZE_TOO_SMALL: 'A13Y501',
  ANIMATION_NO_REDUCE_MOTION: 'A13Y502',

  // Performance (600-699)
  TOO_MANY_LIVE_REGIONS: 'A13Y600',
  EXCESSIVE_ANNOUNCEMENTS: 'A13Y601',
} as const;

/**
 * WCAG criterion URLs
 */
export const WCAGUrls = {
  '1.3.1': 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html',
  '1.4.3': 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
  '2.1.1': 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
  '2.1.2': 'https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html',
  '2.4.3': 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
  '2.4.7': 'https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html',
  '2.5.5': 'https://www.w3.org/WAI/WCAG22/Understanding/target-size.html',
  '4.1.2': 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html',
  '4.1.3': 'https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html',
} as const;
