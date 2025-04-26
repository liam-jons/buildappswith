/**
 * Middleware Factory Tests
 * Version: 1.0.101
 *
 * Tests for the middleware factory module using centralized mock approach
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddleware } from '../../lib/middleware/factory';
import { MiddlewareConfig } from '../../lib/middleware/config';
import { applyApiProtection } from '../../lib/middleware/api-protection';
import { handleLegacyRoutes } from '../../lib/middleware/legacy-routes';
import {
  createMockRequest,
  createMockAuthState,
  mockJsonResponse,
  configureMockAuth
} from '../../lib/middleware/test-utils';

// Import the mocked modules (automatically uses __mocks__ version)
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';

// Mock middleware dependencies
vi.mock('../../lib/middleware/api-protection', () => ({
  applyApiProtection: vi.fn()
}));

vi.mock('../../lib/middleware/legacy-routes', () => ({
  handleLegacyRoutes: vi.fn()
}));

describe('Middleware Factory', () => {
  
  // Create mock config
  const createMockConfig = (): MiddlewareConfig => ({
    auth: {
      publicRoutes: ['/', '/login'],
      ignoredRoutes: ['/_next/'],
      unauthorizedStatusCode: 401,
      unauthorizedResponse: { error: 'Unauthorized' }
    },
    api: {
      csrf: {
        enabled: true,
        excludePatterns: [/^\/api\/auth\//]
      },
      rateLimit: {
        enabled: true,
        defaultLimit: 60,
        windowSize: 60,
        typeConfig: { api: 60, auth: 10, timeline: 30, profiles: 40, marketplace: 20 }
      },
      securityHeaders: {
        contentSecurityPolicy: "default-src 'self'",
        xFrameOptions: 'DENY'
      }
    },
    legacyRoutes: {
      enabled: true,
      routes: [
        {
          path: '/api/auth/signin',
          action: 'redirect',
          target: '/login'
        }
      ]
    },
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)']
  });
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup mocks with default behavior
    vi.mocked(handleLegacyRoutes).mockReturnValue(null);
    vi.mocked(applyApiProtection).mockResolvedValue(NextResponse.next());
  });
  
  it('should check for legacy routes first', async () => {
    const config = createMockConfig();
    const middleware = createMiddleware(config);
    const req = createMockRequest('/api/auth/signin');
    
    // Set up legacy route handler to return a response
    const mockLegacyResponse = NextResponse.redirect(new URL('/login', req.url));
    vi.mocked(handleLegacyRoutes).mockReturnValue(mockLegacyResponse);
    
    await middleware(req);
    
    expect(handleLegacyRoutes).toHaveBeenCalledWith(req, config.legacyRoutes);
    expect(applyApiProtection).not.toHaveBeenCalled();
  });
  
  it('should apply API protection for API routes', async () => {
    const config = createMockConfig();
    const middleware = createMiddleware(config);
    const req = createMockRequest('/api/test');
    
    await middleware(req);
    
    expect(handleLegacyRoutes).toHaveBeenCalledWith(req, config.legacyRoutes);
    expect(applyApiProtection).toHaveBeenCalledWith(req, config.api);
  });
  
  it('should return unauthorized for protected API routes', async () => {
    const config = createMockConfig();
    
    // Configure auth middleware with unauthorized state
    const unauthorizedState = createMockAuthState(null, false);
    configureMockAuth(authMiddleware, unauthorizedState);
    
    const middleware = createMiddleware(config);
    const req = createMockRequest('/api/protected', 'GET');
    
    // Mock NextResponse.json
    const mockResponse = mockJsonResponse({ error: 'Unauthorized' }, { status: 401 });
    vi.spyOn(NextResponse, 'json').mockReturnValueOnce(mockResponse);
    
    const result = await middleware(req);
    
    expect(result).toBe(mockResponse);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    expect(applyApiProtection).not.toHaveBeenCalled();
  });
  
  it('should allow public API routes without authentication', async () => {
    const config = createMockConfig();
    // Add the test route to public routes
    config.auth.publicRoutes.push('/api/test');
    
    const middleware = createMiddleware(config);
    const req = createMockRequest('/api/test', 'GET', { 'x-is-public-route': 'true' });
    
    await middleware(req);
    
    expect(applyApiProtection).toHaveBeenCalledWith(req, config.api);
  });
  
  it('should redirect to sign-in for protected non-API routes', async () => {
    const config = createMockConfig();
    
    // Configure auth middleware with unauthorized state
    const unauthorizedState = createMockAuthState(null, false);
    configureMockAuth(authMiddleware, unauthorizedState);
    
    // Create mock redirect response
    const mockRedirectResponse = NextResponse.redirect(new URL('/sign-in', 'http://localhost'));
    Object.defineProperty(mockRedirectResponse, 'status', { value: 307 }); // Next.js 15.3.1 uses 307
    redirectToSignIn.mockReturnValueOnce(mockRedirectResponse);
    
    const middleware = createMiddleware(config);
    const req = createMockRequest('/dashboard', 'GET');
    
    const result = await middleware(req);
    
    expect(result).toBe(mockRedirectResponse);
    expect(result.status).toBe(307);
    expect(handleLegacyRoutes).toHaveBeenCalledWith(req, config.legacyRoutes);
    expect(redirectToSignIn).toHaveBeenCalled();
  });
  
  it('should redirect to dashboard when accessing auth pages while logged in', async () => {
    const config = createMockConfig();
    
    // Configure auth middleware with authenticated state
    const authenticatedState = createMockAuthState('user123', true);
    configureMockAuth(authMiddleware, authenticatedState);
    
    const middleware = createMiddleware(config);
    const req = createMockRequest('/login', 'GET');
    
    // Mock redirect response
    const mockRedirectResponse = NextResponse.redirect(new URL('/dashboard', 'http://localhost'));
    Object.defineProperty(mockRedirectResponse, 'status', { value: 307 });
    vi.spyOn(NextResponse, 'redirect').mockReturnValueOnce(mockRedirectResponse);
    
    const result = await middleware(req);
    
    expect(result).toBe(mockRedirectResponse);
    expect(result.status).toBe(307);
    expect(NextResponse.redirect).toHaveBeenCalledWith(expect.any(URL));
    expect(handleLegacyRoutes).toHaveBeenCalledWith(req, config.legacyRoutes);
  });
  
  it('should add security headers to non-API responses', async () => {
    const config = createMockConfig();
    
    // Configure auth middleware with authenticated state
    const authenticatedState = createMockAuthState('user123', true);
    configureMockAuth(authMiddleware, authenticatedState);
    
    const middleware = createMiddleware(config);
    const req = createMockRequest('/dashboard', 'GET');
    
    // Mock response with headers
    const mockResponse = NextResponse.next();
    vi.spyOn(NextResponse, 'next').mockReturnValueOnce(mockResponse);
    
    const result = await middleware(req);
    
    expect(result.headers.get('content-security-policy')).toBe("default-src 'self'");
  });
});
