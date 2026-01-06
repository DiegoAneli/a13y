/**
 * SkipLinks Component
 * Accessible skip navigation links for keyboard users
 */

import React from 'react';

export interface SkipLink {
  /** Target element ID (without #) */
  href: string;
  /** Label for the skip link */
  label: string;
}

export interface SkipLinksProps {
  /** Array of skip links */
  links: SkipLink[];
  /** Optional className for the container */
  className?: string;
  /** Optional styles for the container */
  style?: React.CSSProperties;
  /** Optional styles for individual links */
  linkStyle?: React.CSSProperties;
}

/**
 * Skip navigation links component, visible only on keyboard focus
 * Should be the first focusable element on the page
 *
 * @example
 * ```tsx
 * const links = [
 *   { href: 'main-content', label: 'Skip to main content' },
 *   { href: 'navigation', label: 'Skip to navigation' },
 *   { href: 'footer', label: 'Skip to footer' }
 * ];
 *
 * <SkipLinks links={links} />
 *
 * // In your page layout:
 * <main id="main-content">...</main>
 * <nav id="navigation">...</nav>
 * <footer id="footer">...</footer>
 * ```
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({
  links,
  className = '',
  style = {},
  linkStyle = {},
}) => {
  if (links.length === 0) return null;

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 10000,
    ...style,
  };

  const listStyles: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const defaultLinkStyles: React.CSSProperties = {
    position: 'absolute',
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    display: 'block',
    padding: '12px 24px',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '0 0 4px 0',
    transition: 'none',
    ...linkStyle,
  };

  const focusStyles: React.CSSProperties = {
    position: 'static',
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
    left: 'auto',
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Find the target element
    const target = document.getElementById(href);
    if (target) {
      // Scroll to the element
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Set focus to the target
      // If the element is not focusable, make it focusable temporarily
      const originalTabIndex = target.getAttribute('tabindex');
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }

      target.focus();

      // Restore original tabindex after focus
      if (originalTabIndex === null) {
        setTimeout(() => {
          target.removeAttribute('tabindex');
        }, 100);
      }
    }
  };

  return (
    <nav
      aria-label="Skip navigation"
      className={className}
      style={containerStyles}
    >
      <ul style={listStyles}>
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={`#${link.href}`}
              onClick={(e) => handleClick(e, link.href)}
              style={defaultLinkStyles}
              onFocus={(e) => {
                Object.assign(e.currentTarget.style, focusStyles);
              }}
              onBlur={(e) => {
                Object.assign(e.currentTarget.style, defaultLinkStyles);
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
