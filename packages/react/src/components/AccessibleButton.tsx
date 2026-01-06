/**
 * @a13y/react - AccessibleButton Component
 * Type-safe button component with enforced accessible name
 */

import type { ReactNode } from 'react';
import { useAccessibleButton } from '../hooks/use-accessible-button';

/**
 * Button variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * Props for AccessibleButton
 */
export interface AccessibleButtonProps {
  /**
   * Button content
   * If content is not text (e.g., icon only), label is REQUIRED
   */
  children: ReactNode;

  /**
   * Accessible label
   * REQUIRED if children is not text (e.g., icon-only button)
   */
  label?: string;

  /**
   * Click handler
   */
  onPress: (event: import('../hooks/use-accessible-button').PressEvent) => void;

  /**
   * Whether button is disabled
   */
  disabled?: boolean;

  /**
   * Visual variant (does not affect accessibility)
   */
  variant?: ButtonVariant;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Accessible Button Component
 *
 * Features:
 * - Automatic keyboard support (Enter, Space)
 * - Required accessible name (compile-time + runtime)
 * - Disabled state handling
 * - Development-time validation
 *
 * @example
 * ```tsx
 * // Text button (label optional)
 * <AccessibleButton onPress={() => console.log('Clicked')}>
 *   Save
 * </AccessibleButton>
 *
 * // Icon button (label REQUIRED)
 * <AccessibleButton
 *   label="Delete item"
 *   onPress={() => console.log('Deleted')}
 * >
 *   🗑️
 * </AccessibleButton>
 * ```
 */
export const AccessibleButton = (props: AccessibleButtonProps) => {
  const {
    children,
    label,
    onPress,
    disabled = false,
    variant = 'primary',
    className = '',
    type = 'button',
  } = props;

  const { buttonProps } = useAccessibleButton({
    label,
    onPress,
    isDisabled: disabled,
  });

  // Base styles (minimal, no framework dependency)
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:outline-gray-500',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  return (
    <button
      {...buttonProps}
      type={type}
      className={combinedClassName}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
};
