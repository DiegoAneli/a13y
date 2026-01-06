/**
 * @a13y/core - Environment Detection
 * Utilities for detecting development vs production mode
 */

/**
 * Check if we're in development mode
 * This is used to enable/disable runtime validation
 */
export const isDevelopment = (): boolean => {
  // Check if __DEV__ global is defined (set by bundler)
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }

  // Fallback: check process.env.NODE_ENV if available
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV !== 'production';
  }

  // Default to production (safe default)
  return false;
};

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof navigator !== 'undefined'
  );
};

/**
 * Check if we're in a test environment
 */
export const isTest = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'test';
  }
  return false;
};

/**
 * Assert that we're in a browser environment
 * Throws error if not in browser
 */
export const assertBrowser = (operation: string): void => {
  if (!isBrowser()) {
    throw new Error(
      `@a13y/core: ${operation} requires a browser environment. ` +
        `This operation cannot be performed during SSR.`
    );
  }
};

/**
 * Development-only assertion
 * No-op in production for zero runtime cost
 */
export const devAssert = (condition: boolean, message: string): void => {
  if (isDevelopment() && !condition) {
    throw new Error(`@a13y/core [DEV]: ${message}`);
  }
};

/**
 * Development-only warning
 * No-op in production for zero runtime cost
 */
export const devWarn = (condition: boolean, message: string): void => {
  if (isDevelopment() && !condition) {
    console.warn(`@a13y/core [DEV WARNING]: ${message}`);
  }
};

// Global type declaration for __DEV__ flag
declare global {
  const __DEV__: boolean;
}
