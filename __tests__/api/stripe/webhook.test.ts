/**
 * Tests for Stripe webhook API route
 * @version 1.0.110
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/stripe/webhook/route';
import { stripe, handleWebhookEvent } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: 'test_webhook_secret',
  },
}));

// Mock the Stripe module
vi.mock('@/lib/stripe/stripe-server', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  handleWebhookEvent: vi.fn(),
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

// Mock NextRequest
class MockRequest {
  private _headers: Map<string, string>;
  private _body: string;

  constructor(body: string, headers: Record<string, string> = {}) {
    this._body = body;
    this._headers = new Map(Object.entries(headers));
  }

  text() {
    return Promise.resolve(this._body);
  }

  headers = {
    get: (name: string) => this._headers.get(name.toLowerCase()) || null,
  };
}

describe('Stripe Webhook API Route', () => {
  beforeEach(() => {
    // Set up default mocks
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      id: 'evt_test_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            bookingId: 'booking-1',
            builderId: 'builder-1',
            clientId: 'client-1',
            sessionTypeId: 'session-1',
            startTime: '2025-04-26T14:00:00Z',
            endTime: '2025-04-26T15:00:00Z',
          },
        },
      },
      object: 'event',
      api_version: '2025-03-31',
      created: Date.now(),
      livemode: false,
      pending_webhooks: 0,
      request: {
        id: 'req_test_123',
        idempotency_key: 'test_key',
      },
    });

    vi.mocked(handleWebhookEvent).mockResolvedValue({
      success: true,
      message: 'Webhook event processed successfully',
      data: {
        bookingId: 'booking-1',
        status: 'CONFIRMED',
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if signature is missing', async () => {
    const request = new MockRequest('{}');
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Missing signature');
  });

  it('should return 400 if signature verification fails', async () => {
    // Mock constructEvent to throw an error
    vi.mocked(stripe.webhooks.constructEvent).mockImplementationOnce(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const request = new MockRequest('{}', {
      'stripe-signature': 'invalid_signature',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Webhook signature verification failed');
    expect(data.error).toBe('No signatures found matching the expected signature');
  });

  it('should successfully process a valid webhook event', async () => {
    const request = new MockRequest('{"type":"checkout.session.completed"}', {
      'stripe-signature': 'valid_signature',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Webhook received and processed');
    expect(data.data.event).toBe('checkout.session.completed');

    // Verify handleWebhookEvent was called with the correct event
    expect(handleWebhookEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'evt_test_123',
        type: 'checkout.session.completed',
      })
    );
  });

  it('should return 422 if event handling fails', async () => {
    // Mock handleWebhookEvent to return failure
    vi.mocked(handleWebhookEvent).mockResolvedValueOnce({
      success: false,
      message: 'Failed to process event',
    });

    const request = new MockRequest('{"type":"checkout.session.completed"}', {
      'stripe-signature': 'valid_signature',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to process event');
    expect(data.error).toBe('EVENT_HANDLING_FAILED');
  });

  it('should handle unexpected errors gracefully', async () => {
    // Mock handleWebhookEvent to throw an error
    vi.mocked(handleWebhookEvent).mockRejectedValueOnce(
      new Error('Unexpected error')
    );

    const request = new MockRequest('{"type":"checkout.session.completed"}', {
      'stripe-signature': 'valid_signature',
    });
    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Webhook handler failed');
    expect(data.error).toBe('Unexpected error');
  });

  it('should pass the raw body and signature to constructEvent', async () => {
    const eventBody = '{"type":"checkout.session.completed","data":{}}';
    const signature = 'test_signature_abc123';

    const request = new MockRequest(eventBody, {
      'stripe-signature': signature,
    });
    await POST(request as any);

    expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
      eventBody,
      signature,
      'test_webhook_secret'
    );
  });

  it('should log detailed information about the webhook event', async () => {
    const request = new MockRequest('{"type":"checkout.session.completed"}', {
      'stripe-signature': 'valid_signature',
    });
    await POST(request as any);

    expect(logger.info).toHaveBeenCalledWith(
      'Webhook event received: checkout.session.completed',
      expect.objectContaining({ eventId: 'evt_test_123' })
    );
  });
});
