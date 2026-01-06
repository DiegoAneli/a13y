# @a13y/react - Advanced Patterns

Advanced reusable accessibility patterns built on `@a13y/core` utilities.

## Available Patterns

### 1. DialogStack

Manages nested modals with proper focus restoration and z-index layering.

**Key Features:**
- Each dialog gets unique z-index: base + (depth × increment)
- Focus trapped in topmost dialog
- When dialog closes, focus returns to previous dialog
- Escape key only affects topmost dialog
- Body scroll lock when dialogs are open

**Usage:**
```tsx
import { DialogStackProvider, useDialogStack } from '@a13y/react/patterns';

// Wrap your app
<DialogStackProvider>
  <App />
</DialogStackProvider>

// Use in components
const { push, close } = useDialogStack();

push({
  id: 'confirm',
  title: 'Confirm Action',
  content: <ConfirmDialog />,
  onClose: () => console.log('Dialog closed'),
});
```

### 2. NestedMenu

Multi-level dropdown menu with full keyboard navigation.

**Keyboard Support:**
- Arrow Up/Down: Navigate items
- Arrow Right: Open submenu
- Arrow Left: Close submenu and return to parent
- Enter/Space: Select item or open submenu
- Escape: Close current menu level

**Usage:**
```tsx
import { NestedMenu } from '@a13y/react/patterns';

<NestedMenu
  label="File menu"
  trigger="File ▼"
  items={[
    {
      id: 'new',
      label: 'New',
      submenu: [
        { id: 'file', label: 'File', onPress: () => console.log('New File') },
        { id: 'folder', label: 'Folder', onPress: () => console.log('New Folder') },
      ],
    },
    { id: 'open', label: 'Open', onPress: () => console.log('Open') },
  ]}
/>
```

### 3. Wizard

Multi-step form with validation and keyboard navigation.

**Key Features:**
- Progress indicator shows current position
- Step validation before proceeding
- Screen reader announcements for step changes
- Optional steps can be skipped
- Keyboard navigation support
- Validation errors announced to screen readers

**Usage:**
```tsx
import { Wizard } from '@a13y/react/patterns';

<Wizard
  steps={[
    {
      id: 'account',
      label: 'Account Info',
      content: <AccountForm />,
      validate: () => isValidEmail(email) || 'Invalid email',
    },
    {
      id: 'preferences',
      label: 'Preferences',
      content: <PreferencesForm />,
      optional: true,
    },
    {
      id: 'review',
      label: 'Review',
      content: <ReviewScreen />,
    },
  ]}
  onComplete={() => console.log('Wizard completed!')}
/>
```

### 4. InfiniteList

Accessible infinite scroll with lazy loading.

**Key Features:**
- Intersection Observer for lazy loading
- Screen reader announcements for new items
- Maintains focus position when items added
- Works with keyboard navigation (Tab through items)
- Loading states announced
- Total count announcements

**Usage:**
```tsx
import { InfiniteList } from '@a13y/react/patterns';

const [items, setItems] = useState<Item[]>([]);
const [hasMore, setHasMore] = useState(true);
const [isLoading, setIsLoading] = useState(false);

const loadMore = async () => {
  setIsLoading(true);
  const newItems = await fetchItems(items.length, 20);
  setItems([...items, ...newItems]);
  setHasMore(newItems.length === 20);
  setIsLoading(false);
  return newItems;
};

<InfiniteList
  items={items}
  loadMore={loadMore}
  hasMore={hasMore}
  isLoading={isLoading}
  renderItem={(item) => <ItemCard item={item} />}
  getItemKey={(item) => item.id}
  aria-label="Products list"
/>
```

### 5. VirtualizedList

Accessible virtualized list with screen reader support.

**Key Features:**
- Only renders visible items + overscan buffer
- `aria-setsize` and `aria-posinset` tell screen readers total count
- Announces visible range when user scrolls
- Keyboard navigation (Page Up/Down, Home/End)
- Maintains total height for accurate scrollbar
- Focus management when items are virtualized

**Usage:**
```tsx
import { VirtualizedList } from '@a13y/react/patterns';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
}));

<VirtualizedList
  items={items}
  itemHeight={48}
  height={600}
  renderItem={(item) => (
    <div style={{ padding: '0.75rem' }}>
      {item.name}
    </div>
  )}
  getItemKey={(item) => item.id.toString()}
  aria-label="Large list of items"
  overscan={5}
/>
```

## Pattern Architecture

All patterns are built on:
- **@a13y/core utilities**: `announce()`, `trapFocus()`, `lockBodyScroll()`
- **React hooks**: `useAccessibleDialog`, `useKeyboardNavigation`, `useFocusTrap`
- **Consistent APIs**: Similar prop patterns across all components
- **Screen reader support**: ARIA attributes, live announcements, semantic HTML
- **Complete keyboard handling**: All interactions keyboard-accessible

## Import Patterns

```tsx
// Import all patterns
import * from '@a13y/react/patterns';

// Import specific patterns
import { DialogStackProvider, useDialogStack } from '@a13y/react/patterns';
import { NestedMenu } from '@a13y/react/patterns';
import { Wizard, useWizard } from '@a13y/react/patterns';
import { InfiniteList } from '@a13y/react/patterns';
import { VirtualizedList } from '@a13y/react/patterns';

// Import types
import type {
  DialogStackProviderProps,
  NestedMenuItem,
  NestedMenuProps,
  WizardProps,
  WizardStep,
  InfiniteListProps,
  VirtualizedListProps,
} from '@a13y/react/patterns';
```

## Development Notes

- All patterns follow WAI-ARIA authoring practices
- Screen reader announcements use `announce()` from `@a13y/core`
- Focus management uses `trapFocus()` and `restoreFocus()` from `@a13y/core`
- Keyboard navigation follows standard patterns (arrows, Enter, Escape)
- Zero production overhead - development validations only run in dev mode

## TypeScript

All patterns are fully typed with:
- Strict mode enabled
- Generic support for list items (`InfiniteList<T>`, `VirtualizedList<T>`)
- Required accessibility props (labels, titles)
- Type-safe keyboard event handling
- Proper ref forwarding types
