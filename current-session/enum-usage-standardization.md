# Enum Usage Standardization

## Overview

This document outlines the strategy for standardizing enum usage across the platform. The goal is to create a consistent approach to using enums that ensures type safety, alignment with the database schema, and clear domain separation.

## Current Issues

1. **Inconsistent enum definitions:**
   - Same enums defined in multiple places (e.g., `UserRole` in profile/types.ts and auth/types.ts)
   - Enum values don't match database representations

2. **String literal types vs enums:**
   - Mixture of string literals and enum values
   - Inconsistent type checking between literal types and enums

3. **Enum value format differences:**
   - Some domains use UPPERCASE_WITH_UNDERSCORES
   - Others use PascalCase
   - Others use lowercase

4. **Import/export inconsistencies:**
   - Some enums are re-exported from Prisma
   - Others are defined manually
   - Others are imported from another domain

## Standardization Principles

### 1. Single Source of Truth

- Each enum should have a single authoritative definition
- Prisma-based enums should be re-exported from a central location
- Domain-specific enums should live in their domain's types.ts file

### 2. Naming Conventions

- **Enum names:** PascalCase singular noun (e.g., `UserRole`, `BookingStatus`)
- **Enum values:** UPPERCASE_WITH_UNDERSCORES for consistency with database
- **String literals:** lowercase for client-facing values when needed

### 3. Type Safety

- Prefer TypeScript enums over string literals for internal use
- Use string literal union types only for component props or API params
- Provide converters between internal enums and external string representations

### 4. Barrel Exports

- Export enums from domain-specific barrel files
- Re-export common enums from a central location
- Organize imports to avoid circular dependencies

## Implementation Strategy

### 1. Create a Central Enum Registry

```typescript
// lib/types/enums.ts

/**
 * Re-export all database enums from Prisma client
 */
export {
  UserRole,
  BookingStatus,
  PaymentStatus,
  AppStatus,
  SkillStatus,
  ResourceType,
  ProjectStatus,
  ProgressStatus,
  CompletionMethod
} from '@prisma/client';

/**
 * Define string literal types for client usage where needed
 * (Only when a different representation is required)
 */
export type UserRoleString = 'admin' | 'builder' | 'client';
export type BookingStatusString = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Converters between enum values and string literals
 */
export function userRoleToString(role: UserRole): UserRoleString {
  return role.toLowerCase() as UserRoleString;
}

export function stringToUserRole(role: UserRoleString): UserRole {
  return role.toUpperCase() as UserRole;
}
```

### 2. Define Domain-Specific Enums

```typescript
// lib/profile/types.ts

import { UserRole as PrismaUserRole } from '@prisma/client';

/**
 * Re-export database enums relevant to this domain
 */
export { PrismaUserRole as UserRole };

/**
 * Domain-specific enums not in database
 */
export enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  NETWORK_ONLY = 'NETWORK_ONLY'
}

/**
 * String literal conversion for UI components
 */
export type ProfileVisibilityString = 'public' | 'private' | 'network-only';

/**
 * Conversion utility
 */
export function profileVisibilityToString(visibility: ProfileVisibility): ProfileVisibilityString {
  switch (visibility) {
    case ProfileVisibility.PUBLIC: return 'public';
    case ProfileVisibility.PRIVATE: return 'private';
    case ProfileVisibility.NETWORK_ONLY: return 'network-only';
  }
}
```

### 3. Standardize ValidationTier Enum

```typescript
// lib/trust/types.ts

/**
 * Validation tier enum (this is the authoritative source)
 */
export enum ValidationTier {
  ENTRY = 1,
  ESTABLISHED = 2,
  EXPERT = 3
}

// lib/profile/types.ts

/**
 * Import and re-export ValidationTier from trust domain
 */
export { ValidationTier } from '@/lib/trust/types';
```

### 4. Zod Schema Integration

```typescript
// lib/profile/schemas.ts

import { z } from 'zod';
import { UserRole, ValidationTier } from './types';

/**
 * Create Zod validators for enum values
 */
export const userRoleSchema = z.nativeEnum(UserRole);
export const validationTierSchema = z.nativeEnum(ValidationTier);

/**
 * Use in input validation
 */
export const profileUpdateSchema = z.object({
  // ...other fields
  roles: z.array(userRoleSchema).optional(),
  validationTier: validationTierSchema.optional(),
});
```

### 5. Create Type Guards

```typescript
// lib/utils/type-guards.ts

import { UserRole, ValidationTier } from '@/lib/types/enums';

/**
 * Type guards for runtime checking
 */
export function isUserRole(value: any): value is UserRole {
  return Object.values(UserRole).includes(value);
}

export function isValidationTier(value: any): value is ValidationTier {
  return Object.values(ValidationTier).includes(value);
}
```

## Implementation Plan for Specific Enums

### UserRole Standardization

1. Use central definition from Prisma
2. Remove duplicate definitions in auth/types.ts and profile/types.ts
3. Create string literal type for UI components
4. Add conversion utilities

### ValidationTier Standardization

1. Keep authoritative definition in trust/types.ts
2. Import and re-export in profile/types.ts
3. Update all imports to point to the right source

### BookingStatus Standardization

1. Use central definition from Prisma
2. Create string literal type for UI components
3. Update all comparisons to use enum values
4. Add conversion utilities

## Example Fixes

### Before:

```typescript
// Using string literals directly
if (booking.status === 'pending') {
  // Do something
}

// Multiple enum definitions
// In profile/types.ts
export enum UserRole {
  CLIENT = "CLIENT",
  BUILDER = "BUILDER",
  ADMIN = "ADMIN"
}

// In auth/types.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  BUILDER = 'BUILDER',
  CLIENT = 'CLIENT',
}

// ValidationTier mismatch
// In trust/types.ts
export enum ValidationTier {
  ENTRY = 1,
  ESTABLISHED = 2,
  EXPERT = 3
}

// In profile/types.ts
export enum ValidationTier {
  Entry = 1,
  Established = 2,
  Expert = 3
}
```

### After:

```typescript
// Using enum values
import { BookingStatus } from '@prisma/client';

if (booking.status === BookingStatus.PENDING) {
  // Do something
}

// Single enum definition 
// In lib/types/enums.ts
export { UserRole } from '@prisma/client';

// In profile/types.ts
import { UserRole } from '@/lib/types/enums';

// ValidationTier standardization
// In trust/types.ts (single source)
export enum ValidationTier {
  ENTRY = 1,
  ESTABLISHED = 2,
  EXPERT = 3
}

// In profile/types.ts
export { ValidationTier } from '@/lib/trust/types';
```

## UI Component Considerations

For UI components that display enum values:

```typescript
// Component prop types
interface StatusBadgeProps {
  status: BookingStatusString; // Using string literals for component props
}

// Usage with conversion
import { bookingStatusToString } from '@/lib/utils/enum-converters';

<StatusBadge status={bookingStatusToString(booking.status)} />
```

## Impact Analysis

### Benefits:

1. **Single source of truth**:
   - Eliminates duplicate definitions
   - Ensures consistent values across codebase

2. **Type safety**:
   - Prevents invalid enum values
   - Enables better compile-time checking

3. **Database alignment**:
   - Ensures TypeScript enums match database enums
   - Reduces runtime errors from mismatched values

4. **Clear intent**:
   - Distinguishes between internal enum usage and display values
   - Makes code more maintainable

### Implementation Cost:

- **High-impact files to modify**: ~10-15 files with enum definitions
- **Core utility files to create**: 1-2 new utility files
- **Estimated time**: 1-2 days of dedicated effort