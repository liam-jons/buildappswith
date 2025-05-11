import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { recoverBookingWithToken } from '@/lib/scheduling/state-machine/error-handling';
import { BookingStateEnum } from '@/lib/scheduling/state-machine/types';

// Request schema validation
const RecoveryRequestSchema = z.object({
  token: z.string().min(1),
  targetState: z.nativeEnum(BookingStateEnum).optional()
});

/**
 * Recover a booking from an error state
 * 
 * This endpoint recovers a booking using a token generated during error handling.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    try {
      const { token, targetState } = RecoveryRequestSchema.parse(body);
      
      logger.info('Recovering booking with token', { 
        tokenPreview: token.substring(0, 20) + '...',
        targetState
      });
      
      // Attempt to recover the booking
      const result = await recoverBookingWithToken(token, targetState);
      
      if (!result.success) {
        logger.warn('Failed to recover booking', { 
          tokenPreview: token.substring(0, 20) + '...'
        });
        
        return NextResponse.json(
          { success: false, error: 'Failed to recover booking' },
          { status: 400 }
        );
      }
      
      logger.info('Successfully recovered booking', {
        bookingId: result.bookingId,
        targetState,
        currentState: result.transitionResult?.currentState
      });
      
      return NextResponse.json({
        success: true,
        bookingId: result.bookingId,
        state: result.transitionResult?.currentState
      });
      
    } catch (validationError) {
      logger.error('Validation error when recovering booking', {
        error: validationError
      });
      
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    logger.error('Error recovering booking', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to recover booking' },
      { status: 500 }
    );
  }
}