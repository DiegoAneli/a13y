/**
 * @a13y/react - InfiniteList Pattern
 * Accessible infinite scroll with lazy loading
 */

import { announce } from '@a13y/core/runtime/announce';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * Props for InfiniteList
 */
export interface InfiniteListProps<T> {
  /**
   * Current items in the list
   */
  items: T[];

  /**
   * Function to load more items
   * Should return a promise that resolves to new items
   */
  loadMore: () => Promise<T[]>;

  /**
   * Check if there are more items to load
   */
  hasMore: boolean;

  /**
   * Check if currently loading
   */
  isLoading: boolean;

  /**
   * Render function for each item
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * Unique key extractor
   */
  getItemKey: (item: T, index: number) => string;

  /**
   * Loading indicator
   */
  loadingIndicator?: ReactNode;

  /**
   * Empty state
   */
  emptyState?: ReactNode;

  /**
   * Accessible label for the list
   */
  'aria-label': string;

  /**
   * Distance from bottom to trigger load (px)
   * @default 200
   */
  threshold?: number;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Infinite List Component
 *
 * Accessible infinite scroll with:
 * - Intersection Observer for lazy loading
 * - Screen reader announcements for new items
 * - Keyboard navigation (Tab through items)
 * - Loading states announced
 * - Total count announcements
 *
 * Pattern Explanation:
 * - Uses Intersection Observer to detect when user scrolls near bottom
 * - Announces new items loaded to screen readers
 * - Maintains focus position when new items are added
 * - Works with keyboard navigation (no mouse required)
 * - Provides loading and empty states
 *
 * @example
 * ```tsx
 * const [items, setItems] = useState<Item[]>([]);
 * const [hasMore, setHasMore] = useState(true);
 * const [isLoading, setIsLoading] = useState(false);
 *
 * const loadMore = async () => {
 *   setIsLoading(true);
 *   const newItems = await fetchItems(items.length, 20);
 *   setItems([...items, ...newItems]);
 *   setHasMore(newItems.length === 20);
 *   setIsLoading(false);
 *   return newItems;
 * };
 *
 * return (
 *   <InfiniteList
 *     items={items}
 *     loadMore={loadMore}
 *     hasMore={hasMore}
 *     isLoading={isLoading}
 *     renderItem={(item) => <ItemCard item={item} />}
 *     getItemKey={(item) => item.id}
 *     aria-label="Products list"
 *   />
 * );
 * ```
 */
export const InfiniteList = <T,>(props: InfiniteListProps<T>) => {
  const {
    items,
    loadMore,
    hasMore,
    isLoading,
    renderItem,
    getItemKey,
    loadingIndicator,
    emptyState,
    'aria-label': ariaLabel,
    threshold = 200,
    className = '',
  } = props;

  const [previousCount, setPreviousCount] = useState(items.length);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Announce new items to screen readers
  useEffect(() => {
    if (items.length > previousCount && !isLoading) {
      const newItemsCount = items.length - previousCount;
      announce(
        `${newItemsCount} new item${newItemsCount === 1 ? '' : 's'} loaded. Total: ${items.length}`,
        { politeness: 'polite', delay: 500 }
      );
      setPreviousCount(items.length);
    }
  }, [items.length, previousCount, isLoading]);

  // Announce loading state
  useEffect(() => {
    if (isLoading) {
      announce('Loading more items', { politeness: 'polite' });
    }
  }, [isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const sentinel = entries[0];
        if (sentinel?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, threshold]);

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div role="status" aria-live="polite">
        {emptyState || <p>No items to display</p>}
      </div>
    );
  }

  return (
    <div ref={listRef} className={className}>
      {/* List */}
      <div role="list" aria-label={ariaLabel} aria-busy={isLoading}>
        {items.map((item, index) => (
          <div key={getItemKey(item, index)} role="listitem">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading more items"
          style={{
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          {loadingIndicator || <span>Loading...</span>}
        </div>
      )}

      {/* Sentinel for intersection observer */}
      {hasMore && !isLoading && (
        <div ref={sentinelRef} aria-hidden="true" style={{ height: '1px', visibility: 'hidden' }} />
      )}

      {/* End message */}
      {!hasMore && items.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          End of list. Total: {items.length} items.
        </div>
      )}
    </div>
  );
};
