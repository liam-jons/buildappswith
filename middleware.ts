/**
 * Middleware for Buildappswith Platform
 * Version: 0.1.64
 * 
 * Implements global middleware for the Next.js application including:
 * - API route protection with rate limiting
 * - CSRF protection for mutation operations
 * - Security headers for all responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from './lib/csrf';
import { rateLimit } from './lib/rate-limit';

// Define paths that require different rate limits
const apiPaths = {
  auth: /^\/api\/auth\/.*/,
  timeline: /^\/api\/timeline\/.*/,
  profiles: /^\/api\/builders\/.*/,
  marketplace: /^\/api\/marketplace\/.*/,
};

/**
 * Determine rate limit type based on the request path
 * @param pathname Request path
 * @returns Rate limit type
 */
function getRateLimitType(pathname: string) {
  if (apiPaths.auth.test(pathname)) return 'auth';
  if (apiPaths.timeline.test(pathname)) return 'timeline';
  if (apiPaths.profiles.test(pathname)) return 'profiles';
  if (apiPaths.marketplace.test(pathname)) return 'marketplace';
  return 'api'; // default
}

/**
 * Main middleware function
 * @param request Next.js request
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply middleware to API routes - this check is redundant with the matcher
  // but we keep it for additional safety
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Skip CSRF check for authentication endpoints
  const skipCsrf = pathname.startsWith('/api/auth/');
  
  // Apply CSRF protection for non-GET methods
  if (!skipCsrf && !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(request.method)) {
    const csrfResult = csrfProtection(request);
    // If CSRF validation fails, return the error response
    if (csrfResult) return csrfResult;
  }
  
  // Apply rate limiting based on the path
  const limiterType = getRateLimitType(pathname);
  const rateLimiter = rateLimit({ type: limiterType });
  
  // Execute rate limiter
  const rateLimitResult = await rateLimiter(request);
  if (rateLimitResult.status === 429) {
    return rateLimitResult;
  }
  
  return NextResponse.next();
}

/**
 * Configure which paths this middleware applies to
 */
export const config = {
  matcher: [
    // ONLY apply to API routes - not to ANY other routes
    '/api/:path*'
  ],
};
