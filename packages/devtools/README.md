# @a13y/devtools

**Development-time validators and runtime checks for @a13y**

Helpful warnings and error messages during development, automatically stripped in production.

[![npm version](https://img.shields.io/npm/v/@a13y/devtools.svg)](https://www.npmjs.com/package/@a13y/devtools)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---


## Features

- **Development-only** - Zero overhead in production (tree-shakeable)
- **WCAG references** - Every warning includes WCAG 2.2 criterion
- **Fix suggestions** - Actionable fixes with code examples
- **Runtime validation** - Catches accessibility issues during development
- **Type-safe** - Full TypeScript support

## Installation

```bash
npm install -D @a13y/devtools
```

## Usage

Devtools are automatically integrated when you use `@a13y/react` or `@a13y/core`. Simply install the package and warnings will appear in development.

### Automatic Integration

```typescript
import { useAccessibleButton } from '@a13y/react';

function Button() {
  const { buttonProps } = useAccessibleButton({ onPress: () => {} });

  // ⚠️ Warning in console if devtools installed:
  // "Element is missing accessible label (WCAG 4.1.2)"
  return <button {...buttonProps}></button>;
}
```

### Manual Validation

You can also use validators directly:

```typescript
import { validateFocus, validateAria } from '@a13y/devtools/runtime/validators';

const button = document.querySelector('button');

// Validate focus management
validateFocus(button, {
  hasFocusableElements: true,
  isVisible: true,
});

// Validate ARIA attributes
validateAria(button, {
  role: 'button',
  requiredAttrs: ['aria-label'],
});
```

## Validators

### Focus Validator

```typescript
import { validateFocus } from '@a13y/devtools/runtime/validators';

validateFocus(element, {
  hasFocusableElements: true,
  isVisible: true,
  isInert: false,
});
```

Checks:
- Element has focusable children
- Focus trap contains interactive elements
- Elements are visible
- No inert ancestors

### ARIA Validator

```typescript
import { validateAria } from '@a13y/devtools/runtime/validators';

validateAria(element, {
  role: 'dialog',
  requiredAttrs: ['aria-labelledby', 'aria-describedby'],
  allowedRoles: ['dialog', 'alertdialog'],
});
```

Checks:
- Valid ARIA roles
- Required ARIA attributes present
- Attribute values are valid
- No conflicting attributes

### Keyboard Validator

```typescript
import { validateKeyboard } from '@a13y/devtools/runtime/validators';

validateKeyboard(element, {
  supportsKeys: ['Enter', ' ', 'Escape'],
  hasKeyboardHandler: true,
});
```

Checks:
- Keyboard event handlers present
- Required keys supported
- Focus visible on keyboard navigation

## Warning System

### Warning Levels

```typescript
import { warn, error } from '@a13y/devtools/runtime/warnings';

// Polite warning (logged to console)
warn('accessibility-issue', {
  message: 'Missing accessible label',
  wcagCriterion: '4.1.2',
  fixes: [
    'Add aria-label attribute',
    'Add aria-labelledby reference',
    'Add visible text content',
  ],
});

// Error (thrown in dev, silent in prod)
error('critical-accessibility-issue', {
  message: 'Dialog missing required title',
  wcagCriterion: '2.4.6',
});
```

### Warning Categories

- `focus` - Focus management issues
- `keyboard` - Keyboard navigation problems
- `aria` - ARIA attribute errors
- `structure` - DOM structure issues
- `semantics` - Semantic HTML problems

## Invariants

Runtime checks that throw errors in development:

```typescript
import { invariant } from '@a13y/devtools/runtime/invariants';

invariant(
  element.hasAttribute('aria-label'),
  'Button must have accessible label',
  'WCAG 4.1.2'
);
```

## Production Builds

All devtools code is automatically removed in production:

```typescript
// Development build
if (process.env.NODE_ENV !== 'production') {
  validateFocus(element);
}

// Production build - entire block removed by bundler
// No runtime overhead!
```

## Configuration

Configure warning behavior:

```typescript
import { configureWarnings } from '@a13y/devtools';

configureWarnings({
  // Disable specific warnings
  ignore: ['focus-trap-no-elements'],

  // Throw errors instead of warnings
  strict: true,

  // Custom warning handler
  onWarn: (warning) => {
    console.log(`[A13Y] ${warning.message}`);
    // Send to error tracking service
  },
});
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type {
  WarningType,
  ValidationOptions,
  WCAGCriterion,
} from '@a13y/devtools';
```

## Example Warnings

### Missing Label

```
⚠️ A13Y Warning: Missing accessible label
Element: <button>Save</button>
WCAG: 4.1.2 Name, Role, Value

Suggested fixes:
1. Add aria-label: <button aria-label="Save document">
2. Add aria-labelledby: <button aria-labelledby="save-label">
3. Ensure visible text is descriptive
```

### Invalid ARIA

```
⚠️ A13Y Warning: Invalid ARIA attribute value
Element: <div role="dialog" aria-expanded="yes">
WCAG: 4.1.2 Name, Role, Value

Issue: aria-expanded must be "true" or "false", not "yes"

Fix: <div role="dialog" aria-expanded="true">
```

### Focus Trap

```
⚠️ A13Y Warning: Focus trap has no focusable elements
Element: <div role="dialog">...</div>
WCAG: 2.1.1 Keyboard

Issue: Focus trap activated but contains no focusable elements

Suggested fixes:
1. Add focusable elements (button, input, a, etc.)
2. Add tabindex="0" to make element focusable
3. Check if elements are hidden or disabled
```

## Tree Shaking

Import validators individually for optimal bundle size:

```typescript
// ✅ Good - imports only focus validator
import { validateFocus } from '@a13y/devtools/runtime/validators';

// ❌ Avoid - imports all validators
import { validateFocus } from '@a13y/devtools';
```

## Author

Created and maintained by **Diego Aneli** ([@DiegoAneli](https://github.com/DiegoAneli))

## License

MIT © Diego Aneli and contributors
