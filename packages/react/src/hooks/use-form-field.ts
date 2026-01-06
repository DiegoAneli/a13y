/**
 * @a13y/react - useFormField Hook
 * Individual form field management with accessibility built-in
 */

import { announce } from '@a13y/core/runtime/announce';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

/**
 * Props for useFormField
 */
export interface UseFormFieldProps<T = string> {
  /**
   * Field label (required for accessibility)
   * This will be used as the accessible name
   */
  label: string;

  /**
   * Initial field value
   */
  initialValue?: T;

  /**
   * Validation function
   * Return true if valid, or error message if invalid
   */
  validate?: (value: T) => string | true;

  /**
   * Is field required
   * @default false
   */
  required?: boolean;

  /**
   * Custom required message
   */
  requiredMessage?: string;

  /**
   * Help text to display
   */
  helpText?: string;

  /**
   * Validate on blur
   * @default true
   */
  validateOnBlur?: boolean;

  /**
   * Validate on change (after first blur)
   * @default true
   */
  validateOnChange?: boolean;

  /**
   * Announce errors to screen readers
   * @default true
   */
  announceErrors?: boolean;

  /**
   * Called when value changes
   */
  onChange?: (value: T) => void;

  /**
   * Called when field is blurred
   */
  onBlur?: () => void;
}

/**
 * Return value from useFormField
 */
export interface UseFormFieldReturn<T = string> {
  /**
   * Field ID (generated)
   */
  id: string;

  /**
   * Label ID (generated)
   */
  labelId: string;

  /**
   * Error message ID (generated)
   */
  errorId: string;

  /**
   * Help text ID (generated)
   */
  helpTextId: string;

  /**
   * Current field value
   */
  value: T;

  /**
   * Current error message (if any)
   */
  error: string | null;

  /**
   * Has field been touched (blurred at least once)
   */
  isTouched: boolean;

  /**
   * Is field valid
   */
  isValid: boolean;

  /**
   * Set field value
   */
  setValue: (value: T) => void;

  /**
   * Set field error
   */
  setError: (error: string | null) => void;

  /**
   * Validate field
   */
  validate: () => boolean;

  /**
   * Clear error
   */
  clearError: () => void;

  /**
   * Reset field to initial value
   */
  reset: () => void;

  /**
   * Props for label element
   */
  labelProps: {
    id: string;
    htmlFor: string;
  };

  /**
   * Props for input element
   */
  inputProps: {
    id: string;
    name: string;
    value: T;
    onChange: (value: T) => void;
    onBlur: () => void;
    'aria-labelledby': string;
    'aria-describedby'?: string;
    'aria-invalid': boolean;
    'aria-required'?: boolean;
    ref: React.RefObject<HTMLInputElement | null>;
  };

  /**
   * Props for error message element
   */
  errorProps: {
    id: string;
    role: 'alert';
    'aria-live': 'polite';
  };

  /**
   * Props for help text element
   */
  helpTextProps: {
    id: string;
  };

  /**
   * Field ref for focus management
   */
  fieldRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * useFormField Hook
 *
 * Manages a single form field with accessibility built-in:
 * - Required label via TypeScript
 * - Automatic ARIA attributes
 * - Error announcements to screen readers
 * - Help text support
 * - Validation on blur/change
 * - ID generation for ARIA relationships
 *
 * Pattern Explanation:
 * - Label is required (enforced at compile-time)
 * - aria-labelledby automatically connects label to input
 * - aria-describedby automatically connects errors and help text
 * - aria-invalid automatically set when error exists
 * - Errors announced to screen readers when they appear
 *
 * @example
 * ```tsx
 * const emailField = useFormField({
 *   label: 'Email Address',
 *   required: true,
 *   validate: (value) => {
 *     if (!value.includes('@')) return 'Invalid email address';
 *     return true;
 *   },
 *   helpText: 'We will never share your email',
 * });
 *
 * return (
 *   <div>
 *     <label {...emailField.labelProps}>{emailField.label}</label>
 *     <input
 *       {...emailField.inputProps}
 *       type="email"
 *       onChange={(e) => emailField.inputProps.onChange(e.target.value)}
 *     />
 *     {emailField.helpText && (
 *       <span {...emailField.helpTextProps}>{emailField.helpText}</span>
 *     )}
 *     {emailField.error && (
 *       <span {...emailField.errorProps}>{emailField.error}</span>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useFormField = <T = string>(props: UseFormFieldProps<T>): UseFormFieldReturn<T> => {
  const {
    label,
    initialValue = '' as T,
    validate: validator,
    required = false,
    requiredMessage,
    helpText,
    validateOnBlur = true,
    validateOnChange = true,
    announceErrors = true,
    onChange,
    onBlur,
  } = props;

  // Development-time validation
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (!label || label.trim().length === 0) {
      throw new Error('@a13y/react [useFormField]: "label" prop is required for accessibility');
    }
  }

  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const fieldRef = useRef<HTMLInputElement>(null);

  // Generate unique IDs
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const helpTextId = `${id}-help`;

  // Validate field
  const validate = useCallback((): boolean => {
    // Check required
    if (required) {
      const isEmpty =
        value === '' ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        const errorMessage = requiredMessage || `${label} is required`;
        setError(errorMessage);
        return false;
      }
    }

    // Run custom validator
    if (validator) {
      const result = validator(value);
      if (result !== true) {
        setError(result);
        return false;
      }
    }

    // Clear error if valid
    setError(null);
    return true;
  }, [value, required, validator, label, requiredMessage]);

  // Announce error to screen reader when it changes
  useEffect(() => {
    if (error && isTouched && announceErrors) {
      announce(error, { politeness: 'assertive', delay: 100 });
    }
  }, [error, isTouched, announceErrors]);

  // Handle value change
  const handleChange = useCallback(
    (newValue: T) => {
      setValue(newValue);
      onChange?.(newValue);

      // Validate on change if field has been touched
      if (validateOnChange && isTouched) {
        // Validate in next tick to ensure state is updated
        setTimeout(() => validate(), 0);
      }
    },
    [onChange, validateOnChange, isTouched, validate]
  );

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    onBlur?.();

    if (validateOnBlur) {
      validate();
    }
  }, [onBlur, validateOnBlur, validate]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset field
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsTouched(false);
  }, [initialValue]);

  const isValid = error === null;

  // Build aria-describedby
  const describedBy = [helpText ? helpTextId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ');

  return {
    id,
    labelId,
    errorId,
    helpTextId,
    value,
    error,
    isTouched,
    isValid,
    setValue: handleChange,
    setError,
    validate,
    clearError,
    reset,
    labelProps: {
      id: labelId,
      htmlFor: id,
    },
    inputProps: {
      id,
      name: id,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-labelledby': labelId,
      'aria-describedby': describedBy || undefined,
      'aria-invalid': !isValid,
      'aria-required': required ? true : undefined,
      ref: fieldRef,
    },
    errorProps: {
      id: errorId,
      role: 'alert',
      'aria-live': 'polite',
    },
    helpTextProps: {
      id: helpTextId,
    },
    fieldRef,
  };
};

/**
 * Helper type to ensure label is provided
 * Use this in component props to enforce accessible labels
 */
export type RequireLabel<T> = T & {
  label: string;
};
