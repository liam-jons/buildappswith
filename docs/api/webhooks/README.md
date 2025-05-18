# Webhook API Documentation

*Version: 1.0.139*

This document provides comprehensive documentation for the webhook endpoints in the Buildappswith platform. These endpoints handle events from external services such as Clerk and Stripe.

## Overview

Webhook endpoints receive and process events from third-party services. These events trigger actions within the Buildappswith platform, such as updating user records when authentication events occur or modifying booking statuses when payment events are received.

## Base URLs

Webhook endpoints are organized by service:

```
/api/webhooks/clerk     // For Clerk authentication events
/api/stripe/webhook     // For Stripe payment events
```

## Authentication

Unlike standard API endpoints, webhooks are authenticated using service-specific methods:

- **Clerk webhooks**: Authenticated using the `svix-id`, `svix-timestamp`, and `svix-signature` headers
- **Stripe webhooks**: Authenticated using the `stripe-signature` header

These signatures are verified against configured webhook secrets to ensure the requests are legitimate.

## Clerk Webhook

### Process Clerk Events

Processes authentication and user management events from Clerk.

**URL**: `/api/webhooks/clerk`  
**Method**: `POST`  
**Authentication**: Svix signature verification  

#### Required Headers

- `svix-id`: Event ID provided by Clerk
- `svix-timestamp`: Timestamp when the event was sent
- `svix-signature`: Signature to verify the request

#### Request Body

The raw body as sent by Clerk, typically containing:

```typescript
{
  "data": {
    // Event-specific data
  },
  "object": "event",
  "type": string // Event type (e.g., "user.created", "user.updated")
}
```

#### Success Response

**Code**: `200 OK`

```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "event": "user.created"
}
```

#### Error Responses

**Unauthorized** (401)
```json
{
  "success": false,
  "message": "Invalid webhook signature",
  "error": {
    "type": "AUTHENTICATION_ERROR",
    "detail": "Could not verify webhook signature"
  }
}
```

**Bad Request** (400)
```json
{
  "success": false,
  "message": "Missing required headers",
  "error": {
    "type": "VALIDATION_ERROR",
    "detail": "One or more required headers are missing"
  }
}
```

**Internal Server Error** (500)
```json
{
  "success": false,
  "message": "Error processing webhook",
  "error": {
    "type": "INTERNAL_ERROR",
    "detail": "An unexpected error occurred while processing the webhook"
  }
}
```

#### Supported Event Types

| Event Type | Action Taken |
|------------|--------------|
| `user.created` | Creates a new user record in the database |
| `user.updated` | Updates the existing user record |
| `user.deleted` | Marks the user as inactive in the database |
| `session.created` | Logs session creation |
| `session.ended` | Logs session termination |

#### Security Considerations

- Webhook signatures must be verified to prevent unauthorized calls
- The webhook secret must be securely stored in environment variables
- Events are processed idempotently to prevent duplicate actions

#### Example Implementation

```typescript
import { Webhook } from 'svix';
import { buffer } from 'micro';

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = {
    'svix-id': req.headers.get('svix-id'),
    'svix-timestamp': req.headers.get('svix-timestamp'),
    'svix-signature': req.headers.get('svix-signature'),
  };
  
  try {
    // Verify the webhook signature
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    const event = webhook.verify(body, headerPayload) as any;
    
    // Process the event
    switch (event.type) {
      case 'user.created':
        // Handle user creation
        break;
      case 'user.updated':
        // Handle user update
        break;
      // Other cases...
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processed successfully',
        event: event.type,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Handle errors...
  }
}
```

## Stripe Webhook

### Process Stripe Events

Processes payment and checkout events from Stripe.

**URL**: `/api/stripe/webhook`  
**Method**: `POST`  
**Authentication**: Stripe signature verification  

#### Required Headers

- `stripe-signature`: Signature provided by Stripe to verify the event

#### Request Body

The raw body as sent by Stripe, containing a webhook event object.

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
- Even on error, a 200 status is returned to prevent Stripe from retrying events
- Events are processed idempotently to prevent duplicate actions

#### Example Implementation

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleWebhookEvent } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    
    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      // Handle signature verification failure...
    }
    
    // Handle the event
    const result = await handleWebhookEvent(event);
    
    // Return an appropriate response
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `Processed webhook event: ${event.type}`
        : result.message,
      received: true // Acknowledge receipt to prevent retries
    });
  } catch (error) {
    // Handle unexpected errors...
  }
}
```

## Testing Webhooks

### Local Development Testing

For testing webhooks during local development:

1. **Clerk Webhooks**:
   - Use Clerk's developer dashboard to send test events
   - Create a local tunnel service (e.g., ngrok) to expose your local server
   - Configure the webhook URL in Clerk's dashboard to point to your tunnel

2. **Stripe Webhooks**:
   - Use the Stripe CLI to forward events to your local server:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
   - Trigger test events with:
     ```bash
     stripe trigger checkout.session.completed
     ```

### Production Testing

For testing in a production or staging environment:

1. **Clerk Webhooks**:
   - Use Clerk's dashboard to send test events to your production endpoint
   - Monitor logs to confirm events are being processed correctly

2. **Stripe Webhooks**:
   - Use Stripe's dashboard to send test events
   - Create test payments using Stripe's test mode
   - Monitor logs and database changes to confirm proper processing

## Webhook Event Logging

All webhook events are logged using the application's logging system:

- Event type and ID are recorded
- Processing success or failure is noted
- Relevant context data is included
- Error details are captured when failures occur

This logging helps with monitoring, troubleshooting, and auditing webhook processing.

## Related Documentation

- [API Overview](../API_OVERVIEW.md)
- [Stripe API Documentation](../stripe/README.md)
- [Stripe Server Implementation](/docs/engineering/STRIPE_SERVER_IMPLEMENTATION.md)
- [Clerk Authentication Status](/docs/engineering/CLERK_AUTHENTICATION_STATUS.md)
