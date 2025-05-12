/**
 * Clerk Express SDK Adapter for Next.js
 * Version: 1.0.0
 * 
 * This adapter bridges the Clerk Express SDK with Next.js middleware functionality,
 * providing improved performance and more flexible authentication handling.
 */

import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";

// Reuse configuration from existing middleware
import { publicRoutes, ignoredRoutes } from "../clerk-middleware";
import { logger } from "@/lib/logger";

/**
 * Creates a Next.js middleware function that uses Clerk Express SDK
 * @returns Middleware function compatible with Next.js
 */
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

      // Initialize Clerk Express middleware
      const middleware = clerkExpressMiddleware({
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
        signInUrl: '/sign-in',
        apiVersion: 'v1', // Ensure consistent API version
        apiKey: process.env.CLERK_API_KEY, // Optional if using secretKey
        cookieName: 'build_auth', // Custom cookie name for our app
        cookieOptions: {
          // Ensure proper cookie security
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
        // Set EU data residency if required
        ...(process.env.CLERK_DATA_RESIDENCY === 'eu' && { frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API }),
        debug: process.env.NODE_ENV === 'development',
      });

      // Apply middleware to the request
      await middleware(expressReq, expressRes, next);

      // Get auth state from request
      const auth = getAuth(expressReq);

      // Check if route is public
      const isPublicRoute = publicRoutes.some(pattern => {
        return new RegExp(`^${pattern}`).test(req.nextUrl.pathname);
      });

      // Check if route should be ignored
      const shouldIgnore = ignoredRoutes.some(pattern => {
        return new RegExp(`^${pattern}`).test(req.nextUrl.pathname);
      });

      // If route should be ignored, proceed
      if (shouldIgnore) {
        logger.debug('Ignored route accessed', { 
          path: req.nextUrl.pathname,
          method: req.method,
        });
        return NextResponse.next();
      }

      // Handle non-API routes that require auth
      if (!req.nextUrl.pathname.startsWith('/api/')) {
        // If not public and not authenticated, redirect to sign-in
        if (!isPublicRoute && !auth?.userId) {
          logger.info('Unauthenticated access attempt', { 
            path: req.nextUrl.pathname,
            method: req.method,
          });
          
          const signIn = new URL('/sign-in', req.url);
          signIn.searchParams.set('redirect_url', req.url);
          return NextResponse.redirect(signIn);
        }

        // If user is authenticated but on auth pages, redirect to dashboard
        if (auth?.userId && (
          req.nextUrl.pathname.startsWith('/login') ||
          req.nextUrl.pathname.startsWith('/signup') ||
          req.nextUrl.pathname.startsWith('/signin') ||
          req.nextUrl.pathname.startsWith('/sign-in') ||
          req.nextUrl.pathname.startsWith('/sign-up')
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
        
        // Add role information from session claims if available
        const roles = auth.sessionClaims?.roles || auth.sessionClaims?.['public_metadata']?.roles;
        if (roles) {
          response.headers.set('x-clerk-auth-user-roles', 
            typeof roles === 'string' ? roles : JSON.stringify(roles));
        }
      }

      // Add performance timing header
      const startTime = Date.now();
      response.headers.set('x-server-timing', `auth;dur=${Date.now() - startTime}`);

      return response;
    } catch (error) {
      // Log error and continue without blocking the request
      logger.error('Clerk Express middleware error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.nextUrl.pathname,
      });
      
      // Fallback to unprotected response in case of middleware failure
      return NextResponse.next();
    }
  };
}

/**
 * Adapts Next.js request to Express-compatible request format
 * @param req Next.js request object
 * @returns Express-compatible request object
 */
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
    ip: req.ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '',
    secure: url.protocol === 'https:',
    // Express-specific properties
    get: (header: string) => req.headers.get(header),
    accepts: () => '*/*',
    connection: { remoteAddress: req.ip },
  };
}

/**
 * Creates a mock Express response object
 * @returns Express-compatible response object
 */
export function createMockExpressResponse() {
  const headers = new Map<string, string>();
  let statusCode = 200;
  
  return {
    setHeader: (name: string, value: string) => { headers.set(name, value); },
    getHeader: (name: string) => headers.get(name) || null,
    removeHeader: (name: string) => { headers.delete(name); },
    status: (code: number) => { 
      statusCode = code; 
      return { 
        send: () => {}, 
        json: () => {},
        end: () => {}
      }; 
    },
    cookie: (name: string, value: string, options: any) => {},
    clearCookie: (name: string) => {},
    redirect: (url: string) => {},
    locals: {},
    headersSent: false,
    statusCode: 200,
    getHeaders: () => Object.fromEntries(headers.entries()),
    sendStatus: (code: number) => { statusCode = code; },
    contentType: (type: string) => {},
  };
}

/**
 * Authentication error class for auth middleware
 */
export class AuthenticationError extends Error {
  statusCode: number;
  
  constructor(message: string = 'Authentication required', statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}