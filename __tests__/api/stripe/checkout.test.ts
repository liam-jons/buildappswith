/**
 * Tests for Stripe checkout API route
 * @version 1.0.110
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/stripe/checkout/route';
import { stripe } from '@/lib/stripe/stripe-server';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs';

// Mock the Stripe module
vi.mock('@/lib/stripe/stripe-server', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test-session',
        }),
      },
    },
  },
  STRIPE_API_VERSION: '2025-03-31.basil',
}));

// Mock the Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    sessionType: {
      findUnique: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock the auth
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(),
}));

// Mock NextRequest
class MockRequest {
  private _body: any;

  constructor(body: any) {
    this._body = body;
  }

  json() {
    return Promise.resolve(this._body);
  }
}

describe('Stripe Checkout API Route', () => {
  beforeEach(() => {
    // Set up default auth mock to return a user
    vi.mocked(auth).mockReturnValue({
      userId: 'test-user-id',
      getToken: vi.fn(),
      has: vi.fn(),
      isSignedIn: true,
      sessionClaims: {},
      sessionId: 'test-session-id',
      actor: null,
    });

    // Set up default Prisma mocks
    vi.mocked(prisma.sessionType.findUnique).mockResolvedValue({
      id: 'session-type-1',
      title: 'Test Session Type',
      description: 'A test session type',
      price: 9900,
      currency: 'usd',
      durationMinutes: 60,
      builder: {
        id: 'builder-1',
        availableForHire: true,
      },
      builderId: 'builder-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.booking.create).mockResolvedValue({
      id: 'booking-1',
      builderId: 'builder-1',
      clientId: 'test-user-id',
      sessionTypeId: 'session-type-1',
      title: 'Test Session Type',
      description: 'A test session type',
      startTime: new Date(),
      endTime: new Date(),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      amount: 99,
      stripeSessionId: null,
      clientTimezone: null,
      builderTimezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(prisma.booking.update).mockResolvedValue({
      id: 'booking-1',
      stripeSessionId: 'cs_test_123',
      builderId: 'builder-1',
      clientId: 'test-user-id',
      sessionTypeId: 'session-type-1',
      title: 'Test Session Type',
      description: 'A test session type',
      startTime: new Date(),
      endTime: new Date(),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      amount: 99,
      clientTimezone: null,
      builderTimezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock auth to return no user
    vi.mocked(auth).mockReturnValue({
      userId: null,
      getToken: vi.fn(),
      has: vi.fn(),
      isSignedIn: false,
      sessionClaims: {},
      sessionId: null,
      actor: null,
    });

    const request = new MockRequest({});
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Authentication required');
  });

  it('should return 400 if required fields are missing', async () => {
    const request = new MockRequest({});
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Missing required fields');
  });

  it('should return 400 if booking data is incomplete', async () => {
    const request = new MockRequest({
      bookingData: {},
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Missing required booking details');
  });

  it('should return 403 if client ID does not match authenticated user', async () => {
    const request = new MockRequest({
      bookingData: {
        id: 'booking-1',
        sessionTypeId: 'session-type-1',
        startTime: '2025-04-26T14:00:00Z',
        endTime: '2025-04-26T15:00:00Z',
        builderId: 'builder-1',
        clientId: 'different-user-id',
      },
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.message).toBe('User mismatch in booking request');
  });

  it('should return 404 if session type is not found', async () => {
    // Mock findUnique to return null (session type not found)
    vi.mocked(prisma.sessionType.findUnique).mockResolvedValueOnce(null);

    const request = new MockRequest({
      bookingData: {
        id: 'booking-1',
        sessionTypeId: 'non-existent-session',
        startTime: '2025-04-26T14:00:00Z',
        endTime: '2025-04-26T15:00:00Z',
        builderId: 'builder-1',
        clientId: 'test-user-id',
      },
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Session type not found');
  });

  it('should return 400 if builder is not available for hire', async () => {
    // Mock findUnique to return builder not available
    vi.mocked(prisma.sessionType.findUnique).mockResolvedValueOnce({
      id: 'session-type-1',
      title: 'Test Session Type',
      description: 'A test session type',
      price: 9900,
      currency: 'usd',
      durationMinutes: 60,
      builder: {
        id: 'builder-1',
        availableForHire: false,
      },
      builderId: 'builder-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const request = new MockRequest({
      bookingData: {
        id: 'booking-1',
        sessionTypeId: 'session-type-1',
        startTime: '2025-04-26T14:00:00Z',
        endTime: '2025-04-26T15:00:00Z',
        builderId: 'builder-1',
        clientId: 'test-user-id',
      },
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Builder unavailable for booking');
  });

  it('should successfully create a checkout session for a new booking', async () => {
    const bookingData = {
      sessionTypeId: 'session-type-1',
      startTime: '2025-04-26T14:00:00Z',
      endTime: '2025-04-26T15:00:00Z',
      builderId: 'builder-1',
      clientId: 'test-user-id',
    };

    const request = new MockRequest({
      bookingData,
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Checkout session created');
    expect(data.data.sessionId).toBe('cs_test_123');
    expect(data.data.url).toBe('https://checkout.stripe.com/test-session');

    // Verify prisma calls
    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        builderId: 'builder-1',
        clientId: 'test-user-id',
        sessionTypeId: 'session-type-1',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
      }),
    });

    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'booking-1' },
      data: { stripeSessionId: 'cs_test_123' },
    });

    // Verify Stripe calls
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        payment_method_types: ['card'],
        success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/cancel',
        metadata: expect.objectContaining({
          bookingId: 'booking-1',
          sessionTypeId: 'session-type-1',
          builderId: 'builder-1',
          clientId: 'test-user-id',
        }),
      })
    );
  });

  it('should update an existing booking when bookingId is provided', async () => {
    // Mock findUnique to return an existing booking
    vi.mocked(prisma.booking.findUnique).mockResolvedValueOnce({
      id: 'existing-booking',
      builderId: 'builder-1',
      clientId: 'test-user-id',
      sessionTypeId: 'old-session-type',
      title: 'Old Session Type',
      description: 'An old session type',
      startTime: new Date('2025-04-25T14:00:00Z'),
      endTime: new Date('2025-04-25T15:00:00Z'),
      status: 'CANCELLED',
      paymentStatus: 'UNPAID',
      amount: 99,
      stripeSessionId: null,
      clientTimezone: null,
      builderTimezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const bookingData = {
      id: 'existing-booking',
      sessionTypeId: 'session-type-1',
      startTime: '2025-04-26T14:00:00Z',
      endTime: '2025-04-26T15:00:00Z',
      builderId: 'builder-1',
      clientId: 'test-user-id',
    };

    const request = new MockRequest({
      bookingData,
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify prisma update was called instead of create
    expect(prisma.booking.create).not.toHaveBeenCalled();
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'existing-booking' },
        data: expect.objectContaining({
          sessionTypeId: 'session-type-1',
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        }),
      })
    );
  });

  it('should handle Stripe errors gracefully', async () => {
    // Mock Stripe to throw an error
    vi.mocked(stripe.checkout.sessions.create).mockRejectedValueOnce(
      new Error('Stripe API error')
    );

    const request = new MockRequest({
      bookingData: {
        sessionTypeId: 'session-type-1',
        startTime: '2025-04-26T14:00:00Z',
        endTime: '2025-04-26T15:00:00Z',
        builderId: 'builder-1',
        clientId: 'test-user-id',
      },
      returnUrl: 'https://example.com',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Error creating checkout session');
    expect(data.error).toBe('Stripe API error');
  });
});
