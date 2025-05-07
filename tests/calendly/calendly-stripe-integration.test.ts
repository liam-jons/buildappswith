/**
 * Calendly-Stripe Integration Tests
 * 
 * Tests the integration between Calendly bookings and Stripe payments,
 * covering the creation of checkout sessions for Calendly bookings,
 * processing successful payments, and the complete flow from
 * Calendly event creation to payment completion.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCheckoutSession, handleSuccessfulPayment } from '@/lib/stripe/actions';
import { CheckoutSessionRequest, PaymentStatus } from '@/lib/stripe/types';
import { NextRequest } from 'next/server';
import { AnalyticsEventType } from '@/lib/scheduling/calendly/analytics';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockReturnValue({ userId: 'test-client-1' })
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

vi.mock('@/lib/scheduling/calendly/analytics', () => ({
  trackBookingEvent: vi.fn(),
  AnalyticsEventType: {
    BOOKING_CREATED: 'booking_created',
    CHECKOUT_INITIATED: 'checkout_initiated',
    CHECKOUT_SESSION_CREATED: 'checkout_session_created',
    PAYMENT_COMPLETED: 'payment_completed',
    WEBHOOK_RECEIVED: 'webhook_received',
    WEBHOOK_PROCESSED: 'webhook_processed',
    WEBHOOK_ERROR: 'webhook_error',
    BOOKING_CANCELLED: 'booking_cancelled',
    CHECKOUT_API_REQUESTED: 'checkout_api_requested',
    CHECKOUT_API_SUCCEEDED: 'checkout_api_succeeded',
    CHECKOUT_API_FAILED: 'checkout_api_failed',
    CHECKOUT_API_ERROR: 'checkout_api_error'
  }
}));

// Mock Stripe server functions
vi.mock('@/lib/stripe/stripe-server', () => ({
  createBookingCheckoutSession: vi.fn().mockResolvedValue({
    success: true,
    message: 'Checkout session created',
    data: {
      id: 'cs_test_calendly123',
      url: 'https://checkout.stripe.com/test-calendly',
      status: 'open'
    }
  }),
  getCheckoutSession: vi.fn().mockResolvedValue({
    success: true,
    message: 'Checkout session retrieved',
    data: {
      id: 'cs_test_calendly123',
      status: 'complete',
      payment_status: 'paid',
      metadata: {
        bookingId: 'book_cal123',
        calendlyEventId: 'cal_evt_123'
      }
    }
  }),
  handleWebhookEvent: vi.fn().mockResolvedValue({
    success: true,
    message: 'Webhook event processed successfully'
  }),
  stripe: {
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_calendly123',
            metadata: {
              bookingId: 'book_cal123',
              calendlyEventId: 'cal_evt_123'
            }
          }
        }
      })
    }
  },
  StripeErrorType: {
    INVALID_REQUEST: 'invalid_request',
    AUTHENTICATION_ERROR: 'authentication_error',
    API_ERROR: 'api_error',
    RATE_LIMIT_ERROR: 'rate_limit_error',
    INVALID_PARAMS: 'invalid_params',
    HANDLE_ERROR: 'handle_error'
  }
}));

// Mock Calendly service
vi.mock('@/lib/scheduling/calendly', () => ({
  getCalendlyService: vi.fn().mockReturnValue({
    processWebhookEvent: vi.fn().mockResolvedValue({
      id: 'book_cal123',
      builderId: 'builder_123',
      clientId: 'test-client-1',
      sessionTypeId: 'st_123',
      title: 'Calendly Test Session',
      description: 'Booked through Calendly',
      startTime: '2025-05-01T10:00:00Z',
      endTime: '2025-05-01T11:00:00Z',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      amount: 100,
      clientTimezone: 'America/New_York',
      builderTimezone: 'Europe/London',
      calendlyEventId: 'cal_evt_123',
      calendlyEventUri: 'https://api.calendly.com/events/cal_evt_123',
      calendlyInviteeUri: 'https://api.calendly.com/invitees/inv_123'
    })
  })
}));

// Mock webhook security functions
vi.mock('@/lib/scheduling/calendly/webhook-security', () => ({
  verifyWebhookRequest: vi.fn(),
  logWebhookEvent: vi.fn(),
  WebhookSignatureError: class WebhookSignatureError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  }
}));

// Mock database access
vi.mock('@prisma/client', () => {
  const mockSessionType = {
    id: 'st_123',
    builderId: 'builder_123',
    title: 'Calendly Test Session',
    description: 'Booked through Calendly',
    price: {
      toNumber: () => 100
    },
    currency: 'usd',
    calendlyEventTypeId: 'cal_evt_type_123',
    builder: {
      user: {
        name: 'Test Builder',
        email: 'builder@example.com'
      }
    }
  };

  const mockUser = {
    id: 'test-client-1',
    name: 'Test Client',
    email: 'client@example.com'
  };

  const mockCalendlyBooking = {
    id: 'book_cal123',
    builderId: 'builder_123',
    clientId: 'test-client-1',
    sessionTypeId: 'st_123',
    title: 'Calendly Test Session',
    description: 'Booked through Calendly',
    startTime: new Date('2025-05-01T10:00:00Z'),
    endTime: new Date('2025-05-01T11:00:00Z'),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    stripeSessionId: 'cs_test_calendly123',
    amount: {
      toNumber: () => 100
    },
    clientTimezone: 'America/New_York',
    builderTimezone: 'Europe/London',
    calendlyEventId: 'cal_evt_123',
    calendlyEventUri: 'https://api.calendly.com/events/cal_evt_123',
    calendlyInviteeUri: 'https://api.calendly.com/invitees/inv_123',
    sessionType: {
      title: 'Calendly Test Session',
      description: 'Booked through Calendly',
      price: {
        toNumber: () => 100
      },
      currency: 'usd'
    },
    builder: {
      user: {
        name: 'Test Builder',
        email: 'builder@example.com'
      }
    },
    client: {
      name: 'Test Client',
      email: 'client@example.com'
    }
  };

  const mockPrismaClient = {
    booking: {
      findUnique: vi.fn().mockResolvedValue(mockCalendlyBooking),
      findFirst: vi.fn().mockResolvedValue(mockCalendlyBooking),
      create: vi.fn().mockResolvedValue(mockCalendlyBooking),
      update: vi.fn().mockResolvedValue(mockCalendlyBooking)
    },
    sessionType: {
      findUnique: vi.fn().mockResolvedValue(mockSessionType)
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(mockUser)
    }
  };

  return {
    PrismaClient: vi.fn().mockImplementation(() => mockPrismaClient)
  };
});

// Mock scheduling service functions
vi.mock('@/lib/scheduling/real-data/scheduling-service', () => ({
  getBookingById: vi.fn().mockResolvedValue({
    id: 'book_cal123',
    builderId: 'builder_123',
    clientId: 'test-client-1',
    sessionTypeId: 'st_123',
    startTime: new Date('2025-05-01T10:00:00Z'),
    endTime: new Date('2025-05-01T11:00:00Z'),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    amount: 100,
    calendlyEventId: 'cal_evt_123'
  }),
  updateBookingPayment: vi.fn().mockResolvedValue(true),
  updateBookingStatus: vi.fn().mockResolvedValue(true)
}));

describe('Calendly-Stripe Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Creating Checkout Session for Calendly Booking', () => {
    it('should create a checkout session for an existing Calendly booking', async () => {
      // Arrange
      const request: CheckoutSessionRequest = {
        bookingData: {
          id: 'book_cal123',
          builderId: 'builder_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          clientId: 'test-client-1',
          clientTimezone: 'America/New_York',
          calendlyEventId: 'cal_evt_123',
          calendlyEventUri: 'https://api.calendly.com/events/cal_evt_123',
          calendlyInviteeUri: 'https://api.calendly.com/invitees/inv_123'
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.sessionId).toBe('cs_test_calendly123');
      expect(result.data?.url).toBe('https://checkout.stripe.com/test-calendly');
      
      // Verify analytics tracking
      expect(vi.mocked(trackBookingEvent)).toHaveBeenCalledWith(
        AnalyticsEventType.CHECKOUT_INITIATED,
        expect.objectContaining({
          builderId: 'builder_123',
          sessionTypeId: 'st_123',
          hasCalendlyId: true
        })
      );
      
      expect(vi.mocked(trackBookingEvent)).toHaveBeenCalledWith(
        AnalyticsEventType.CHECKOUT_SESSION_CREATED,
        expect.objectContaining({
          bookingId: 'book_cal123',
          stripeSessionId: 'cs_test_calendly123',
          calendlyEventId: 'cal_evt_123'
        })
      );
    });

    it('should create a new booking when given only Calendly event ID', async () => {
      // Arrange - Mock findFirst to return null first time (no existing booking)
      const prismaClientMock = vi.mocked(new (vi.mocked(require('@prisma/client')).PrismaClient)());
      prismaClientMock.booking.findFirst.mockResolvedValueOnce(null);
      
      const request: CheckoutSessionRequest = {
        bookingData: {
          builderId: 'builder_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          clientTimezone: 'America/New_York',
          calendlyEventId: 'cal_evt_123', // Only Calendly info, no booking ID
          calendlyEventUri: 'https://api.calendly.com/events/cal_evt_123',
          calendlyInviteeUri: 'https://api.calendly.com/invitees/inv_123'
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.sessionId).toBe('cs_test_calendly123');
      
      // Verify booking was created
      expect(prismaClientMock.booking.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            builderId: 'builder_123',
            clientId: 'test-client-1',
            sessionTypeId: 'st_123',
            calendlyEventId: 'cal_evt_123'
          })
        })
      );
      
      // Verify analytics tracking for new booking
      expect(vi.mocked(trackBookingEvent)).toHaveBeenCalledWith(
        AnalyticsEventType.BOOKING_CREATED,
        expect.objectContaining({
          builderId: 'builder_123',
          clientId: 'test-client-1',
          isCalendly: true
        })
      );
    });

    it('should handle missing session type error', async () => {
      // Arrange - Mock sessionType.findUnique to return null
      const prismaClientMock = vi.mocked(new (vi.mocked(require('@prisma/client')).PrismaClient)());
      prismaClientMock.booking.findFirst.mockResolvedValueOnce(null);
      prismaClientMock.sessionType.findUnique.mockResolvedValueOnce(null);
      
      const request: CheckoutSessionRequest = {
        bookingData: {
          builderId: 'builder_123',
          sessionTypeId: 'invalid-session-type',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          calendlyEventId: 'cal_evt_123'
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
      expect(result.error?.detail).toContain('Session type not found');
    });

    it('should validate client ID ownership', async () => {
      // Arrange
      const request: CheckoutSessionRequest = {
        bookingData: {
          id: 'book_cal123',
          builderId: 'builder_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          clientId: 'wrong-client-id', // Different from authenticated user
          calendlyEventId: 'cal_evt_123'
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

  describe('Handling Successful Payment', () => {
    it('should process a successful payment and update booking status', async () => {
      // Act
      const result = await handleSuccessfulPayment('cs_test_calendly123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.bookingId).toBe('book_cal123');
      expect(result.message).toContain('Payment processed successfully');
      
      // Verify booking was updated
      const updateBookingPayment = vi.mocked(require('@/lib/scheduling/real-data/scheduling-service').updateBookingPayment);
      expect(updateBookingPayment).toHaveBeenCalledWith(
        'book_cal123',
        'PAID',
        'cs_test_calendly123'
      );
      
      const updateBookingStatus = vi.mocked(require('@/lib/scheduling/real-data/scheduling-service').updateBookingStatus);
      expect(updateBookingStatus).toHaveBeenCalledWith(
        'book_cal123',
        'CONFIRMED'
      );
      
      // Verify analytics tracking
      expect(vi.mocked(trackBookingEvent)).toHaveBeenCalledWith(
        AnalyticsEventType.PAYMENT_COMPLETED,
        expect.objectContaining({
          bookingId: 'book_cal123',
          stripeSessionId: 'cs_test_calendly123',
          calendlyEventId: 'cal_evt_123'
        })
      );
    });

    it('should handle non-paid checkout session', async () => {
      // Arrange - Mock getCheckoutSession to return unpaid status
      const getCheckoutSession = vi.mocked(require('@/lib/stripe/stripe-server').getCheckoutSession);
      getCheckoutSession.mockResolvedValueOnce({
        success: true,
        message: 'Checkout session retrieved',
        data: {
          id: 'cs_test_calendly123',
          status: 'open',
          payment_status: 'unpaid',
          metadata: {
            bookingId: 'book_cal123',
            calendlyEventId: 'cal_evt_123'
          }
        }
      });

      // Act
      const result = await handleSuccessfulPayment('cs_test_calendly123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('payment_incomplete');
      expect(result.bookingId).toBe('book_cal123');
      
      // Verify booking was NOT updated
      const updateBookingPayment = vi.mocked(require('@/lib/scheduling/real-data/scheduling-service').updateBookingPayment);
      expect(updateBookingPayment).not.toHaveBeenCalled();
    });

    it('should validate user authentication', async () => {
      // Arrange - Mock auth to return no user
      vi.mocked(require('@clerk/nextjs/server').auth).mockReturnValueOnce({ userId: null });

      // Act
      const result = await handleSuccessfulPayment('cs_test_calendly123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('authentication_error');
    });

    it('should validate booking ownership', async () => {
      // Arrange - Mock getBookingById to return a booking with different clientId
      const getBookingById = vi.mocked(require('@/lib/scheduling/real-data/scheduling-service').getBookingById);
      getBookingById.mockResolvedValueOnce({
        id: 'book_cal123',
        builderId: 'builder_123',
        clientId: 'different-client-id', // Different from authenticated user
        sessionTypeId: 'st_123',
        startTime: new Date('2025-05-01T10:00:00Z'),
        endTime: new Date('2025-05-01T11:00:00Z'),
        calendlyEventId: 'cal_evt_123'
      });

      // Act
      const result = await handleSuccessfulPayment('cs_test_calendly123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('authorization_error');
    });
  });

  describe('Complete Calendly-Stripe Flow', () => {
    it('should handle the complete flow from Calendly webhook to payment completion', async () => {
      // This test simulates the full flow:
      // 1. Calendly webhook -> 2. Creating booking -> 3. Creating checkout session -> 4. Processing payment

      // Step 1: Mock Calendly webhook data
      const webhookPayload = {
        event: 'invitee.created',
        payload: {
          event: {
            uuid: 'cal_evt_123',
            start_time: '2025-05-01T10:00:00Z',
            end_time: '2025-05-01T11:00:00Z'
          },
          event_type: {
            uuid: 'cal_evt_type_123'
          },
          invitee: {
            email: 'client@example.com',
            name: 'Test Client'
          }
        }
      };

      // Create mock request with headers and body
      const mockHeaders = new Headers();
      mockHeaders.set('calendly-webhook-signature', 'mock-signature');
      
      // Step 2: Process Calendly webhook to create booking
      const calendlyService = vi.mocked(require('@/lib/scheduling/calendly').getCalendlyService());
      const processedBooking = await calendlyService.processWebhookEvent(webhookPayload);
      
      expect(processedBooking).toBeDefined();
      expect(processedBooking.calendlyEventId).toBe('cal_evt_123');
      
      // Step 3: Create checkout session for the booking
      const checkoutRequest: CheckoutSessionRequest = {
        bookingData: {
          id: processedBooking.id,
          builderId: processedBooking.builderId,
          sessionTypeId: processedBooking.sessionTypeId,
          startTime: processedBooking.startTime,
          endTime: processedBooking.endTime,
          clientId: processedBooking.clientId,
          calendlyEventId: processedBooking.calendlyEventId
        },
        returnUrl: 'https://example.com/confirmation'
      };
      
      const checkoutResult = await createCheckoutSession(checkoutRequest);
      
      expect(checkoutResult.success).toBe(true);
      expect(checkoutResult.data?.sessionId).toBe('cs_test_calendly123');
      
      // Step 4: Process payment success
      const paymentResult = await handleSuccessfulPayment('cs_test_calendly123');
      
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.bookingId).toBe('book_cal123');
      
      // Verify final state - booking should be CONFIRMED and PAID
      const updateBookingStatus = vi.mocked(require('@/lib/scheduling/real-data/scheduling-service').updateBookingStatus);
      expect(updateBookingStatus).toHaveBeenCalledWith('book_cal123', 'CONFIRMED');
      
      const updateBookingPayment = vi.mocked(require('@/lib/scheduling/real-data/scheduling-service').updateBookingPayment);
      expect(updateBookingPayment).toHaveBeenCalledWith('book_cal123', 'PAID', 'cs_test_calendly123');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors when creating a booking', async () => {
      // Arrange - Mock booking.create to throw an error
      const prismaClientMock = vi.mocked(new (vi.mocked(require('@prisma/client')).PrismaClient)());
      prismaClientMock.booking.findFirst.mockResolvedValueOnce(null);
      prismaClientMock.booking.create.mockRejectedValueOnce(new Error('Database connection error'));
      
      const request: CheckoutSessionRequest = {
        bookingData: {
          builderId: 'builder_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          calendlyEventId: 'cal_evt_123'
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('database_error');
      expect(result.error?.detail).toContain('Database connection error');
    });

    it('should handle Stripe API errors', async () => {
      // Arrange - Mock createBookingCheckoutSession to return an error
      const createBookingCheckoutSession = vi.mocked(require('@/lib/stripe/stripe-server').createBookingCheckoutSession);
      createBookingCheckoutSession.mockResolvedValueOnce({
        success: false,
        message: 'Failed to create checkout session',
        error: {
          type: 'api_error',
          detail: 'Stripe API error'
        }
      });
      
      const request: CheckoutSessionRequest = {
        bookingData: {
          id: 'book_cal123',
          builderId: 'builder_123',
          sessionTypeId: 'st_123',
          startTime: '2025-05-01T10:00:00Z',
          endTime: '2025-05-01T11:00:00Z',
          clientId: 'test-client-1',
          calendlyEventId: 'cal_evt_123'
        },
        returnUrl: 'https://example.com/confirmation'
      };

      // Act
      const result = await createCheckoutSession(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to create checkout session');
      expect(result.error?.type).toBe('api_error');
    });

    it('should handle Stripe session retrieval errors', async () => {
      // Arrange - Mock getCheckoutSession to return an error
      const getCheckoutSession = vi.mocked(require('@/lib/stripe/stripe-server').getCheckoutSession);
      getCheckoutSession.mockResolvedValueOnce({
        success: false,
        message: 'Failed to retrieve checkout session',
        error: {
          type: 'not_found',
          detail: 'Checkout session not found'
        }
      });

      // Act
      const result = await handleSuccessfulPayment('cs_test_calendly123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to retrieve checkout session');
      expect(result.error?.type).toBe('not_found');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange - Mock getCheckoutSession to throw an error
      const getCheckoutSession = vi.mocked(require('@/lib/stripe/stripe-server').getCheckoutSession);
      getCheckoutSession.mockRejectedValueOnce(new Error('Unexpected error'));

      // Act
      const result = await handleSuccessfulPayment('cs_test_calendly123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('unknown_error');
    });
  });
});