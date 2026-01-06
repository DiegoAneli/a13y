/**
 * @a13y/core - Keyboard Manager
 * Manages keyboard navigation patterns and shortcuts
 */

import { getFocusableElements } from '../aria/aria-utils';
import { assertBrowser, devWarn } from '../env/environment';
import { KeyboardNavigationError } from '../errors/accessibility-errors';

/**
 * Keyboard navigation direction
 */
export type NavigationDirection = 'forward' | 'backward' | 'first' | 'last';

/**
 * Arrow key direction
 */
export type ArrowDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Keyboard event handler
 */
export type KeyboardHandler = (event: KeyboardEvent) => void;

/**
 * Roving tabindex manager
 * Implements the roving tabindex pattern for keyboard navigation
 * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex
 */
export class RovingTabindexManager {
  private currentIndex = 0;
  private elements: HTMLElement[] = [];
  private isActive = false;

  constructor(
    private container: HTMLElement,
    private options: {
      orientation?: 'horizontal' | 'vertical' | 'both';
      loop?: boolean;
      onNavigate?: (element: HTMLElement, index: number) => void;
    } = {}
  ) {
    this.options.orientation = this.options.orientation || 'horizontal';
    this.options.loop = this.options.loop ?? true;
  }

  /**
   * Initialize the roving tabindex
   */
  init(): void {
    assertBrowser('RovingTabindexManager.init');

    if (this.isActive) {
      devWarn(false, 'RovingTabindexManager is already active');
      return;
    }

    this.updateElements();

    if (this.elements.length === 0) {
      throw new KeyboardNavigationError(
        'RovingTabindexManager: no focusable elements found in container'
      );
    }

    // Set up initial tabindex
    this.setTabindexes();

    // Add keyboard listeners
    this.container.addEventListener('keydown', this.handleKeyDown);

    this.isActive = true;
  }

  /**
   * Destroy the roving tabindex
   */
  destroy(): void {
    if (!this.isActive) {
      return;
    }

    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.isActive = false;
  }

  /**
   * Update the list of elements
   * Call this when elements are added/removed
   */
  updateElements(): void {
    this.elements = getFocusableElements(this.container);
  }

  /**
   * Navigate to a specific index
   */
  navigateTo(index: number): void {
    if (index < 0 || index >= this.elements.length) {
      throw new KeyboardNavigationError(
        `Invalid index: ${index}. Must be between 0 and ${this.elements.length - 1}`
      );
    }

    this.currentIndex = index;
    this.setTabindexes();
    this.elements[this.currentIndex]?.focus();

    const currentElement = this.elements[this.currentIndex];
    if (this.options.onNavigate && currentElement) {
      this.options.onNavigate(currentElement, this.currentIndex);
    }
  }

  /**
   * Navigate in a direction
   */
  navigate(direction: NavigationDirection): void {
    let newIndex = this.currentIndex;

    switch (direction) {
      case 'forward':
        newIndex = this.currentIndex + 1;
        if (newIndex >= this.elements.length) {
          newIndex = this.options.loop ? 0 : this.elements.length - 1;
        }
        break;

      case 'backward':
        newIndex = this.currentIndex - 1;
        if (newIndex < 0) {
          newIndex = this.options.loop ? this.elements.length - 1 : 0;
        }
        break;

      case 'first':
        newIndex = 0;
        break;

      case 'last':
        newIndex = this.elements.length - 1;
        break;
    }

    if (newIndex !== this.currentIndex) {
      this.navigateTo(newIndex);
    }
  }

  /**
   * Get current focused index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  private setTabindexes(): void {
    this.elements.forEach((element, index) => {
      element.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
    });
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const { orientation } = this.options;

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          this.navigate('forward');
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          this.navigate('backward');
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          this.navigate('forward');
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          this.navigate('backward');
        }
        break;

      case 'Home':
        event.preventDefault();
        this.navigate('first');
        break;

      case 'End':
        event.preventDefault();
        this.navigate('last');
        break;
    }
  };
}

/**
 * Arrow key navigation handler
 * Simpler alternative to roving tabindex for basic arrow key handling
 */
export const createArrowKeyHandler = (
  elements: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onNavigate?: (element: HTMLElement, index: number) => void;
  } = {}
): KeyboardHandler => {
  const { orientation = 'horizontal', loop = true, onNavigate } = options;

  return (event: KeyboardEvent) => {
    const currentElement = event.target as HTMLElement;
    const currentIndex = elements.indexOf(currentElement);

    if (currentIndex === -1) {
      return;
    }

    let newIndex = currentIndex;
    let shouldHandle = false;

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = currentIndex + 1;
          shouldHandle = true;
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          newIndex = currentIndex - 1;
          shouldHandle = true;
        }
        break;

      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = currentIndex + 1;
          shouldHandle = true;
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          newIndex = currentIndex - 1;
          shouldHandle = true;
        }
        break;

      case 'Home':
        newIndex = 0;
        shouldHandle = true;
        break;

      case 'End':
        newIndex = elements.length - 1;
        shouldHandle = true;
        break;
    }

    if (!shouldHandle) {
      return;
    }

    // Handle looping
    if (newIndex < 0) {
      newIndex = loop ? elements.length - 1 : 0;
    } else if (newIndex >= elements.length) {
      newIndex = loop ? 0 : elements.length - 1;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      const targetElement = elements[newIndex];
      if (targetElement) {
        targetElement.focus();
        if (onNavigate) {
          onNavigate(targetElement, newIndex);
        }
      }
    }
  };
};

/**
 * Keyboard shortcut manager
 * Manages keyboard shortcuts with conflict detection
 */
export class KeyboardShortcutManager {
  private shortcuts = new Map<string, KeyboardHandler>();
  private isActive = false;

  /**
   * Register a keyboard shortcut
   * @param key - Key combination (e.g., "Ctrl+K", "Escape", "Alt+Shift+D")
   * @param handler - Handler function
   */
  register(key: string, handler: KeyboardHandler): void {
    const normalizedKey = this.normalizeKey(key);

    if (this.shortcuts.has(normalizedKey)) {
      devWarn(
        false,
        `Keyboard shortcut "${key}" is already registered. Overwriting previous handler.`
      );
    }

    this.shortcuts.set(normalizedKey, handler);
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string): void {
    const normalizedKey = this.normalizeKey(key);
    this.shortcuts.delete(normalizedKey);
  }

  /**
   * Activate the shortcut manager
   */
  activate(): void {
    if (this.isActive) {
      return;
    }

    assertBrowser('KeyboardShortcutManager.activate');
    document.addEventListener('keydown', this.handleKeyDown, true);
    this.isActive = true;
  }

  /**
   * Deactivate the shortcut manager
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }

    document.removeEventListener('keydown', this.handleKeyDown, true);
    this.isActive = false;
  }

  /**
   * Clear all shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = this.eventToKey(event);
    const handler = this.shortcuts.get(key);

    if (handler) {
      handler(event);
    }
  };

  private normalizeKey(key: string): string {
    return key
      .split('+')
      .map((part) => part.trim())
      .sort()
      .join('+')
      .toLowerCase();
  }

  private eventToKey(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');

    parts.push(event.key.toLowerCase());

    return parts.sort().join('+');
  }
}
