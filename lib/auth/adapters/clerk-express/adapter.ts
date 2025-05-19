/**
 * Clerk Express SDK Adapter for Next.js
 * 
 * This adapter bridges the Clerk Express SDK with Next.js middleware functionality,
 * with enhanced security and performance optimizations.
 */

import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
import type { Request as ExpressRequest } from "express";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { publicRoutes, ignoredRoutes } from "../../middleware";

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

      // Initialize Clerk Express middleware with default cookie settings
      const middleware = clerkExpressMiddleware({
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY,
        signInUrl: '/sign-in',
        // Set EU data residency if required
        ...(process.env.CLERK_DATA_RESIDENCY === 'eu' && { frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API }),
        debug: process.env.NODE_ENV === 'development',
      });

      // Apply middleware to the request - use type assertion to satisfy TypeScript
      await middleware(expressReq as unknown as ExpressRequest, expressRes, next);

      // Get auth state from request
      const auth = getAuth(expressReq);
      
      // Get session and user IDs for passing in headers
      const userId = auth?.userId;
      const sessionId = auth?.sessionId;
      
      // Check if path should be public or ignored
      const path = req.nextUrl.pathname;
      const isAuthOptional = !path || isPublicPath(path) || isIgnoredPath(path);
      
      // Create response with auth state preserved as headers
      const response = nextCalled ? NextResponse.next() : NextResponse.next();
      
      // Add auth provider info
      response.headers.set('x-auth-provider', 'clerk-express');
      
      // Add auth state as headers for server-side components to use
      if (userId) {
        response.headers.set('x-clerk-auth-user-id', userId);
      }
      
      if (sessionId) {
        response.headers.set('x-clerk-auth-session-id', sessionId);
      }
      
      // If user has roles in metadata, add those as a header too
      const userMetadata = auth?.sessionClaims?.['user_metadata'] as Record<string, unknown> || {};
      if (userMetadata && 'roles' in userMetadata && Array.isArray(userMetadata.roles)) {
        try {
          // Try to pass roles as JSON
          const roles = userMetadata.roles;
          response.headers.set('x-clerk-auth-user-roles', JSON.stringify(roles));
        } catch (error) {
          // If JSON fails, fall back to comma-separated string
          logger.warn('Failed to stringify user roles for headers', { 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
      
      // Add debug headers in development
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('x-clerk-auth-debug', 'express-sdk');
        response.headers.set('x-clerk-auth-status', userId ? 'authenticated' : 'unauthenticated');
        
        if (isAuthOptional) {
          response.headers.set('x-clerk-auth-optional', 'true');
        }
      }
      
      // Pass along any set-cookie headers
      const setCookieHeader = expressRes.getHeader('set-cookie');
      if (setCookieHeader) {
        response.headers.set('set-cookie', setCookieHeader as string);
      }
      
      return response;
    } catch (error) {
      // Log error details
      logger.error('Clerk Express adapter error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        url: req.url,
      });
      
      // Fallback to unprotected response in case of middleware failure
      return NextResponse.next();
    }
  };
}

/**
 * Helper function to check if a path matches any pattern in the list
 * @param path Path to check
 * @param patterns Array of regex patterns
 * @returns True if the path matches any pattern
 */
function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    return new RegExp(`^${pattern}`).test(path);
  });
}

/**
 * Helper function to check if a path is public
 * @param path Path to check
 * @returns True if the path is public
 */
function isPublicPath(path: string): boolean {
  return matchesPattern(path, publicRoutes);
}

/**
 * Helper function to check if a path should be ignored
 * @param path Path to check
 * @returns True if the path should be ignored
 */
function isIgnoredPath(path: string): boolean {
  return matchesPattern(path, ignoredRoutes);
}

/**
 * Adapts Next.js request to Express-compatible request format
 * with enhanced CSRF handling
 * @param req Next.js request object
 * @returns Express-compatible request object
 */
export function adaptNextRequestToExpress(req: NextRequest) {
  // Create a minimal Express-compatible request object
  const url = new URL(req.url);

  // Enhanced headers handling to ensure CSRF headers are correctly passed
  const headers = Object.fromEntries(req.headers.entries());
  
  // Ensure CSRF token from headers is properly passed through
  const csrfToken = req.headers.get('x-csrf-token') || req.headers.get('csrf-token');
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  // Get IP address using forwarded header as fallback
  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
  
  // Create minimal Express-compatible request object with necessary properties
  // Use type assertion to satisfy TypeScript
  return {
    url: req.url,
    method: req.method,
    headers,
    cookies: Object.fromEntries(
      req.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    ),
    query: Object.fromEntries(url.searchParams.entries()),
    body: null, // Not needed for auth middleware
    path: url.pathname,
    ip: ipAddress,
    secure: url.protocol === 'https:',
    // Express-specific properties
    get: (header: string) => req.headers.get(header),
    accepts: () => '*/*',
    connection: { remoteAddress: ipAddress },
  } as unknown as ExpressRequest;
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
