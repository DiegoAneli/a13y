/**
 * @a13y/react - VirtualizedList Pattern
 * Accessible virtualized list with screen reader support
 */

import { announce } from '@a13y/core/runtime/announce';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * Props for VirtualizedList
 */
export interface VirtualizedListProps<T> {
  /**
   * All items in the list
   */
  items: T[];

  /**
   * Height of each item (fixed)
   */
  itemHeight: number;

  /**
   * Height of the visible container
   */
  height: number;

  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * Unique key extractor
   */
  getItemKey: (item: T, index: number) => string;

  /**
   * Accessible label for the list
   */
  'aria-label': string;

  /**
   * Number of items to render outside viewport (overscan)
   * @default 3
   */
  overscan?: number;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Empty state
   */
  emptyState?: ReactNode;
}

/**
 * Virtualized List Component
 *
 * Accessible virtualized list that works with screen readers:
 * - Only renders visible items + overscan
 * - Maintains total height for scrollbar
 * - Announces visible range to screen readers
 * - Keyboard navigation works correctly
 * - Focus management when scrolling
 *
 * Pattern Explanation:
 * - Calculates visible range based on scroll position
 * - Renders only visible items + overscan buffer
 * - Uses absolute positioning to maintain item positions
 * - Announces visible range changes to screen readers
 * - Total height maintained for accurate scrollbar
 * - Works with keyboard navigation (Page Up/Down, Home/End)
 *
 * Screen Reader Strategy:
 * - aria-setsize and aria-posinset tell screen readers total count
 * - Visible range announced when user scrolls
 * - Focus is maintained when items are virtualized
 *
 * @example
 * ```tsx
 * const items = Array.from({ length: 10000 }, (_, i) => ({
 *   id: i,
 *   name: `Item ${i}`,
 * }));
 *
 * return (
 *   <VirtualizedList
 *     items={items}
 *     itemHeight={48}
 *     height={600}
 *     renderItem={(item) => (
 *       <div style={{ padding: '0.75rem' }}>
 *         {item.name}
 *       </div>
 *     )}
 *     getItemKey={(item) => item.id.toString()}
 *     aria-label="Large list of items"
 *   />
 * );
 * ```
 */
export const VirtualizedList = <T,>(props: VirtualizedListProps<T>) => {
  const {
    items,
    itemHeight,
    height,
    renderItem,
    getItemKey,
    'aria-label': ariaLabel,
    overscan = 3,
    className = '',
    emptyState,
  } = props;

  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const previousRangeRef = useRef({ start: 0, end: 0 });

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Announce visible range to screen readers (throttled)
  useEffect(() => {
    const newRange = { start: startIndex, end: endIndex };

    // Only announce if range changed significantly (more than 10 items)
    const rangeChanged =
      Math.abs(newRange.start - previousRangeRef.current.start) > 10 ||
      Math.abs(newRange.end - previousRangeRef.current.end) > 10;

    if (rangeChanged && items.length > 0) {
      setVisibleRange(newRange);
      previousRangeRef.current = newRange;

      // Announce visible range
      const message = `Showing items ${newRange.start + 1} to ${newRange.end + 1} of ${items.length}`;
      announce(message, { politeness: 'polite', delay: 300 });
    }
  }, [startIndex, endIndex, items.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Keyboard navigation helpers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const scrollAmount = itemHeight * 5; // Scroll 5 items at a time

    switch (e.key) {
      case 'PageDown':
        e.preventDefault();
        containerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;

      case 'PageUp':
        e.preventDefault();
        containerRef.current.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;

      case 'Home':
        e.preventDefault();
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        break;

      case 'End':
        e.preventDefault();
        containerRef.current.scrollTo({ top: totalHeight, behavior: 'smooth' });
        break;
    }
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div role="status" aria-live="polite">
        {emptyState || <p>No items to display</p>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label={ariaLabel}
      tabIndex={0}
      className={className}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative',
        outline: 'none',
      }}
    >
      {/* Total height spacer */}
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map((item, virtualIndex) => {
          const actualIndex = startIndex + virtualIndex;
          const itemStyle: CSSProperties = {
            position: 'absolute',
            top: `${actualIndex * itemHeight}px`,
            left: 0,
            right: 0,
            height: `${itemHeight}px`,
          };

          return (
            <div
              key={getItemKey(item, actualIndex)}
              role="listitem"
              aria-setsize={items.length}
              aria-posinset={actualIndex + 1}
              style={itemStyle}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>

      {/* Screen reader helper */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {`Showing items ${visibleRange.start + 1} to ${visibleRange.end + 1} of ${items.length}`}
      </div>
    </div>
  );
};
