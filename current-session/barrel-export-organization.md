# Barrel Export Organization Strategy

## Overview

This document outlines the strategy for organizing barrel exports across the platform. The goal is to create a consistent, maintainable approach to module exports that avoids circular dependencies, provides clear boundaries between domains, and facilitates better TypeScript type inference.

## Current Issues

1. **Duplicate exports:**
   - Same type or function exported from multiple barrel files
   - Inconsistent re-exporting patterns

2. **Circular dependencies:**
   - Interdependent modules causing import cycles
   - Hard to trace dependency chains

3. **Missing exports:**
   - Types or functions not exported from barrel files
   - Inconsistent export patterns across domains

4. **Inconsistent organization:**
   - Some domains use single barrel files
   - Others use nested barrel structure
   - Some mix direct and re-exported items

5. **Type vs. Value exports:**
   - Lack of clear pattern for exporting types vs. values
   - Inconsistent use of `export type` vs. `export`

## Standardization Principles

### 1. Domain-Driven Organization

- Each domain has its own barrel file structure
- Core domains: auth, profile, marketplace, scheduling, trust, etc.
- UI and utility domains: ui, utils, hooks, etc.

### 2. Hierarchical Export Structure

- Top-level barrel file for each domain
- Subdomain barrel files where appropriate
- Clear separation of concerns

### 3. Export Type Clarity

- Use `export type` for type-only exports
- Use regular `export` for values and combined exports
- Group similar exports together

### 4. Client/Server Boundary Enforcement

- Separate client and server exports where appropriate
- Use `.server.ts` and `.client.ts` file extensions
- Prevent accidental server imports in client code

### 5. Explicit Re-Exports

- Clearly document re-exports from other domains
- Minimize cross-domain re-exports
- Use named imports/exports for clarity

## Implementation Strategy

### 1. Domain Barrel Structure

```
lib/
  ├── auth/
  │   ├── index.ts            # Main barrel export
  │   ├── server.ts           # Server-only exports
  │   ├── client.ts           # Client-only exports
  │   ├── actions.ts          # Server actions
  │   ├── api.ts              # API utilities
  │   ├── types.ts            # Type definitions
  │   └── utils.ts            # Utilities
  ├── profile/
  │   ├── index.ts
  │   ├── ...
  │   └── types.ts
  └── ...
```

### 2. Core Domain Barrel File Pattern

```typescript
/**
 * [Domain] barrel export file
 * Version: x.y.z
 * 
 * Main entry point for [Domain] functionality.
 * Follows domain-driven architecture with clear boundaries.
 */

// Export all public functionality
export * from './actions';
export * from './api';
export * from './utils';

// Export type definitions
export type * from './types';

// Re-export server-only functionality
// Note: these should only be imported from server contexts
export * from './server';

// Specific named exports for clarity
export { specificFunction, anotherFunction } from './specific-file';
```

### 3. Client/Server Boundary Pattern

```typescript
// lib/auth/index.ts - Main barrel
export * from './client';  // Safe for both client and server
export * from './types';   // Type definitions safe for both

// Only import server.ts in server components/files
// This is not re-exported to avoid accidental client usage

// lib/auth/server.ts - Server-only exports
/**
 * @file Server-only authentication utilities
 * @warning DO NOT IMPORT IN CLIENT COMPONENTS
 */
export * from './api-protection';
export * from './server-auth';

// lib/auth/client.ts - Client-only exports
/**
 * @file Client-side authentication utilities
 * Safe to use in both client and server components
 */
export * from './hooks';
export * from './client-auth';
```

### 4. Component Barrel Structure

```
components/
  ├── profile/
  │   ├── index.ts           # Main barrel export
  │   ├── builder-profile.tsx
  │   ├── client-profile.tsx
  │   ├── types.ts           # Component-specific types
  │   └── ui/                # UI subcomponents
  │       ├── index.ts       # UI barrel export
  │       ├── profile-card.tsx
  │       └── ...
  └── ...
```

### 5. Component Barrel File Pattern

```typescript
/**
 * Profile components barrel export file
 * Version: x.y.z
 * 
 * Main entry point for profile-related components.
 */

// Export main components
export { BuilderProfile } from './builder-profile';
export { ClientProfile } from './client-profile';
export { ProfileEdit } from './profile-edit';

// Export types for consumers
export type { 
  BuilderProfileProps, 
  ClientProfileProps, 
  ProfileEditProps 
} from './types';

// Re-export UI components
export * from './ui';
```

## Type Export Guidelines

### 1. Types vs. Values

```typescript
// Types only needed for type checking
export type UserRole = 'admin' | 'client' | 'builder';

// Values needed at runtime (also usable as types)
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// Export type-only when re-exporting from another module
export type { BuilderProfile } from '@/lib/profile/types';

// Export as value when needed for both runtime and type checking
export { ValidationTier } from '@/lib/trust/types';
```

### 2. Interface vs. Type Alias

```typescript
// Use interface for extensible object types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Use type alias for unions, intersections, and non-extensible types
export type UserIdentifier = string | number;
export type UserWithPermissions = UserProfile & { permissions: string[] };
```

### 3. Namespace Export

```typescript
// Group related types in a namespace
export namespace Profile {
  export interface Builder {
    // ...
  }
  
  export interface Client {
    // ...
  }
  
  export type Role = 'builder' | 'client';
}

// Usage
const profile: Profile.Builder = { /* ... */ };
```

## Circular Dependency Prevention

### 1. Dependency Direction

- Establish clear dependency direction: core → domain → feature
- Avoid bi-directional dependencies between modules
- Use dependency inversion when needed

### 2. Interface Extraction

- Extract shared interfaces to separate files
- Place common types in a neutral location

```typescript
// lib/types/shared.ts
export interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// lib/profile/types.ts
import { Entity } from '@/lib/types/shared';

export interface BuilderProfile extends Entity {
  // Builder-specific fields
}
```

### 3. Dependency Checking

- Use tools to detect circular dependencies
- Establish conventions for breaking cycles

## Implementation Plan

### 1. Phase 1: Core Structure

- Create consistent barrel file structure for each domain
- Establish client/server boundaries
- Document patterns and conventions

### 2. Phase 2: Component Organization

- Standardize component exports
- Align component type exports
- Ensure consistent naming

### 3. Phase 3: Type Organization

- Clean up type exports
- Standardize type re-exports
- Resolve any circular dependencies

## Example Fixes

### Before:

```typescript
// lib/auth/index.ts - Mixed exports with potential circular dependencies
export * from './api';
export * from './utils';
export * from './types';
export * from '../profile/auth-types'; // Problematic cross-domain import

// components/profile/index.ts - Inconsistent exports
export { BuilderProfile } from './builder-profile';
export { ClientProfile } from './client-profile';
// Missing type exports

// components/ui/index.ts - Overly flat structure
export * from './button';
export * from './card';
export * from './input';
export * from './avatar';
// 20+ more component exports
```

### After:

```typescript
// lib/auth/index.ts - Clean domain-specific exports
export * from './api';
export * from './utils';
export type * from './types';

// lib/profile/index.ts - Contains auth-related profile types
export type * from './types';
export * from './api';
export * from './utils';

// components/profile/index.ts - With type exports
export { BuilderProfile } from './builder-profile';
export { ClientProfile } from './client-profile';
export type { BuilderProfileProps, ClientProfileProps } from './types';

// components/ui/index.ts - Grouped by function
// Input components
export { Input, Textarea, Select, Checkbox } from './input';
// Button components
export { Button, IconButton } from './button';
// Display components
export { Card, Avatar } from './display';
```

## Verification Strategy

### 1. Static Analysis

- Use TypeScript compiler to verify exports
- Check for undefined exports
- Validate import resolution

### 2. Import Usage Validation

- Create tests for barrel exports
- Verify all exports are accessible
- Check for circular dependencies

### 3. Documentation

- Document export patterns
- Create examples of proper usage
- Establish style guide for barrel files

## Impact Analysis

### Benefits:

1. **Clearer code organization**:
   - Predictable import/export patterns
   - Easier to locate functionality

2. **Reduced circular dependencies**:
   - Faster build times
   - Fewer mysterious TypeScript errors

3. **Improved type safety**:
   - Proper type exports
   - Clear boundaries between domains

4. **Better developer experience**:
   - Consistent import patterns
   - Less confusion about where to find exports

### Implementation Cost:

- **High-impact files to modify**: ~20-30 barrel files
- **Documentation to create**: Export pattern guide
- **Estimated time**: 2-3 days of dedicated effort