import { NextRequest, NextResponse } from 'next/server';
import { stripe, createBookingCheckoutSession, StripeErrorType } from '@/lib/stripe/stripe-server';
import { withAuth } from '@clerk/nextjs/api';
import { logger } from '@/lib/logger';
import { getSessionTypeById } from '@/lib/scheduling/real-data/scheduling-service';

/**
 * API route to create a Stripe checkout session for a booking
 * 
 * @param request - The incoming request object
 * @param auth - Auth object provided by Clerk's withAuth middleware
 * @returns NextResponse with session data or error
 */
export const POST = withAuth(async (request: NextRequest, auth: any) => {
  try {
    // Check authentication
    if (!auth.userId) {
      logger.warn('Unauthorized access attempt to checkout route');
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication required',
          error: {
            type: 'AUTHENTICATION_ERROR',
            detail: 'You must be signed in to create a checkout session'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingData, returnUrl } = body;
    const logContext = { userId: auth.userId };

    // Validate required fields
    if (!bookingData || !returnUrl) {
      logger.warn('Missing required fields in checkout request', { ...logContext, body });
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: {
            type: 'VALIDATION_ERROR',
            detail: 'Both bookingData and returnUrl are required'
          }
        },
        { status: 400 }
      );
    }

    // Ensure the authenticated user matches the client ID
    if (bookingData.clientId && bookingData.clientId !== auth.userId) {
      logger.warn('User attempted to create checkout for another user', {
        ...logContext,
        requestedClientId: bookingData.clientId
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Not authorized',
          error: {
            type: 'AUTHORIZATION_ERROR',
            detail: 'You cannot create a checkout session for another user'
          }
        },
        { status: 403 }
      );
    }

    // Extract session type information from booking data
    const { id: bookingId, sessionTypeId, startTime, endTime, builderId, timeZone = 'UTC' } = bookingData;

    // Get the session type from the database
    const sessionType = await getSessionTypeById(sessionTypeId);
    if (!sessionType) {
      logger.warn('Session type not found', { ...logContext, sessionTypeId });
      return NextResponse.json(
        {
          success: false,
          message: 'Session type not found',
          error: {
            type: 'RESOURCE_ERROR',
            detail: `No session type found with ID: ${sessionTypeId}`
          }
        },
        { status: 404 }
      );
    }

    // Create a checkout session using the centralized utility
    const result = await createBookingCheckoutSession({
      builderId,
      builderName: sessionType.builderName || 'Builder', // Fallback if name not in session type
      sessionType: sessionType.title,
      sessionPrice: sessionType.price,
      startTime,
      endTime,
      timeZone: timeZone,
      userId: auth.userId,
      userEmail: auth.user?.emailAddresses?.[0]?.emailAddress || '',
      userName: auth.user?.firstName ? `${auth.user.firstName} ${auth.user.lastName || ''}`.trim() : null,
      successUrl: `${returnUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${returnUrl}/cancel`,
      currency: sessionType.currency || 'usd',
      bookingId: bookingId
    });

    // Handle the result
    if (!result.success) {
      logger.error('Failed to create checkout session', {
        ...logContext,
        error: result.error,
        message: result.message
      });

      return NextResponse.json(
        result,
        { status: result.error?.type === StripeErrorType.AUTHENTICATION ? 401 : 500 }
      );
    }

    // Return the successful result
    return NextResponse.json({
      success: true,
      message: 'Checkout session created successfully',
      sessionId: result.data?.id,
      url: result.data?.url
    });
  } catch (error) {
    logger.error('Unexpected error in checkout route', {
      userId: auth?.userId,
      error: error.message || 'Unknown error'
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating checkout session',
        error: {
          type: 'INTERNAL_ERROR',
          detail: 'An unexpected error occurred while processing your request'
        }
      },
      { status: 500 }
    );
  }
}
