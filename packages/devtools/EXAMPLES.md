# @a13y/devtools - Usage Examples

## Installation & Setup

```typescript
import { initDevtools } from '@a13y/devtools';

// Initialize in development mode
if (process.env.NODE_ENV === 'development') {
  initDevtools({
    minSeverity: 'warn', // Show warnings and errors
    showElement: true,   // Show element in console
    deduplicate: true,   // Deduplicate same warnings
  });
}
```

---

## Example 1: Missing Accessible Name

### Bad Code

```tsx
// ❌ Button without accessible name
<button onClick={handleClick}>
  <Icon name="trash" />
</button>
```

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ERROR  A13Y200 accessible-name

Element is missing an accessible name

Element:
<button>...</button>

WCAG: 4.1.2 (Level A)
Learn more: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html

How to fix:
1. Add an aria-label attribute
   Example:
   <button aria-label="Descriptive name">

2. Add text content
   Example:
   <button>Click me</button>

3. Use aria-labelledby to reference another element
   Example:
   <button aria-labelledby="label-id">
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Good Code

```tsx
// ✅ Option 1: aria-label
<button aria-label="Delete item" onClick={handleClick}>
  <Icon name="trash" />
</button>

// ✅ Option 2: Text content
<button onClick={handleClick}>
  <Icon name="trash" />
  <span>Delete</span>
</button>

// ✅ Option 3: aria-labelledby
<span id="delete-label">Delete item</span>
<button aria-labelledby="delete-label" onClick={handleClick}>
  <Icon name="trash" />
</button>
```

---

## Example 2: Div as Button (Not Keyboard Accessible)

### Bad Code

```tsx
// ❌ Div with onClick but no keyboard access
<div className="button" onClick={handleClick}>
  Click me
</div>
```

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ERROR  A13Y100 keyboard-navigation

Interactive element is not keyboard accessible

Element:
<div class="button">...</div>

WCAG: 2.1.1 (Level A)
Learn more: https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html

How to fix:
1. Use a semantic button element
   Example:
   <button onClick={handleClick}>Click me</button>

2. Add tabindex="0" and keyboard handlers
   Example:
   <div
     tabindex="0"
     onClick={handleClick}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         handleClick();
       }
     }}
   >
     Click me
   </div>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Good Code

```tsx
// ✅ Use semantic button
<button onClick={handleClick}>
  Click me
</button>
```

---

## Example 3: Focus Lost After Modal Close

### Bad Code

```tsx
// ❌ Focus not restored after modal close
const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div role="dialog">
      <h2>Dialog Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WARN  A13Y005 focus-management

Focus was not restored after closing dialog

WCAG: 2.4.3 (Level A)
Learn more: https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html

How to fix:
1. Restore focus to the expected element
   Example:
   // Save focus before action
   const returnElement = document.activeElement;

   // Perform action
   performAction();

   // Restore focus
   returnElement?.focus();

2. Use FocusManager.saveFocus()
   Example:
   import { FocusManager } from '@a13y/core/runtime/focus';

   const restore = FocusManager.saveFocus();
   performAction();
   restore();
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Good Code

```tsx
// ✅ Focus restored using FocusManager
import { FocusManager } from '@a13y/core/runtime/focus';

const Modal = ({ isOpen, onClose }) => {
  const restoreFocusRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save focus when opening
      restoreFocusRef.current = FocusManager.saveFocus();
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    // Restore focus when closing
    restoreFocusRef.current?.();
  };

  if (!isOpen) return null;

  return (
    <div role="dialog">
      <h2>Dialog Title</h2>
      <button onClick={handleClose}>Close</button>
    </div>
  );
};
```

---

## Example 4: Invalid ARIA Attributes

### Bad Code

```tsx
// ❌ Invalid aria-checked value
<div role="checkbox" aria-checked="yes" onClick={toggle}>
  Accept terms
</div>
```

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WARN  A13Y305 aria-usage

ARIA attribute "aria-checked" must be "true" or "false", got "yes"

Element:
<div role="checkbox">...</div>

WCAG: 4.1.2 (Level A)
Learn more: https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html

How to fix:
1. Use "true" or "false"
   Example:
   <element aria-checked="true">
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Good Code

```tsx
// ✅ Valid boolean value
<div
  role="checkbox"
  aria-checked={isChecked ? "true" : "false"}
  onClick={toggle}
  onKeyDown={handleKeyDown}
  tabIndex={0}
>
  Accept terms
</div>
```

---

## Example 5: Positive Tabindex (Antipattern)

### Bad Code

```tsx
// ❌ Positive tabindex creates confusing tab order
<div tabIndex={2}>Second</div>
<div tabIndex={1}>First</div>
<div tabIndex={3}>Third</div>
```

### Console Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WARN  A13Y102 keyboard-navigation

Positive tabindex (2) creates confusing tab order

Element:
<div tabindex="2">...</div>

WCAG: 2.4.3 (Level A)
Learn more: https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html

How to fix:
1. Use tabindex="0" to add element to natural tab order
   Example:
   <div tabindex="0">Focusable in natural order</div>

2. Use tabindex="-1" to remove from tab order (programmatic focus only)
   Example:
   <div tabindex="-1">Not in tab order</div>

3. Restructure DOM to achieve desired focus order
   Learn more: https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Good Code

```tsx
// ✅ Restructure DOM, use natural tab order
<div tabIndex={0}>First</div>
<div tabIndex={0}>Second</div>
<div tabIndex={0}>Third</div>
```

---

## Example 6: Using Invariants in Code

### Usage

```tsx
import {
  assertHasAccessibleName,
  assertKeyboardAccessible,
  assertValidAriaAttributes
} from '@a13y/devtools/runtime/invariants';

const CustomButton = ({ children, onClick }) => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      // These checks only run in development
      assertHasAccessibleName(buttonRef.current, 'CustomButton');
      assertKeyboardAccessible(buttonRef.current, 'CustomButton');
      assertValidAriaAttributes(buttonRef.current);
    }
  }, []);

  return (
    <div
      ref={buttonRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};
```

---

## Example 7: Using Validators Programmatically

### Focus Validation

```tsx
import { focusValidator } from '@a13y/devtools/runtime/validators';

// Start monitoring focus
focusValidator.start();

// Validate focus visible
const element = document.getElementById('my-button');
if (element) {
  focusValidator.validateFocusVisible(element);
}

// Validate focus trap
const modal = document.getElementById('modal');
if (modal) {
  focusValidator.validateFocusTrap(modal, true);
}

// Track focus restoration
const trigger = document.getElementById('trigger');
if (trigger) {
  focusValidator.expectFocusRestoration(trigger, 'modal close');
}
```

### Keyboard Validation

```tsx
import { keyboardValidator } from '@a13y/devtools/runtime/validators';

// Validate interactive element
const button = document.getElementById('custom-button');
if (button) {
  keyboardValidator.validateInteractiveElement(button);
}

// Validate container for keyboard accessibility
const toolbar = document.getElementById('toolbar');
if (toolbar) {
  keyboardValidator.validateContainer(toolbar);
}

// Validate roving tabindex
keyboardValidator.validateRovingTabindex(toolbar);
```

### ARIA Validation

```tsx
import { ariaValidator } from '@a13y/devtools/runtime/validators';

// Validate element ARIA
const element = document.getElementById('custom-widget');
if (element) {
  ariaValidator.validateElement(element);
  ariaValidator.validateAccessibleName(element, 'CustomWidget');
}
```

---

## Example 8: Custom Warning Handler

```tsx
import { initDevtools } from '@a13y/devtools';

// Track warnings for analytics
const warningCounts = new Map<string, number>();

initDevtools({
  minSeverity: 'info',
  onWarning: (warning) => {
    // Count warnings by code
    const count = warningCounts.get(warning.code) || 0;
    warningCounts.set(warning.code, count + 1);

    // Send to analytics (only in dev)
    console.log('Accessibility warning:', {
      code: warning.code,
      severity: warning.severity,
      category: warning.category,
      element: warning.element?.tagName,
    });
  },
});

// Later: report warning stats
console.table(
  Array.from(warningCounts.entries()).map(([code, count]) => ({
    code,
    count,
  }))
);
```

---

## Production Build

In production, all devtools code is automatically stripped:

```typescript
// Development build
if (__DEV__) {
  assertHasAccessibleName(element); // ✅ Runs checks
}

// Production build
if (false) {
  assertHasAccessibleName(element); // ❌ Dead code, removed by bundler
}
```

**Result:** Zero runtime overhead in production! 🎉
