# Calendly Webhook Implementation

*Version: 1.0.0*

This document outlines the webhook handling system for the Calendly integration, focusing on security, event processing, and retry mechanisms.

## Overview

Calendly webhooks enable our application to receive real-time notifications when events are created, canceled, or rescheduled. This is critical for maintaining booking state synchronization and triggering appropriate actions like payment processing or refunds.

## Webhook Event Types

The implementation handles these primary Calendly webhook event types:

- `invitee.created` - When a booking is created
- `invitee.canceled` - When a booking is canceled
- `invitee.rescheduled` - When a booking is rescheduled

## Webhook Security Implementation

Security is enforced through signature verification:

```typescript
// lib/scheduling/calendly/webhook-security.ts
import crypto from 'crypto';

/**
 * Verifies Calendly webhook signature
 * @param signature The signature from the request header
 * @param body The raw request body
 * @param secret The webhook secret
 * @returns boolean indicating whether signature is valid
 */
export function verifyCalendlySignature(
  signature: string,
  body: string,
  secret: string
): boolean {
  if (!signature || !body || !secret) {
    return false;
  }

  // Calendly uses HMAC-SHA-256 for signature verification
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  
  // Compare signatures in constant-time to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

## Webhook Handler Route

The main webhook endpoint validates signatures and routes events to appropriate handlers:

```typescript
// app/api/webhooks/calendly/route.ts
export async function POST(request: NextRequest) {
  try {
    // Get raw request body for signature verification
    const rawBody = await request.text();
    
    // Verify webhook signature
    const isValid = extractAndVerifySignature(
      request.headers,
      rawBody
    );
    
    if (!isValid) {
      logger.warn('Invalid Calendly webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { status: 401 }
      );
    }
    
    // Parse and validate webhook payload
    const body = JSON.parse(rawBody);
    const result = webhookSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid Calendly webhook payload', {
        errors: result.error.format()
      });
      return NextResponse.json(
        { error: 'Invalid payload' }, 
        { status: 400 }
      );
    }
    
    const { event, payload } = result.data;
    
    // Process different event types
    switch (event) {
      case 'invitee.created':
        await handleInviteeCreated(payload);
        break;
      case 'invitee.canceled':
        await handleInviteeCanceled(payload);
        break;
      case 'invitee.rescheduled':
        await handleInviteeRescheduled(payload);
        break;
      default:
        logger.info(`Unhandled Calendly event type: ${event}`);
    }
    
    // Acknowledge receipt of webhook
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('Error processing Calendly webhook', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return 200 status even on error to prevent Calendly from retrying
    // We'll handle errors internally via monitoring and alerting
    return NextResponse.json(
      { success: false, message: 'Error processing webhook' },
      { status: 200 }
    );
  }
}
```

## Event-Specific Handlers

Each event type has a dedicated handler:

### Invitee Created

When a booking is created in Calendly, this handler:
1. Updates our booking record with Calendly-specific details
2. Changes the booking status to PENDING_PAYMENT
3. Initiates the payment flow by creating a Stripe checkout session

### Invitee Canceled

When a booking is canceled in Calendly, this handler:
1. Finds the corresponding booking in our database
2. Processes a refund if payment was already made
3. Updates the booking status to CANCELED

### Invitee Rescheduled

When a booking is rescheduled in Calendly, this handler:
1. Finds the corresponding booking by the old event ID or invitee ID
2. Updates the booking with the new event details
3. Maintains the payment status (or resets to PENDING_PAYMENT if previously canceled)

## Webhook Registration and Management

A dedicated manager class handles webhook registration with Calendly:

```typescript
export class CalendlyWebhookManager {
  /**
   * Registers a new webhook with Calendly
   */
  async registerWebhook({
    url,
    events,
    scope = 'user',
    scopeId
  }: RegisterWebhookOptions): Promise<string> {
    // Implementation details...
  }
  
  /**
   * Lists all registered webhooks
   */
  async listWebhooks(): Promise<any[]> {
    // Implementation details...
  }
  
  /**
   * Deletes a webhook by ID
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    // Implementation details...
  }
  
  /**
   * Ensures the required webhooks are registered
   * This can be called during application startup
   */
  async ensureWebhooksRegistered(baseUrl: string): Promise<void> {
    // Implementation details...
  }
}
```

## Retry Mechanism

A robust retry system handles webhook processing failures:

1. **Exponential Backoff** - Retries are scheduled with increasing delays (1min, 5min, 15min, 30min, 60min)
2. **Maximum Attempts** - After a configurable number of attempts (default: 5), the webhook is moved to a dead letter queue
3. **Scheduled Processing** - A recurring job processes due retries

```typescript
export async function scheduleWebhookRetry(
  webhookId: string,
  eventType: string,
  payload: any,
  error: string,
  options = { maxAttempts: 5 }
): Promise<void> {
  // Implementation details...
}

export async function processWebhookRetries(): Promise<void> {
  // Find retries that are due
  // Process each retry
  // Remove successful retries or reschedule failed ones
}
```

## Best Practices

1. **Return 200 Status** - Even for failed processing, return HTTP 200 to prevent Calendly from retrying webhooks externally. Handle retries internally.
2. **Idempotent Processing** - All handlers are designed to be idempotent to safely handle duplicate webhook deliveries.
3. **Error Isolation** - Errors in one event handler don't affect processing of other events.
4. **Comprehensive Logging** - All webhook processing is logged for monitoring and debugging.
5. **Security First** - All webhooks are verified with signature validation before processing.

## Webhook Monitoring

The system includes monitoring for webhook processing:

1. Failed webhook processing is logged with detailed error information
2. Webhooks that exceed maximum retry attempts are moved to a dead letter queue for investigation
3. Metrics are collected on webhook processing times and success rates

## Related Documentation

- [Calendly Integration](./CALENDLY_INTEGRATION.md)
- [Payment Processing](./PAYMENT_PROCESSING.md)