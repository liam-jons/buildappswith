Clerk Express SDK Migration Plan

  Current State Analysis

  I've analyzed the current Clerk implementation in the codebase:

  1. Current Implementation:
    - Uses Clerk NextJS SDK (@clerk/nextjs)
    - Middleware-based authentication in lib/auth/clerk-middleware.ts
    - Custom hooks and utilities in lib/auth/clerk-hooks.ts
    - Authentication flows visualized in CLERK_AUTHENTICATION_FLOW.mermaid
  2. Key Components:
    - clerkMiddleware: Protects routes based on public/private configuration
    - authMiddleware: Custom middleware configuration with afterAuth callback
    - Client-side components: ClerkProvider, custom auth hooks
    - Server-side auth: API route protection with withAuth/withRole wrappers
  3. Current Authentication Flow:
    - Middleware checks auth state for all non-API routes
    - Public routes are accessible without authentication
    - Private routes redirect to sign-in when user isn't authenticated
    - Authentication state is propagated to components via ClerkProvider
    - Custom hooks abstract Clerk API for component usage
  4. Identified Issues:
    - Performance overhead with the NextJS SDK
    - Limited middleware customization
    - Server-side auth can be more optimized
    - Error handling could be enhanced

  Migration Strategy

  1. Install and Configure Clerk Express SDK

  Install the new package alongside existing one to allow incremental migration:

  npm install @clerk/express
  # or
  pnpm add @clerk/express

  2. Create Express SDK Middleware Adapter

  Create a migration layer that adapts the Express SDK to work with Next.js middleware:

  // lib/auth/clerk-express-adapter.ts
  import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
  import { NextRequest, NextResponse } from "next/server";

  // Configuration from existing middleware
  import { publicRoutes, ignoredRoutes } from "./clerk-middleware";

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
  function adaptNextRequestToExpress(req: NextRequest) {
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

  function createMockExpressResponse() {
    // Create minimal Express-compatible response object
    return {
      setHeader: () => {},
      getHeader: () => null,
      status: (code) => ({ send: () => {}, json: () => {} }),
      // Add other necessary Express response methods
    };
  }

  3. Update Middleware Implementation

  Refactor the existing middleware to use the Express SDK adapter:

  // lib/auth/clerk-middleware.ts
  import { NextRequest, NextResponse } from "next/server";
  import { createClerkExpressMiddleware } from "./clerk-express-adapter";

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

  4. Create Server Auth Utilities

  Create utilities for server-side authentication with the Express SDK:

  // lib/auth/server-auth.ts
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

  5. Create API Route Protections

  Create route handler protection utilities with the Express SDK:

  // lib/auth/api-auth.ts
  import { requireAuth, getAuth } from "@clerk/express";
  import { NextRequest, NextResponse } from "next/server";

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

  // Helper functions (same as in clerk-express-adapter.ts)
  function adaptNextRequestToExpress(req: NextRequest) {
    // Implementation from previous adapter
  }

  function createMockExpressResponse() {
    // Implementation from previous adapter
  }

  6. Update Client-Side Auth Hooks

  Create a compatibility layer for client-side components:

  // lib/auth/client-auth.ts
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

  7. Create Migration Testing Components

  Create components for testing the migration:

  // app/auth-test/page.tsx
  import { getServerAuth, hasServerRole } from "@/lib/auth/server-auth";

  export default function AuthTestPage() {
    const auth = getServerAuth();
    const isAdmin = hasServerRole('admin');

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Server Auth State</h2>
          <pre className="bg-gray-200 p-2 rounded">
            {JSON.stringify(auth, null, 2)}
          </pre>
          <p className="mt-2">
            Is Admin: <span className="font-semibold">{isAdmin ? 'Yes' : 'No'}</span>
          </p>
        </div>

        <div className="mt-6">
          <ClientAuthTest />
        </div>
      </div>
    );
  }

  // Client component to test client-side auth
  "use client";
  import { useAuth, usePermission } from "@/lib/auth/client-auth";

  function ClientAuthTest() {
    const auth = useAuth();
    const canEditProfile = usePermission('profile:edit');

    return (
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Client Auth State</h2>
        <pre className="bg-gray-200 p-2 rounded">
          {JSON.stringify(
            {
              userId: auth.userId,
              isSignedIn: auth.isSignedIn,
              roles: auth.roles,
            },
            null,
            2
          )}
        </pre>
        <p className="mt-2">
          Can Edit Profile: <span className="font-semibold">{canEditProfile ? 'Yes' : 'No'}</span>
        </p>
      </div>
    );
  }

  8. Implementation Sequence

  1. Initial Setup:
    - Install Clerk Express SDK
    - Create adapter and utility files
    - Keep existing implementation working in parallel
  2. Staged Migration:
    - Start with middleware migration
    - Update server-side auth utilities
    - Update API route protections
    - Update client-side hooks with backward compatibility
  3. Testing Strategy:
    - Create test pages to verify auth state
    - Test protected and public routes
    - Test role-based access control
    - Verify session persistence and token management
  4. Full Migration:
    - Remove NextJS SDK dependencies once testing confirms functionality
    - Update documentation
    - Create migration guide for the team

  9. Error Handling Enhancement

  Enhance error handling with specific error types:

  // lib/auth/errors.ts
  export class AuthenticationError extends Error {
    statusCode = 401;

    constructor(message = 'Authentication required') {
      super(message);
      this.name = 'AuthenticationError';
    }
  }

  export class AuthorizationError extends Error {
    statusCode = 403;

    constructor(message = 'Insufficient permissions') {
      super(message);
      this.name = 'AuthorizationError';
    }
  }

  export class AuthConfigurationError extends Error {
    statusCode = 500;

    constructor(message = 'Authentication configuration error') {
      super(message);
      this.name = 'AuthConfigurationError';
    }
  }

  Migration Timeline

  1. Week 1: Setup and Adapter Creation
    - Install Express SDK
    - Create adapter and middleware implementation
    - Create server auth utilities
    - Initial testing with test routes
  2. Week 2: API Route Protection and Client Hooks
    - Implement API route protection
    - Create client-side hooks
    - Test authentication flows
    - Document migration steps
  3. Week 3: Testing and Full Migration
    - Comprehensive testing across all routes
    - Fix any issues discovered
    - Complete migration from NextJS SDK
    - Update documentation and create guides

  Risk Mitigation

  1. Compatibility Issues:
    - Maintain backward compatibility with existing components
    - Create adapter layer to smooth transition
    - Test thoroughly before removing NextJS SDK
  2. Performance Concerns:
    - Benchmark before and after migration
    - Optimize adapter implementation to minimize overhead
    - Identify and fix any performance bottlenecks
  3. Authentication Failures:
    - Implement graceful fallbacks
    - Add additional logging during transition
    - Create quick rollback path if issues arise

  Conclusion

  The migration to Clerk Express SDK offers significant benefits in terms of performance, flexibility, and
  security. By implementing this migration plan with a staged approach and robust testing, we can ensure a smooth
  transition with minimal disruption to users.

  The main challenges will be adapting the Express SDK to work with Next.js middleware and ensuring backward
  compatibility with existing components. The adapter pattern and compatibility layer approach should address these
   challenges effectively.
