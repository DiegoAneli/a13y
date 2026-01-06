/**
 * @a13y/devtools - Development Tools
 * Runtime validation and warnings for accessibility
 * @packageDocumentation
 */

export const VERSION = '0.0.0' as const;

// Re-export runtime utilities
export * from './runtime';

/**
 * Initialize devtools
 * Starts all validators and warning system
 */
export const initDevtools = (config?: import('./runtime/warnings').WarningSystemConfig): void => {
  // Only in development
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }

  const { WarningSystem } = require('./runtime/warnings');
  const { focusValidator } = require('./runtime/validators');

  // Configure warning system
  if (config) {
    WarningSystem.configure(config);
  }

  // Start validators
  focusValidator.start();

  // Log initialization
  if (WarningSystem) {
    console.log(
      '%c[@a13y/devtools]%c Development mode enabled',
      'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold',
      'color: #4CAF50; font-weight: normal'
    );
  }
};

/**
 * Destroy devtools
 * Stops all validators
 */
export const destroyDevtools = (): void => {
  if (typeof __DEV__ === 'undefined' || !__DEV__) {
    return;
  }

  const { focusValidator } = require('./runtime/validators');

  // Stop validators
  focusValidator.stop();
};
