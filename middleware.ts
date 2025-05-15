/**
 * Standard Clerk Authentication Middleware
 *
 * Implements the officially recommended Clerk auth middleware
 * configuration for Next.js applications following best practices.
 */

import { authMiddleware } from "@clerk/nextjs";

// List of public routes that don't require authentication
const publicRoutes = [
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
];

// Routes where Clerk authentication doesn't run at all
const ignoredRoutes = [
  // Standard Clerk paths (we use route groups instead)
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Static file routes that should be completely ignored
  "/_next/(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export default authMiddleware({
  publicRoutes,
  ignoredRoutes,
  // Use Clerk's default behavior with no customizations
  // This follows best practices for Clerk integration
});
 
// Enhanced matcher configuration for proper public asset handling
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};