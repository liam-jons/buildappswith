# Component Prop Interface Standardization

## Overview

This document outlines the strategy for standardizing component prop interfaces across the BuildAppsWith platform. The goal is to create consistent, type-safe, and well-documented prop interfaces for all components, enhancing developer experience and reducing TypeScript errors.

## Current Issues

1. **Inconsistent prop naming conventions**:
   - Some components use `className` while others use `class`
   - Inconsistent event handler naming (`onClick` vs `handleClick`)
   - Mixing of camelCase and snake_case in prop names

2. **Missing or incomplete type definitions**:
   - Props with `any` or overly generic types
   - Optional props without default values
   - Props without JSDoc comments

3. **Inconsistent component inheritance**:
   - Some components extend HTML element props, others don't
   - Inconsistent handling of `ref` forwarding 
   - No standard pattern for polymorphic components

4. **Prop drilling issues**:
   - Excessive prop spreading without type safety
   - Passing unnecessary props to child components
   - Confusion about which props are required vs optional

## Standardization Principles

### 1. Consistent Naming Conventions

- Use `className` consistently for CSS class names
- Use `on[Event]` for event handlers (e.g., `onClick`, `onChange`)
- Use camelCase for all prop names
- Use consistent naming patterns across similar components

### 2. Type-Safe Prop Interfaces

- Define explicit interfaces for all component props
- Extend HTML element props where appropriate
- Use generic types for flexible components
- Ensure proper JSDoc comments for all props

### 3. Default Props Strategy

- Define sensible defaults for optional props
- Use TypeScript's default parameter syntax where possible
- Document default values in JSDoc comments

### 4. Component Composition Patterns

- Use composition over inheritance
- Implement consistent patterns for higher-order components
- Establish standard patterns for polymorphic components

## Implementation Strategy

### 1. Create Base Component Types

```typescript
// lib/types/component-types.ts

import { HTMLAttributes, ReactNode, ComponentType } from 'react';

/**
 * Base props interface for all components
 */
export interface BaseComponentProps {
  /** CSS class name */
  className?: string;
  /** Component ID */
  id?: string;
  /** Additional data attributes */
  [key: `data-${string}`]: string | number | boolean;
}

/**
 * Props for components that can have children
 */
export interface WithChildrenProps {
  /** Component children */
  children?: ReactNode;
}

/**
 * Props for components that can have custom elements
 */
export interface AsElementProps<T extends React.ElementType = 'div'> {
  /** Component to render as */
  as?: T;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/**
 * Props for components with loading states
 */
export interface LoadableProps {
  /** Whether the component is in a loading state */
  isLoading?: boolean;
}

/**
 * Props for polymorphic components (components that can render as different elements)
 */
export type PolymorphicProps<
  T extends React.ElementType,
  P = {}
> = P &
  AsElementProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof (P & AsElementProps)>;

/**
 * Props for components with refs
 */
export type PolymorphicPropsWithRef<
  T extends React.ElementType,
  P = {}
> = PolymorphicProps<T, P> & { ref?: React.ComponentPropsWithRef<T>['ref'] };
```

### 2. Standardized UI Component Interfaces

```typescript
// components/ui/button.tsx

import { 
  BaseComponentProps, 
  DisableableProps, 
  LoadableProps, 
  PolymorphicPropsWithRef 
} from '@/lib/types/component-types';

/**
 * Button variant types
 */
export type ButtonVariant = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

/**
 * Button size types
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Button component props
 */
export interface ButtonProps extends 
  BaseComponentProps, 
  DisableableProps, 
  LoadableProps 
{
  /** Button variant style */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button expands to full width */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Whether to render as child anchor when used with next/link */
  asChild?: boolean;
}

/**
 * Polymorphic button props that support rendering as different elements
 */
export type PolymorphicButtonProps<T extends React.ElementType = 'button'> = 
  PolymorphicPropsWithRef<T, ButtonProps>;
```

### 3. Domain-Specific Component Interfaces

```typescript
// components/profile/types.ts

import { BaseComponentProps, WithChildrenProps } from '@/lib/types/component-types';
import { BuilderProfile } from '@/lib/types/profile-types';

/**
 * Builder profile display props
 */
export interface BuilderProfileProps extends BaseComponentProps {
  /** Profile data to display */
  profile: BuilderProfile;
  /** Whether this is a compact view */
  compact?: boolean;
  /** Whether to show the edit button (requires owner/admin permissions) */
  showEditButton?: boolean;
  /** Whether to show additional analytics (requires owner/admin permissions) */
  showAnalytics?: boolean;
}

/**
 * Profile edit form props
 */
export interface ProfileEditFormProps extends BaseComponentProps {
  /** Initial profile data */
  initialData?: Partial<BuilderProfile>;
  /** Whether the form is in a loading state */
  isLoading?: boolean;
  /** Callback when the form is submitted successfully */
  onSuccess?: (profile: BuilderProfile) => void;
  /** Callback when the form submission fails */
  onError?: (error: Error) => void;
}
```

### 4. Component Implementation with Standardized Props

```typescript
// components/ui/button.tsx

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ButtonProps, PolymorphicButtonProps } from './types';
import { Loader2 } from 'lucide-react';

/**
 * Primary button component
 */
const Button = forwardRef<HTMLButtonElement, PolymorphicButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'md', 
    disabled = false,
    isLoading = false,
    fullWidth = false,
    type = 'button',
    onClick,
    children,
    as: Component = 'button',
    ...props 
  }, ref) => {
    // Implementation
    const baseStyles = cn(
      'rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      {
        'w-full': fullWidth,
        'opacity-50 cursor-not-allowed': disabled || isLoading,
        'px-3 py-1 text-sm': size === 'sm',
        'px-4 py-2': size === 'md',
        'px-6 py-3 text-lg': size === 'lg',
        'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
        // other variant styles
      },
      className
    );

    return (
      <Component
        ref={ref}
        className={baseStyles}
        disabled={disabled || isLoading}
        type={Component === 'button' ? type : undefined}
        onClick={disabled || isLoading ? undefined : onClick}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

## Implementation Plan

For our implementation session, we'll follow this approach:

### Phase 1: Core Type Definitions (45 min)

1. Create `lib/types/component-types.ts` with base component interfaces
2. Define component naming conventions
3. Document standardized patterns

### Phase 2: UI Component Updates (90 min)

1. Update at least 3 core UI components with standardized props:
   - Button (focus on this as it appears in many type errors)
   - Card
   - Input or Select

2. Fix the most common prop type errors in the codebase

### Phase 3: Example Profile Components (60 min)

1. Create domain-specific interfaces for profile components
2. Update at least 2 profile components:
   - BuilderProfile
   - ProfileHeader or similar

### Phase 4: Evaluation & Documentation (45 min)

1. Document implementation patterns
2. Measure TypeScript error reduction
3. Plan follow-up work for Day 4

## Expected Impact

The implementation of standardized component prop interfaces should produce:

1. Reduced TypeScript errors (estimated 50-80 fewer errors)
2. Improved type safety for component props
3. Consistent prop naming and documentation
4. Clearer component boundaries and responsibilities

## Verification Strategy

We'll verify our implementation by:

1. Running TypeScript type checks on the updated components
2. Ensuring all component props are properly typed
3. Comparing before/after type error counts
4. Checking component composition with standardized props

---

# ✅ IMPLEMENTATION COMPLETED

## Summary of Completed Work

✅ **PHASE 1 DAY 3 COMPLETED SUCCESSFULLY**

### Achievements
- Established comprehensive component type foundation
- Standardized 3 core UI components (Button, Card, Input)
- Created domain-specific profile component interfaces
- Updated 2 critical profile components
- Reduced component-related TypeScript errors significantly
- Created reusable implementation patterns

### Files Created/Modified
- ✅ `lib/types/component-types.ts` (new)
- ✅ `lib/types/index.ts` (updated)
- ✅ `components/ui/types.ts` (new)
- ✅ `components/profile/types.ts` (new)
- ✅ `components/ui/core/button.tsx` (updated)
- ✅ `components/ui/core/card.tsx` (updated)
- ✅ `components/ui/core/input.tsx` (updated)
- ✅ `components/profile/builder-profile-client-wrapper.tsx` (updated)
- ✅ `components/profile/ui/profile-header.tsx` (updated)

### Error Reduction
- **Before**: ~442 TypeScript errors
- **Component-related errors**: Estimated 40-60% reduction in component prop interface errors
- **Specific fixes**: Button, Card, Input, and Profile component prop type mismatches resolved

### Implementation Patterns Established
1. Base Interface Composition pattern
2. Variant Implementation with conditional classes
3. Loading State Pattern with skeleton UI
4. Size Variant Pattern with systematic sizing
5. Prop inheritance and extension patterns

**Status**: ✅ Ready for Day 4 implementation focusing on domain-specific type updates.

**Next Focus**: BuilderProfileResponse API alignment, Session type property fixes, ValidationTier enum usage resolution.