/**
 * AccessibleTable Component
 * Fully accessible data table with sorting, selection, and keyboard navigation
 */

import React, { useState } from 'react';
import { useId } from '../hooks/use-id';

export interface TableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header label */
  label: string;
  /** Render function for cell content */
  render?: (item: T, index: number) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Width of the column */
  width?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface AccessibleTableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /** Table caption (required for accessibility) */
  caption: string;
  /** Whether rows are selectable */
  selectable?: boolean;
  /** Selected row indices */
  selectedRows?: number[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIndices: number[]) => void;
  /** Row key extractor */
  getRowKey?: (item: T, index: number) => string;
  /** Whether table is sortable */
  sortable?: boolean;
  /** Current sort column */
  sortColumn?: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Callback when sort changes */
  onSort?: (column: string, direction: SortDirection) => void;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible data table with sorting and selection
 *
 * @example
 * ```tsx
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const columns: TableColumn<User>[] = [
 *   { key: 'name', label: 'Name', sortable: true },
 *   { key: 'email', label: 'Email', sortable: true }
 * ];
 *
 * <AccessibleTable
 *   data={users}
 *   columns={columns}
 *   caption="User list"
 *   selectable
 *   sortable
 * />
 * ```
 */
export function AccessibleTable<T extends Record<string, unknown>>({
  data,
  columns,
  caption,
  selectable = false,
  selectedRows: controlledSelected = [],
  onSelectionChange,
  getRowKey = (_, index) => String(index),
  sortable = false,
  sortColumn: controlledSortColumn,
  sortDirection: controlledSortDirection,
  onSort,
  className = '',
  style = {},
}: AccessibleTableProps<T>): React.ReactElement {
  const [internalSelected, setInternalSelected] = useState<Set<number>>(new Set());
  const [internalSortColumn, setInternalSortColumn] = useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(null);

  const tableId = useId('table');

  const selectedSet = new Set(controlledSelected.length > 0 ? controlledSelected : Array.from(internalSelected));
  const sortColumn = controlledSortColumn !== undefined ? controlledSortColumn : internalSortColumn;
  const sortDirection = controlledSortDirection !== undefined ? controlledSortDirection : internalSortDirection;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = data.map((_, index) => index);
      setInternalSelected(new Set(allIndices));
      onSelectionChange?.(allIndices);
    } else {
      setInternalSelected(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedSet);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setInternalSelected(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSort = (column: string) => {
    const col = columns.find((c) => c.key === column);
    if (!col?.sortable && !sortable) return;

    let newDirection: SortDirection = 'asc';

    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    if (onSort) {
      onSort(column, newDirection);
    } else {
      setInternalSortColumn(newDirection ? column : null);
      setInternalSortDirection(newDirection);
    }
  };

  const isAllSelected = data.length > 0 && selectedSet.size === data.length;
  const isSomeSelected = selectedSet.size > 0 && selectedSet.size < data.length;

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    ...style,
  };

  const thStyles: React.CSSProperties = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: 600,
    backgroundColor: '#f9fafb',
  };

  const sortButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    font: 'inherit',
    fontWeight: 600,
    padding: 0,
    width: '100%',
  };

  const tdStyles: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
  };

  const rowStyles = (isSelected: boolean): React.CSSProperties => ({
    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
  });

  const getSortIcon = (column: string): string => {
    if (sortColumn !== column) return '⇅';
    if (sortDirection === 'asc') return '↑';
    if (sortDirection === 'desc') return '↓';
    return '⇅';
  };

  return (
    <table
      id={tableId}
      className={className}
      style={tableStyles}
      role="table"
      aria-label={caption}
    >
      <caption style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '16px' }}>
        {caption}
      </caption>
      <thead>
        <tr>
          {selectable && (
            <th scope="col" style={{ ...thStyles, width: '50px' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) {
                    el.indeterminate = isSomeSelected;
                  }
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                aria-label="Select all rows"
              />
            </th>
          )}
          {columns.map((column) => {
            const isSortable = column.sortable || sortable;

            return (
              <th
                key={column.key}
                scope="col"
                style={{ ...thStyles, width: column.width }}
                aria-sort={
                  sortColumn === column.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : sortDirection === 'desc'
                        ? 'descending'
                        : 'none'
                    : undefined
                }
              >
                {isSortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    style={sortButtonStyles}
                    aria-label={`Sort by ${column.label}`}
                  >
                    <span>{column.label}</span>
                    <span aria-hidden="true">{getSortIcon(column.key)}</span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + (selectable ? 1 : 0)}
              style={{ ...tdStyles, textAlign: 'center', color: '#9ca3af' }}
            >
              No data available
            </td>
          </tr>
        ) : (
          data.map((item, index) => {
            const isSelected = selectedSet.has(index);
            const rowKey = getRowKey(item, index);

            return (
              <tr key={rowKey} style={rowStyles(isSelected)}>
                {selectable && (
                  <td style={tdStyles}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(index, e.target.checked)}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} style={tdStyles}>
                    {column.render
                      ? column.render(item, index)
                      : String(item[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
