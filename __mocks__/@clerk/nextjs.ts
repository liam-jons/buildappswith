/**
 * Mock implementation for @clerk/nextjs
 * Version: 1.0.101
 * 
 * This centralized mock definition provides consistent behavior across tests
 * and avoids the hoisting issues that can occur with inline vi.mock() calls.
 * 
 * Uses Vitest's MockInstance type for proper TypeScript support of method chaining.
 */

import { vi, type MockInstance } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Default unauthorized state used when no specific state is provided
 */
const DEFAULT_AUTH_STATE = {
  userId: null,
  isPublicRoute: false
};

// Type definitions matching Clerk's API
type AuthMiddlewareOptions = {
  publicRoutes?: (string | RegExp)[];
  ignoredRoutes?: (string | RegExp)[];
  afterAuth: (
    auth: { userId: string | null; isPublicRoute: boolean },
    req: NextRequest,
    evt: { nextUrl: URL }
  ) => NextResponse | Promise<NextResponse> | null | undefined | void;
};

type AuthMiddlewareFunction = (
  options: AuthMiddlewareOptions
) => (
  req: NextRequest
) => Promise<NextResponse | null | undefined | void>;

type RedirectToSignInFunction = (
  options?: { returnBackUrl?: string }
) => NextResponse;

// Create properly typed mock functions using MockInstance
export const authMiddleware: MockInstance<
  [options: AuthMiddlewareOptions],
  (req: NextRequest) => Promise<NextResponse | null | undefined | void>
> = vi.fn();

export const redirectToSignIn: MockInstance<
  [options?: { returnBackUrl?: string }],
  NextResponse
> = vi.fn();

export const SignedIn = vi.fn();
export const SignedOut = vi.fn();
export const useAuth = vi.fn();
export const useUser = vi.fn();
export const ClerkProvider = vi.fn();

// Set the default implementation for authMiddleware
authMiddleware.mockImplementation((options: AuthMiddlewareOptions) => {
  return async (req: NextRequest) => {
    // Default implementation - should be overridden in specific tests
    // Get auth state from headers for backward compatibility with existing tests
    const userId = req.headers.get('x-auth-user-id');
    const isPublicRouteHeader = req.headers.get('x-is-public-route');
    const isPublicRoute = isPublicRouteHeader === 'true' || 
      (options.publicRoutes && Array.isArray(options.publicRoutes) && 
        options.publicRoutes.some((route: string | RegExp) => {
          if (typeof route === 'string') {
            return req.nextUrl.pathname.startsWith(route);
          }
          return route.test(req.nextUrl.pathname);
        }));
    
    // Build auth state from headers or use default
    const authState = userId || isPublicRouteHeader
      ? { userId, isPublicRoute }
      : DEFAULT_AUTH_STATE;
    
    // Call the afterAuth handler with the auth state
    return options.afterAuth(
      authState,
      req,
      { nextUrl: req.nextUrl }
    );
  };
});

// Set the default implementation for redirectToSignIn
redirectToSignIn.mockImplementation((options) => {
  const redirectUrl = new URL('/sign-in', options?.returnBackUrl || 'http://localhost');
  const response = NextResponse.redirect(redirectUrl);
  
  // Ensure the status is 307 for Next.js 15.3.1 compatibility
  Object.defineProperty(response, 'status', { value: 307 });
  
  return response;
});
