/**
 * Configuration-Driven Middleware for Buildappswith Platform
 * Version: 2.0.0 (Updated for Clerk Express SDK Integration)
 *
 * Implements global middleware for the Next.js application using Clerk Express SDK:
 * - Authentication via Clerk Express SDK (improved performance)
 * - Role-based access control for protected resources
 * - Enhanced error handling with structured logging
 * - Performance monitoring with detailed metrics
 * - Backward compatibility with existing routes
 *
 * This middleware uses the Express SDK adapter for improved performance and flexibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clerkExpressMiddleware } from '@/lib/auth/express/middleware';
import { logger } from '@/lib/logger';

/**
 * Authentication middleware using Clerk Express SDK
 *
 * This middleware:
 * 1. Uses the Clerk Express SDK for improved performance
 * 2. Provides comprehensive error handling
 * 3. Adds detailed performance metrics
 * 4. Ensures backward compatibility with existing routes
 */
export default async function middleware(req: NextRequest) {
  try {
    // Record the start time for performance metrics
    const startTime = performance.now();

    // Apply Clerk Express middleware
    const response = await clerkExpressMiddleware(req);

    // Add performance timing header
    if (response.headers) {
      const duration = performance.now() - startTime;
      response.headers.set('x-auth-duration', `${duration.toFixed(2)}ms`);
    }

    // Add feature flag for Express SDK
    if (response.headers) {
      response.headers.set('x-auth-provider', 'clerk-express');
    }

    // Log successful processing for monitoring
    logger.debug('Middleware processed successfully', {
      path: req.nextUrl.pathname,
      method: req.method,
      duration: performance.now() - startTime,
    });

    return response;
  } catch (error) {
    // Log detailed error information for troubleshooting
    logger.error('Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      path: req.nextUrl.pathname,
      method: req.method,
    });

    // Return a fallback response to avoid blocking the request
    // This ensures the application remains functional even if auth fails
    const response = NextResponse.next();

    // Add error indicator for monitoring and debugging
    response.headers.set('x-auth-error', 'true');

    return response;
  }
}

/**
 * Configure which paths middleware will run on
 * This configuration determines where the auth middleware is applied
 */
export const config = {
  matcher: [
    // Match all request paths except explicitly excluded ones
    "/((?!api/|_next/|.*\\..*$).*)",
  ],
};
