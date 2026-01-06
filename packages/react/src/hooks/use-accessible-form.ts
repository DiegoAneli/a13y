/**
 * @a13y/react - useAccessibleForm Hook
 * Form management with accessibility built-in
 */

import { announce } from '@a13y/core/runtime/announce';
import { useCallback, useRef, useState } from 'react';

/**
 * Field-level validation function
 */
export type FieldValidator<T> = (value: T) => string | true;

/**
 * Form-level validation function (for cross-field validation)
 */
export type FormValidator<T> = (values: T) => Record<string, string> | null;

/**
 * Field configuration
 */
export interface FieldConfig<T> {
  /**
   * Initial value
   */
  initialValue: T;

  /**
   * Validation function (optional)
   * Return true if valid, or error message if invalid
   */
  validate?: FieldValidator<T>;

  /**
   * Required field
   * @default false
   */
  required?: boolean;

  /**
   * Custom required message
   */
  requiredMessage?: string;
}

/**
 * Form configuration
 */
export interface FormConfig<T extends Record<string, unknown>> {
  /**
   * Field configurations
   */
  fields: {
    [K in keyof T]: FieldConfig<T[K]>;
  };

  /**
   * Form-level validation (optional)
   * For cross-field validation
   */
  validate?: FormValidator<T>;

  /**
   * Called when form is successfully submitted
   */
  onSubmit: (values: T) => void | Promise<void>;

  /**
   * Auto-focus first error on validation failure
   * @default true
   */
  autoFocusError?: boolean;

  /**
   * Announce errors to screen readers
   * @default true
   */
  announceErrors?: boolean;

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
}

/**
 * Form state
 */
export interface FormState<T extends Record<string, unknown>> {
  /**
   * Current form values
   */
  values: T;

  /**
   * Field errors
   */
  errors: Partial<Record<keyof T, string>>;

  /**
   * Fields that have been touched (blurred at least once)
   */
  touched: Partial<Record<keyof T, boolean>>;

  /**
   * Is form submitting
   */
  isSubmitting: boolean;

  /**
   * Is form valid (no errors)
   */
  isValid: boolean;

  /**
   * Has form been submitted at least once
   */
  hasSubmitted: boolean;
}

/**
 * Field props for binding to input elements
 */
export interface FieldProps<T> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
}

/**
 * Form return value
 */
export interface UseAccessibleFormReturn<T extends Record<string, unknown>> {
  /**
   * Form state
   */
  state: FormState<T>;

  /**
   * Get props for a field
   */
  getFieldProps: <K extends keyof T>(
    name: K,
    options?: { 'aria-describedby'?: string }
  ) => FieldProps<T[K]>;

  /**
   * Set field value programmatically
   */
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;

  /**
   * Set field error programmatically
   */
  setFieldError: <K extends keyof T>(name: K, error: string) => void;

  /**
   * Set multiple field errors at once
   */
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;

  /**
   * Validate a single field
   */
  validateField: <K extends keyof T>(name: K) => boolean;

  /**
   * Validate entire form
   */
  validateForm: () => boolean;

  /**
   * Handle form submit
   */
  handleSubmit: (e?: React.FormEvent) => void;

  /**
   * Reset form to initial values
   */
  reset: () => void;

  /**
   * Clear all errors
   */
  clearErrors: () => void;

  /**
   * Field refs for focus management
   */
  fieldRefs: Map<keyof T, HTMLElement>;
}

/**
 * useAccessibleForm Hook
 *
 * Comprehensive form management with accessibility built-in:
 * - Automatic error announcements to screen readers
 * - Auto-focus first error field on validation failure
 * - Required field validation
 * - Field-level and form-level validation
 * - aria-invalid and aria-describedby management
 * - Touch tracking for better UX
 *
 * Pattern Explanation:
 * - Each field gets automatic ARIA attributes
 * - Errors are announced via screen reader
 * - First error field receives focus on submit
 * - Validation can run on blur or change
 * - Required fields enforced via TypeScript
 *
 * @example
 * ```tsx
 * const form = useAccessibleForm({
 *   fields: {
 *     email: {
 *       initialValue: '',
 *       required: true,
 *       validate: (value) => {
 *         if (!value.includes('@')) return 'Invalid email';
 *         return true;
 *       },
 *     },
 *     password: {
 *       initialValue: '',
 *       required: true,
 *       validate: (value) => {
 *         if (value.length < 8) return 'Password must be at least 8 characters';
 *         return true;
 *       },
 *     },
 *   },
 *   onSubmit: (values) => {
 *     console.log('Form submitted:', values);
 *   },
 * });
 *
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     <input {...form.getFieldProps('email')} type="email" />
 *     {form.state.errors.email && (
 *       <span id="email-error">{form.state.errors.email}</span>
 *     )}
 *   </form>
 * );
 * ```
 */
export const useAccessibleForm = <T extends Record<string, unknown>>(
  config: FormConfig<T>
): UseAccessibleFormReturn<T> => {
  const {
    fields,
    validate: formValidator,
    onSubmit,
    autoFocusError = true,
    announceErrors = true,
    validateOnBlur = true,
    validateOnChange = true,
  } = config;

  // Initialize form values from field configs
  const initialValues = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].initialValue;
    return acc;
  }, {} as T);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Field refs for focus management
  const fieldRefs = useRef<Map<keyof T, HTMLElement>>(new Map());

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(name: K): boolean => {
      const fieldConfig = fields[name];
      const value = values[name];

      // Check required
      if (fieldConfig.required) {
        const isEmpty =
          value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          const errorMessage = fieldConfig.requiredMessage || `${String(name)} is required`;
          setErrors((prev) => ({ ...prev, [name]: errorMessage }));
          return false;
        }
      }

      // Run custom validator
      if (fieldConfig.validate) {
        const result = fieldConfig.validate(value);
        if (result !== true) {
          setErrors((prev) => ({ ...prev, [name]: result }));
          return false;
        }
      }

      // Clear error if valid
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    },
    [fields, values]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    // Validate all fields
    for (const name of Object.keys(fields) as Array<keyof T>) {
      const fieldConfig = fields[name];
      const value = values[name];

      // Check required
      if (fieldConfig.required) {
        const isEmpty =
          value === '' ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          const errorMessage = fieldConfig.requiredMessage || `${String(name)} is required`;
          newErrors[name] = errorMessage;
          isValid = false;
          continue;
        }
      }

      // Run custom validator
      if (fieldConfig.validate) {
        const result = fieldConfig.validate(value);
        if (result !== true) {
          newErrors[name] = result;
          isValid = false;
        }
      }
    }

    // Run form-level validator
    if (formValidator) {
      const formErrors = formValidator(values);
      if (formErrors) {
        Object.assign(newErrors, formErrors);
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [fields, values, formValidator]);

  // Set field value
  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set field error
  const setFieldError = useCallback(<K extends keyof T>(name: K, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Get field props
  const getFieldProps = useCallback(
    <K extends keyof T>(name: K, options?: { 'aria-describedby'?: string }): FieldProps<T[K]> => {
      const fieldConfig = fields[name];
      const hasError = !!errors[name];
      const errorId = `${String(name)}-error`;

      return {
        name: String(name),
        value: values[name],
        onChange: (value: T[K]) => {
          setFieldValue(name, value);
          // Validate on change if field has been touched
          if (validateOnChange && touched[name]) {
            validateField(name);
          }
        },
        onBlur: () => {
          setTouched((prev) => ({ ...prev, [name]: true }));
          if (validateOnBlur) {
            validateField(name);
          }
        },
        'aria-invalid': hasError,
        'aria-describedby': hasError
          ? options?.['aria-describedby']
            ? `${errorId} ${options['aria-describedby']}`
            : errorId
          : options?.['aria-describedby'],
        'aria-required': fieldConfig.required,
      };
    },
    [
      fields,
      values,
      errors,
      touched,
      setFieldValue,
      validateField,
      validateOnBlur,
      validateOnChange,
    ]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      setHasSubmitted(true);
      const isValid = validateForm();

      if (!isValid) {
        // Count errors
        const errorCount = Object.keys(errors).length;

        // Announce errors to screen reader
        if (announceErrors) {
          const errorMessage =
            errorCount === 1
              ? 'Form has 1 error. Please correct it and try again.'
              : `Form has ${errorCount} errors. Please correct them and try again.`;
          announce(errorMessage, { politeness: 'assertive' });
        }

        // Focus first error field
        if (autoFocusError) {
          const firstErrorField = Object.keys(errors)[0] as keyof T;
          const fieldElement = fieldRefs.current.get(firstErrorField);
          if (fieldElement) {
            fieldElement.focus();
          }
        }

        return;
      }

      // Submit form
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        announce('Form submitted successfully', { politeness: 'polite' });
      } catch (error) {
        if (announceErrors) {
          announce('Form submission failed. Please try again.', {
            politeness: 'assertive',
          });
        }
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateForm, errors, announceErrors, autoFocusError, onSubmit, values]
  );

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setHasSubmitted(false);
  }, [initialValues]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    state: {
      values,
      errors,
      touched,
      isSubmitting,
      isValid,
      hasSubmitted,
    },
    getFieldProps,
    setFieldValue,
    setFieldError,
    setErrors,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    clearErrors,
    fieldRefs: fieldRefs.current,
  };
};
