/**
 * Admin Session Type by ID API Tests
 * 
 * This file tests the Admin Session Type by ID API protected routes
 * Version: 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET, PUT, DELETE } from '@/app/api/admin/session-types/[id]/route';
import { UserRole } from '@/lib/auth/types';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockSessionType = {
    id: 'st_123',
    builderId: 'user_builder123',
    title: 'Test Session',
    description: 'Test session description',
    durationMinutes: 60,
    price: { toNumber: () => 100 },
    currency: 'USD',
    isActive: true,
    color: '#00FF00',
    maxParticipants: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      sessionType: {
        findUnique: vi.fn().mockResolvedValue(mockSessionType),
        update: vi.fn().mockResolvedValue({
          ...mockSessionType,
          title: 'Updated Session',
        }),
        delete: vi.fn().mockResolvedValue(mockSessionType)
      },
      booking: {
        count: vi.fn().mockResolvedValue(0)
      }
    }))
  };
});

// Set up Express SDK mocks
setupExpressMocks();

describe('Admin Session Type by ID API', () => {
  const testSessionId = 'st_123';
  const params = { id: testSessionId };
  
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/admin/session-types/[id]', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        GET, 
        `/api/admin/session-types/${testSessionId}`, 
        'GET',
        { params }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 403 for non-admin users', async () => {
      const tester = testProtectedRoute(
        GET, 
        `/api/admin/session-types/${testSessionId}`, 
        'GET',
        { params }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 and session type for admin users', async () => {
      const tester = testProtectedRoute(
        GET, 
        `/api/admin/session-types/${testSessionId}`, 
        'GET',
        { params }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe(testSessionId);
      expect(data.data.title).toBe('Test Session');
    });
  });

  describe('PUT /api/admin/session-types/[id]', () => {
    const updateData = {
      title: 'Updated Session',
      description: 'Updated description',
      isActive: false
    };

    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        PUT, 
        `/api/admin/session-types/${testSessionId}`, 
        'PUT',
        { params, body: updateData }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 403 for non-admin users', async () => {
      const tester = testProtectedRoute(
        PUT, 
        `/api/admin/session-types/${testSessionId}`, 
        'PUT',
        { params, body: updateData }
      );
      const response = await tester.withRole(UserRole.BUILDER);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 and update session type for admin users', async () => {
      const tester = testProtectedRoute(
        PUT, 
        `/api/admin/session-types/${testSessionId}`, 
        'PUT',
        { params, body: updateData }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.title).toBe('Updated Session');
    });
    
    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        title: 'A', // Too short
        description: 'B', // Too short
      };
      
      const tester = testProtectedRoute(
        PUT, 
        `/api/admin/session-types/${testSessionId}`, 
        'PUT',
        { params, body: invalidUpdateData }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(400);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/admin/session-types/[id]', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        DELETE, 
        `/api/admin/session-types/${testSessionId}`, 
        'DELETE',
        { params }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 403 for non-admin users', async () => {
      const tester = testProtectedRoute(
        DELETE, 
        `/api/admin/session-types/${testSessionId}`, 
        'DELETE',
        { params }
      );
      const response = await tester.withRole(UserRole.BUILDER);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 and delete session type for admin users', async () => {
      const tester = testProtectedRoute(
        DELETE, 
        `/api/admin/session-types/${testSessionId}`, 
        'DELETE',
        { params }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Session type deleted successfully');
    });
    
    it('should return 400 if session type has bookings', async () => {
      // Mock booking count to return a positive number
      const prismaClient = require('@prisma/client').PrismaClient();
      prismaClient.booking.count.mockResolvedValue(5);
      
      const tester = testProtectedRoute(
        DELETE, 
        `/api/admin/session-types/${testSessionId}`, 
        'DELETE',
        { params }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(400);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
      expect(data.error.detail).toBe('Cannot delete session type with existing bookings');
    });
  });
});