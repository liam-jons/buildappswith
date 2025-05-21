# Session Context

- **Session Type**: Implementation - TypeScript Error Resolution Phase 1 (Day 1)
- **Focus Areas**: Core Type Utilities and Prisma Schema Alignment
- **Current Branch**: feature/type-checking
- **Related Documentation**: 
  - current-session/schema-alignment-strategy.md
  - current-session/api-response-type-standardization.md
  - current-session/type-system-improvement-summary.md
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

## Project Background

The buildappswith platform currently has 362 TypeScript errors across 104 files that are blocking deployment. After careful analysis, we've developed a comprehensive plan to systematically resolve these errors by addressing root causes rather than individual symptoms. We'll follow a domain-first approach with the marketplace domain as the golden standard for organization.

This session focuses on implementing the first day of our planned roadmap: establishing core type utilities and aligning Prisma schema with TypeScript types.

## Implementation Objectives

1. **Create Base Types from Prisma Schema**
   - Create type definitions based directly on Prisma schema
   - Establish clear mapping between database and TypeScript types
   - Implement type conversion utilities

2. **Implement API Response Type Standardization**
   - Define consistent API response interfaces
   - Create response creation utilities
   - Update error handling utilities

## Implementation Plan

### 1. Create Base Types from Prisma Schema

- Create a new directory `lib/types` if it doesn't exist
- Implement `lib/types/prisma-types.ts` with:
  - Base types derived from Prisma models
  - Re-exports of Prisma enums
  - Type definitions for JSON fields

- Implement `lib/utils/type-converters.ts` with:
  - Decimal to number conversion utilities
  - snake_case to camelCase field mapping
  - Type-safe relation handling

### 2. Implement API Response Types

- Create `lib/types/api-types.ts` with:
  - Standard API response interface
  - Error type definitions
  - Paginated response interfaces

- Create `lib/utils/api-utils.ts` with:
  - Success response creation function
  - Error response creation function
  - Paginated response utilities

- Update `lib/middleware/error-handling.ts` to use standardized error types

## Technical Specifications

### Prisma Type Mapping

```typescript
// lib/types/prisma-types.ts
import { Prisma } from '@prisma/client';

// Re-export Prisma's generated enums
export { 
  UserRole, 
  BookingStatus, 
  PaymentStatus, 
  AppStatus, 
  SkillStatus, 
  ProjectStatus 
} from '@prisma/client';

// Define base types from Prisma models
export type BuilderProfileBase = Prisma.BuilderProfileGetPayload<{
  select: {
    id: true;
    userId: true;
    bio: true;
    headline: true;
    hourlyRate: true;
    // Include all fields from the model
  }
}>;

// Additional base types for other models
```

### Type Conversion Utilities

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
    bio: profile.bio || undefined,
    headline: profile.headline || undefined,
    adhdFocus: profile.adhd_focus,
    hourlyRate: profile.hourlyRate ? decimalToNumber(profile.hourlyRate) : undefined,
    // Include all required fields
  };
}
```

### API Response Types

```typescript
// lib/types/api-types.ts

// Base API error structure
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Standard API response structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// Paginated response for list endpoints
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  }
}

// Helper type for paginated API responses
export type PaginatedApiResponse<T> = ApiResponse<PaginatedResponse<T>>;
```

### API Response Utilities

```typescript
// lib/utils/api-utils.ts
import { ApiResponse, ApiError, PaginatedResponse } from '../types/api-types';

// Create a successful API response
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

// Create an error API response
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details }
  };
}

// Create a paginated API response
export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  };
}
```

## Implementation Notes

1. **Backwards Compatibility**: Ensure all type changes maintain compatibility with existing code. Add interfaces rather than modify existing ones when possible.

2. **Documentation**: Add JSDoc comments to all exported types and functions explaining their purpose and usage.

3. **Naming Conventions**: Follow these naming patterns:
   - Base types from Prisma: `[Model]Base`
   - Formatted types for API: `[Model]Data`
   - Response types: `[Model]Response`

4. **Type Safety**: Ensure all conversion functions are fully type-safe, with appropriate parameter and return types.

5. **Testing**: Verify type imports work correctly after implementation by testing in a few key files.

## Error Patterns to Fix

The implementation should specifically address these error patterns:

1. Prisma field access errors:
   - `Property 'adhd_focus' does not exist on type` → Fix with proper field mapping
   - `Property 'skills' does not exist on type` → Fix with proper relation includes

2. Decimal conversion errors:
   - `Type 'Decimal' is not assignable to type 'number'` → Fix with decimal conversion utilities

3. API response inconsistencies:
   - `Property 'success' does not exist on type` → Fix with standardized response types

## Verification Steps

After implementation, perform these verification steps:

1. Run targeted type checking on implemented modules:
   ```bash
   pnpm tsc --noEmit --skipLibCheck --project tsconfig.json --filter=lib/types
   ```

2. Verify imports work in a key file:
   ```typescript
   // Test in a single file
   import { formatBuilderProfile } from '@/lib/utils/type-converters';
   import { createSuccessResponse } from '@/lib/utils/api-utils';
   ```

3. Count remaining errors to track progress:
   ```bash
   pnpm type-check | grep "error TS" | wc -l
   ```

## Suggested File Changes

Here's a list of files to create or modify:

1. Create: `lib/types/prisma-types.ts`
2. Create: `lib/utils/type-converters.ts`
3. Create: `lib/types/api-types.ts`
4. Create: `lib/utils/api-utils.ts`
5. Update: `lib/middleware/error-handling.ts`

## Implementation Scope

This session focuses only on the core type utilities and should NOT include:
- Component prop interface changes
- Enum standardization (scheduled for Day 2)
- Auth context alignment (scheduled for Day 2)
- Changes to domain-specific types (scheduled for Days 3-5)

## Next Session Planning

At the end of this session, create a prompt for the next implementation session covering Phase 1, Day 2:
- Enum Usage Standardization
- Auth Context Type Alignment

The prompt should follow this same template but focus on those specific areas, with technical specifications adapted from our planning documents.

## Connection Information

You have access to our Neon dev database for verification if needed:
- Use `DATABASE_URL` environment variable for database operations
- For testing schema alignment, you can query the database to verify field names
- Remember to use appropriate transactions for any test operations

## Expected Outcomes

By the end of this session, we should have:
- Core type utilities implemented and documented
- Clear mapping between Prisma schema and TypeScript types
- Standardized API response types and utilities
- Estimated 50-80 fewer TypeScript errors
- Foundation established for domain-specific implementations