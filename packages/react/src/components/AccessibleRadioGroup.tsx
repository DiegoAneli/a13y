/**
 * AccessibleRadioGroup Component
 * Accessible radio button group with proper fieldset/legend and ARIA attributes
 */

import React from 'react';
import { useId } from '../hooks/use-id';

export interface RadioOption {
  /** Unique value for the option */
  value: string;
  /** Label to display */
  label: string;
  /** Optional description */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface AccessibleRadioGroupProps {
  /** Array of radio options */
  options: RadioOption[];
  /** Currently selected value */
  value: string | null;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Name attribute for the radio group */
  name: string;
  /** Label for the group */
  label: string;
  /** Optional description for the group */
  description?: string;
  /** Whether the group is required */
  required?: boolean;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** Optional className for the fieldset */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible radio button group component with proper ARIA attributes
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string | null>(null);
 *
 * const options = [
 *   { value: 'small', label: 'Small', description: 'Up to 10 users' },
 *   { value: 'medium', label: 'Medium', description: 'Up to 50 users' },
 *   { value: 'large', label: 'Large', description: 'Unlimited users' }
 * ];
 *
 * <AccessibleRadioGroup
 *   name="plan"
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   label="Choose your plan"
 *   required
 * />
 * ```
 */
export const AccessibleRadioGroup: React.FC<AccessibleRadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  label,
  description,
  required = false,
  disabled = false,
  error,
  className = '',
  style = {},
}) => {
  const groupId = useId('radio-group');
  const descriptionId = useId('radio-description');
  const errorId = useId('radio-error');

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % options.length;
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        break;

      default:
        return;
    }

    // Find the next non-disabled option
    while (options[nextIndex]?.disabled && nextIndex !== currentIndex) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        nextIndex = (nextIndex + 1) % options.length;
      } else {
        nextIndex = nextIndex === 0 ? options.length - 1 : nextIndex - 1;
      }
    }

    if (!options[nextIndex]?.disabled) {
      onChange(options[nextIndex].value);
      // Focus the next radio button
      const nextRadio = document.getElementById(`${groupId}-${options[nextIndex].value}`);
      nextRadio?.focus();
    }
  };

  const fieldsetStyles: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    margin: 0,
    ...style,
  };

  const legendStyles: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '16px',
    marginBottom: '8px',
    padding: '0 4px',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '12px',
  };

  const optionContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const optionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  };

  const radioStyles: React.CSSProperties = {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const labelStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flex: 1,
  };

  const optionDescriptionStyles: React.CSSProperties = {
    fontSize: '13px',
    color: '#9ca3af',
  };

  const errorStyles: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '8px',
  };

  return (
    <fieldset
      className={className}
      style={fieldsetStyles}
      aria-describedby={
        [description && descriptionId, error && errorId].filter(Boolean).join(' ') || undefined
      }
      disabled={disabled}
    >
      <legend style={legendStyles}>
        {label}
        {required && (
          <span aria-label="required" style={{ color: '#ef4444' }}>
            {' '}*
          </span>
        )}
      </legend>

      {description && (
        <div id={descriptionId} style={descriptionStyles}>
          {description}
        </div>
      )}

      <div style={optionContainerStyles} role="radiogroup" aria-labelledby={groupId}>
        {options.map((option, index) => {
          const radioId = `${groupId}-${option.value}`;
          const optionDescId = option.description ? useId(`radio-desc-${option.value}`) : undefined;
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} style={optionStyles}>
              <input
                type="radio"
                id={radioId}
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isDisabled}
                aria-describedby={optionDescId}
                style={radioStyles}
                tabIndex={isChecked ? 0 : -1}
              />
              <label htmlFor={radioId} style={{ ...labelStyles, opacity: isDisabled ? 0.6 : 1 }}>
                <span style={{ fontWeight: 500 }}>{option.label}</span>
                {option.description && (
                  <span id={optionDescId} style={optionDescriptionStyles}>
                    {option.description}
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>

      {error && (
        <div id={errorId} role="alert" style={errorStyles}>
          {error}
        </div>
      )}
    </fieldset>
  );
};
