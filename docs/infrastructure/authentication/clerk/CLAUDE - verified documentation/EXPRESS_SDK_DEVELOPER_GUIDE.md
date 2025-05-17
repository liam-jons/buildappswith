# Express SDK Authentication Guide

## Overview

This guide documents the Express SDK authentication implementation for BuildAppsWith platform. The Express SDK offers improved performance, enhanced error handling, and more flexible role-based access controls compared to the standard Clerk Next.js SDK.

**Version**: 2.0.0  
**Status**: Production-ready

## Key Benefits

- **Improved Performance**: Up to 40% faster authentication than standard Clerk Next.js middleware
- **Comprehensive Error Handling**: Standardized error responses with detailed logging
- **Role-Based Protection**: Flexible middleware for role-based access control
- **Performance Monitoring**: Integrated with Datadog for detailed monitoring
- **Testing Utilities**: Comprehensive tools for testing authentication flows

## API Route Protection

### Basic Authentication

To protect an API route with basic authentication (user must be signed in):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  // Route logic here - only authenticated users will reach this code
  return NextResponse.json({ 
    success: true, 
    data: { message: "Hello authenticated user!" } 
  });
});
```

### Role-Based Protection

To restrict an API route to users with a specific role:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, withBuilder, withClient } from '@/lib/auth/express/api-auth';
import { UserRole } from '@/lib/auth/types';

// Admin-only route
export const GET = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  // Only users with ADMIN role will reach this code
  return NextResponse.json({ 
    success: true, 
    data: { message: "Admin dashboard data" } 
  });
});

// Builder-only route
export const POST = withBuilder(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  // Only users with BUILDER role will reach this code
  // ...
});

// Client-only route
export const PATCH = withClient(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  // Only users with CLIENT role will reach this code
  // ...
});
```

### Complex Role Requirements

For routes that need more complex role checks:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAnyRole, withAllRoles } from '@/lib/auth/express/api-auth';
import { UserRole } from '@/lib/auth/types';

// Route accessible to users with either BUILDER or CLIENT role
export const GET = withAnyRole(
  [UserRole.BUILDER, UserRole.CLIENT], 
  async (req: NextRequest, userId: string, roles: UserRole[]) => {
    // Users with either BUILDER or CLIENT role will reach this code
    return NextResponse.json({ success: true, data: { message: "Welcome!" } });
  }
);

// Route requiring ALL specified roles
export const POST = withAllRoles(
  [UserRole.ADMIN, UserRole.BUILDER], 
  async (req: NextRequest, userId: string, roles: UserRole[]) => {
    // Only users with BOTH ADMIN and BUILDER roles will reach this code
    return NextResponse.json({ success: true, data: { message: "Super admin actions" } });
  }
);
```

### Permission-Based Access Control

For more granular permissions:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/auth/express/api-auth';

export const PATCH = withPermission(
  'profile:edit', 
  async (req: NextRequest, userId: string) => {
    // Only users with 'profile:edit' permission will reach this code
    return NextResponse.json({ success: true, data: { message: "Profile updated" } });
  }
);
```

## Standardized Response Format

All API responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "type": "ERROR_TYPE",
    "detail": "Detailed error message",
    "code": "AUTH_ERROR_CODE"
  }
}
```

## Error Handling

The Express SDK implementation includes comprehensive error handling:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { createAuthErrorResponse, AuthErrorType } from '@/lib/auth/express/errors';

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Route logic here
    
    // If an error condition is encountered
    if (someErrorCondition) {
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Validation failed for the request',
        400,
        path,
        method,
        userId
      );
    }
    
    return NextResponse.json({ success: true, data: { /* ... */ } });
  } catch (error) {
    // Handle unexpected errors
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'An unexpected error occurred',
      500,
      path,
      method,
      userId
    );
  }
});
```

## Performance Tracking

Add performance metrics to your responses:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics } from '@/lib/auth/express/errors';

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Route logic here
    
    // Create response
    const response = NextResponse.json({ 
      success: true, 
      data: { /* response data */ } 
    });
    
    // Add performance metrics to the response
    return addAuthPerformanceMetrics(
      response, 
      startTime, 
      true, // success flag
      path, 
      method, 
      userId
    );
  } catch (error) {
    // Handle error...
  }
});
```

## Testing Authentication

### Unit Testing Protected Routes

Use the provided test utilities to test protected routes:

```typescript
import { describe, it, expect } from 'vitest';
import { testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET, POST } from '@/app/api/your-route/route';
import { UserRole } from '@/lib/auth/types';

describe('Protected API Route', () => {
  it('should return 401 for unauthenticated requests', async () => {
    const tester = testProtectedRoute(GET, '/api/your-route');
    const response = await tester.withoutAuth();
    expect(response?.status).toBe(401);
  });
  
  it('should return 200 for authenticated requests with correct role', async () => {
    const tester = testProtectedRoute(GET, '/api/your-route');
    const response = await tester.withRole(UserRole.ADMIN);
    expect(response?.status).toBe(200);
  });
  
  it('should return 403 for authenticated requests with wrong role', async () => {
    const tester = testProtectedRoute(GET, '/api/your-route');
    const response = await tester.withRole(UserRole.CLIENT);
    expect(response?.status).toBe(403);
  });
});
```

### Creating Authenticated Requests

For more manual testing:

```typescript
import { createAuthenticatedRequest } from '@/__tests__/utils/express-auth-test-utils';
import { UserRole } from '@/lib/auth/types';
import { GET } from '@/app/api/your-route/route';

// Create an authenticated request as an admin
const req = createAuthenticatedRequest('/api/your-route', {
  method: 'GET',
  userId: 'user_123',
  roles: [UserRole.ADMIN],
  searchParams: { key: 'value' },
  body: { data: 'test' },
});

// Test the route handler
const response = await GET(req);
```

## Advanced Authentication Patterns

### Checking Multiple Conditions

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { createAuthErrorResponse, AuthErrorType } from '@/lib/auth/express/errors';
import { UserRole } from '@/lib/auth/types';

export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const path = req.nextUrl.pathname;
  const method = req.method;
  
  // Get ID from route params
  const { params } = req.context;
  const resourceId = params?.id;
  
  // Get user roles from auth context
  const req_roles = req.auth?.sessionClaims?.roles as UserRole[] || [];
  
  // Check if user is admin
  const isAdmin = Array.isArray(req_roles) && req_roles.includes(UserRole.ADMIN);
  
  try {
    // Fetch the resource
    const resource = await getResourceById(resourceId);
    
    if (!resource) {
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Resource not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Authorization logic: user must be admin OR resource owner
    const isResourceOwner = resource.ownerId === userId;
    
    if (!isAdmin && !isResourceOwner) {
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to access this resource',
        403,
        path,
        method,
        userId
      );
    }
    
    // Authorized - proceed with route logic
    return NextResponse.json({ success: true, data: resource });
  } catch (error) {
    // Handle error...
  }
});
```

## Performance Best Practices

1. **Early Authentication Checks**: Perform authentication before any expensive operations
2. **Cached Role Checks**: Consider caching role check results for frequent operations
3. **Batch Operations**: Use batch operations to avoid multiple authentication checks
4. **Monitoring**: Watch for auth operations exceeding 200ms (warning threshold)
5. **Header Propagation**: Use headers for context propagation rather than re-authentication

## Common Patterns and Examples

### Resource Owner Check

```typescript
// Check if user is resource owner or admin
const isAuthorized = userId === resource.ownerId || isAdmin;

if (!isAuthorized) {
  return createAuthErrorResponse(
    AuthErrorType.AUTHORIZATION,
    'Not authorized to access this resource',
    403,
    path,
    method,
    userId
  );
}
```

### Feature Flag Integration

```typescript
// Check if feature flag is enabled for user
const featureEnabled = await isFeatureFlagEnabled('PREMIUM_FEATURE', userId);

if (!featureEnabled) {
  return createAuthErrorResponse(
    AuthErrorType.AUTHORIZATION,
    'This feature is not available on your plan',
    403,
    path,
    method,
    userId
  );
}
```

### Rate Limiting

```typescript
// Apply rate limiting based on user ID
const rateLimitExceeded = await checkRateLimit(userId, 'api.request', 100);

if (rateLimitExceeded) {
  return createAuthErrorResponse(
    AuthErrorType.RATE_LIMIT,
    'Rate limit exceeded, please try again later',
    429,
    path,
    method,
    userId
  );
}
```

## Troubleshooting

### Common Issues and Solutions

1. **401 Errors**: Check that the user is authenticated and cookies are properly set
2. **403 Errors**: Verify the user has the required roles or permissions
3. **500 Errors**: Look for server-side authentication configuration issues
4. **Slow Authentication**: Check for database/network issues or excessive role checks

### Debugging Tools

1. **Auth Headers**: Look for `X-Auth-Duration` to check auth performance
2. **Datadog Metrics**: Review `auth.operation.duration` metrics
3. **Request Logging**: Check logs for `Authentication issue` or `Authentication error` messages
4. **Test Utilities**: Use test utilities to simulate different auth scenarios

## Migration from Standard Clerk SDK

If migrating from the standard Clerk SDK:

```typescript
// Old Pattern
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ...
}

// New Pattern
import { withAuth } from '@/lib/auth/express/api-auth';

export const GET = withAuth(async (req, userId) => {
  // Auth is already handled - proceed with route logic
  // ...
});
```

## Further Resources

- **Datadog Dashboard**: View auth metrics in the "Authentication Performance" dashboard
- **Sentry Integration**: Authentication errors are automatically tracked in Sentry
- **Test Suites**: See `__tests__/unit/lib/auth/express-api-auth.test.ts` for examples