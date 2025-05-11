# Express SDK Reference Implementation

This document provides reference implementations for common authentication patterns using the Express SDK. Use these as templates when implementing new API routes or updating existing ones.

## Basic Authentication Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';

/**
 * API route with basic authentication
 * Requires the user to be signed in, but no specific role
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Request received', {
      path,
      method,
      userId
    });
    
    // Your route logic here
    const data = { message: "Authentication successful" };
    
    logger.info('Operation completed successfully', {
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      data
    });

    // Add performance metrics to the response
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
    
    logger.error('Operation failed', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
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

## Role-Based Authentication Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withRole } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

/**
 * API route with role-based authentication
 * Requires the user to have a specific role
 */
export const POST = withRole(UserRole.BUILDER, async (req: NextRequest, userId: string, roles: UserRole[]) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Role-based request received', {
      path,
      method,
      userId,
      roles
    });
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      logger.warn('Invalid request body', {
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request body',
        400,
        path,
        method,
        userId
      );
    }
    
    // Validate request data (example using Zod)
    // const validationResult = yourSchema.safeParse(body);
    // if (!validationResult.success) {
    //   return createAuthErrorResponse(
    //     'VALIDATION_ERROR',
    //     'Validation failed',
    //     400,
    //     path,
    //     method,
    //     userId
    //   );
    // }
    
    // Your route logic here
    const data = { message: "Operation successful" };
    
    logger.info('Operation completed successfully', {
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      data
    });

    // Add performance metrics to the response
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
    
    logger.error('Operation failed', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
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

## Resource Owner Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

/**
 * API route that checks resource ownership
 * User must either be the resource owner or an admin
 */
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
    
    // Fetch the resource
    const resource = await fetchResourceById(resourceId);
    
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
    const req_roles = req.auth?.sessionClaims?.roles as UserRole[] || 
                      req.auth?.sessionClaims?.['public_metadata']?.['roles'] as UserRole[] || 
                      [];
    
    // Check if user is admin
    const isAdmin = Array.isArray(req_roles) && req_roles.includes(UserRole.ADMIN);
    
    // Check if user is resource owner
    const isResourceOwner = resource.userId === userId;
    
    // Check authorization
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

    // Add performance metrics to the response
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

## Dynamic Permission Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/express/api-auth';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';
import { trackPermissionCheck } from '@/lib/datadog/auth-monitoring';

/**
 * API route with dynamic permission check
 * Uses context-specific permission logic
 */
export const PATCH = withAuth(async (
  req: NextRequest,
  userId: string,
  { params }: { params: { id: string } }
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const resourceId = params.id;

  try {
    logger.info('Resource update request received', {
      path,
      method,
      userId,
      resourceId
    });
    
    // Fetch the resource
    const resource = await fetchResourceById(resourceId);
    
    if (!resource) {
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
    const isAdmin = Array.isArray(req_roles) && req_roles.includes(UserRole.ADMIN);
    
    // Complex permission check with performance tracking
    const canEditResource = trackPermissionCheck(
      path,
      method,
      userId,
      'resource:edit',
      () => {
        // Permission logic:
        // 1. Admins can edit any resource
        // 2. Resource owners can edit their own resources
        // 3. Resources with public edit flag can be edited by anyone
        return (
          isAdmin || 
          resource.userId === userId || 
          resource.publicEditable === true
        );
      }
    );
    
    if (!canEditResource) {
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to edit this resource',
        403,
        path,
        method,
        userId
      );
    }
    
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request body',
        400,
        path,
        method,
        userId
      );
    }
    
    // Update the resource
    const updatedResource = await updateResource(resourceId, body);
    
    logger.info('Resource updated successfully', {
      path,
      method,
      userId,
      resourceId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      data: updatedResource
    });

    // Add performance metrics to the response
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
    
    logger.error('Resource update failed', {
      error: errorMessage,
      path,
      method,
      userId,
      resourceId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to update resource',
      500,
      path,
      method,
      userId
    );
  }
});
```

## Testing Pattern

```typescript
// __tests__/unit/api/your-endpoint.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET, POST, PUT, DELETE } from '@/app/api/your-endpoint/route';
import { UserRole } from '@/lib/auth/types';

// Setup Express SDK mocks
setupExpressMocks();

describe('Your API Endpoint', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('GET endpoint', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(GET, '/api/your-endpoint');
      const response = await tester.withoutAuth();
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 200 for authenticated requests', async () => {
      const tester = testProtectedRoute(GET, '/api/your-endpoint');
      const response = await tester.withAuth();
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
    });
  });
  
  describe('POST endpoint', () => {
    const testBody = { name: 'Test' };
    
    it('should allow users with ADMIN role', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/your-endpoint', 
        'POST',
        { body: testBody }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      expect(response?.status).toBe(200);
    });
    
    it('should reject users without ADMIN role', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/your-endpoint', 
        'POST',
        { body: testBody }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      expect(response?.status).toBe(403);
    });
  });
  
  // Additional test cases for PUT, DELETE, etc.
});
```

## Component Integration Pattern

For client components that need to interact with protected API routes:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function ProtectedComponent() {
  const { isLoaded, userId, getToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      if (!isLoaded || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get auth token for API request
        const token = await getToken();
        
        // Make authenticated API request
        const response = await fetch('/api/protected-endpoint', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error?.detail || 'Failed to fetch data');
        }
        
        setData(result.data);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [isLoaded, userId, getToken]);
  
  if (!isLoaded || loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!userId) {
    return <div>Please sign in to access this content</div>;
  }
  
  return (
    <div>
      {/* Render component with data */}
    </div>
  );
}
```

## Error Handling Pattern

Comprehensive error handling with different error types:

```typescript
try {
  // Your operation logic here
} catch (error) {
  const path = req.nextUrl.pathname;
  const method = req.method;
  
  // Categorize different error types
  if (error instanceof PrismaClientKnownRequestError) {
    // Database-related errors
    if (error.code === 'P2025') {
      // Record not found
      return createAuthErrorResponse(
        'RESOURCE_NOT_FOUND',
        'Resource not found',
        404,
        path,
        method,
        userId
      );
    } else if (error.code === 'P2002') {
      // Unique constraint violation
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'A resource with that identifier already exists',
        400,
        path,
        method,
        userId
      );
    }
  } else if (error instanceof ZodError) {
    // Validation errors
    return createAuthErrorResponse(
      'VALIDATION_ERROR',
      'Validation failed',
      400,
      path,
      method,
      userId
    );
  } else if (error instanceof AuthError) {
    // Authentication/authorization errors - pass through
    return createAuthErrorResponse(
      error.name,
      error.message,
      error.statusCode,
      path,
      method,
      userId
    );
  }
  
  // Default server error for unknown errors
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  logger.error('Operation failed', {
    error: errorMessage,
    path,
    method,
    userId,
    stack: error instanceof Error ? error.stack : undefined
  });
  
  return createAuthErrorResponse(
    AuthErrorType.SERVER,
    'An unexpected error occurred',
    500,
    path,
    method,
    userId
  );
}
```

These patterns provide a foundation for implementing authenticated API routes using the Express SDK. Adapt them to your specific use cases while maintaining the consistency in error handling, logging, and performance monitoring.