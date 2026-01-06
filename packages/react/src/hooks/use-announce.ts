/**
 * useAnnounce Hook
 * Provides a simple way to make screen reader announcements
 */

import { useCallback, useEffect, useRef } from 'react';
import type { AriaLivePoliteness } from './use-aria-live';

/**
 * Creates a function to announce messages to screen readers
 * @returns Function to announce messages
 *
 * @example
 * ```tsx
 * const announce = useAnnounce();
 *
 * const handleAddToCart = () => {
 *   addItem(item);
 *   announce('Item added to cart', 'polite');
 * };
 * ```
 */
export function useAnnounce(): (
  message: string,
  politeness?: AriaLivePoliteness,
) => void {
  const regionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a hidden live region if it doesn't exist
    if (!regionRef.current) {
      const region = document.createElement('div');
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.style.position = 'absolute';
      region.style.left = '-10000px';
      region.style.width = '1px';
      region.style.height = '1px';
      region.style.overflow = 'hidden';

      document.body.appendChild(region);
      regionRef.current = region;
    }

    return () => {
      if (regionRef.current) {
        document.body.removeChild(regionRef.current);
        regionRef.current = null;
      }
    };
  }, []);

  const announce = useCallback(
    (message: string, politeness: AriaLivePoliteness = 'polite') => {
      if (!regionRef.current) return;

      // Update aria-live attribute
      regionRef.current.setAttribute('aria-live', politeness);

      // Clear the region
      regionRef.current.textContent = '';

      // Use setTimeout to ensure the clear is processed first
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);

      // Auto-clear after 5 seconds
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, 5100);
    },
    [],
  );

  return announce;
}
