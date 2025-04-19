import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth/auth';

/**
 * Middleware function that runs before requests are processed
 * This handles route protection and redirects based on authentication status
 */
export async function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  // Define which paths should be protected (require authentication)
  const protectedPaths = [
    '/admin',
    '/profile',
    '/dashboard',
    '/builder-dashboard',
    '/client-dashboard'
  ];

  // Define paths that should redirect authenticated users (login/register pages)
  const authRoutes = ['/login', '/signup', '/signin'];

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthRoute = authRoutes.some(path => pathname.startsWith(path));

  // Get authentication status
  const session = await auth();
  
  // If accessing a protected route without being authenticated, redirect to login
  if (isProtectedPath && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // If already authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Continue with the request for all other cases
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  // Match auth and protected paths, but exclude certain API routes
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/builder-dashboard/:path*',
    '/client-dashboard/:path*',
    '/login',
    '/signup',
    '/signin'
  ],
};
