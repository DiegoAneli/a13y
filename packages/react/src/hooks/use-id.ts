/**
 * useId Hook
 * Generates unique IDs for accessibility attributes
 * Provides backward compatibility for React < 18
 */

import { useRef } from 'react';

let idCounter = 0;

/**
 * Generates a unique ID for accessibility attributes
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 *
 * @example
 * ```tsx
 * const tooltipId = useId('tooltip');
 * // Returns: "tooltip-1"
 * ```
 */
export function useId(prefix = 'a13y'): string {
  const idRef = useRef<string | undefined>(undefined);

  if (!idRef.current) {
    idRef.current = `${prefix}-${++idCounter}`;
  }

  return idRef.current;
}
