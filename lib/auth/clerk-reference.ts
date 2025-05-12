import { authMiddleware } from "@clerk/nextjs";

// Use Clerk's recommended matcher pattern
export default authMiddleware({
  publicRoutes: [
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
});

// Configure the middleware for proper patterns
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