/**
 * Middleware Factory for Buildappswith Platform
 * Version: 1.0.80
 * 
 * Creates middleware composition based on configuration
 * Allows easy addition and removal of middleware components
 * Validates configuration before creating middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { MiddlewareConfig } from './config';
import { applyApiProtection } from './api-protection';
import { validateMiddlewareConfig, formatValidationErrors } from './validation';
import { trackPerformance, addPerformanceHeaders, PerformanceEntry } from './performance';
import { handleMiddlewareError, withErrorHandling } from './error-handling';
import { middlewareLogger, withRequestLogging } from './logging';
import { rbacMiddleware } from './rbac';

/**
 * Create middleware with the given configuration
 * @param config Middleware configuration
 * @returns Configured middleware function
 * @throws Error if configuration is invalid
 */
export function createMiddleware(config: MiddlewareConfig) {
  // Validate configuration before creating middleware
  const validationErrors = validateMiddlewareConfig(config);
  if (validationErrors.length > 0) {
    throw new Error(formatValidationErrors(validationErrors));
  }

  // Log middleware initialization
  middlewareLogger.info(
    'middleware',
    `Initializing middleware with ${config.auth.publicRoutes.length} public routes`,
    { environment: process.env.NODE_ENV || 'development' }
  );

  // Create middleware with error handling and request logging
  const middlewareFn = authMiddleware({
    publicRoutes: config.auth.publicRoutes,
    ignoredRoutes: config.auth.ignoredRoutes,
    
    async afterAuth(auth, req, evt) {
      const { pathname } = req.nextUrl;
      const performanceEntries: PerformanceEntry[] = [];
      
      try {
        // Apply RBAC middleware
        const rbacResponse = await trackPerformance('rbac', req, async () => {
          return rbacMiddleware(req);
        });
        
        if (rbacResponse) {
          return rbacResponse;
        }
        
        // Handle API routes
        if (pathname.startsWith('/api/')) {
          // Track auth check performance
          const isPublicApiRoute = await trackPerformance('auth-check', req, async () => {
            return config.auth.publicRoutes.some(route => {
              if (typeof route === 'string') {
                return pathname.startsWith(route);
              }
              return route.test(pathname);
            });
          });
          
          // If not authenticated and not a public API route, return unauthorized
          if (!auth.userId && !isPublicApiRoute) {
            middlewareLogger.info(
              'auth',
              `Unauthorized access to API route ${pathname}`,
              { isPublicApiRoute },
              req
            );
            
            return NextResponse.json(
              config.auth.unauthorizedResponse, 
              { status: config.auth.unauthorizedStatusCode }
            );
          }
          
          // Apply API protection middleware with performance tracking
          const apiResponse = await trackPerformance('api-protection', req, async () => {
            return applyApiProtection(req, config.api);
          });
          
          // Add performance headers to API responses
          if (apiResponse) {
            return addPerformanceHeaders(apiResponse, performanceEntries);
          }
          
          return apiResponse;
        }
        
        // Handle non-API routes
        
        // If the user is not authenticated and the route isn't public, redirect to sign-in
        if (!auth.userId && !auth.isPublicRoute) {
          middlewareLogger.info(
            'auth',
            `Redirecting unauthenticated user to sign-in from ${pathname}`,
            undefined,
            req
          );
          
          return redirectToSignIn({ returnBackUrl: req.url });
        }

        // If the user is trying to access auth pages while logged in, redirect to dashboard
        if (auth.userId && (
          pathname.startsWith('/login') || 
          pathname.startsWith('/signup')
        )) {
          middlewareLogger.info(
            'auth',
            `Redirecting authenticated user from ${pathname} to dashboard`,
            { userId: auth.userId },
            req
          );
          
          const dashboard = new URL('/dashboard', req.url);
          return NextResponse.redirect(dashboard);
        }

        // Create and configure the response
        const response = await trackPerformance('response-creation', req, async () => {
          const resp = NextResponse.next();
          
          // Add CSP headers from config
          if (config.api.securityHeaders.contentSecurityPolicy) {
            resp.headers.set(
              'Content-Security-Policy', 
              config.api.securityHeaders.contentSecurityPolicy
            );
          }
          
          // Add other security headers
          Object.entries(config.api.securityHeaders).forEach(([key, value]) => {
            if (key !== 'contentSecurityPolicy' && value) {
              // Convert camelCase to kebab-case
              const headerName = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
              resp.headers.set(headerName, value);
            }
          });
          
          return resp;
        });
        
        // Add performance headers
        return addPerformanceHeaders(response, performanceEntries);
      } catch (error) {
        middlewareLogger.error(
          'middleware',
          `Error in middleware execution: ${(error as Error).message}`,
          { 
            pathname,
            stack: (error as Error).stack,
          },
          req
        );
        
        return handleMiddlewareError(error as Error, req);
      }
    },
  });

  // Return the middleware function directly (already includes logging)
  return middlewareFn;
}
