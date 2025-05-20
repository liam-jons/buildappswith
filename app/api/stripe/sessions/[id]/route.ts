/**
 * Stripe Session API Route
 * 
 * This route handles retrieving details about a specific Stripe checkout session.
 * It validates the request, ensures proper authentication, and returns session details.
 * 
 * Version: 1.0.1 (Auth Refactor)
 */

import { NextResponse, NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth'; 
import { UserRole, AuthObject } from '@/lib/auth/types'; 
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors'; 
import { getCheckoutSessionStatus } from '@/lib/stripe/actions';
import { logger } from '@/lib/logger';

/**
 * GET handler for retrieving Stripe checkout session details
 */
export const GET = withAuth(async (
  request: NextRequest, 
  routeContext: { params: { id: string } }, 
  auth: AuthObject 
) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    const sessionId = routeContext.params.id;
    
    if (!sessionId) {
      logger.warn('Session ID missing for session detail retrieval', { path, method, userId: auth.userId });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Session ID is required',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    const result = await getCheckoutSessionStatus(sessionId);
    
    if (!result.success) {
      const statusCode = result.error?.type === 'not_found' ? 404 :
        result.error?.type === 'authorization_error' ? 403 :
        result.error?.type === 'authentication_error' ? 401 :
        500;
      
      logger.warn('Failed to retrieve session status', { 
        path, method, userId: auth.userId, sessionId, 
        errorType: result.error?.type, errorMessage: result.message 
      });
      return createAuthErrorResponse(
        result.error?.type || AuthErrorType.SERVER,
        result.message || 'Failed to retrieve session status',
        statusCode,
        path,
        method,
        auth.userId
      );
    }
    
    logger.info('Successfully retrieved session status', { path, method, userId: auth.userId, sessionId });
    const responseData = {
      status: result.data?.status,
      paymentStatus: result.data?.paymentStatus,
      bookingId: result.data?.bookingId,
      // Potentially add more fields from result.data if needed by client
    };

    const response = NextResponse.json({ success: true, data: responseData });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error retrieving session details';
    logger.error('Error in Stripe session API route', { path, method, userId: auth.userId, error: errorMessage });
    // Sentry.captureException(error); // Consider if Sentry is needed here
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      errorMessage,
      500,
      path,
      method,
      auth.userId
    );
  }
});