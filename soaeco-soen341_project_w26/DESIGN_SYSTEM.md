# Design System Guide

## What is This?

We've created a simple design system to keep our app's styling consistent. All shared styles are in one file: `lib/styles.ts`

## How to Use It

### Step 1: Import the styles

```typescript
import { formStyles, layoutStyles } from '@/lib/styles';
```

### Step 2: Use them in your components

Instead of writing long className strings:
```typescript
// ❌ Old way (hard to maintain)
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
```

Use the shared styles:
```typescript
// ✅ New way (easy to maintain)
<input className={formStyles.input} />
```

## Available Styles

### Form Styles (`formStyles`)

- `formStyles.input` - Text inputs, email inputs, password inputs
- `formStyles.label` - Labels for form fields
- `formStyles.button` - Primary buttons (submit, login, register)
- `formStyles.errorBox` - Red error message boxes
- `formStyles.successBox` - Green success message boxes

### Layout Styles (`layoutStyles`)

- `layoutStyles.pageContainer` - Full page wrapper with gradient background
- `layoutStyles.formCard` - White card/box for forms
- `layoutStyles.pageTitle` - Page headings (h1)

## Examples

### Login/Register Form
```typescript
import { formStyles, layoutStyles } from '@/lib/styles';

<div className={layoutStyles.pageContainer}>
  <div className={layoutStyles.formCard}>
    <h1 className={layoutStyles.pageTitle}>Login</h1>
    
    <form>
      <label className={formStyles.label}>Email:</label>
      <input className={formStyles.input} type="email" />
      
      <button className={formStyles.button}>Login</button>
    </form>
  </div>
</div>
```

### Error Message
```typescript
{error && (
  <div className={formStyles.errorBox}>
    {error}
  </div>
)}
```

## Benefits

✅ **Consistency** - All pages look the same
✅ **Easy to update** - Change one file, update everywhere
✅ **Less code** - No repeating long className strings
✅ **Easy to learn** - Just import and use

## When to Update `lib/styles.ts`

- Adding a new type of button (secondary, danger, etc.)
- Changing brand colors
- Adding new form elements (select, textarea, etc.)
- Creating new page layouts

## Questions?

If you need a style that doesn't exist yet:
1. Add it to `lib/styles.ts`
2. Use it in your component
3. Tell the team so everyone knows it's available!
