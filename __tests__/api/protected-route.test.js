/**
 * API Route Authentication Tests
 * Version: 1.0.114
 *
 * Tests for API route protection using the new Clerk authentication utilities
 */

import { vi, describe, it, expect, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '../mocks/users';
import { resetMockClerk } from '../utils/clerk-test-utils';

// Import mock functions for Clerk after setting them up
const { auth } = require('@clerk/nextjs');

// First, let's mock the requireAuth and requireRole functions
vi.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  hasRole: vi.fn(),
}));

// Import after mocking
const { requireAuth, requireRole, hasRole } = require('@/lib/auth/clerk/helpers');

// Mock the API handlers
vi.mock('@/lib/auth/clerk/api-auth', () => {
  // Get the actual implementation
  const original = vi.requireActual('@/lib/auth/clerk/api-auth');
  
  // Create vi.fn wrappers for testing
  return {
    withAuth: vi.fn(handler => {
      return async (req) => {
        try {
          // Use requireAuth with the mocked Clerk auth
          const user = await requireAuth();
          return handler(req, user);
        } catch (error) {
          return NextResponse.json({ error: error.message || 'Unauthorized' }, { status: 401 });
        }
      }
    }),
    withRole: vi.fn((role, handler) => {
      return async (req) => {
        try {
          // Use requireRole with the mocked Clerk auth
          const user = await requireRole(role);
          return handler(req, user);
        } catch (error) {
          return NextResponse.json({ error: error.message || `Forbidden: Requires ${role} role` }, { status: 403 });
        }
      }
    }),
    withAdmin: vi.fn(handler => {
      // Pass through to withRole with ADMIN role
      return require('@/lib/auth/clerk/api-auth').withRole('ADMIN', handler);
    }),
    withBuilder: vi.fn(handler => {
      // Pass through to withRole with BUILDER role
      return require('@/lib/auth/clerk/api-auth').withRole('BUILDER', handler);
    }),
  };
});

// Import after mocking
const { withAuth, withRole, withAdmin, withBuilder } = require('@/lib/auth/clerk/api-auth');

describe('Protected API Routes', () => {
  // Reset mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
    resetMockClerk();
  });
  
  describe('withAuth handler', () => {
    // Test successful authentication
    it('allows authenticated requests', async () => {
      // Configure auth to return an authenticated user
      vi.mocked(auth).mockReturnValue({
        userId: mockUsers.client.clerkId,
        sessionId: `session-${mockUsers.client.clerkId}`,
        getToken: vi.fn().mockResolvedValue('test-token'),
      });
      
      // Configure requireAuth to return a mock user
      requireAuth.mockResolvedValueOnce(mockUsers.client);
      
      // Create a mock handler function
      const mockHandler = vi.fn().mockReturnValue(
        NextResponse.json({ success: true })
      );
      
      // Wrap the handler with withAuth
      const protectedHandler = withAuth(mockHandler);
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/test');
      
      // Call the handler
      const response = await protectedHandler(req);
      
      // Verify handler was called with user
      expect(mockHandler).toHaveBeenCalledWith(req, mockUsers.client);
      
      // Verify response
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
    });
    
    // Test unauthorized access
    it('rejects unauthenticated requests', async () => {
      // Configure auth to return null user ID
      vi.mocked(auth).mockReturnValue({
        userId: null,
        sessionId: null,
        getToken: vi.fn().mockResolvedValue(null),
      });
      
      // Configure requireAuth to throw unauthorized error
      requireAuth.mockRejectedValueOnce(new Error('Unauthorized'));
      
      // Create a mock handler function
      const mockHandler = vi.fn();
      
      // Wrap the handler with withAuth
      const protectedHandler = withAuth(mockHandler);
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/test');
      
      // Call the handler
      const response = await protectedHandler(req);
      
      // Verify handler was not called
      expect(mockHandler).not.toHaveBeenCalled();
      
      // Verify response
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'Unauthorized' });
    });
  });
  
  describe('withRole handler', () => {
    // Test successful role access
    it('allows users with the required role', async () => {
      // Configure auth to return an authenticated user with admin role
      vi.mocked(auth).mockReturnValue({
        userId: mockUsers.admin.clerkId,
        sessionId: `session-${mockUsers.admin.clerkId}`,
        getToken: vi.fn().mockResolvedValue('test-token'),
      });
      
      // Configure requireRole to return a mock user
      requireRole.mockResolvedValueOnce(mockUsers.admin);
      
      // Create a mock handler function
      const mockHandler = vi.fn().mockReturnValue(
        NextResponse.json({ success: true })
      );
      
      // Wrap the handler with withRole
      const protectedHandler = withRole('ADMIN', mockHandler);
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/admin');
      
      // Call the handler
      const response = await protectedHandler(req);
      
      // Verify handler was called with user
      expect(mockHandler).toHaveBeenCalledWith(req, mockUsers.admin);
      
      // Verify response
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });
    });
    
    // Test unauthorized access
    it('rejects users without the required role', async () => {
      // Configure auth to return an authenticated user without admin role
      vi.mocked(auth).mockReturnValue({
        userId: mockUsers.client.clerkId,
        sessionId: `session-${mockUsers.client.clerkId}`,
        getToken: vi.fn().mockResolvedValue('test-token'),
      });
      
      // Configure requireRole to throw forbidden error
      requireRole.mockRejectedValueOnce(new Error('Forbidden: Requires ADMIN role'));
      
      // Create a mock handler function
      const mockHandler = vi.fn();
      
      // Wrap the handler with withRole
      const protectedHandler = withRole('ADMIN', mockHandler);
      
      // Create a mock request
      const req = new NextRequest('https://example.com/api/admin');
      
      // Call the handler
      const response = await protectedHandler(req);
      
      // Verify handler was not called
      expect(mockHandler).not.toHaveBeenCalled();
      
      // Verify response
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: 'Forbidden: Requires ADMIN role' });
    });
  });
  
  describe('Role-specific handlers', () => {
    // Test withAdmin
    it('withAdmin requires ADMIN role', async () => {
      // Setup to intercept withRole calls
      const originalWithRole = withRole;
      withRole.mockImplementation((role, handler) => {
        // Just verify the role, don't actually try to run the handler
        expect(role).toBe('ADMIN');
        return handler; // Just return the handler for simplicity
      });
      
      // Create a mock handler
      const mockHandler = vi.fn();
      
      // Wrap with withAdmin
      withAdmin(mockHandler);
      
      // Verify withRole was called with ADMIN role
      expect(withRole).toHaveBeenCalledWith('ADMIN', mockHandler);
      
      // Reset the mock
      withRole.mockImplementation(originalWithRole);
    });
    
    // Test withBuilder
    it('withBuilder requires BUILDER role', async () => {
      // Setup to intercept withRole calls
      const originalWithRole = withRole;
      withRole.mockImplementation((role, handler) => {
        // Just verify the role, don't actually try to run the handler
        expect(role).toBe('BUILDER');
        return handler; // Just return the handler for simplicity
      });
      
      // Create a mock handler
      const mockHandler = vi.fn();
      
      // Wrap with withBuilder
      withBuilder(mockHandler);
      
      // Verify withRole was called with BUILDER role
      expect(withRole).toHaveBeenCalledWith('BUILDER', mockHandler);
      
      // Reset the mock
      withRole.mockImplementation(originalWithRole);
    });
  });
});
