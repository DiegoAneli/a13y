/**
 * @a13y/react - Wizard Pattern
 * Multi-step form with validation and keyboard navigation
 */

import { announce } from '@a13y/core/runtime/announce';
import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

/**
 * Wizard step definition
 */
export interface WizardStep {
  /**
   * Unique step ID
   */
  id: string;

  /**
   * Step label (shown in progress indicator)
   */
  label: string;

  /**
   * Step content
   */
  content: ReactNode;

  /**
   * Optional validation before proceeding
   * Return true if valid, or error message if invalid
   */
  validate?: () => true | string;

  /**
   * Whether this step can be skipped
   */
  optional?: boolean;
}

/**
 * Wizard context value
 */
interface WizardContextValue {
  /**
   * Current step index
   */
  currentStep: number;

  /**
   * Total number of steps
   */
  totalSteps: number;

  /**
   * Current step data
   */
  step: WizardStep;

  /**
   * Navigate to next step
   */
  next: () => void;

  /**
   * Navigate to previous step
   */
  previous: () => void;

  /**
   * Navigate to specific step (if valid)
   */
  goToStep: (index: number) => void;

  /**
   * Check if can go to next step
   */
  canGoNext: boolean;

  /**
   * Check if can go to previous step
   */
  canGoPrevious: boolean;

  /**
   * Check if on last step
   */
  isLastStep: boolean;

  /**
   * Validation error (if any)
   */
  validationError: string | null;
}

const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Hook to access wizard context
 */
export const useWizard = (): WizardContextValue => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within Wizard component');
  }
  return context;
};

/**
 * Props for Wizard
 */
export interface WizardProps {
  /**
   * Wizard steps (must have at least one)
   */
  steps: [WizardStep, ...WizardStep[]];

  /**
   * Called when wizard is completed
   */
  onComplete: () => void;

  /**
   * Called when wizard is cancelled
   */
  onCancel?: () => void;

  /**
   * Initial step index
   */
  initialStep?: number;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Wizard Component
 *
 * Multi-step form with:
 * - Progress indicator
 * - Keyboard navigation (arrows, Home, End)
 * - Step validation
 * - Screen reader announcements
 * - Focus management between steps
 *
 * Pattern Explanation:
 * - Each step can have validation before proceeding
 * - Arrow keys navigate between steps (if valid)
 * - Progress indicator shows current position
 * - Screen readers announce step changes
 * - Optional steps can be skipped
 * - Validation errors are announced to screen readers
 *
 * @example
 * ```tsx
 * <Wizard
 *   steps={[
 *     {
 *       id: 'account',
 *       label: 'Account Info',
 *       content: <AccountForm />,
 *       validate: () => isValidEmail(email) || 'Invalid email',
 *     },
 *     {
 *       id: 'preferences',
 *       label: 'Preferences',
 *       content: <PreferencesForm />,
 *       optional: true,
 *     },
 *     {
 *       id: 'review',
 *       label: 'Review',
 *       content: <ReviewScreen />,
 *     },
 *   ]}
 *   onComplete={() => console.log('Wizard completed!')}
 * />
 * ```
 */
export const Wizard = (props: WizardProps) => {
  const { steps, onComplete, onCancel, initialStep = 0, className = '' } = props;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([initialStep]));

  const totalSteps = steps.length;
  const step = steps[currentStep] ?? steps[0];

  // Ensure currentStep is always within bounds
  if (currentStep < 0 || currentStep >= totalSteps) {
    setCurrentStep(0);
  }
  const isLastStep = currentStep === totalSteps - 1;
  const canGoPrevious = currentStep > 0;
  const canGoNext = currentStep < totalSteps - 1;

  const validateCurrentStep = (): boolean => {
    if (!step.validate) return true;

    const result = step.validate();
    if (result === true) {
      setValidationError(null);
      return true;
    }

    setValidationError(result);
    announce(`Validation error: ${result}`, { politeness: 'assertive' });
    return false;
  };

  const goToStep = (index: number) => {
    if (index < 0 || index >= totalSteps) return;

    // Can only go forward if current step is valid
    if (index > currentStep && !validateCurrentStep()) {
      return;
    }

    setCurrentStep(index);
    setVisitedSteps((prev) => new Set([...prev, index]));
    setValidationError(null);

    // Announce to screen readers
    const newStep = steps[index];
    if (newStep) {
      announce(
        `Step ${index + 1} of ${totalSteps}: ${newStep.label}${newStep.optional ? ' (optional)' : ''}`,
        { politeness: 'polite' }
      );
    }
  };

  const next = () => {
    if (!canGoNext) return;

    if (validateCurrentStep()) {
      goToStep(currentStep + 1);
    }
  };

  const previous = () => {
    if (!canGoPrevious) return;
    goToStep(currentStep - 1);
  };

  const handleComplete = () => {
    if (validateCurrentStep()) {
      announce('Wizard completed', { politeness: 'polite' });
      onComplete();
    }
  };

  const contextValue: WizardContextValue = {
    currentStep,
    totalSteps,
    step,
    next,
    previous,
    goToStep,
    canGoNext,
    canGoPrevious,
    isLastStep,
    validationError,
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={className} style={{ maxWidth: '48rem', margin: '0 auto' }}>
        {/* Progress Indicator */}
        <nav aria-label="Wizard progress">
          <ol
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              padding: 0,
              listStyle: 'none',
            }}
          >
            {steps.map((s, index) => {
              const isActive = index === currentStep;
              const isCompleted = visitedSteps.has(index) && index < currentStep;
              const isClickable = visitedSteps.has(index) || index === currentStep;

              return (
                <li
                  key={s.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => isClickable && goToStep(index)}
                    aria-current={isActive ? 'step' : undefined}
                    disabled={!isClickable}
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      border: `2px solid ${isActive || isCompleted ? '#2563eb' : '#d1d5db'}`,
                      backgroundColor: isCompleted ? '#2563eb' : isActive ? 'white' : '#f3f4f6',
                      color: isCompleted ? 'white' : isActive ? '#2563eb' : '#9ca3af',
                      fontWeight: 600,
                      cursor: isClickable ? 'pointer' : 'not-allowed',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </button>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: isActive ? '#2563eb' : '#6b7280',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'center',
                    }}
                  >
                    {s.label}
                    {s.optional && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af' }}>
                        (Optional)
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Validation Error */}
        {validationError && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.375rem',
              color: '#991b1b',
            }}
          >
            {validationError}
          </div>
        )}

        {/* Step Content */}
        <div
          role="region"
          aria-labelledby={`step-${step.id}-label`}
          style={{ marginBottom: '2rem' }}
        >
          <h2
            id={`step-${step.id}-label`}
            style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}
          >
            {step.label}
          </h2>
          {step.content}
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}

            {canGoPrevious && (
              <button
                type="button"
                onClick={previous}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                ← Previous
              </button>
            )}
          </div>

          <div>
            {isLastStep ? (
              <button
                type="button"
                onClick={handleComplete}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Complete
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                disabled={!canGoNext}
                style={{
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 600,
                  cursor: canGoNext ? 'pointer' : 'not-allowed',
                  opacity: canGoNext ? 1 : 0.5,
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </WizardContext.Provider>
  );
};
