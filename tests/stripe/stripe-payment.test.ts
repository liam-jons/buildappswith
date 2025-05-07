/**
 * Stripe Payment Tests
 * 
 * Tests for the Stripe payment integration, including server actions
 * and API routes for the booking-to-payment flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCheckoutSession, getCheckoutSessionStatus } from '@/lib/stripe/actions';
import { PaymentStatus } from '@/lib/stripe/types';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockReturnValue({ userId: 'test-user-1' })
}));

vi.mock('@/lib/stripe/stripe-server', () => ({
  createBookingCheckoutSession: vi.fn().mockResolvedValue({
    success: true,
    message: 'Checkout session created',
    data: {
      id: 'cs_test_123456',
      url: 'https://checkout.stripe.com/test',
      status: 'open'
    }
  }),
  getCheckoutSession: vi.fn().mockResolvedValue({
    success: true,
    message: 'Checkout session retrieved',
    data: {
      id: 'cs_test_123456',
      status: 'complete',
      payment_status: 'paid',
      metadata: {
        bookingId: 'book_123'
      }
    }
  })
}));

vi.mock('@prisma/client', () => {
  const mockBooking = {
    id: 'book_123',
    builderId: 'build_123',
    clientId: 'test-user-1',
    sessionTypeId: 'st_123',
    startTime: new Date(),
    endTime: new Date(),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    stripeSessionId: 'cs_test_123456',
    sessionType: {
      title: 'Test Session',
      description: 'Test description',
      price: { toNumber: () => 150 },
      currency: 'usd'
    },
    builder: {
      name: 'Test Builder'
    },
    client: {
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      booking: {
        findUnique: vi.fn().mockResolvedValue(mockBooking),
        update: vi.fn().mockResolvedValue(mockBooking)
      }
    }))
  };
});

describe('Stripe Payment Integration', () => {
  describe('createCheckoutSession', () => {
    it('should create a checkout session for a valid booking', async () => {
      // Arrange
      const request = {
        bookingData: {
          id: 'book_123',
          builderId: 'build_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          clientId: 'test-user-1'
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.sessionId).toBeDefined();
      expect(result.data?.url).toBeDefined();
    });

    it('should validate client ownership', async () => {
      // Arrange
      const request = {
        bookingData: {
          id: 'book_123',
          builderId: 'build_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          clientId: 'other-user'  // Different from authenticated user
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('authorization_error');
    });
  });

  describe('getCheckoutSessionStatus', () => {
    it('should retrieve session status for valid session ID', async () => {
      // Act
      const result = await getCheckoutSessionStatus('cs_test_123456');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('complete');
      expect(result.data?.paymentStatus).toBe('paid');
    });
  });
});

// Additional tests would cover:
// 1. API route testing for /api/stripe/checkout
// 2. API route testing for /api/stripe/sessions/[id]
// 3. Component tests for the checkout button and payment confirmation
// 4. End-to-end tests for the complete booking flow