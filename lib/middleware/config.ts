/**
 * Middleware Configuration for Buildappswith Platform
 * Version: 1.0.80
 * 
 * Provides configuration-driven middleware functionality for:
 * - Authentication via Clerk
 * - API route protection with rate limiting
 * - CSRF protection for mutation operations
 * - Security headers for all responses
 *
 * This file allows for declarative configuration of middleware behavior,
 * separating the configuration from the implementation.
 */

import { NextRequest } from 'next/server';

// Type Definitions
export type RoutePattern = string | RegExp;

export type RateLimitType = 'api' | 'auth' | 'timeline' | 'profiles' | 'marketplace';

export type SecurityHeadersConfig = {
  contentSecurityPolicy?: string | false;
  xFrameOptions?: string | false;
  xContentTypeOptions?: string | false;
  referrerPolicy?: string | false;
  strictTransportSecurity?: string | false;
  permissionsPolicy?: string | false;
  crossOriginEmbedderPolicy?: string | false;
  crossOriginOpenerPolicy?: string | false;
  crossOriginResourcePolicy?: string | false;
};

export type CsrfConfig = {
  enabled: boolean;
  excludePatterns?: RoutePattern[];
  cookieName?: string;
  headerName?: string;
  tokenByteSize?: number;
  tokenExpiry?: number;
};

export type RateLimitConfig = {
  enabled: boolean;
  defaultLimit: number;
  windowSize: number; // in seconds
  typeConfig: Record<RateLimitType, number>;
};

export type ApiProtectionConfig = {
  csrf: CsrfConfig;
  rateLimit: RateLimitConfig;
  securityHeaders: SecurityHeadersConfig;
};

export type AuthConfig = {
  publicRoutes: RoutePattern[];
  ignoredRoutes: RoutePattern[];
  unauthorizedStatusCode: number;
  unauthorizedResponse: Record<string, any>;
  redirectOnSignOut?: string;
};

export type MiddlewareConfig = {
  auth: AuthConfig;
  api: ApiProtectionConfig;
  matcher: string[];
};

// Helper functions

/**
 * Get Clerk domains based on environment
 */
export const getClerkDomains = () => {
  // Use environment variables for Clerk domains with fallbacks
  const developmentDomain = process.env.CLERK_DEVELOPMENT_DOMAIN || 'clerk.buildappswith.dev';
  const productionDomain = process.env.CLERK_PRODUCTION_DOMAIN || 'clerk.buildappswith.com';
  
  // Return appropriate domain based on environment
  return process.env.NODE_ENV === 'production' ? productionDomain : developmentDomain;
};

/**
 * Get rate limiting configuration from environment variables
 */
export const getRateLimitConfig = (): RateLimitConfig => {
  return {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    defaultLimit: parseInt(process.env.RATE_LIMIT_DEFAULT || '60', 10),
    windowSize: parseInt(process.env.RATE_LIMIT_WINDOW_SIZE || '60', 10),
    typeConfig: {
      api: parseInt(process.env.RATE_LIMIT_API || '60', 10),
      auth: parseInt(process.env.RATE_LIMIT_AUTH || '10', 10),
      timeline: parseInt(process.env.RATE_LIMIT_TIMELINE || '30', 10),
      profiles: parseInt(process.env.RATE_LIMIT_PROFILES || '40', 10),
      marketplace: parseInt(process.env.RATE_LIMIT_MARKETPLACE || '20', 10),
    },
  };
};

// Default Configurations

/**
 * Default Content Security Policy
 */
export const defaultCspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://flying-troll-12.clerk.accounts.dev https://clerk.io https://*.clerk.com https://${getClerkDomains()} https://*.calendly.com https://assets.calendly.com`,
  `frame-src 'self' https://*.clerk.accounts.dev https://${getClerkDomains()} https://*.calendly.com`,
  "img-src 'self' https://*.clerk.com https://img.clerk.com https://images.clerk.dev https://clerk.buildappswith.com data: https://*.calendly.com",
  `connect-src 'self' https://*.clerk.accounts.dev https://flying-troll-12.clerk.accounts.dev https://clerk.io https://*.clerk.com https://${getClerkDomains()} https://*.calendly.com`,
  "style-src 'self' 'unsafe-inline' https://*.calendly.com",
  "font-src 'self' data: https://*.calendly.com",
];

/**
 * Default public routes that don't require authentication
 */
export const defaultPublicRoutes: RoutePattern[] = [
  "/",
  "/login",
  "/signup",
  "/verify",
  "/api/auth/(.+)",
  "/api/webhook/(.+)",
  "/api/marketplace/builders",
  "/api/marketplace/builders/(.+)", // Make sure builder ID endpoints are public too
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
 * Default ignored routes for middleware
 */
export const defaultIgnoredRoutes: RoutePattern[] = [
  "/_next/(.+)",
  "/favicon.ico",
];

/**
 * Default API path patterns
 */
export const defaultApiPathPatterns = {
  auth: /^\/api\/auth\/.*/,
  timeline: /^\/api\/timeline\/.*/,
  profiles: /^\/api\/builders\/.*/,
  marketplace: /^\/api\/marketplace\/.*/,
};

/**
 * Default middleware configuration
 */
export const defaultMiddlewareConfig: MiddlewareConfig = {
  auth: {
    publicRoutes: defaultPublicRoutes,
    ignoredRoutes: defaultIgnoredRoutes,
    unauthorizedStatusCode: 401,
    unauthorizedResponse: { error: 'Unauthorized' },
    redirectOnSignOut: '/',
  },
  api: {
    csrf: {
      enabled: true,
      excludePatterns: [/^\/api\/auth\//, /^\/api\/webhooks\//, /^\/api\/webhook\//],
      cookieName: 'buildappswith_csrf',
      headerName: 'X-CSRF-Token',
      tokenByteSize: 32,
      tokenExpiry: 60 * 60 * 2, // 2 hours in seconds
    },
    rateLimit: getRateLimitConfig(),
    securityHeaders: {
      contentSecurityPolicy: defaultCspDirectives.join('; '),
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      strictTransportSecurity: 'max-age=31536000; includeSubDomains',
      permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
    },
  },
  matcher: [
    // Match all paths except static files
    '/((?!.+\\.[\\w]+$|_next).*)',
    // Also include root path
    '/',
    // And all API routes
    '/(api|trpc)(.*)',
  ],
};

/**
 * Environment-specific configuration overrides
 */
export const environmentConfigs: Record<string, Partial<MiddlewareConfig>> = {
  development: {
    api: {
      securityHeaders: {
        // In development, we might want to disable HTTPS enforcement
        strictTransportSecurity: false,
      },
      rateLimit: {
        // Higher limits for development
        enabled: false, // Disable rate limiting in development by default
        defaultLimit: 100,
        windowSize: 60,
        typeConfig: {
          api: 100,
          auth: 20,
          timeline: 50,
          profiles: 60,
          marketplace: 40,
        },
      },
    },
  },
  production: {
    // Stricter security in production
    api: {
      csrf: {
        enabled: true,
        excludePatterns: [/^\/api\/auth\//, /^\/api\/webhooks\//, /^\/api\/webhook\//],
        cookieName: 'buildappswith_csrf',
        headerName: 'X-CSRF-Token',
        tokenByteSize: 32,
        tokenExpiry: 60 * 60 * 2,
      },
      rateLimit: getRateLimitConfig(),
      securityHeaders: {
        // Ensure HTTPS enforced in production
        strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
      },
    },
  },
  test: {
    // Disable rate limiting in tests
    api: {
      csrf: {
        enabled: false,
        excludePatterns: [],
        cookieName: 'buildappswith_csrf',
        headerName: 'X-CSRF-Token',
        tokenByteSize: 32,
        tokenExpiry: 60 * 60 * 2,
      },
      rateLimit: {
        enabled: false,
        defaultLimit: 1000,
        windowSize: 60,
        typeConfig: {
          api: 1000,
          auth: 1000,
          timeline: 1000,
          profiles: 1000,
          marketplace: 1000,
        },
      },
      // Simplified security headers for testing
      securityHeaders: {
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.calendly.com https://assets.calendly.com; style-src 'self' 'unsafe-inline' https://*.calendly.com; font-src 'self' data: https://*.calendly.com; frame-src 'self' https://*.calendly.com; img-src 'self' data: https://*.calendly.com; connect-src 'self' https://*.calendly.com",
        strictTransportSecurity: false,
      },
    },
  },
};

/**
 * Helper function to get rate limit type based on the request path
 * @param pathname Request path
 * @returns Rate limit type
 */
export function getRateLimitType(pathname: string): RateLimitType {
  if (defaultApiPathPatterns.auth.test(pathname)) return 'auth';
  if (defaultApiPathPatterns.timeline.test(pathname)) return 'timeline';
  if (defaultApiPathPatterns.profiles.test(pathname)) return 'profiles';
  if (defaultApiPathPatterns.marketplace.test(pathname)) return 'marketplace';
  return 'api'; // default
}

/**
 * Get merged configuration with environment overrides
 * @returns Complete middleware configuration
 */
export function getMiddlewareConfig(): MiddlewareConfig {
  const environment = process.env.NODE_ENV || 'development';
  const envConfig = environmentConfigs[environment] || {};
  
  // Deep merge the environment config with the default config
  return mergeConfigs(defaultMiddlewareConfig, envConfig);
}

/**
 * Deep merge two configuration objects
 * @param base Base configuration
 * @param override Override configuration
 * @returns Merged configuration
 */
export function mergeConfigs<T>(base: T, override: Partial<T>): T {
  const result = { ...base };

  for (const key in override) {
    if (override.hasOwnProperty(key)) {
      const baseValue = (base as any)[key];
      const overrideValue = (override as any)[key];

      // If both values are objects, recursively merge them
      if (
        typeof baseValue === 'object' && 
        baseValue !== null && 
        typeof overrideValue === 'object' && 
        overrideValue !== null &&
        !Array.isArray(baseValue) &&
        !Array.isArray(overrideValue)
      ) {
        (result as any)[key] = mergeConfigs(baseValue, overrideValue);
      } else {
        // Otherwise, use the override value
        (result as any)[key] = overrideValue;
      }
    }
  }

  return result;
}
