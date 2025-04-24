import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  "/",
  "/login",
  "/signup",
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
];

/**
 * Routes that should be ignored by the middleware
 */
export const ignoredRoutes = [
  "/_next/(.+)",
  "/favicon.ico",
];

/**
 * Clerk auth middleware with custom configuration
 */
export const clerkMiddleware = authMiddleware({
  publicRoutes,
  ignoredRoutes,
  
  // Custom middleware function for advanced auth logic
  async afterAuth(auth, req, evt) {
    // Handle authentication for non-API routes
    if (!req.nextUrl.pathname.startsWith('/api/')) {
      // If the user is not authenticated and the route isn't public, redirect to sign-in
      if (!auth.userId && !auth.isPublicRoute) {
        return redirectToSignIn({ returnBackUrl: req.url });
      }

      // If the user is trying to access auth pages while logged in, redirect to dashboard
      if (auth.userId && (
        req.nextUrl.pathname.startsWith('/login') || 
        req.nextUrl.pathname.startsWith('/signup')
      )) {
        const dashboard = new URL('/dashboard', req.url);
        return NextResponse.redirect(dashboard);
      }
    }

    // Allow all other requests to proceed
    return NextResponse.next();
  },
});

/**
 * Export the middleware config
 */
export const config = {
  matcher: [
    // Apply to all non-api paths
    "/((?!api/|_next/|.*\\..*$).*)",
  ],
};
