import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth/api-auth';
import { createStripeClient } from '@/lib/stripe/stripe-server';
import { transitionBooking } from '@/lib/scheduling/state-machine';
import { BookingEventEnum } from '@/lib/scheduling/state-machine/types';

/**
 * Get Stripe checkout session status
 * 
 * This endpoint retrieves the status of a Stripe checkout session.
 */
export async function GET(req: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthorized user attempted to check payment status');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get session ID from query parameters
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Initialize Stripe client
    const stripe = createStripeClient();
    if (!stripe) {
      logger.error('Failed to initialize Stripe client');
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      );
    }
    
    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });
    
    // Extract metadata
    const bookingId = session.metadata?.bookingId;
    const isCalendlyBooking = session.metadata?.isCalendlyBooking === 'true';
    const calendlyEventId = session.metadata?.calendlyEventId;
    
    // Determine payment status
    let paymentStatus;
    let paymentIntentId;
    
    if (session.payment_status === 'paid') {
      paymentStatus = 'PAID';
      
      // If there's a payment intent, extract its ID
      if (session.payment_intent && typeof session.payment_intent !== 'string') {
        paymentIntentId = session.payment_intent.id;
      }
      
      // Update booking state if we have a booking ID
      if (bookingId) {
        await transitionBooking(bookingId, BookingEventEnum.PAYMENT_SUCCEEDED, {
          stripeSessionId: sessionId,
          stripePaymentIntentId: paymentIntentId
        });
      }
      
    } else if (session.status === 'expired') {
      paymentStatus = 'FAILED';
      
      // Update booking state if we have a booking ID
      if (bookingId) {
        await transitionBooking(bookingId, BookingEventEnum.PAYMENT_FAILED, {
          stripeSessionId: sessionId,
          error: {
            message: 'Payment session expired',
            code: 'session_expired',
            timestamp: new Date().toISOString(),
            source: 'stripe'
          }
        });
      }
      
    } else {
      paymentStatus = 'PENDING';
    }
    
    logger.info('Retrieved payment status', {
      sessionId,
      paymentStatus,
      bookingId,
      userId: user.id
    });
    
    return NextResponse.json({
      status: session.status,
      paymentStatus,
      bookingId,
      paymentIntentId,
      metadata: session.metadata,
      calendlyEventId,
      isCalendlyBooking
    });
    
  } catch (error) {
    logger.error('Error retrieving payment status', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
}