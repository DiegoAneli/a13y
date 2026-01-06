/**
 * useClickOutside Hook
 * Detects clicks outside of a referenced element
 */

import { type RefObject, useEffect } from 'react';

/**
 * Calls a handler when user clicks outside of the referenced element
 * @param ref - React ref to the element
 * @param handler - Function to call when clicking outside
 * @param enabled - Whether the hook is enabled (default: true)
 *
 * @example
 * ```tsx
 * const menuRef = useRef<HTMLDivElement>(null);
 * useClickOutside(menuRef, () => setIsOpen(false));
 *
 * <div ref={menuRef}>
 *   Menu content
 * </div>
 * ```
 */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}
