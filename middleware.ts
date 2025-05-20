/**
 * Standard Clerk Authentication Middleware
 *
 * This middleware integrates Clerk authentication with Next.js 
 * using the standard `authMiddleware` for simplicity and robustness.
 */

// Import authMiddleware from Clerk
import { authMiddleware } from '@clerk/nextjs';

// Define public and ignored routes directly in the middleware configuration
export default authMiddleware({
  publicRoutes: [
    "/",
    // Auth routes with route groups (using Clerk's catch-all pattern)
    "/\\(auth\\)/sign-in",
    "/\\(auth\\)/sign-in/(.*)",
    "/\\(auth\\)/sign-up",
    "/\\(auth\\)/sign-up/(.*)",
    // Other auth-related paths
    "/sso-callback",
    "/verify",
    "/api/auth/(.+)",
    "/api/webhook/(.+)",
    // Public API endpoints
    "/api/marketplace/builders",
    "/api/marketplace/builders/(.+)",
    "/api/marketplace/featured",
    "/api/marketplace/filters",
    "/api/timeline/(.+)",
    "/api/scheduling/calendly/available-times",
    // Public pages
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
    // Booking pages (public)
    "/book/(.*)",
    // Test pages (public)
    "/calendly-test",
    "/calendly-direct-test",
    // Marketplace pages (public)
    "/marketplace",
    "/marketplace/(.*)",
    "/marketplace/builders",
    "/marketplace/builders/(.*)",
    // Static resources - CRITICAL FOR PUBLIC ACCESS
    "/hero-light.png",
    "/hero-dark.png",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    // Pattern-based static routes
    "/logos/(.*)",
    "/images/(.*)",
    "/fonts/(.*)",
    "/public/(.*)",
    "/assets/(.*)",
    "/static/(.*)",
    // Next.js static resources
    "/_next/static/(.*)",
    "/_next/image/(.*)",
  ],
  ignoredRoutes: [
    "/_next/(.*)", 
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ],
});
 
// Enhanced matcher configuration for proper public asset handling
// This config is retained from the previous Clerk standard middleware setup.
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};