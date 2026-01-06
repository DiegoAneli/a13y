/**
 * AccessibleCheckboxGroup Component
 * Accessible checkbox group with proper fieldset/legend and ARIA attributes
 */

import React from 'react';
import { useId } from '../hooks/use-id';

export interface CheckboxOption {
  /** Unique value for the option */
  value: string;
  /** Label to display */
  label: string;
  /** Optional description */
  description?: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface AccessibleCheckboxGroupProps {
  /** Array of checkbox options */
  options: CheckboxOption[];
  /** Currently selected values */
  value: string[];
  /** Callback when selection changes */
  onChange: (value: string[]) => void;
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
 * Accessible checkbox group component with proper ARIA attributes
 *
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>(['email']);
 *
 * const options = [
 *   { value: 'email', label: 'Email notifications' },
 *   { value: 'sms', label: 'SMS notifications' },
 *   { value: 'push', label: 'Push notifications', description: 'Requires app installation' }
 * ];
 *
 * <AccessibleCheckboxGroup
 *   options={options}
 *   value={selected}
 *   onChange={setSelected}
 *   label="Notification preferences"
 *   required
 * />
 * ```
 */
export const AccessibleCheckboxGroup: React.FC<AccessibleCheckboxGroupProps> = ({
  options,
  value,
  onChange,
  label,
  description,
  required = false,
  disabled = false,
  error,
  className = '',
  style = {},
}) => {
  const descriptionId = useId('checkbox-description');
  const errorId = useId('checkbox-error');

  const handleChange = (optionValue: string, checked: boolean) => {
    if (disabled) return;

    const newValue = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);

    onChange(newValue);
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

  const checkboxStyles: React.CSSProperties = {
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

      <div style={optionContainerStyles} role="group">
        {options.map((option) => {
          const checkboxId = useId(`checkbox-${option.value}`);
          const optionDescId = option.description ? useId(`checkbox-desc-${option.value}`) : undefined;
          const isChecked = value.includes(option.value);
          const isDisabled = disabled || option.disabled;

          return (
            <div key={option.value} style={optionStyles}>
              <input
                type="checkbox"
                id={checkboxId}
                checked={isChecked}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                disabled={isDisabled}
                aria-describedby={optionDescId}
                style={checkboxStyles}
              />
              <label htmlFor={checkboxId} style={{ ...labelStyles, opacity: isDisabled ? 0.6 : 1 }}>
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
