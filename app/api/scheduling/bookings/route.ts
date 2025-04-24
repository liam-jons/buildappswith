import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBuilderBookings, getClientBookings, createBooking } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string().optional(),
  clientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

// Validation schema for booking creation
const createBookingSchema = z.object({
  sessionTypeId: z.string(),
  builderId: z.string(),
  clientId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
  clientTimezone: z.string(),
  builderTimezone: z.string(),
});

/**
 * GET handler for fetching bookings
 * Can filter by builderId, clientId, date range, and status
 * Version: 1.0.59
 */
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate parameters
    const result = querySchema.safeParse(rawParams);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    const { builderId, clientId, startDate, endDate, status } = result.data;
    
    // Must provide either builderId or clientId
    if (!builderId && !clientId) {
      return NextResponse.json(
        { error: 'Either builderId or clientId must be provided' }, 
        { status: 400 }
      );
    }
    
    // Using the authenticated user from withAuth middleware
    // No need to check authentication as withAuth already handles it
    
    // Fetch bookings based on provided parameters
    let bookings;
    
    if (builderId) {
      bookings = await getBuilderBookings(builderId, startDate, endDate, status);
    } else if (clientId) {
      bookings = await getClientBookings(clientId, startDate, endDate, status);
    }
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error in bookings endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' }, 
      { status: 500 }
    );
  }
});

/**
 * POST handler for creating a new booking
 * Version: 1.0.59
 */
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Using the authenticated user from withAuth middleware
    // No need to check authentication as withAuth already handles it
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = createBookingSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    // Create the booking
    const bookingData = {
      ...result.data,
      status: 'pending' as const,
      paymentStatus: 'unpaid' as const,
    };
    
    const booking = await createBooking(bookingData);
    
    return NextResponse.json(
      { booking }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to create booking' }, 
      { status: 500 }
    );
  }
});