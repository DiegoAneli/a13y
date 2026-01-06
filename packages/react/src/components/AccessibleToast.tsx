/**
 * AccessibleToast Component
 * Accessible toast notifications with proper ARIA live regions
 */

import React, { useEffect, useState } from 'react';
import { useId } from '../hooks/use-id';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
  /** Label for the action button */
  label: string;
  /** Callback when action is clicked */
  onClick: () => void;
}

export interface AccessibleToastProps {
  /** The message to display */
  message: string;
  /** Type of toast (affects styling and ARIA role) */
  type?: ToastType;
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Position of the toast */
  position?: ToastPosition;
  /** Optional action button */
  action?: ToastAction;
  /** Whether the toast is visible */
  isOpen: boolean;
  /** Callback when toast is dismissed */
  onClose: () => void;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible toast notification component with ARIA live regions
 *
 * @example
 * ```tsx
 * const [showToast, setShowToast] = useState(false);
 *
 * <AccessibleToast
 *   message="Item added to cart"
 *   type="success"
 *   duration={5000}
 *   isOpen={showToast}
 *   onClose={() => setShowToast(false)}
 *   action={{
 *     label: 'Undo',
 *     onClick: () => removeItem()
 *   }}
 * />
 * ```
 */
export const AccessibleToast: React.FC<AccessibleToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  action,
  isOpen,
  onClose,
  className = '',
  style = {},
}) => {
  const toastId = useId('toast');
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!isVisible || duration === 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsVisible(false);
      onClose();
    }
  };

  if (!isVisible) return null;

  const getAriaRole = (): 'status' | 'alert' => {
    return type === 'error' ? 'alert' : 'status';
  };

  const getAriaPoliteness = (): 'polite' | 'assertive' => {
    return type === 'error' ? 'assertive' : 'polite';
  };

  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
    };

    switch (position) {
      case 'top-right':
        return { ...base, top: '16px', right: '16px' };
      case 'top-left':
        return { ...base, top: '16px', left: '16px' };
      case 'bottom-right':
        return { ...base, bottom: '16px', right: '16px' };
      case 'bottom-left':
        return { ...base, bottom: '16px', left: '16px' };
      case 'top-center':
        return { ...base, top: '16px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...base, bottom: '16px', left: '50%', transform: 'translateX(-50%)' };
      default:
        return base;
    }
  };

  const getTypeStyles = (): React.CSSProperties => {
    const baseTypeStyles: Record<ToastType, React.CSSProperties> = {
      success: { backgroundColor: '#10b981', color: '#fff' },
      error: { backgroundColor: '#ef4444', color: '#fff' },
      warning: { backgroundColor: '#f59e0b', color: '#fff' },
      info: { backgroundColor: '#3b82f6', color: '#fff' },
    };

    return baseTypeStyles[type];
  };

  const toastStyles: React.CSSProperties = {
    ...getPositionStyles(),
    ...getTypeStyles(),
    minWidth: '300px',
    maxWidth: '500px',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    animation: 'slideIn 0.3s ease-out',
    ...style,
  };

  const messageStyles: React.CSSProperties = {
    flex: 1,
    fontSize: '14px',
    lineHeight: '1.5',
  };

  const buttonStyles: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid currentColor',
    color: 'inherit',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  const closeButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    border: 'none',
    padding: '4px 8px',
    fontSize: '18px',
    lineHeight: '1',
  };

  return (
    <div
      id={toastId}
      role={getAriaRole()}
      aria-live={getAriaPoliteness()}
      aria-atomic="true"
      className={className}
      style={toastStyles}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div style={messageStyles}>{message}</div>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            setIsVisible(false);
            onClose();
          }}
          style={buttonStyles}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        aria-label="Close notification"
        style={closeButtonStyles}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        ×
      </button>
    </div>
  );
};

/**
 * ToastContainer component to manage multiple toasts
 */
export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
}

export interface ToastContainerProps {
  /** Array of toasts to display */
  toasts: Toast[];
  /** Callback to remove a toast */
  onRemove: (id: string) => void;
  /** Position for all toasts */
  position?: ToastPosition;
}

/**
 * Container component to manage multiple toast notifications
 *
 * @example
 * ```tsx
 * const [toasts, setToasts] = useState<Toast[]>([]);
 *
 * const addToast = (message: string, type: ToastType) => {
 *   const id = Date.now().toString();
 *   setToasts(prev => [...prev, { id, message, type }]);
 * };
 *
 * const removeToast = (id: string) => {
 *   setToasts(prev => prev.filter(t => t.id !== id));
 * };
 *
 * <ToastContainer toasts={toasts} onRemove={removeToast} />
 * ```
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  return (
    <>
      {toasts.map((toast) => (
        <AccessibleToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={position}
          action={toast.action}
          isOpen={true}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
};
