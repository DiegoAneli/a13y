/**
 * AccessiblePagination Component
 * Accessible pagination with proper ARIA attributes and keyboard navigation
 */

import React from 'react';

export interface AccessiblePaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of sibling pages to show on each side */
  siblingCount?: number;
  /** Whether to show first/last buttons */
  showFirstLast?: boolean;
  /** Optional aria-label for the navigation */
  ariaLabel?: string;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible pagination component with keyboard navigation
 *
 * @example
 * ```tsx
 * const [page, setPage] = useState(1);
 *
 * <AccessiblePagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 *   siblingCount={1}
 *   showFirstLast
 * />
 * ```
 */
export const AccessiblePagination: React.FC<AccessiblePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = false,
  ariaLabel = 'Pagination',
  className = '',
  style = {},
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Calculate start and end of sibling range
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

    // Add ellipsis before siblings if needed
    if (leftSiblingIndex > 2) {
      pages.push('...');
    }

    // Add sibling pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }

    // Add ellipsis after siblings if needed
    if (rightSiblingIndex < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  const navStyles: React.CSSProperties = {
    ...style,
  };

  const listStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const buttonBaseStyles: React.CSSProperties = {
    minWidth: '40px',
    height: '40px',
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const activeButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderColor: '#3b82f6',
  };

  const disabledButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    opacity: 0.5,
    cursor: 'not-allowed',
  };

  const ellipsisStyles: React.CSSProperties = {
    minWidth: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav aria-label={ariaLabel} className={className} style={navStyles}>
      <ul style={listStyles}>
        {/* First Page Button */}
        {showFirstLast && (
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
              style={currentPage === 1 ? disabledButtonStyles : buttonBaseStyles}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.currentTarget.style.backgroundColor = '#fff';
                }
              }}
            >
              ««
            </button>
          </li>
        )}

        {/* Previous Button */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            style={currentPage === 1 ? disabledButtonStyles : buttonBaseStyles}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = '#fff';
              }
            }}
          >
            «
          </button>
        </li>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`}>
                <span style={ellipsisStyles} aria-hidden="true">
                  …
                </span>
              </li>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <li key={pageNumber}>
              <button
                type="button"
                onClick={() => handlePageChange(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
                style={isActive ? activeButtonStyles : buttonBaseStyles}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* Next Button */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            style={currentPage === totalPages ? disabledButtonStyles : buttonBaseStyles}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = '#fff';
              }
            }}
          >
            »
          </button>
        </li>

        {/* Last Page Button */}
        {showFirstLast && (
          <li>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
              style={currentPage === totalPages ? disabledButtonStyles : buttonBaseStyles}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.currentTarget.style.backgroundColor = '#fff';
                }
              }}
            >
              »»
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};
