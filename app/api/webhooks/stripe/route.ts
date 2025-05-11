import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createStripeClient } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';
import { handleStripeWebhook } from '@/lib/scheduling/state-machine';
import { StripeWebhookEventType } from '@/lib/stripe/types';

/**
 * Handle Stripe webhook events
 * 
 * This endpoint receives webhook events from Stripe, verifies their
 * authenticity using signature verification, and processes them with
 * the booking state machine.
 */
export async function POST(req: NextRequest) {
  try {
    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      logger.warn('Missing Stripe webhook signature');
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }
    
    // Get the raw body as text
    const body = await req.text();
    
    // Initialize Stripe client
    const stripe = createStripeClient();
    if (!stripe) {
      logger.error('Failed to initialize Stripe client');
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      );
    }
    
    let event: Stripe.Event;
    
    try {
      // Verify the signature using Stripe's library
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (signatureError) {
      logger.warn('Invalid Stripe webhook signature', {
        error: signatureError instanceof Error ? signatureError.message : String(signatureError)
      });
      
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Log the received event
    logger.info('Received Stripe webhook event', {
      eventType: event.type,
      eventId: event.id
    });
    
    // Process different event types
    switch (event.type) {
      case StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED:
      case StripeWebhookEventType.CHECKOUT_SESSION_EXPIRED:
      case StripeWebhookEventType.PAYMENT_INTENT_SUCCEEDED:
      case StripeWebhookEventType.PAYMENT_INTENT_FAILED: {
        // Process the webhook with our state machine
        const result = await handleStripeWebhook(event.type, event);
        
        if (!result) {
          logger.warn('No state transition performed for Stripe webhook', {
            eventType: event.type,
            eventId: event.id
          });
          
          return NextResponse.json(
            { 
              success: false,
              message: 'No state transition performed' 
            },
            { status: 200 }
          );
        }
        
        logger.info('Successfully processed Stripe webhook', {
          eventType: event.type,
          eventId: event.id,
          bookingId: result.stateData.bookingId,
          previousState: result.previousState,
          currentState: result.currentState
        });
        
        return NextResponse.json({ 
          success: true,
          previousState: result.previousState,
          currentState: result.currentState
        });
      }
      
      default: {
        // Log unhandled event types
        logger.info('Unhandled Stripe webhook event type', {
          eventType: event.type,
          eventId: event.id
        });
        
        // Return 200 to prevent Stripe from retrying
        return NextResponse.json(
          { 
            success: true,
            message: 'Unhandled event type' 
          },
          { status: 200 }
        );
      }
    }
    
  } catch (error) {
    logger.error('Error processing Stripe webhook', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      'Access-Control-Max-Age': '86400'
    }
  });
}