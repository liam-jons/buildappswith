import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withAuth } from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors';
import { createStripeClient } from '@/lib/stripe/stripe-server';
import { transitionBooking } from '@/lib/scheduling/state-machine';
import { BookingEventEnum } from '@/lib/scheduling/state-machine/types';

/**
 * Get Stripe checkout session status
 * 
 * This endpoint retrieves the status of a Stripe checkout session.
 */
export const GET = withAuth(async (req: NextRequest, context: any, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      logger.warn('Session ID missing for payment status check', { path, method, userId: auth.userId });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Session ID is required',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    // Initialize Stripe client
    const stripe = createStripeClient();
    if (!stripe) {
      logger.error('Failed to initialize Stripe client for payment status check', { path, method, userId: auth.userId });
      return createAuthErrorResponse(
        AuthErrorType.CONFIGURATION,
        'Payment service unavailable',
        503,
        path,
        method,
        auth.userId
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
          stripePaymentIntentId: paymentIntentId,
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
          },
        });
      }
      
    } else {
      paymentStatus = 'PENDING';
    }
    
    logger.info('Retrieved payment status successfully', {
      path, method, userId: auth.userId,
      sessionId,
      paymentStatus,
      bookingId,
    });
    
    const responseData = {
      status: session.status,
      paymentStatus,
      bookingId,
      paymentIntentId,
      metadata: session.metadata,
      calendlyEventId,
      isCalendlyBooking
    };

    const response = NextResponse.json({ success: true, data: responseData });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error retrieving payment status', { error: errorMessage, path, method, userId: auth.userId });
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to retrieve payment status',
      500,
      path,
      method,
      auth.userId
    );
  }
});