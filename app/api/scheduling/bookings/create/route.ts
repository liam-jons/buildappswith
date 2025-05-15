import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createBooking } from '@/lib/scheduling/state-machine';
import { getCurrentUser } from '@/lib/auth/api-auth';
import { z } from 'zod';

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
export async function POST(req: NextRequest) {
  try {
    // Get current user if authenticated (optional)
    const user = await getCurrentUser();
    
    // Parse request body
    const body = await req.json();
    
    try {
      const data = CreateBookingSchema.parse(body);
      
      // Extract booking ID from custom question response if available
      const bookingId = data.customQuestionResponse?.find((q: any) => 
        q.question === 'Booking ID' || q.position === 0
      )?.answer;
      
      // Create booking with state machine
      const bookingContext = await createBooking({
        bookingId: bookingId,
        builderId: data.builderId,
        clientId: user?.id || undefined,
        sessionTypeId: data.sessionTypeId,
        calendlyEventUri: data.calendlyEventUri,
        calendlyInviteeUri: data.calendlyInviteeUri,
        startTime: data.startTime,
        endTime: data.endTime,
        customQuestionResponse: data.customQuestionResponse
      });
      
      logger.info('Booking created for anonymous user', {
        bookingId: bookingContext.bookingId,
        state: bookingContext.state,
        userId: user?.id || 'anonymous',
        isAuthenticated: !!user
      });
      
      return NextResponse.json({
        success: true,
        bookingId: bookingContext.bookingId,
        state: bookingContext.state
      });
      
    } catch (validationError) {
      logger.error('Validation error when creating anonymous booking', {
        error: validationError,
        userId: user?.id || 'anonymous'
      });
      
      return NextResponse.json(
        { error: 'Invalid request data', details: validationError },
        { status: 400 }
      );
    }
    
  } catch (error) {
    logger.error('Error creating anonymous booking', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}