/**
 * Stripe Session API Route
 * 
 * This route handles retrieving details about a specific Stripe checkout session.
 * It validates the request, ensures proper authentication, and returns session details.
 * 
 * Version: 1.0.0
 */

import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/api-auth';
import { getCheckoutSessionStatus } from '@/lib/stripe/actions';
import { logger } from '@/lib/logger';

/**
 * GET handler for retrieving Stripe checkout session details
 */
export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: { id: string } }) => {
  try {
    // Get session ID from route params
    const sessionId = params.id;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get session details using server action
    const result = await getCheckoutSessionStatus(sessionId);
    
    if (!result.success) {
      const statusCode = result.error?.type === 'not_found' ? 404 :
        result.error?.type === 'authorization_error' ? 403 :
        result.error?.type === 'authentication_error' ? 401 :
        500;
      
      return NextResponse.json(
        { error: result.message, details: result.error },
        { status: statusCode }
      );
    }
    
    // Return success response with session details
    return NextResponse.json({
      status: result.data?.status,
      paymentStatus: result.data?.paymentStatus,
      bookingId: result.data?.bookingId
    });
  } catch (error: any) {
    logger.error('Error in session API route', { error });
    
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session details' },
      { status: 500 }
    );
  }
});