/**
 * AccessibleTooltip Component
 * A fully accessible tooltip with proper ARIA attributes and keyboard support
 */

import React, { type ReactElement, cloneElement, useState, useRef, useEffect } from 'react';
import { useId } from '../hooks/use-id';

export interface AccessibleTooltipProps {
  /** Content to display in the tooltip */
  content: string;
  /** Placement of the tooltip relative to the trigger */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay before showing the tooltip (in milliseconds) */
  delay?: number;
  /** Trigger method for showing the tooltip */
  trigger?: 'hover' | 'focus' | 'both';
  /** The element that triggers the tooltip */
  children: ReactElement;
  /** Optional className for the tooltip container */
  className?: string;
  /** Optional styles for the tooltip container */
  style?: React.CSSProperties;
}

/**
 * Accessible tooltip component that properly announces content to screen readers
 *
 * @example
 * ```tsx
 * <AccessibleTooltip content="This is helpful information">
 *   <button>Hover me</button>
 * </AccessibleTooltip>
 * ```
 */
export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  content,
  placement = 'top',
  delay = 300,
  trigger = 'both',
  children,
  className = '',
  style = {},
}) => {
  const tooltipId = useId('tooltip');
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const triggerRef = useRef<HTMLElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle ESC key to close tooltip
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideTooltip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  const shouldTriggerOnHover = trigger === 'hover' || trigger === 'both';
  const shouldTriggerOnFocus = trigger === 'focus' || trigger === 'both';

  const childProps: Record<string, unknown> = {
    ref: triggerRef,
    'aria-describedby': isVisible ? tooltipId : undefined,
  };

  if (shouldTriggerOnHover) {
    childProps.onMouseEnter = () => showTooltip();
    childProps.onMouseLeave = () => hideTooltip();
  }

  if (shouldTriggerOnFocus) {
    childProps.onFocus = () => showTooltip();
    childProps.onBlur = () => hideTooltip();
  }

  const getTooltipPosition = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 1000,
      padding: '8px 12px',
      backgroundColor: '#333',
      color: '#fff',
      borderRadius: '4px',
      fontSize: '14px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    };

    switch (placement) {
      case 'top':
        return { ...baseStyles, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' };
      case 'bottom':
        return { ...baseStyles, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' };
      case 'left':
        return { ...baseStyles, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' };
      case 'right':
        return { ...baseStyles, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' };
      default:
        return baseStyles;
    }
  };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {cloneElement(children, childProps)}
      {isVisible && (
        <span
          role="tooltip"
          id={tooltipId}
          className={className}
          style={{ ...getTooltipPosition(), ...style }}
        >
          {content}
        </span>
      )}
    </span>
  );
};
