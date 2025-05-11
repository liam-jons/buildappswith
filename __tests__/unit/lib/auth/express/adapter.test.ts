import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { adaptNextRequestToExpress, createMockExpressResponse, createClerkExpressMiddleware } from '@/lib/auth/express/adapter';

// Mock Next.js and Clerk dependencies
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    next: vi.fn(() => ({ headers: new Map() })),
    redirect: vi.fn((url) => ({ headers: new Map(), url })),
    json: vi.fn((body, options) => ({ body, options, headers: new Map() })),
  },
}));

vi.mock('@clerk/express', () => ({
  clerkMiddleware: vi.fn(() => async (req: any, res: any, next: any) => {
    next();
    return true;
  }),
  getAuth: vi.fn(() => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    sessionClaims: {
      roles: ['CLIENT'],
    },
  })),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Clerk Express SDK Adapter', () => {
  let mockNextRequest: any;
  let mockUrl: URL;
  
  beforeEach(() => {
    // Create mock Next.js request
    mockUrl = new URL('https://example.com/dashboard');
    mockNextRequest = {
      url: mockUrl.toString(),
      nextUrl: mockUrl,
      method: 'GET',
      headers: new Map([
        ['user-agent', 'test-agent'],
        ['authorization', 'Bearer test-token'],
      ]),
      cookies: {
        getAll: () => [
          { name: 'test-cookie', value: 'test-value' },
        ],
      },
      ip: '127.0.0.1',
    };
    
    // Clear mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('adaptNextRequestToExpress', () => {
    it('should convert Next.js request to Express-compatible format', () => {
      const expressReq = adaptNextRequestToExpress(mockNextRequest as NextRequest);
      
      expect(expressReq).toHaveProperty('url', mockUrl.toString());
      expect(expressReq).toHaveProperty('method', 'GET');
      expect(expressReq).toHaveProperty('headers', {
        'user-agent': 'test-agent',
        'authorization': 'Bearer test-token',
      });
      expect(expressReq).toHaveProperty('cookies', {
        'test-cookie': 'test-value',
      });
      expect(expressReq).toHaveProperty('path', '/dashboard');
      expect(expressReq).toHaveProperty('ip', '127.0.0.1');
    });
    
    it('should handle query parameters correctly', () => {
      mockUrl = new URL('https://example.com/dashboard?foo=bar&baz=qux');
      mockNextRequest.url = mockUrl.toString();
      mockNextRequest.nextUrl = mockUrl;
      
      const expressReq = adaptNextRequestToExpress(mockNextRequest as NextRequest);
      
      expect(expressReq).toHaveProperty('query', {
        foo: 'bar',
        baz: 'qux',
      });
    });
    
    it('should provide Express-compatible get method', () => {
      const expressReq = adaptNextRequestToExpress(mockNextRequest as NextRequest);
      
      expect(expressReq.get('user-agent')).toBe('test-agent');
      expect(expressReq.get('authorization')).toBe('Bearer test-token');
      expect(expressReq.get('non-existent')).toBeNull();
    });
  });

  describe('createMockExpressResponse', () => {
    it('should create a mock Express response object', () => {
      const expressRes = createMockExpressResponse();
      
      expect(expressRes).toHaveProperty('setHeader');
      expect(expressRes).toHaveProperty('getHeader');
      expect(expressRes).toHaveProperty('status');
      expect(expressRes).toHaveProperty('cookie');
      expect(expressRes).toHaveProperty('headersSent', false);
      expect(expressRes).toHaveProperty('statusCode', 200);
    });
    
    it('should properly handle headers', () => {
      const expressRes = createMockExpressResponse();
      
      expressRes.setHeader('content-type', 'application/json');
      expressRes.setHeader('x-custom', 'test-value');
      
      expect(expressRes.getHeader('content-type')).toBe('application/json');
      expect(expressRes.getHeader('x-custom')).toBe('test-value');
      expect(expressRes.getHeader('non-existent')).toBeNull();
      
      expressRes.removeHeader('x-custom');
      expect(expressRes.getHeader('x-custom')).toBeNull();
    });
    
    it('should provide a chainable status method', () => {
      const expressRes = createMockExpressResponse();
      
      const result = expressRes.status(404);
      expect(result).toHaveProperty('send');
      expect(result).toHaveProperty('json');
      expect(expressRes.statusCode).toBe(404);
    });
  });

  describe('createClerkExpressMiddleware', () => {
    it('should return a middleware function', () => {
      const middleware = createClerkExpressMiddleware();
      expect(typeof middleware).toBe('function');
    });
    
    it('should handle public routes correctly', async () => {
      // Mock the publicRoutes to match our test path
      vi.mock('@/lib/auth/clerk-middleware', () => ({
        publicRoutes: ['/dashboard'],
        ignoredRoutes: [],
      }));
      
      const middleware = createClerkExpressMiddleware();
      const result = await middleware(mockNextRequest as NextRequest);
      
      expect(NextResponse.next).toHaveBeenCalled();
    });
    
    it('should handle unauthenticated requests to protected routes correctly', async () => {
      // Mock getAuth to return null (unauthenticated)
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue(null);
      
      // Mock publicRoutes to not match our test path
      vi.mock('@/lib/auth/clerk-middleware', () => ({
        publicRoutes: ['/public'],
        ignoredRoutes: [],
      }), { virtual: true });
      
      const middleware = createClerkExpressMiddleware();
      await middleware(mockNextRequest as NextRequest);
      
      expect(NextResponse.redirect).toHaveBeenCalled();
    });
    
    it('should attach auth headers for authenticated requests', async () => {
      const mockNextResponse = { headers: new Map() };
      (NextResponse.next as any).mockReturnValue(mockNextResponse);
      
      const middleware = createClerkExpressMiddleware();
      await middleware(mockNextRequest as NextRequest);
      
      expect(mockNextResponse.headers.get('x-clerk-auth-user-id')).toBe('test-user-id');
      expect(mockNextResponse.headers.get('x-clerk-auth-session-id')).toBe('test-session-id');
      expect(mockNextResponse.headers.get('x-clerk-auth-user-roles')).toBe('["CLIENT"]');
    });
    
    it('should handle middleware errors gracefully', async () => {
      // Mock clerkMiddleware to throw an error
      const { clerkMiddleware } = require('@clerk/express');
      clerkMiddleware.mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const { logger } = require('@/lib/logger');
      
      const middleware = createClerkExpressMiddleware();
      await middleware(mockNextRequest as NextRequest);
      
      expect(logger.error).toHaveBeenCalled();
      expect(NextResponse.next).toHaveBeenCalled();
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error with the correct properties', () => {
      const { AuthenticationError } = require('@/lib/auth/express/adapter');
      
      const error = new AuthenticationError('Test error', 403);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(403);
    });
    
    it('should use default values when not provided', () => {
      const { AuthenticationError } = require('@/lib/auth/express/adapter');
      
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });
  });
});