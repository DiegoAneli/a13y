# @a13y/core

**Runtime-enforced accessibility primitives for TypeScript**

Framework-agnostic utilities for focus management, keyboard navigation, ARIA, and screen reader announcements.

[![npm version](https://img.shields.io/npm/v/@a13y/core.svg)](https://www.npmjs.com/package/@a13y/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---


## Features

- **Framework-agnostic** - Works with vanilla JS, React, Vue, Svelte, etc.
- **Type-safe** - Full TypeScript support with strict typing
- **Zero dependencies** - Minimal bundle size
- **Tree-shakeable** - Import only what you need
- **WCAG 2.2 compliant** - Follows accessibility best practices
- **Runtime validation** - Optional dev-time checks with @a13y/devtools

## Installation

```bash
npm install @a13y/core
```

Optional devtools for development warnings:

```bash
npm install -D @a13y/devtools
```

## Modules

### Focus Management

```typescript
import { FocusManager } from '@a13y/core/runtime/focus';

const manager = new FocusManager();

// Create focus trap for modals
const trap = manager.createTrap(element, {
  onEscape: () => console.log('Escape pressed'),
  restoreFocus: true,
});

trap.activate();
// Focus is now trapped within element
trap.deactivate();
```

### Keyboard Navigation

```typescript
import { KeyboardNavigationManager } from '@a13y/core/runtime/keyboard';

const nav = new KeyboardNavigationManager(containerElement, {
  orientation: 'horizontal', // Arrow Left/Right
  loop: true,
  onNavigate: (index) => console.log('Focused item:', index),
});

nav.initialize();
```

### ARIA Utilities

```typescript
import {
  setAriaExpanded,
  setAriaPressed,
  setAriaChecked,
} from '@a13y/core/runtime/aria';

// Set ARIA attributes with type safety
setAriaExpanded(button, true);
setAriaPressed(toggleButton, false);
setAriaChecked(checkbox, 'mixed');
```

### Screen Reader Announcements

```typescript
import { Announcer } from '@a13y/core/runtime/announce';

const announcer = new Announcer();

// Polite announcement (doesn't interrupt)
announcer.announce('Item added to cart', 'polite');

// Assertive announcement (interrupts current speech)
announcer.announce('Error: Form submission failed', 'assertive');

// Cleanup
announcer.destroy();
```

### Environment Detection

```typescript
import {
  isScreenReaderActive,
  prefersReducedMotion,
  hasKeyboard,
} from '@a13y/core/runtime/env';

if (isScreenReaderActive()) {
  console.log('Screen reader detected');
}

if (prefersReducedMotion()) {
  console.log('User prefers reduced motion');
}

if (hasKeyboard()) {
  console.log('Keyboard available');
}
```

## API Reference

### FocusManager

```typescript
class FocusManager {
  createTrap(element: HTMLElement, options?: FocusTrapOptions): FocusTrap;
  restoreFocus(previousElement: HTMLElement): void;
  getFocusableElements(container: HTMLElement): HTMLElement[];
}

interface FocusTrapOptions {
  onEscape?: () => void;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  allowOutsideClick?: boolean;
}
```

### KeyboardNavigationManager

```typescript
class KeyboardNavigationManager {
  constructor(container: HTMLElement, options: NavigationOptions);
  initialize(): void;
  destroy(): void;
  focusItem(index: number): void;
  getCurrentIndex(): number;
}

interface NavigationOptions {
  orientation: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onNavigate?: (index: number) => void;
}
```

### Announcer

```typescript
class Announcer {
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  destroy(): void;
}
```

## Usage with Frameworks

### React

Use `@a13y/react` for React-specific hooks:

```typescript
import { useFocusTrap, useAnnounce } from '@a13y/react';
```

### Vue / Svelte / Others

Use the core primitives directly:

```typescript
import { FocusManager, Announcer } from '@a13y/core/runtime';

// In component lifecycle
onMounted(() => {
  const manager = new FocusManager();
  const trap = manager.createTrap(element);
  trap.activate();

  onUnmounted(() => trap.deactivate());
});
```

## Tree Shaking

Import only what you need for optimal bundle size:

```typescript
// ✅ Good - imports only focus utilities
import { FocusManager } from '@a13y/core/runtime/focus';

// ❌ Avoid - imports everything
import { FocusManager } from '@a13y/core';
```

## Development Warnings

Install `@a13y/devtools` to get helpful warnings during development:

```bash
npm install -D @a13y/devtools
```

Warnings are automatically stripped in production builds.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Author

Created and maintained by **Diego Aneli** ([@DiegoAneli](https://github.com/DiegoAneli))

## License

MIT © Diego Aneli and contributors
