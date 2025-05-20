import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, withClient } from '@/lib/auth';
import { createBooking, getAvailableTimeSlots, getUserBookings } from '@/lib/scheduling/real-data/scheduling-service';
import * as Sentry from '@sentry/nextjs';
import { parseISO } from 'date-fns';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';
import { UserRole, AuthObject } from '@/lib/auth/types';
import { BookingStatus } from '@/lib/scheduling/types';

// Schema for booking creation
const createBookingSchema = z.object({
  sessionTypeId: z.string(),
  builderId: z.string(),
  clientId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed']).optional(),
  paymentId: z.string().optional(),
  checkoutSessionId: z.string().optional(),
  clientTimezone: z.string(),
  builderTimezone: z.string(),
  notes: z.string().optional(),
});

/**
 * POST handler for creating a new booking
 * Updated to use Express SDK with client role check
 */
export const POST = withClient(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Booking creation request received', {
      path,
      method,
      userId: auth.userId
    });
    
    // Parse and validate the request body
    const body = await req.json();
    const result = createBookingSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid booking data received', {
        path,
        method,
        userId: auth.userId,
        validationErrors: result.error.format()
      });
      
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid booking data',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    const bookingData = result.data;
    
    // Verify that the requesting user is the client
    if (auth.userId !== bookingData.clientId) {
      logger.warn('User attempted to create booking for another user', {
        path,
        method,
        userId: auth.userId,
        requestedClientId: bookingData.clientId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to create bookings for other users',
        403,
        path,
        method,
        auth.userId
      );
    }
    
    // Verify that the time slot is actually available
    // Extract just the date portion for the date range
    const startDate = bookingData.startTime.split('T')[0];
    const endDate = bookingData.endTime.split('T')[0];
    
    // Get available time slots for the date range
    const availableSlots = await getAvailableTimeSlots(
      bookingData.builderId,
      startDate,
      endDate,
      bookingData.sessionTypeId
    );
    
    // Check if the requested time slot exists and is available
    const requestedStart = parseISO(bookingData.startTime);
    const requestedEnd = parseISO(bookingData.endTime);
    
    const isSlotAvailable = availableSlots.some(slot => {
      const slotStart = parseISO(slot.startTime);
      const slotEnd = parseISO(slot.endTime);
      
      return (
        // Exact match on start and end times
        (slotStart.getTime() === requestedStart.getTime() && 
         slotEnd.getTime() === requestedEnd.getTime() &&
         !slot.isBooked)
      );
    });
    
    if (!isSlotAvailable) {
      logger.warn('Requested time slot not available', {
        path,
        method,
        userId: auth.userId,
        builderId: bookingData.builderId,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      });
      
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'The selected time slot is not available',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    // Create the booking
    const booking = await createBooking(bookingData);
    
    logger.info('Booking created successfully', {
      path,
      method,
      userId: auth.userId,
      bookingId: booking.id,
      builderId: bookingData.builderId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      data: { booking }
    });

    // Add performance metrics to the response
    return addAuthPerformanceMetrics(
      response, 
      startTime, 
      true, 
      path, 
      method, 
      auth.userId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Error creating booking', {
      error: errorMessage,
      path,
      method,
      userId: auth.userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Error creating booking',
      500,
      path,
      method,
      auth.userId
    );
  }
});

/**
 * GET handler for fetching bookings
 * Updated to use Express SDK with user authentication 
 */
export const GET = withAuth(async (req: NextRequest, context: { params?: any }, auth: AuthObject) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Bookings fetch request received', {
      path,
      method,
      userId: auth.userId
    });
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const builderId = searchParams.get('builderId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status') as BookingStatus | null;
    const upcoming = searchParams.get('upcoming'); // if true, get future bookings

    let bookings;

    // TODO: Implement more robust role-based access control for fetching bookings
    // For now, if a specific builderId or clientId is provided, use it.
    // Otherwise, default to fetching bookings related to the authenticated user.

    if (builderId) {
      // Potentially add a check here: if userRoles.includes(UserRole.BUILDER) && userId === builderProfile.userId for this builderId
      bookings = await getUserBookings(builderId, 'builder'); 
    } else if (clientId) {
      // Ensure the authenticated user is requesting their own client bookings or is an admin/relevant builder
      if (auth.userId !== clientId && !auth.roles.includes(UserRole.ADMIN)) {
        // Potentially allow if user is a builder associated with this client's bookings
        logger.warn('User attempted to fetch bookings for another client without sufficient permissions', {
            path, method, userId: auth.userId, requestedClientId: clientId
        });
        return createAuthErrorResponse(AuthErrorType.AUTHORIZATION, 'Not authorized to fetch these bookings', 403, path, method, auth.userId);
      }
      bookings = await getUserBookings(clientId, 'client');
    } else {
      // Default: if no specific ID, fetch based on user's primary role or all if admin.
      // This part needs more clarification on desired behavior. For now, let's assume fetching client bookings for the user.
      // A more robust solution would check userRoles and fetch builder bookings if applicable.
      bookings = await getUserBookings(auth.userId, 'client'); 
    }

    // Apply status filter if provided
    if (status && bookings) {
      bookings = bookings.filter(b => b.status === status);
    }

    // Apply upcoming filter if provided
    if (upcoming === 'true' && bookings) {
      const now = new Date();
      bookings = bookings.filter(b => b.startTime && parseISO(b.startTime) > now);
    }
    
    logger.info('Bookings fetched successfully', {
      path,
      method,
      userId: auth.userId,
      count: bookings?.length,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    const response = NextResponse.json({ success: true, data: { bookings: bookings || [] } });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, auth.userId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error fetching bookings', {
      error: errorMessage,
      path,
      method,
      userId: auth.userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Error fetching bookings',
      500,
      path,
      method,
      auth.userId
    );
  }
});