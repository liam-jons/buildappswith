# Tailwind CSS v4 Migration Guide

This document provides guidance on working with Tailwind CSS v4 in the Buildappswith platform, based on our experience migrating from earlier versions.

## Key Changes in Tailwind CSS v4

1. **CSS-First Configuration**
   - Tailwind v4 uses a CSS-first approach instead of JavaScript configuration
   - Requires explicit references using `@reference "tailwindcss"`

2. **Custom Utilities**
   - Custom utilities must use the `@utility` directive
   - Example: `@utility my-custom-class { property: value; }`

3. **Theme Colors**
   - Direct theme references no longer work (e.g., `bg-background`)
   - Use arbitrary values instead: `bg-[hsl(var(--background))]`

4. **Pseudo-elements**
   - Pseudo-element utilities have changed
   - Use standard CSS pseudo-elements instead: `.element::before { ... }`

5. **Variants**
   - Many variant modifiers like `motion-safe:` work differently
   - Use standard media queries instead

## Best Practices

### CSS Structure

```css
/* Top of the file - required for Tailwind v4 */
@reference "tailwindcss";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer utilities {
  @utility my-custom-utility {
    property: value;
  }
}

/* Components with pseudo-elements */
@layer components {
  .component-with-pseudo {
    /* Base styles */
  }
  
  .component-with-pseudo::before {
    content: "";
    /* Pseudo-element styles */
  }
}
```

### Theme Values

When using custom theme values defined in CSS variables:

```css
/* ❌ Don't use this (won't work in v4) */
className="bg-primary text-primary-foreground"

/* ✅ Use this instead */
className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
```

### Animation

Define animations using standard CSS:

```css
@keyframes my-animation {
  from { /* styles */ }
  to { /* styles */ }
}

.animated-element {
  /* Base styles */
}

@media (prefers-reduced-motion: no-preference) {
  .animated-element {
    animation: my-animation 2s ease infinite;
  }
}
```

### Responsive Design

Use media queries with `@utility` for responsive variants:

```css
@utility my-responsive-utility {
  /* Base styles */
}

@media (min-width: 640px) {
  @utility my-responsive-utility {
    /* sm: styles */
  }
}
```

## Common Issues and Solutions

### Problem: Cannot apply unknown utility class

**Error:**
```
Error: Cannot apply unknown utility class: bg-background
```

**Solution:**
Use arbitrary value syntax with HSL variables:
```jsx
className="bg-[hsl(var(--background))]"
```

### Problem: Pseudo-element utilities not working

**Error:**
```
Error: Cannot apply unknown utility class: before:inset-0
```

**Solution:**
Use standard CSS pseudo-elements:
```css
.element {
  position: relative;
}

.element::before {
  content: "";
  position: absolute;
  inset: 0;
  /* other styles */
}
```

### Problem: Animation variants not working

**Error:**
```
Error: Cannot apply unknown utility class: motion-safe:animate-my-animation
```

**Solution:**
Use media queries:
```css
@media (prefers-reduced-motion: no-preference) {
  .element {
    animation: my-animation 2s ease infinite;
  }
}
```

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Magic UI Tailwind v4 Guide](https://magicui.design/docs/tailwind-v4)
- [Next.js + Tailwind CSS v4 Integration](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
