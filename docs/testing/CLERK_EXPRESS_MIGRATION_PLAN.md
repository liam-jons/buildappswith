# Clerk Express SDK Migration Plan

*Version: 1.0.0*
*Date: 2025-05-11*
*Status: Draft*

## Overview

This document outlines the implementation plan for migrating from Clerk NextJS SDK to Clerk Express SDK, improving performance, security, and middleware capabilities.

## Current State Analysis

1. **Current Implementation**:
   - Uses Clerk NextJS SDK (`@clerk/nextjs`)
   - Middleware-based authentication in `lib/auth/clerk-middleware.ts`
   - Custom hooks and utilities in `lib/auth/clerk-hooks.ts`
   - Authentication flows visualized in `CLERK_AUTHENTICATION_FLOW.mermaid`

2. **Key Components**:
   - `clerkMiddleware`: Protects routes based on public/private configuration
   - `authMiddleware`: Custom middleware configuration with afterAuth callback
   - Client-side components: ClerkProvider, custom auth hooks
   - Server-side auth: API route protection with withAuth/withRole wrappers

3. **Current Authentication Flow**:
   - Middleware checks auth state for all non-API routes
   - Public routes are accessible without authentication
   - Private routes redirect to sign-in when user isn't authenticated
   - Authentication state is propagated to components via ClerkProvider
   - Custom hooks abstract Clerk API for component usage

4. **Identified Issues**:
   - Performance overhead with the NextJS SDK
   - Limited middleware customization
   - Server-side auth can be more optimized
   - Error handling could be enhanced

## Implementation Plan

### 1. Install and Configure Clerk Express SDK

Install the new package alongside existing one to allow incremental migration:

```bash
npm install @clerk/express
# or
pnpm add @clerk/express
```

### 2. Create Express SDK Middleware Adapter

Create a migration layer that adapts the Express SDK to work with Next.js middleware:

```typescript
// lib/auth/express/adapter.ts
import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";

// Configuration from existing middleware
import { publicRoutes, ignoredRoutes } from "../clerk-middleware";

export function createClerkExpressMiddleware() {
  return async function clerkExpressAdapter(req: NextRequest) {
    // Initialize Express SDK middleware with Next.js adapter
    try {
      // Create Express-compatible request/response objects
      const expressReq = adaptNextRequestToExpress(req);
      const expressRes = createMockExpressResponse();
      let nextCalled = false;

      // Create Express-style next function
      const next = () => {
        nextCalled = true;
      };

      // Apply Clerk Express middleware
      await clerkExpressMiddleware({
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
        signInUrl: '/login',
      })(expressReq, expressRes, next);

      // Get auth state from request
      const auth = getAuth(expressReq);

      // Check if route is public
      const isPublicRoute = publicRoutes.some(pattern => {
        return new RegExp(`^${pattern}$`).test(req.nextUrl.pathname);
      });

      // Check if route should be ignored
      const shouldIgnore = ignoredRoutes.some(pattern => {
        return new RegExp(`^${pattern}$`).test(req.nextUrl.pathname);
      });

      // If route should be ignored, proceed
      if (shouldIgnore) {
        return NextResponse.next();
      }

      // Handle non-API routes that require auth
      if (!req.nextUrl.pathname.startsWith('/api/')) {
        // If not public and not authenticated, redirect to sign-in
        if (!isPublicRoute && !auth?.userId) {
          const signIn = new URL('/login', req.url);
          signIn.searchParams.set('redirect_url', req.url);
          return NextResponse.redirect(signIn);
        }

        // If user is authenticated but on auth pages, redirect to dashboard
        if (auth?.userId && (
          req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/signup')
        )) {
          const dashboard = new URL('/dashboard', req.url);
          return NextResponse.redirect(dashboard);
        }
      }

      // Continue with auth object attached to request
      const response = NextResponse.next();

      // Attach auth information to response headers for server components
      if (auth?.userId) {
        response.headers.set('x-clerk-auth-user-id', auth.userId);
        response.headers.set('x-clerk-auth-session-id', auth.sessionId || '');
      }

      return response;
    } catch (error) {
      console.error('Clerk Express middleware error:', error);
      return NextResponse.next();
    }
  };
}

// Helper functions to adapt Next.js to Express
export function adaptNextRequestToExpress(req: NextRequest) {
  // Create a minimal Express-compatible request object
  const url = new URL(req.url);

  return {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    cookies: Object.fromEntries(
      req.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    ),
    query: Object.fromEntries(url.searchParams.entries()),
    body: null, // Not needed for auth middleware
    path: url.pathname,
    // Add other Express-specific properties needed by Clerk
  };
}

export function createMockExpressResponse() {
  // Create minimal Express-compatible response object
  return {
    setHeader: () => {},
    getHeader: () => null,
    status: (code) => ({ send: () => {}, json: () => {} }),
    // Add other necessary Express response methods
  };
}
```

### 3. Update Middleware Implementation

Refactor the existing middleware to use the Express SDK adapter:

```typescript
// lib/auth/clerk-middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createClerkExpressMiddleware } from "./express/adapter";

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/verify",
  "/api/auth/(.+)",
  "/api/webhook/(.+)",
  "/api/marketplace/builders",
  "/api/marketplace/featured",
  "/api/marketplace/filters",
  "/api/timeline/(.+)",
  "/toolkit",
  "/how-it-works",
  "/weekly-sessions",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/liam",
  "/builder-profile/(.+)",
  "/auth-test",
];

/**
 * Routes that should be ignored by the middleware
 */
export const ignoredRoutes = [
  "/_next/(.+)",
  "/favicon.ico",
];

// Create middleware using Express SDK adapter
const clerkExpressMiddleware = createClerkExpressMiddleware();

/**
 * Clerk auth middleware with Express SDK
 */
export async function clerkMiddleware(req: NextRequest) {
  return clerkExpressMiddleware(req);
}

/**
 * Export the middleware config
 */
export const config = {
  matcher: [
    // Apply to all non-api paths
    "/((?!api/|_next/|.*\\..*$).*)",
  ],
};
```

### 4. Create Server Auth Utilities

Create utilities for server-side authentication with the Express SDK:

```typescript
// lib/auth/express/server-auth.ts
import { getAuth } from "@clerk/express";
import { headers } from "next/headers";

/**
 * Get auth state in server components and route handlers
 */
export function getServerAuth() {
  const headersList = headers();
  const userId = headersList.get('x-clerk-auth-user-id');
  const sessionId = headersList.get('x-clerk-auth-session-id');

  return {
    userId,
    sessionId,
    isAuthenticated: !!userId,
  };
}

/**
 * Create Express SDK-compatible request object from headers
 */
export function createAuthRequest() {
  const headersList = headers();
  const headersObj = {};

  // Convert headers to object for Clerk Express SDK
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });

  // Create minimal request object with necessary properties
  return {
    headers: headersObj,
    cookies: {},
  };
}

/**
 * Get full auth object from Express SDK in server context
 */
export function getFullServerAuth() {
  const req = createAuthRequest();
  return getAuth(req);
}

/**
 * Check if current user has role
 */
export function hasServerRole(role: string) {
  const auth = getFullServerAuth();
  if (!auth?.userId) return false;

  const userRoles = auth.sessionClaims?.roles || [];
  return Array.isArray(userRoles) && userRoles.includes(role);
}

/**
 * Check if current user has permission
 */
export function hasServerPermission(permission: string) {
  const auth = getFullServerAuth();
  return auth?.has({ permission }) || false;
}
```

### 5. Create API Route Protections

Create route handler protection utilities with the Express SDK:

```typescript
// lib/auth/express/api-auth.ts
import { requireAuth, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";
import { adaptNextRequestToExpress, createMockExpressResponse } from "./adapter";

/**
 * Protect a route handler with authentication requirement
 */
export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function authProtectedHandler(req: NextRequest) {
    try {
      // Create Express-compatible request object
      const expressReq = adaptNextRequestToExpress(req);

      // Apply requireAuth middleware
      const authMiddleware = requireAuth({
        signInUrl: '/login',
      });

      // Mock Express response and next function
      const expressRes = createMockExpressResponse();
      let isAuthorized = false;
      const next = () => { isAuthorized = true; };

      // Run auth middleware
      await authMiddleware(expressReq, expressRes, next);

      // If authorized, proceed with handler
      if (isAuthorized) {
        // Attach auth to original request for convenience
        req.auth = getAuth(expressReq);
        return handler(req);
      }

      // If not authorized, return 401
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Protect a route handler with role requirement
 */
export function withRole(role: string, handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest) => {
    // Check if user has required role
    const auth = req.auth;
    const userRoles = auth?.sessionClaims?.roles || [];

    if (!Array.isArray(userRoles) || !userRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

/**
 * Protect a route handler with permission requirement
 */
export function withPermission(permission: string, handler: (req: NextRequest) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest) => {
    // Check if user has required permission
    const auth = req.auth;
    if (!auth?.has({ permission })) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}
```

### 6. Update Client-Side Auth Hooks

Create a compatibility layer for client-side components:

```typescript
// lib/auth/express/client-auth.ts
"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/**
 * Enhanced auth hook compatible with Express SDK backend
 */
export function useAuth() {
  const clerkAuth = useClerkAuth();
  const [roles, setRoles] = useState<string[]>([]);

  // Sync roles from Clerk session claims
  useEffect(() => {
    async function syncRoles() {
      try {
        const session = await clerkAuth.getToken();
        // Parse JWT to get roles - in production would use a proper JWT decoder
        if (session) {
          const claims = JSON.parse(atob(session.split('.')[1]));
          setRoles(claims.roles || []);
        }
      } catch (error) {
        console.error('Error fetching auth roles:', error);
        setRoles([]);
      }
    }

    if (clerkAuth.isSignedIn) {
      syncRoles();
    } else {
      setRoles([]);
    }
  }, [clerkAuth.isSignedIn]);

  return {
    ...clerkAuth,
    roles,
    hasRole: (role: string) => roles.includes(role),
  };
}

/**
 * Check if user has specific permission (placeholder for Express SDK compatibility)
 */
export function usePermission(permission: string) {
  const { roles } = useAuth();

  // Map permissions to roles - this would be more sophisticated in production
  const permissionToRoleMap = {
    'org:admin': ['admin'],
    'profile:edit': ['admin', 'user'],
    // Add more mappings as needed
  };

  const requiredRoles = permissionToRoleMap[permission] || [];
  return roles.some(role => requiredRoles.includes(role));
}

/**
 * Check if user has specific role
 */
export function useRole(role: string) {
  const { roles } = useAuth();
  return roles.includes(role);
}
```

### 7. Create Authentication Error Types

Enhance error handling with specific error types:

```typescript
// lib/auth/express/errors.ts
/**
 * Authentication error for unauthorized access
 */
export class AuthenticationError extends Error {
  statusCode = 401;

  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends Error {
  statusCode = 403;

  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Configuration error for auth setup issues
 */
export class AuthConfigurationError extends Error {
  statusCode = 500;

  constructor(message = 'Authentication configuration error') {
    super(message);
    this.name = 'AuthConfigurationError';
  }
}
```

## Implementation Sequence

### Phase 1: Express SDK Setup (Week 1, Days 1-2)

1. Install Clerk Express SDK:
   ```bash
   cd /Users/liamj/Documents/development/buildappswith
   git checkout -b feature/clerk-express-migration
   pnpm add @clerk/express
   ```

2. Create adapter implementation files:
   ```bash
   mkdir -p lib/auth/express
   touch lib/auth/express/adapter.ts
   touch lib/auth/express/server-auth.ts
   touch lib/auth/express/api-auth.ts
   touch lib/auth/express/client-auth.ts
   touch lib/auth/express/errors.ts
   ```

3. Implement the adapter layer:
   ```bash
   vi lib/auth/express/adapter.ts  # Implement Express SDK adapter
   vi lib/auth/express/errors.ts   # Implement authentication error types
   ```

### Phase 2: Server Authentication (Week 1, Days 3-4)

1. Implement server-side authentication utilities:
   ```bash
   vi lib/auth/express/server-auth.ts  # Implement server auth utilities
   ```

2. Create test middleware implementation (alongside existing):
   ```bash
   vi lib/auth/express/middleware.ts  # Create test middleware implementation
   ```

3. Test middleware with existing routes:
   ```bash
   mkdir -p app/auth-test
   vi app/auth-test/page.tsx  # Create test page
   ```

### Phase 3: API Route Protection (Week 2, Days 1-2)

1. Implement API route protection utilities:
   ```bash
   vi lib/auth/express/api-auth.ts  # Implement API route protection
   ```

2. Create test API routes:
   ```bash
   mkdir -p app/api/auth-test
   vi app/api/auth-test/route.ts  # Create test API route with protection
   ```

3. Test API routes with authentication:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth-test
   ```

### Phase 4: Client Authentication (Week 2, Days 3-4)

1. Implement client-side authentication hooks:
   ```bash
   vi lib/auth/express/client-auth.ts  # Implement client auth hooks
   ```

2. Create client components for testing:
   ```bash
   vi app/auth-test/client.tsx  # Create client test components
   ```

3. Test client authentication in browser:
   ```bash
   pnpm dev  # Start development server
   # Visit http://localhost:3000/auth-test in browser
   ```

### Phase 5: Full Migration and Testing (Week 3)

1. Implement the main middleware:
   ```bash
   vi middleware.ts  # Update with Express SDK adapter
   ```

2. Update existing components:
   ```bash
   vi components/auth/auth-status.tsx  # Update auth components
   vi components/auth/protected-route.tsx  # Update protection wrapper
   ```

3. Comprehensive testing:
   ```bash
   pnpm test  # Run test suite
   pnpm build  # Verify build completes successfully
   ```

4. Documentation and cleanup:
   ```bash
   vi docs/engineering/CLERK_EXPRESS_MIGRATION.md  # Create migration documentation
   ```

## Testing Strategy

### Unit Tests

1. Test adapter functions:
   ```typescript
   // __tests__/unit/auth/express-adapter.test.ts
   import { adaptNextRequestToExpress } from "@/lib/auth/express/adapter";
   
   describe("Express Adapter", () => {
     test("should convert Next.js request to Express-compatible format", () => {
       // Test implementation
     });
   });
   ```

2. Test server authentication utilities:
   ```typescript
   // __tests__/unit/auth/server-auth.test.ts
   import { getServerAuth, hasServerRole } from "@/lib/auth/express/server-auth";
   
   describe("Server Authentication", () => {
     test("should get authentication state from headers", () => {
       // Test implementation
     });
   
     test("should check roles correctly", () => {
       // Test implementation
     });
   });
   ```

### Integration Tests

1. Test middleware flow:
   ```typescript
   // __tests__/integration/auth/middleware-flow.test.ts
   import { createClerkExpressMiddleware } from "@/lib/auth/express/adapter";
   
   describe("Authentication Middleware", () => {
     test("should allow access to public routes", async () => {
       // Test implementation
     });
   
     test("should redirect unauthenticated users from protected routes", async () => {
       // Test implementation
     });
   });
   ```

2. Test API protection:
   ```typescript
   // __tests__/integration/auth/api-protection.test.ts
   import { withAuth, withRole } from "@/lib/auth/express/api-auth";
   
   describe("API Authentication", () => {
     test("should protect routes with authentication", async () => {
       // Test implementation
     });
   
     test("should enforce role requirements", async () => {
       // Test implementation
     });
   });
   ```

### End-to-End Tests

1. Test authentication flows:
   ```typescript
   // __tests__/e2e/auth/auth-flow.test.ts
   describe("Authentication Flow", () => {
     test("should sign in user and maintain session", async () => {
       // Test implementation
     });
   
     test("should protect routes based on roles", async () => {
       // Test implementation
     });
   });
   ```

## Expected Outcomes

1. **Express SDK Adapter**:
   - Successful integration with Next.js middleware
   - Proper handling of authentication state
   - Enhanced error handling

2. **Server Authentication**:
   - Reliable server-side authentication utilities
   - Role and permission-based access control
   - Improved performance compared to NextJS SDK

3. **API Protection**:
   - Secure route protection middleware
   - Fine-grained access control with roles
   - Consistent error responses

4. **Client Authentication**:
   - Enhanced authentication hooks with role support
   - Backward compatibility with existing components
   - Improved authentication state management

5. **Documentation**:
   - Updated authentication flow documentation
   - Migration guide for future reference
   - Updated API documentation

## Risk Mitigation

### Performance Concerns

- Benchmark before and after implementation to quantify improvements
- Profile middleware execution time to identify bottlenecks
- Implement caching where appropriate to minimize overhead

### Authentication Failures

- Implement graceful fallbacks and proper error handling
- Add detailed logging during the transition period
- Create clear error messages for users

### Compatibility Issues

- Maintain backward compatibility with existing components
- Create adapter layer to ensure smooth transition
- Implement feature detection to support both SDKs during migration

### Security Considerations

- Ensure proper token validation and handling
- Implement CSRF protection
- Verify secure cookie handling
- Add rate limiting for authentication endpoints