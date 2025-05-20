import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { transitionBooking, getBookingState } from '@/lib/scheduling/state-machine';
import { withAuth } from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import * as Sentry from '@sentry/nextjs';
import { BookingEventEnum } from '@/lib/scheduling/state-machine/types';
import { z } from 'zod';

// Request schema validation
const TransitionRequestSchema = z.object({
  event: z.nativeEnum(BookingEventEnum),
  data: z.record(z.any()).optional()
});

/**
 * Transition a booking state
 * 
 * This endpoint transitions a booking to a new state based on an event.
 */
export const POST = withAuth(async (
  req: NextRequest,
  context: { params?: { bookingId?: string } }, 
  auth: AuthObject
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const bookingId = context.params?.bookingId;

  try {
    if (!bookingId) {
      logger.warn('Missing bookingId for transition POST', { userId: auth.userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Booking ID is required',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    // Get current booking state to check permissions and for context
    const bookingContext = await getBookingState(bookingId);
    if (!bookingContext) {
      logger.warn('Booking not found for transition', { bookingId, userId: auth.userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Booking not found',
        404,
        path,
        method,
        auth.userId
      );
    }
    
    // Verify user has permission to update this booking
    const isAdmin = auth.roles.includes(UserRole.ADMIN);
    const isClientOfBooking = auth.userId === bookingContext.stateData.clientId;
    const isBuilderOfBooking = auth.userId === bookingContext.stateData.builderId;
    
    const hasPermission = isAdmin || isClientOfBooking || isBuilderOfBooking;
    
    if (!hasPermission) {
      logger.warn('User has no permission to transition booking', {
        bookingId,
        userId: auth.userId,
        userRoles: auth.roles,
        bookingClientId: bookingContext.stateData.clientId,
        bookingBuilderId: bookingContext.stateData.builderId,
        path,
        method
      });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Permission denied to transition this booking',
        403,
        path,
        method,
        auth.userId
      );
    }
    
    // Parse request body
    const body = await req.json();
    const parseResult = TransitionRequestSchema.safeParse(body);

    if (!parseResult.success) {
      logger.warn('Invalid request body for transition POST', { userId: auth.userId, bookingId, path, method, errors: parseResult.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid request data',
        400,
        path,
        method,
        auth.userId
      );
    }
      
    const { event, data } = parseResult.data;
      
    // Execute the state transition
    const transitionResult = await transitionBooking(bookingId, event, data);
      
    logger.info('Booking state transitioned', {
      bookingId,
      previousState: transitionResult.previousState,
      currentState: transitionResult.currentState,
      event,
      userId: auth.userId,
      path,
      method
    });
      
    const response = NextResponse.json({
      success: transitionResult.success,
      previousState: transitionResult.previousState,
      currentState: transitionResult.currentState,
      timestamp: transitionResult.timestamp,
      event: transitionResult.event
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);
        
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error transitioning booking', {
      error: errorMessage,
      bookingId: context.params?.bookingId, 
      userId: auth.userId,
      path,
      method
    });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to transition booking',
      500,
      path,
      method,
      auth.userId
    );
  }
});