import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createBooking } from '@/lib/scheduling/state-machine';
import { withOptionalAuth } from '@/lib/auth';
import { UserRole } from '@/lib/auth/types';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

// Request schema for creating anonymous bookings
const CreateBookingSchema = z.object({
  builderId: z.string().min(1),
  sessionTypeId: z.string().min(1),
  calendlyEventUri: z.string(),
  calendlyInviteeUri: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  customQuestionResponse: z.any().optional(),
  clientEmail: z.string().email().optional(),
  clientName: z.string().optional()
});

/**
 * Create a booking for anonymous users after Calendly event is scheduled
 * 
 * This endpoint creates a booking without requiring authentication.
 * It's called after the Calendly event has been created.
 */
export const POST = withOptionalAuth(async (
  req: NextRequest, 
  context: { params?: any }, 
  auth?
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const userId = auth?.userId;
  const userRoles = auth?.roles;

  try {
    // Parse request body
    const body = await req.json();
    const parseResult = CreateBookingSchema.safeParse(body);

    if (!parseResult.success) {
      logger.warn('Validation error for POST /create booking', { 
        userId: userId || 'anonymous',
        path,
        method,
        errors: parseResult.error.format()
      });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid request data',
        400,
        path,
        method,
        userId || 'anonymous'
      );
    }
      
    const data = parseResult.data;
      
    // Extract booking ID from custom question response if available
    const bookingIdFromCustomQuestion = data.customQuestionResponse?.find((q: any) => 
      q.question === 'Booking ID' || q.position === 0
    )?.answer;
      
    // Create booking with state machine
    const bookingContext = await createBooking({
      bookingId: bookingIdFromCustomQuestion, 
      builderId: data.builderId,
      clientId: userId || undefined, 
      sessionTypeId: data.sessionTypeId,
      calendlyEventUri: data.calendlyEventUri,
      calendlyInviteeUri: data.calendlyInviteeUri,
      startTime: data.startTime,
      endTime: data.endTime,
      customQuestionResponse: data.customQuestionResponse,
      // clientEmail: data.clientEmail,
      // clientName: data.clientName
    });
      
    logger.info('Booking created', {
      bookingId: bookingContext.bookingId,
      state: bookingContext.state,
      userId: userId || 'anonymous',
      isAuthenticated: !!userId,
      path,
      method
    });
      
    const response = NextResponse.json({
      success: true,
      bookingId: bookingContext.bookingId,
      state: bookingContext.state
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId || 'anonymous');
        
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error creating booking', {
      error: errorMessage,
      userId: userId || 'anonymous',
      path,
      method
    });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to create booking',
      500,
      path,
      method,
      userId || 'anonymous'
    );
  }
});