/**
 * AccessibleDatePicker Component
 * Fully accessible date picker with calendar grid and keyboard navigation
 */

import React, { useState, useRef } from 'react';
import { useId } from '../hooks/use-id';
import { useClickOutside } from '../hooks/use-click-outside';

export interface AccessibleDatePickerProps {
  /** Currently selected date */
  value: Date | null;
  /** Callback when date changes */
  onChange: (date: Date | null) => void;
  /** Label for the date picker */
  label: string;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Array of disabled dates */
  disabledDates?: Date[];
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Date format for display (default: MM/DD/YYYY) */
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible date picker with calendar grid
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null);
 *
 * <AccessibleDatePicker
 *   value={date}
 *   onChange={setDate}
 *   label="Select date"
 *   minDate={new Date()}
 *   required
 * />
 * ```
 */
export const AccessibleDatePicker: React.FC<AccessibleDatePickerProps> = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabledDates = [],
  required = false,
  disabled = false,
  error,
  dateFormat = 'MM/DD/YYYY',
  className = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  const pickerId = useId('datepicker');
  const labelId = useId('datepicker-label');
  const calendarId = useId('datepicker-calendar');
  const errorId = useId('datepicker-error');

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add empty cells for days before month starts
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(new Date(year, month, -startDayOfWeek + i + 1));
    }

    // Add all days in month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(date);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, date: Date) => {
    let nextDate: Date | null = null;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleDateSelect(date);
        return;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        return;

      case 'ArrowLeft':
        event.preventDefault();
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() - 1);
        break;

      case 'ArrowRight':
        event.preventDefault();
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() - 7);
        break;

      case 'ArrowDown':
        event.preventDefault();
        nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 7);
        break;

      case 'Home':
        event.preventDefault();
        nextDate = new Date(date.getFullYear(), date.getMonth(), 1);
        break;

      case 'End':
        event.preventDefault();
        nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;

      case 'PageUp':
        event.preventDefault();
        nextDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
        break;

      case 'PageDown':
        event.preventDefault();
        nextDate = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
        break;
    }

    if (nextDate) {
      setFocusedDate(nextDate);
      if (nextDate.getMonth() !== viewDate.getMonth()) {
        setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
      }
    }
  };

  const days = getDaysInMonth(viewDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    fontSize: '14px',
    marginBottom: '6px',
  };

  const buttonStyles: React.CSSProperties = {
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: `1px solid ${error ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: disabled ? '#f9fafb' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    position: 'relative',
  };

  const calendarStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '16px',
    zIndex: 1000,
    minWidth: '280px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const navButtonStyles: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  };

  const dayHeaderStyles: React.CSSProperties = {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '12px',
    padding: '8px 0',
    color: '#6b7280',
  };

  const dayCellStyles = (
    _date: Date,
    isCurrentMonth: boolean,
    isSelected: boolean,
    isToday: boolean,
    isDisabled: boolean
  ): React.CSSProperties => ({
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    backgroundColor: isSelected ? '#3b82f6' : isToday ? '#e5e7eb' : 'transparent',
    color: isSelected ? '#fff' : !isCurrentMonth ? '#9ca3af' : isDisabled ? '#d1d5db' : '#1f2937',
    fontWeight: isSelected || isToday ? 600 : 400,
    opacity: isDisabled ? 0.5 : 1,
  });

  const errorStyles: React.CSSProperties = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#ef4444',
  };

  return (
    <div ref={containerRef} className={className} style={containerStyles}>
      <label id={labelId} htmlFor={pickerId} style={labelStyles}>
        {label}
        {required && (
          <span aria-label="required" style={{ color: '#ef4444' }}>
            {' '}*
          </span>
        )}
      </label>

      <button
        ref={buttonRef}
        id={pickerId}
        type="button"
        aria-labelledby={labelId}
        aria-expanded={isOpen}
        aria-controls={calendarId}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        aria-invalid={!!error}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={buttonStyles}
      >
        {value ? formatDate(value) : 'Select date'}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          📅
        </span>
      </button>

      {isOpen && (
        <div id={calendarId} role="dialog" aria-modal="false" aria-label="Calendar" style={calendarStyles}>
          <div style={headerStyles}>
            <button
              type="button"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
              style={navButtonStyles}
            >
              ‹
            </button>
            <span style={{ fontWeight: 600 }}>
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              style={navButtonStyles}
            >
              ›
            </button>
          </div>

          <div role="grid" aria-labelledby={labelId} style={gridStyles}>
            {dayNames.map((day) => (
              <div key={day} role="columnheader" style={dayHeaderStyles}>
                {day}
              </div>
            ))}

            {days.map((cellDate, index) => {
              const isCurrentMonth = cellDate.getMonth() === viewDate.getMonth();
              const isSelected = value ? isSameDay(cellDate, value) : false;
              const isToday = isSameDay(cellDate, new Date());
              const isDisabled = isDateDisabled(cellDate);
              const isFocused = focusedDate ? isSameDay(cellDate, focusedDate) : false;

              return (
                <button
                  key={index}
                  type="button"
                  role="gridcell"
                  aria-label={formatDate(cellDate)}
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  tabIndex={isFocused || (isSelected && !focusedDate) ? 0 : -1}
                  onClick={() => handleDateSelect(cellDate)}
                  onKeyDown={(e) => handleKeyDown(e, cellDate)}
                  style={dayCellStyles(cellDate, isCurrentMonth, isSelected, isToday, isDisabled)}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {cellDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div id={errorId} role="alert" style={errorStyles}>
          {error}
        </div>
      )}
    </div>
  );
};
