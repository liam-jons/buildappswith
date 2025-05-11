import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createBooking } from '@/lib/scheduling/state-machine';
import { getBookingState } from '@/lib/scheduling/state-machine';
import { getCurrentUser } from '@/lib/auth/api-auth';
import { z } from 'zod';

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
 */
export async function POST(req: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthorized user attempted to initialize booking');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    try {
      const data = InitializeBookingSchema.parse(body);
      
      // Use client ID from authenticated user if not provided
      const clientId = data.clientId || user.id;
      
      // Initialize booking with state machine
      const bookingContext = await createBooking({
        bookingId: data.bookingId,
        builderId: data.builderId,
        clientId,
        sessionTypeId: data.sessionTypeId,
        clientTimezone: data.clientTimezone
      });
      
      logger.info('Booking initialized with state machine', {
        bookingId: bookingContext.bookingId,
        state: bookingContext.state,
        userId: user.id
      });
      
      return NextResponse.json({
        success: true,
        bookingId: bookingContext.bookingId,
        state: bookingContext.state
      });
      
    } catch (validationError) {
      logger.error('Validation error when initializing booking', {
        error: validationError,
        userId: user.id
      });
      
      return NextResponse.json(
        { error: 'Invalid request data', details: validationError },
        { status: 400 }
      );
    }
    
  } catch (error) {
    logger.error('Error initializing booking', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Failed to initialize booking' },
      { status: 500 }
    );
  }
}