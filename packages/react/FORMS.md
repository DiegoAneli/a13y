# @a13y/react - Accessible Forms

Comprehensive form management with accessibility built-in.

## Table of Contents

- [useAccessibleForm Hook](#useaccessibleform-hook)
- [useFormField Hook](#useformfield-hook)
- [Complete Form Examples](#complete-form-examples)
- [Anti-Patterns (Errors Avoided)](#anti-patterns-errors-avoided)
- [Best Practices](#best-practices)

---

## useAccessibleForm Hook

Manages entire forms with automatic accessibility features.

### Features

- ✅ **Label obbligatorie** - Enforced via TypeScript
- ✅ **Errori annunciati** - Automatic screen reader announcements
- ✅ **Focus automatico** - First error field receives focus
- ✅ **aria-invalid coerente** - Automatic ARIA attributes
- ✅ **Validazione field e form** - Both field-level and form-level validation
- ✅ **Touch tracking** - Better UX with validate-on-change after first blur

### Basic Example

```tsx
import { useAccessibleForm } from '@a13y/react/hooks';

function LoginForm() {
  const form = useAccessibleForm({
    fields: {
      email: {
        initialValue: '',
        required: true,
        requiredMessage: 'Email is required',
        validate: (value) => {
          if (!value.includes('@')) {
            return 'Please enter a valid email address';
          }
          return true;
        },
      },
      password: {
        initialValue: '',
        required: true,
        validate: (value) => {
          if (value.length < 8) {
            return 'Password must be at least 8 characters';
          }
          return true;
        },
      },
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
      await login(values.email, values.password);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Email Field */}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.state.values.email}
          onChange={(e) => form.setFieldValue('email', e.target.value)}
          onBlur={() => form.validateField('email')}
          aria-invalid={!!form.state.errors.email}
          aria-describedby={form.state.errors.email ? 'email-error' : undefined}
          aria-required
        />
        {form.state.errors.email && (
          <span id="email-error" role="alert" aria-live="polite">
            {form.state.errors.email}
          </span>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.state.values.password}
          onChange={(e) => form.setFieldValue('password', e.target.value)}
          onBlur={() => form.validateField('password')}
          aria-invalid={!!form.state.errors.password}
          aria-describedby={form.state.errors.password ? 'password-error' : undefined}
          aria-required
        />
        {form.state.errors.password && (
          <span id="password-error" role="alert" aria-live="polite">
            {form.state.errors.password}
          </span>
        )}
      </div>

      <button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```

### Using getFieldProps (Simplified)

```tsx
function LoginForm() {
  const form = useAccessibleForm({
    fields: {
      email: {
        initialValue: '',
        required: true,
        validate: (value) => value.includes('@') || 'Invalid email',
      },
      password: {
        initialValue: '',
        required: true,
        validate: (value) => value.length >= 8 || 'Password too short',
      },
    },
    onSubmit: async (values) => {
      await login(values.email, values.password);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      {/* Email Field - Using getFieldProps */}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...form.getFieldProps('email')}
          onChange={(e) => form.getFieldProps('email').onChange(e.target.value)}
        />
        {form.state.errors.email && (
          <span id="email-error" role="alert">
            {form.state.errors.email}
          </span>
        )}
      </div>

      <button type="submit">Log In</button>
    </form>
  );
}
```

### Form-Level Validation (Cross-Field)

```tsx
function PasswordChangeForm() {
  const form = useAccessibleForm({
    fields: {
      password: {
        initialValue: '',
        required: true,
      },
      confirmPassword: {
        initialValue: '',
        required: true,
      },
    },
    // Form-level validation for password matching
    validate: (values) => {
      if (values.password !== values.confirmPassword) {
        return {
          confirmPassword: 'Passwords do not match',
        };
      }
      return null;
    },
    onSubmit: async (values) => {
      await changePassword(values.password);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          value={form.state.values.password}
          onChange={(e) => form.setFieldValue('password', e.target.value)}
          aria-invalid={!!form.state.errors.password}
        />
        {form.state.errors.password && (
          <span role="alert">{form.state.errors.password}</span>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={form.state.values.confirmPassword}
          onChange={(e) => form.setFieldValue('confirmPassword', e.target.value)}
          aria-invalid={!!form.state.errors.confirmPassword}
        />
        {form.state.errors.confirmPassword && (
          <span role="alert">{form.state.errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit">Change Password</button>
    </form>
  );
}
```

---

## useFormField Hook

Manages individual form fields with complete accessibility.

### Features

- ✅ **Label obbligatoria** - Compile-time enforcement via TypeScript
- ✅ **Automatic ARIA** - aria-labelledby, aria-describedby, aria-invalid
- ✅ **Error announcements** - Screen reader notifications
- ✅ **Help text support** - Properly linked via aria-describedby
- ✅ **ID generation** - Unique IDs for ARIA relationships

### Basic Example

```tsx
import { useFormField } from '@a13y/react/hooks';

function EmailField() {
  const emailField = useFormField({
    label: 'Email Address',
    required: true,
    validate: (value) => {
      if (!value.includes('@')) {
        return 'Please enter a valid email address';
      }
      return true;
    },
    helpText: 'We will never share your email with anyone',
  });

  return (
    <div>
      <label {...emailField.labelProps}>Email Address</label>
      <input
        {...emailField.inputProps}
        type="email"
        onChange={(e) => emailField.setValue(e.target.value)}
      />
      {emailField.helpText && (
        <span {...emailField.helpTextProps} style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          We will never share your email with anyone
        </span>
      )}
      {emailField.error && (
        <span {...emailField.errorProps} style={{ color: '#dc2626' }}>
          {emailField.error}
        </span>
      )}
    </div>
  );
}
```

### With Custom Validation

```tsx
function PasswordField() {
  const passwordField = useFormField({
    label: 'Password',
    required: true,
    requiredMessage: 'Password is required for account security',
    validate: (value) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number';
      }
      return true;
    },
    helpText: 'Must be at least 8 characters with uppercase and number',
  });

  return (
    <div>
      <label {...passwordField.labelProps}>Password</label>
      <input
        {...passwordField.inputProps}
        type="password"
        onChange={(e) => passwordField.setValue(e.target.value)}
      />
      {passwordField.helpText && (
        <span {...passwordField.helpTextProps}>
          {passwordField.helpText}
        </span>
      )}
      {passwordField.error && (
        <span {...passwordField.errorProps}>{passwordField.error}</span>
      )}
    </div>
  );
}
```

### Programmatic Control

```tsx
function ControlledField() {
  const field = useFormField({
    label: 'Username',
    required: true,
  });

  const checkAvailability = async () => {
    const isAvailable = await checkUsername(field.value);
    if (!isAvailable) {
      field.setError('Username is already taken');
    }
  };

  return (
    <div>
      <label {...field.labelProps}>Username</label>
      <input
        {...field.inputProps}
        onChange={(e) => field.setValue(e.target.value)}
      />
      <button type="button" onClick={checkAvailability}>
        Check Availability
      </button>
      {field.error && <span {...field.errorProps}>{field.error}</span>}
    </div>
  );
}
```

---

## Complete Form Examples

### Registration Form (Complex)

```tsx
import { useAccessibleForm } from '@a13y/react/hooks';

function RegistrationForm() {
  const form = useAccessibleForm({
    fields: {
      firstName: {
        initialValue: '',
        required: true,
        requiredMessage: 'First name is required',
      },
      lastName: {
        initialValue: '',
        required: true,
        requiredMessage: 'Last name is required',
      },
      email: {
        initialValue: '',
        required: true,
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
          }
          return true;
        },
      },
      password: {
        initialValue: '',
        required: true,
        validate: (value) => {
          if (value.length < 8) return 'Password must be at least 8 characters';
          if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter';
          if (!/[0-9]/.test(value)) return 'Must contain number';
          return true;
        },
      },
      confirmPassword: {
        initialValue: '',
        required: true,
      },
      agreeToTerms: {
        initialValue: false,
        required: true,
        requiredMessage: 'You must agree to the terms and conditions',
      },
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      // Cross-field validation: password matching
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
    onSubmit: async (values) => {
      console.log('Registering user:', values);
      await registerUser(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <h1>Create Account</h1>

      {/* Form Error Summary */}
      {form.state.hasSubmitted && !form.state.isValid && (
        <div role="alert" aria-live="assertive" style={{ color: '#dc2626', marginBottom: '1rem' }}>
          <strong>There are {Object.keys(form.state.errors).length} errors in the form:</strong>
          <ul>
            {Object.entries(form.state.errors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* First Name */}
      <div>
        <label htmlFor="firstName">First Name *</label>
        <input
          id="firstName"
          type="text"
          value={form.state.values.firstName}
          onChange={(e) => form.setFieldValue('firstName', e.target.value)}
          onBlur={() => form.validateField('firstName')}
          aria-invalid={!!form.state.errors.firstName}
          aria-describedby={form.state.errors.firstName ? 'firstName-error' : undefined}
          aria-required
        />
        {form.state.errors.firstName && (
          <span id="firstName-error" role="alert">
            {form.state.errors.firstName}
          </span>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName">Last Name *</label>
        <input
          id="lastName"
          type="text"
          value={form.state.values.lastName}
          onChange={(e) => form.setFieldValue('lastName', e.target.value)}
          onBlur={() => form.validateField('lastName')}
          aria-invalid={!!form.state.errors.lastName}
          aria-describedby={form.state.errors.lastName ? 'lastName-error' : undefined}
          aria-required
        />
        {form.state.errors.lastName && (
          <span id="lastName-error" role="alert">
            {form.state.errors.lastName}
          </span>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={form.state.values.email}
          onChange={(e) => form.setFieldValue('email', e.target.value)}
          onBlur={() => form.validateField('email')}
          aria-invalid={!!form.state.errors.email}
          aria-describedby={form.state.errors.email ? 'email-error' : undefined}
          aria-required
        />
        {form.state.errors.email && (
          <span id="email-error" role="alert">
            {form.state.errors.email}
          </span>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password">Password *</label>
        <input
          id="password"
          type="password"
          value={form.state.values.password}
          onChange={(e) => form.setFieldValue('password', e.target.value)}
          onBlur={() => form.validateField('password')}
          aria-invalid={!!form.state.errors.password}
          aria-describedby="password-help password-error"
          aria-required
        />
        <span id="password-help" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Must be at least 8 characters with uppercase letter and number
        </span>
        {form.state.errors.password && (
          <span id="password-error" role="alert">
            {form.state.errors.password}
          </span>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          id="confirmPassword"
          type="password"
          value={form.state.values.confirmPassword}
          onChange={(e) => form.setFieldValue('confirmPassword', e.target.value)}
          onBlur={() => form.validateField('confirmPassword')}
          aria-invalid={!!form.state.errors.confirmPassword}
          aria-describedby={form.state.errors.confirmPassword ? 'confirmPassword-error' : undefined}
          aria-required
        />
        {form.state.errors.confirmPassword && (
          <span id="confirmPassword-error" role="alert">
            {form.state.errors.confirmPassword}
          </span>
        )}
      </div>

      {/* Terms Checkbox */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={form.state.values.agreeToTerms}
            onChange={(e) => form.setFieldValue('agreeToTerms', e.target.checked)}
            aria-invalid={!!form.state.errors.agreeToTerms}
            aria-required
          />
          I agree to the terms and conditions *
        </label>
        {form.state.errors.agreeToTerms && (
          <span role="alert">{form.state.errors.agreeToTerms}</span>
        )}
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Reset Button */}
      <button type="button" onClick={form.reset}>
        Reset Form
      </button>
    </form>
  );
}
```

---

## Anti-Patterns (Errors Avoided)

### ❌ WRONG: Form Without Labels

```tsx
// BAD - No accessible labels
function BadForm() {
  return (
    <form>
      <input type="email" placeholder="Email" /> {/* ❌ Placeholder is NOT a label */}
      <input type="password" placeholder="Password" />
      <button>Submit</button>
    </form>
  );
}
```

**Why it's wrong:**
- Screen readers cannot identify fields
- Placeholder text disappears when typing
- Not accessible to keyboard-only users

### ✅ CORRECT: Form With Proper Labels

```tsx
// GOOD - Proper accessible labels
function GoodForm() {
  const form = useAccessibleForm({
    fields: {
      email: { initialValue: '', required: true },
      password: { initialValue: '', required: true },
    },
    onSubmit: (values) => console.log(values),
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={form.state.values.email}
        onChange={(e) => form.setFieldValue('email', e.target.value)}
        aria-required
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={form.state.values.password}
        onChange={(e) => form.setFieldValue('password', e.target.value)}
        aria-required
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

### ❌ WRONG: Errors Not Announced

```tsx
// BAD - Errors displayed but not announced
function BadErrorHandling() {
  const [error, setError] = useState('');

  return (
    <div>
      <input type="email" />
      {error && <span>{error}</span>} {/* ❌ Not announced to screen readers */}
    </div>
  );
}
```

**Why it's wrong:**
- Screen reader users don't know error appeared
- No aria-invalid on input
- Error not linked to input

### ✅ CORRECT: Errors Properly Announced

```tsx
// GOOD - Errors announced and linked
function GoodErrorHandling() {
  const emailField = useFormField({
    label: 'Email',
    validate: (value) => value.includes('@') || 'Invalid email',
  });

  return (
    <div>
      <label {...emailField.labelProps}>Email</label>
      <input
        {...emailField.inputProps}
        type="email"
        onChange={(e) => emailField.setValue(e.target.value)}
      />
      {emailField.error && (
        <span {...emailField.errorProps}>{emailField.error}</span>
      )}
    </div>
  );
}
```

**What it does right:**
- Error announced via role="alert" and aria-live="polite"
- aria-invalid set on input
- aria-describedby links error to input
- Screen reader announces error when it appears

---

### ❌ WRONG: No Focus Management on Errors

```tsx
// BAD - User doesn't know where errors are
function BadFocusManagement() {
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const errors = validate();
    setErrors(errors); // ❌ No focus management
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Why it's wrong:**
- User has to search for errors
- Poor experience for keyboard users
- Violates WCAG 3.3.1 (Error Identification)

### ✅ CORRECT: Auto-Focus First Error

```tsx
// GOOD - First error receives focus
function GoodFocusManagement() {
  const form = useAccessibleForm({
    fields: {
      email: { initialValue: '', required: true },
      password: { initialValue: '', required: true },
    },
    onSubmit: (values) => console.log(values),
    autoFocusError: true, // ✅ Automatically focuses first error
  });

  return <form onSubmit={form.handleSubmit}>...</form>;
}
```

**What it does right:**
- First error field receives focus automatically
- Screen reader announces error
- User can immediately correct the mistake

---

### ❌ WRONG: Inconsistent aria-invalid

```tsx
// BAD - aria-invalid not set or inconsistent
function BadAriaInvalid() {
  const [error, setError] = useState('');

  return (
    <input type="email" /> // ❌ No aria-invalid
  );
}
```

### ✅ CORRECT: Automatic aria-invalid

```tsx
// GOOD - aria-invalid automatically managed
function GoodAriaInvalid() {
  const emailField = useFormField({
    label: 'Email',
    validate: (value) => value.includes('@') || 'Invalid email',
  });

  return (
    <input
      {...emailField.inputProps}
      type="email"
      onChange={(e) => emailField.setValue(e.target.value)}
    />
    // ✅ aria-invalid automatically set when error exists
  );
}
```

---

### ❌ WRONG: Missing Required Indicators

```tsx
// BAD - No way to know field is required
function BadRequired() {
  return (
    <div>
      <label>Email</label>
      <input type="email" /> {/* ❌ No aria-required or visual indicator */}
    </div>
  );
}
```

### ✅ CORRECT: Proper Required Indicators

```tsx
// GOOD - Required indicated visually and semantically
function GoodRequired() {
  const emailField = useFormField({
    label: 'Email',
    required: true, // ✅ Sets aria-required automatically
  });

  return (
    <div>
      <label {...emailField.labelProps}>
        Email <span aria-label="required">*</span>
      </label>
      <input
        {...emailField.inputProps}
        type="email"
        onChange={(e) => emailField.setValue(e.target.value)}
      />
    </div>
  );
}
```

---

## Best Practices

### 1. Always Use Labels

```tsx
// ✅ GOOD
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ❌ BAD
<input type="email" placeholder="Email" />
```

### 2. Announce Errors to Screen Readers

```tsx
// ✅ GOOD
<span role="alert" aria-live="polite">{error}</span>

// ❌ BAD
<span>{error}</span>
```

### 3. Link Errors to Inputs

```tsx
// ✅ GOOD
<input aria-describedby="email-error" aria-invalid={!!error} />
<span id="email-error">{error}</span>

// ❌ BAD
<input />
<span>{error}</span>
```

### 4. Mark Required Fields

```tsx
// ✅ GOOD
<label>Email <span aria-label="required">*</span></label>
<input aria-required />

// ❌ BAD
<label>Email</label>
<input />
```

### 5. Focus First Error on Submit

```tsx
// ✅ GOOD - useAccessibleForm does this automatically
const form = useAccessibleForm({
  autoFocusError: true,
  // ...
});

// ❌ BAD - No focus management
const handleSubmit = () => {
  if (hasErrors) {
    // User has to find errors themselves
  }
};
```

### 6. Provide Help Text

```tsx
// ✅ GOOD
<label {...field.labelProps}>Password</label>
<input {...field.inputProps} aria-describedby="password-help password-error" />
<span id="password-help">Must be at least 8 characters</span>
{error && <span id="password-error" role="alert">{error}</span>}

// ❌ BAD
<input type="password" />
```

### 7. Use Semantic HTML

```tsx
// ✅ GOOD
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>Personal Information</legend>
    ...
  </fieldset>
</form>

// ❌ BAD
<div onClick={handleSubmit}>
  <div>Personal Information</div>
  ...
</div>
```

---

## TypeScript Support

Both hooks are fully typed with strict mode:

```tsx
// ✅ Type-safe form
const form = useAccessibleForm({
  fields: {
    email: { initialValue: '' },
    age: { initialValue: 0 },
  },
  onSubmit: (values) => {
    // values.email is string
    // values.age is number
    console.log(values.email.toUpperCase());
    console.log(values.age.toFixed(2));
  },
});

// ❌ Compile error - label is required
const field = useFormField({
  // Error: Property 'label' is missing
});

// ✅ Correct - label provided
const field = useFormField({
  label: 'Email Address',
});
```

---

## Summary

### useAccessibleForm
- Best for managing entire forms
- Automatic error announcements
- Auto-focus first error
- Form-level and field-level validation
- Cross-field validation support

### useFormField
- Best for individual field components
- Label required (compile-time)
- Automatic ARIA attributes
- Help text support
- Reusable field components

Both hooks ensure:
- ✅ Labels are mandatory
- ✅ Errors are announced correctly
- ✅ aria-invalid is consistent
- ✅ First error receives focus
- ✅ WCAG 2.1 Level AA compliance
