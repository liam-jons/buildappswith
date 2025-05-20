import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createBooking } from '@/lib/scheduling/state-machine';
import { withOptionalAuth } from '@/lib/auth';
import { UserRole } from '@/lib/auth/types';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

// Request schema validation
const InitializeBookingSchema = z.object({
  bookingId: z.string().uuid().optional(),
  builderId: z.string().min(1),
  sessionTypeId: z.string().min(1),
  clientId: z.string().optional(),
  clientTimezone: z.string().optional()
});

/**
 * Initialize a booking with the state machine
 * 
 * This endpoint creates a new booking and initializes the state machine.
 * Supports both authenticated and unauthenticated users.
 */
export const POST = withOptionalAuth(async (
  req: NextRequest, 
  context: { params?: any }, 
  userId?: string, 
  userRoles?: UserRole[]
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const userLogId = userId || 'anonymous';

  try {
    // Parse request body
    const body = await req.json();
    const parseResult = InitializeBookingSchema.safeParse(body);

    if (!parseResult.success) {
      logger.warn('Validation error for POST /initialize booking', { 
        userId: userLogId,
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
        userLogId
      );
    }
      
    const data = parseResult.data;
      
    // Determine clientId: request body > authenticated user > undefined (for truly anonymous)
    const effectiveClientId = data.clientId || userId;
      
    // Initialize booking with state machine
    const bookingContext = await createBooking({
      bookingId: data.bookingId,
      builderId: data.builderId,
      clientId: effectiveClientId, 
      sessionTypeId: data.sessionTypeId
    });
      
    logger.info('Booking initialized with state machine', {
      bookingId: bookingContext.bookingId,
      state: bookingContext.state,
      userId: userLogId,
      isAuthenticated: !!userId,
      path,
      method
    });
      
    const response = NextResponse.json({
      success: true,
      bookingId: bookingContext.bookingId,
      state: bookingContext.state
    });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userLogId);
        
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error initializing booking', {
      error: errorMessage,
      userId: userLogId,
      path,
      method
    });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to initialize booking',
      500,
      path,
      method,
      userLogId
    );
  }
});