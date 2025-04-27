/**
 * Middleware Tests
 * Version: 1.0.114
 * 
 * Tests for the middleware implementation using new Clerk authentication utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockUsers } from './__tests__/mocks/users';

// Set up mocks first, before importing middleware
// Use the new mockClerk pattern from @clerk/nextjs.ts
vi.mock('@clerk/nextjs', () => {
  // Import the default mock
  const { authMiddleware, redirectToSignIn } = vi.importActual('__mocks__/@clerk/nextjs.ts');
  
  // Create a custom implementation for testing
  return {
    authMiddleware: vi.fn(({ afterAuth }) => {
      return async (req) => {
        // Get auth info from headers for testing purposes
        const userId = req.headers.get('x-auth-user-id');
        const isPublicRoute = req.headers.get('x-is-public-route') === 'true';
        
        // Call the afterAuth handler with the auth state
        return afterAuth(
          { userId, isPublicRoute },
          req,
          { nextUrl: req.nextUrl }
        );
      };
    }),
    redirectToSignIn: vi.fn(() => {
      const redirectUrl = new URL('https://example.com/login');
      return NextResponse.redirect(redirectUrl);
    }),
    auth: vi.fn(() => ({
      userId: null,
      sessionClaims: null,
      getToken: vi.fn().mockResolvedValue(null),
    })),
  };
});

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      next: () => ({
        headers: new Map(),
        status: 200,
      }),
      redirect: (url) => ({
        headers: new Map(),
        status: 302,
        url: url.toString(),
      }),
      json: (data, options) => ({
        headers: new Map(),
        status: options?.status || 200,
        data,
      }),
    },
  };
});

// Mock performance tracking
vi.mock('../lib/middleware/performance', () => ({
  trackPerformance: async (_name, _req, fn) => {
    return await fn();
  },
  addPerformanceHeaders: (response) => response,
  PerformanceEntry: class {},
}));

// Mock API protection
vi.mock('../lib/middleware/api-protection', () => ({
  applyApiProtection: () => NextResponse.next(),
}));

// Mock RBAC middleware
vi.mock('../lib/middleware/rbac', () => ({
  rbacMiddleware: () => null,
}));

// Import middleware module after mocks are set up
import { createMiddleware, getMiddlewareConfig } from '../lib/middleware';

describe('Middleware', () => {
  let middleware;
  
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create middleware for testing
    const config = getMiddlewareConfig();
    middleware = createMiddleware(config);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should redirect unauthenticated users from protected routes', async () => {
    // Create request to protected route
    const req = new NextRequest(new URL('https://buildappswith.com/dashboard'));
    
    // Execute middleware
    const res = await middleware(req);
    
    // Check response
    expect(res.status).toBe(302);
    expect(res.url).toBe('https://example.com/login');
  });
  
  it('should allow access to public routes', async () => {
    // Create request to public route with header indicating it's a public route
    const req = new NextRequest(new URL('https://buildappswith.com/'));
    req.headers.set('x-is-public-route', 'true');
    
    // Execute middleware
    const res = await middleware(req);
    
    // Check response
    expect(res.status).toBe(200);
  });
  
  it('should allow authenticated users to access protected routes', async () => {
    // Create request to protected route with authenticated user
    const req = new NextRequest(new URL('https://buildappswith.com/dashboard'));
    req.headers.set('x-auth-user-id', mockUsers.client.clerkId);
    
    // Execute middleware
    const res = await middleware(req);
    
    // Check response (undefined means NextResponse.next() which allows the request)
    expect(res).toBeUndefined();
  });
  
  it('should return 401 for unauthenticated API requests', async () => {
    // Create request to protected API route
    const req = new NextRequest(new URL('https://buildappswith.com/api/protected-endpoint'));
    
    // Execute middleware
    const res = await middleware(req);
    
    // Check response
    expect(res.status).toBe(401);
    expect(res.data).toHaveProperty('error');
  });
});
