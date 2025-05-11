import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { transitionBooking, getBookingState } from '@/lib/scheduling/state-machine';
import { getCurrentUser } from '@/lib/auth/api-auth';
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
export async function POST(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const { bookingId } = params;
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }
    
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      logger.warn('Unauthorized user attempted to transition booking', { bookingId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get current booking state
    const bookingContext = await getBookingState(bookingId);
    if (!bookingContext) {
      logger.error('Booking not found for transition', { bookingId });
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    // Verify user has permission to update this booking
    // In a real application, you would check if the user is the client, builder,
    // or has admin permissions
    const hasPermission = true; // Simplified for now
    
    if (!hasPermission) {
      logger.warn('User has no permission to transition booking', {
        bookingId,
        userId: user.id
      });
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }
    
    // Parse request body
    const body = await req.json();
    
    try {
      const { event, data } = TransitionRequestSchema.parse(body);
      
      // Execute the state transition
      const transitionResult = await transitionBooking(bookingId, event, data);
      
      logger.info('Booking state transitioned', {
        bookingId,
        previousState: transitionResult.previousState,
        currentState: transitionResult.currentState,
        event,
        userId: user.id
      });
      
      return NextResponse.json({
        success: transitionResult.success,
        previousState: transitionResult.previousState,
        currentState: transitionResult.currentState,
        timestamp: transitionResult.timestamp,
        event: transitionResult.event
      });
      
    } catch (validationError) {
      logger.error('Validation error when transitioning booking', {
        error: validationError,
        bookingId,
        userId: user.id
      });
      
      return NextResponse.json(
        { error: 'Invalid request data', details: validationError },
        { status: 400 }
      );
    }
    
  } catch (error) {
    logger.error('Error transitioning booking', {
      error: error instanceof Error ? error.message : String(error),
      bookingId: params.bookingId
    });
    
    return NextResponse.json(
      { error: 'Failed to transition booking' },
      { status: 500 }
    );
  }
}