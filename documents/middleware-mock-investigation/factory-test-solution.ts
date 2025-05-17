
/**
 * Modified Middleware Factory Test
 * Version: 1.0.84
 *
 * This version uses the improved mock implementation to avoid TypeScript errors
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
  mockJsonResponse
} from '../../lib/middleware/test-utils';

// Import the mocked modules (automatically uses __mocks__ version)
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';

// Special TypeScript workaround for method chaining on mocks
// This is critical for solving the "mockImplementationOnce is not a function" error
type MockWithImplementationOnce<T> = T & {
  mockImplementationOnce: (...args: any[]) => MockWithImplementationOnce<T>;
};

const typedAuthMiddleware = authMiddleware as unknown as MockWithImplementationOnce<typeof authMiddleware>;
const typedRedirectToSignIn = redirectToSignIn as unknown as MockWithImplementationOnce<typeof redirectToSignIn>;

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
  
  it('should return unauthorized for protected API routes', async () => {
    const config = createMockConfig();
    
    // Configure auth middleware with unauthorized state
    const unauthorizedState = createMockAuthState(null, false);
    typedAuthMiddleware.mockImplementationOnce((options: any) => {
      return async (req: NextRequest) => {
        return options.afterAuth(unauthorizedState, req, { nextUrl: req.nextUrl });
      };
    });
    
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
  
  it('should redirect to sign-in for protected non-API routes', async () => {
    const config = createMockConfig();
    
    // Configure auth middleware with unauthorized state
    const unauthorizedState = createMockAuthState(null, false);
    typedAuthMiddleware.mockImplementationOnce((options: any) => {
      return async (req: NextRequest) => {
        return options.afterAuth(unauthorizedState, req, { nextUrl: req.nextUrl });
      };
    });
    
    // Create mock redirect response
    const mockRedirectResponse = NextResponse.redirect(new URL('/sign-in', 'http://localhost'));
    Object.defineProperty(mockRedirectResponse, 'status', { value: 307 }); // Next.js 15.3.1 uses 307
    typedRedirectToSignIn.mockReturnValueOnce(mockRedirectResponse);
    
    const middleware = createMiddleware(config);
    const req = createMockRequest('/dashboard', 'GET');
    
    const result = await middleware(req);
    
    expect(result).toBe(mockRedirectResponse);
    expect(result.status).toBe(307);
    expect(handleLegacyRoutes).toHaveBeenCalledWith(req, config.legacyRoutes);
    expect(typedRedirectToSignIn).toHaveBeenCalled();
  });
});
