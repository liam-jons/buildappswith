/**
 * Middleware Testing Utilities
 * Version: 1.0.101
 * 
 * Provides consistent utilities for testing middleware:
 * - Authentication mock helpers
 * - Request/response factory methods
 * - Status code assertion utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { vi, type MockInstance } from 'vitest';

/**
 * Configure a mock authMiddleware function for specific auth states
 * This function properly handles type safety for the mock method chaining
 * 
 * @param mockFn The mock function to configure
 * @param authState Authentication state to mock
 */
export function configureMockAuth<TArgs extends any[] = any[], TReturn = any>(
  mockFn: MockInstance<TArgs, TReturn>,
  authState: MockAuthState
): void {
  mockFn.mockImplementationOnce((options: any) => {
    return async (req: NextRequest) => {
      return options.afterAuth(
        authState,
        req,
        { nextUrl: req.nextUrl }
      );
    };
  });
}

// Auth state types
export type MockAuthState = {
  userId: string | null;
  isPublicRoute: boolean;
};

/**
 * Create a mock request with consistent headers and structure
 * @param pathname URL pathname
 * @param method HTTP method
 * @param headers Additional headers
 * @returns Mocked NextRequest instance
 */
export function createMockRequest(
  pathname = '/',
  method = 'GET',
  headers: Record<string, string> = {}
): NextRequest {
  const url = new URL(pathname, 'http://localhost');
  const req = new Request(url, { method });
  const nextReq = new NextRequest(req);
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    nextReq.headers.set(key, value);
  });
  
  return nextReq;
}

/**
 * Create a mock auth state for testing
 * @param userId User ID or null for unauthenticated
 * @param isPublicRoute Whether the route is public
 * @returns Mock auth state object
 */
export function createMockAuthState(
  userId: string | null = null,
  isPublicRoute: boolean = false
): MockAuthState {
  return { userId, isPublicRoute };
}

/**
 * Mock the Clerk authMiddleware for specific auth states
 * @param authState Authentication state to mock
 * @returns Mocked implementation function
 */
export function mockClerkAuth(authState: MockAuthState) {
  return vi.fn(options => {
    return async (req: NextRequest) => {
      return options.afterAuth(
        authState,
        req,
        { nextUrl: req.nextUrl }
      );
    };
  });
}

/**
 * Mock NextResponse.json with proper status handling
 * @param body Response body
 * @param options Response options
 * @returns Mocked JSON response with status property
 */
export function mockJsonResponse(
  body: Record<string, any>,
  options: { status?: number } = {}
) {
  const status = options.status || 200;
  const headers = new Headers();
  
  const response = {
    status,
    statusText: getStatusText(status),
    headers,
    json: async () => body,
    text: async () => JSON.stringify(body),
    clone: () => ({ ...response }),
  } as unknown as NextResponse;
  
  return response;
}

/**
 * Get status text for HTTP status code
 * @param status HTTP status code
 * @returns Status text
 */
function getStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable'
  };
  
  return statusMap[status] || 'Unknown';
}

/**
 * Create a consistent mock for the redirectToSignIn function
 * @returns Mocked implementation function
 */
export function mockRedirectToSignIn() {
  return vi.fn(() => {
    const response = NextResponse.redirect(new URL('/sign-in', 'http://localhost'));
    // Ensure the status is 307 for Next.js 15.3.1 compatibility
    Object.defineProperty(response, 'status', { value: 307 });
    return response;
  });
}

/**
 * Set up common middleware mocks used across multiple test files
 * @returns Object containing mocked dependencies
 */
export function setupMiddlewareMocks() {
  // Mock CSRF protection
  const csrfMock = vi.fn().mockResolvedValue(null);
  
  // Mock rate limiting
  const rateLimitMock = vi.fn().mockImplementation(() => {
    return async () => NextResponse.next();
  });
  
  // Return all mocks for use in tests
  return {
    csrfProtection: csrfMock,
    rateLimit: rateLimitMock,
  };
}
