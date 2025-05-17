# Express SDK Migration Guide

This guide provides step-by-step instructions for migrating existing API routes from the standard Clerk Next.js SDK to the Express SDK implementation. Follow these patterns to ensure consistent authentication, error handling, and performance monitoring across all routes.

## Step 1: Identify Migration Targets

First, identify API routes using the old authentication patterns:

```typescript
// Old Pattern (Standard Clerk SDK)
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Route logic...
}
```

Look for:
- Routes using `auth()` from `@clerk/nextjs`
- Manual auth checks with early returns
- Inconsistent error response formats
- Missing performance monitoring

## Step 2: Replace Authentication Imports

Update the imports to use the Express SDK utilities:

```typescript
// New Pattern (Express SDK)
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
```

## Step 3: Apply Authentication Middleware

Replace manual auth checks with middleware:

```typescript
// Old Pattern
export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ...
}

// New Pattern
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  // Auth is already handled - proceed with route logic
  // ...
});
```

## Step 4: Add Performance Tracking

Add performance tracking to all API routes:

```typescript
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Route logic...
    
    // Create response
    const response = NextResponse.json({
      success: true,
      data: { /* response data */ }
    });
    
    // Add performance metrics
    return addAuthPerformanceMetrics(
      response, 
      startTime, 
      true, 
      path, 
      method, 
      userId
    );
  } catch (error) {
    // Error handling...
  }
});
```

## Step 5: Standardize Error Handling

Replace custom error responses with standardized error handling:

```typescript
// Old Pattern
if (someError) {
  return NextResponse.json({ error: 'Something went wrong' }, { status: 400 });
}

// New Pattern
if (someError) {
  return createAuthErrorResponse(
    'VALIDATION_ERROR',
    'Validation failed for the request',
    400,
    path,
    method,
    userId
  );
}
```

## Step 6: Add Proper Logging

Ensure consistent logging across all routes:

```typescript
// Add info logging for operations
logger.info('Operation request received', {
  path,
  method,
  userId,
  // Add operation-specific context
});

// Add success logging
logger.info('Operation completed successfully', {
  path,
  method,
  userId,
  duration: `${(performance.now() - startTime).toFixed(2)}ms`,
  // Add operation-specific result info
});

// Add error logging
logger.error('Operation failed', {
  error: errorMessage,
  path,
  method,
  userId,
  duration: `${(performance.now() - startTime).toFixed(2)}ms`,
  // Add operation-specific error context
});
```

## Step 7: Update Role Checks

Replace manual role checks with role-based middleware:

```typescript
// Old Pattern
export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Get user from database
  const user = await getUserById(userId);
  
  // Check role
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Admin-only logic...
}

// New Pattern
import { withAdmin } from '@/lib/auth/express/api-auth';

export const POST = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  // Admin-only logic...
});
```

## Step 8: Update Route Parameters

Update how you handle route parameters:

```typescript
// Old Pattern
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Using params directly
  const id = params.id;
  // ...
}

// New Pattern
export const GET = withAuth(async (
  req: NextRequest,
  userId: string,
  { params }: { params: { id: string } }
) => {
  // Using params directly
  const id = params.id;
  // ...
});
```

## Step 9: Update Request Handling

Update how you handle request data:

```typescript
// Old Pattern
export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await request.json();
  // ...
}

// New Pattern
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    // ...
  } catch (error) {
    return createAuthErrorResponse(
      'VALIDATION_ERROR',
      'Invalid request body',
      400,
      req.nextUrl.pathname,
      req.method,
      userId
    );
  }
});
```

## Step 10: Update Response Format

Ensure all responses follow the standardized format:

```typescript
// Old Pattern
return NextResponse.json({ data: resource });

// New Pattern
return NextResponse.json({
  success: true,
  data: resource
});
```

## Complete Migration Example

Here's a complete before-and-after example:

### Before (Standard Clerk SDK)

```typescript
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user from database to check roles
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get resource
    const resourceId = params.id;
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });
    
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    // Check authorization - only owner or admin can view
    if (resource.userId !== userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Return resource
    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### After (Express SDK)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

const prisma = new PrismaClient();

export const GET = withAuth(async (
  req: NextRequest,
  userId: string,
  { params }: { params: { id: string } }
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const resourceId = params.id;

  try {
    logger.info('Resource request received', {
      path,
      method,
      userId,
      resourceId
    });
    
    // Get resource
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });
    
    if (!resource) {
      logger.warn('Resource not found', {
        path,
        method,
        userId,
        resourceId
      });
      
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Resource not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Get user roles from auth context
    const req_roles = req.auth?.sessionClaims?.roles as UserRole[] || [];
    
    // Authorization check - only resource owner or admin can view
    const isAdmin = Array.isArray(req_roles) && req_roles.includes(UserRole.ADMIN);
    const isResourceOwner = resource.userId === userId;
    
    if (!isAdmin && !isResourceOwner) {
      logger.warn('Unauthorized resource access attempt', {
        path,
        method,
        userId,
        resourceId,
        resourceOwnerId: resource.userId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to access this resource',
        403,
        path,
        method,
        userId
      );
    }
    
    logger.info('Resource retrieved successfully', {
      path,
      method,
      userId,
      resourceId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      data: resource
    });

    // Add performance metrics
    return addAuthPerformanceMetrics(
      response, 
      startTime, 
      true, 
      path, 
      method, 
      userId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Resource retrieval failed', {
      error: errorMessage,
      path,
      method,
      userId,
      resourceId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to retrieve resource',
      500,
      path,
      method,
      userId
    );
  }
});
```

## Testing Migrated Routes

After migrating a route, test it thoroughly:

1. **Basic Authentication**: Verify unauthenticated requests receive 401 responses
2. **Role-Based Access**: Test with different user roles to ensure proper authorization
3. **Error Handling**: Verify error responses follow the standardized format
4. **Performance Monitoring**: Check that performance metrics are being added to responses
5. **Logging**: Verify that appropriate log entries are being created

Use the test utilities to create automated tests:

```typescript
import { setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET } from '@/app/api/resources/[id]/route';
import { UserRole } from '@/lib/auth/types';

// Setup Express SDK mocks
setupExpressMocks();

describe('Resource API', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const tester = testProtectedRoute(GET, '/api/resources/123', 'GET', {
      params: { id: '123' }
    });
    const response = await tester.withoutAuth();
    expect(response?.status).toBe(401);
  });
  
  it('should return 200 for resource owner', async () => {
    // Mock database to return a resource owned by the test user
    // ...
    
    const tester = testProtectedRoute(GET, '/api/resources/123', 'GET', {
      params: { id: '123' }
    });
    const response = await tester.withAuth('client');
    expect(response?.status).toBe(200);
  });
  
  it('should return 403 for non-owner without admin role', async () => {
    // Mock database to return a resource NOT owned by the test user
    // ...
    
    const tester = testProtectedRoute(GET, '/api/resources/123', 'GET', {
      params: { id: '123' }
    });
    const response = await tester.withRole(UserRole.CLIENT);
    expect(response?.status).toBe(403);
  });
  
  it('should allow admins to access any resource', async () => {
    // Mock database to return a resource NOT owned by the test user
    // ...
    
    const tester = testProtectedRoute(GET, '/api/resources/123', 'GET', {
      params: { id: '123' }
    });
    const response = await tester.withRole(UserRole.ADMIN);
    expect(response?.status).toBe(200);
  });
});
```

## Migration Checklist

Use this checklist to ensure you've covered all aspects of the migration:

- [ ] Replace imports with Express SDK utilities
- [ ] Apply appropriate authentication middleware
- [ ] Update request handling
- [ ] Update response format to follow standard
- [ ] Add performance tracking
- [ ] Implement standardized error handling
- [ ] Add comprehensive logging
- [ ] Update role checks
- [ ] Update how route parameters are accessed
- [ ] Write tests for the migrated route
- [ ] Verify performance metrics are being recorded
- [ ] Confirm Datadog/Sentry integration is working

## Common Errors and Solutions

### 1. "Invalid Session"

**Error**: Route returns 401 with "Invalid Session" message for authenticated users.

**Solution**: Check that the Express adapter is properly extracting auth information:
```typescript
// In middleware.ts
console.log('Auth headers:', req.headers); // Debug headers
```

### 2. "Roles not available"

**Error**: Role checks fail despite user having the correct role.

**Solution**: Ensure roles are properly stored in the user's session claims:
```typescript
// In your route handler
console.log('User roles:', req.auth?.sessionClaims?.roles);
console.log('Session claims:', req.auth?.sessionClaims);
```

### 3. Performance Metrics Missing

**Error**: Performance headers not present in responses.

**Solution**: Verify you're using `addAuthPerformanceMetrics` correctly and returning its result:
```typescript
// Make sure to return the result
return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
```

### 4. Route Parameter Missing

**Error**: Unable to access route parameters.

**Solution**: Update parameter destructuring to match Express SDK pattern:
```typescript
export const GET = withAuth(async (
  req: NextRequest,
  userId: string,
  { params }: { params: { id: string } } // Correct pattern
) => {
  const id = params.id;
  // ...
});
```

## Conclusion

By following this migration guide, you'll ensure consistent authentication, authorization, error handling, and performance monitoring across all API routes. The Express SDK implementation offers better performance, more consistent error handling, and improved monitoring compared to the standard Clerk Next.js SDK.