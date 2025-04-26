/**
 * Middleware Tests
 * Version: 1.0.80
 * 
 * Tests for the middleware implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Set up mocks first, before importing middleware
vi.mock('@clerk/nextjs', () => {
  const redirectUrl = new URL('https://example.com/login');
  return {
    authMiddleware: vi.fn(({ afterAuth }) => {
      return async (req) => {
        const auth = {
          userId: null,
          isPublicRoute: false,
          sessionClaims: null,
        };
        return afterAuth(auth, req, {});
      };
    }),
    redirectToSignIn: vi.fn(() => {
      return NextResponse.redirect(redirectUrl);
    }),
    auth: vi.fn(() => ({
      userId: null,
      sessionClaims: null,
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
    // Create request to public route
    const req = new NextRequest(new URL('https://buildappswith.com/'));
    
    // Mock auth middleware to treat this as a public route
    vi.mocked(require('@clerk/nextjs').authMiddleware).mockImplementationOnce(({ afterAuth }) => {
      return async (req) => {
        const auth = {
          userId: null,
          isPublicRoute: true,
          sessionClaims: null,
        };
        return afterAuth(auth, req, {});
      };
    });
    
    // Create new middleware instance with mock
    const config = getMiddlewareConfig();
    middleware = createMiddleware(config);
    
    // Execute middleware
    const res = await middleware(req);
    
    // Check response
    expect(res.status).toBe(200);
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
