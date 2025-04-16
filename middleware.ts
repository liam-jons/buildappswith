import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth-config';

export async function middleware(req: NextRequest) {
  const session = await auth();

  // If no session exists, check if the route is protected
  if (!session?.user) {
    const protectedPaths = ['/platform/', '/profile/', '/dashboard/'];
    const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

    // If it's a protected path without a session, redirect to login
    if (isProtected) {
      const loginUrl = new URL('/login', req.url);
      // Add returnTo parameter to redirect back after login
      loginUrl.searchParams.set('returnTo', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If session exists or the route is not protected, allow the request to proceed
  return NextResponse.next();
}

// Keep your existing config matcher
export const config = {
  matcher: [
    // Apply middleware to these routes
    "/platform/:path*",
    "/profile/:path*",
    "/dashboard/:path*",

    // Exclude specific paths using negative lookahead if needed,
    // but the logic above handles redirection based on protectedPaths.
    // The matcher ensures the middleware runs for relevant paths.
    // Example: '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
