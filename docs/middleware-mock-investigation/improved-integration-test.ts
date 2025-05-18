/**
 * Improved Middleware Integration Test Example
 * Using Vitest's built-in MockInstance type for proper TypeScript support
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddleware, getMiddlewareConfig } from '../../lib/middleware';
import {
  createMockRequest,
  createMockAuthState,
  mockJsonResponse,
  configureMockAuth
} from '../../lib/middleware/test-utils';

// Import the mocked modules (automatically uses __mocks__ version)
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';

// Mock CSRF and rate limit modules
vi.mock('../../lib/csrf', () => ({
  csrfProtection: vi.fn(async (req) => {
    // Simulate CSRF validation
    if (req.headers.get('x-csrf-token') === 'invalid') {
      return mockJsonResponse({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    return null;
  }),
}));

vi.mock('../../lib/rate-limit', () => ({
  rateLimit: vi.fn((options) => {
    return async (req: NextRequest) => {
      // Simulate rate limiting
      if (req.headers.get('x-rate-limit-exceed') === 'true') {
        return mockJsonResponse({ error: 'Rate limit exceeded' }, { status: 429 });
      }
      return NextResponse.next();
    };
  }),
}));

describe('Middleware Integration', () => {
  // Create a test middleware instance with a simplified config
  const config = getMiddlewareConfig();
  let middleware: (req: NextRequest) => Promise<NextResponse>;
  
  // Set up fresh middleware before each test to avoid state issues
  beforeEach(() => {
    vi.resetAllMocks();
    middleware = createMiddleware(config);
  });
  
  describe('Authentication Flow', () => {
    it('should allow access to public routes without authentication', async () => {
      // Configure auth middleware for this test
      const publicRouteState = createMockAuthState(null, true);
      // Use the configureMockAuth helper function for proper typing
      configureMockAuth(authMiddleware, publicRouteState);
      
      const req = createMockRequest('/', 'GET');
      
      const response = await middleware(req);
      
      expect(response?.status).not.toBe(401);
    });
    
    it('should redirect to sign-in for protected routes without authentication', async () => {
      // Configure auth middleware for this test
      const unauthorizedState = createMockAuthState(null, false);
      configureMockAuth(authMiddleware, unauthorizedState);
      
      // Set up redirect mock
      const mockRedirectResponse = NextResponse.redirect(new URL('/sign-in', 'http://localhost'));
      Object.defineProperty(mockRedirectResponse, 'status', { value: 307 });
      redirectToSignIn.mockReturnValueOnce(mockRedirectResponse);
      
      const req = createMockRequest('/dashboard', 'GET');
      
      const response = await middleware(req);
      
      expect(response).toBe(mockRedirectResponse);
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/sign-in');
    });
    
    it('should handle a complete authenticated API request flow', async () => {
      // Configure auth middleware for this test
      const authenticatedState = createMockAuthState('user_123', false);
      configureMockAuth(authMiddleware, authenticatedState);
      
      const req = createMockRequest('/api/users/profile', 'GET');
      
      const response = await middleware(req);
      
      expect(response?.status).not.toBe(401);
      expect(response?.status).not.toBe(403);
      expect(response?.status).not.toBe(429);
      expect(response?.headers.get('content-security-policy')).toBeDefined();
    });
    
    it('should reject a request that fails multiple checks', async () => {
      // Configure auth middleware for this test
      const unauthorizedState = createMockAuthState(null, false);
      configureMockAuth(authMiddleware, unauthorizedState);
      
      // Mock NextResponse.json for this test
      const mockResponse = mockJsonResponse({ error: 'Unauthorized' }, { status: 401 });
      vi.spyOn(NextResponse, 'json').mockReturnValueOnce(mockResponse);
      
      const req = createMockRequest('/api/users/profile', 'POST', {
        'x-csrf-token': 'invalid',
        'x-rate-limit-exceed': 'true'
      });
      
      const response = await middleware(req);
      
      // Should fail at the first check (auth) and not proceed to others
      expect(response).toBe(mockResponse);
      expect(response?.status).toBe(401);
    });
  });
});
