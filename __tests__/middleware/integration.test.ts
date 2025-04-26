/**
 * Middleware Integration Tests
 * Version: 1.0.101
 *
 * Tests the complete middleware stack in a realistic application context
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
    
    it('should allow access to protected routes with authentication', async () => {
      // Configure auth middleware for this test
      const authenticatedState = createMockAuthState('user_123', false);
      configureMockAuth(authMiddleware, authenticatedState);
      
      const req = createMockRequest('/dashboard', 'GET');
      
      const response = await middleware(req);
      
      expect(response?.status).not.toBe(401);
      expect(response?.status).not.toBe(307);
    });
    
    it('should redirect authenticated users from login page to dashboard', async () => {
      // Configure auth middleware for this test
      const authenticatedState = createMockAuthState('user_123', true);
      configureMockAuth(authMiddleware, authenticatedState);
      
      // Set up redirect mock
      const mockRedirectResponse = NextResponse.redirect(new URL('/dashboard', 'http://localhost'));
      Object.defineProperty(mockRedirectResponse, 'status', { value: 307 });
      vi.spyOn(NextResponse, 'redirect').mockReturnValueOnce(mockRedirectResponse);
      
      const req = createMockRequest('/login', 'GET');
      
      const response = await middleware(req);
      
      expect(response).toBe(mockRedirectResponse);
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/dashboard');
    });
  });
  
  describe('API Protection Flow', () => {
    it('should return 401 for protected API routes without authentication', async () => {
      // Configure auth middleware for this test
      const unauthorizedState = createMockAuthState(null, false);
      configureMockAuth(authMiddleware, unauthorizedState);
      
      // Create middleware with mocked auth
      const middleware = createMiddleware(config);
      const req = createMockRequest('/api/protected', 'GET');
      
      // Mock NextResponse.json
      const mockResponse = mockJsonResponse({ error: 'Unauthorized' }, { status: 401 });
      vi.spyOn(NextResponse, 'json').mockReturnValueOnce(mockResponse);
      
      const response = await middleware(req);
      
      expect(response).toBe(mockResponse);
      expect(response?.status).toBe(401);
    });
    
    it('should apply CSRF protection for mutation API requests', async () => {
      // Configure auth middleware for this test
      const authenticatedState = createMockAuthState('user_123', false);
      configureMockAuth(authMiddleware, authenticatedState);
      
      const req = createMockRequest('/api/protected', 'POST', {
        'x-csrf-token': 'invalid'
      });
      
      const response = await middleware(req);
      
      expect(response?.status).toBe(403);
    });
    
    it('should apply rate limiting for API requests', async () => {
      // Configure auth middleware for this test
      const authenticatedState = createMockAuthState('user_123', true);
      configureMockAuth(authMiddleware, authenticatedState);
      
      // Create a rate-limit response
      const rateLimitResponse = mockJsonResponse({ error: 'Rate limit exceeded' }, { status: 429 });
      
      // Get access to the mocked rate limit module
      const { rateLimit } = await import('../../lib/rate-limit');
      
      // Override the mocked rateLimit function to return our response
      vi.mocked(rateLimit).mockImplementation(() => {
        return async () => rateLimitResponse;
      });
      
      const req = createMockRequest('/api/protected', 'GET', {
        'x-rate-limit-exceed': 'true'
      });
      
      const response = await middleware(req);
      
      expect(response).toBe(rateLimitResponse);
      expect(response?.status).toBe(429);
      
      // Reset the mock
      vi.mocked(rateLimit).mockClear();
    });
    
    it('should apply security headers to API responses', async () => {
      // Configure auth middleware for this test
      const authenticatedState = createMockAuthState('user_123', true);
      configureMockAuth(authMiddleware, authenticatedState);
      
      const req = createMockRequest('/api/protected', 'GET');
      
      const response = await middleware(req);
      
      expect(response?.headers.get('content-security-policy')).toBeDefined();
      expect(response?.headers.get('x-frame-options')).toBeDefined();
    });
  });
  
  describe('Legacy Route Handling', () => {
    it('should redirect legacy auth routes to new paths', async () => {
      // Create redirect response
      const redirectResponse = NextResponse.redirect(new URL('/login', 'http://localhost'));
      Object.defineProperty(redirectResponse, 'status', { value: 307 });
      
      // Mock next response redirect
      vi.spyOn(NextResponse, 'redirect').mockReturnValueOnce(redirectResponse);
      
      const req = createMockRequest('/api/auth/signin', 'GET');
      
      const response = await middleware(req);
      
      expect(response?.status).toBe(307);
      expect(response?.headers.get('location')).toContain('/login');
    });
    
    it('should return JSON for deprecated endpoints', async () => {
      // Create JSON response
      const jsonResponse = mockJsonResponse(
        { error: 'This endpoint is no longer available. Please use Clerk authentication.' }, 
        { status: 404 }
      );
      
      // Mock next response json
      vi.spyOn(NextResponse, 'json').mockReturnValueOnce(jsonResponse);
      
      const req = createMockRequest('/api/auth/session', 'GET');
      
      const response = await middleware(req);
      
      expect(response?.status).toBe(404);
      const body = await response?.json();
      expect(body).toHaveProperty('error');
    });
  });
  
  describe('Complete End-to-End Flow', () => {
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
