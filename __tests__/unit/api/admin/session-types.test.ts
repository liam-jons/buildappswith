/**
 * Admin Session Types API Tests
 * 
 * This file tests the Admin Session Types API protected routes
 * Version: 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET, POST } from '@/app/api/admin/session-types/route';
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
        findMany: vi.fn().mockResolvedValue([mockSessionType]),
        create: vi.fn().mockResolvedValue(mockSessionType),
        findUnique: vi.fn().mockResolvedValue(mockSessionType),
        update: vi.fn().mockResolvedValue(mockSessionType),
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

describe('Admin Session Types API', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/admin/session-types', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(GET, '/api/admin/session-types');
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 403 for non-admin users', async () => {
      const tester = testProtectedRoute(GET, '/api/admin/session-types');
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 and session types for admin users', async () => {
      const tester = testProtectedRoute(GET, '/api/admin/session-types');
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.data[0].title).toBe('Test Session');
    });
  });

  describe('POST /api/admin/session-types', () => {
    const validSessionType = {
      builderId: 'user_builder123',
      title: 'New Session Type',
      description: 'This is a new session type',
      durationMinutes: 60,
      price: 100,
      currency: 'USD',
      isActive: true,
      color: '#00FF00',
      maxParticipants: 5
    };

    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/admin/session-types', 
        'POST',
        { body: validSessionType }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 403 for non-admin users', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/admin/session-types', 
        'POST',
        { body: validSessionType }
      );
      const response = await tester.withRole(UserRole.BUILDER);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 201 and create session type for admin users', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/admin/session-types', 
        'POST',
        { body: validSessionType }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(201);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.title).toBe('Test Session');
    });
    
    it('should return 400 for invalid request body', async () => {
      const invalidSessionType = {
        // Missing required fields
        builderId: 'user_builder123',
        title: 'A', // Too short
        price: -10 // Negative price
      };
      
      const tester = testProtectedRoute(
        POST, 
        '/api/admin/session-types', 
        'POST',
        { body: invalidSessionType }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(400);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });
  });
});