import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createStripeClient } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';
import { handleStripeWebhook } from '@/lib/scheduling/state-machine';
import { StripeWebhookEventType } from '@/lib/stripe/types';
import { sendPaymentReceiptEmail } from '@/lib/scheduling/sendgrid-email';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        
        // Send payment receipt email for successful payments
        if (event.type === StripeWebhookEventType.CHECKOUT_SESSION_COMPLETED) {
          try {
            const session = event.data.object as Stripe.Checkout.Session;
            const bookingId = session.metadata?.bookingId;
            
            if (bookingId) {
              const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                  sessionType: true,
                  builder: {
                    include: {
                      user: true
                    }
                  },
                  client: true
                }
              });
              
              if (booking) {
                const paymentIntentDetails = await stripe.paymentIntents.retrieve(
                  session.payment_intent as string
                );
                
                await sendPaymentReceiptEmail({
                  to: booking.client?.email || session.customer_details?.email || '',
                  clientName: booking.client?.name || session.customer_details?.name || 'Customer',
                  sessionTitle: booking.sessionType.title,
                  builderName: booking.builder.user?.name || 'Builder',
                  amount: session.amount_total || booking.sessionType.price.toNumber() * 100,
                  currency: session.currency || 'usd',
                  paymentDate: new Date(),
                  bookingId: booking.id,
                  stripePaymentIntentId: session.payment_intent as string,
                  stripeReceiptUrl: paymentIntentDetails.charges?.data[0]?.receipt_url || undefined
                });
              }
            }
          } catch (emailError) {
            logger.error('Error sending payment receipt email', {
              error: emailError instanceof Error ? emailError.message : String(emailError),
              eventType: event.type,
              eventId: event.id
            });
            // Don't fail the webhook processing if email fails
          }
        }
        
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