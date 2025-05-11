/**
 * Express SDK API Authentication Tests
 * 
 * This file tests the Express SDK API authentication utilities and protected routes
 * Version: 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withAdmin, withBuilder, withClient, withAnyRole } from '@/lib/auth/express/api-auth';
import { UserRole } from '@/lib/auth/types';
import { createAuthenticatedRequest, setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';

// Set up Express SDK mocks
setupExpressMocks();

describe('Express SDK API Auth Utilities', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  // Example handler functions for testing
  const exampleHandler = async () => {
    return NextResponse.json({ success: true, message: 'Authorized' });
  };
  
  const exampleErrorHandler = async () => {
    throw new Error('Test error');
  };
  
  describe('withAuth', () => {
    // Create protected route handler with basic auth
    const protectedHandler = withAuth(async (req: NextRequest, userId: string) => {
      return NextResponse.json({ 
        success: true, 
        message: 'Authorized', 
        userId 
      });
    });
    
    it('should allow authenticated requests', async () => {
      // Create authenticated request
      const req = createAuthenticatedRequest('/api/test', {
        userId: 'user_test123',
      });
      
      // Call handler
      const response = await protectedHandler(req);
      
      // Check response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.userId).toBe('user_test123');
    });
    
    it('should reject unauthenticated requests', async () => {
      // Create unauthenticated request
      const req = new NextRequest('/api/test');
      
      // Call handler
      const response = await protectedHandler(req);
      
      // Check response
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should handle errors gracefully', async () => {
      // Create protected route handler that throws an error
      const errorHandler = withAuth(exampleErrorHandler);
      
      // Create authenticated request
      const req = createAuthenticatedRequest('/api/test');
      
      // Call handler
      const response = await errorHandler(req);
      
      // Check response
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('SERVER_ERROR');
    });
  });
  
  describe('withRole', () => {
    // Test the testProtectedRoute utility with withAdmin
    const adminHandler = withAdmin(async (req: NextRequest, userId: string, roles: UserRole[]) => {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin authorized', 
        userId,
        roles
      });
    });
    
    it('should allow users with admin role', async () => {
      // Use testProtectedRoute utility
      const tester = testProtectedRoute(adminHandler, '/api/admin/test');
      
      // Test with admin role
      const response = await tester.withRole(UserRole.ADMIN);
      
      // Check response
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Admin authorized');
    });
    
    it('should reject users without admin role', async () => {
      // Use testProtectedRoute utility
      const tester = testProtectedRoute(adminHandler, '/api/admin/test');
      
      // Test with client role
      const response = await tester.withRole(UserRole.CLIENT);
      
      // Check response
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
  });
  
  describe('Role-specific middleware', () => {
    // Create handlers for different roles
    const builderHandler = withBuilder(exampleHandler);
    const clientHandler = withClient(exampleHandler);
    const anyRoleHandler = withAnyRole([UserRole.BUILDER, UserRole.CLIENT], exampleHandler);
    
    it('should allow builders to access builder-protected routes', async () => {
      // Create authenticated request with builder role
      const req = createAuthenticatedRequest('/api/test', {
        roles: [UserRole.BUILDER],
      });
      
      // Call handler
      const response = await builderHandler(req);
      
      // Check response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
    
    it('should allow clients to access client-protected routes', async () => {
      // Create authenticated request with client role
      const req = createAuthenticatedRequest('/api/test', {
        roles: [UserRole.CLIENT],
      });
      
      // Call handler
      const response = await clientHandler(req);
      
      // Check response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
    
    it('should allow multiple roles in withAnyRole', async () => {
      // Create authenticated request with client role
      const req = createAuthenticatedRequest('/api/test', {
        roles: [UserRole.CLIENT],
      });
      
      // Call handler
      const response = await anyRoleHandler(req);
      
      // Check response
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // Now test with builder role
      const req2 = createAuthenticatedRequest('/api/test', {
        roles: [UserRole.BUILDER],
      });
      
      // Call handler
      const response2 = await anyRoleHandler(req2);
      
      // Check response
      expect(response2.status).toBe(200);
      const data2 = await response2.json();
      expect(data2.success).toBe(true);
      
      // Test with admin role (not included in the allowed roles)
      const req3 = createAuthenticatedRequest('/api/test', {
        roles: [UserRole.ADMIN],
      });
      
      // Call handler
      const response3 = await anyRoleHandler(req3);
      
      // Check response
      expect(response3.status).toBe(403); // Should be forbidden
    });
  });
});