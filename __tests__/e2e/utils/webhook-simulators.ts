/**
 * Webhook Simulators for E2E Tests
 * 
 * Provides utilities to simulate Calendly and Stripe webhook events
 * with proper signatures for testing.
 */
import crypto from 'crypto';

/**
 * Base webhook simulator interface
 */
interface WebhookSimulator {
  sendEvent(eventType: string, eventData: Record<string, any>): Promise<Response>;
  generateSignature(payload: string): string;
}

/**
 * Calendly event types
 */
export type CalendlyEventType = 
  | 'invitee.created' 
  | 'invitee.canceled' 
  | 'invitee.rescheduled';

/**
 * Calendly webhook event data
 */
export interface CalendlyEventData {
  event: {
    uuid: string;
    start_time: string;
    end_time: string;
    status: string;
  };
  invitee: {
    uuid: string;
    name: string;
    email: string;
    timezone: string;
  };
  event_type: {
    uuid: string;
    name: string;
    duration: number;
  };
  tracking: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    salesforce_uuid?: string;
  };
}

/**
 * Calendly Webhook Simulator
 * 
 * Simulates Calendly webhook events with proper signatures
 */
export class CalendlyWebhookSimulator implements WebhookSimulator {
  constructor(
    private baseUrl: string,
    private signingKey: string = 'test-signing-key'
  ) {}

  /**
   * Send a simulated Calendly webhook event
   * 
   * @param eventType - Type of Calendly event
   * @param eventData - Event data to include in the payload
   * @param bookingId - Optional booking ID to include in tracking
   * @returns Response from the webhook endpoint
   */
  async sendEvent(
    eventType: CalendlyEventType,
    eventData: Partial<CalendlyEventData> = {},
    bookingId?: string
  ): Promise<Response> {
    // Create full payload with defaults
    const payload = this.createPayload(eventType, eventData, bookingId);
    
    // Generate the signature using HMAC
    const payloadString = JSON.stringify(payload);
    const signature = this.generateSignature(payloadString);
    
    // Send the webhook request
    return await fetch(`${this.baseUrl}/api/webhooks/calendly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': signature
      },
      body: payloadString
    });
  }

  /**
   * Generate HMAC signature for Calendly webhook
   */
  generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', this.signingKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Create standardized Calendly webhook payload
   */
  private createPayload(
    eventType: CalendlyEventType,
    eventData: Partial<CalendlyEventData> = {},
    bookingId?: string
  ): Record<string, any> {
    // Default event data
    const defaultEventUuid = 'test-calendly-event-' + Date.now();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create default event data structure
    const defaultPayload = {
      event: eventType,
      payload: {
        event: {
          uuid: defaultEventUuid,
          start_time: tomorrow.toISOString(),
          end_time: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(),
          status: 'active'
        },
        invitee: {
          uuid: 'test-invitee-' + Date.now(),
          name: 'Test User',
          email: 'test@example.com',
          timezone: 'America/New_York'
        },
        event_type: {
          uuid: 'test-event-type-' + Date.now(),
          name: 'Test Session',
          duration: 30
        },
        tracking: {
          utm_source: 'buildappswith',
          utm_content: bookingId || ''
        }
      }
    };
    
    // Merge with provided event data
    if (eventData.event) {
      defaultPayload.payload.event = {
        ...defaultPayload.payload.event,
        ...eventData.event
      };
    }
    
    if (eventData.invitee) {
      defaultPayload.payload.invitee = {
        ...defaultPayload.payload.invitee,
        ...eventData.invitee
      };
    }
    
    if (eventData.event_type) {
      defaultPayload.payload.event_type = {
        ...defaultPayload.payload.event_type,
        ...eventData.event_type
      };
    }
    
    if (eventData.tracking) {
      defaultPayload.payload.tracking = {
        ...defaultPayload.payload.tracking,
        ...eventData.tracking
      };
    }
    
    return defaultPayload;
  }
}

/**
 * Stripe event types
 */
export type StripeEventType =
  | 'checkout.session.completed'
  | 'checkout.session.expired'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'charge.succeeded'
  | 'charge.failed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted';

/**
 * Stripe webhook event data
 */
export interface StripeEventData {
  id?: string;
  object?: string;
  api_version?: string;
  created?: number;
  data?: {
    object: Record<string, any>;
  };
  livemode?: boolean;
  pending_webhooks?: number;
  request?: {
    id: string | null;
    idempotency_key: string | null;
  };
  type?: string;
}

/**
 * Stripe Webhook Simulator
 * 
 * Simulates Stripe webhook events with proper signatures
 */
export class StripeWebhookSimulator implements WebhookSimulator {
  constructor(
    private baseUrl: string,
    private signingKey: string = 'whsec_test_signing_key'
  ) {}

  /**
   * Send a simulated Stripe webhook event
   * 
   * @param eventType - Type of Stripe event
   * @param eventData - Event data to include in the payload
   * @returns Response from the webhook endpoint
   */
  async sendEvent(
    eventType: StripeEventType,
    eventData: Record<string, any> = {}
  ): Promise<Response> {
    // Create payload based on event type
    const payload = this.createPayload(eventType, eventData);
    
    // Convert payload to string
    const payloadString = JSON.stringify(payload);
    
    // Generate signature with timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.generateSignatureWithTimestamp(payloadString, timestamp);
    
    // Format signature string like Stripe does
    const signatureHeader = `t=${timestamp},v1=${signature}`;
    
    // Send the webhook request
    return await fetch(`${this.baseUrl}/api/webhooks/stripe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signatureHeader
      },
      body: payloadString
    });
  }

  /**
   * Generate HMAC signature for Stripe webhook
   */
  generateSignature(payload: string): string {
    return crypto
      .createHmac('sha256', this.signingKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Generate Stripe signature with timestamp
   */
  generateSignatureWithTimestamp(payload: string, timestamp: number): string {
    // Stripe uses a specific signature scheme: timestamp.payload
    const signPayload = `${timestamp}.${payload}`;
    return this.generateSignature(signPayload);
  }

  /**
   * Create standardized Stripe webhook payload
   */
  private createPayload(
    eventType: StripeEventType,
    customData: Record<string, any> = {}
  ): StripeEventData {
    // Default event ID
    const eventId = `evt_test_${Date.now()}`;
    
    // Base event structure
    const baseEvent: StripeEventData = {
      id: eventId,
      object: 'event',
      api_version: '2020-08-27',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          object: 'checkout.session',
          ...customData
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: null,
        idempotency_key: null
      },
      type: eventType
    };
    
    // Create event-specific payload
    switch (eventType) {
      case 'checkout.session.completed':
        return this.createCheckoutSessionCompletedEvent(baseEvent, customData);
        
      case 'payment_intent.succeeded':
        return this.createPaymentIntentSucceededEvent(baseEvent, customData);
        
      case 'payment_intent.payment_failed':
        return this.createPaymentIntentFailedEvent(baseEvent, customData);
        
      default:
        // For other event types, just return the base event
        return baseEvent;
    }
  }

  /**
   * Create a checkout.session.completed event
   */
  private createCheckoutSessionCompletedEvent(
    baseEvent: StripeEventData,
    customData: Record<string, any>
  ): StripeEventData {
    // Get the booking ID from custom data or generate one
    const bookingId = customData.bookingId || `booking_test_${Date.now()}`;
    
    // Create checkout session data
    const checkoutSession = {
      id: `cs_test_${Date.now()}`,
      object: 'checkout.session',
      after_expiration: null,
      allow_promotion_codes: null,
      amount_subtotal: 10000,
      amount_total: 10000,
      automatic_tax: { enabled: false, status: null },
      billing_address_collection: null,
      cancel_url: `${this.baseUrl}/booking/recovery?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: bookingId,
      consent: null,
      consent_collection: null,
      currency: 'usd',
      customer: `cus_test_${Date.now()}`,
      customer_creation: 'always',
      customer_details: {
        address: {
          city: null,
          country: 'US',
          line1: null,
          line2: null,
          postal_code: '10001',
          state: null
        },
        email: 'test@example.com',
        name: 'Test User',
        phone: null,
        tax_exempt: 'none',
        tax_ids: []
      },
      customer_email: 'test@example.com',
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      livemode: false,
      locale: null,
      metadata: {
        bookingId: bookingId,
        sessionType: 'initial-consultation',
        builderId: `builder_test_${Date.now()}`
      },
      mode: 'payment',
      payment_intent: `pi_test_${Date.now()}`,
      payment_link: null,
      payment_method_options: {},
      payment_method_types: ['card'],
      payment_status: 'paid',
      phone_number_collection: {
        enabled: false
      },
      recovered_from: null,
      setup_intent: null,
      shipping_address_collection: null,
      shipping_cost: null,
      shipping_details: null,
      shipping_options: [],
      status: 'complete',
      submit_type: null,
      subscription: null,
      success_url: `${this.baseUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}&status=success`,
      total_details: {
        amount_discount: 0,
        amount_shipping: 0,
        amount_tax: 0
      },
      url: null
    };
    
    // Merge with any custom data provided
    if (customData) {
      Object.assign(checkoutSession, customData);
    }
    
    // Update the base event with the checkout session data
    if (baseEvent.data) {
      baseEvent.data.object = checkoutSession;
    }
    
    return baseEvent;
  }

  /**
   * Create a payment_intent.succeeded event
   */
  private createPaymentIntentSucceededEvent(
    baseEvent: StripeEventData,
    customData: Record<string, any>
  ): StripeEventData {
    // Payment intent data
    const paymentIntent = {
      id: `pi_test_${Date.now()}`,
      object: 'payment_intent',
      amount: 10000,
      amount_capturable: 0,
      amount_received: 10000,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      client_secret: `pi_test_secret_${Date.now()}`,
      confirmation_method: 'automatic',
      created: Math.floor(Date.now() / 1000) - 300,
      currency: 'usd',
      customer: `cus_test_${Date.now()}`,
      description: 'Booking payment',
      invoice: null,
      last_payment_error: null,
      latest_charge: `ch_test_${Date.now()}`,
      livemode: false,
      metadata: {
        bookingId: customData.bookingId || `booking_test_${Date.now()}`
      },
      next_action: null,
      on_behalf_of: null,
      payment_method: `pm_test_${Date.now()}`,
      payment_method_options: {
        card: {
          installments: null,
          mandate_options: null,
          network: null,
          request_three_d_secure: 'automatic'
        }
      },
      payment_method_types: ['card'],
      processing: null,
      receipt_email: 'test@example.com',
      review: null,
      setup_future_usage: null,
      shipping: null,
      source: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'succeeded',
      transfer_data: null,
      transfer_group: null
    };
    
    // Merge with any custom data provided
    if (customData) {
      Object.assign(paymentIntent, customData);
    }
    
    // Update the base event
    baseEvent.type = 'payment_intent.succeeded';
    if (baseEvent.data) {
      baseEvent.data.object = paymentIntent;
    }
    
    return baseEvent;
  }

  /**
   * Create a payment_intent.payment_failed event
   */
  private createPaymentIntentFailedEvent(
    baseEvent: StripeEventData,
    customData: Record<string, any>
  ): StripeEventData {
    // Payment intent data for failure
    const paymentIntent = {
      id: `pi_test_${Date.now()}`,
      object: 'payment_intent',
      amount: 10000,
      amount_capturable: 0,
      amount_received: 0,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: 'automatic',
      client_secret: `pi_test_secret_${Date.now()}`,
      confirmation_method: 'automatic',
      created: Math.floor(Date.now() / 1000) - 300,
      currency: 'usd',
      customer: `cus_test_${Date.now()}`,
      description: 'Booking payment',
      invoice: null,
      last_payment_error: {
        charge: null,
        code: 'card_declined',
        decline_code: 'generic_decline',
        doc_url: 'https://stripe.com/docs/error-codes/card-declined',
        message: 'Your card was declined.',
        payment_method: {
          id: `pm_test_${Date.now()}`,
          object: 'payment_method',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '0341'
          }
        },
        type: 'card_error'
      },
      latest_charge: null,
      livemode: false,
      metadata: {
        bookingId: customData.bookingId || `booking_test_${Date.now()}`
      },
      next_action: null,
      on_behalf_of: null,
      payment_method: `pm_test_${Date.now()}`,
      payment_method_options: {
        card: {
          installments: null,
          mandate_options: null,
          network: null,
          request_three_d_secure: 'automatic'
        }
      },
      payment_method_types: ['card'],
      processing: null,
      receipt_email: 'test@example.com',
      review: null,
      setup_future_usage: null,
      shipping: null,
      source: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'requires_payment_method',
      transfer_data: null,
      transfer_group: null
    };
    
    // Merge with any custom data provided
    if (customData) {
      Object.assign(paymentIntent, customData);
    }
    
    // Update the base event
    baseEvent.type = 'payment_intent.payment_failed';
    if (baseEvent.data) {
      baseEvent.data.object = paymentIntent;
    }
    
    return baseEvent;
  }
}

/**
 * Helper function to create webhook simulators with test configuration
 */
export function createWebhookSimulators(baseUrl: string = 'http://localhost:3000') {
  // Get webhook signing keys from env or use test defaults
  const calendlySigningKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY || 'test-calendly-signing-key';
  const stripeSigningKey = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_stripe_signing_key';
  
  return {
    calendly: new CalendlyWebhookSimulator(baseUrl, calendlySigningKey),
    stripe: new StripeWebhookSimulator(baseUrl, stripeSigningKey)
  };
}

/**
 * Usage example:
 * 
 * ```typescript
 * const { calendly, stripe } = createWebhookSimulators();
 * 
 * // Simulate Calendly booking creation
 * await calendly.sendEvent('invitee.created', {
 *   event: { uuid: 'evt-123' },
 *   tracking: { utm_content: 'booking-456' }
 * });
 * 
 * // Simulate Stripe payment completion
 * await stripe.sendEvent('checkout.session.completed', {
 *   bookingId: 'booking-456',
 *   payment_status: 'paid'
 * });
 * ```
 */