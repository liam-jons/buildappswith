import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { headers, cookies } from 'next/headers';
import { UserRole } from '@/lib/auth/types';
import { 
  getServerAuth, 
  createServerAuthRequest,
  getFullServerAuth,
  hasServerRole,
  hasServerPermission,
  requireServerAuth,
  requireServerRole
} from '@/lib/auth/express/server-auth';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/express/errors';

// Mock dependencies
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Server Authentication Utilities', () => {
  let mockHeaders: Map<string, string>;
  let mockCookies: any[];
  
  beforeEach(() => {
    // Setup mock headers
    mockHeaders = new Map([
      ['x-clerk-auth-user-id', 'test-user-id'],
      ['x-clerk-auth-session-id', 'test-session-id'],
      ['x-clerk-auth-user-roles', JSON.stringify([UserRole.CLIENT, UserRole.BUILDER])],
    ]);
    
    // Setup mock cookies
    mockCookies = [
      { name: 'build_auth', value: 'test-cookie-value' },
    ];
    
    // Setup header mocks
    (headers as any).mockReturnValue({
      get: (key: string) => mockHeaders.get(key),
      forEach: (callback: (value: string, key: string) => void) => {
        mockHeaders.forEach((value, key) => callback(value, key));
      },
    });
    
    // Setup cookie mocks
    (cookies as any).mockReturnValue({
      getAll: () => mockCookies,
    });
    
    // Setup getAuth mock
    const { getAuth } = require('@clerk/express');
    getAuth.mockReturnValue({
      userId: 'test-user-id',
      sessionId: 'test-session-id',
      sessionClaims: {
        roles: [UserRole.CLIENT, UserRole.BUILDER],
      },
      has: (params: { permission: string }) => {
        return params.permission === 'profile:edit';
      }
    });
    
    // Clear mocks
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getServerAuth', () => {
    it('should return authentication information from headers', () => {
      const auth = getServerAuth();
      
      expect(auth).toEqual({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        isAuthenticated: true,
        roles: [UserRole.CLIENT, UserRole.BUILDER],
        hasRole: expect.any(Function),
      });
    });
    
    it('should handle missing headers gracefully', () => {
      mockHeaders = new Map();
      
      const auth = getServerAuth();
      
      expect(auth).toEqual({
        userId: null,
        sessionId: null,
        isAuthenticated: false,
        roles: [],
        hasRole: expect.any(Function),
      });
    });
    
    it('should parse comma-separated roles string if JSON parsing fails', () => {
      mockHeaders.set('x-clerk-auth-user-roles', 'CLIENT,BUILDER');
      
      const auth = getServerAuth();
      
      expect(auth.roles).toEqual(['CLIENT', 'BUILDER']);
    });
    
    it('should provide a hasRole function that works correctly', () => {
      const auth = getServerAuth();
      
      expect(auth.hasRole(UserRole.CLIENT)).toBe(true);
      expect(auth.hasRole(UserRole.BUILDER)).toBe(true);
      expect(auth.hasRole(UserRole.ADMIN)).toBe(false);
    });
    
    it('should handle errors gracefully', () => {
      (headers as any).mockImplementation(() => {
        throw new Error('Headers error');
      });
      
      const { logger } = require('@/lib/logger');
      
      const auth = getServerAuth();
      
      expect(logger.error).toHaveBeenCalled();
      expect(auth).toEqual({
        userId: null,
        sessionId: null,
        isAuthenticated: false,
        roles: [],
        hasRole: expect.any(Function),
      });
    });
  });

  describe('createServerAuthRequest', () => {
    it('should create an Express-compatible request object from headers and cookies', () => {
      const req = createServerAuthRequest();
      
      expect(req).toHaveProperty('headers', Object.fromEntries(mockHeaders));
      expect(req).toHaveProperty('cookies', { build_auth: 'test-cookie-value' });
      expect(req).toHaveProperty('method', 'GET');
      expect(req.get).toBeInstanceOf(Function);
    });
    
    it('should handle get method correctly', () => {
      const req = createServerAuthRequest();
      
      expect(req.get('x-clerk-auth-user-id')).toBe('test-user-id');
      expect(req.get('x-clerk-auth-session-id')).toBe('test-session-id');
      expect(req.get('non-existent')).toBeNull();
    });
    
    it('should handle errors gracefully', () => {
      (headers as any).mockImplementation(() => {
        throw new Error('Headers error');
      });
      
      const { logger } = require('@/lib/logger');
      
      const req = createServerAuthRequest();
      
      expect(logger.error).toHaveBeenCalled();
      expect(req).toHaveProperty('headers', {});
      expect(req).toHaveProperty('cookies', {});
    });
  });

  describe('getFullServerAuth', () => {
    it('should get full authentication information from Clerk Express SDK', () => {
      const auth = getFullServerAuth();
      
      const { getAuth } = require('@clerk/express');
      expect(getAuth).toHaveBeenCalled();
      
      expect(auth).toEqual({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        sessionClaims: {
          roles: [UserRole.CLIENT, UserRole.BUILDER],
        },
        has: expect.any(Function),
      });
    });
    
    it('should handle errors gracefully', () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockImplementation(() => {
        throw new Error('Auth error');
      });
      
      const { logger } = require('@/lib/logger');
      
      const auth = getFullServerAuth();
      
      expect(logger.error).toHaveBeenCalled();
      expect(auth).toBeNull();
    });
  });

  describe('hasServerRole', () => {
    it('should return true when user has the specified role', () => {
      expect(hasServerRole(UserRole.CLIENT)).toBe(true);
      expect(hasServerRole(UserRole.BUILDER)).toBe(true);
    });
    
    it('should return false when user does not have the specified role', () => {
      expect(hasServerRole(UserRole.ADMIN)).toBe(false);
    });
    
    it('should return false when user is not authenticated', () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue(null);
      
      expect(hasServerRole(UserRole.CLIENT)).toBe(false);
    });
    
    it('should check roles from various locations in session claims', () => {
      const { getAuth } = require('@clerk/express');
      
      // Test with roles in public_metadata
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionClaims: {
          'public_metadata': {
            'roles': [UserRole.ADMIN],
          },
        },
      });
      
      expect(hasServerRole(UserRole.ADMIN)).toBe(true);
      expect(hasServerRole(UserRole.CLIENT)).toBe(false);
    });
  });

  describe('hasServerPermission', () => {
    it('should return true when user has the specified permission', () => {
      expect(hasServerPermission('profile:edit')).toBe(true);
    });
    
    it('should return false when user does not have the specified permission', () => {
      expect(hasServerPermission('admin:access')).toBe(false);
    });
    
    it('should return false when user is not authenticated', () => {
      const { getAuth } = require('@clerk/express');
      getAuth.mockReturnValue(null);
      
      expect(hasServerPermission('profile:edit')).toBe(false);
    });
    
    it('should fallback to role-based permission mapping when has function is not available', () => {
      const { getAuth } = require('@clerk/express');
      
      // Remove the has function
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionClaims: {
          roles: [UserRole.ADMIN],
        },
      });
      
      // Admin should have all permissions
      expect(hasServerPermission('any:permission')).toBe(true);
      
      // Test with builder role
      getAuth.mockReturnValue({
        userId: 'test-user-id',
        sessionClaims: {
          roles: [UserRole.BUILDER],
        },
      });
      
      expect(hasServerPermission('profile:edit')).toBe(true);
      expect(hasServerPermission('admin:access')).toBe(false);
    });
  });

  describe('requireServerAuth', () => {
    it('should return authentication information when user is authenticated', () => {
      const auth = requireServerAuth();
      
      expect(auth).toEqual({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        isAuthenticated: true,
        roles: [UserRole.CLIENT, UserRole.BUILDER],
        hasRole: expect.any(Function),
      });
    });
    
    it('should throw AuthenticationError when user is not authenticated', () => {
      mockHeaders.delete('x-clerk-auth-user-id');
      
      expect(() => requireServerAuth()).toThrow(AuthenticationError);
      expect(() => requireServerAuth()).toThrow('Authentication required');
    });
  });

  describe('requireServerRole', () => {
    it('should return authentication information when user has the required role', () => {
      const auth = requireServerRole(UserRole.CLIENT);
      
      expect(auth).toEqual({
        userId: 'test-user-id',
        sessionId: 'test-session-id',
        isAuthenticated: true,
        roles: [UserRole.CLIENT, UserRole.BUILDER],
        hasRole: expect.any(Function),
      });
    });
    
    it('should throw AuthenticationError when user is not authenticated', () => {
      mockHeaders.delete('x-clerk-auth-user-id');
      
      expect(() => requireServerRole(UserRole.CLIENT)).toThrow(AuthenticationError);
      expect(() => requireServerRole(UserRole.CLIENT)).toThrow('Authentication required');
    });
    
    it('should throw AuthorizationError when user does not have the required role', () => {
      expect(() => requireServerRole(UserRole.ADMIN)).toThrow(AuthorizationError);
      expect(() => requireServerRole(UserRole.ADMIN)).toThrow(`Role ${UserRole.ADMIN} required`);
    });
  });
});