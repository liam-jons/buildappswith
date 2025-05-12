/**
 * Standard Clerk Authentication Middleware
 * 
 * Implements the officially recommended Clerk auth middleware
 * configuration for Next.js applications.
 */

import { authMiddleware } from "@clerk/nextjs";
 
// List of public routes that don't require authentication
const publicRoutes = [
  "/",
  // Both old and new auth paths need to be public while we're transitioning
  "/sign-in",
  "/sign-in/(.*)",
  "/sign-up",
  "/sign-up/(.*)",
  "/(auth)/sign-in",
  "/(auth)/sign-in/(.*)",
  "/(auth)/sign-up",
  "/(auth)/sign-up/(.*)",
  "/sso-callback",
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
  "/marketplace",
  "/marketplace/(.*)",
  "/marketplace/builders",
  "/marketplace/builders/(.*)",
];
 
export default authMiddleware({
  publicRoutes,
  // Ensure default Clerk cookie settings are used
  // Remove any custom cookie configurations

  // Add a custom afterAuth handler to redirect between auth routes
  afterAuth(auth, req, evt) {
    // Handle standard afterAuth behavior
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/(auth)/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      evt.redirectTo(signInUrl);
      return;
    }

    // Handle special case for old auth routes
    const url = new URL(req.url);
    const path = url.pathname;

    // Redirect old auth routes to new ones under /(auth)
    if (path === '/sign-in') {
      const params = new URLSearchParams(url.search);
      const newUrl = new URL('/(auth)/sign-in', req.url);

      // Copy all query parameters
      params.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });

      evt.redirectTo(newUrl);
      return;
    }

    if (path === '/sign-up') {
      const params = new URLSearchParams(url.search);
      const newUrl = new URL('/(auth)/sign-up', req.url);

      // Copy all query parameters
      params.forEach((value, key) => {
        newUrl.searchParams.set(key, value);
      });

      evt.redirectTo(newUrl);
      return;
    }
  }
});
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};