/**
 * Tests for Stripe server utilities
 * @version 1.0.124
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { 
  stripe, 
  getOrCreateCustomer, 
  createBookingCheckoutSession,
  handleWebhookEvent,
  getCheckoutSession,
  createRefund,
  StripeErrorType
} from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';

// Mock the Stripe module
vi.mock('stripe', () => {
  const StripeConstructor = vi.fn(() => ({
    customers: {
      list: vi.fn(),
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
    },
    refunds: {
      create: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  }));
  return {
    Stripe: StripeConstructor,
  };
});

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Stripe Server Utilities', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('getOrCreateCustomer', () => {
    it('should return existing customer when found', async () => {
      // Arrange
      const mockCustomerId = 'cus_existing123';
      vi.mocked(stripe.customers.list).mockResolvedValueOnce({
        object: 'list',
        data: [{ id: mockCustomerId, object: 'customer' }],
        has_more: false,
        url: '/v1/customers',
      });

      // Act
      const result = await getOrCreateCustomer({
        email: 'test@example.com',
        userId: 'user123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockCustomerId);
      expect(stripe.customers.list).toHaveBeenCalledWith({
        email: 'test@example.com',
        limit: 1,
      });
      expect(stripe.customers.create).not.toHaveBeenCalled();
    });

    it('should create new customer when not found', async () => {
      // Arrange
      const mockCustomerId = 'cus_new123';
      vi.mocked(stripe.customers.list).mockResolvedValueOnce({
        object: 'list',
        data: [],
        has_more: false,
        url: '/v1/customers',
      });
      vi.mocked(stripe.customers.create).mockResolvedValueOnce({
        id: mockCustomerId,
        object: 'customer',
      } as any);

      // Act
      const result = await getOrCreateCustomer({
        email: 'new@example.com',
        name: 'New User',
        userId: 'user456',
        metadata: { source: 'test' },
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockCustomerId);
      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
        metadata: {
          userId: 'user456',
          source: 'test',
        },
      });
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const mockError = new Error('API error');
      mockError.name = 'StripeError';
      (mockError as any).type = 'api_error';
      
      vi.mocked(stripe.customers.list).mockRejectedValueOnce(mockError);

      // Act
      const result = await getOrCreateCustomer({
        email: 'error@example.com',
        userId: 'user789',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe(StripeErrorType.API);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createBookingCheckoutSession', () => {
    it('should create a checkout session with existing customer ID', async () => {
      // Arrange
      const mockSessionId = 'cs_test123';
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValueOnce({
        id: mockSessionId,
        url: 'https://checkout.stripe.com/test',
      } as any);

      // Act
      const result = await createBookingCheckoutSession({
        builderId: 'builder123',
        builderName: 'Test Builder',
        sessionType: 'One-on-one',
        sessionPrice: 9900,
        startTime: '2025-04-28T14:00:00Z',
        endTime: '2025-04-28T15:00:00Z',
        timeZone: 'America/New_York',
        customerId: 'cus_existing123',
        userId: 'user123',
        userEmail: 'test@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockSessionId);
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
        customer: 'cus_existing123',
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: expect.objectContaining({
          builderId: 'builder123',
          userId: 'user123',
        }),
      }));
    });

    it('should get or create customer when no customer ID is provided', async () => {
      // Arrange
      const mockCustomerId = 'cus_new456';
      const mockSessionId = 'cs_test456';
      
      vi.mocked(stripe.customers.list).mockResolvedValueOnce({
        object: 'list',
        data: [],
        has_more: false,
        url: '/v1/customers',
      });
      
      vi.mocked(stripe.customers.create).mockResolvedValueOnce({
        id: mockCustomerId,
        object: 'customer',
      } as any);
      
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValueOnce({
        id: mockSessionId,
        url: 'https://checkout.stripe.com/test',
      } as any);

      // Act
      const result = await createBookingCheckoutSession({
        builderId: 'builder123',
        builderName: 'Test Builder',
        sessionType: 'One-on-one',
        sessionPrice: 9900,
        startTime: '2025-04-28T14:00:00Z',
        endTime: '2025-04-28T15:00:00Z',
        timeZone: 'America/New_York',
        userId: 'user123',
        userEmail: 'test@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockSessionId);
      expect(stripe.customers.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        metadata: expect.objectContaining({
          userId: 'user123',
        }),
      }));
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
        customer: mockCustomerId,
      }));
    });

    it('should handle customer creation failure', async () => {
      // Arrange
      const mockError = new Error('API error');
      mockError.name = 'StripeError';
      (mockError as any).type = 'api_error';
      
      vi.mocked(stripe.customers.list).mockRejectedValueOnce(mockError);

      // Act
      const result = await createBookingCheckoutSession({
        builderId: 'builder123',
        builderName: 'Test Builder',
        sessionType: 'One-on-one',
        sessionPrice: 9900,
        startTime: '2025-04-28T14:00:00Z',
        endTime: '2025-04-28T15:00:00Z',
        timeZone: 'America/New_York',
        userId: 'user123',
        userEmail: 'test@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe(StripeErrorType.API);
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it('should include booking ID in metadata when provided', async () => {
      // Arrange
      const mockSessionId = 'cs_test789';
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValueOnce({
        id: mockSessionId,
        url: 'https://checkout.stripe.com/test',
      } as any);

      // Act
      const result = await createBookingCheckoutSession({
        builderId: 'builder123',
        builderName: 'Test Builder',
        sessionType: 'One-on-one',
        sessionPrice: 9900,
        startTime: '2025-04-28T14:00:00Z',
        endTime: '2025-04-28T15:00:00Z',
        timeZone: 'America/New_York',
        customerId: 'cus_existing123',
        userId: 'user123',
        userEmail: 'test@example.com',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        bookingId: 'booking123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
        metadata: expect.objectContaining({
          bookingId: 'booking123',
        }),
      }));
    });
  });

  describe('handleWebhookEvent', () => {
    it('should handle checkout.session.completed event', async () => {
      // Arrange
      const mockEvent = {
        id: 'evt_test123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test123',
            metadata: {
              bookingId: 'booking123',
              builderId: 'builder123',
              userId: 'user123',
              sessionTypeId: 'session123',
              startTime: '2025-04-28T14:00:00Z',
              endTime: '2025-04-28T15:00:00Z',
            },
          },
        },
      } as any;

      // Act
      const result = await handleWebhookEvent(mockEvent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.bookingId).toBe('booking123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Payment succeeded'),
        expect.objectContaining({ sessionId: 'cs_test123' })
      );
    });

    it('should handle missing metadata in checkout.session.completed event', async () => {
      // Arrange
      const mockEvent = {
        id: 'evt_test456',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test456',
            metadata: {
              // Missing required fields
              bookingId: 'booking123',
            },
          },
        },
      } as any;

      // Act
      const result = await handleWebhookEvent(mockEvent);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe(StripeErrorType.VALIDATION);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Missing required metadata'),
        expect.any(Object)
      );
    });

    it('should handle payment_intent.succeeded event', async () => {
      // Arrange
      const mockEvent = {
        id: 'evt_test789',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test123',
            amount: 9900,
            currency: 'usd',
            status: 'succeeded',
          },
        },
      } as any;

      // Act
      const result = await handleWebhookEvent(mockEvent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.paymentIntentId).toBe('pi_test123');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('PaymentIntent succeeded'),
        expect.objectContaining({ paymentIntentId: 'pi_test123' })
      );
    });

    it('should handle payment_intent.payment_failed event', async () => {
      // Arrange
      const mockEvent = {
        id: 'evt_testfail',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_testfail',
            status: 'requires_payment_method',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined',
            },
          },
        },
      } as any;

      // Act
      const result = await handleWebhookEvent(mockEvent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.paymentIntentId).toBe('pi_testfail');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('PaymentIntent failed'),
        expect.objectContaining({ paymentIntentId: 'pi_testfail' })
      );
    });

    it('should gracefully handle unrecognized event types', async () => {
      // Arrange
      const mockEvent = {
        id: 'evt_unknown',
        type: 'unknown.event.type',
        data: {
          object: {},
        },
      } as any;

      // Act
      const result = await handleWebhookEvent(mockEvent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Unhandled event type');
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Unhandled event type'),
        expect.objectContaining({ eventId: 'evt_unknown' })
      );
    });
  });

  describe('getCheckoutSession', () => {
    it('should retrieve a checkout session successfully', async () => {
      // Arrange
      const mockSessionId = 'cs_retrieve123';
      vi.mocked(stripe.checkout.sessions.retrieve).mockResolvedValueOnce({
        id: mockSessionId,
        payment_status: 'paid',
        customer: 'cus_123',
        payment_intent: 'pi_123',
      } as any);

      // Act
      const result = await getCheckoutSession(mockSessionId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockSessionId);
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        mockSessionId,
        { expand: ['payment_intent', 'customer'] }
      );
    });

    it('should handle errors when retrieving checkout session', async () => {
      // Arrange
      const mockError = new Error('Not found');
      mockError.name = 'StripeError';
      (mockError as any).type = 'invalid_request_error';
      (mockError as any).code = 'resource_missing';
      
      vi.mocked(stripe.checkout.sessions.retrieve).mockRejectedValueOnce(mockError);

      // Act
      const result = await getCheckoutSession('non_existent_session');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe(StripeErrorType.INVALID_REQUEST);
      expect(result.error?.code).toBe('resource_missing');
    });
  });

  describe('createRefund', () => {
    it('should create a full refund successfully', async () => {
      // Arrange
      const mockPaymentIntentId = 'pi_refund123';
      const mockRefundId = 're_test123';
      
      vi.mocked(stripe.refunds.create).mockResolvedValueOnce({
        id: mockRefundId,
        object: 'refund',
        amount: 9900,
        status: 'succeeded',
      } as any);

      // Act
      const result = await createRefund(mockPaymentIntentId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockRefundId);
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: mockPaymentIntentId,
      });
    });

    it('should create a partial refund with reason', async () => {
      // Arrange
      const mockPaymentIntentId = 'pi_refund456';
      const mockRefundId = 're_test456';
      const refundAmount = 5000;
      
      vi.mocked(stripe.refunds.create).mockResolvedValueOnce({
        id: mockRefundId,
        object: 'refund',
        amount: refundAmount,
        status: 'succeeded',
        reason: 'requested_by_customer',
      } as any);

      // Act
      const result = await createRefund(
        mockPaymentIntentId,
        refundAmount,
        'requested_by_customer'
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockRefundId);
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: mockPaymentIntentId,
        amount: refundAmount,
        reason: 'requested_by_customer',
      });
    });

    it('should handle errors when creating refund', async () => {
      // Arrange
      const mockError = new Error('Refund failed');
      mockError.name = 'StripeError';
      (mockError as any).type = 'card_error';
      
      vi.mocked(stripe.refunds.create).mockRejectedValueOnce(mockError);

      // Act
      const result = await createRefund('pi_error');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe(StripeErrorType.CARD);
    });
  });
});
