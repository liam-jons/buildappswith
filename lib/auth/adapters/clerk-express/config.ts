/**
 * Clerk Express SDK Configuration
 * Version: 1.0.0
 * 
 * This file provides configuration options for the Clerk Express SDK adapter.
 */

/**
 * Configuration options for the Clerk Express SDK
 */
export interface ClerkExpressConfig {
  /**
   * Publishable key for Clerk
   */
  publishableKey?: string;
  
  /**
   * Secret key for Clerk
   */
  secretKey?: string;
  
  /**
   * URL to redirect to for sign-in
   */
  signInUrl?: string;
  
  /**
   * Frontend API URL for Clerk (for EU data residency)
   */
  frontendApi?: string;
  
  /**
   * Enable debug mode
   */
  debug?: boolean;
}

/**
 * Get the default configuration for Clerk Express SDK
 * 
 * @returns Clerk Express SDK configuration
 */
export function getDefaultClerkExpressConfig(): ClerkExpressConfig {
  return {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
    signInUrl: '/sign-in',
    ...(process.env.CLERK_DATA_RESIDENCY === 'eu' && { 
      frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API 
    }),
    debug: process.env.NODE_ENV === 'development',
  };
}

/**
 * Public routes that don't require authentication
 * This is exported from middleware.ts
 */
export const defaultPublicRoutes = [
  "/",
  "/login",
  "/signup",
  "/signin",
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
  "/sso-callback",
  "/verify",
  "/api/auth/(.+)",
  "/api/webhook/(.+)",
  "/toolkit",
  "/how-it-works",
  "/weekly-sessions",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

/**
 * Routes that should be ignored by the middleware
 * This is exported from middleware.ts
 */
export const defaultIgnoredRoutes = [
  "/_next/(.+)",
  "/favicon.ico",
];
