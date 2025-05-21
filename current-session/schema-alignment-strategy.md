# Schema Type Alignment Strategy

## Overview

This document outlines the strategy for aligning database schema with TypeScript types across the platform. The goal is to create a consistent mapping between Prisma models and domain-specific types to eliminate type errors and enforce proper data validation.

## Key Issues Identified

1. **Field naming inconsistencies:**
   - `adhd_focus` (in DB) vs `adhdFocus` (in code)
   - `image` vs `imageUrl` inconsistency
   - `user` relation access pattern inconsistencies

2. **Null/undefined handling:**
   - Prisma uses `null` for optional values vs TypeScript preferring `undefined`
   - Color property: `string | null` vs `string | undefined`

3. **Decimal type handling:**
   - Prisma's `Decimal` type needs mapping to TypeScript `number`

4. **Relation selection mismatches:**
   - Missing `include` or invalid `select` statements
   - Incorrect property access on loaded relations

5. **JSON field typing:**
   - Lack of specific typing for JSON stored fields
   - Inconsistent serialization/deserialization

## Core Principles

1. **Source of Truth**:
   - Prisma schema is the authoritative source for data structure
   - Domain types should align with but extend Prisma types

2. **Clear Type Boundaries**:
   - Internal/database types vs API/client-facing types
   - Explicit conversion between these boundaries

3. **Consistent Naming**:
   - Snake_case for database fields when required by convention
   - CamelCase for TypeScript
   - Explicit mapping in conversion functions

4. **Standardized Nullability**:
   - Clear patterns for optional values
   - Consistent use of null vs undefined

## Implementation Strategy

### 1. Create Base Types from Prisma Schema

```typescript
// lib/types/prisma-types.ts

import { Prisma, BookingStatus, ValidationTier } from '@prisma/client';

// Re-export Prisma's generated enums
export { BookingStatus, ValidationTier } from '@prisma/client';

// Define base types from Prisma models
export type BuilderProfileBase = Prisma.BuilderProfileGetPayload<{
  select: {
    id: true;
    userId: true;
    bio: true;
    headline: true;
    // Include all fields from the model
  }
}>;

export type BookingBase = Prisma.BookingGetPayload<{
  select: {
    id: true;
    builderId: true;
    clientId: true;
    // Include all fields from the model
  }
}>;

// etc. for other models
```

### 2. Create Type Conversion Utilities

```typescript
// lib/utils/type-converters.ts

import { Decimal } from '@prisma/client/runtime/library';
import { BuilderProfileBase } from '../types/prisma-types';
import { BuilderProfileData } from '../profile/types';

// Convert Decimal to number
export function decimalToNumber(value: Decimal | null): number | undefined {
  if (value === null) return undefined;
  return parseFloat(value.toString());
}

// Convert snake_case to camelCase
export function formatBuilderProfile(profile: BuilderProfileBase): BuilderProfileData {
  return {
    id: profile.id,
    // Direct mappings
    bio: profile.bio || undefined,
    headline: profile.headline || undefined,
    // Name conversion
    adhdFocus: profile.adhd_focus,
    // Decimal conversion
    hourlyRate: profile.hourlyRate ? decimalToNumber(profile.hourlyRate) : undefined,
    // Include all required fields
  };
}
```

### 3. Standardize Relation Loading

```typescript
// lib/profile/data-service.ts

import { db } from '../db';
import { formatBuilderProfile } from '../utils/type-converters';

export async function getBuilderProfile(id: string) {
  const profile = await db.builderProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        }
      },
      skills: {
        include: {
          skill: true,
        }
      }
    }
  });

  if (!profile) return null;

  // Format the builder profile with related data
  return formatBuilderProfile(profile);
}
```

### 4. Type Guard Utilities

```typescript
// lib/utils/type-guards.ts

import { BuilderProfileData } from '../profile/types';

// Type guards for runtime checking
export function isBuilderProfile(obj: any): obj is BuilderProfileData {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.adhd_focus === 'boolean'
  );
}
```

### 5. API Response Wrappers

```typescript
// lib/types/api-types.ts

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Type-safe response creator
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function createErrorResponse(code: string, message: string): ApiResponse<never> {
  return { success: false, error: { code, message } };
}
```

## Schema Mapping Table

| Prisma Field | TypeScript Field | Notes |
|--------------|------------------|-------|
| adhd_focus   | adhdFocus        | Snake to camel conversion |
| hourlyRate   | hourlyRate       | Decimal to number conversion |
| image        | imageUrl         | Standardizing image URL fields |
| ValidationTier | ValidationTier | Enum standardization |
| JSON fields  | Typed interfaces | Custom type definitions |

## Implementation Priority

1. Create base type conversion utilities
2. Implement API response wrappers 
3. Update DB access patterns in profile domain
4. Update DB access patterns in marketplace domain
5. Update DB access patterns in scheduling domain
6. Update DB access patterns in auth domain

## Example Fixes

### Fix for adhd_focus vs adhdFocus

```typescript
// BEFORE
const profile = {
  adhdFocus: builderProfile.adhdFocus, // Error
};

// AFTER
const profile = {
  adhdFocus: builderProfile.adhd_focus,
};

// OR better with type converter
const profile = formatBuilderProfile(builderProfile);
```

### Fix for skills relationship

```typescript
// BEFORE
const formattedSkills = builderProfile.skills.map(skill => ({ // Error
  id: skill.id,
  // ...
}));

// AFTER
const builderProfile = await db.builderProfile.findUnique({
  where: { id },
  include: { 
    skills: {
      include: { skill: true }
    }
  }
});

const formattedSkills = builderProfile.skills.map(skill => ({
  id: skill.id,
  // ...
}));
```