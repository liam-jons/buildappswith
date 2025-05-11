/**
 * Express SDK Authentication Test Utilities
 * 
 * This file provides utilities for testing Express SDK authentication in API routes and components.
 * It includes helpers for creating authenticated requests, simulating different roles,
 * mocking authentication context, and testing protected API routes.
 * 
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { vi } from 'vitest';
import { UserRole } from '@/lib/auth/types';
import { testClerkIds } from './models';
import { mockUsers } from '@/lib/auth/test-utils';

/**
 * Authentication headers for Express SDK
 */
interface AuthHeaders {
  'x-clerk-auth-user-id': string;
  'x-clerk-auth-session-id': string;
  'x-clerk-auth-roles': string;
}

/**
 * Options for creating an authenticated request
 */
interface AuthRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  searchParams?: Record<string, string>;
  userId?: string;
  sessionId?: string;
  roles?: UserRole[];
}

/**
 * Create an authenticated NextRequest for testing protected API routes
 * 
 * @param url - The URL to request
 * @param options - Request options including auth details
 * @returns A NextRequest with authentication headers
 */
export function createAuthenticatedRequest(
  url: string, 
  options: AuthRequestOptions = {}
): NextRequest {
  const { 
    method = 'GET',
    headers = {},
    body = null,
    searchParams = {},
    userId = testClerkIds.clientOne,
    sessionId = `sess_${userId.substring(5)}`,
    roles = [UserRole.CLIENT],
  } = options;

  // Create URL with search params
  const urlWithParams = new URL(url, 'http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    urlWithParams.searchParams.append(key, value);
  });

  // Create auth headers for Express SDK
  const authHeaders: AuthHeaders = {
    'x-clerk-auth-user-id': userId,
    'x-clerk-auth-session-id': sessionId,
    'x-clerk-auth-roles': JSON.stringify(roles),
  };

  // Create combined headers
  const combinedHeaders = {
    ...headers,
    ...authHeaders,
  };

  // Create init options
  const init: RequestInit = {
    method,
    headers: combinedHeaders,
  };

  // Add body if provided
  if (body) {
    init.body = JSON.stringify(body);
  }

  // Create NextRequest
  return new NextRequest(urlWithParams, init);
}

/**
 * Create mock auth object for testing Express SDK API routes
 * 
 * @param userType - The type of user to authenticate as
 * @param customRoles - Optional custom roles to override defaults
 * @returns A mock auth object with userId, sessionId, and roles
 */
export function createMockExpressAuth(
  userType: keyof typeof mockUsers = 'client',
  customRoles?: UserRole[]
) {
  const mockUser = mockUsers[userType];
  
  // Get user ID and create session ID
  const userId = mockUser.id;
  const sessionId = `sess_${userId.substring(5)}`;
  
  // Get roles from the mock user or custom roles
  const roles = customRoles || (mockUser.publicMetadata?.roles as UserRole[] || []);
  
  // Create session claims
  const sessionClaims = {
    sub: userId,
    sid: sessionId,
    roles,
    'public_metadata': {
      roles,
      verified: mockUser.publicMetadata?.verified || false,
      // Add any other needed metadata
    }
  };
  
  // Return mock auth object
  return {
    userId,
    sessionId,
    sessionClaims,
    getToken: vi.fn().mockResolvedValue(`mock-token-${userId}`),
    has: vi.fn().mockImplementation(({ permission }: { permission: string }) => {
      // Simple permission check based on roles
      if (roles.includes(UserRole.ADMIN)) return true;
      
      // Map permissions to roles (customize as needed)
      const rolePermissions: Record<string, string[]> = {
        [UserRole.ADMIN]: ['*'], // Admin has all permissions
        [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
        [UserRole.CLIENT]: ['profile:view', 'booking:create'],
      };
      
      // Check if any role has the permission
      return roles.some(role => {
        const permissions = rolePermissions[role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      });
    }),
  };
}

/**
 * Create Express SDK authentication for request headers
 * 
 * @param userType - The type of user to authenticate as
 * @param customRoles - Optional custom roles to override defaults
 * @returns Authentication headers for Express SDK
 */
export function createExpressAuthHeaders(
  userType: keyof typeof mockUsers = 'client',
  customRoles?: UserRole[]
): AuthHeaders {
  const mockUser = mockUsers[userType];
  
  // Get user ID and create session ID
  const userId = mockUser.id;
  const sessionId = `sess_${userId.substring(5)}`;
  
  // Get roles from the mock user or custom roles
  const roles = customRoles || (mockUser.publicMetadata?.roles as UserRole[] || []);
  
  // Return auth headers
  return {
    'x-clerk-auth-user-id': userId,
    'x-clerk-auth-session-id': sessionId,
    'x-clerk-auth-roles': JSON.stringify(roles),
  };
}

/**
 * Mock Next.js API route handler response
 */
export type MockAPIResponse = NextResponse | undefined;

/**
 * Test a protected API route with various auth scenarios
 * 
 * @param routeHandler - The API route handler function to test
 * @param url - The URL to test
 * @param method - The HTTP method to use
 * @param options - Test options
 * @returns An object with test helper functions
 */
export function testProtectedRoute(
  routeHandler: Function,
  url: string,
  method: string = 'GET',
  options: {
    params?: Record<string, string>;
    body?: any;
  } = {}
) {
  const { params = {}, body = undefined } = options;
  
  // Create helper functions for testing different auth scenarios
  return {
    /**
     * Test the route with an authenticated user
     * 
     * @param userType - The type of user to authenticate as
     * @param customRoles - Optional custom roles to override defaults
     * @returns The route handler response
     */
    async withAuth(userType: keyof typeof mockUsers = 'client', customRoles?: UserRole[]): Promise<MockAPIResponse> {
      // Create authenticated request
      const req = createAuthenticatedRequest(url, {
        method,
        body,
        userId: mockUsers[userType].id,
        roles: customRoles || (mockUsers[userType].publicMetadata?.roles as UserRole[] || []),
      });
      
      // Call route handler
      return await routeHandler(req, { params });
    },
    
    /**
     * Test the route with an unauthenticated user
     * 
     * @returns The route handler response
     */
    async withoutAuth(): Promise<MockAPIResponse> {
      // Create unauthenticated request
      const req = new NextRequest(new URL(url, 'http://localhost:3000'), {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      // Call route handler
      return await routeHandler(req, { params });
    },
    
    /**
     * Test the route with a specific role
     * 
     * @param role - The role to test with
     * @returns The route handler response
     */
    async withRole(role: UserRole): Promise<MockAPIResponse> {
      // Determine user type based on role
      let userType: keyof typeof mockUsers = 'client';
      if (role === UserRole.ADMIN) userType = 'admin';
      else if (role === UserRole.BUILDER) userType = 'builder';
      
      // Create authenticated request with specific role
      const req = createAuthenticatedRequest(url, {
        method,
        body,
        userId: mockUsers[userType].id,
        roles: [role],
      });
      
      // Call route handler
      return await routeHandler(req, { params });
    },
    
    /**
     * Test the route with multiple roles
     * 
     * @param roles - The roles to test with
     * @returns The route handler response
     */
    async withRoles(roles: UserRole[]): Promise<MockAPIResponse> {
      // Create authenticated request with multiple roles
      const req = createAuthenticatedRequest(url, {
        method,
        body,
        userId: mockUsers.multiRole.id,
        roles,
      });
      
      // Call route handler
      return await routeHandler(req, { params });
    },
  };
}

/**
 * Mock getAuth function for Express SDK tests
 * Used to replace @clerk/express getAuth in tests
 */
export const mockGetAuth = vi.fn().mockImplementation((req: any) => {
  // Extract Clerk auth info from headers
  const userId = req.headers?.['x-clerk-auth-user-id'] || null;
  const sessionId = req.headers?.['x-clerk-auth-session-id'] || null;
  
  // Parse roles from headers
  let roles: UserRole[] = [];
  try {
    const rolesHeader = req.headers?.['x-clerk-auth-roles'];
    if (rolesHeader) {
      roles = JSON.parse(rolesHeader);
    }
  } catch (error) {
    console.error('Error parsing roles header:', error);
  }
  
  // Create session claims
  const sessionClaims = userId ? {
    sub: userId,
    sid: sessionId,
    roles,
    'public_metadata': {
      roles,
    }
  } : null;
  
  // Return auth object
  return {
    userId,
    sessionId,
    sessionClaims,
    getToken: vi.fn().mockResolvedValue(userId ? `mock-token-${userId}` : null),
    has: vi.fn().mockImplementation(({ permission }: { permission: string }) => {
      // Admin has all permissions
      if (roles.includes(UserRole.ADMIN)) return true;
      
      // Map permissions to roles
      const rolePermissions: Record<string, string[]> = {
        [UserRole.ADMIN]: ['*'],
        [UserRole.BUILDER]: ['profile:edit', 'builder:manage'],
        [UserRole.CLIENT]: ['profile:view', 'booking:create'],
      };
      
      // Check if any role has the permission
      return roles.some(role => {
        const permissions = rolePermissions[role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      });
    }),
  };
});

/**
 * Mock requireAuth function for Express SDK tests
 * Used to replace @clerk/express requireAuth in tests
 */
export const mockRequireAuth = vi.fn().mockImplementation((options?: any) => {
  return (req: any, res: any, next: any) => {
    // Check if user ID exists in header
    const userId = req.headers?.['x-clerk-auth-user-id'];
    
    if (userId) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated
      // Implement redirection or error handling as needed
      res.statusCode = 401;
      res.json({ error: 'Authentication required' });
    }
  };
});

/**
 * Set up mocks for @clerk/express and @clerk/nextjs for testing API routes
 */
export function setupExpressMocks() {
  // Mock @clerk/express
  vi.mock('@clerk/express', () => ({
    getAuth: mockGetAuth,
    requireAuth: mockRequireAuth,
  }));
  
  // Mock @clerk/nextjs
  vi.mock('@clerk/nextjs', () => {
    const mockAuthMiddleware = vi.fn().mockImplementation(() => {
      return (req: any) => {
        // Create a standard Next.js response
        return NextResponse.next();
      };
    });
    
    return {
      auth: vi.fn().mockReturnValue({ userId: 'test-user' }),
      currentUser: vi.fn().mockResolvedValue({ id: 'test-user' }),
      clerkClient: {
        users: {
          getUser: vi.fn().mockResolvedValue({ id: 'test-user' }),
        },
      },
      authMiddleware: mockAuthMiddleware,
    };
  });
}