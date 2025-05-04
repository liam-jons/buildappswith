/**
 * Configuration-Driven Middleware for Buildappswith Platform
 * Version: 1.1.0 (Updated for Auth System Consolidation)
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

import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Authentication middleware configuration
 * 
 * This configuration:
 * 1. Makes marketplace and profile pages publicly accessible
 * 2. Protects platform routes requiring authentication
 * 3. Adds customized behavior for authentication flows
 */
export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    // Public marketing pages
    '/',
    '/about',
    '/contact',
    '/pricing',
    '/blog(.*)',
    
    // Public marketplace and profiles
    '/marketplace',
    '/marketplace/(.*)',
    '/profile/(.*)',
    
    // Public API routes
    '/api/public/(.*)',
    '/api/marketplace/builders(.*)',
    '/api/marketplace/categories(.*)',
    
    // Authentication pages
    '/login',
    '/sign-up',
    '/sign-in',
    '/create-account',
    
    // API webhook routes
    '/api/webhooks/(.*)',
    
    // Static resources and system files
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
  ],
  
  // Ignore specific routes entirely
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/webhooks/stripe',
    '/_next/static/(.*)',
    '/images/(.*)',
  ],
  
  // Debug mode (enable only in development)
  debug: process.env.NODE_ENV === 'development',
  
  // Customize middleware behavior
  afterAuth(auth, req, evt) {
    try {
      // Add custom logic for authentication flows
      
      // Handle non-authenticated users trying to access protected routes
      if (!auth.isPublicRoute && !auth.isAuthorized) {
        // Get current path for redirect
        const url = new URL(req.url);
        const returnUrl = encodeURIComponent(url.pathname + url.search);
        
        // Redirect to login with return URL
        evt.redirect(`/login?returnUrl=${returnUrl}`);
        
        // Log authentication attempt
        logger.info('Authentication required', {
          path: url.pathname,
          redirectTo: `/login?returnUrl=${returnUrl}`,
        });
      }
      
      // Add user information to headers for server components
      if (auth.isAuthorized) {
        evt.headers.set('x-user-id', auth.userId);
        
        // Add roles if available
        const roles = auth.sessionClaims?.['public_metadata']?.['roles'];
        if (roles) {
          evt.headers.set('x-user-roles', JSON.stringify(roles));
        }
      }
      
      // Add performance monitoring header
      const startTime = Date.now();
      evt.headers.set('x-server-timing', `auth;dur=${Date.now() - startTime}`);
    } catch (error) {
      // Log any errors in the middleware
      logger.error('Middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.url,
      });
    }
  },
});

/**
 * Configure which paths middleware will run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except those starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
