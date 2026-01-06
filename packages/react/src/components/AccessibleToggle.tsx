/**
 * AccessibleToggle Component
 * A fully accessible toggle/switch component with ARIA support
 */

import React from 'react';
import { useId } from '../hooks/use-id';

export interface AccessibleToggleProps {
  /** Whether the toggle is checked */
  checked: boolean;
  /** Callback when the toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label for the toggle */
  label: string;
  /** Optional description for additional context */
  description?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Optional className for the container */
  className?: string;
  /** Optional className for the switch element */
  switchClassName?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible toggle/switch component with proper ARIA attributes
 *
 * @example
 * ```tsx
 * const [enabled, setEnabled] = useState(false);
 *
 * <AccessibleToggle
 *   checked={enabled}
 *   onChange={setEnabled}
 *   label="Enable notifications"
 *   description="Receive email notifications for updates"
 * />
 * ```
 */
export const AccessibleToggle: React.FC<AccessibleToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  switchClassName = '',
  style = {},
}) => {
  const toggleId = useId('toggle');
  const descriptionId = useId('toggle-description');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const switchStyles: React.CSSProperties = {
    position: 'relative',
    width: '44px',
    height: '24px',
    backgroundColor: checked ? '#007bff' : '#ccc',
    borderRadius: '12px',
    transition: 'background-color 0.2s',
    flexShrink: 0,
  };

  const thumbStyles: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: checked ? '22px' : '2px',
    width: '20px',
    height: '20px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'left 0.2s',
  };

  const labelStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#666',
  };

  return (
    <div
      className={className}
      style={containerStyles}
      onClick={handleClick}
    >
      <div
        role="switch"
        aria-checked={checked}
        aria-labelledby={toggleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={switchClassName}
        style={switchStyles}
      >
        <div style={thumbStyles} />
      </div>
      <div style={labelStyles}>
        <label
          id={toggleId}
          htmlFor={toggleId}
          style={{ fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {label}
        </label>
        {description && (
          <span id={descriptionId} style={descriptionStyles}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
