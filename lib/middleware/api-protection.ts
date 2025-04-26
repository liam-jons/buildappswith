/**
 * API Protection Middleware Components
 * Version: 1.0.74
 * 
 * Provides modular middleware components for API protection:
 * - CSRF protection for mutation operations
 * - Rate limiting for API routes
 * - Security headers for all responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '../csrf';
import { rateLimit } from '../rate-limit';
import { 
  ApiProtectionConfig, 
  getRateLimitType
} from './config';

/**
 * Apply CSRF protection middleware
 * @param request Next.js request
 * @param config CSRF configuration
 * @returns Response if CSRF validation fails, null otherwise
 */
export async function applyCsrfProtection(
  request: NextRequest, 
  config: ApiProtectionConfig['csrf']
): Promise<NextResponse | null> {
  // Skip if CSRF is disabled
  if (!config.enabled) {
    return null;
  }
  
  // Skip for non-mutation methods
  if (['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(request.method)) {
    return null;
  }
  
  const { pathname } = request.nextUrl;
  
  // Skip for excluded paths
  if (config.excludePatterns && config.excludePatterns.some(pattern => {
    return typeof pattern === 'string'
      ? pathname.startsWith(pattern)
      : pattern.test(pathname);
  })) {
    return null;
  }
  
  // Apply CSRF protection
  return csrfProtection(request);
}

/**
 * Apply rate limiting middleware
 * @param request Next.js request
 * @param config Rate limit configuration
 * @returns Rate limit response or null
 */
export async function applyRateLimit(
  request: NextRequest,
  config: ApiProtectionConfig['rateLimit']
): Promise<NextResponse | null> {
  // Skip if rate limiting is disabled
  if (!config.enabled) {
    return null;
  }
  
  const { pathname } = request.nextUrl;
  const limiterType = getRateLimitType(pathname);
  
  // Get the appropriate limit for this route type
  const limit = config.typeConfig[limiterType];
  
  // Apply rate limiting
  const rateLimiter = rateLimit({ 
    type: limiterType,
    limit: limit,
    windowSize: config.windowSize
  });
  
  const rateLimitResult = await rateLimiter(request);
  
  if (rateLimitResult.status === 429) {
    return rateLimitResult;
  }
  
  return null;
}

/**
 * Apply security headers to response
 * @param response Next.js response
 * @param config Security headers configuration
 * @returns Response with security headers
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: ApiProtectionConfig['securityHeaders']
): NextResponse {
  // Apply each configured security header
  for (const [headerName, headerValue] of Object.entries(config)) {
    // Skip disabled headers (false value)
    if (headerValue === false) {
      continue;
    }
    
    // Convert camelCase to kebab-case for header names
    const formattedHeaderName = headerName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    
    // Set the header
    response.headers.set(formattedHeaderName, headerValue);
  }
  
  return response;
}

/**
 * Apply all API protection middleware
 * @param request Next.js request
 * @param config API protection configuration
 * @returns Response from middleware or null to continue
 */
export async function applyApiProtection(
  request: NextRequest,
  config: ApiProtectionConfig
): Promise<NextResponse | null> {
  // Apply CSRF protection
  const csrfResult = await applyCsrfProtection(request, config.csrf);
  if (csrfResult) return csrfResult;
  
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, config.rateLimit);
  if (rateLimitResult) return rateLimitResult;
  
  // If all checks pass, continue with added security headers
  const response = NextResponse.next();
  return applySecurityHeaders(response, config.securityHeaders);
}
