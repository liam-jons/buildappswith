# Implementation Session: Phase 1, Day 3 - Component Prop Interface Standardization

## Session Context

- **Session Type**: Implementation - TypeScript Error Resolution Phase 1 (Day 3)
- **Focus Area**: Component Prop Interface Standardization
- **Current Branch**: feature/type-checking
- **Related Documentation**: 
  - current-session/component-prop-interface-standardization.md
  - current-session/type-system-implementation-summary.md
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

## Project Background

The buildappswith platform currently has TypeScript errors across multiple files that are blocking deployment. We're systematically resolving these errors following our comprehensive plan. In the previous sessions (Days 1-2), we established core type utilities, standardized API responses, implemented enum standardization, and aligned auth context types. This session focuses on implementing Day 3 of our planned roadmap: Component Prop Interface Standardization.

## Implementation Objectives

1. **Create Base Component Types**
   - Implement common component prop interfaces
   - Define type patterns for polymorphic components
   - Create utilities for component composition

2. **Update UI Component Props**
   - Standardize core UI component interfaces
   - Fix prop type inconsistencies
   - Implement proper HTML element extension

3. **Enhance Domain-Specific Components**
   - Create standardized props for profile components
   - Fix the most common component prop errors
   - Document prop interface patterns

## Implementation Plan

### 1. Create Base Component Types (45 min)

- Create a new file `lib/types/component-types.ts` containing:
  - BaseComponentProps interface
  - WithChildrenProps interface
  - AsElementProps interface
  - DisableableProps interface
  - LoadableProps interface
  - PolymorphicProps type
  - PolymorphicPropsWithRef type

- Update `lib/types/index.ts` to export these types

### 2. Update UI Component Props (90 min)

- Update at least 3 core UI components with standardized props:
  - Button (has many type errors across the codebase)
  - Card 
  - Input or Select
  
- Create component-specific type files where needed
- Fix the most common prop type errors

### 3. Enhance Domain-Specific Components (60 min)

- Create domain-specific interfaces for profile components
- Update at least 2 profile components:
  - BuilderProfile
  - ProfileHeader or similar component
- Fix related type errors

### 4. Testing and Documentation (45 min)

- Run type checking and fix remaining issues
- Document implementation patterns
- Measure error reduction
- Plan follow-up work

## Technical Specifications

### Base Component Types

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

// Additional interfaces and types as described in component-prop-interface-standardization.md
```

### UI Component Interfaces

```typescript
// components/ui/types.ts

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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the button expands to full width */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Whether to render as child anchor when used with next/link */
  asChild?: boolean;
}

// Additional component interfaces
```

## Error Patterns to Fix

The implementation should specifically address these error patterns:

1. Inconsistent className/class prop usage:
   - `Type '{ class: string; ... }' is not assignable to type 'ButtonProps'`
   - `Property 'class' does not exist on type 'ButtonProps'`

2. Missing or incorrect prop types:
   - `Property 'variant' does not exist on type '{}'`
   - `Type 'string' is not assignable to type 'ButtonVariant'`

3. Component inheritance issues:
   - `Property 'children' does not exist on type 'IntrinsicAttributes'`
   - `Type '{ profileId: string; isPublicView: boolean; }' is not assignable to type 'IntrinsicAttributes & BuilderProfileProps'`

4. Inconsistent event handler types:
   - `Type '(e: any) => void' is not assignable to type '(event: MouseEvent<HTMLButtonElement>) => void'`

## Verification Steps

After implementation, perform these verification steps:

1. Run targeted type checking on updated components:
   ```bash
   pnpm tsc --noEmit --skipLibCheck components/ui/core/button.tsx
   ```

2. Verify component usage with updated props:
   ```typescript
   // Test in a component
   import { Button } from '@/components/ui/core';
   
   <Button 
     variant="primary"
     size="md"
     onClick={() => console.log('clicked')}
   >
     Click me
   </Button>
   ```

3. Count remaining errors to track progress:
   ```bash
   pnpm type-check | grep "error TS" | wc -l
   ```

## Expected Outcomes

By the end of this session, we should have:
- Standardized base component prop interfaces
- Updated at least 3-5 key UI components with proper prop types
- Fixed the most common component prop type errors
- Estimated 50-80 fewer TypeScript errors
- Additional foundation established for component-specific implementations

## Next Session Planning

At the end of this session, create a prompt for the next implementation session covering Phase 1, Day 4:
- Domain-Specific Type Updates

The prompt should follow this same template but focus on those specific areas, with technical specifications adapted from our planning documents.