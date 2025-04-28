# Stripe Server Implementation

*Version: 1.0.133*

This document provides an overview of the current server-side Stripe integration in the Buildappswith platform as of version 1.0.133. It builds on the modernization effort described in [STRIPE_SERVER_MODERNIZATION.md](./STRIPE_SERVER_MODERNIZATION.md) and complements the client-side updates outlined in [STRIPE_CLIENT_INTEGRATION_UPDATES.md](./STRIPE_CLIENT_INTEGRATION_UPDATES.md).

## Overview

The Stripe server implementation provides a robust, type-safe interface for interacting with the Stripe API from our server-side code. It handles customer management, checkout session creation, webhook processing, and payment status tracking with comprehensive error handling and logging.

## Key Components

### 1. Server Utility (`stripe-server.ts`)

The core server-side utility implements:

- **Centralized Stripe Initialization**: Single instance with proper configuration
- **Type-Safe Interfaces**: Comprehensive TypeScript typing for all operations
- **Error Classification**: Structured error handling with detailed categorization
- **Standardized Responses**: Consistent response format for all operations
- **Database Integration**: Direct connection with booking records
- **Webhook Processing**: Secure event handling with signature verification

### 2. API Routes

The server implementation includes these key API routes:

- **/api/stripe/checkout**: Creates Stripe checkout sessions for bookings
- **/api/stripe/webhook**: Processes Stripe webhook events securely
- **/api/stripe/sessions/[id]**: Retrieves detailed information about checkout sessions

## Implementation Details

### Stripe Initialization

The Stripe instance is initialized with proper typing and application information:

```typescript
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2025-03-31.basil' as const,
  appInfo: {
    name: 'Buildappswith',
    version: '1.0.133',
  },
});
```

This ensures consistent API usage and proper identification in Stripe logs.

### Response Structure

All operations return a standardized `StripeOperationResult` interface:

```typescript
export interface StripeOperationResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: StripeErrorType;
    code?: string;
    detail?: string;
  };
}
```

This provides a consistent pattern for handling both successful operations and errors.

### Error Handling

The implementation includes comprehensive error classification:

```typescript
export enum StripeErrorType {
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

With a centralized error handling function:

```typescript
function handleStripeError(error: any, logContext: Record<string, any> = {}): {
  type: StripeErrorType;
  code?: string;
  detail?: string;
}
```

This ensures errors are consistently processed and logged.

### Core Operations

#### Customer Management

The implementation provides a function to get or create Stripe customers:

```typescript
export async function getOrCreateCustomer(
  params: CustomerParams
): Promise<StripeOperationResult<string>>
```

This helps maintain a consistent customer identity across multiple bookings.

#### Checkout Session Creation

Creating checkout sessions for bookings is handled by:

```typescript
export async function createBookingCheckoutSession(
  params: BookingCheckoutParams
): Promise<StripeOperationResult<Stripe.Checkout.Session>>
```

This function includes comprehensive metadata management to ensure proper tracking of booking information.

#### Session Retrieval

Retrieving checkout session details:

```typescript
export async function getCheckoutSession(
  sessionId: string
): Promise<StripeOperationResult<Stripe.Checkout.Session>>
```

This provides a way to check payment status and details.

#### Refund Processing

The implementation includes refund functionality:

```typescript
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<StripeOperationResult<Stripe.Refund>>
```

This allows for handling refunds with proper error management.

#### Webhook Processing

Secure webhook event handling:

```typescript
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<StripeOperationResult<{ handled: boolean }>>
```

This function processes different event types with proper database integration.

### Database Integration

The implementation connects with the booking system to maintain consistent state:

```typescript
// Update the booking if a booking ID was provided
if (bookingId) {
  try {
    // Update the booking payment status
    await updateBookingPayment(
      bookingId,
      'paid',
      sessionId
    );
    
    // Update the booking status to confirmed
    await updateBookingStatus(
      bookingId,
      'confirmed'
    );
  } catch (dbError) {
    // Error handling...
  }
}
```

This ensures that booking records are correctly updated based on payment events.

## API Routes Implementation

### Checkout Route

The `/api/stripe/checkout` route creates Stripe checkout sessions for bookings:

1. **Validates Input**: Ensures all required fields are provided
2. **Creates Session**: Uses the server utility to create a Stripe checkout session
3. **Returns Response**: Provides the session ID and checkout URL

### Webhook Route

The `/api/stripe/webhook` route securely processes Stripe webhook events:

1. **Verifies Signature**: Ensures the webhook is legitimate using the Stripe signature
2. **Processes Events**: Handles different event types like checkout completion and payment failures
3. **Updates Database**: Updates booking records based on payment outcomes

### Session Retrieval Route

The `/api/stripe/sessions/[id]` route retrieves detailed information about checkout sessions:

1. **Fetches Session**: Retrieves the session from Stripe
2. **Enriches Data**: Adds booking information from the database
3. **Returns Response**: Provides session status, payment status, and booking details

## Integration with Booking System

The Stripe implementation integrates with the booking system through several touchpoints:

1. **Session Creation**: Includes booking ID in checkout session metadata
2. **Webhook Processing**: Updates booking status based on payment events
3. **Database Updates**: Modifies booking records to reflect payment status

This ensures a consistent state between Stripe payments and application bookings.

## Security Considerations

The implementation includes several security measures:

1. **Signature Verification**: Webhook events are verified using Stripe's signature mechanism
2. **Error Classification**: Security-related errors are properly classified
3. **Metadata Security**: Sensitive information is not included in Stripe metadata
4. **Database Verification**: Verifies booking existence before updating records

## Logging Strategy

Comprehensive logging is implemented throughout the Stripe server utility:

```typescript
logger.info('Created checkout session', { 
  ...logContext, 
  sessionId: session.id 
});
```

This provides detailed information for troubleshooting and monitoring.

## Future Enhancements

Potential future improvements to the server implementation:

1. **Enhanced Idempotency**: Adding explicit idempotency key management for all operations
2. **Additional Payment Methods**: Support for non-card payment methods
3. **Subscription Support**: Adding recurring payment capabilities
4. **Enhanced Analytics**: Detailed tracking of payment metrics and conversion rates
5. **Expanded Webhook Handling**: Adding support for more Stripe event types

## Related Documentation

- [Stripe Client Integration Updates](./STRIPE_CLIENT_INTEGRATION_UPDATES.md)
- [Stripe Server Modernization](./STRIPE_SERVER_MODERNIZATION.md)
- [Stripe Cleanup Summary](../STRIPE_CLEANUP_SUMMARY.md)
- [Payment Processing](./PAYMENT_PROCESSING.md)
- [Booking System](./BOOKING_SYSTEM.md)
