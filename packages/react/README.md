# @a13y/react

**Type-safe React hooks for accessibility with compile-time guarantees**

---


## Features

- **Type-Safe**: Restrictive TypeScript signatures prevent misuse
- **Props Enforcement**: Required props enforced at compile-time
- **Automatic ARIA**: Correct ARIA attributes applied automatically
- **Keyboard Support**: Enter, Space, Arrow keys handled correctly
- **Focus Management**: Focus trap, restoration, roving tabindex
- **Dev Validation**: Runtime warnings in development (via @a13y/devtools)
- **Zero Overhead**: All dev code stripped in production

## Installation

```bash
npm install @a13y/react @a13y/core
```

Optional devtools for development warnings:

```bash
npm install -D @a13y/devtools
```

## Hooks

### useAccessibleButton

Creates accessible buttons with keyboard support.

```tsx
import { useAccessibleButton } from '@a13y/react';

function DeleteButton() {
  const { buttonProps } = useAccessibleButton({
    label: 'Delete item', // Required for icon-only buttons
    onPress: (event) => {
      console.log(event.type); // 'mouse' | 'keyboard'
      console.log(event.key); // 'Enter' | ' ' | undefined
    },
  });

  return <button {...buttonProps}>🗑️</button>;
}
```

**Props:**
- `label?: string` - Accessible label (required for icon-only buttons)
- `onPress: (event: PressEvent) => void` - Called on click or Enter/Space
- `isDisabled?: boolean` - Whether button is disabled
- `role?: 'button' | 'link'` - ARIA role (default: 'button')
- `elementType?: 'button' | 'a'` - HTML element type (default: 'button')

### useAccessibleDialog

Creates accessible modals/dialogs with focus trap.

```tsx
import { useAccessibleDialog } from '@a13y/react';

function ConfirmDialog({ isOpen, onClose }) {
  const { dialogProps, titleProps, descriptionProps, backdropProps } =
    useAccessibleDialog({
      isOpen,
      onClose,
      title: 'Confirm Action', // ✅ Required
      description: 'This action cannot be undone',
    });

  if (!isOpen) return null;

  return (
    <>
      {backdropProps && <div className="backdrop" {...backdropProps} />}
      <div className="dialog" {...dialogProps}>
        <h2 {...titleProps}>Confirm Action</h2>
        <p {...descriptionProps}>This action cannot be undone</p>
        <button onClick={onClose}>Cancel</button>
      </div>
    </>
  );
}
```

**Props:**
- `isOpen: boolean` - Whether dialog is open
- `onClose: () => void` - Called when dialog should close
- `title: string` - Dialog title (REQUIRED for accessibility)
- `description?: string` - Dialog description
- `role?: 'dialog' | 'alertdialog'` - ARIA role (default: 'dialog')
- `isModal?: boolean` - Whether dialog is modal/blocking (default: true)
- `closeOnBackdropClick?: boolean` - Close on backdrop click (default: true)

### useFocusTrap

Creates a focus trap for modals and popups.

```tsx
import { useFocusTrap } from '@a13y/react';

function Modal({ isOpen, onClose }) {
  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    onEscape: onClose,
    restoreFocus: true, // Restore focus on close
    autoFocus: true, // Auto-focus first element
  });

  if (!isOpen) return null;

  return (
    <div ref={trapRef} className="modal">
      <h2>Modal Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

**Props:**
- `isActive: boolean` - Whether focus trap is active
- `onEscape?: () => void` - Called when Escape key is pressed
- `restoreFocus?: boolean` - Restore focus on deactivation (default: true)
- `autoFocus?: boolean` - Auto-focus first element (default: true)

### useKeyboardNavigation

Implements roving tabindex keyboard navigation.

```tsx
import { useKeyboardNavigation } from '@a13y/react';

function Toolbar() {
  const { containerProps, getItemProps, currentIndex } =
    useKeyboardNavigation({
      orientation: 'horizontal', // Arrow Left/Right
      loop: true, // Wrap around at edges
    });

  const tools = ['Cut', 'Copy', 'Paste', 'Undo', 'Redo'];

  return (
    <div className="toolbar" {...containerProps}>
      {tools.map((tool, index) => (
        <button
          key={tool}
          {...getItemProps(index)}
          className={index === currentIndex ? 'focused' : ''}
        >
          {tool}
        </button>
      ))}
    </div>
  );
}
```

**Props:**
- `orientation: 'horizontal' | 'vertical' | 'both'` - Navigation direction
- `loop?: boolean` - Whether to loop at boundaries (default: false)
- `onNavigate?: (index: number) => void` - Called when navigation occurs
- `defaultIndex?: number` - Initial focused index (default: 0)
- `currentIndex?: number` - Controlled current index

## Type Safety

### Forbidden Props

The hooks prevent misuse by forbidding certain props:

```tsx
const { buttonProps } = useAccessibleButton({ onPress: () => {} });

// ❌ TypeScript Error: These props are managed by the hook
<button {...buttonProps} onClick={() => {}} />
<button {...buttonProps} onKeyDown={() => {}} />
```

### Required Props

Required props are enforced at compile-time:

```tsx
// ❌ TypeScript Error: 'title' is required
useAccessibleDialog({
  isOpen: true,
  onClose: () => {},
  // title: missing!
});
```

## Development Warnings

When `@a13y/devtools` is installed, you get runtime warnings in development:

```tsx
// ⚠️ Console warning: Element is missing an accessible name
<button {...buttonProps}></button>

// ⚠️ Console warning: Focus trap has no focusable elements
<div ref={trapRef}></div>
```

All warnings include:
- Clear description of the issue
- WCAG 2.2 criterion reference
- Multiple fix suggestions with code examples

## Production Build

Zero overhead in production:

```tsx
// Development build
useAccessibleButton({ onPress: () => {} });
// ✅ Includes validation code from @a13y/devtools

// Production build (NODE_ENV=production)
useAccessibleButton({ onPress: () => {} });
// ✅ All validation code removed via dead code elimination
```

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for complete usage examples.

## Author

Created and maintained by **Diego Aneli** ([@DiegoAneli](https://github.com/DiegoAneli))

## License

MIT © Diego Aneli and contributors
