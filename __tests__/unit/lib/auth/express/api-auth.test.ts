import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, withAnyRole, withAllRoles, withAdmin, withBuilder, withClient, withPermission } from '@/lib/auth/express/api-auth';
import { UserRole } from '@/lib/auth/types';

// Mock dependencies
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    next: vi.fn(() => ({ headers: new Map() })),
    redirect: vi.fn((url) => ({ headers: new Map(), url })),
    json: vi.fn((body, options) => ({ body, options, headers: new Map() })),
  },
}));

vi.mock('@clerk/express', () => ({
  requireAuth: vi.fn(() => async (req: any, res: any, next: any) => {
    next();
    return true;
  }),
  getAuth: vi.fn(() => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    sessionClaims: {
      roles: ['CLIENT', 'BUILDER'],
    },
    has: (params: { permission: string }) => {
      return params.permission === 'profile:edit';
    }
  })),
}));

vi.mock('@/lib/auth/express/adapter', () => ({
  adaptNextRequestToExpress: vi.fn(() => ({
    url: 'https://example.com/api/test',
    method: 'GET',
    headers: {
      'authorization': 'Bearer test-token',
    },
  })),
  createMockExpressResponse: vi.fn(() => ({
    setHeader: vi.fn(),
    getHeader: vi.fn(),
    status: vi.fn(() => ({
      send: vi.fn(),
      json: vi.fn(),
    })),
  })),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('API Route Protection', () => {
  let mockRequest: any;
  
  beforeEach(() => {
    // Setup mock request
    mockRequest = {
      nextUrl: { pathname: '/api/test' },
      method: 'GET',
      headers: new Map([
        ['authorization', 'Bearer test-token'],
      ]),
    };
    
    // Clear mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('withAuth', () => {
    it('should call the handler when user is authenticated', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAuth(handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        auth: expect.objectContaining({
          userId: 'test-user-id',
        }),
      }), 'test-user-id');
    });
    
    it('should return 401 when user is not authenticated', async () => {
      const { requireAuth } = require('@clerk/express');
      requireAuth.mockReturnValue(async (req: any, res: any, next: any) => {
        // Don't call next, simulating authentication failure
        return false;
      });
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAuth(handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Authentication required',
        }),
        { status: 401 }
      );
    });
    
    it('should handle errors gracefully', async () => {
      const { requireAuth } = require('@clerk/express');
      requireAuth.mockImplementation(() => {
        throw new Error('Auth error');
      });
      
      const { logger } = require('@/lib/logger');
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAuth(handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Authentication error',
        }),
        { status: 500 }
      );
    });
  });

  describe('withRole', () => {
    it('should call the handler when user has the required role', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withRole(UserRole.CLIENT, handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            userId: 'test-user-id',
          }),
        }),
        'test-user-id',
        [UserRole.CLIENT, UserRole.BUILDER]
      );
    });
    
    it('should return 403 when user does not have the required role', async () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        sessionClaims: {
          roles: [UserRole.CLIENT],
        },
      });
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withRole(UserRole.ADMIN, handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Insufficient permissions',
        }),
        { status: 403 }
      );
    });
  });

  describe('withAnyRole', () => {
    it('should call the handler when user has any of the required roles', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAnyRole([UserRole.ADMIN, UserRole.BUILDER], handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            userId: 'test-user-id',
          }),
        }),
        'test-user-id',
        [UserRole.CLIENT, UserRole.BUILDER]
      );
    });
    
    it('should return 403 when user does not have any of the required roles', async () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        sessionClaims: {
          roles: [UserRole.CLIENT],
        },
      });
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAnyRole([UserRole.ADMIN, UserRole.BUILDER], handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Insufficient permissions',
        }),
        { status: 403 }
      );
    });
  });

  describe('withAllRoles', () => {
    it('should call the handler when user has all required roles', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAllRoles([UserRole.CLIENT, UserRole.BUILDER], handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            userId: 'test-user-id',
          }),
        }),
        'test-user-id',
        [UserRole.CLIENT, UserRole.BUILDER]
      );
    });
    
    it('should return 403 when user does not have all required roles', async () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        sessionClaims: {
          roles: [UserRole.CLIENT],
        },
      });
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAllRoles([UserRole.CLIENT, UserRole.BUILDER], handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Insufficient permissions',
        }),
        { status: 403 }
      );
    });
  });

  describe('Role-specific wrappers', () => {
    it('withAdmin should require the ADMIN role', async () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionClaims: {
          roles: [UserRole.ADMIN],
        },
      });
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withAdmin(handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalled();
    });
    
    it('withBuilder should require the BUILDER role', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withBuilder(handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalled();
    });
    
    it('withClient should require the CLIENT role', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withClient(handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('withPermission', () => {
    it('should call the handler when user has the required permission', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withPermission('profile:edit', handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          auth: expect.objectContaining({
            userId: 'test-user-id',
          }),
        }),
        'test-user-id'
      );
    });
    
    it('should return 403 when user does not have the required permission', async () => {
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withPermission('admin:access', handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).not.toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Insufficient permissions',
        }),
        { status: 403 }
      );
    });
    
    it('should fall back to role-based permission check when has function is not available', async () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionClaims: {
          roles: [UserRole.ADMIN],
        },
        // No has function
      });
      
      const handler = vi.fn(() => NextResponse.json({ success: true }));
      const protectedHandler = withPermission('any:permission', handler);
      
      await protectedHandler(mockRequest as NextRequest);
      
      expect(handler).toHaveBeenCalled();
    });
  });
});