import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

/**
 * Clerk middleware for authentication and route protection
 */
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
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
  ],
  
  // Routes that should be accessible to visitors who are authenticated
  // even if the visitor passes middleware to specific paths, 
  // they may not have appropriate permissions to access certain resources at these paths
  ignoredRoutes: [
    "/api/(.+)",
    "/_next/(.+)",
    "/favicon.ico",
  ],
  
  // Custom middleware function for advanced auth logic
  async afterAuth(auth, req, evt) {
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

    // Allow all other requests to proceed
    return NextResponse.next();
  },
});

// Configure which paths middleware will run on
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
