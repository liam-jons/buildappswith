/**
 * Stripe Checkout API Route
 * 
 * This route handles the creation of Stripe checkout sessions for booking payments.
 * It validates the request, ensures proper authentication, and returns checkout details.
 * 
 * Version: 1.1.0
 * 
 * Updates:
 * - Added support for Calendly integration
 * - Updated schema to include Calendly event fields
 */

import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth';
import { createCheckoutSession } from '@/lib/stripe/actions';
import { logger } from '@/lib/logger';
import { CheckoutSessionRequest } from '@/lib/stripe/types';
import { trackBookingEvent, AnalyticsEventType } from '@/lib/scheduling/calendly/analytics';
import { z } from 'zod';

// Schema for validating checkout session requests
const checkoutSessionSchema = z.object({
  bookingData: z.object({
    id: z.string().optional(),
    builderId: z.string(),
    sessionTypeId: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    clientId: z.string().optional(),
    clientTimezone: z.string().optional(),
    // Add Calendly specific fields
    calendlyEventId: z.string().optional(),
    calendlyEventUri: z.string().optional(),
    calendlyInviteeUri: z.string().optional(),
  }),
  returnUrl: z.string().url(),
});

/**
 * POST handler for creating Stripe checkout sessions
 */
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    try {
      checkoutSessionSchema.parse(body);
    } catch (validationError: any) {
      logger.warn('Invalid checkout session request', { 
        error: validationError,
        userId: user.id 
      });
      
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationError.errors 
        },
        { status: 400 }
      );
    }
    
    // Add client ID from authenticated user if not provided
    if (!body.bookingData.clientId) {
      body.bookingData.clientId = user.id;
    }
    
    // Verify client ID matches authenticated user
    if (body.bookingData.clientId !== user.id) {
      logger.warn('Unauthorized checkout session request', { 
        requestClientId: body.bookingData.clientId,
        authenticatedUserId: user.id 
      });
      
      return NextResponse.json(
        { error: 'Unauthorized request' },
        { status: 403 }
      );
    }
    
    // Track API request for analytics
    const isCalendlyBooking = !!body.bookingData.calendlyEventId;
    trackBookingEvent(AnalyticsEventType.CHECKOUT_API_REQUESTED, {
      builderId: body.bookingData.builderId,
      clientId: user.id,
      hasBookingId: !!body.bookingData.id,
      isCalendly: isCalendlyBooking,
      calendlyEventId: body.bookingData.calendlyEventId
    });
    
    // Create checkout session using server action
    const result = await createCheckoutSession(body as CheckoutSessionRequest);
    
    if (!result.success) {
      const statusCode = result.error?.type === 'not_found' ? 404 :
        result.error?.type === 'authorization_error' ? 403 :
        result.error?.type === 'authentication_error' ? 401 :
        result.error?.type === 'not_implemented' ? 501 :
        500;
      
      // Track failed checkout creation
      trackBookingEvent(AnalyticsEventType.CHECKOUT_API_FAILED, {
        builderId: body.bookingData.builderId,
        clientId: user.id,
        error: result.error?.type,
        errorDetail: result.error?.detail,
        isCalendly: isCalendlyBooking,
        calendlyEventId: body.bookingData.calendlyEventId
      });
      
      return NextResponse.json(
        { error: result.message, details: result.error },
        { status: statusCode }
      );
    }
    
    // Track successful checkout creation
    trackBookingEvent(AnalyticsEventType.CHECKOUT_API_SUCCEEDED, {
      builderId: body.bookingData.builderId,
      clientId: user.id,
      isCalendly: isCalendlyBooking,
      calendlyEventId: body.bookingData.calendlyEventId,
      sessionId: result.data?.sessionId
    });
    
    // Return success response with session details
    return NextResponse.json({
      sessionId: result.data?.sessionId,
      url: result.data?.url
    });
  } catch (error: any) {
    logger.error('Error in checkout API route', { error });
    
    // Track unexpected error
    try {
      const body = await request.json();
      trackBookingEvent(AnalyticsEventType.CHECKOUT_API_ERROR, {
        error: error.message || 'Unknown error',
        requestBody: JSON.stringify(body).substring(0, 200), // Limit for logging
        userId: user?.id
      });
    } catch (e) {
      // Ignore parsing errors - we already have the main error logged
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
});