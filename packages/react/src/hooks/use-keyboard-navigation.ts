/**
 * @a13y/react - useKeyboardNavigation
 * Roving tabindex keyboard navigation hook
 */

import type { NavigationDirection } from '@a13y/core/runtime/keyboard';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Navigation orientation
 */
export type Orientation = 'horizontal' | 'vertical' | 'both';

/**
 * Props for useKeyboardNavigation
 */
export interface UseKeyboardNavigationProps {
  /**
   * Navigation orientation
   * - 'horizontal': Arrow Left/Right
   * - 'vertical': Arrow Up/Down
   * - 'both': All arrow keys
   */
  orientation: Orientation;

  /**
   * Whether to loop at boundaries
   * @default false
   */
  loop?: boolean;

  /**
   * Callback when navigation occurs
   */
  onNavigate?: (index: number) => void;

  /**
   * Initial focused index
   * @default 0
   */
  defaultIndex?: number;

  /**
   * Controlled current index
   */
  currentIndex?: number;
}

/**
 * Item props for navigable items
 */
export interface NavigableItemProps {
  ref: (element: HTMLElement | null) => void;
  tabIndex: number;
  onKeyDown: (event: React.KeyboardEvent) => void;
  'data-index': number;
}

/**
 * Return type
 */
export interface UseKeyboardNavigationReturn {
  /**
   * Current focused index
   */
  currentIndex: number;

  /**
   * Navigate to specific index
   */
  setCurrentIndex: (index: number) => void;

  /**
   * Get props for navigable item
   */
  getItemProps: (index: number) => NavigableItemProps;

  /**
   * Container props
   */
  containerProps: {
    role: 'toolbar' | 'listbox' | 'menu';
    'aria-orientation': Orientation;
  };
}

/**
 * Hook for keyboard navigation with roving tabindex
 *
 * Features:
 * - Arrow key navigation
 * - Home/End navigation
 * - Roving tabindex pattern
 * - Automatic focus management
 * - Development-time validation
 *
 * @example
 * ```tsx
 * const { containerProps, getItemProps, currentIndex } =
 *   useKeyboardNavigation({
 *     orientation: 'horizontal',
 *     loop: true,
 *   });
 *
 * return (
 *   <div {...containerProps}>
 *     {items.map((item, index) => (
 *       <button key={index} {...getItemProps(index)}>
 *         {item.label}
 *       </button>
 *     ))}
 *   </div>
 * );
 * ```
 */
export const useKeyboardNavigation = (
  props: UseKeyboardNavigationProps
): UseKeyboardNavigationReturn => {
  const {
    orientation,
    loop = false,
    onNavigate,
    defaultIndex = 0,
    currentIndex: controlledIndex,
  } = props;

  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const currentIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const itemsRef = useRef<Map<number, HTMLElement>>(new Map());
  const containerRef = useRef<HTMLElement | null>(null);

  // Update current index
  const setCurrentIndex = useCallback(
    (index: number) => {
      if (!isControlled) {
        setUncontrolledIndex(index);
      }
      onNavigate?.(index);

      // Focus the element
      const element = itemsRef.current.get(index);
      if (element) {
        element.focus();
      }
    },
    [isControlled, onNavigate]
  );

  // Navigate in direction
  const navigate = useCallback(
    (direction: NavigationDirection) => {
      const itemCount = itemsRef.current.size;
      if (itemCount === 0) {
        return;
      }

      let nextIndex = currentIndex;

      switch (direction) {
        case 'forward':
          nextIndex = currentIndex + 1;
          if (nextIndex >= itemCount) {
            nextIndex = loop ? 0 : itemCount - 1;
          }
          break;

        case 'backward':
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? itemCount - 1 : 0;
          }
          break;

        case 'first':
          nextIndex = 0;
          break;

        case 'last':
          nextIndex = itemCount - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
      }
    },
    [currentIndex, loop, setCurrentIndex]
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { key } = event;

      let direction: NavigationDirection | null = null;

      // Arrow keys
      if (key === 'ArrowRight') {
        if (orientation === 'horizontal' || orientation === 'both') {
          direction = 'forward';
        }
      } else if (key === 'ArrowLeft') {
        if (orientation === 'horizontal' || orientation === 'both') {
          direction = 'backward';
        }
      } else if (key === 'ArrowDown') {
        if (orientation === 'vertical' || orientation === 'both') {
          direction = 'forward';
        }
      } else if (key === 'ArrowUp') {
        if (orientation === 'vertical' || orientation === 'both') {
          direction = 'backward';
        }
      }

      // Home/End
      else if (key === 'Home') {
        direction = 'first';
      } else if (key === 'End') {
        direction = 'last';
      }

      if (direction) {
        event.preventDefault();
        navigate(direction);
      }
    },
    [orientation, navigate]
  );

  // Get props for individual item
  const getItemProps = useCallback(
    (index: number): NavigableItemProps => {
      return {
        ref: (element: HTMLElement | null) => {
          if (element) {
            itemsRef.current.set(index, element);
          } else {
            itemsRef.current.delete(index);
          }
        },
        tabIndex: index === currentIndex ? 0 : -1,
        onKeyDown: handleKeyDown,
        'data-index': index,
      };
    },
    [currentIndex, handleKeyDown]
  );

  // Development-time validation
  useEffect(() => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      import('@a13y/devtools/runtime/validators').then(({ keyboardValidator }) => {
        // Validate container
        if (containerRef.current) {
          keyboardValidator.validateContainer(containerRef.current);
        }

        // Validate roving tabindex
        const container = Array.from(itemsRef.current.values())[0]?.parentElement;
        if (container) {
          keyboardValidator.validateRovingTabindex(container);
        }
      });
    }
  }, []);

  const containerProps = {
    role: 'toolbar' as const,
    'aria-orientation': orientation,
  };

  return {
    currentIndex,
    setCurrentIndex,
    getItemProps,
    containerProps,
  };
};
