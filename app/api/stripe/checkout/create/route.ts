import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/auth/api-auth';
import { createStripeClient } from '@/lib/stripe/stripe-server';
import { getBookingState } from '@/lib/scheduling/state-machine';
import { BookingStateEnum } from '@/lib/scheduling/state-machine/types';

// Request schema validation
const CheckoutSessionRequestSchema = z.object({
  bookingData: z.object({
    id: z.string().uuid(),
    builderId: z.string(),
    sessionTypeId: z.string(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    clientId: z.string().optional(),
    clientTimezone: z.string().optional(),
    // Calendly fields
    calendlyEventId: z.string().optional(),
    calendlyEventUri: z.string().optional(),
    calendlyInviteeUri: z.string().optional(),
  }),
  returnUrl: z.string().url()
});

/**
 * Create a Stripe checkout session
 * 
 * This endpoint creates a Stripe checkout session for a booking.
 */
export async function POST(req: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthorized user attempted to create checkout session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    try {
      const { bookingData, returnUrl } = CheckoutSessionRequestSchema.parse(body);
      
      // Verify booking exists and is in the correct state
      const bookingContext = await getBookingState(bookingData.id);
      if (!bookingContext) {
        logger.error('Booking not found for checkout', { bookingId: bookingData.id });
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      // Check if the booking state allows payment
      if (
        bookingContext.state !== BookingStateEnum.CALENDLY_EVENT_SCHEDULED &&
        bookingContext.state !== BookingStateEnum.PAYMENT_REQUIRED
      ) {
        logger.warn('Invalid booking state for checkout', {
          bookingId: bookingData.id,
          currentState: bookingContext.state
        });
        return NextResponse.json(
          { error: 'Booking is not in the correct state for payment' },
          { status: 400 }
        );
      }
      
      // Fetch session type details to get price
      // In a real application, you would fetch this from your database
      // For now, we'll use a placeholder
      const sessionType = {
        id: bookingData.sessionTypeId,
        title: 'Session Type',
        description: 'Session description',
        durationMinutes: 60,
        price: 100,
        currency: 'USD'
      };
      
      // Initialize Stripe client
      const stripe = createStripeClient();
      if (!stripe) {
        logger.error('Failed to initialize Stripe client');
        return NextResponse.json(
          { error: 'Payment service unavailable' },
          { status: 503 }
        );
      }
      
      // Prepare metadata for the checkout session
      const metadata: Record<string, string> = {
        bookingId: bookingData.id,
        builderId: bookingData.builderId,
        sessionTypeId: bookingData.sessionTypeId,
        clientId: bookingData.clientId || user.id,
      };
      
      // Add optional fields to metadata if present
      if (bookingData.startTime) metadata.startTime = bookingData.startTime;
      if (bookingData.endTime) metadata.endTime = bookingData.endTime;
      if (bookingData.clientTimezone) metadata.timeZone = bookingData.clientTimezone;
      
      // Add Calendly fields to metadata if present
      if (bookingData.calendlyEventId) {
        metadata.calendlyEventId = bookingData.calendlyEventId;
        metadata.isCalendlyBooking = 'true';
      }
      if (bookingData.calendlyEventUri) metadata.calendlyEventUri = bookingData.calendlyEventUri;
      if (bookingData.calendlyInviteeUri) metadata.calendlyInviteeUri = bookingData.calendlyInviteeUri;
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: sessionType.currency.toLowerCase(),
              product_data: {
                name: sessionType.title,
                description: `${sessionType.durationMinutes} minute session`
              },
              unit_amount: Math.round(sessionType.price * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingData.id}&status=success`,
        cancel_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingData.id}&status=canceled`,
        customer_email: user.email,
        metadata
      });
      
      logger.info('Stripe checkout session created', {
        bookingId: bookingData.id,
        sessionId: session.id,
        userId: user.id
      });
      
      return NextResponse.json({
        sessionId: session.id,
        url: session.url
      });
      
    } catch (validationError) {
      logger.error('Validation error when creating checkout session', {
        error: validationError,
        userId: user.id
      });
      
      return NextResponse.json(
        { error: 'Invalid request data', details: validationError },
        { status: 400 }
      );
    }
    
  } catch (error) {
    logger.error('Error creating checkout session', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}