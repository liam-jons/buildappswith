# UI Component Patterns

This document outlines the established UI component patterns used in the Buildappswith platform. Following these patterns ensures consistency, maintainability, and accessibility across the application.

## Version: 1.0.123

## Table of Contents

1. [Component Structure](#component-structure)
2. [Design System Integration](#design-system-integration)
3. [Styling Patterns](#styling-patterns)
4. [Accessibility Guidelines](#accessibility-guidelines)
5. [Performance Optimization](#performance-optimization)
6. [Testing Approach](#testing-approach)
7. [Example Components](#example-components)

## Component Structure

### Basic Component Template

```tsx
"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva(
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        secondary: "secondary-variant-classes",
        // Add more variants as needed
      },
      size: {
        sm: "small-size-classes",
        md: "medium-size-classes",
        lg: "large-size-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  // Additional props here
}

export function Component({
  variant,
  size,
  className,
  children,
  ...props
}: ComponentProps) {
  return (
    <div 
      className={cn(componentVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
    </div>
  );
}
```

### Callback Optimization

Use `useCallback` for event handlers to prevent unnecessary re-renders:

```tsx
const handleEvent = React.useCallback(() => {
  // Handler logic here
}, [dependencies]);
```

### State Management

Use appropriate React hooks for state management:

```tsx
// For simple state
const [isLoaded, setIsLoaded] = React.useState(false);

// For derived state
const isVisible = React.useMemo(() => isLoaded && isActive, [isLoaded, isActive]);

// For complex state logic
const [state, dispatch] = React.useReducer(reducer, initialState);
```

## Design System Integration

### Radix UI Integration

Prefer using Radix UI primitive components as building blocks:

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Instead of creating a custom implementation, build on top of these primitives
```

### Component Composition

Create composable components when appropriate:

```tsx
const Parent = React.forwardRef<
  React.ElementRef<typeof ParentPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ParentPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ParentPrimitive.Root
    ref={ref}
    className={cn("base-styles", className)}
    {...props}
  />
));
Parent.displayName = ParentPrimitive.Root.displayName;

const Child = React.forwardRef<
  React.ElementRef<typeof ParentPrimitive.Child>,
  React.ComponentPropsWithoutRef<typeof ParentPrimitive.Child>
>(({ className, ...props }, ref) => (
  <ParentPrimitive.Child
    ref={ref}
    className={cn("child-styles", className)}
    {...props}
  />
));
Child.displayName = ParentPrimitive.Child.displayName;

export { Parent, Child };
```

## Styling Patterns

### Class Variance Authority (cva)

Use cva for defining component variants:

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Tailwind Merge

Use `cn` utility for merging tailwind classes:

```tsx
import { cn } from "@/lib/utils";

const className = cn(
  "base-classes", 
  conditional && "conditional-classes",
  className // Allow overriding with custom className
);
```

## Accessibility Guidelines

### ARIA Attributes

Include appropriate ARIA attributes for accessibility:

```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  role="button"
>
  {/* Button content */}
</button>
```

### Screen Reader Support

Add screen reader only text for elements that are visually represented:

```tsx
<div>
  <span className="sr-only">User profile for {name}</span>
  <IconComponent aria-hidden="true" />
</div>
```

### Keyboard Navigation

Ensure components are keyboard navigable:

```tsx
const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    // Activate on Enter or Space
    handleActivation();
  }
}, [handleActivation]);
```

## Performance Optimization

### Image Optimization

Use Next.js Image component with proper optimization:

```tsx
import Image from "next/image";

<Image
  src={src}
  alt={alt}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isPriority}
  className="object-cover"
  onLoad={handleLoadComplete}
/>
```

### Loading States

Implement explicit loading states for better user experience:

```tsx
const [isLoaded, setIsLoaded] = React.useState(false);

const handleLoadComplete = React.useCallback(() => {
  setIsLoaded(true);
}, []);

// Use in component
<div className={cn(
  "transition-opacity duration-300",
  isLoaded ? "opacity-100" : "opacity-0"
)}>
  {/* Content */}
</div>
```

## Testing Approach

### Component Testing Strategy

Each component should have tests covering:

1. Basic rendering
2. Prop variations
3. User interactions
4. Accessibility
5. Edge cases

### Test Example

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { YourComponent } from "@/components/your-component";

describe("YourComponent", () => {
  it("renders correctly with default props", () => {
    render(<YourComponent />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
  
  it("applies variant styling correctly", () => {
    render(<YourComponent variant="secondary" />);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");
  });
  
  // More tests...
});
```

## Example Components

### Builder Image Component

The `BuilderImage` component exemplifies these patterns:

```tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const builderImageVariants = cva(
  "relative overflow-hidden rounded-full border border-muted",
  {
    variants: {
      size: {
        sm: "h-12 w-12",
        md: "h-16 w-16",
        lg: "h-24 w-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface BuilderImageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof builderImageVariants> {
  src?: string | null;
  alt: string;
  fallbackText?: string;
}

export function BuilderImage({
  src,
  alt,
  fallbackText,
  size,
  className,
  ...props
}: BuilderImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  const getInitials = React.useCallback(() => {
    const text = fallbackText || alt;
    return text.trim().charAt(0).toUpperCase();
  }, [fallbackText, alt]);

  const handleLoadComplete = React.useCallback(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <Avatar 
      className={cn(builderImageVariants({ size }), className)} 
      {...props}
    >
      {src ? (
        <AvatarImage 
          asChild
          alt={alt}
        >
          <div className="relative aspect-square h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                isLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={handleLoadComplete}
              sizes={
                size === "sm" 
                  ? "48px" 
                  : size === "md" 
                    ? "64px" 
                    : "96px"
              }
              priority={size === "lg"}
            />
          </div>
        </AvatarImage>
      ) : null}
      
      <AvatarFallback 
        className="bg-primary/10 text-primary flex items-center justify-center"
        delayMs={src ? 600 : 0}
      >
        <span 
          className={cn(
            "font-semibold",
            size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-2xl"
          )}
          aria-hidden="true"
        >
          {getInitials()}
        </span>
        <span className="sr-only">{alt}</span>
      </AvatarFallback>
    </Avatar>
  );
}
```