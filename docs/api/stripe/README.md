# Stripe API Documentation

*Version: 1.0.139*

This document provides comprehensive documentation for the Stripe-related API endpoints in the Buildappswith platform.

## Overview

The Stripe API routes handle all payment-related functionality, including checkout session creation, session status retrieval, and webhook event processing. These endpoints integrate with our Stripe server utilities to provide a secure and consistent payment experience.

## Authentication

All Stripe API endpoints (except for webhooks) require authentication using Clerk. The user must be signed in and have appropriate permissions to access these endpoints.

## Base URL

All Stripe API requests are relative to:

```
/api/stripe
```

## Common Types

```typescript
// Common response structure
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: string;
    detail: string;
  };
}

// Stripe error classification
enum StripeErrorType {
  AUTHENTICATION = 'authentication_error',
  API = 'api_error',
  CARD = 'card_error',
  IDEMPOTENCY = 'idempotency_error',
  INVALID_REQUEST = 'invalid_request_error',
  RATE_LIMIT = 'rate_limit_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}
```

## Endpoints

### Create Checkout Session

Creates a Stripe checkout session for a booking.

**URL**: `/api/stripe/checkout`  
**Method**: `POST`  
**Authentication Required**: Yes  
**Authorization**: User must be the client in the booking  

#### Request Body

```typescript
{
  bookingData: {
    id?: string;            // Optional if booking already created
    sessionTypeId: string;  // Required - the type of session being booked
    builderId: string;      // Required - the builder ID
    clientId: string;       // Required - must match authenticated user
    startTime: string;      // Required - ISO datetime string
    endTime: string;        // Required - ISO datetime string
    timeZone?: string;      // Optional - defaults to 'UTC'
  },
  returnUrl: string;        // Required - base URL for success/cancel redirects
}
```

#### Success Response

**Code**: `200 OK`

```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "detail": "You must be signed in to create a checkout session"
  }
}
```

**Bad Request** (400)
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": {
    "type": "VALIDATION_ERROR",
    "detail": "Both bookingData and returnUrl are required"
  }
}
```

**Forbidden** (403)
```json
{
  "success": false,
  "message": "Not authorized",
  "error": {
    "type": "AUTHORIZATION_ERROR",
    "detail": "You cannot create a checkout session for another user"
  }
}
```

**Not Found** (404)
```json
{
  "success": false,
  "message": "Session type not found",
  "error": {
    "type": "RESOURCE_ERROR",
    "detail": "No session type found with ID: abc123"
  }
}
```

**Internal Server Error** (500)
```json
{
  "success": false,
  "message": "Error creating checkout session",
  "error": {
    "type": "INTERNAL_ERROR",
    "detail": "An unexpected error occurred while processing your request"
  }
}
```

#### Example Request

```bash
curl -X POST https://buildappswith.dev/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -d '{
    "bookingData": {
      "id": "booking_123456",
      "sessionTypeId": "session_type_123",
      "builderId": "builder_456",
      "clientId": "client_789",
      "startTime": "2025-05-15T14:00:00Z",
      "endTime": "2025-05-15T15:00:00Z",
      "timeZone": "Europe/London"
    },
    "returnUrl": "https://buildappswith.dev/booking/confirmation"
  }'
```

#### Notes

- The checkout session URL (`url` in the response) is where the user should be redirected to complete payment
- The `sessionId` can be used to retrieve session status later
- Include an `Idempotency-Key` header to prevent duplicate charges if the request is retried

---

### Get Checkout Session

Retrieves a Stripe checkout session by ID, including associated booking details.

**URL**: `/api/stripe/sessions/:id`  
**Method**: `GET`  
**Authentication Required**: Yes  
**Authorization**: User must be the client, builder, or admin associated with the booking  

#### URL Parameters

- `id`: The Stripe checkout session ID

#### Success Response

**Code**: `200 OK`

```json
{
  "success": true,
  "message": "Session retrieved successfully",
  "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "status": "complete",
  "customerEmail": "client@example.com",
  "paymentStatus": "paid",
  "paymentAmount": 15000,
  "currency": "usd",
  "booking": {
    "id": "booking_123456",
    "sessionType": "One-on-One Consultation",
    "startTime": "2025-05-15T14:00:00Z",
    "endTime": "2025-05-15T15:00:00Z",
    "builderId": "builder_456",
    "clientId": "client_789",
    "status": "confirmed"
  }
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "detail": "You must be signed in to view session details"
  }
}
```

**Bad Request** (400)
```json
{
  "success": false,
  "message": "Session ID is required",
  "error": {
    "type": "VALIDATION_ERROR",
    "detail": "No session ID provided in URL"
  }
}
```

**Forbidden** (403)
```json
{
  "success": false,
  "message": "Not authorized",
  "error": {
    "type": "AUTHORIZATION_ERROR",
    "detail": "You are not authorized to view this booking"
  }
}
```

**Not Found** (404)
```json
{
  "success": false,
  "message": "Session not found",
  "error": {
    "type": "INVALID_REQUEST_ERROR",
    "detail": "No such checkout session: 'cs_test_invalid'"
  }
}
```

#### Example Request

```bash
curl https://buildappswith.dev/api/stripe/sessions/cs_test_a1b2c3d4e5f6g7h8i9j0 \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

#### Notes

- If the associated booking is not found in the database, the endpoint will return metadata from the session
- The booking status might not always match the payment status if they were updated separately
- This endpoint is useful for confirming payment completion after Stripe checkout redirect

---

### Stripe Webhook

Processes webhook events from Stripe, such as payment confirmations and failures.

**URL**: `/api/stripe/webhook`  
**Method**: `POST`  
**Authentication Required**: No (uses Stripe signature verification instead)  

#### Request Headers

- `stripe-signature`: Signature provided by Stripe to verify the event

#### Request Body

Raw body content as sent by Stripe (not parsed JSON)

#### Success Response

**Code**: `200 OK`

```json
{
  "success": true,
  "message": "Processed webhook event: checkout.session.completed",
  "received": true
}
```

#### Error Responses

**Bad Request** (400)
```json
{
  "success": false,
  "message": "Missing signature or webhook secret",
  "error": {
    "type": "VALIDATION_ERROR",
    "detail": "Both stripe-signature header and webhook secret are required"
  }
}
```

**Bad Request - Invalid Signature** (400)
```json
{
  "success": false,
  "message": "Webhook signature verification failed",
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "detail": "Could not verify webhook signature"
  }
}
```

**Error handled but returning 200** (200)
```json
{
  "success": false,
  "message": "Error processing webhook event",
  "error": {
    "type": "INTERNAL_ERROR",
    "detail": "Failed to update booking status"
  },
  "received": true
}
```

#### Notes

- Even on error, the webhook endpoint returns a 200 status to prevent Stripe from retrying
- The `received: true` field indicates that the webhook was received, even if processing failed
- The webhook processes multiple event types, with the most important being:
  - `checkout.session.completed`: Payment succeeded
  - `checkout.session.expired`: Session expired without payment
  - `payment_intent.payment_failed`: Payment attempt failed

#### Supported Event Types

| Event Type | Action Taken |
|------------|--------------|
| `checkout.session.completed` | Updates booking status to "confirmed" and payment status to "paid" |
| `checkout.session.expired` | Updates booking payment status to "failed" |
| `payment_intent.succeeded` | Logs the successful payment |
| `payment_intent.payment_failed` | Updates booking payment status to "failed" and logs failure reason |

#### Security Considerations

- Webhook signatures must be verified to prevent unauthorized calls
- The webhook secret must be securely stored in environment variables
- Events are idempotent - processing the same event multiple times will not cause duplicate actions

## Error Handling

The Stripe API implements consistent error handling with these types:

| Error Type | Description | HTTP Status Code |
|------------|-------------|------------------|
| `AUTHENTICATION_ERROR` | Stripe API key issues or webhook signature failures | 401 |
| `API_ERROR` | Stripe API is unavailable or returned an error | 500 |
| `CARD_ERROR` | Issues with the payment method | 400 |
| `IDEMPOTENCY_ERROR` | Request conflicts with a previous request | 400 |
| `INVALID_REQUEST_ERROR` | Invalid parameters sent to Stripe | 400 |
| `RATE_LIMIT_ERROR` | Too many requests hit the Stripe API too quickly | 429 |
| `VALIDATION_ERROR` | Input validation failure | 400 |
| `UNKNOWN_ERROR` | Unclassified errors | 500 |

## Testing

### Test Mode

For testing the Stripe integration:

1. Use Stripe test mode credentials in development and staging environments
2. Use Stripe test cards (e.g., `4242 4242 4242 4242` for successful payments)
3. Test webhook events can be sent from the Stripe dashboard or via the Stripe CLI

### Example Test Card Numbers

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 3220 | 3D Secure authentication required |

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Scheduling API](../scheduling/README.md)
- [Stripe Server Implementation](/docs/engineering/STRIPE_SERVER_IMPLEMENTATION.md)
- [Stripe Client Integration](/docs/engineering/STRIPE_CLIENT_INTEGRATION_UPDATES.md)
