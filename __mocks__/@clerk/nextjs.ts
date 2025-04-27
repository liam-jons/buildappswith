/**
 * Mock implementation for @clerk/nextjs
 * Version: 1.0.112
 * 
 * This centralized mock definition provides consistent behavior across tests
 * and avoids the hoisting issues that can occur with inline vi.mock() calls.
 * 
 * Uses Vitest's MockInstance type for proper TypeScript support of method chaining.
 */

import { vi, type MockInstance } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '../__tests__/mocks/users';
import { UserRole } from '@/lib/auth/types';

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

// Default mock user (client role)
const defaultMockUser = {
  id: mockUsers.client.clerkId,
  firstName: mockUsers.client.name?.split(' ')[0] || 'Test',
  lastName: mockUsers.client.name?.split(' ')[1] || 'User',
  fullName: mockUsers.client.name,
  username: mockUsers.client.name?.replace(' ', '').toLowerCase() || 'testuser',
  primaryEmailAddress: {
    emailAddress: mockUsers.client.email,
    id: 'email-id',
    verification: { status: mockUsers.client.verified ? 'verified' : 'unverified' }
  },
  primaryEmailAddressId: 'email-id',
  emailAddresses: [{
    emailAddress: mockUsers.client.email,
    id: 'email-id',
    verification: { status: mockUsers.client.verified ? 'verified' : 'unverified' }
  }],
  imageUrl: mockUsers.client.image,
  publicMetadata: {
    roles: mockUsers.client.roles || [UserRole.CLIENT],
    verified: mockUsers.client.verified || false,
    completedOnboarding: true,
    stripeCustomerId: mockUsers.client.stripeCustomerId || null,
  },
  privateMetadata: {},
  unsafeMetadata: {},
  createdAt: new Date().toISOString(),
  reload: vi.fn().mockResolvedValue(undefined),
  signOut: vi.fn().mockResolvedValue(undefined),
};

// Default auth state
const defaultAuthState = {
  isLoaded: true,
  isSignedIn: true,
  userId: defaultMockUser.id,
  sessionId: `session-${defaultMockUser.id}`,
  getToken: vi.fn().mockResolvedValue('mock-token'),
};

// Create middleware mock functions
export const authMiddleware: MockInstance<
  [options: AuthMiddlewareOptions],
  (req: NextRequest) => Promise<NextResponse | null | undefined | void>
> = vi.fn();

export const redirectToSignIn: MockInstance<
  [options?: { returnBackUrl?: string }],
  NextResponse
> = vi.fn();

// Create component mock functions
export const SignedIn = vi.fn(({ children }) => children);
export const SignedOut = vi.fn(() => null);

// Create hook mock functions
export const useAuth = vi.fn().mockReturnValue(defaultAuthState);
export const useUser = vi.fn().mockReturnValue({
  isLoaded: true,
  isSignedIn: true,
  user: defaultMockUser,
});

// Create provider mock
export const ClerkProvider = vi.fn(({ children }) => children);

// Create client mock 
export const clerkClient = {
  users: {
    getUser: vi.fn().mockResolvedValue(defaultMockUser),
    updateUser: vi.fn().mockResolvedValue(defaultMockUser),
    getCount: vi.fn().mockResolvedValue(1),
    getUserList: vi.fn().mockResolvedValue([defaultMockUser]),
  },
  sessions: {
    getSessionList: vi.fn().mockResolvedValue([]),
    revokeSession: vi.fn().mockResolvedValue({}),
  }
};

// Create server utilities
export const currentUser = vi.fn().mockResolvedValue(defaultMockUser);
export const auth = vi.fn().mockResolvedValue(defaultAuthState);

// Set the default implementation for authMiddleware
authMiddleware.mockImplementation((options: AuthMiddlewareOptions) => {
  return async (req: NextRequest) => {
    // Get auth state from headers for backward compatibility with existing tests
    const userId = req.headers.get('x-auth-user-id') || defaultMockUser.id;
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
    const authState = { 
      userId, 
      isPublicRoute,
      sessionId: `session-${userId}`,
    };
    
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
  const redirectUrl = new URL('/login', options?.returnBackUrl || 'http://localhost');
  const response = NextResponse.redirect(redirectUrl);
  
  // Ensure the status is 307 for Next.js 15.3.1 compatibility
  Object.defineProperty(response, 'status', { value: 307 });
  
  return response;
});

// Export the getAuth function for server components
export const getAuth = vi.fn().mockReturnValue({
  userId: defaultMockUser.id,
  sessionId: `session-${defaultMockUser.id}`,
  getToken: vi.fn().mockResolvedValue('mock-token'),
});

// Export additional components
export const UserButton = vi.fn().mockImplementation(() => null);
export const SignIn = vi.fn().mockImplementation(() => null);
export const SignUp = vi.fn().mockImplementation(() => null);
