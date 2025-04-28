import { NextRequest, NextResponse } from 'next/server';
import { stripe, getCheckoutSession, StripeErrorType } from '@/lib/stripe/stripe-server';
import { withAuth } from '@clerk/nextjs/api';
import { logger } from '@/lib/logger';
import { getBookingById } from '@/lib/scheduling/real-data/scheduling-service';

/**
 * GET handler for retrieving a Stripe session with associated booking
 * 
 * Uses Next.js 15 promise-based params and Clerk authentication
 * to ensure only authorized users can access the session details
 * 
 * @param request - The incoming request object
 * @param context - Context containing the session ID parameter
 * @param auth - Authentication object from Clerk
 * @returns NextResponse with session details or error
 */
export const GET = withAuth(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
  auth: any
) => {
  // Await the params to get the id
  const params = await context.params;
  const sessionId = params.id;
  const logContext = { sessionId, userId: auth?.userId };

  // Check authentication
  if (!auth.userId) {
    logger.warn('Unauthorized access attempt to session details', logContext);
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication required',
        error: {
          type: 'AUTHENTICATION_ERROR',
          detail: 'You must be signed in to view session details'
        }
      },
      { status: 401 }
    );
  }

  if (!sessionId) {
    logger.warn('Missing session ID in request', logContext);
    return NextResponse.json(
      {
        success: false,
        message: 'Session ID is required',
        error: {
          type: 'VALIDATION_ERROR',
          detail: 'No session ID provided in URL'
        }
      },
      { status: 400 }
    );
  }

  try {
    // Use the centralized utility to get the session
    const result = await getCheckoutSession(sessionId);

    if (!result.success) {
      logger.error('Failed to retrieve checkout session', {
        ...logContext,
        error: result.error
      });

      // Map error types to appropriate HTTP status codes
      let statusCode = 500;
      if (result.error?.type === StripeErrorType.INVALID_REQUEST) {
        statusCode = 404;
      } else if (result.error?.type === StripeErrorType.AUTHENTICATION) {
        statusCode = 401;
      }

      return NextResponse.json(result, { status: statusCode });
    }

    const session = result.data;
    
    // Extract booking ID from metadata
    const bookingId = session.metadata?.bookingId;
    let booking = null;
    
    // Fetch booking details if available
    if (bookingId) {
      try {
        booking = await getBookingById(bookingId);
        
        // Check authorization - users should only see their own bookings
        // unless they are the builder or an admin
        if (booking && booking.clientId !== auth.userId && booking.builderId !== auth.userId) {
          // Check if user has admin role (would need to expand clerk data or check a database flag)
          const isAdmin = false; // Replace with actual admin check
          
          if (!isAdmin) {
            logger.warn('Unauthorized access attempt to another user\'s booking', {
              ...logContext,
              bookingId,
              bookingClientId: booking.clientId,
              bookingBuilderId: booking.builderId
            });
            
            return NextResponse.json(
              {
                success: false,
                message: 'Not authorized',
                error: {
                  type: 'AUTHORIZATION_ERROR',
                  detail: 'You are not authorized to view this booking'
                }
              },
              { status: 403 }
            );
          }
        }
      } catch (dbError) {
        logger.error('Error fetching booking details', {
          ...logContext,
          bookingId,
          error: dbError.message
        });
        // Continue without booking details but log the error
      }
    }

    // Construct the response with booking details if available
    return NextResponse.json({
      success: true,
      message: 'Session retrieved successfully',
      id: session.id,
      status: session.status,
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      paymentAmount: session.amount_total,
      currency: session.currency,
      booking: booking || {
        // Fallback if booking not found in database
        id: bookingId,
        sessionType: session.metadata?.sessionType || 'Unknown Session Type',
        startTime: session.metadata?.startTime,
        endTime: session.metadata?.endTime,
        builderId: session.metadata?.builderId,
        clientId: session.metadata?.userId || auth.userId,
        status: 'pending' // Default status if real status unknown
      },
    });
  } catch (error: any) {
    logger.error('Unexpected error retrieving session details', {
      ...logContext,
      error: error.message || 'Unknown error'
    });
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error retrieving session details',
        error: {
          type: 'INTERNAL_ERROR',
          detail: 'An unexpected error occurred while retrieving session details'
        }
      },
      { status: 500 }
    );
  }
});