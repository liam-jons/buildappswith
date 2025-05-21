# API Response Type Standardization

## Overview

This document outlines the strategy for standardizing API response types across all domains of the platform. The primary goal is to create a consistent, predictable structure for API responses that ensures type safety while following REST best practices.

## Current Issues

1. **Inconsistent response formats:**
   - Some endpoints return raw data objects
   - Others return `{ success: boolean, data: T }`
   - Others use `{ data: T, message?: string }`

2. **Inconsistent error handling:**
   - Error structures vary between endpoints
   - Inconsistent status code usage
   - Lack of typed error responses

3. **Missing type definitions:**
   - Many API responses lack proper TypeScript interfaces
   - Reused response types are defined multiple times

4. **Inconsistent naming:**
   - Different property names for similar concepts (`profile` vs `data`)
   - Inconsistent property naming across domains

## Standardized API Response Patterns

### 1. Core API Response Types

```typescript
// lib/types/api-types.ts

/**
 * Base API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Standard API response structure for all endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * Paginated response for list endpoints
 */
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

/**
 * Helper type for paginated API responses
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedResponse<T>>;
```

### 2. Domain-Specific Response Types

```typescript
// lib/profile/types.ts

import { ApiResponse, PaginatedApiResponse } from '../types/api-types';
import { BuilderProfileData } from './types';

/**
 * Builder profile API response
 */
export type BuilderProfileResponse = ApiResponse<BuilderProfileData>;

/**
 * Multiple builder profiles API response
 */
export type BuilderProfilesResponse = PaginatedApiResponse<BuilderProfileData>;
```

### 3. Response Creation Utilities

```typescript
// lib/utils/api-utils.ts

import { ApiResponse, ApiError, PaginatedResponse } from '../types/api-types';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create an error API response
 */
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

/**
 * Create a paginated API response
 */
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

## Error Handling and Status Codes

### Standard Error Codes

| Domain        | Error Code Format     | Example               |
|---------------|------------------------|------------------------|
| Authentication | AUTH_ERROR_TYPE       | AUTH_UNAUTHORIZED     |
| Validation    | VALIDATION_ERROR_TYPE | VALIDATION_INVALID_DATA |
| Resource      | RESOURCE_ERROR_TYPE   | RESOURCE_NOT_FOUND    |
| Server        | SERVER_ERROR_TYPE     | SERVER_DATABASE_ERROR |

### Status Code Mapping

| Error Type                | HTTP Status Code |
|---------------------------|-----------------|
| Authentication errors     | 401, 403        |
| Validation errors         | 400             |
| Resource not found        | 404             |
| Request conflicts         | 409             |
| Server errors             | 500             |

### Domain-Specific Error Utilities

```typescript
// lib/auth/errors.ts

import { createErrorResponse } from '../utils/api-utils';

export enum AuthErrorCode {
  UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  FORBIDDEN = 'AUTH_FORBIDDEN',
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  RATE_LIMITED = 'AUTH_RATE_LIMITED'
}

export function createAuthError(code: AuthErrorCode, message: string) {
  return createErrorResponse(code, message);
}

// Similar pattern for other domains
```

## Implementation Plan for API Routes

### 1. Route Handler Structure

```typescript
// Standard API route handler pattern
export async function GET(req: Request) {
  try {
    // 1. Validate input
    const { searchParams } = new URL(req.url);
    const validatedParams = validateParams(searchParams);
    if (!validatedParams.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_INVALID_PARAMS', validatedParams.error.message),
        { status: 400 }
      );
    }
    
    // 2. Process request
    const data = await someService.getData(validatedParams.data);
    
    // 3. Return standardized response
    return NextResponse.json(createSuccessResponse(data));
  } catch (error) {
    // 4. Handle errors consistently
    return handleApiError(error);
  }
}
```

### 2. Error Handling Middleware

```typescript
// lib/middleware/error-handling.ts

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { createErrorResponse } from '../utils/api-utils';

export function handleApiError(error: unknown) {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      createErrorResponse('VALIDATION_ERROR', 'Invalid data format', { 
        issues: error.issues 
      }),
      { status: 400 }
    );
  }
  
  // Handle Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle specific Prisma errors (e.g., P2002 unique constraint violation)
    if (error.code === 'P2002') {
      return NextResponse.json(
        createErrorResponse('RESOURCE_DUPLICATE', 'Resource already exists'),
        { status: 409 }
      );
    }
    
    // Handle other Prisma errors
    return NextResponse.json(
      createErrorResponse('DATABASE_ERROR', 'Database operation failed'),
      { status: 500 }
    );
  }
  
  // Handle custom domain errors
  // ...
  
  // Handle generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    createErrorResponse('SERVER_ERROR', message),
    { status: 500 }
  );
}
```

## Conversion Plan for Existing Endpoints

1. **Phase 1: Core Utilities**
   - Implement the core API response types
   - Create response utilities
   - Implement error handling middleware

2. **Phase 2: Domain-Specific Adoption**
   - Update auth domain endpoints
   - Update profile domain endpoints
   - Update marketplace domain endpoints
   - Update scheduling domain endpoints

3. **Phase 3: Client Integration**
   - Update client-side API fetching to use standardized types
   - Implement client-side error handling based on standard response structure

## Example API Route Conversions

### Before:

```typescript
// Before standardization
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const profile = await getBuilderProfileById(params.id);
    if (!profile) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### After:

```typescript
// After standardization
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const profile = await getBuilderProfileById(params.id);
    if (!profile) {
      return NextResponse.json(
        createErrorResponse('RESOURCE_NOT_FOUND', 'Builder profile not found'),
        { status: 404 }
      );
    }
    return NextResponse.json(createSuccessResponse(profile));
  } catch (error) {
    return handleApiError(error);
  }
}
```

## Impact Analysis

### Benefits:

1. **Improved Developer Experience**:
   - Consistent API response structures
   - Predictable error handling
   - Better TypeScript autocompletion

2. **Reduced Type Errors**:
   - Standardized types eliminate mismatches
   - Clear interfaces reduce type confusion
   - Proper null/undefined handling

3. **Better Client Integration**:
   - Consistent client-side error handling
   - Predictable response parsing
   - Easier API documentation

### Implementation Cost:

- **High-impact files to modify**: ~25-30 API route handlers
- **Core utility files to create**: 3-5 new utility files
- **Estimated time**: 3-4 days of dedicated effort