import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getAvailabilityExceptions,
  getAvailabilityExceptionById,
  createAvailabilityException,
  updateAvailabilityException,
  deleteAvailabilityException
} from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Validation schema for time slots in exceptions
const timeSlotSchema = z.object({
  startTime: z.string().datetime({ message: 'Start time must be a valid ISO datetime string' }),
  endTime: z.string().datetime({ message: 'End time must be a valid ISO datetime string' }),
  isBooked: z.boolean().default(false),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: 'Start time must be before end time',
  path: ['startTime']
});

// Validation schema for creating/updating an availability exception
const availabilityExceptionSchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  isAvailable: z.boolean(),
  slots: z.array(timeSlotSchema).optional(),
}).refine(data => !data.isAvailable || (data.slots && data.slots.length > 0), {
  message: 'Slots must be provided when isAvailable is true',
  path: ['slots']
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
 * Helper to check if user has permission to modify a builder's availability
 */
function hasPermission(user: AuthUser, builderId: string): boolean {
  const isAdmin = user.roles.includes(UserRole.ADMIN);
  const isBuilder = user.roles.includes(UserRole.BUILDER);
  const isOwnProfile = user.id === builderId;
  return isAdmin || (isBuilder && isOwnProfile);
}

/**
 * GET handler for fetching availability exceptions for a builder
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
    
    const { builderId, startDate, endDate } = result.data;
    
    // Fetch availability exceptions
    const availabilityExceptions = await getAvailabilityExceptions(builderId, startDate, endDate);
    
    return NextResponse.json({ availabilityExceptions });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability exceptions GET endpoint');
  }
}

/**
 * POST handler for creating a new availability exception
 */
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = availabilityExceptionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid availability exception data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const exceptionData = result.data;
    
    // Authorization check
    if (!hasPermission(user, exceptionData.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to create availability exceptions for this builder' }, 
        { status: 403 }
      );
    }
    
    // Create the availability exception
    const availabilityException = await createAvailabilityException(exceptionData);
    
    return NextResponse.json({ availabilityException }, { status: 201 });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability exceptions POST endpoint');
  }
});

/**
 * GET handler for fetching a specific availability exception
 */
export const GET_BY_ID = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get exception ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Availability exception ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get the exception
    const exception = await getAvailabilityExceptionById(id);
    
    if (!exception) {
      return NextResponse.json(
        { error: 'Availability exception not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check
    if (!hasPermission(user, exception.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to access this availability exception' }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json({ availabilityException: exception });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability exceptions GET_BY_ID endpoint');
  }
});

/**
 * PUT handler for updating an existing availability exception
 */
export const PUT = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get exception ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Availability exception ID is required' }, 
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Get the existing exception for authorization check
    const existingException = await getAvailabilityExceptionById(id);
    
    if (!existingException) {
      return NextResponse.json(
        { error: 'Availability exception not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check
    if (!hasPermission(user, existingException.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to update this availability exception' }, 
        { status: 403 }
      );
    }
    
    // Validate request data (partial schema for updates)
    const partialSchema = availabilityExceptionSchema.partial();
    const result = partialSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid availability exception data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    // Special validation for isAvailable and slots
    if (result.data.isAvailable === true && !result.data.slots && !existingException.slots) {
      return NextResponse.json(
        { error: 'Slots must be provided when isAvailable is true' }, 
        { status: 400 }
      );
    }
    
    const updates = result.data;
    
    // Update the availability exception
    const availabilityException = await updateAvailabilityException(id, updates);
    
    return NextResponse.json({ availabilityException });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability exceptions PUT endpoint');
  }
});

/**
 * DELETE handler for removing an availability exception
 */
export const DELETE = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get exception ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Availability exception ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get the exception for authorization check
    const exception = await getAvailabilityExceptionById(id);
    
    if (!exception) {
      return NextResponse.json(
        { error: 'Availability exception not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check
    if (!hasPermission(user, exception.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this availability exception' }, 
        { status: 403 }
      );
    }
    
    // Delete the availability exception
    const success = await deleteAvailabilityException(id);
    
    return NextResponse.json({ success });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability exceptions DELETE endpoint');
  }
});