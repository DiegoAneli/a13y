/**
 * @a13y/devtools - Warning System
 * Structured warning system with styled console output
 */

import type { AccessibilityWarning, WarningSeverity } from './warning-types';

/**
 * Console styling for warnings
 */
const Styles = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Colors
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',

  // Backgrounds
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
} as const;

/**
 * Format a message with console styling
 */
const style = (text: string, ...styles: string[]): string => {
  return `${styles.join('')}${text}${Styles.reset}`;
};

/**
 * Configuration for warning system
 */
export interface WarningSystemConfig {
  /**
   * Enable/disable warnings
   * @default true in development
   */
  enabled?: boolean;

  /**
   * Minimum severity to show
   * @default 'warn'
   */
  minSeverity?: WarningSeverity;

  /**
   * Show element in console
   * @default true
   */
  showElement?: boolean;

  /**
   * Show stack traces for errors
   * @default true
   */
  showStackTrace?: boolean;

  /**
   * Deduplicate warnings
   * @default true
   */
  deduplicate?: boolean;

  /**
   * Custom warning handler
   */
  onWarning?: (warning: AccessibilityWarning) => void;
}

/**
 * Warning system class
 */
class WarningSystemClass {
  private config: Required<WarningSystemConfig> = {
    enabled: true,
    minSeverity: 'warn',
    showElement: true,
    showStackTrace: true,
    deduplicate: true,
    onWarning: () => {},
  };

  private warningCache = new Set<string>();

  /**
   * Configure the warning system
   */
  configure(config: WarningSystemConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Emit a warning
   */
  warn(warning: AccessibilityWarning): void {
    if (!this.config.enabled) {
      return;
    }

    // Check severity threshold
    const severityLevel = { info: 0, warn: 1, error: 2 };
    if (severityLevel[warning.severity] < severityLevel[this.config.minSeverity]) {
      return;
    }

    // Deduplicate
    if (this.config.deduplicate) {
      const key = this.getWarningKey(warning);
      if (this.warningCache.has(key)) {
        return;
      }
      this.warningCache.add(key);
    }

    // Custom handler
    if (this.config.onWarning) {
      this.config.onWarning(warning);
    }

    // Console output
    this.printWarning(warning);
  }

  /**
   * Clear warning cache
   */
  clearCache(): void {
    this.warningCache.clear();
  }

  /**
   * Generate a unique key for a warning
   */
  private getWarningKey(warning: AccessibilityWarning): string {
    const parts = [warning.code, warning.message];

    if (warning.element) {
      // Use element's tag, id, and classes for uniqueness
      const tag = warning.element.tagName.toLowerCase();
      const id = warning.element.id;
      const classes = Array.from(warning.element.classList).join('.');
      parts.push(`${tag}#${id}.${classes}`);
    }

    return parts.join('|');
  }

  /**
   * Print warning to console
   */
  private printWarning(warning: AccessibilityWarning): void {
    const { severity, code, category, message, element, wcag, fixes } = warning;

    // Severity badge
    const badge = this.getSeverityBadge(severity);

    // Header
    console.group(
      `${badge} ${style(code, Styles.bold, Styles.cyan)} ${style(category, Styles.dim)}`
    );

    // Message
    console.log(style(message, Styles.bold));

    // Element
    if (element && this.config.showElement) {
      console.log(style('\nElement:', Styles.bold));
      console.log(element);
    }

    // WCAG info
    if (wcag) {
      console.log(style('\nWCAG:', Styles.bold), `${wcag.criterion} (Level ${wcag.level})`);
      console.log(style('Learn more:', Styles.blue), wcag.url);
    }

    // Fix suggestions
    if (fixes.length > 0) {
      console.log(style('\nHow to fix:', Styles.bold, Styles.cyan));
      fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.description}`);

        if (fix.example) {
          console.log(style('\n   Example:', Styles.dim));
          console.log(style(`   ${fix.example}`, Styles.dim, Styles.gray));
        }

        if (fix.learnMoreUrl) {
          console.log(style('   Learn more:', Styles.blue), fix.learnMoreUrl);
        }
      });
    }

    // Stack trace for errors
    if (severity === 'error' && this.config.showStackTrace) {
      console.log(style('\nStack trace:', Styles.dim));
      console.trace();
    }

    console.groupEnd();
    console.log(''); // Empty line for spacing
  }

  /**
   * Get severity badge for console
   */
  private getSeverityBadge(severity: WarningSeverity): string {
    switch (severity) {
      case 'error':
        return style(' ERROR ', Styles.bold, Styles.bgRed);
      case 'warn':
        return style(' WARN ', Styles.bold, Styles.bgYellow);
      case 'info':
        return style(' INFO ', Styles.bold, Styles.bgBlue);
    }
  }
}

/**
 * Singleton warning system
 */
export const WarningSystem = new WarningSystemClass();

/**
 * Helper to create a warning
 */
export const createWarning = (
  partial: Omit<AccessibilityWarning, 'fixes'> & {
    fixes?: AccessibilityWarning['fixes'];
  }
): AccessibilityWarning => {
  return {
    fixes: [],
    ...partial,
  };
};
