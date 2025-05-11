/**
 * Express SDK Middleware Implementation
 * Version: 1.1.0
 *
 * This file adapts the Clerk Express SDK for use with Next.js middleware.
 * It provides a drop-in replacement for the existing clerk-middleware.ts
 * with improved performance, flexible configuration, and performance monitoring.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkExpressMiddleware } from "./adapter";
import { logger } from "@/lib/logger";
import { getDatadogConfig, isCriticalTransaction } from "@/lib/datadog/config";

/**
 * Public routes that don't require authentication
 * Reusing the same configuration from clerk-middleware.ts
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
 * Reusing the same configuration from clerk-middleware.ts
 */
export const ignoredRoutes = [
  "/_next/(.+)",
  "/favicon.ico",
];

/**
 * Create a new instance of the Clerk Express middleware adapter
 * This ensures we have a fresh instance for each request
 */
function getClerkExpressAdapter() {
  return createClerkExpressMiddleware();
}

/**
 * Clerk auth middleware using Express SDK
 * This function is the entry point for Next.js middleware
 * Enhanced with performance monitoring
 */
export async function clerkExpressMiddleware(req: NextRequest) {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  let userId = null;
  let authSuccess = false;

  try {
    // Determine authentication type for metrics
    let authType = 'auth.basic';
    if (path.includes('/api/')) {
      authType = 'auth.api';
      if (path.includes('/api/admin/')) {
        authType = 'auth.admin';
      } else if (path.includes('/api/profiles/')) {
        authType = 'auth.profile';
      } else if (path.includes('/api/marketplace/')) {
        authType = 'auth.marketplace';
      }
    }

    // Check if this is a critical auth path that should be monitored at 100%
    const isCritical = isCriticalTransaction(authType);

    // Get a fresh adapter instance for each request
    const clerkExpressAdapter = getClerkExpressAdapter();

    // Apply Clerk Express middleware
    const response = await clerkExpressAdapter(req);

    // Extract user ID for logging if present
    if (response.headers) {
      userId = response.headers.get('x-clerk-user-id');
      authSuccess = !!userId;
    }

    // Add performance and feature-specific headers
    if (response.headers && response instanceof NextResponse) {
      // Auth provider type
      response.headers.set('x-auth-provider', 'clerk-express');

      // Performance metrics
      const duration = performance.now() - startTime;
      response.headers.set('x-auth-duration', `${duration.toFixed(2)}ms`);

      // Monitoring classification
      if (isCritical) {
        response.headers.set('x-critical-path', 'true');
      }
    }

    // Log performance metrics
    const duration = performance.now() - startTime;
    logger.debug('Auth middleware performance', {
      path,
      method,
      duration: duration.toFixed(2),
      success: authSuccess,
      authType,
      isCriticalPath: isCritical,
      ...(userId && { userId }),
    });

    return response;
  } catch (error) {
    // Calculate duration for error logging
    const duration = performance.now() - startTime;

    // Log any unexpected errors with timing information
    logger.error('Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path,
      method,
      duration: duration.toFixed(2),
      ...(userId && { userId }),
    });

    // Create minimal response with performance header
    const response = NextResponse.next();
    response.headers.set('x-auth-duration', `${duration.toFixed(2)}ms`);
    response.headers.set('x-auth-error', 'true');

    // Fallback to unprotected response to prevent blocking the request
    return response;
  }
}

/**
 * Export the middleware config
 * This configuration determines which routes the middleware runs on
 */
export const config = {
  matcher: [
    // Apply to all non-api paths
    "/((?!api/|_next/|.*\\..*$).*)",
  ],
};

/**
 * Helper function to check if a path matches any pattern in the list
 * @param path Path to check
 * @param patterns Array of regex patterns
 * @returns True if the path matches any pattern
 */
export function matchesPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    return new RegExp(`^${pattern}`).test(path);
  });
}

/**
 * Helper function to check if a path is public
 * @param path Path to check
 * @returns True if the path is public
 */
export function isPublicPath(path: string): boolean {
  return matchesPattern(path, publicRoutes);
}

/**
 * Helper function to check if a path should be ignored
 * @param path Path to check
 * @returns True if the path should be ignored
 */
export function isIgnoredPath(path: string): boolean {
  return matchesPattern(path, ignoredRoutes);
}