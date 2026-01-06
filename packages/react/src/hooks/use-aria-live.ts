/**
 * useAriaLive Hook
 * Manages ARIA live regions for dynamic announcements
 */

import { useEffect, useRef, useState } from 'react';

export type AriaLivePoliteness = 'polite' | 'assertive' | 'off';

export interface UseAriaLiveReturn {
  /** Sets a message to be announced */
  setMessage: (message: string) => void;
  /** Clears the current message */
  clearMessage: () => void;
  /** Current message */
  message: string;
  /** Props to spread on the live region element */
  liveRegionProps: {
    role: 'status' | 'alert';
    'aria-live': AriaLivePoliteness;
    'aria-atomic': 'true';
    'aria-relevant': 'additions text';
  };
}

/**
 * Creates a managed ARIA live region
 * @param politeness - How urgently the message should be announced
 * @returns Object with message management functions and props
 *
 * @example
 * ```tsx
 * const { setMessage, liveRegionProps } = useAriaLive('polite');
 *
 * <button onClick={() => setMessage('Item added to cart')}>
 *   Add to cart
 * </button>
 *
 * <div {...liveRegionProps} className="sr-only">
 *   {message}
 * </div>
 * ```
 */
export function useAriaLive(
  politeness: AriaLivePoliteness = 'polite',
): UseAriaLiveReturn {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const clearMessage = () => {
    setMessage('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const setMessageWithClear = (newMessage: string) => {
    setMessage(newMessage);

    // Auto-clear after 5 seconds
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    setMessage: setMessageWithClear,
    clearMessage,
    message,
    liveRegionProps: {
      role: politeness === 'assertive' ? 'alert' : 'status',
      'aria-live': politeness,
      'aria-atomic': 'true',
      'aria-relevant': 'additions text',
    },
  };
}
