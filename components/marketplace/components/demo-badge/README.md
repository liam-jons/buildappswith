# Demo Badge Component

## Overview

The Demo Badge component is a UI element used within the marketplace domain to clearly indicate demo accounts in the user interface. It provides a consistent styling and behavior for highlighting demo content.

## Component Structure

```
demo-badge/
├── demo-badge.tsx       # Main component implementation
└── index.ts             # Barrel exports
```

## Usage

Import the component using the barrel exports pattern:

```tsx
// Import via marketplace barrel exports (preferred)
import { DemoBadge } from '@/components/marketplace';

// Direct import (avoid if possible)
import { DemoBadge } from '@/components/marketplace/components/demo-badge';
```

### Basic Usage

```tsx
<DemoBadge />
```

### With Options

```tsx
<DemoBadge 
  size="small"      // Options: "small", "medium", "large"
  className="ml-2"  // Additional Tailwind classes
/>
```

## Props

| Prop      | Type                           | Default    | Description                       |
|-----------|--------------------------------|------------|-----------------------------------|
| size      | "small" \| "medium" \| "large" | "medium"   | Controls the size of the badge   |
| className | string                         | ""         | Additional CSS classes to apply   |

## Styling

The component uses Tailwind CSS and the shadcn/ui `Badge` component with amber color styling to visually indicate demo status.

## Integration

This component is typically used within:
- `BuilderCard` - To indicate demo builder profiles
- Profile pages - To mark demo accounts
- Search results - For demo content in marketplace listings
