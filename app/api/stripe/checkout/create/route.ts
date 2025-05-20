import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { withAuth } from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { clerkClient } from '@clerk/nextjs/server';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors';
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
export const POST = withAuth(async (req: NextRequest, context: any, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    // Fetch user details (specifically email) using auth.userId
    let userEmail: string | undefined;
    try {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      userEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      if (!userEmail) {
        logger.error('Primary email not found for user during checkout creation', { path, method, userId: auth.userId });
        return createAuthErrorResponse(AuthErrorType.SERVER, 'User email not found', 500, path, method, auth.userId);
      }
    } catch (fetchError) {
      logger.error('Failed to fetch user details for checkout creation', { path, method, userId: auth.userId, error: fetchError });
      return createAuthErrorResponse(AuthErrorType.SERVER, 'Failed to retrieve user details', 500, path, method, auth.userId);
    }

    const body = await req.json();
    
    // Validate request body (using an inner try-catch for validation errors)
    let parsedBody;
    try {
      parsedBody = CheckoutSessionRequestSchema.parse(body);
    } catch (validationError) {
      logger.warn('Validation error creating Stripe checkout session', { path, method, userId: auth.userId, error: validationError });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION, 
        'Invalid request data',
        400, 
        path, 
        method, 
        auth.userId
        // Details can be logged but not directly returned to client for security/simplicity
      );
    }

    const { bookingData, returnUrl } = parsedBody;
      
    const bookingContext = await getBookingState(bookingData.id);
    if (!bookingContext) {
      logger.warn('Booking not found for checkout', { path, method, userId: auth.userId, bookingId: bookingData.id });
      return createAuthErrorResponse(AuthErrorType.RESOURCE_NOT_FOUND, 'Booking not found', 404, path, method, auth.userId);
    }
      
    if (
      bookingContext.state !== BookingStateEnum.CALENDLY_EVENT_SCHEDULED &&
      bookingContext.state !== BookingStateEnum.PAYMENT_REQUIRED
    ) {
      logger.warn('Invalid booking state for checkout', {
        path, method, userId: auth.userId,
        bookingId: bookingData.id,
        currentState: bookingContext.state
      });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Booking is not in the correct state for payment',
        400,
        path,
        method,
        auth.userId
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
      logger.error('Failed to initialize Stripe client for checkout', { path, method, userId: auth.userId });
      return createAuthErrorResponse(
        AuthErrorType.CONFIGURATION,
        'Payment service unavailable',
        503, 
        path, 
        method, 
        auth.userId
      );
    }
      
    const metadata: Record<string, string> = {
      bookingId: bookingData.id,
      builderId: bookingData.builderId,
      sessionTypeId: bookingData.sessionTypeId,
      clientId: bookingData.clientId || auth.userId, // Use authenticated auth.userId if clientId not provided
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
      customer_email: userEmail, // Use fetched user email
      metadata
    });
      
    logger.info('Stripe checkout session created successfully', {
      path, method, userId: auth.userId,
      bookingId: bookingData.id,
      sessionId: session.id,
    });
      
    const response = NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error creating Stripe checkout session', { error: errorMessage, path, method, userId: auth.userId });
    // Sentry.captureException(error); // Keep Sentry for unhandled errors
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to create checkout session',
      500,
      path,
      method,
      auth.userId
    );
  }
});