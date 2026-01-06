# @a13y/react - Usage Examples

Type-safe React hooks for accessibility with compile-time guarantees.

---

## Example 1: Accessible Button

### Icon Button (requires label)

```tsx
import { useAccessibleButton } from '@a13y/react';

const DeleteButton = () => {
  const { buttonProps } = useAccessibleButton({
    label: 'Delete item', // ✅ Required for icon-only buttons
    onPress: () => console.log('Deleted!'),
  });

  return <button {...buttonProps}>🗑️</button>;
};
```

### Text Button (label optional)

```tsx
const SaveButton = () => {
  const { buttonProps } = useAccessibleButton({
    onPress: () => console.log('Saved!'),
  });

  return <button {...buttonProps}>Save</button>;
};
```

### Disabled Button

```tsx
const SubmitButton = ({ canSubmit }: { canSubmit: boolean }) => {
  const { buttonProps } = useAccessibleButton({
    label: 'Submit form',
    onPress: () => console.log('Submitted!'),
    isDisabled: !canSubmit,
  });

  return <button {...buttonProps}>Submit</button>;
};
```

### ❌ Compile-time Error: Forbidden Props

```tsx
const { buttonProps } = useAccessibleButton({
  onPress: () => {},
});

// ❌ TypeScript Error: onClick is forbidden
return <button {...buttonProps} onClick={() => {}} />;
//                                ^^^^^^^ Type error

// The hook manages onClick internally via onPress
```

---

## Example 2: Accessible Dialog/Modal

### Basic Dialog

```tsx
import { useAccessibleDialog } from '@a13y/react';

const ConfirmDialog = ({ isOpen, onClose }: DialogProps) => {
  const { dialogProps, titleProps, descriptionProps, backdropProps } =
    useAccessibleDialog({
      isOpen,
      onClose,
      title: 'Confirm Delete', // ✅ Required
      description: 'This action cannot be undone',
    });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - auto-generated */}
      {backdropProps && <div className="backdrop" {...backdropProps} />}

      {/* Dialog */}
      <div className="dialog" {...dialogProps}>
        <h2 {...titleProps}>Confirm Delete</h2>
        {descriptionProps && (
          <p {...descriptionProps}>This action cannot be undone</p>
        )}

        <button onClick={onClose}>Cancel</button>
        <button onClick={handleConfirm}>Delete</button>
      </div>
    </>
  );
};
```

### Alert Dialog

```tsx
const ErrorDialog = ({ error, onClose }: ErrorDialogProps) => {
  const { dialogProps, titleProps, descriptionProps } = useAccessibleDialog({
    isOpen: !!error,
    onClose,
    title: 'Error',
    description: error?.message,
    role: 'alertdialog', // ✅ More urgent than 'dialog'
  });

  return (
    <div {...dialogProps}>
      <h2 {...titleProps}>Error</h2>
      {descriptionProps && <p {...descriptionProps}>{error.message}</p>}
      <button onClick={onClose}>OK</button>
    </div>
  );
};
```

### ❌ Compile-time Error: Title Required

```tsx
// ❌ TypeScript Error: title is required
const { dialogProps } = useAccessibleDialog({
  isOpen: true,
  onClose: () => {},
  // title: missing!
});
```

### ❌ Runtime Error in Development

```tsx
// ⚠️ Development-time error
useAccessibleDialog({
  isOpen: true,
  onClose: () => {},
  title: '', // ❌ Empty title throws in __DEV__
});

// Console Error:
// @a13y/react [useAccessibleDialog]: "title" prop is required for accessibility
```

---

## Example 3: Focus Trap

### Modal with Focus Trap

```tsx
import { useFocusTrap } from '@a13y/react';

const Modal = ({ isOpen, onClose }: ModalProps) => {
  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    onEscape: onClose, // ✅ Escape closes modal
    restoreFocus: true, // ✅ Restores focus on close
  });

  if (!isOpen) return null;

  return (
    <div ref={trapRef} className="modal">
      <h2>Modal Title</h2>
      <input type="text" placeholder="Trapped inside modal" />
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

### Sidebar with Custom Focus

```tsx
const Sidebar = ({ isOpen }: SidebarProps) => {
  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    autoFocus: false, // ✅ Don't auto-focus
    restoreFocus: false, // ✅ Don't restore (stays in main content)
  });

  return (
    <aside ref={trapRef} className="sidebar">
      <nav>
        <a href="/home">Home</a>
        <a href="/profile">Profile</a>
      </nav>
    </aside>
  );
};
```

---

## Example 4: Keyboard Navigation

### Horizontal Toolbar

```tsx
import { useKeyboardNavigation } from '@a13y/react';

const Toolbar = () => {
  const { containerProps, getItemProps, currentIndex } =
    useKeyboardNavigation({
      orientation: 'horizontal', // ✅ Arrow Left/Right
      loop: true, // ✅ Wrap around at edges
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
};
```

### Vertical Menu

```tsx
const Menu = () => {
  const { containerProps, getItemProps } = useKeyboardNavigation({
    orientation: 'vertical', // ✅ Arrow Up/Down
    loop: false, // ✅ Stop at boundaries
    onNavigate: (index) => console.log('Navigated to:', index),
  });

  const items = ['New', 'Open', 'Save', 'Exit'];

  return (
    <div role="menu" {...containerProps}>
      {items.map((item, index) => (
        <button key={item} role="menuitem" {...getItemProps(index)}>
          {item}
        </button>
      ))}
    </div>
  );
};
```

### Grid Navigation (Both Directions)

```tsx
const Grid = () => {
  const { containerProps, getItemProps, currentIndex, setCurrentIndex } =
    useKeyboardNavigation({
      orientation: 'both', // ✅ All arrow keys
      defaultIndex: 0,
    });

  return (
    <div className="grid" {...containerProps}>
      {[...Array(9)].map((_, index) => (
        <div
          key={index}
          {...getItemProps(index)}
          onClick={() => setCurrentIndex(index)}
        >
          Item {index + 1}
        </div>
      ))}
    </div>
  );
};
```

### Controlled Navigation

```tsx
const ControlledToolbar = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const { containerProps, getItemProps } = useKeyboardNavigation({
    orientation: 'horizontal',
    currentIndex: activeIndex, // ✅ Controlled
    onNavigate: setActiveIndex,
  });

  return (
    <div {...containerProps}>
      {/* Items */}
    </div>
  );
};
```

---

## Example 5: Combining Hooks

### Complete Dialog with Button

```tsx
const ConfirmationDialog = ({ isOpen, onConfirm, onCancel }: Props) => {
  const { dialogProps, titleProps, descriptionProps } = useAccessibleDialog({
    isOpen,
    onClose: onCancel,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
  });

  const { buttonProps: confirmProps } = useAccessibleButton({
    label: 'Confirm',
    onPress: () => onConfirm(),
  });

  const { buttonProps: cancelProps } = useAccessibleButton({
    label: 'Cancel',
    onPress: () => onCancel(),
  });

  if (!isOpen) return null;

  return (
    <div {...dialogProps}>
      <h2 {...titleProps}>Confirm Action</h2>
      <p {...descriptionProps}>Are you sure you want to proceed?</p>

      <div className="actions">
        <button {...cancelProps}>Cancel</button>
        <button {...confirmProps}>Confirm</button>
      </div>
    </div>
  );
};
```

### Accessible Dropdown Menu

```tsx
const DropdownMenu = ({ trigger, items }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { buttonProps } = useAccessibleButton({
    label: 'Open menu',
    onPress: () => setIsOpen(!isOpen),
  });

  const { trapRef } = useFocusTrap({
    isActive: isOpen,
    onEscape: () => setIsOpen(false),
  });

  const { containerProps, getItemProps } = useKeyboardNavigation({
    orientation: 'vertical',
    loop: true,
  });

  return (
    <div className="dropdown">
      <button {...buttonProps}>{trigger}</button>

      {isOpen && (
        <div ref={trapRef} className="menu" {...containerProps}>
          {items.map((item, index) => (
            <button
              key={item.id}
              {...getItemProps(index)}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Type Safety Features

### Forbidden Props Prevent Errors

```tsx
// ❌ TypeScript prevents misuse
const { buttonProps } = useAccessibleButton({ onPress: () => {} });

<button
  {...buttonProps}
  onClick={() => {}} // ❌ Type error: 'onClick' does not exist
  onKeyDown={() => {}} // ❌ Type error: 'onKeyDown' does not exist
/>

// ✅ Use onPress instead
const { buttonProps } = useAccessibleButton({
  onPress: (event) => {
    console.log(event.type); // 'mouse' | 'keyboard'
    console.log(event.key);  // 'Enter' | ' ' | undefined
  }
});
```

### Required Props Enforced

```tsx
// ❌ TypeScript error: missing required props
useAccessibleDialog({
  isOpen: true,
  // onClose: missing!
  // title: missing!
});

// ✅ All required props provided
useAccessibleDialog({
  isOpen: true,
  onClose: () => {},
  title: 'My Dialog',
});
```

---

## Development Warnings

All hooks integrate with @a13y/devtools for runtime validation:

```tsx
// ⚠️ Development console warnings for accessibility issues:

// Missing accessible name
<button {...buttonProps}></button>
// Warning: Element is missing an accessible name

// Focus trap without focusable elements
<div ref={trapRef}></div>
// Warning: Focus trap container has no focusable elements

// Invalid roving tabindex
<div {...containerProps}>
  <button tabIndex={0}>A</button>
  <button tabIndex={0}>B</button> {/* ❌ Should be -1 */}
</div>
// Warning: Invalid roving tabindex implementation
```

---

## Production Build

Zero overhead in production:

```tsx
// Development build
useAccessibleButton({ onPress: () => {} });
// ✅ Runs validation via @a13y/devtools

// Production build
useAccessibleButton({ onPress: () => {} });
// ✅ All validation code removed (dead code elimination)
```
