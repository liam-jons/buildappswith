import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@clerk/nextjs/api';
import { createBooking, getAvailableTimeSlots } from '@/lib/scheduling/real-data/scheduling-service';
import * as Sentry from '@sentry/nextjs';
import { parseISO, isWithinInterval } from 'date-fns';

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
 * Helper function to handle service errors with appropriate responses
 */
function handleServiceError(error: any, defaultMessage: string): NextResponse {
  console.error(defaultMessage, error);
  Sentry.captureException(error);
  
  // Extract readable error message if available
  const errorMessage = error.message || defaultMessage;
  
  return NextResponse.json(
    { error: errorMessage }, 
    { status: 500 }
  );
}

/**
 * POST handler for creating a new booking
 */
export const POST = withAuth(async (request: NextRequest, auth: any) => {
  try {
    // Check if user is authenticated
    if (!auth.userId) {
      return NextResponse.json(
        { error: 'You must be signed in to book a session' }, 
        { status: 401 }
      );
    }
    
    // Parse and validate the request body
    const body = await request.json();
    const result = createBookingSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const bookingData = result.data;
    
    // Verify that the requesting user is the client
    if (auth.userId !== bookingData.clientId) {
      return NextResponse.json(
        { error: 'Not authorized to create bookings for other users' }, 
        { status: 403 }
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
      return NextResponse.json(
        { error: 'The selected time slot is not available' }, 
        { status: 400 }
      );
    }
    
    // Create the booking
    const booking = await createBooking(bookingData);
    
    return NextResponse.json({ booking });
    
  } catch (error) {
    return handleServiceError(error, 'Error creating booking');
  }
});

/**
 * GET handler for fetching bookings
 */
export const GET = withAuth(async (request: NextRequest, auth: any) => {
  try {
    // Check if user is authenticated
    if (!auth.userId) {
      return NextResponse.json(
        { error: 'You must be signed in to view bookings' }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const builderId = searchParams.get('builderId');
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status') as any;
    
    // Either builderId or clientId must be provided
    if (!builderId && !clientId) {
      return NextResponse.json(
        { error: 'Either builderId or clientId is required' }, 
        { status: 400 }
      );
    }
    
    // Ensure the user can only access their own bookings
    // A user can see bookings where they are either the builder or the client
    const isAuthorized = (
      (builderId && auth.userId === builderId) || 
      (clientId && auth.userId === clientId)
    );
    
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'You are not authorized to view these bookings' }, 
        { status: 403 }
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
    
    return NextResponse.json({ bookings });
    
  } catch (error) {
    return handleServiceError(error, 'Error fetching bookings');
  }
});