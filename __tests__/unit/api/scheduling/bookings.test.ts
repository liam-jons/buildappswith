/**
 * Bookings API Tests
 * 
 * This file tests the Booking API protected routes
 * Version: 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupExpressMocks, testProtectedRoute } from '@/__tests__/utils/express-auth-test-utils';
import { GET, POST } from '@/app/api/scheduling/bookings/route';
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

  const mockTimeSlot = {
    id: 'ts_123',
    startTime: '2023-12-01T10:00:00Z',
    endTime: '2023-12-01T11:00:00Z',
    builderId: 'user_builder123',
    isBooked: false
  };

  return {
    createBooking: vi.fn().mockResolvedValue(mockBooking),
    getAvailableTimeSlots: vi.fn().mockResolvedValue([mockTimeSlot]),
    getBuilderBookings: vi.fn().mockResolvedValue([mockBooking]),
    getClientBookings: vi.fn().mockResolvedValue([mockBooking]),
    getBookingById: vi.fn().mockResolvedValue(mockBooking)
  };
});

// Set up Express SDK mocks
setupExpressMocks();

describe('Bookings API', () => {
  // Reset mocks between tests
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/scheduling/bookings', () => {
    const clientId = 'user_client123';
    const builderId = 'user_builder123';

    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        GET, 
        '/api/scheduling/bookings?clientId=user_client123'
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 400 if neither clientId nor builderId is provided', async () => {
      const tester = testProtectedRoute(
        GET, 
        '/api/scheduling/bookings'
      );
      const response = await tester.withAuth('client');
      
      expect(response?.status).toBe(400);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });
    
    it('should return 403 if requesting bookings for another client', async () => {
      // Setup our auth test utility to use a different client ID than the requested one
      const otherClientId = 'user_other_client';
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings?clientId=${clientId}`
      );
      
      // Use a different client user
      const response = await tester.withAuth();
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 and bookings for the current client', async () => {
      // Mock auth-test-utils to return the same client ID when requested
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: clientId,
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings?clientId=${clientId}`
      );
      const response = await tester.withAuth('client');
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data.bookings)).toBe(true);
    });
    
    it('should return 200 and bookings for the current builder', async () => {
      // Mock auth-test-utils to return the same builder ID when requested
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: builderId,
        sessionClaims: {
          roles: [UserRole.BUILDER]
        }
      });
      
      const tester = testProtectedRoute(
        GET, 
        `/api/scheduling/bookings?builderId=${builderId}`
      );
      const response = await tester.withAuth('builder');
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data.bookings)).toBe(true);
    });
  });

  describe('POST /api/scheduling/bookings', () => {
    const validBooking = {
      sessionTypeId: 'st_123',
      builderId: 'user_builder123',
      clientId: 'user_client123',
      startTime: '2023-12-01T10:00:00Z',
      endTime: '2023-12-01T11:00:00Z',
      status: 'pending',
      paymentStatus: 'unpaid',
      clientTimezone: 'America/New_York',
      builderTimezone: 'America/Los_Angeles'
    };

    it('should return 401 for unauthenticated requests', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/scheduling/bookings',
        'POST',
        { body: validBooking }
      );
      const response = await tester.withoutAuth();
      
      expect(response?.status).toBe(401);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should return 403 for non-client users', async () => {
      const tester = testProtectedRoute(
        POST, 
        '/api/scheduling/bookings',
        'POST',
        { body: validBooking }
      );
      const response = await tester.withRole(UserRole.BUILDER);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 400 for invalid booking data', async () => {
      const invalidBooking = {
        // Missing several required fields
        sessionTypeId: 'st_123',
        builderId: 'user_builder123'
      };
      
      const tester = testProtectedRoute(
        POST, 
        '/api/scheduling/bookings',
        'POST',
        { body: invalidBooking }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(400);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });
    
    it('should return 403 if client tries to book for another client', async () => {
      // Setup our test client ID to be different from the booking clientId
      const otherClientId = 'user_other_client';
      const bookingForOtherClient = {
        ...validBooking,
        clientId: otherClientId
      };
      
      // Mock getAuth to return a different client ID
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: 'user_client123',
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        POST, 
        '/api/scheduling/bookings',
        'POST',
        { body: bookingForOtherClient }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(403);
      const data = await response?.json();
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should return 200 and create booking for client user', async () => {
      // Set up auth to match the client ID in the booking
      const mockGetAuth = vi.spyOn(require('@clerk/express'), 'getAuth');
      mockGetAuth.mockReturnValue({
        userId: validBooking.clientId,
        sessionClaims: {
          roles: [UserRole.CLIENT]
        }
      });
      
      const tester = testProtectedRoute(
        POST, 
        '/api/scheduling/bookings',
        'POST',
        { body: validBooking }
      );
      const response = await tester.withRole(UserRole.CLIENT);
      
      expect(response?.status).toBe(200);
      const data = await response?.json();
      expect(data.success).toBe(true);
      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.id).toBe('booking_123');
    });
  });
});