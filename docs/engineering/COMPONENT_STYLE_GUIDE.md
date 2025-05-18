# Component Style Guide

This document outlines the recommended patterns and best practices for building components in the Buildappswith platform.

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Component Organization](#component-organization)
3. [Import Standards](#import-standards)
4. [Component Patterns](#component-patterns)
5. [Accessibility](#accessibility)
6. [Magic UI Components](#magic-ui-components)
7. [Performance Considerations](#performance-considerations)

## Folder Structure

Components are organized following a domain-first approach:

```
/components
├── [domain]/         # Domain-specific components
│   ├── ui/           # Domain-specific UI components
│   │   └── index.ts  # Barrel exports
│   └── index.ts      # Barrel exports
├── ui/               # Shared UI components
│   ├── core/         # Foundational UI components (mostly shadcn/ui)
│   ├── composite/    # Composed UI components reused across domains
│   └── index.ts      # Barrel exports
└── providers/        # Context providers
```

See the [Folder Structure Guide](/docs/engineering/FOLDER_STRUCTURE_GUIDE.md) for more details on the overall project organization.

## Component Organization

### UI Component Hierarchy

Components follow a hierarchical organization:

1. **Core UI Components**: Foundational building blocks (buttons, inputs, etc.)
2. **Composite UI Components**: Combinations of core components that are reused across domains
3. **Domain-specific UI Components**: Components tailored to a specific domain's needs

### Component File Structure

Each component file should follow this structure:

```typescript
"use client"; // Only if using client-side hooks or APIs

// Imports organized by category
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useComponentState } from "@/hooks/use-component-state";

import { Button } from "@/components/ui";
import { SomeOtherComponent } from "@/components/some-domain";

// Types and interfaces
interface MyComponentProps {
  // Props definition
}

// Component implementation
export function MyComponent({ prop1, prop2, ...props }: MyComponentProps) {
  // Implementation
}
```

## Import Standards

### Using Barrel Exports

Always import components from barrel exports (index.ts files) rather than directly from component files:

```typescript
// ✅ Good - Use barrel exports
import { Button, Card } from "@/components/ui";
import { ValidationTierBadge } from "@/components/profile";

// ❌ Bad - Don't import directly from component files
import { Button } from "@/components/ui/button";
import { ValidationTierBadge } from "@/components/profile/ui/validation-tier-badge";
```

### Benefits of Barrel Exports

Using barrel exports provides several advantages:

1. **Simplified Imports**: Fewer import statements and shorter paths
2. **Encapsulation**: Implementation details can change without affecting imports
3. **Refactoring Support**: Components can be moved within their domain without breaking imports
4. **Cleaner Code**: Reduces import clutter at the top of files

### Import Order

Organize imports in the following order, with a blank line between each group:

1. **External Libraries**: React, framer-motion, etc.
2. **Internal Utilities**: Utilities and hooks from `/lib` and `/hooks`
3. **Internal Components**: Components from `/components`
4. **Types**: Type imports if separate from component imports

```typescript
// External libraries
import { useState } from 'react';
import { motion } from 'framer-motion';

// Internal utilities
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// Internal components
import { Button } from '@/components/ui';
import { ValidationTierBadge } from '@/components/profile';

// Types
import type { UserProfile } from '@/types/user';
```

## Component Patterns

### Client vs. Server Components

- Use server components by default for better performance
- Add `"use client";` directive only when needed (hooks, event handlers, browser APIs)
- Keep client components as small as possible

### Props Interface Pattern

- Use TypeScript interfaces for component props
- Document complex props with JSDoc comments
- Use optional props with default values where appropriate
- Put props interface directly above the component

### Styling Approach

- Use Tailwind CSS for styling
- Use the `cn()` utility for conditional class names
- Compose styles with component composition rather than complex class logic
- Use CSS variables for themeable values

Example:

```typescript
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Button({ 
  variant = "default", 
  size = "md", 
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded font-medium", 
        {
          "bg-blue-500 text-white": variant === "default",
          "border border-gray-300": variant === "outline",
          "hover:bg-gray-100": variant === "ghost",
        },
        {
          "px-2 py-1 text-sm": size === "sm",
          "px-4 py-2": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}
```

## Accessibility

All components must be accessible according to WCAG 2.1 AA standards:

- Use semantic HTML elements
- Include proper ARIA attributes when needed
- Support keyboard navigation
- Ensure sufficient color contrast
- Provide text alternatives for non-text content
- Support screen readers

### Reduced Motion

Support users who prefer reduced motion:

```typescript
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { scale: 1.1 }}
      // ...
    />
  );
}
```

## Magic UI Components

Buildappswith uses Magic UI components for enhanced visual effects. When using these components:

- Always respect reduced motion preferences
- Provide static alternatives for users with motion sensitivity
- Keep animations subtle and purposeful
- Use the correct props for accessibility

Example:

```typescript
import { BorderBeam } from "@/components/magicui/border-beam";
import { useReducedMotion } from "framer-motion";

export function EnhancedCard() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="relative rounded-lg border p-4">
      {!shouldReduceMotion && (
        <BorderBeam
          size={20}
          delay={0.5}
          duration={2.5}
          colorFrom="from-blue-500/20"
          colorTo="to-blue-500/0"
        />
      )}
      {/* Card content */}
    </div>
  );
}
```

## Performance Considerations

- Use React Server Components where possible
- Implement code splitting with dynamic imports for heavy components
- Memoize expensive computations and components with useCallback/useMemo
- Optimize image loading with next/image
- Use windowing for long lists (react-window or react-virtualized)
- Avoid layout thrashing by batching DOM reads and writes

Example of memoization:

```typescript
import { useMemo, memo } from "react";

interface ExpensiveComponentProps {
  data: number[];
}

// Memoize the component itself
export const ExpensiveComponent = memo(function ExpensiveComponent({ 
  data 
}: ExpensiveComponentProps) {
  // Memoize expensive computation
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item));
  }, [data]);
  
  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.value}</div>
      ))}
    </div>
  );
});
```
