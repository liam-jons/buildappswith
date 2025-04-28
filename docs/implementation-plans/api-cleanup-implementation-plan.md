# API Route Rationalization Implementation Plan

*Generated on: 2025-04-27*

## Overview

This implementation plan outlines the process for Phase 3 of the Buildappswith codebase cleanup: API Route Rationalization. Following the successful completion of Phase 1 (UI Component Cleanup) and Phase 2 (Authentication Cleanup), this phase focuses on systematically assessing and cleaning up API routes to improve maintainability and reduce technical debt.

## Current State Analysis

After examining the codebase and architecture reports, I've identified several issues with the current API implementation:

1. **Unused API Routes**: The unused components report identifies 35 potentially unused API routes (marked as "Page/route with no navigation links to it")
2. **Pattern Inconsistencies**: The architectural complexity report identifies 35 API endpoints with inconsistent folder structures
3. **Mock Data Dependencies**: Several API routes (like `/api/scheduling/session-types`) still rely on mock data with TODOs for database integration
4. **Duplicate Functionality**: Some API routes provide similar functionality or fetch similar data with slightly different formats
5. **Inconsistent Error Handling**: Different approaches to error handling and response formatting across routes

## Categorization of API Routes

Based on the analysis, I've categorized the API routes into four groups:

### 1. Actually Used API Routes

Routes that have clear client-side references and should be maintained:

- `/api/navigation` - Used in site-header.tsx
- `/api/scheduling/session-types` - Used in booking flow
- `/api/stripe/checkout` - Used in payment processing

### 2. Potentially Used Routes with Missing Client References

Routes that might be used but no clear references were found:

- `/api/profiles/builder` - Likely used in builder profile pages
- `/api/marketplace/builders` - Likely used in marketplace pages
- `/api/scheduling/availability-rules` - Likely used in scheduling components

### 3. Developer/Test Routes

Routes created for development and testing purposes that can be safely removed:

- `/api/sentry-example-api` - Explicit test route
- `/api/dev/create-liam-profile` - Developer utility
- `/api/dev/login` - Developer utility
- `/api/dev/seed-users` - Developer utility
- `/api/test/auth` - Test route

### 4. Redundant or Unused Routes

Routes that appear to be unused or have duplicate functionality:

- Legacy route patterns (`/api/scheduling/profiles/client/[id]` vs `/api/profiles/client/[id]`)
- Outdated API implementations that were replaced during Auth cleanup
- Routes that are marked as "Page/route with no navigation links to it" in the analysis

## Cleanup Strategy

The API route rationalization will proceed with the following steps:

### Step 1: Verify Usage

For each potentially unused route, verify actual usage by:

1. Checking for direct imports or references in client-side code
2. Examining network traffic in the application
3. Reviewing related components that might use the API
4. Checking for dynamic imports or string-based fetch calls

### Step 2: Documentation

For each route identified for cleanup, document:

1. Current functionality and purpose
2. Why it's being removed (unused, redundant, etc.)
3. Any alternative APIs that provide similar functionality
4. Migration path for any dependent code (if applicable)

### Step 3: Prioritized Removal

Remove routes in the following order:

1. Clear development/test routes
2. Duplicate or redundant routes
3. Unused routes with no references
4. Routes with low complexity and limited dependencies

### Step 4: Refactoring

For remaining routes that are necessary but have issues:

1. Standardize error handling and response formatting
2. Complete TODOs for database integration
3. Consolidate similar functionality
4. Improve test coverage

## Implementation Plan

### Phase 3.1: Development/Test Routes Cleanup

Remove the following routes:

```
/app/api/sentry-example-api/route.ts
/app/api/dev/create-liam-profile/route.ts
/app/api/dev/login/route.ts
/app/api/dev/seed-users/route.ts
/app/api/test/auth/route.ts
```

### Phase 3.2: Unused Routes Verification and Cleanup

For each potentially unused route:

1. Check for client-side references
2. If no references exist, add to removal list
3. Document in a cleanup summary

Routes to verify and potentially remove:

```
/app/api/admin/builders/route.ts
/app/api/admin/session-types/route.ts
/app/api/admin/builders/prototype/route.ts
/app/api/admin/session-types/[id]/route.ts
/app/api/admin/session-types/[id]/status/route.ts
/app/api/apps/[builderId]/route.ts
/app/api/apps/edit/[id]/route.ts
/app/api/marketplace/builders/route.ts
/app/api/marketplace/featured/route.ts
/app/api/marketplace/filters/route.ts
/app/api/marketplace/builders/[id]/route.ts
/app/api/profiles/builder/route.ts
/app/api/profiles/user/route.ts
/app/api/scheduling/availability-exceptions/route.ts
/app/api/scheduling/availability-rules/route.ts
/app/api/scheduling/builder-settings/route.ts
/app/api/scheduling/bookings/route.ts
/app/api/scheduling/bookings/[id]/route.ts
/app/api/scheduling/session-types/[id]/route.ts
/app/api/scheduling/availability/rules/route.ts
/app/api/scheduling/availability/time-slots/route.ts
/app/api/scheduling/profiles/builder/[id]/route.ts
/app/api/scheduling/profiles/client/[id]/route.ts
```

### Phase 3.3: Standardization of Remaining Routes

For routes that are to be kept:

1. Implement consistent error handling
2. Standardize response formats
3. Ensure proper authentication and authorization
4. Add or improve documentation

### Phase 3.4: Testing and Verification

1. Create comprehensive tests for remaining routes
2. Verify application functionality with removed routes
3. Update documentation to reflect changes

## Implementation Details

### Error Handling Standard

All API routes should follow this error handling pattern:

```typescript
try {
  // Route logic
  return NextResponse.json({ data });
} catch (error) {
  console.error('API error:', error);
  
  if (error instanceof SomeSpecificError) {
    return NextResponse.json(
      { error: 'User-friendly message' },
      { status: 400 }
    );
  }
  
  // Log to monitoring
  Sentry.captureException(error);
  
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

### Response Format Standard

All API responses should follow a consistent structure:

```typescript
// Success response
{
  data: { ... },  // The actual response data
  meta?: { ... }  // Optional metadata like pagination
}

// Error response
{
  error: 'Error message',
  details?: { ... }  // Optional validation or error details
}
```

### Authentication Standard

All protected routes should use the Clerk authentication helpers:

```typescript
import { withAuth, withRole } from '@/lib/auth/clerk/api-auth';

// Basic authentication
export const POST = withAuth(async (request, user) => {
  // Implementation
});

// Role-specific authentication
export const GET = withRole(UserRole.ADMIN, async (request, user) => {
  // Implementation
});
```

## Risk Assessment

### Potential Issues

1. **Unidentified Dependencies**: Client-side code might use APIs in non-obvious ways
2. **Silent Failures**: Removed APIs might cause silent failures in edge cases
3. **Performance Impact**: Changes to heavily used APIs might affect performance

### Mitigation Strategies

1. **Thorough Testing**: Comprehensive testing of application flows before and after changes
2. **Phased Removal**: Remove routes in batches with testing between phases
3. **Monitoring**: Add monitoring for 404 errors to catch missed dependencies
4. **Rollback Plan**: Maintain the ability to restore removed routes if issues arise

## Cleanup Summary Template

For each removed route, document:

```
## Route: /api/example/route

**Status**: Removed

**Functionality**: Briefly describe what the route did

**Reason for Removal**: 
- No client-side references found
- Duplicate of /api/other/route
- Development/test route only

**Alternative**: If applicable, note alternative route that provides similar functionality

**Dependencies**: Any components or flows that needed modification

**Migration**: Steps taken to migrate dependent code, if any
```

## Timeline

- **Day 1**: Research and verification of route usage
- **Day 2**: Implementation of Phase 3.1 and part of 3.2
- **Day 3**: Completion of Phase 3.2 and testing
- **Day 4**: Implementation of Phase 3.3
- **Day 5**: Implementation of Phase 3.4 and final verification

## Conclusion

This API route rationalization will significantly improve the codebase by removing unused code, standardizing patterns, and improving maintainability. The phased approach with thorough testing between steps will ensure that the application continues to function correctly throughout the process.