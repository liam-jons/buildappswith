/**
 * Stripe payment types
 * Version: 1.0.0
 * 
 * TypeScript type definitions for payment
 */

// Stripe webhook event types
export enum StripeWebhookEventType {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
  PAYMENT_INTENT_SUCCEEDED = 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED = 'payment_intent.payment_failed',
}

// Stripe checkout session status
export enum CheckoutSessionStatus {
  OPEN = 'open',
  COMPLETE = 'complete',
  EXPIRED = 'expired',
}

// Stripe payment status
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  NO_PAYMENT_REQUIRED = 'no_payment_required',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Metadata for Stripe checkout sessions
export interface StripeCheckoutMetadata {
  bookingId: string;
  builderId: string;
  clientId: string;
  sessionTypeId: string;
  startTime?: string;
  endTime?: string;
  timeZone?: string;
  // Calendly specific metadata
  calendlyEventId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  isCalendlyBooking?: string; // 'true' or 'false' as a string
}

// Request for creating a checkout session
export interface CheckoutSessionRequest {
  bookingData: {
    id?: string;
    builderId: string;
    sessionTypeId: string;
    startTime: string;
    endTime: string;
    clientId?: string;
    clientTimezone?: string;
    // Calendly fields
    calendlyEventId?: string;
    calendlyEventUri?: string;
    calendlyInviteeUri?: string;
  };
  returnUrl: string;
}

// Response from creating a checkout session
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Request for checking payment status
export interface PaymentStatusRequest {
  sessionId: string;
  bookingId?: string;
}

// Response for payment status
export interface PaymentStatusResponse {
  status: string;
  paymentStatus: string;
  bookingId?: string;
  metadata?: Record<string, string>;
  calendlyEventId?: string;
  isCalendlyBooking?: boolean;
}

// Request for handling webhook events
export interface WebhookEventRequest {
  event: any;
  signature: string;
}

// Response for webhook events
export interface WebhookEventResponse {
  received: boolean;
  handled: boolean;
  type: string;
}