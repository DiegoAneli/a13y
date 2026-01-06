/**
 * AccessibleCarousel Component
 * Fully accessible carousel with keyboard navigation and proper ARIA attributes
 */

import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { useId } from '../hooks/use-id';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { useAnnounce } from '../hooks/use-announce';

export interface AccessibleCarouselProps {
  /** Array of carousel items */
  items: ReactNode[];
  /** Whether to auto-play the carousel */
  autoPlay?: boolean;
  /** Interval between slides in milliseconds */
  interval?: number;
  /** Whether to show navigation controls */
  controls?: boolean;
  /** Whether to show slide indicators */
  indicators?: boolean;
  /** Whether to loop back to start/end */
  loop?: boolean;
  /** Optional aria-label */
  ariaLabel?: string;
  /** Optional className */
  className?: string;
  /** Optional styles */
  style?: React.CSSProperties;
}

/**
 * Accessible carousel component with auto-play and keyboard navigation
 *
 * @example
 * ```tsx
 * const slides = [
 *   <div>Slide 1</div>,
 *   <div>Slide 2</div>,
 *   <div>Slide 3</div>
 * ];
 *
 * <AccessibleCarousel
 *   items={slides}
 *   autoPlay
 *   interval={5000}
 *   controls
 *   indicators
 * />
 * ```
 */
export const AccessibleCarousel: React.FC<AccessibleCarouselProps> = ({
  items,
  autoPlay = false,
  interval = 5000,
  controls = true,
  indicators = true,
  loop = true,
  ariaLabel = 'Carousel',
  className = '',
  style = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);

  const carouselId = useId('carousel');
  const regionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const prefersReducedMotion = useReducedMotion();
  const announce = useAnnounce();

  const totalSlides = items.length;

  useEffect(() => {
    if (isPlaying && !isPaused && !prefersReducedMotion) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, currentIndex, interval, prefersReducedMotion]);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? (loop ? totalSlides - 1 : 0) : currentIndex - 1;
    setCurrentIndex(newIndex);
    announce(`Slide ${newIndex + 1} of ${totalSlides}`, 'polite');
  };

  const handleNext = () => {
    const newIndex = currentIndex === totalSlides - 1 ? (loop ? 0 : totalSlides - 1) : currentIndex + 1;
    setCurrentIndex(newIndex);
    announce(`Slide ${newIndex + 1} of ${totalSlides}`, 'polite');
  };

  const handleGoToSlide = (index: number) => {
    setCurrentIndex(index);
    announce(`Slide ${index + 1} of ${totalSlides}`, 'polite');
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    announce(isPlaying ? 'Carousel paused' : 'Carousel playing', 'polite');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        handlePrevious();
        break;

      case 'ArrowRight':
        event.preventDefault();
        handleNext();
        break;

      case 'Home':
        event.preventDefault();
        handleGoToSlide(0);
        break;

      case 'End':
        event.preventDefault();
        handleGoToSlide(totalSlides - 1);
        break;
    }
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    ...style,
  };

  const slidesContainerStyles: React.CSSProperties = {
    display: 'flex',
    transition: prefersReducedMotion ? 'none' : 'transform 0.5s ease-in-out',
    transform: `translateX(-${currentIndex * 100}%)`,
  };

  const slideStyles: React.CSSProperties = {
    minWidth: '100%',
    flex: '0 0 auto',
  };

  const controlsContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: 'translateY(-50%)',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 16px',
    pointerEvents: 'none',
  };

  const controlButtonStyles: React.CSSProperties = {
    pointerEvents: 'auto',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const indicatorsStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '16px',
  };

  const indicatorButtonStyles = (isActive: boolean): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: isActive ? '#3b82f6' : '#d1d5db',
    cursor: 'pointer',
    padding: 0,
    transition: 'background-color 0.2s',
  });

  const playPauseButtonStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div style={containerStyles}>
        <div
          id={`${carouselId}-slides`}
          style={slidesContainerStyles}
          aria-live="polite"
          aria-atomic="false"
        >
          {items.map((item, index) => (
            <div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}`}
              aria-hidden={index !== currentIndex}
              style={slideStyles}
            >
              {item}
            </div>
          ))}
        </div>

        {controls && (
          <div style={controlsContainerStyles}>
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous slide"
              aria-controls={`${carouselId}-slides`}
              disabled={!loop && currentIndex === 0}
              style={{
                ...controlButtonStyles,
                opacity: !loop && currentIndex === 0 ? 0.5 : 1,
                cursor: !loop && currentIndex === 0 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (loop || currentIndex !== 0) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              aria-controls={`${carouselId}-slides`}
              disabled={!loop && currentIndex === totalSlides - 1}
              style={{
                ...controlButtonStyles,
                opacity: !loop && currentIndex === totalSlides - 1 ? 0.5 : 1,
                cursor: !loop && currentIndex === totalSlides - 1 ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (loop || currentIndex !== totalSlides - 1) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              ›
            </button>
          </div>
        )}

        {autoPlay && (
          <button
            type="button"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
            style={playPauseButtonStyles}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            }}
          >
            {isPlaying ? '⏸' : '▶'} {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
      </div>

      {indicators && (
        <div role="group" aria-label="Slide indicators" style={indicatorsStyles}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleGoToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
              style={indicatorButtonStyles(index === currentIndex)}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.backgroundColor = '#9ca3af';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.backgroundColor = '#d1d5db';
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};
