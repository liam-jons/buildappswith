import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailableTimeSlots } from '@/lib/scheduling/real-data/scheduling-service';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  sessionTypeId: z.string().optional(),
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
 * GET handler for fetching available time slots for a builder
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate parameters
    const result = querySchema.safeParse(rawParams);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const { builderId, startDate, endDate, sessionTypeId } = result.data;
    
    // Validate that startDate is before endDate
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' }, 
        { status: 400 }
      );
    }
    
    // Validate date range is not too large (e.g., max 3 months)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    if (daysDifference > 90) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 90 days' }, 
        { status: 400 }
      );
    }
    
    // Fetch available time slots
    const timeSlots = await getAvailableTimeSlots(builderId, startDate, endDate, sessionTypeId);
    
    return NextResponse.json({ timeSlots });
    
  } catch (error) {
    return handleServiceError(error, 'Error in time slots GET endpoint');
  }
}
