# Calendly-Stripe Integration: API Contract

This document defines the API contract for the Calendly-to-Stripe integration, specifying the endpoints, request/response formats, and data flow between components.

## 1. API Endpoints

### 1.1 Booking Flow Endpoints

#### `POST /api/scheduling/calendly/initiate-booking`

Initiates the booking flow for a specific session type.

**Request Body:**
```json
{
  "sessionTypeId": "string",
  "clientId": "string",
  "builderProfileId": "string",
  "utmParams": {
    "source": "string",
    "medium": "string",
    "campaign": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "bookingFlowId": "string",
  "calendlyUrl": "string",
  "sessionType": {
    "id": "string",
    "name": "string",
    "description": "string",
    "duration": "number",
    "price": "number",
    "currency": "string"
  },
  "expiresAt": "ISO8601 string"
}
```

#### `POST /api/scheduling/calendly/store-event`

Stores a Calendly event after client-side scheduling.

**Request Body:**
```json
{
  "bookingFlowId": "string",
  "calendlyEventUri": "string",
  "calendlyInviteeUri": "string",
  "scheduledTime": "ISO8601 string",
  "clientInfo": {
    "name": "string",
    "email": "string",
    "phoneNumber": "string",
    "notes": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "string",
  "nextAction": "AWAIT_WEBHOOK | REDIRECT_TO_PAYMENT",
  "paymentUrl": "string",
  "expiresAt": "ISO8601 string"
}
```

#### `GET /api/scheduling/calendly/booking-status/:bookingId`

Retrieves the current status of a booking.

**Response:**
```json
{
  "success": true,
  "bookingId": "string",
  "status": "PENDING | CONFIRMED | CANCELLED | RESCHEDULED",
  "paymentStatus": "UNPAID | PENDING | PAID | FAILED | REFUNDED",
  "calendlyStatus": "ACTIVE | CANCELLED",
  "scheduledTime": "ISO8601 string",
  "sessionType": {
    "id": "string",
    "name": "string",
    "description": "string",
    "duration": "number",
    "price": "number",
    "currency": "string"
  },
  "lastUpdated": "ISO8601 string"
}
```

#### `POST /api/stripe/create-checkout-session`

Creates a Stripe checkout session for a Calendly booking.

**Request Body:**
```json
{
  "bookingId": "string",
  "returnUrl": "string",
  "cancelUrl": "string"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "string",
  "url": "string",
  "expiresAt": "ISO8601 string"
}
```

#### `GET /api/stripe/session-status/:sessionId`

Retrieves the status of a Stripe checkout session.

**Response:**
```json
{
  "success": true,
  "sessionId": "string",
  "status": "OPEN | COMPLETE | EXPIRED",
  "paymentStatus": "UNPAID | PAID | FAILED",
  "paymentIntentId": "string",
  "receiptUrl": "string"
}
```

#### `POST /api/scheduling/cancel-booking`

Cancels a booking and initiates refund if applicable.

**Request Body:**
```json
{
  "bookingId": "string",
  "reason": "string",
  "refundRequested": "boolean"
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "string",
  "status": "CANCELLATION_PENDING | CANCELLED",
  "refundStatus": "NOT_APPLICABLE | PENDING | COMPLETED",
  "refundId": "string"
}
```

### 1.2 Webhook Endpoints

#### `POST /api/webhooks/calendly`

Receives webhooks from Calendly.

**Request Headers:**
```
Calendly-Webhook-Signature: t=timestamp,v1=signature
```

**Request Body:**
```json
{
  "payload": {
    "event": "string",
    "uri": "string",
    "created_at": "ISO8601 string",
    "data": {
      "event": "object",
      "invitee": "object",
      "tracking": {
        "utm_source": "string",
        "utm_medium": "string",
        "utm_campaign": "string",
        "utm_content": "string",
        "utm_term": "string",
        "booking_flow_id": "string"
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received"
}
```

#### `POST /api/webhooks/stripe`

Receives webhooks from Stripe.

**Request Headers:**
```
Stripe-Signature: t=timestamp,v1=signature,v0=signature
```

**Request Body:**
```json
{
  "id": "string",
  "type": "string",
  "data": {
    "object": "object"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received"
}
```

## 2. Data Flow

### 2.1 Booking Creation Flow

1. Client calls `POST /api/scheduling/calendly/initiate-booking` to start the flow
2. Client embeds Calendly scheduler and completes booking
3. Client calls `POST /api/scheduling/calendly/store-event` to record the booking
4. Calendly sends webhook to `/api/webhooks/calendly` when booking is confirmed
5. System creates or updates booking record based on webhook data
6. System calls `POST /api/stripe/create-checkout-session` internally
7. Client is redirected to Stripe Checkout
8. After payment, Stripe sends webhook to `/api/webhooks/stripe`
9. System updates booking status based on payment result
10. Client calls `GET /api/scheduling/calendly/booking-status/:bookingId` to get final status

### 2.2 Cancellation Flow

1. Client calls `POST /api/scheduling/cancel-booking` to request cancellation
2. System cancels booking in Calendly via API
3. If paid, system initiates refund in Stripe
4. Webhooks from both systems confirm cancellation
5. System updates booking status to CANCELLED

### 2.3 Rescheduling Flow

1. Client reschedules via Calendly directly
2. Calendly sends cancelation webhook with rescheduled=true
3. Calendly sends new booking creation webhook
4. System links the bookings and maintains payment information

## 3. Data Schemas

### 3.1 Booking Schema

```typescript
interface Booking {
  id: string;
  clientId: string;
  builderProfileId: string;
  sessionTypeId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  scheduledTime: string; // ISO8601
  duration: number; // minutes
  price: number;
  currency: string;
  calendlyEventId: string;
  calendlyEventUri: string;
  calendlyInviteeUri: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;
  cancelReason?: string;
  cancelledAt?: string; // ISO8601
  cancelledBy?: string;
  refundAmount?: number;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  COMPLETED = 'COMPLETED'
}

enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}
```

### 3.2 Calendly Event Webhook Payload

```typescript
interface CalendlyWebhookPayload {
  event: string; // 'invitee.created' | 'invitee.canceled'
  payload: {
    event: string;
    uri: string;
    created_at: string;
    data: {
      event: {
        uri: string;
        name: string;
        start_time: string;
        end_time: string;
        location: {
          type: string;
          location: string;
        };
        canceled: boolean;
        canceler_name?: string;
        cancel_reason?: string;
        cancellation_url?: string;
      };
      invitee: {
        uri: string;
        email: string;
        name: string;
        timezone: string;
        canceled: boolean;
        cancellation?: {
          canceled_by: string;
          reason: string;
          rescheduled: boolean;
        };
        text_reminder_number?: string;
        rescheduled: boolean;
        old_invitee?: string;
        new_invitee?: string;
        questions_and_answers: Array<{
          question: string;
          answer: string;
        }>;
        tracking: {
          utm_source?: string;
          utm_medium?: string;
          utm_campaign?: string;
          utm_content?: string;
          utm_term?: string;
          booking_flow_id?: string;
        };
      };
    };
  };
}
```

### 3.3 Stripe Webhook Payload

```typescript
interface StripeWebhookPayload {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: {
      id: string;
      object: string;
      // Different properties based on event type
      // For checkout.session.completed:
      customer: string;
      payment_intent: string;
      payment_status: string;
      amount_total: number;
      currency: string;
      client_reference_id: string; // bookingId
      metadata: {
        bookingId: string;
        calendlyEventUri: string;
      };
    };
  };
  type: string; // 'checkout.session.completed' | 'charge.refunded' etc.
  livemode: boolean;
}
```

## 4. Error Handling

### 4.1 Error Response Format

All API errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### 4.2 Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `BOOKING_NOT_FOUND` | Booking ID not found |
| `CALENDLY_API_ERROR` | Error communicating with Calendly API |
| `STRIPE_API_ERROR` | Error communicating with Stripe API |
| `WEBHOOK_VERIFICATION_FAILED` | Webhook signature verification failed |
| `SESSION_EXPIRED` | Checkout session expired |
| `PAYMENT_FAILED` | Payment processing failed |
| `REFUND_FAILED` | Refund processing failed |
| `BOOKING_CONFLICT` | Conflict with existing booking |
| `INTERNAL_ERROR` | Unexpected server error |

## 5. Security Considerations

### 5.1 Authentication Requirements

- All client-facing APIs require authenticated user
- Session-specific endpoints verify session ownership
- Webhook endpoints verify signatures but don't require authentication

### 5.2 Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| All client endpoints | 60 requests/minute |
| Booking status endpoint | 120 requests/minute |
| Webhook endpoints | 1000 requests/minute |

### 5.3 Webhook Security

- All webhooks verify signatures using HMAC-SHA256
- Webhooks enforce replay protection through timestamp validation
- IP allowlisting for webhook sources in production

## 6. Idempotency

- All state-changing endpoints support idempotency keys
- Idempotency key format: `"idempotency-key": "UUID"`
- Idempotency keys valid for 24 hours

## 7. Retry Policies

| Operation | Retry Strategy | Max Attempts | Backoff |
|-----------|----------------|--------------|---------|
| Calendly API calls | Exponential | 3 | 2^n * 100ms |
| Stripe API calls | Exponential | 5 | 2^n * 200ms |
| Webhook deliveries | Exponential | 5 | 2^n * 500ms |

## 8. Monitoring Integration Points

| Integration Point | Metrics |
|-------------------|---------|
| Calendly webhooks | Received count, processing time, error rate |
| Stripe webhooks | Received count, processing time, error rate |
| Booking creation | Success rate, time to confirmation |
| Payment processing | Success rate, time to payment |
| Cancellations/Refunds | Count, time to process |