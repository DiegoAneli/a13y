/**
 * AccessibleProgress Component
 * Accessible progress bar and spinner with proper ARIA attributes
 */

import React from 'react';
import { useId } from '../hooks/use-id';
import { useAriaLive } from '../hooks/use-aria-live';

export type ProgressVariant = 'linear' | 'circular';

export interface AccessibleProgressProps {
  /** Current progress value (undefined for indeterminate) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Minimum value */
  min?: number;
  /** Label for the progress indicator */
  label: string;
  /** Visual variant */
  variant?: ProgressVariant;
  /** Whether to show percentage text */
  showValue?: boolean;
  /** Whether to announce progress changes */
  announceChanges?: boolean;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible progress indicator with ARIA live regions
 *
 * @example
 * ```tsx
 * // Determinate progress
 * <AccessibleProgress
 *   value={75}
 *   label="Upload progress"
 *   showValue
 * />
 *
 * // Indeterminate progress
 * <AccessibleProgress
 *   label="Loading..."
 *   variant="circular"
 * />
 * ```
 */
export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  min = 0,
  label,
  variant = 'linear',
  showValue = false,
  announceChanges = false,
  className = '',
  style = {},
}) => {
  const progressId = useId('progress');
  const labelId = useId('progress-label');
  const { setMessage, liveRegionProps, message } = useAriaLive('polite');

  const isIndeterminate = value === undefined;
  const percentage = isIndeterminate ? 0 : Math.round(((value - min) / (max - min)) * 100);

  React.useEffect(() => {
    if (announceChanges && !isIndeterminate && value !== undefined) {
      const milestones = [25, 50, 75, 100];
      if (milestones.includes(percentage)) {
        setMessage(`${label}: ${percentage}% complete`);
      }
    }
  }, [percentage, announceChanges, isIndeterminate, value, label, setMessage]);

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: variant === 'linear' ? 'column' : 'row',
    alignItems: variant === 'linear' ? 'stretch' : 'center',
    gap: variant === 'linear' ? '8px' : '12px',
    width: variant === 'linear' ? '100%' : 'auto',
    ...style,
  };

  const labelContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
  };

  const renderLinearProgress = () => {
    const trackStyles: React.CSSProperties = {
      width: '100%',
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      position: 'relative',
    };

    const barStyles: React.CSSProperties = {
      height: '100%',
      backgroundColor: '#3b82f6',
      transition: isIndeterminate ? 'none' : 'width 0.3s ease',
      width: isIndeterminate ? '30%' : `${percentage}%`,
      animation: isIndeterminate ? 'indeterminateLinear 1.5s infinite ease-in-out' : 'none',
    };

    return (
      <>
        <style>
          {`
            @keyframes indeterminateLinear {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400%); }
            }
          `}
        </style>
        <div style={labelContainerStyles}>
          <span id={labelId}>{label}</span>
          {showValue && !isIndeterminate && <span>{percentage}%</span>}
        </div>
        <div style={trackStyles}>
          <div style={barStyles} />
        </div>
      </>
    );
  };

  const renderCircularProgress = () => {
    const size = 48;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate ? circumference * 0.25 : circumference - (percentage / 100) * circumference;

    const svgStyles: React.CSSProperties = {
      transform: 'rotate(-90deg)',
      animation: isIndeterminate ? 'spin 1s linear infinite' : 'none',
    };

    const circleStyles: React.CSSProperties = {
      transition: isIndeterminate ? 'none' : 'stroke-dashoffset 0.3s ease',
    };

    return (
      <>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(-90deg); }
              to { transform: rotate(270deg); }
            }
          `}
        </style>
        <svg width={size} height={size} style={svgStyles}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={circleStyles}
          />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span id={labelId} style={{ fontSize: '14px', fontWeight: 500 }}>
            {label}
          </span>
          {showValue && !isIndeterminate && (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{percentage}%</span>
          )}
        </div>
      </>
    );
  };

  return (
    <div className={className} style={containerStyles}>
      <div
        id={progressId}
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={isIndeterminate ? 'Loading...' : `${percentage}%`}
      >
        {variant === 'linear' ? renderLinearProgress() : renderCircularProgress()}
      </div>
      {announceChanges && (
        <div {...liveRegionProps} style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>
          {message}
        </div>
      )}
    </div>
  );
};
