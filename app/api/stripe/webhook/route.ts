import { NextRequest, NextResponse } from 'next/server';
import { stripe, handleWebhookEvent, StripeErrorType } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Process Stripe webhook events
 * This route handles all webhook events from Stripe such as checkout.session.completed,
 * payment_intent.succeeded, and payment_intent.payment_failed
 *
 * @param request - The incoming request from Stripe
 * @returns NextResponse with acknowledgment or error message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    const logContext = { eventType: 'unknown' };

    // Validate required headers/config
    if (!signature || !webhookSecret) {
      logger.warn('Missing Stripe webhook signature or secret', {
        hasSignature: !!signature,
        hasSecret: !!webhookSecret
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Missing signature or webhook secret',
          error: {
            type: 'VALIDATION_ERROR',
            detail: 'Both stripe-signature header and webhook secret are required'
          }
        },
        { status: 400 }
      );
    }

    // Verify the webhook signature and construct the event
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      // Update log context with the event type
      logContext.eventType = event.type;
    } catch (err: any) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
        signature: signature?.substring(0, 10) + '...' // Log partial signature for debugging
      });
      
      return NextResponse.json(
        {
          success: false,
          message: 'Webhook signature verification failed',
          error: {
            type: 'AUTHENTICATION_ERROR',
            detail: 'Could not verify webhook signature'
          }
        },
        { status: 400 }
      );
    }
    
    // Log the webhook event received
    logger.info('Webhook event received', {
      eventId: event.id,
      eventType: event.type
    });
    
    // Handle the event using centralized handler
    const result = await handleWebhookEvent(event);
    
    // Check if the handler was successful
    if (!result.success) {
      logger.error('Error handling webhook event', {
        ...logContext,
        eventId: event.id,
        error: result.error
      });
      
      // Return an error response but with 200 status
      // Stripe will retry the webhook if we return a non-200 status
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
        received: true
      });
    }
    
    logger.info('Webhook event processed successfully', {
      ...logContext,
      eventId: event.id
    });
    
    return NextResponse.json({
      success: true,
      message: `Processed webhook event: ${event.type}`,
      received: true
    });
  } catch (error) {
    logger.error('Unexpected webhook error', {
      error: error.message || 'Unknown error'
    });
    
    // Return a 200 status code to prevent Stripe from retrying the webhook
    // But include error information in the response
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed',
      error: {
        type: 'INTERNAL_ERROR',
        detail: 'An unexpected error occurred while processing the webhook'
      },
      received: true // Acknowledge receipt to prevent retries
    });
  }
}
