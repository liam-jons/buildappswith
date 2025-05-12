# Calendly Integration with Booking-to-Payment Flow

*Version: 1.0.0*

This document outlines the architecture and implementation plan for integrating Calendly with the BuildAppsWith booking and payment system.

## Overview

The integration leverages Calendly's robust scheduling infrastructure while connecting it to our existing Stripe payment processing. This approach provides immediate availability management while creating a seamless end-to-end booking-to-payment flow.

## End-to-End Flow: Calendly Event Selection to Payment Confirmation

### 1. Session Type Selection Flow

```
┌───────────────┐     ┌───────────────────┐     ┌────────────────┐
│ Builder       │     │ BuildAppsWith     │     │ Calendly API   │
│ Profile Page  │────►│ Session Type List │────►│ Event Types    │
└───────────────┘     └───────────────────┘     └────────────────┘
```

#### Implementation Details:
1. When a client visits a builder's profile page (`/profile/[builderId]`), the system displays available session types
2. Session types are fetched from Calendly via the API using the builder's Calendly integration
3. The UI displays each session type with name, duration, price, and description
4. Session types are enriched with Stripe pricing information from our database

### 2. Booking Initiation Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ Session Type  │     │ Booking Pre-check   │     │ Database            │
│ Selection     │────►│ (Auth/Availability) │────►│ (Create Pending     │
└───────────────┘     └─────────────────────┘     │  Booking Record)    │
                                                  └──────────┬──────────┘
                                                            │
┌───────────────┐     ┌─────────────────────┐              │
│ Calendly      │◄────│ BuildAppsWith       │◄─────────────┘
│ Scheduling UI │     │ Booking Handler     │
└───────────────┘     └─────────────────────┘
```

#### Implementation Details:
1. Client selects a session type and clicks "Book Now"
2. System checks authentication status (redirects to login if needed) 
3. Creates a preliminary booking record with status "PENDING_SCHEDULING"
4. System generates a Calendly scheduling link with booking metadata embedded
5. Client is redirected to Calendly's scheduling interface
6. Metadata includes: bookingId, builderId, clientId, sessionTypeId

### 3. Calendly Scheduling Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ Calendly      │     │ Time Slot           │     │ Client Contact      │
│ Scheduling UI │────►│ Selection           │────►│ Information         │
└───────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                            │
┌───────────────┐     ┌─────────────────────┐              │
│ Calendly      │◄────│ Booking Creation    │◄─────────────┘
│ Confirmation  │     │ (internal to        │
└───┬───────────┘     │  Calendly)          │
    │                 └─────────────────────┘
    │
    ▼
┌───────────────┐
│ Redirect to   │
│ Payment       │
└───────────────┘
```

#### Implementation Details:
1. Client selects a date and time slot in Calendly's interface
2. Client provides contact information (pre-filled if available)
3. Client confirms booking in Calendly
4. Calendly creates the event in their system
5. Client is redirected to our payment page via the redirect URL configured in our integration

### 4. Webhook Processing Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ Calendly      │     │ BuildAppsWith       │     │ Signature           │
│ Event Created │────►│ Webhook Endpoint    │────►│ Verification        │
└───────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                            │
┌───────────────┐     ┌─────────────────────┐              │
│ Update Booking│◄────│ Event Type          │◄─────────────┘
│ Status        │     │ Identification      │
└───┬───────────┘     └─────────────────────┘
    │
    ▼
┌───────────────┐
│ Trigger       │
│ Payment Flow  │
└───────────────┘
```

#### Implementation Details:
1. When booking is created in Calendly, a webhook is triggered to our system
2. Our webhook endpoint verifies the signature using the webhook secret
3. System extracts booking details and metadata (especially bookingId)
4. Updates the booking record with Calendly-specific details (eventId, inviteeId, scheduled time)
5. Changes booking status to "PENDING_PAYMENT"
6. Webhook handler initiates the payment flow for the booking

### 5. Payment Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ Booking       │     │ Stripe Checkout     │     │ Payment             │
│ Confirmation  │────►│ Session Creation    │────►│ Processing          │
└───────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                            │
┌───────────────┐     ┌─────────────────────┐              │
│ Payment       │◄────│ Client Redirect     │◄─────────────┘
│ UI (Stripe)   │     │ to Payment          │
└───┬───────────┘     └─────────────────────┘
    │
    ▼
┌───────────────┐
│ Success/Cancel│
│ Redirect      │
└───────────────┘
```

#### Implementation Details:
1. Upon successful Calendly booking, client is redirected to our payment flow
2. System creates a Stripe checkout session with the following data:
   - Amount based on session type price
   - Description including session type and scheduled time
   - Metadata with bookingId, calendlyEventId
   - Success and cancel URLs for post-payment handling
3. Client completes payment on Stripe's hosted checkout page
4. Stripe redirects client back to our success page with session ID

### 6. Payment Confirmation Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ Stripe        │     │ BuildAppsWith       │     │ Signature           │
│ Payment Event │────►│ Stripe Webhook      │────►│ Verification        │
└───────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                            │
┌───────────────┐     ┌─────────────────────┐              │
│ Update Booking│◄────│ Payment Status      │◄─────────────┘
│ Status        │     │ Processing          │
└───┬───────────┘     └─────────────────────┘
    │
    ▼
┌───────────────┐
│ Send          │
│ Confirmation  │
└───────────────┘
```

#### Implementation Details:
1. When payment is completed, Stripe sends a webhook event to our system
2. Our Stripe webhook handler verifies the signature
3. System extracts the payment details and booking metadata
4. Updates the booking status to "CONFIRMED" if payment successful
5. Booking record is updated with payment details (Stripe payment ID, amount, status)
6. System triggers any post-booking actions (notifications, calendar invites, etc.)

### 7. Cancellation/Refund Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ Calendly      │     │ BuildAppsWith       │     │ Signature           │
│ Cancellation  │────►│ Webhook Endpoint    │────►│ Verification        │
└───────────────┘     └─────────────────────┘     └──────────┬──────────┘
                                                            │
┌───────────────┐     ┌─────────────────────┐              │
│ Process       │◄────│ Check Payment       │◄─────────────┘
│ Refund        │     │ Status              │
└───┬───────────┘     └─────────────────────┘
    │
    ▼
┌───────────────┐
│ Update Booking│
│ Status        │
└───────────────┘
```

#### Implementation Details:
1. When a booking is canceled in Calendly, a webhook is sent to our system
2. Our webhook handler verifies the signature and processes the cancellation
3. System checks if payment was made for the booking
4. If paid, initiates a refund through Stripe (full or partial based on cancellation policy)
5. Updates booking status to "CANCELED" with cancellation reason
6. Records refund details in the booking record

### 8. Complete Flow Diagram

```
┌───────────────┐
│ Client visits │
│ builder       │
│ profile       │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ View available│
│ session types │
│ from Calendly │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Select session│
│ type and      │
│ click Book    │
└───────┬───────┘
        │
        ▼
┌───────────────┐     ┌─────────────────────┐
│ Create pending│     │ Generate Calendly   │
│ booking record│────►│ scheduling link     │
└───────┬───────┘     └─────────┬───────────┘
        │                       │
        │                       │
        ▼                       ▼
┌───────────────┐     ┌─────────────────────┐
│ Redirect to   │     │ Client selects      │
│ Calendly UI   │────►│ time slot           │
└───────────────┘     └─────────┬───────────┘
                               │
                               │
                               ▼
┌───────────────┐     ┌─────────────────────┐
│ Calendly      │     │ Webhook updates     │
│ creates event │────►│ booking record      │
└───────┬───────┘     └─────────┬───────────┘
        │                       │
        │                       │
        ▼                       ▼
┌───────────────┐     ┌─────────────────────┐
│ Redirect to   │     │ Create Stripe       │
│ payment page  │────►│ checkout session    │
└───────────────┘     └─────────┬───────────┘
                               │
                               │
                               ▼
┌───────────────┐     ┌─────────────────────┐
│ Client        │     │ Stripe webhook      │
│ completes     │────►│ confirms payment    │
│ payment       │     └─────────┬───────────┘
└───────────────┘               │
                               │
                               ▼
                      ┌─────────────────────┐
                      │ Booking confirmed   │
                      │ Send notifications  │
                      └─────────────────────┘
```

## API Contracts

### Core API Endpoints

#### Event Types Retrieval
```typescript
// GET /api/scheduling/calendly/event-types
interface EventTypesResponse {
  data: CalendlyEventType[];
  pagination?: {
    next_page: string;
    previous_page: string;
  }
}

interface CalendlyEventType {
  id: string;
  uri: string;
  name: string;
  description: string | null;
  duration: number; // minutes
  slug: string;
  color: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    name: string;
    type: string;
  };
  scheduling_url: string;
  price?: number; // Our custom extension
}
```

#### Scheduling Link Generation
```typescript
// POST /api/scheduling/calendly/scheduling-link
interface SchedulingLinkRequest {
  eventTypeId: string;
  inviteeEmail: string;
  inviteeName: string;
  customQuestions?: {
    name: string;
    value: string;
  }[];
  metadata?: Record<string, string>; // For Stripe integration
}

interface SchedulingLinkResponse {
  schedulingUrl: string;
  bookingId?: string; // Our reference ID
}
```

#### Webhook Handler
```typescript
// POST /api/webhooks/calendly
interface WebhookPayload {
  event: string; // "invitee.created" | "invitee.canceled" | "invitee.rescheduled"
  payload: {
    event_type: CalendlyEventType;
    invitee: {
      email: string;
      name: string;
      uuid: string;
      // Other invitee details
    };
    event: {
      uuid: string;
      start_time: string;
      end_time: string;
      location: {
        type: string;
        // Location details
      };
      canceled: boolean;
      cancellation?: {
        reason: string;
      };
      // Other event details
    };
    questions_and_answers: {
      question: string;
      answer: string;
    }[];
    tracking: {
      utm_source?: string;
      utm_medium?: string;
      utm_campaign?: string;
      utm_content?: string;
      utm_term?: string;
      salesforce_uuid?: string;
    };
    text_reminder_number?: string;
    old_invitee?: object; // For rescheduled events
    old_event?: object; // For rescheduled events
    reschedule_url?: string;
    cancel_url?: string;
    payment?: {
      external_id?: string; // Stripe payment ID
      status?: string;
    };
  };
}
```

## Integration with Existing Stripe Implementation

```typescript
// This integrates with your existing lib/stripe/stripe-server.ts
// and follows the payment flow described in PAYMENT_PROCESSING.md

interface CalendlyStripeIntegrationService {
  createCheckoutSessionForCalendlyBooking(
    bookingId: string,
    sessionTypeId: string,
    clientId: string, 
    options: {
      successUrl: string;
      cancelUrl: string;
      metadata?: Record<string, string>;
    }
  ): Promise<{
    sessionId: string;
    url: string;
  }>;
  
  // Hook into existing webhook flow for checkout.session.completed
}
```

## Related Documentation

- [Booking System Architecture](./BOOKING_SYSTEM.md)
- [Payment Processing](./PAYMENT_PROCESSING.md)
- [Calendly Stripe Integration](./CALENDLY_STRIPE_INTEGRATION.md)