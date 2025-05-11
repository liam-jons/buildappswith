import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, withClient } from '@/lib/auth/express/api-auth';
import { createBooking, getAvailableTimeSlots } from '@/lib/scheduling/real-data/scheduling-service';
import * as Sentry from '@sentry/nextjs';
import { parseISO } from 'date-fns';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/express/errors';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

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
export const POST = withClient(async (req: NextRequest, userId: string, roles: UserRole[]) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Booking creation request received', {
      path,
      method,
      userId
    });
    
    // Parse and validate the request body
    const body = await req.json();
    const result = createBookingSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid booking data received', {
        path,
        method,
        userId,
        validationErrors: result.error.format()
      });
      
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Invalid booking data',
        400,
        path,
        method,
        userId
      );
    }
    
    const bookingData = result.data;
    
    // Verify that the requesting user is the client
    if (userId !== bookingData.clientId) {
      logger.warn('User attempted to create booking for another user', {
        path,
        method,
        userId,
        requestedClientId: bookingData.clientId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to create bookings for other users',
        403,
        path,
        method,
        userId
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
        userId,
        builderId: bookingData.builderId,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      });
      
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'The selected time slot is not available',
        400,
        path,
        method,
        userId
      );
    }
    
    // Create the booking
    const booking = await createBooking(bookingData);
    
    logger.info('Booking created successfully', {
      path,
      method,
      userId,
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
      userId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Error creating booking', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Error creating booking',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * GET handler for fetching bookings
 * Updated to use Express SDK with user authentication 
 */
export const GET = withAuth(async (req: NextRequest, userId: string) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;

  try {
    logger.info('Bookings fetch request received', {
      path,
      method,
      userId
    });
    
    const { searchParams } = new URL(req.url);
    const builderId = searchParams.get('builderId');
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    
    // Either builderId or clientId must be provided
    if (!builderId && !clientId) {
      logger.warn('Missing required parameters for booking fetch', {
        path,
        method,
        userId
      });
      
      return createAuthErrorResponse(
        'VALIDATION_ERROR',
        'Either builderId or clientId is required',
        400,
        path,
        method,
        userId
      );
    }
    
    // Ensure the user can only access their own bookings
    // A user can see bookings where they are either the builder or the client
    const isAuthorized = (
      (builderId && userId === builderId) || 
      (clientId && userId === clientId)
    );
    
    if (!isAuthorized) {
      logger.warn('Unauthorized booking access attempt', {
        path,
        method,
        userId,
        requestedBuilderId: builderId,
        requestedClientId: clientId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'You are not authorized to view these bookings',
        403,
        path,
        method,
        userId
      );
    }
    
    // Call the appropriate service function based on the parameters
    let bookings;
    if (builderId) {
      // Import only when needed to prevent circular dependency
      const { getBuilderBookings } = require('@/lib/scheduling/real-data/scheduling-service');
      bookings = await getBuilderBookings(builderId, startDate || undefined, endDate || undefined, status || undefined);
    } else {
      // Import only when needed to prevent circular dependency
      const { getClientBookings } = require('@/lib/scheduling/real-data/scheduling-service');
      bookings = await getClientBookings(clientId!, startDate || undefined, endDate || undefined, status || undefined);
    }
    
    logger.info('Bookings retrieved successfully', {
      path,
      method,
      userId,
      count: bookings.length,
      builderId: builderId || undefined,
      clientId: clientId || undefined,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });

    // Create response with standardized format
    const response = NextResponse.json({
      success: true,
      data: { bookings }
    });

    // Add performance metrics to the response
    return addAuthPerformanceMetrics(
      response, 
      startTime, 
      true, 
      path, 
      method, 
      userId
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Error fetching bookings', {
      error: errorMessage,
      path,
      method,
      userId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Error fetching bookings',
      500,
      path,
      method,
      userId
    );
  }
});