/**
 * Configuration-Driven Middleware for Buildappswith Platform
 * Version: 1.0.80
 * 
 * Implements global middleware for the Next.js application using a configuration-driven approach:
 * - Authentication via Clerk
 * - Role-based access control for protected resources
 * - API route protection with rate limiting
 * - CSRF protection for mutation operations
 * - Security headers for all responses
 * - Error handling with structured logging
 * - Performance monitoring with header-based metrics
 * 
 * This file uses a factory pattern to create middleware components based on configuration.
 */

import { createMiddleware, getMiddlewareConfig, MIDDLEWARE_VERSION } from './lib/middleware';

// Get configuration with environment-specific overrides
const config = getMiddlewareConfig();

// Create middleware with configuration
const middleware = createMiddleware(config);

// Export the configured middleware
export default middleware;

/**
 * Configure which paths middleware will run on
 */
export const config = {
  matcher: getMiddlewareConfig().matcher,
};
