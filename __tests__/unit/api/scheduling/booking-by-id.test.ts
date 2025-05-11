/**
 * Booking by ID API Tests
 * 
 * This file tests the Booking by ID API protected routes
 * Version: 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET, PATCH } from '@/app/api/scheduling/bookings/[bookingId]/route';
import { UserRole } from '@/lib/auth/types';

// Mock scheduling service
vi.mock('@/lib/scheduling/real-data/scheduling-service', () => {
  const mockBooking = {
    id: 'booking_123',
    sessionTypeId: 'st_123',
    builderId: 'user_builder123',
    clientId: 'user_client123',
    startTime: '2023-12-01T10:00:00Z',
    endTime: '2023-12-01T11:00:00Z',
    status: 'pending',
    paymentStatus: 'unpaid',
    clientTimezone: 'America/New_York',
    builderTimezone: 'America/Los_Angeles',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    getBookingById: vi.fn().mockResolvedValue(mockBooking),
    updateBookingStatus: vi.fn().mockImplementation((id, status) => 
      Promise.resolve({
        ...mockBooking,
        status,
        updatedAt: new Date()
      })
    ),
    updateBookingPayment: vi.fn().mockImplementation((id, paymentStatus, paymentId) => 
      Promise.resolve({
        ...mockBooking,
        paymentStatus,
        paymentId: paymentId || null,
        updatedAt: new Date()
      })
    )
  };
});

// Set up Express SDK mocks
setupExpressMocks();

describe('Booking by ID API', () => {
  const testBookingId = 'booking_123';
  const params = { bookingId: testBookingId };
  
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/scheduling/bookings/[bookingId]', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'GET',
        { params }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 404 if booking not found', async () => {
      // Mock getBookingById to return null for this test
      const { getBookingById } = require('@/lib/scheduling/real-data/scheduling-service');
      getBookingById.mockResolvedValueOnce(null);
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'GET',
        { params }
      );
      const response = await tester.withAuth();
      
      expect(response?.status).toBe(404);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('RESOURCE_NOT_FOUND');
    });
    
    it('should return 403 if user is not the booking client or builder', async () => {
      // Set up auth to use a different user ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_different_id',
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'GET',
        { params }
      );
      const response = await tester.withAuth();
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 for booking client', async () => {
      // Set up auth to use the client ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_client123',
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'GET',
        { params }
      );
      const response = await tester.withAuth('client');
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.id).toBe(testBookingId);
    });
    
    it('should return 200 for booking builder', async () => {
      // Set up auth to use the builder ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_builder123',
        sessionClaims: {
          roles: [UserRole.BUILDER]
        }
      });
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'GET',
        { params }
      );
      const response = await tester.withAuth('builder');
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.id).toBe(testBookingId);
    });
    
    it('should return 200 for admin user', async () => {
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'GET',
        { params }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.id).toBe(testBookingId);
    });
  });

  describe('PATCH /api/scheduling/bookings/[bookingId]', () => {
    const statusUpdate = { status: 'confirmed' };
    const paymentUpdate = { paymentStatus: 'paid', paymentId: 'pay_123' };

    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: statusUpdate }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 404 if booking not found', async () => {
      // Mock getBookingById to return null for this test
      const { getBookingById } = require('@/lib/scheduling/real-data/scheduling-service');
      getBookingById.mockResolvedValueOnce(null);
      
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: statusUpdate }
      );
      const response = await tester.withAuth();
      
      expect(response?.status).toBe(404);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('RESOURCE_NOT_FOUND');
    });
    
    it('should return 403 if non-builder tries to confirm booking', async () => {
      // Set up auth to use the client ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_client123',
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: { status: 'confirmed' } }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 403 if non-admin/builder tries to update payment', async () => {
      // Set up auth to use the client ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_client123',
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: paymentUpdate }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 when builder confirms booking', async () => {
      // Set up auth to use the builder ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_builder123',
        sessionClaims: {
          roles: [UserRole.BUILDER]
        }
      });
      
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: statusUpdate }
      );
      const response = await tester.withRole(UserRole.BUILDER);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.status).toBe('confirmed');
    });
    
    it('should return 200 when builder updates payment status', async () => {
      // Set up auth to use the builder ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_builder123',
        sessionClaims: {
          roles: [UserRole.BUILDER]
        }
      });
      
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: paymentUpdate }
      );
      const response = await tester.withRole(UserRole.BUILDER);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.paymentStatus).toBe('paid');
      expect(data.data.booking.paymentId).toBe('pay_123');
    });
    
    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        // Neither status nor paymentStatus
        someOtherField: true
      };
      
      const tester = testProtectedRoute(
        PATCH, 
        `/api/scheduling/bookings/${testBookingId}`, 
        'PATCH',
        { params, body: invalidUpdate }
      );
      const response = await tester.withRole(UserRole.ADMIN);
      
      expect(response?.status).toBe(400);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });
  });
});