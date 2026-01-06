/**
 * AccessibleCombobox Component
 * Fully accessible combobox/select with autocomplete, keyboard navigation, and ARIA support
 */

import React, { useState, useRef, useEffect } from 'react';
import { useId } from '../hooks/use-id';
import { useClickOutside } from '../hooks/use-click-outside';

export interface ComboboxOption<T = string> {
  /** Unique value */
  value: T;
  /** Display label */
  label: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface AccessibleComboboxProps<T = string> {
  /** Array of options */
  options: ComboboxOption<T>[];
  /** Currently selected value */
  value: T | null;
  /** Callback when selection changes */
  onChange: (value: T | null) => void;
  /** Label for the combobox */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether search is enabled */
  searchable?: boolean;
  /** Whether the combobox is required */
  required?: boolean;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible combobox/select component with autocomplete
 *
 * @example
 * ```tsx
 * const countries = [
 *   { value: 'us', label: 'United States' },
 *   { value: 'uk', label: 'United Kingdom' },
 *   { value: 'ca', label: 'Canada' }
 * ];
 *
 * const [country, setCountry] = useState<string | null>(null);
 *
 * <AccessibleCombobox
 *   options={countries}
 *   value={country}
 *   onChange={setCountry}
 *   label="Select country"
 *   searchable
 * />
 * ```
 */
export function AccessibleCombobox<T = string>({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  searchable = false,
  required = false,
  disabled = false,
  error,
  className = '',
  style = {},
}: AccessibleComboboxProps<T>): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const comboboxId = useId('combobox');
  const labelId = useId('combobox-label');
  const listboxId = useId('combobox-listbox');
  const errorId = useId('combobox-error');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedElement = listboxRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      ) as HTMLElement;
      highlightedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (option: ComboboxOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;

      case ' ':
        if (!searchable || !isOpen) {
          event.preventDefault();
          setIsOpen(!isOpen);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;

      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;
    }
  };

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

  const inputContainerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '10px 36px 10px 12px',
    border: `1px solid ${error ? '#ef4444' : '#e5e7eb'}`,
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: disabled ? '#f9fafb' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    outline: 'none',
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    transition: 'transform 0.2s',
  };

  const listboxStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    maxHeight: '240px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    listStyle: 'none',
    margin: 0,
    padding: '4px',
  };

  const optionStyles = (isHighlighted: boolean, isSelected: boolean, isDisabled: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    backgroundColor: isHighlighted ? '#f3f4f6' : isSelected ? '#e5e7eb' : 'transparent',
    borderRadius: '4px',
    fontSize: '14px',
    opacity: isDisabled ? 0.5 : 1,
  });

  const errorStyles: React.CSSProperties = {
    marginTop: '6px',
    fontSize: '13px',
    color: '#ef4444',
  };

  return (
    <div ref={containerRef} className={className} style={containerStyles}>
      <label id={labelId} htmlFor={comboboxId} style={labelStyles}>
        {label}
        {required && (
          <span aria-label="required" style={{ color: '#ef4444' }}>
            {' '}*
          </span>
        )}
      </label>

      <div style={inputContainerStyles}>
        <input
          ref={inputRef}
          id={comboboxId}
          type="text"
          role="combobox"
          aria-labelledby={labelId}
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-autocomplete={searchable ? 'list' : 'none'}
          aria-activedescendant={
            isOpen && filteredOptions[highlightedIndex]
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          aria-invalid={!!error}
          disabled={disabled}
          value={searchable && isOpen ? searchQuery : selectedOption?.label || ''}
          onChange={(e) => {
            if (searchable) {
              setSearchQuery(e.target.value);
              setHighlightedIndex(0);
              if (!isOpen) setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          onClick={handleToggle}
          placeholder={placeholder}
          style={inputStyles}
          readOnly={!searchable}
        />
        <span
          aria-hidden="true"
          style={{
            ...iconStyles,
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          style={listboxStyles}
        >
          {filteredOptions.length === 0 ? (
            <li role="option" aria-disabled="true" style={{ padding: '10px 12px', color: '#9ca3af' }}>
              No options found
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isHighlighted = index === highlightedIndex;
              const isSelected = option.value === value;

              return (
                <li
                  key={String(option.value)}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  data-index={index}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={optionStyles(isHighlighted, isSelected, !!option.disabled)}
                >
                  {option.label}
                </li>
              );
            })
          )}
        </ul>
      )}

      {error && (
        <div id={errorId} role="alert" style={errorStyles}>
          {error}
        </div>
      )}
    </div>
  );
}
