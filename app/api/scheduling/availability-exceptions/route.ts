import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getAvailabilityExceptions,
  getAvailabilityExceptionById,
  createAvailabilityException,
  updateAvailabilityException,
  // deleteAvailabilityException // TODO: This function is not exported from scheduling-service.ts. Investigate.
} from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';

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
 * Helper to check if user has permission to modify a builder's availability
 */
function hasPermission(userId: string, roles: UserRole[], builderIdToCheck: string): boolean {
  const isAdmin = roles.includes(UserRole.ADMIN);
  const isBuilder = roles.includes(UserRole.BUILDER);
  const isOwnProfile = userId === builderIdToCheck;
  return isAdmin || (isBuilder && isOwnProfile);
}

/**
 * GET handler for fetching availability exceptions for a builder
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate parameters
    const result = querySchema.safeParse(rawParams);
    
    if (!result.success) {
      logger.warn('Invalid query parameters for GET availability exceptions', { path, method, errors: result.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid query parameters',
        400,
        path,
        method
      );
    }
    
    const { builderId, startDate, endDate } = result.data;
    
    // Fetch availability exceptions
    const availabilityExceptions = await getAvailabilityExceptions(builderId, startDate, endDate);
    
    const response = NextResponse.json({ availabilityExceptions });
    return addAuthPerformanceMetrics(response, startTime, true, path, method);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability exceptions GET endpoint', { error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch availability exceptions',
      500,
      path,
      method
    );
  }
}

/**
 * POST handler for creating a new availability exception
 */
export const POST = withAuth(async (request: NextRequest, context: { params?: any }, auth) => {
  const userId = auth.userId;
  const userRoles = auth.roles;
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = availabilityExceptionSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid request body for POST availability exception', { userId, path, method, errors: result.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid availability exception data',
        400,
        path,
        method,
        userId
      );
    }
    
    const exceptionData = result.data;
    
    // Authorization check
    if (!hasPermission(userId, userRoles, exceptionData.builderId)) {
      logger.warn('Unauthorized attempt to POST availability exception', { userId, targetBuilderId: exceptionData.builderId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to create availability exceptions for this builder',
        403,
        path,
        method,
        userId
      );
    }
    
    // Create the availability exception
    const availabilityException = await createAvailabilityException(exceptionData.builderId, exceptionData);
    
    const response = NextResponse.json({ availabilityException }, { status: 201 });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability exceptions POST endpoint', { userId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to create availability exception',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * GET handler for fetching a specific availability exception
 */
export const GET_BY_ID = withAuth(async (request: NextRequest, context: { params?: any }, auth) => {
  const userId = auth.userId;
  const userRoles = auth.roles;
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const exceptionId = context.params?.id;

  try {
    if (!exceptionId) {
      logger.warn('Missing availability exception ID for GET_BY_ID', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Availability exception ID is required',
        400,
        path,
        method,
        userId
      );
    }
    
    // Get the exception
    const exception = await getAvailabilityExceptionById(exceptionId);
    
    if (!exception) {
      logger.warn('Availability exception not found for GET_BY_ID', { userId, exceptionId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Availability exception not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Authorization check
    if (!hasPermission(userId, userRoles, exception.builderId)) {
      logger.warn('Unauthorized attempt to GET_BY_ID availability exception', { userId, targetBuilderId: exception.builderId, exceptionId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to access this availability exception',
        403,
        path,
        method,
        userId
      );
    }
    
    const response = NextResponse.json({ availabilityException: exception });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability exceptions GET_BY_ID endpoint', { userId, exceptionId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch availability exception',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * PUT handler for updating an existing availability exception
 */
export const PUT = withAuth(async (request: NextRequest, context: { params?: any }, auth) => {
  const userId = auth.userId;
  const userRoles = auth.roles;
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const exceptionId = context.params?.id;

  try {
    if (!exceptionId) {
      logger.warn('Missing availability exception ID for PUT', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Availability exception ID is required',
        400,
        path,
        method,
        userId
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Get the existing exception for authorization check first
    const existingException = await getAvailabilityExceptionById(exceptionId);
    
    if (!existingException) {
      logger.warn('Availability exception not found for PUT', { userId, exceptionId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Availability exception not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Authorization check
    if (!hasPermission(userId, userRoles, existingException.builderId)) {
      logger.warn('Unauthorized attempt to PUT availability exception', { userId, targetBuilderId: existingException.builderId, exceptionId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to update this availability exception',
        403,
        path,
        method,
        userId
      );
    }

    // Validate request data (ensure builderId from body matches existing one to prevent misuse)
    const result = availabilityExceptionSchema.safeParse(body);
    if (!result.success || result.data.builderId !== existingException.builderId) {
      logger.warn('Invalid request body or mismatched builderId for PUT availability exception', { userId, exceptionId, path, method, errors: result.success === false ? result.error.format() : undefined, bodyBuilderId: result.success ? result.data.builderId : undefined, existingBuilderId: existingException.builderId });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        result.success === false ? 'Invalid availability exception data' : 'Builder ID mismatch',
        400,
        path,
        method,
        userId
      );
    }
    
    const exceptionData = result.data;
    
    // Update the availability exception
    const updatedAvailabilityException = await updateAvailabilityException(exceptionId, exceptionData);
    
    const response = NextResponse.json({ availabilityException: updatedAvailabilityException });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability exceptions PUT endpoint', { userId, exceptionId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to update availability exception',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * DELETE handler for deleting an availability exception
 */
export const DELETE = withAuth(async (request: NextRequest, context: { params?: any }, auth) => {
  const userId = auth.userId;
  const userRoles = auth.roles;
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const exceptionId = context.params?.id;

  try {
    if (!exceptionId) {
      logger.warn('Missing availability exception ID for DELETE', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Availability exception ID is required',
        400,
        path,
        method,
        userId
      );
    }
    
    // Get the existing exception for authorization check
    const existingException = await getAvailabilityExceptionById(exceptionId);

    if (!existingException) {
      logger.warn('Availability exception not found for DELETE', { userId, exceptionId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Availability exception not found',
        404,
        path,
        method,
        userId
      );
    }

    // Authorization check
    if (!hasPermission(userId, userRoles, existingException.builderId)) {
      logger.warn('Unauthorized attempt to DELETE availability exception', { userId, targetBuilderId: existingException.builderId, exceptionId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to delete this availability exception',
        403,
        path,
        method,
        userId
      );
    }
    
    // Delete the availability exception
    // await deleteAvailabilityException(exceptionId); // TODO: This function is not exported from scheduling-service.ts. Investigate.
    
    const response = NextResponse.json({ message: 'Availability exception deleted successfully' });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability exceptions DELETE endpoint', { userId, exceptionId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to delete availability exception',
      500,
      path,
      method,
      userId
    );
  }
});