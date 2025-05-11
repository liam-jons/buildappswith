import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import crypto from 'crypto';

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  },
  // For backward compatibility
  enhancedLogger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue({
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    })
  },
  createDomainLogger: vi.fn().mockReturnValue({
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}));

vi.mock('@/lib/scheduling/state-machine', () => ({
  handleCalendlyWebhook: vi.fn().mockResolvedValue({
    success: true,
    previousState: 'CALENDLY_SCHEDULING_INITIATED',
    currentState: 'CALENDLY_EVENT_SCHEDULED',
    stateData: {
      bookingId: 'test-booking-id',
      calendlyEventId: 'test-calendly-event-id'
    }
  }),
  handleStripeWebhook: vi.fn().mockResolvedValue({
    success: true,
    previousState: 'PAYMENT_PENDING',
    currentState: 'PAYMENT_SUCCEEDED',
    stateData: {
      bookingId: 'test-booking-id',
      stripeSessionId: 'test-stripe-session-id'
    }
  })
}));

const mockStripeClient = {
  webhooks: {
    constructEvent: vi.fn().mockImplementation((payload, signature, secret) => {
      if (signature === 'invalid-signature') {
        throw new Error('Invalid signature');
      }
      
      return {
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'test-stripe-session-id',
            metadata: {
              bookingId: 'test-booking-id'
            }
          }
        }
      };
    })
  }
};

vi.mock('@/lib/stripe/stripe-server', () => ({
  createStripeClient: vi.fn().mockReturnValue(mockStripeClient)
}));

// Setup MSW server for mocking HTTP requests
const server = setupServer();
beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterEach(() => vi.clearAllMocks());

describe('Webhook Handlers', () => {
  describe('Calendly Webhook Handler', () => {
    // Helper to generate Calendly webhook signature
    const generateCalendlySignature = (payload: string, secret: string) => {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payload);
      return hmac.digest('hex');
    };
    
    const calendlyWebhookSecret = 'test-calendly-webhook-secret';
    
    // Mock environment variables
    const originalEnv = process.env;
    
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        CALENDLY_WEBHOOK_SIGNING_KEY: calendlyWebhookSecret,
        NODE_ENV: 'test'
      };
    });
    
    afterEach(() => {
      process.env = originalEnv;
    });
    
    it('should process valid Calendly webhooks', async () => {
      const payload = {
        event: 'invitee.created',
        payload: {
          event_type: {
            uuid: 'test-event-type-id',
            name: 'Test Event Type'
          },
          event: {
            uuid: 'test-calendly-event-id',
            uri: 'https://api.calendly.com/scheduled_events/test-calendly-event-id',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString()
          },
          invitee: {
            uuid: 'test-invitee-id',
            uri: 'https://api.calendly.com/invitees/test-invitee-id',
            name: 'Test User',
            email: 'test@example.com'
          },
          tracking: {
            utm_content: 'test-booking-id'
          }
        }
      };
      
      const payloadString = JSON.stringify(payload);
      const signature = generateCalendlySignature(payloadString, calendlyWebhookSecret);
      
      const response = await fetch('/api/webhooks/calendly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'calendly-webhook-signature': signature
        },
        body: payloadString
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.previousState).toBe('CALENDLY_SCHEDULING_INITIATED');
      expect(data.currentState).toBe('CALENDLY_EVENT_SCHEDULED');
    });
    
    it('should reject webhooks with invalid signatures', async () => {
      const payload = {
        event: 'invitee.created',
        payload: {
          event_type: { uuid: 'test-event-type-id' },
          event: { uuid: 'test-calendly-event-id' }
        }
      };
      
      const response = await fetch('/api/webhooks/calendly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'calendly-webhook-signature': 'invalid-signature'
        },
        body: JSON.stringify(payload)
      });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
    
    it('should handle missing booking ID in payload', async () => {
      const payload = {
        event: 'invitee.created',
        payload: {
          event_type: { uuid: 'test-event-type-id' },
          event: { uuid: 'test-calendly-event-id' },
          invitee: { uuid: 'test-invitee-id' },
          // No tracking.utm_content (missing booking ID)
        }
      };
      
      const payloadString = JSON.stringify(payload);
      const signature = generateCalendlySignature(payloadString, calendlyWebhookSecret);
      
      const response = await fetch('/api/webhooks/calendly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'calendly-webhook-signature': signature
        },
        body: payloadString
      });
      
      // Should return 200 to prevent Calendly from retrying
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Missing booking ID');
    });
  });
  
  describe('Stripe Webhook Handler', () => {
    const stripeWebhookSecret = 'test-stripe-webhook-secret';
    
    // Mock environment variables
    const originalEnv = process.env;
    
    beforeEach(() => {
      process.env = {
        ...originalEnv,
        STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
        NODE_ENV: 'test'
      };
    });
    
    afterEach(() => {
      process.env = originalEnv;
    });
    
    it('should process valid Stripe webhooks', async () => {
      const payload = {
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'test-stripe-session-id',
            payment_status: 'paid',
            metadata: {
              bookingId: 'test-booking-id'
            }
          }
        }
      };
      
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid-signature' // Mock implementation ignores real signature
        },
        body: JSON.stringify(payload)
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.previousState).toBe('PAYMENT_PENDING');
      expect(data.currentState).toBe('PAYMENT_SUCCEEDED');
    });
    
    it('should reject webhooks with invalid signatures', async () => {
      const payload = {
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'test-stripe-session-id'
          }
        }
      };
      
      mockStripeClient.webhooks.constructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });
      
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid-signature'
        },
        body: JSON.stringify(payload)
      });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
    
    it('should handle unprocessed webhook events', async () => {
      const payload = {
        id: 'evt_test',
        type: 'unknown.event.type',
        data: {
          object: {
            id: 'test-stripe-session-id'
          }
        }
      };
      
      // Mock constructEvent to return the unknown event type
      mockStripeClient.webhooks.constructEvent.mockImplementationOnce(() => payload);
      
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'valid-signature'
        },
        body: JSON.stringify(payload)
      });
      
      // Should return 200 to prevent Stripe from retrying
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Unhandled event type');
    });
  });
});