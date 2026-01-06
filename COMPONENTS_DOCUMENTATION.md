# @a13y Components Documentation

Complete documentation for all accessible components and hooks in the @a13y library.

## Table of Contents

### Hooks
- [useId](#useid)
- [useReducedMotion](#usereducedmotion)
- [useClickOutside](#useclickoutside)
- [useMediaQuery](#usemediaquery)
- [useAriaLive](#usearialive)
- [useAnnounce](#useannounce)

### Components - Priority High
- [AccessibleTooltip](#accessibletooltip)
- [AccessibleToggle](#accessibletoggle)
- [AccessibleToast](#accessibletoast)
- [AccessibleAccordion](#accessibleaccordion)

### Components - Priority Medium
- [AccessibleBreadcrumb](#accessiblebreadcrumb)
- [AccessibleCheckboxGroup](#accessiblecheckboxgroup)
- [AccessibleRadioGroup](#accessibleradiogroup)
- [AccessibleProgress](#accessibleprogress)
- [SkipLinks](#skiplinks)
- [AccessiblePagination](#accessiblepagination)
- [AccessibleCombobox](#accessiblecombobox)

### Components - Advanced
- [AccessibleDatePicker](#accessibledatepicker)
- [AccessibleTreeView](#accessibletreeview)
- [AccessibleTable](#accessibletable)
- [AccessibleCarousel](#accessiblecarousel)
- [AccessibleDrawer](#accessibledrawer)

---

## Hooks

### useId

Generates unique IDs for accessibility attributes. Provides backward compatibility for React < 18.

```tsx
import { useId } from '@a13y/react';

function MyComponent() {
  const tooltipId = useId('tooltip');
  // Returns: "tooltip-1"

  return (
    <div>
      <button aria-describedby={tooltipId}>Hover me</button>
      <div id={tooltipId} role="tooltip">Helpful info</div>
    </div>
  );
}
```

### useReducedMotion

Detects if the user prefers reduced motion.

```tsx
import { useReducedMotion } from '@a13y/react';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div style={{
      transition: prefersReducedMotion ? 'none' : 'all 0.3s ease'
    }}>
      Content
    </div>
  );
}
```

### useClickOutside

Detects clicks outside of a referenced element.

```tsx
import { useClickOutside } from '@a13y/react';

function Dropdown() {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useClickOutside(menuRef, () => setIsOpen(false));

  return <div ref={menuRef}>Menu content</div>;
}
```

### useMediaQuery

Tracks the state of a CSS media query.

```tsx
import { useMediaQuery } from '@a13y/react';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### useAriaLive

Manages ARIA live regions for dynamic announcements.

```tsx
import { useAriaLive } from '@a13y/react';

function Cart() {
  const { setMessage, liveRegionProps, message } = useAriaLive('polite');

  const addItem = () => {
    setMessage('Item added to cart');
  };

  return (
    <>
      <button onClick={addItem}>Add to cart</button>
      <div {...liveRegionProps} className="sr-only">
        {message}
      </div>
    </>
  );
}
```

### useAnnounce

Provides a simple way to make screen reader announcements.

```tsx
import { useAnnounce } from '@a13y/react';

function ShoppingCart() {
  const announce = useAnnounce();

  const handleAddToCart = () => {
    addItem(item);
    announce('Item added to cart', 'polite');
  };

  return <button onClick={handleAddToCart}>Add to cart</button>;
}
```

---

## Components

### AccessibleTooltip

A fully accessible tooltip with proper ARIA attributes and keyboard support.

**Features:**
- Proper `aria-describedby` association
- ESC key to close
- Configurable trigger (hover/focus/both)
- Customizable placement

```tsx
import { AccessibleTooltip } from '@a13y/react';

<AccessibleTooltip content="This is helpful information" placement="top">
  <button>Hover me</button>
</AccessibleTooltip>
```

**Props:**
- `content` (string): Content to display
- `placement` ('top' | 'bottom' | 'left' | 'right'): Tooltip position
- `delay` (number): Delay before showing (ms)
- `trigger` ('hover' | 'focus' | 'both'): Trigger method

### AccessibleToggle

Switch on/off accessible component with `role="switch"` and `aria-checked`.

**Features:**
- Proper ARIA switch role
- Keyboard support (Space/Enter)
- Optional description
- Disabled state

```tsx
import { AccessibleToggle } from '@a13y/react';

const [enabled, setEnabled] = useState(false);

<AccessibleToggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable notifications"
  description="Receive email notifications for updates"
/>
```

**Props:**
- `checked` (boolean): Whether toggle is checked
- `onChange` (function): Callback when state changes
- `label` (string): Label text
- `description` (string): Optional description
- `disabled` (boolean): Whether toggle is disabled

### AccessibleToast

Accessible toast notifications with proper ARIA live regions.

**Features:**
- Live region (`role="status"` or `role="alert"`)
- Auto-dismiss with configurable duration
- Action buttons
- Multiple toast positions
- Toast container for managing multiple toasts

```tsx
import { AccessibleToast, ToastContainer } from '@a13y/react';

// Single toast
<AccessibleToast
  message="Item added to cart"
  type="success"
  duration={5000}
  isOpen={showToast}
  onClose={() => setShowToast(false)}
  action={{
    label: 'Undo',
    onClick: () => removeItem()
  }}
/>

// Multiple toasts
<ToastContainer toasts={toasts} onRemove={removeToast} />
```

**Props:**
- `message` (string): Message to display
- `type` ('success' | 'error' | 'warning' | 'info'): Toast type
- `duration` (number): Auto-dismiss duration (0 = no auto-dismiss)
- `position` (ToastPosition): Position on screen
- `action` (ToastAction): Optional action button

### AccessibleAccordion

FAQ and collapsible content with proper ARIA attributes and keyboard navigation.

**Features:**
- `aria-expanded` and `aria-controls`
- Keyboard navigation (Arrow keys, Home, End)
- Single or multiple panels open
- Disabled items

```tsx
import { AccessibleAccordion } from '@a13y/react';

const items = [
  {
    id: '1',
    title: 'What is accessibility?',
    content: 'Accessibility ensures that people with disabilities can use your website.'
  },
  {
    id: '2',
    title: 'Why is it important?',
    content: 'It makes your content available to everyone.'
  }
];

<AccessibleAccordion
  items={items}
  allowMultiple={false}
  defaultOpenItems={['1']}
/>
```

**Props:**
- `items` (AccordionItem[]): Array of accordion items
- `allowMultiple` (boolean): Allow multiple items open
- `defaultOpenItems` (string[]): Initially open item IDs
- `onToggle` (function): Callback when item toggles

### AccessibleBreadcrumb

Accessible breadcrumb navigation with proper ARIA attributes.

**Features:**
- `aria-current="page"` on last item
- Custom separator
- Link or button items

```tsx
import { AccessibleBreadcrumb } from '@a13y/react';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Laptops' }
];

<AccessibleBreadcrumb items={items} separator=">" />
```

**Props:**
- `items` (BreadcrumbItem[]): Array of breadcrumb items
- `separator` (ReactNode): Custom separator
- `ariaLabel` (string): Navigation aria-label

### AccessibleCheckboxGroup

Accessible checkbox group with proper fieldset/legend and ARIA attributes.

**Features:**
- Fieldset with legend
- Individual descriptions
- Validation support
- Disabled options

```tsx
import { AccessibleCheckboxGroup } from '@a13y/react';

const [selected, setSelected] = useState<string[]>(['email']);

const options = [
  { value: 'email', label: 'Email notifications' },
  { value: 'sms', label: 'SMS notifications' },
  { value: 'push', label: 'Push notifications', description: 'Requires app' }
];

<AccessibleCheckboxGroup
  options={options}
  value={selected}
  onChange={setSelected}
  label="Notification preferences"
  required
/>
```

**Props:**
- `options` (CheckboxOption[]): Array of checkbox options
- `value` (string[]): Selected values
- `onChange` (function): Callback when selection changes
- `label` (string): Group label
- `required` (boolean): Whether group is required
- `error` (string): Error message

### AccessibleRadioGroup

Accessible radio button group with keyboard navigation.

**Features:**
- Fieldset with legend
- Arrow key navigation
- Roving tabindex
- Individual descriptions

```tsx
import { AccessibleRadioGroup } from '@a13y/react';

const [selected, setSelected] = useState<string | null>(null);

const options = [
  { value: 'small', label: 'Small', description: 'Up to 10 users' },
  { value: 'medium', label: 'Medium', description: 'Up to 50 users' },
  { value: 'large', label: 'Large', description: 'Unlimited users' }
];

<AccessibleRadioGroup
  name="plan"
  options={options}
  value={selected}
  onChange={setSelected}
  label="Choose your plan"
  required
/>
```

**Props:**
- `options` (RadioOption[]): Array of radio options
- `value` (string | null): Selected value
- `onChange` (function): Callback when selection changes
- `name` (string): Group name
- `label` (string): Group label

### AccessibleProgress

Progress bar and spinner with proper ARIA attributes and live regions.

**Features:**
- `role="progressbar"`
- Determinate and indeterminate states
- Linear and circular variants
- Live region announcements

```tsx
import { AccessibleProgress } from '@a13y/react';

// Determinate progress
<AccessibleProgress
  value={75}
  label="Upload progress"
  showValue
  announceChanges
/>

// Indeterminate progress
<AccessibleProgress
  label="Loading..."
  variant="circular"
/>
```

**Props:**
- `value` (number): Current progress value (undefined = indeterminate)
- `max` (number): Maximum value
- `label` (string): Progress label
- `variant` ('linear' | 'circular'): Visual variant
- `showValue` (boolean): Show percentage text
- `announceChanges` (boolean): Announce progress milestones

### SkipLinks

Skip navigation links for keyboard users, visible only on focus.

**Features:**
- Visible only on keyboard focus
- First focusable element
- Smooth scroll to target
- Multiple skip targets

```tsx
import { SkipLinks } from '@a13y/react';

const links = [
  { href: 'main-content', label: 'Skip to main content' },
  { href: 'navigation', label: 'Skip to navigation' },
  { href: 'footer', label: 'Skip to footer' }
];

<SkipLinks links={links} />

// In your page layout:
<main id="main-content">...</main>
<nav id="navigation">...</nav>
<footer id="footer">...</footer>
```

**Props:**
- `links` (SkipLink[]): Array of skip links
- `linkStyle` (CSSProperties): Custom styles for links

### AccessiblePagination

Accessible pagination with proper ARIA attributes and keyboard navigation.

**Features:**
- `aria-current="page"` on current page
- Ellipsis for large page counts
- First/Last buttons optional
- Disabled states

```tsx
import { AccessiblePagination } from '@a13y/react';

const [page, setPage] = useState(1);

<AccessiblePagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  siblingCount={1}
  showFirstLast
/>
```

**Props:**
- `currentPage` (number): Current page (1-indexed)
- `totalPages` (number): Total page count
- `onPageChange` (function): Callback when page changes
- `siblingCount` (number): Pages to show on each side
- `showFirstLast` (boolean): Show first/last buttons

### AccessibleCombobox

Fully accessible combobox/select with autocomplete and keyboard navigation.

**Features:**
- ARIA Combobox pattern
- Type-ahead search
- Arrow key navigation
- `aria-activedescendant` for screen readers

```tsx
import { AccessibleCombobox } from '@a13y/react';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' }
];

const [country, setCountry] = useState<string | null>(null);

<AccessibleCombobox
  options={countries}
  value={country}
  onChange={setCountry}
  label="Select country"
  searchable
/>
```

**Props:**
- `options` (ComboboxOption[]): Array of options
- `value` (T | null): Selected value
- `onChange` (function): Callback when selection changes
- `label` (string): Combobox label
- `searchable` (boolean): Enable search
- `required` (boolean): Whether field is required
- `error` (string): Error message

### AccessibleDatePicker

Fully accessible date picker with calendar grid and keyboard navigation.

**Features:**
- ARIA grid pattern
- Arrow key navigation (day/week/month)
- Min/max dates
- Disabled dates
- Multiple date formats

```tsx
import { AccessibleDatePicker } from '@a13y/react';

const [date, setDate] = useState<Date | null>(null);

<AccessibleDatePicker
  value={date}
  onChange={setDate}
  label="Select date"
  minDate={new Date()}
  dateFormat="MM/DD/YYYY"
  required
/>
```

**Props:**
- `value` (Date | null): Selected date
- `onChange` (function): Callback when date changes
- `label` (string): Picker label
- `minDate` (Date): Minimum selectable date
- `maxDate` (Date): Maximum selectable date
- `disabledDates` (Date[]): Array of disabled dates
- `dateFormat` ('MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'): Display format

### AccessibleTreeView

Accessible tree navigation with keyboard support and ARIA.

**Features:**
- `role="tree"` and `role="treeitem"`
- Arrow key navigation
- Expand/collapse with keyboard
- Multi-select support

```tsx
import { AccessibleTreeView } from '@a13y/react';

const treeData = [
  {
    id: '1',
    label: 'Documents',
    children: [
      { id: '1-1', label: 'Reports' },
      { id: '1-2', label: 'Invoices' }
    ]
  },
  { id: '2', label: 'Images' }
];

<AccessibleTreeView
  data={treeData}
  onSelect={(node) => console.log(node)}
  multiSelect
/>
```

**Props:**
- `data` (TreeNode[]): Tree data
- `onSelect` (function): Callback when node is selected
- `expandedNodes` (string[]): IDs of expanded nodes
- `onToggle` (function): Callback when node expands/collapses
- `multiSelect` (boolean): Allow multiple selection
- `selectedNodes` (string[]): Selected node IDs

### AccessibleTable

Fully accessible data table with sorting, selection, and keyboard navigation.

**Features:**
- Proper table semantics
- Sortable columns with `aria-sort`
- Row selection
- Empty state
- Custom cell rendering

```tsx
import { AccessibleTable } from '@a13y/react';

interface User {
  id: number;
  name: string;
  email: string;
}

const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true }
];

<AccessibleTable
  data={users}
  columns={columns}
  caption="User list"
  selectable
  sortable
  onSelectionChange={(indices) => console.log(indices)}
/>
```

**Props:**
- `data` (T[]): Table data
- `columns` (TableColumn[]): Column definitions
- `caption` (string): Table caption (required)
- `selectable` (boolean): Enable row selection
- `sortable` (boolean): Enable sorting
- `onSelectionChange` (function): Callback when selection changes
- `onSort` (function): Callback when sort changes

### AccessibleCarousel

Accessible carousel with auto-play and keyboard navigation.

**Features:**
- Auto-play with pause on hover/focus
- Arrow key navigation
- Play/pause button
- Reduced motion support
- Slide indicators

```tsx
import { AccessibleCarousel } from '@a13y/react';

const slides = [
  <div>Slide 1</div>,
  <div>Slide 2</div>,
  <div>Slide 3</div>
];

<AccessibleCarousel
  items={slides}
  autoPlay
  interval={5000}
  controls
  indicators
  loop
/>
```

**Props:**
- `items` (ReactNode[]): Array of carousel items
- `autoPlay` (boolean): Enable auto-play
- `interval` (number): Interval between slides (ms)
- `controls` (boolean): Show navigation controls
- `indicators` (boolean): Show slide indicators
- `loop` (boolean): Loop back to start/end

### AccessibleDrawer

Accessible drawer/sidebar with focus trap and proper ARIA attributes.

**Features:**
- Focus trap when modal
- ESC key to close
- Backdrop click to close
- Multiple sides (left/right/top/bottom)
- Prevents body scroll when open

```tsx
import { AccessibleDrawer } from '@a13y/react';

const [isOpen, setIsOpen] = useState(false);

<AccessibleDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  side="right"
  modal
  title="Settings"
>
  <div>Drawer content here</div>
</AccessibleDrawer>
```

**Props:**
- `isOpen` (boolean): Whether drawer is open
- `onClose` (function): Callback when drawer closes
- `side` ('left' | 'right' | 'top' | 'bottom'): Drawer position
- `modal` (boolean): Modal behavior (blocks background)
- `title` (string): Drawer title
- `children` (ReactNode): Drawer content

---

## Best Practices

### General Guidelines

1. **Always provide labels**: Every interactive component needs a label
2. **Use semantic HTML**: Components use proper ARIA roles and attributes
3. **Test with keyboard**: All components are fully keyboard accessible
4. **Test with screen readers**: Components announce properly to assistive technology
5. **Respect user preferences**: Components support reduced motion and high contrast

### Styling

All components provide minimal default styling. You can:
- Use the `className` prop for custom CSS classes
- Use the `style` prop for inline styles
- Style individual elements with specific className props where available

### TypeScript

All components and hooks are fully typed. Import types:

```tsx
import type {
  AccessibleTooltipProps,
  ComboboxOption,
  TreeNode
} from '@a13y/react';
```

### Performance

- Components use React best practices (memoization, proper keys)
- Reduced motion is respected automatically
- Large lists should use virtualization (see VirtualizedList pattern)

---

## Migration from v0.1.x

If you're upgrading from v0.1.x, all new components are additive. Your existing code will continue to work.

New components introduced in v0.2.0:
- AccessibleTooltip
- AccessibleToggle
- AccessibleToast
- AccessibleAccordion
- AccessibleBreadcrumb
- AccessibleCheckboxGroup
- AccessibleRadioGroup
- AccessibleProgress
- SkipLinks
- AccessiblePagination
- AccessibleCombobox
- AccessibleDatePicker
- AccessibleTreeView
- AccessibleTable
- AccessibleCarousel
- AccessibleDrawer

New hooks introduced in v0.2.0:
- useId
- useReducedMotion
- useClickOutside
- useMediaQuery
- useAriaLive
- useAnnounce

---

## Support

For issues, feature requests, or questions:
- GitHub Issues: [https://github.com/DiegoAneli/a13y/issues](https://github.com/DiegoAneli/a13y/issues)
- Documentation: [https://a13y.dev](https://a13y.dev)

## License

MIT License - see LICENSE file for details (DiegoAneli)
