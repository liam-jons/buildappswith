/**
 * Stripe Checkout API Route
 * 
 * This route handles the creation of Stripe checkout sessions for booking payments.
 * It validates the request, ensures proper authentication, and returns checkout details.
 * 
 * Version: 1.1.1 (Auth Refactor)
 * 
 * Updates:
 * - Updated to use new withAuth HOC and standardized auth patterns
 * - Added support for Calendly integration
 * - Updated schema to include Calendly event fields
 */

import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors';
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
export const POST = withAuth(async (request: NextRequest, context: any, auth: AuthObject) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  let requestBodyForLogging: any = null; // For logging in catch block

  try {
    const body = await request.json();
    requestBodyForLogging = body; // Store for potential logging
    
    try {
      checkoutSessionSchema.parse(body);
    } catch (validationError: any) {
      logger.warn('Invalid checkout session request', { 
        path, method, userId: auth.userId, 
        error: validationError.errors 
      });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid request data',
        400,
        path,
        method,
        auth.userId
        // details: validationError.errors // Avoid sending detailed validation errors to client
      );
    }
    
    if (!body.bookingData.clientId) {
      body.bookingData.clientId = auth.userId; // Use authenticated userId
    }
    
    if (body.bookingData.clientId !== auth.userId) { // Compare with authenticated userId
      logger.warn('Unauthorized checkout session request attempt', { 
        path, method, userId: auth.userId,
        requestClientId: body.bookingData.clientId,
        authenticatedUserId: auth.userId 
      });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Unauthorized request',
        403,
        path,
        method,
        auth.userId
      );
    }
    
    const isCalendlyBooking = !!body.bookingData.calendlyEventId;
    trackBookingEvent(AnalyticsEventType.CHECKOUT_API_REQUESTED, {
      builderId: body.bookingData.builderId,
      clientId: auth.userId, // Use authenticated userId
      hasBookingId: !!body.bookingData.id,
      isCalendly: isCalendlyBooking,
      calendlyEventId: body.bookingData.calendlyEventId
    });
    
    const result = await createCheckoutSession(body as CheckoutSessionRequest);
    
    if (!result.success) {
      const statusCode = result.error?.type === 'not_found' ? 404 :
        result.error?.type === 'authorization_error' ? 403 :
        result.error?.type === 'authentication_error' ? 401 :
        result.error?.type === 'not_implemented' ? 501 :
        500;
      
      trackBookingEvent(AnalyticsEventType.CHECKOUT_API_FAILED, {
        builderId: body.bookingData.builderId,
        clientId: auth.userId, // Use authenticated userId
        error: result.error?.type,
        errorDetail: result.error?.detail,
        isCalendly: isCalendlyBooking,
        calendlyEventId: body.bookingData.calendlyEventId
      });
      
      return createAuthErrorResponse(
        result.error?.type || AuthErrorType.SERVER, 
        result.message || 'Checkout creation failed',
        statusCode, 
        path, 
        method, 
        auth.userId
      );
    }
    
    trackBookingEvent(AnalyticsEventType.CHECKOUT_API_SUCCEEDED, {
      builderId: body.bookingData.builderId,
      clientId: auth.userId, // Use authenticated userId
      isCalendly: isCalendlyBooking,
      calendlyEventId: body.bookingData.calendlyEventId,
      sessionId: result.data?.sessionId
    });
    
    const response = NextResponse.json({
      success: true, // Added for consistency with other refactored endpoints
      data: {
        sessionId: result.data?.sessionId,
        url: result.data?.url
      }
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error during checkout process';
    logger.error('Error in Stripe checkout API route', { 
      path, method, userId: auth.userId || 'unknown', // userId might not be set if error is very early
      error: errorMessage,
      requestBody: requestBodyForLogging ? JSON.stringify(requestBodyForLogging).substring(0, 200) : 'not parsed'
    });
    
    trackBookingEvent(AnalyticsEventType.CHECKOUT_API_ERROR, {
      error: errorMessage,
      requestBody: requestBodyForLogging ? JSON.stringify(requestBodyForLogging).substring(0, 200) : 'not parsed',
      userId: auth.userId || 'unknown' // userId might not be set
    });
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      error.message || 'Failed to create checkout session',
      500,
      path,
      method,
      auth.userId || 'unknown' // Pass userId if available
    );
  }
});