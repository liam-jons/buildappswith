import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBookingById, updateBookingStatus, updateBookingPayment } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth';
import { UserRole, AuthObject } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';
import { addAuthPerformanceMetrics, AuthErrorType, createAuthErrorResponse } from '@/lib/auth/adapters/clerk-express/errors';
import { BookingStatus, PaymentStatus } from '@prisma/client';

// Validation schema for updating booking status
const updateStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus)
});

// Validation schema for updating payment status
const updatePaymentSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus),
  paymentId: z.string().optional()
});

/**
 * GET handler for fetching a specific booking by ID
 * Updated to use Express SDK with role-based authentication
 */
export const GET = withAuth(async (
  req: NextRequest,
  context: { params?: { bookingId?: string } },
  auth: AuthObject
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const bookingId = context.params?.bookingId;

  try {
    logger.info('Booking fetch request received', {
      path,
      method,
      userId: auth.userId,
      bookingId
    });

    if (!bookingId) {
      logger.warn('Missing bookingId in GET request', { path, method, userId: auth.userId });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Booking ID is required in the path.',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    // Fetch the booking
    const booking = await getBookingById(bookingId);
    
    if (!booking) {
      logger.warn('Booking not found', {
        path,
        method,
        userId: auth.userId,
        bookingId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Booking not found',
        404,
        path,
        method,
        auth.userId
      );
    }
    
    // Authorization check - only allow access to own bookings
    // unless the user is an admin
    const isAdminUser = Array.isArray(auth.roles) && auth.roles.includes(UserRole.ADMIN);
    const isBuilder = auth.userId === booking.builderId;
    const isClient = auth.userId === booking.clientId;
    
    if (!isAdminUser && !isBuilder && !isClient) {
      logger.warn('Unauthorized booking access attempt', {
        path,
        method,
        userId: auth.userId,
        bookingId,
        builderId: booking.builderId,
        clientId: booking.clientId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to access this booking',
        403,
        path,
        method,
        auth.userId
      );
    }
    
    logger.info('Booking retrieved successfully', {
      path,
      method,
      userId: auth.userId,
      bookingId,
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
    
    logger.error('Error fetching booking', {
      error: errorMessage,
      path,
      method,
      userId: auth.userId,
      bookingId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch booking',
      500,
      path,
      method,
      auth.userId
    );
  }
});

/**
 * PATCH handler for updating a booking's status
 * Updated to use Express SDK with role-based authentication
 */
export const PATCH = withAuth(async (
  req: NextRequest,
  context: { params?: { bookingId?: string } },
  auth: AuthObject
) => {
  const startTime = performance.now();
  const path = req.nextUrl.pathname;
  const method = req.method;
  const bookingId = context.params?.bookingId;

  try {
    logger.info('Booking update request received', {
      path,
      method,
      userId: auth.userId,
      bookingId
    });

    if (!bookingId) {
      logger.warn('Missing bookingId in PATCH request', { path, method, userId: auth.userId });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Booking ID is required in the path.',
        400,
        path,
        method,
        auth.userId
      );
    }
    
    // Fetch the booking first to check permissions
    const existingBooking = await getBookingById(bookingId);
    
    if (!existingBooking) {
      logger.warn('Booking not found for update', {
        path,
        method,
        userId: auth.userId,
        bookingId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Booking not found',
        404,
        path,
        method,
        auth.userId
      );
    }
        
    // Authorization check
    const isAdminUser = Array.isArray(auth.roles) && auth.roles.includes(UserRole.ADMIN);
    const isBuilder = auth.userId === existingBooking.builderId;
    const isClient = auth.userId === existingBooking.clientId;
    
    if (!isAdminUser && !isBuilder && !isClient) {
      logger.warn('Unauthorized booking update attempt', {
        path,
        method,
        userId: auth.userId,
        bookingId,
        builderId: existingBooking.builderId,
        clientId: existingBooking.clientId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to update this booking',
        403,
        path,
        method,
        auth.userId
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Determine if this is a status update or payment update
    if ('status' in body) {
      // Validate status update
      const result = updateStatusSchema.safeParse(body);
      if (!result.success) {
        logger.warn('Invalid booking status update data', {
          path,
          method,
          userId: auth.userId,
          bookingId,
          errors: result.error.format()
        });
        return createAuthErrorResponse(
          AuthErrorType.VALIDATION,
          'Invalid booking status data',
          400,
          path,
          method,
          auth.userId
        );
      }
      
      // Permission checks for status updates
      // Clients can cancel bookings, builders/admins can change to any valid status
      if (result.data.status === BookingStatus.CANCELLED && !isClient && !isBuilder && !isAdminUser) {
        logger.warn('Unauthorized attempt to cancel booking by non-participant/admin', {
            path, method, userId: auth.userId, bookingId, requestedStatus: result.data.status
        });
        return createAuthErrorResponse(AuthErrorType.AUTHORIZATION, 'Not authorized to cancel this booking', 403, path, method, auth.userId);
      } else if (result.data.status !== BookingStatus.CANCELLED && !isBuilder && !isAdminUser) {
        logger.warn('Unauthorized attempt to change booking status by non-builder/admin', {
            path, method, userId: auth.userId, bookingId, requestedStatus: result.data.status
        });
        return createAuthErrorResponse(AuthErrorType.AUTHORIZATION, 'Not authorized to change booking status', 403, path, method, auth.userId);
      }

      const updatedBooking = await updateBookingStatus(bookingId, result.data.status);
      
      logger.info('Booking status updated successfully', {
        path,
        method,
        userId: auth.userId,
        bookingId,
        newStatus: result.data.status,
        duration: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      // Create response with standardized format
      const response = NextResponse.json({
        success: true,
        data: { booking: updatedBooking }
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
    } else if ('paymentStatus' in body) {
      // Validate payment update
      const result = updatePaymentSchema.safeParse(body);
      
      if (!result.success) {
        logger.warn('Invalid booking payment data', {
          path,
          method,
          userId: auth.userId,
          bookingId,
          validationErrors: result.error.format()
        });
        
        return createAuthErrorResponse(
          AuthErrorType.VALIDATION,
          'Invalid payment data',
          400,
          path,
          method,
          auth.userId
        );
      }
      
      // Only admin or builder can update payment status
      if (!isAdminUser && !isBuilder) {
        logger.warn('Unauthorized booking payment update attempt', {
          path,
          method,
          userId: auth.userId,
          bookingId,
          builderId: existingBooking.builderId
        });
        
        return createAuthErrorResponse(
          AuthErrorType.AUTHORIZATION,
          'Not authorized to update payment status',
          403,
          path,
          method,
          auth.userId
        );
      }
      
      // Update the payment status
      const updatedBooking = await updateBookingPayment(
        bookingId, 
        result.data.paymentStatus,
        result.data.paymentId
      );
      
      logger.info('Booking payment status updated successfully', {
        path,
        method,
        userId: auth.userId,
        bookingId,
        newPaymentStatus: result.data.paymentStatus,
        duration: `${(performance.now() - startTime).toFixed(2)}ms`
      });

      // Create response with standardized format
      const response = NextResponse.json({
        success: true,
        data: { booking: updatedBooking }
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
    } else {
      logger.warn('Invalid booking update data', {
        path,
        method,
        userId: auth.userId,
        bookingId
      });
      
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid update data',
        400,
        path,
        method,
        auth.userId
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.error('Error updating booking', {
      error: errorMessage,
      path,
      method,
      userId: auth.userId,
      bookingId,
      duration: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    Sentry.captureException(error);
    
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to update booking',
      500,
      path,
      method,
      auth.userId
    );
  }
});