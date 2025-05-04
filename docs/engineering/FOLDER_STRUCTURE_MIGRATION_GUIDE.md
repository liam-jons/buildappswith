# Folder Structure Migration Guide

This document provides guidelines for migrating existing code to the new domain-driven folder structure. It includes step-by-step instructions, best practices, and examples to ensure a smooth transition.

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Component Migration](#component-migration)
3. [App Directory Migration](#app-directory-migration)
4. [Library Code Migration](#library-code-migration)
5. [Import Updates](#import-updates)
6. [Testing Guidelines](#testing-guidelines)
7. [Common Issues and Solutions](#common-issues-and-solutions)

## Migration Strategy

The migration follows a **complete replacement** approach rather than refactoring existing code. This means creating new implementations that follow the domain-driven folder structure, and then removing the old implementations once the new ones are in place.

### Key Principles

1. **Domain-First Organization**: Group code by domain/feature first, then by type
2. **Consistent Naming**: Use kebab-case for files and directories, PascalCase for components
3. **Barrel Exports**: Use index.ts files for simplified imports
4. **Clear Boundaries**: Maintain separation between domains
5. **Comprehensive Documentation**: Add README.md files to explain directory purpose

### Migration Process Overview

1. Identify the domain for each component or file
2. Create the appropriate domain directory structure if it doesn't exist
3. Implement new versions of components following the domain-first pattern
4. Update imports to use the new structure and barrel exports
5. Test thoroughly to ensure functionality is preserved
6. Remove old implementations once new ones are verified

## Component Migration

### Step 1: Identify Component Domain

Determine which domain each component belongs to based on its functionality:

- **marketplace**: Builder discovery and profiles
- **scheduling**: Booking and availability management
- **payment**: Payment processing (Stripe)
- **profile**: User profile management
- **admin**: Administration functionality
- **trust**: Trust architecture components
- **community**: Community and knowledge sharing
- **learning**: Educational components

### Step 2: Create Domain Structure

Ensure the domain directory exists with the proper structure:

```
/components/[domain]/
├── ui/                   # Domain-specific UI components
│   ├── [component].tsx   # Individual components
│   └── index.ts          # Barrel exports
├── [component].tsx       # Domain-specific components
└── index.ts              # Barrel exports
```

### Step 3: Implement New Components

Create new versions of components following these guidelines:

#### Server Component

```tsx
// components/domain/component-name.tsx

import { cn } from "@/lib/utils";
import { getDomainData } from "@/lib/domain/actions";

// Import components using barrel exports
import { SomeComponent } from "@/components/domain";
import { Button } from "@/components/ui";

// Types and interfaces
interface ComponentProps {
  // Props definition
}

/**
 * Component description
 */
export async function ComponentName({ prop1, prop2, ...props }: ComponentProps) {
  // Server-side data fetching
  const data = await getDomainData();
  
  // Component implementation
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

#### Client Component

```tsx
// components/domain/ui/component-name.tsx
"use client"; // Client directive for components using React hooks

// Imports organized by category
import { useState } from "react";

// Internal utilities
import { cn } from "@/lib/utils";
import { useDomainState } from "@/hooks/domain/use-domain-state";

// Internal components using barrel exports
import { Button } from "@/components/ui";

// Types and interfaces
interface ComponentProps {
  // Props definition
}

/**
 * Component description
 */
export function ComponentName({ prop1, prop2, ...props }: ComponentProps) {
  // State and hooks
  const [state, setState] = useState(initialState);
  
  // Component implementation
  return (
    <div>
      {/* Component content */}
    </div>
  );
}
```

### Step 4: Update Barrel Exports

Ensure proper barrel exports in index.ts files:

```typescript
// components/domain/index.ts
export * from "./component-name";
export * from "./ui";

// components/domain/ui/index.ts
export * from "./component-name";
```

## App Directory Migration

### Step 1: Identify Page Domain

Determine which domain each page belongs to based on its functionality.

### Step 2: Create Domain Structure

Ensure the appropriate directory structure exists:

```
/app/(platform)/[domain]/
├── [subpage]/            # Sub-pages
│   └── page.tsx          # Page component
├── page.tsx              # Main domain page
└── README.md             # Documentation
```

### Step 3: Implement New Pages

Create new versions of pages following this template:

```tsx
// app/(platform)/domain/page.tsx

import { Metadata } from "next";

// Import domain-specific actions
import { getDomainData } from "@/lib/domain/actions";

// Import components using barrel exports
import { DomainComponent } from "@/components/domain";
import { Button } from "@/components/ui";

// Metadata export for Next.js
export const metadata: Metadata = {
  title: "Page Title | Buildappswith",
  description: "Page description for SEO",
};

/**
 * Page description
 */
export default async function DomainPage() {
  // Server-side data fetching
  const data = await getDomainData();
  
  // Page implementation
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

## Library Code Migration

### Step 1: Identify Code Domain

Determine which domain each library file belongs to.

### Step 2: Create Domain Structure

Ensure the appropriate directory structure exists:

```
/lib/[domain]/
├── actions.ts       # Server actions
├── api.ts           # API client functions
├── schemas.ts       # Zod validation schemas
├── types.ts         # TypeScript type definitions
├── utils.ts         # Domain-specific utility functions
└── index.ts         # Barrel exports
```

### Step 3: Implement Standard Files

Create new versions of library files following these templates:

#### actions.ts

```typescript
// lib/domain/actions.ts
"use server"; // Server actions directive

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { ActionResult } from "@/lib/types";
import { DomainActionSchema } from "./schemas";
import { DomainData } from "./types";

/**
 * Action description
 */
export async function domainAction(input: z.infer<typeof DomainActionSchema>): Promise<ActionResult<DomainData>> {
  try {
    // Validate input
    const result = DomainActionSchema.safeParse(input);
    
    if (!result.success) {
      return {
        success: false,
        message: "Invalid input data",
        error: result.error.format(),
      };
    }
    
    // Implementation
    const data = result.data;
    
    // Database operations
    
    // Revalidate paths if needed
    revalidatePath("/path/to/revalidate");
    
    return {
      success: true,
      message: "Operation successful",
      data: resultData,
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

#### api.ts

```typescript
// lib/domain/api.ts
import { ApiResult } from "@/lib/types";
import { DomainData } from "./types";

/**
 * Function description
 */
export async function fetchDomainData(): Promise<ApiResult<DomainData>> {
  try {
    const response = await fetch("/api/domain/endpoint");
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      message: "Data fetched successfully",
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch data",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

#### types.ts

```typescript
// lib/domain/types.ts
export interface DomainData {
  id: string;
  name: string;
  // Other properties
}

export enum DomainStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  // Other statuses
}

export type DomainContext = {
  data: DomainData | null;
  loading: boolean;
  error: Error | null;
};
```

## Import Updates

### Update Imports to Use Barrel Exports

Replace direct imports with barrel imports:

```typescript
// Before ❌
import { BuilderCard } from "@/components/marketplace/builder-card";
import { Button } from "@/components/ui/button";

// After ✅
import { BuilderCard } from "@/components/marketplace";
import { Button } from "@/components/ui";
```

### Update Domain-Specific Imports

Use domain-first approach for all imports:

```typescript
// Before ❌
import { fetchData } from "@/lib/api";
import { BuilderType } from "@/lib/types";

// After ✅
import { fetchBuilderData } from "@/lib/marketplace/api";
import { BuilderType } from "@/lib/marketplace/types";
```

## Testing Guidelines

### Component Testing

1. Create new tests for components in the new location
2. Ensure tests use the new import paths
3. Verify component behavior matches the original implementation
4. Run both old and new tests during the transition period

### Integration Testing

1. Test complete user journeys using the new components
2. Verify all interactions work as expected
3. Test edge cases and error scenarios
4. Ensure proper integration with other domains

## Common Issues and Solutions

### Import Resolution Issues

**Problem**: Import paths are incorrect after migration.

**Solution**: 
- Use barrel exports consistently
- Update all imports in related files
- Check for circular dependencies

### Component Prop Mismatches

**Problem**: New components have different prop interfaces.

**Solution**:
- Maintain the same props interface in new components
- Add deprecation comments for props that will change
- Provide fallbacks for optional props

### Data Fetching Changes

**Problem**: Server components use different data fetching patterns.

**Solution**:
- Implement consistent patterns for data fetching
- Use proper error handling and loading states
- Maintain same data structures where possible

### Missing Functionality

**Problem**: New implementation might miss edge cases from the original.

**Solution**:
- Compare implementations carefully
- Document known differences
- Add comprehensive tests for all functionality
