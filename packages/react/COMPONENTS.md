# @a13y/react - Components

Type-safe accessible React components with enforced accessibility requirements.

---

## AccessibleButton

### ✅ Uso Corretto

```tsx
import { AccessibleButton } from '@a13y/react';

// Text button (label optional)
<AccessibleButton onPress={() => console.log('Clicked')}>
  Save Changes
</AccessibleButton>

// Icon button with label (REQUIRED)
<AccessibleButton
  label="Delete item"
  onPress={() => console.log('Deleted')}
  variant="danger"
>
  🗑️
</AccessibleButton>

// Disabled button
<AccessibleButton
  onPress={() => {}}
  disabled={true}
>
  Submit
</AccessibleButton>

// With press event details
<AccessibleButton
  onPress={(event) => {
    if (event.type === 'keyboard') {
      console.log('Activated with', event.key); // 'Enter' | ' '
    }
  }}
>
  Press me
</AccessibleButton>
```

### ❌ Errori TypeScript

```tsx
// ❌ Error: Property 'onPress' is missing
<AccessibleButton>
  Click me
</AccessibleButton>

// ❌ Error: Type 'string' is not assignable to type 'PressEvent'
<AccessibleButton onPress="invalid">
  Click me
</AccessibleButton>

// ⚠️ Runtime Warning in DEV: Missing accessible name (icon-only without label)
<AccessibleButton onPress={() => {}}>
  🗑️
</AccessibleButton>
```

---

## AccessibleDialog

### ✅ Uso Corretto

```tsx
import { AccessibleDialog } from '@a13y/react';

// Basic dialog
const [isOpen, setIsOpen] = useState(false);

<AccessibleDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action" // ✅ Required
>
  <p>Are you sure you want to proceed?</p>
  <button onClick={() => setIsOpen(false)}>Cancel</button>
  <button onClick={handleConfirm}>Confirm</button>
</AccessibleDialog>

// Dialog with description
<AccessibleDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete Item"
  description="This action cannot be undone"
  role="alertdialog"
>
  <p>Are you sure you want to delete "{itemName}"?</p>
  <button onClick={() => setIsOpen(false)}>Cancel</button>
  <button onClick={handleDelete}>Delete</button>
</AccessibleDialog>

// Dialog without close button
<AccessibleDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Loading..."
  showCloseButton={false}
>
  <Spinner />
</AccessibleDialog>
```

### ❌ Errori TypeScript

```tsx
// ❌ Error: Property 'title' is missing
<AccessibleDialog
  isOpen={true}
  onClose={() => {}}
>
  Content
</AccessibleDialog>

// ❌ Error: Property 'isOpen' is missing
<AccessibleDialog
  title="Dialog"
  onClose={() => {}}
>
  Content
</AccessibleDialog>

// ❌ Error: Property 'onClose' is missing
<AccessibleDialog
  isOpen={true}
  title="Dialog"
>
  Content
</AccessibleDialog>

// ❌ Error: Type '"popup"' is not assignable to type '"dialog" | "alertdialog"'
<AccessibleDialog
  isOpen={true}
  onClose={() => {}}
  title="Dialog"
  role="popup" // Invalid role
>
  Content
</AccessibleDialog>
```

---

## AccessibleModal

### ✅ Uso Corretto

```tsx
import { AccessibleModal, AccessibleButton } from '@a13y/react';

// Modal with footer
<AccessibleModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="md"
  footer={
    <>
      <AccessibleButton
        onPress={() => setIsOpen(false)}
        variant="secondary"
      >
        Cancel
      </AccessibleButton>
      <AccessibleButton
        onPress={handleSave}
        variant="primary"
      >
        Save Changes
      </AccessibleButton>
    </>
  }
>
  <form>
    <label>
      Name:
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
    </label>
    <label>
      Email:
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
    </label>
  </form>
</AccessibleModal>

// Full-screen modal
<AccessibleModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Image Gallery"
  size="full"
>
  <ImageGallery images={images} />
</AccessibleModal>

// Modal that cannot be closed by clicking outside
<AccessibleModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Important Notice"
  closeOnBackdropClick={false}
>
  <p>You must accept the terms to continue.</p>
</AccessibleModal>
```

### ❌ Errori TypeScript

```tsx
// ❌ Error: Property 'title' is missing
<AccessibleModal
  isOpen={true}
  onClose={() => {}}
>
  Content
</AccessibleModal>

// ❌ Error: Type '"huge"' is not assignable to type '"sm" | "md" | "lg" | "xl" | "full"'
<AccessibleModal
  isOpen={true}
  onClose={() => {}}
  title="Modal"
  size="huge" // Invalid size
>
  Content
</AccessibleModal>
```

---

## AccessibleMenu

### ✅ Uso Corretto

```tsx
import { AccessibleMenu } from '@a13y/react';

// Basic dropdown menu
<AccessibleMenu
  label="Open actions menu"
  trigger="Actions ▼"
  items={[
    {
      id: 'edit',
      label: 'Edit',
      onPress: () => console.log('Edit'),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      onPress: () => console.log('Duplicate'),
    },
    {
      id: 'delete',
      label: 'Delete',
      onPress: () => console.log('Delete'),
    },
  ]}
/>

// Menu with icons
<AccessibleMenu
  label="Open file menu"
  trigger={<>File ▼</>}
  items={[
    {
      id: 'new',
      label: 'New File',
      icon: '📄',
      onPress: () => console.log('New'),
    },
    {
      id: 'open',
      label: 'Open',
      icon: '📂',
      onPress: () => console.log('Open'),
    },
    {
      id: 'save',
      label: 'Save',
      icon: '💾',
      onPress: () => console.log('Save'),
      disabled: !hasChanges,
    },
  ]}
/>

// Menu with custom styling
<AccessibleMenu
  label="More options"
  trigger="⋮"
  className="icon-button"
  menuClassName="custom-menu"
  items={[
    { id: 'share', label: 'Share', onPress: () => {} },
    { id: 'export', label: 'Export', onPress: () => {} },
  ]}
/>
```

### ❌ Errori TypeScript

```tsx
// ❌ Error: Property 'label' is missing (required for accessibility)
<AccessibleMenu
  trigger="Menu"
  items={[...]}
/>

// ❌ Error: Property 'items' is missing
<AccessibleMenu
  label="Menu"
  trigger="Menu"
/>

// ❌ Error: Type 'number' is not assignable to type 'string'
<AccessibleMenu
  label="Menu"
  trigger="Menu"
  items={[
    {
      id: 123, // ❌ Must be string
      label: 'Item',
      onPress: () => {},
    },
  ]}
/>

// ❌ Error: Property 'onPress' is missing
<AccessibleMenu
  label="Menu"
  trigger="Menu"
  items={[
    {
      id: 'item',
      label: 'Item',
      // onPress: missing!
    },
  ]}
/>
```

---

## AccessibleTabs

### ✅ Uso Corretto

```tsx
import { AccessibleTabs } from '@a13y/react';

// Basic tabs
<AccessibleTabs
  tabs={[
    {
      id: 'account',
      label: 'Account',
      content: <div>Account settings...</div>,
    },
    {
      id: 'security',
      label: 'Security',
      content: <div>Security settings...</div>,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: <div>Notification preferences...</div>,
    },
  ]}
/>

// Tabs with icons
<AccessibleTabs
  tabs={[
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      content: <Dashboard />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      content: <Analytics />,
    },
  ]}
/>

// Controlled tabs
const [selectedTab, setSelectedTab] = useState(0);

<AccessibleTabs
  tabs={[...]}
  selectedTab={selectedTab}
  onTabChange={setSelectedTab}
/>

// Tabs with disabled tab
<AccessibleTabs
  tabs={[
    {
      id: 'basic',
      label: 'Basic',
      content: <BasicSettings />,
    },
    {
      id: 'advanced',
      label: 'Advanced',
      content: <AdvancedSettings />,
      disabled: !isPremium,
    },
  ]}
/>

// Tabs with default selection
<AccessibleTabs
  defaultTab={1} // Start on second tab
  tabs={[...]}
/>
```

### ❌ Errori TypeScript

```tsx
// ❌ Error: Property 'tabs' is missing
<AccessibleTabs />

// ❌ Error: Type '[]' is not assignable to type '[Tab, ...Tab[]]'
<AccessibleTabs
  tabs={[]} // ❌ Empty array not allowed (must have at least one tab)
/>

// ❌ Error: Property 'label' is missing (required for accessibility)
<AccessibleTabs
  tabs={[
    {
      id: 'tab1',
      // label: missing!
      content: <div>Content</div>,
    },
  ]}
/>

// ❌ Error: Property 'content' is missing
<AccessibleTabs
  tabs={[
    {
      id: 'tab1',
      label: 'Tab 1',
      // content: missing!
    },
  ]}
/>

// ❌ Error: Type 'number' is not assignable to type 'string'
<AccessibleTabs
  tabs={[
    {
      id: 123, // ❌ Must be string
      label: 'Tab',
      content: <div>Content</div>,
    },
  ]}
/>
```

---

## Composition Examples

### Dialog with Button

```tsx
import { AccessibleDialog, AccessibleButton } from '@a13y/react';

function DeleteConfirmation({ item, onConfirm, onCancel }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AccessibleButton
        onPress={() => setIsOpen(true)}
        variant="danger"
        label="Delete item"
      >
        🗑️
      </AccessibleButton>

      <AccessibleDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete "${item.name}"?`}
        role="alertdialog"
      >
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <AccessibleButton
            onPress={() => {
              setIsOpen(false);
              onCancel?.();
            }}
            variant="secondary"
          >
            Cancel
          </AccessibleButton>
          <AccessibleButton
            onPress={() => {
              onConfirm();
              setIsOpen(false);
            }}
            variant="danger"
          >
            Delete
          </AccessibleButton>
        </div>
      </AccessibleDialog>
    </>
  );
}
```

### Modal with Tabs

```tsx
import { AccessibleModal, AccessibleTabs } from '@a13y/react';

function SettingsModal({ isOpen, onClose }) {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
    >
      <AccessibleTabs
        tabs={[
          {
            id: 'general',
            label: 'General',
            content: <GeneralSettings />,
          },
          {
            id: 'appearance',
            label: 'Appearance',
            content: <AppearanceSettings />,
          },
          {
            id: 'privacy',
            label: 'Privacy',
            content: <PrivacySettings />,
          },
        ]}
      />
    </AccessibleModal>
  );
}
```

### Menu with Confirmation Dialog

```tsx
import { AccessibleMenu, AccessibleDialog, AccessibleButton } from '@a13y/react';

function ActionsMenu({ item }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <AccessibleMenu
        label="Open actions menu"
        trigger="Actions ▼"
        items={[
          {
            id: 'edit',
            label: 'Edit',
            icon: '✏️',
            onPress: () => handleEdit(item),
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: '📋',
            onPress: () => handleDuplicate(item),
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: '🗑️',
            onPress: () => setShowDeleteDialog(true),
          },
        ]}
      />

      <AccessibleDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Confirm Deletion"
        role="alertdialog"
      >
        <p>Are you sure you want to delete this item?</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <AccessibleButton
            onPress={() => setShowDeleteDialog(false)}
            variant="secondary"
          >
            Cancel
          </AccessibleButton>
          <AccessibleButton
            onPress={() => {
              handleDelete(item);
              setShowDeleteDialog(false);
            }}
            variant="danger"
          >
            Delete
          </AccessibleButton>
        </div>
      </AccessibleDialog>
    </>
  );
}
```

---

## Type Safety Summary

### ✅ Compile-Time Guarantees

- **Required Props**: `title`, `label`, `onPress`, `tabs` enforced
- **Type-Safe Events**: `PressEvent` with correct shape
- **Restricted Enums**: `variant`, `size`, `role` only accept valid values
- **Non-Empty Arrays**: `tabs` must have at least one item

### ⚠️ Runtime Validation (Development Only)

- Missing accessible names
- Focus trap issues
- Keyboard navigation problems
- ARIA attribute errors

### 🚀 Production Build

All validation code is stripped in production builds:
- Zero runtime overhead
- No bundle size impact
- Type safety preserved at compile-time
