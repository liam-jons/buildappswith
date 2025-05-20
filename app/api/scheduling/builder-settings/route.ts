import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getBuilderSchedulingProfile
  // updateBuilderSchedulingSettings // Temporarily commented out as it's not implemented in service
} from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth'; 
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';
import { 
  createAuthErrorResponse, 
  addAuthPerformanceMetrics, 
  AuthErrorType 
} from '@/lib/auth/adapters/clerk-express/errors'; 
import { logger } from '@/lib/logger'; 

// Validation schema for query parameters (used by GET and PUT)
const querySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
});

// Validation schema for updating builder scheduling settings
const settingsSchema = z.object({
  minimumNotice: z.number().int().nonnegative().optional(),
  bufferBetweenSessions: z.number().int().nonnegative().optional(),
  maximumAdvanceBooking: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  isAcceptingBookings: z.boolean().optional(),
});

/**
 * Helper to check if user has permission to modify a builder's settings
 */
function hasPermission(userId: string, userRoles: UserRole[], builderId: string): boolean { 
  const isAdmin = userRoles.includes(UserRole.ADMIN);
  const isBuilder = userRoles.includes(UserRole.BUILDER);
  const isOwnProfile = userId === builderId;
  return isAdmin || (isBuilder && isOwnProfile);
}

/**
 * GET handler for fetching builder scheduling profile
 */
export const GET = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[]) => { 
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
      logger.warn('Invalid query parameters for GET builder-settings', { path, method, userId, errors: result.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid query parameters',
        400,
        path,
        method,
        userId
      );
    }
    
    const { builderId } = result.data;
    
    // Authorization check
    if (!hasPermission(userId, userRoles, builderId)) { 
      logger.warn('Unauthorized access to builder scheduling profile GET', { path, method, userId, userRoles, requestedBuilderId: builderId });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to access this builder\'s scheduling profile',
        403,
        path,
        method,
        userId
      );
    }
    
    // Fetch builder scheduling profile
    const schedulingProfile = await getBuilderSchedulingProfile(builderId);
    
    if (!schedulingProfile) {
      logger.warn('Builder scheduling profile not found GET', { path, method, userId, builderId });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Builder scheduling profile not found',
        404,
        path,
        method,
        userId
      );
    }
    
    const response = NextResponse.json({ success: true, data: { schedulingProfile } });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in builder settings GET endpoint', { error: errorMessage, path, method, userId });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Error fetching builder scheduling profile',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * PUT handler for updating builder scheduling settings
 */
export const PUT = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[]) => { 
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Get builder ID from query parameters
    const { searchParams } = new URL(request.url);
    const rawQueryParams = Object.fromEntries(searchParams.entries());
    const queryResult = querySchema.safeParse(rawQueryParams);

    if (!queryResult.success) {
      logger.warn('Invalid query parameters for PUT builder-settings (builderId missing or invalid)', { path, method, userId, errors: queryResult.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Builder ID is required in query parameters and must be valid.',
        400,
        path,
        method,
        userId
      );
    }
    const { builderId } = queryResult.data;
    
    // Authorization check
    if (!hasPermission(userId, userRoles, builderId)) { 
      logger.warn('Unauthorized update to builder scheduling settings PUT', { path, method, userId, userRoles, requestedBuilderId: builderId });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to update this builder\'s scheduling settings',
        403,
        path,
        method,
        userId
      );
    }
    
    // Parse request body for settings
    const body = await request.json();
    const settingsParseResult = settingsSchema.safeParse(body);
    
    if (!settingsParseResult.success) {
      logger.warn('Invalid settings data for PUT builder-settings', { path, method, userId, builderId, errors: settingsParseResult.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid scheduling settings data',
        400,
        path,
        method,
        userId
      );
    }
    
    const settings = settingsParseResult.data;
    
    // Update builder scheduling settings
    // const schedulingProfile = await updateBuilderSchedulingSettings(builderId, settings);
    // TODO: Implement updateBuilderSchedulingSettings in @/lib/scheduling/real-data/scheduling-service.ts
    logger.error('updateBuilderSchedulingSettings is not implemented in scheduling-service.ts', { path, method, userId, builderId, settings });
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Functionality not implemented: Cannot update builder scheduling settings.',
      501, // Not Implemented
      path,
      method,
      userId
    );
    
    // const response = NextResponse.json({ success: true, data: { schedulingProfile } });
    // return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in builder settings PUT endpoint', { error: errorMessage, path, method, userId });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Error updating builder scheduling settings',
      500,
      path,
      method,
      userId
    );
  }
});