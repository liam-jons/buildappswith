# Folder Structure Guide

This document outlines the standardized folder structure for the Buildappswith platform to ensure consistent organization across the codebase.

## Core Principles

1. **Domain-First Organization**: Group code by domain/feature first, then by type
2. **Consistent Naming Conventions**: Use kebab-case for directories, PascalCase for components
3. **Barrel Exports**: Use index.ts files to simplify imports
4. **Colocation**: Keep related files together when possible
5. **Clear Separation**: Maintain clear boundaries between domains
6. **Documentation**: Each major directory should have a README.md explaining its purpose

## Root Directory Structure

```
/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Auth-related pages
│   ├── (marketing)/         # Marketing pages
│   ├── (platform)/          # Platform pages
│   ├── api/                 # API routes
│   └── ...                  # Other app directories
├── components/              # Shared components
│   ├── [domain]/            # Domain-specific components
│   ├── ui/                  # UI components
│   ├── providers/           # Context providers
│   └── ...                  # Other global components
├── hooks/                   # Custom React hooks
├── lib/                     # Non-React code
│   ├── [domain]/            # Domain business logic
│   ├── utils/               # Shared utilities
│   └── ...                  # Other non-React code
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # Global TypeScript types
```

## Components Directory Structure

```
/components
├── [domain]/                 # Domain-specific components
│   ├── ui/                   # Domain-specific UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── [component].tsx       # Domain-specific components
│   └── index.ts              # Barrel exports
├── ui/                       # Shared UI components
│   ├── core/                 # Foundational UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   ├── composite/            # Composed UI components
│   │   ├── [component].tsx   # Individual components
│   │   └── index.ts          # Barrel exports
│   └── index.ts              # Barrel exports
└── providers/                # Context providers
    ├── [provider].tsx        # Individual providers
    └── index.ts              # Barrel exports
```

## App Directory Structure

```
/app
├── (auth)/                  # Authentication route group
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   └── ...                  # Other auth pages
├── (marketing)/             # Marketing route group
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   └── ...                  # Other marketing pages
├── (platform)/              # Platform route group
│   ├── dashboard/           # Dashboard page
│   ├── profile/             # Profile page
│   └── ...                  # Other platform pages
└── api/                     # API routes
    ├── [domain]/            # Domain-specific API routes
    │   └── route.ts         # Route handler
    └── ...                  # Other API routes
```

## Library Directory Structure

```
/lib
├── [domain]/                # Domain business logic
│   ├── actions.ts           # Server actions
│   ├── api.ts               # API client functions
│   ├── schemas.ts           # Zod schemas
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Domain utilities
├── utils/                   # Shared utilities
│   ├── [utility].ts         # Individual utilities
│   └── index.ts             # Barrel exports
└── constants/               # Global constants
    ├── [constant].ts        # Individual constants
    └── index.ts             # Barrel exports
```

## Hooks Directory Structure

```
/hooks
├── [domain]/                # Domain-specific hooks
│   ├── use-[hook-name].ts   # Individual hooks
│   └── index.ts             # Barrel exports
├── use-[hook-name].ts       # Global hooks
└── index.ts                 # Barrel exports
```

## Naming Conventions

### Files

- React Components: `kebab-case.tsx` (e.g., `builder-card.tsx`)
- Utility Functions: `kebab-case.ts` (e.g., `date-utils.ts`)
- Types/Interfaces: `kebab-case.ts` (e.g., `user-types.ts`)
- Barrel Exports: `index.ts`
- API Routes: `route.ts`
- Server Actions: `actions.ts`
- Constants: `constants.ts` or `[domain]-constants.ts`

### Directories

- Feature/Domain Directories: `kebab-case` (e.g., `marketplace`)
- Route Groups: `(kebab-case)` (e.g., `(platform)`)
- Dynamic Routes: `[kebab-case]` (e.g., `[builderId]`)

### TypeScript

- Component Names: `PascalCase` (e.g., `BuilderCard`)
- Custom Hooks: `useKebabCase` (e.g., `useFormState`)
- Types/Interfaces: `PascalCase` (e.g., `UserProfile`)
- Constants: `UPPER_SNAKE_CASE` for unchanging values
- Functions: `camelCase` (e.g., `formatDate`)

## Import Standards

### Use Barrel Exports

```typescript
// Preferred
import { Button, Card } from "@/components/ui";
import { BuilderCard } from "@/components/marketplace";

// Avoid
import { Button } from "@/components/ui/button";
import { BuilderCard } from "@/components/marketplace/builder-card";
```

### Import Order

Organize imports in the following order:

```typescript
// 1. External libraries
import { useState } from 'react';
import { motion } from 'framer-motion';

// 2. Internal modules (with blank line separation)
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

// 3. Internal components (with blank line separation)
import { Button } from '@/components/ui';
import { ValidationTierBadge } from '@/components/profile';

// 4. Types (with blank line separation)
import type { UserProfile } from '@/types/user';
```

## Best Practices

### Domain Organization

1. **Domain Boundaries**: Keep domain logic isolated, minimize cross-domain dependencies
2. **Colocate Related Files**: Keep related files together (component + types + tests)
3. **Minimal Subdirectories**: Don't create subdirectories for very few files
4. **Common Pattern Recognition**: Move repeated patterns to shared locations
5. **README-Driven Development**: Document directory purpose in a README.md

### Component Organization

1. **UI Separation**: Keep UI components separate from business logic
2. **Composability**: Build larger components from smaller ones
3. **Reusability**: Abstract reusable patterns into shared components
4. **Responsibility Isolation**: Each component should have a single responsibility
5. **Progressive Enhancement**: Design components to function without JavaScript when possible

## Implementation Guidelines

When implementing this structure:

1. **Start with Standards**: Begin with standardizing the most-used directories first
2. **Incremental Changes**: Refactor one directory at a time
3. **Update References**: Make sure to update all import references
4. **Documentation**: Add/update documentation as you go
5. **Tests**: Update tests to reflect new structure
6. **Consistent Migration**: Follow the same patterns across all refactoring

## Component vs. Application Code

- **Components**: Self-contained, reusable UI elements
- **Application Code**: Business logic, data fetching, state management
- **Separation of Concerns**: UI rendering vs. business logic
- **Testability**: Components should be testable in isolation

## Further Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app/building-your-application/routing)
- [React Official Style Guide](https://react.dev/learn/thinking-in-react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
