/**
 * API route for retrieving Stripe session information
 * @version 1.0.111
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe-server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs';

// Define response type for consistent error handling
type ApiResponse = {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
};

/**
 * GET handler for retrieving Stripe session information
 * Used for checking payment status on the client side
 */
export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const { userId } = auth();
    if (!userId) {
      logger.warn('Unauthenticated session retrieval attempt', { 
        sessionId: params.id 
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required', 
          error: 'UNAUTHORIZED' 
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Validate session ID
    const sessionId = params.id;
    if (!sessionId) {
      logger.warn('Missing session ID in request', { userId });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing session ID', 
          error: 'INVALID_REQUEST' 
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });

    // Verify user ownership of the session
    const booking = await prisma.booking.findFirst({
      where: { 
        stripeSessionId: sessionId 
      },
    });

    if (booking && booking.clientId !== userId) {
      logger.warn('User attempted to access session they do not own', { 
        userId, 
        sessionId,
        bookingClientId: booking.clientId
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'You do not have permission to view this session', 
          error: 'FORBIDDEN' 
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Extract relevant session data for the client
    const sessionData = {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerDetails: session.customer_details,
      paymentIntent: session.payment_intent 
        ? {
            id: session.payment_intent.id,
            status: session.payment_intent.status,
            amount: session.payment_intent.amount,
            created: session.payment_intent.created,
          }
        : null,
      metadata: session.metadata,
      expiresAt: session.expires_at,
    };

    logger.info('Session data retrieved successfully', { 
      userId, 
      sessionId,
      sessionStatus: session.status 
    });

    return NextResponse.json({
      success: true,
      message: 'Session retrieved successfully',
      data: sessionData,
    } as ApiResponse);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for Stripe-specific errors
    if (errorMessage.includes('No such checkout.session')) {
      logger.warn('Attempt to access non-existent session', {
        sessionId: params.id,
        error: errorMessage,
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Session not found', 
          error: 'NOT_FOUND' 
        } as ApiResponse,
        { status: 404 }
      );
    }
    
    // Log detailed error information
    logger.error('Error retrieving session', { 
      sessionId: params.id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return a structured error response
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error retrieving session', 
        error: errorMessage
      } as ApiResponse,
      { status: 500 }
    );
  }
}
