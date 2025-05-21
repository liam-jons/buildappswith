import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getAvailabilityRules, 
  getAvailabilityRuleById, 
  createAvailabilityRule, 
  updateAvailabilityRule, 
  deleteAvailabilityRule 
} from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth';
import { UserRole } from '@/lib/auth/types';
import { DayOfWeek, CreateAvailabilityRuleInput } from '@/lib/scheduling/types';
import * as Sentry from '@sentry/nextjs';
import { AuthErrorType, createAuthErrorResponse, addAuthPerformanceMetrics } from '@/lib/auth/adapters/clerk-express/errors';
import { logger } from '@/lib/logger';
import { toStandardResponse, ApiErrorCode } from '@/lib/types/api-types';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
});

// Base schema for availability rule properties
const baseAvailabilityRuleSchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:MM)'),
  isRecurring: z.boolean().default(true),
});

// Validation schema for creating/updating an availability rule, with refinement
const availabilityRuleSchema = baseAvailabilityRuleSchema.refine(data => data.startTime < data.endTime, {
  message: 'Start time must be before end time',
  path: ['startTime']
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
 * GET handler for fetching availability rules for a builder
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
      logger.warn('Invalid query parameters for GET availability rules', { path, method, errors: result.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid query parameters',
        400,
        path,
        method
      );
    }
    
    const { builderId } = result.data;
    
    // Fetch availability rules
    const availabilityRules = await getAvailabilityRules(builderId);
    
    const response = NextResponse.json(toStandardResponse({ availabilityRules }));
    return addAuthPerformanceMetrics(response, startTime, true, path, method);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability rules GET endpoint', { error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to fetch availability rules',
      500,
      path,
      method
    );
  }
}

/**
 * POST handler for creating a new availability rule
 */
export const POST = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = availabilityRuleSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid request body for POST availability rule', { userId, path, method, errors: result.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid availability rule data',
        400,
        path,
        method,
        userId
      );
    }
    
    const ruleData = result.data;
    
    // Authorization check
    if (!hasPermission(userId, userRoles, ruleData.builderId)) {
      logger.warn('Unauthorized attempt to POST availability rule', { userId, targetBuilderId: ruleData.builderId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to create availability rules for this builder',
        403,
        path,
        method,
        userId
      );
    }
    
    // Create the availability rule
    const availabilityRule = await createAvailabilityRule(ruleData.builderId, { ...ruleData, dayOfWeek: ruleData.dayOfWeek as DayOfWeek });
    
    const response = NextResponse.json(toStandardResponse({ availabilityRule }), { status: 201 });
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability rules POST endpoint', { userId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to create availability rule',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * PUT handler for updating an existing availability rule
 */
export const PUT = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const ruleId = context.params?.id;

  try {
    if (!ruleId) {
      logger.warn('Missing availability rule ID for PUT', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Availability rule ID is required',
        400,
        path,
        method,
        userId
      );
    }
    
    // Get the existing rule for authorization check
    const existingRule = await getAvailabilityRuleById(ruleId);

    if (!existingRule) {
      logger.warn('Availability rule not found for PUT', { userId, ruleId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Availability rule not found',
        404,
        path,
        method,
        userId
      );
    }

    // Authorization check against the existing rule's builderId
    if (!hasPermission(userId, userRoles, existingRule.builderId)) {
      logger.warn('Unauthorized attempt to PUT availability rule', { userId, targetBuilderId: existingRule.builderId, ruleId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to update this availability rule',
        403,
        path,
        method,
        userId
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request data (partial schema for updates)
    const partialSchema = baseAvailabilityRuleSchema.partial(); 
    const result = partialSchema.safeParse(body);
    
    if (!result.success) {
      logger.warn('Invalid request body for PUT availability rule', { userId, ruleId, path, method, errors: result.error.format() });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Invalid availability rule data',
        400,
        path,
        method,
        userId
      );
    }
    
    const updates = result.data;

    // Prevent changing builderId during an update.
    // This check is against the 'updates' from the request body.
    if (updates.builderId && updates.builderId !== existingRule.builderId) {
      logger.warn('Attempt to change builderId during PUT availability rule update', { userId, ruleId, path, method, newBuilderId: updates.builderId, existingBuilderId: existingRule.builderId });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Cannot change builderId during update. Create a new rule instead.',
        400,
        path,
        method,
        userId
      );
    }

    // Destructure dayOfWeek from updates to handle its type separately.
    // Also destructure builderId from updates to explicitly ignore it from the spread,
    // as we are setting it from existingRule.builderId.
    const { dayOfWeek, builderId: _discardedBuilderIdFromUpdates, ...otherUpdates } = updates; 

    // Create a new object for the service call with correctly typed dayOfWeek
    const servicePayload: Partial<CreateAvailabilityRuleInput> = {
        ...otherUpdates, // Spread first to get all other properties
        builderId: existingRule.builderId, // Ensure builderId is set from existing rule
    };

    if (dayOfWeek !== undefined) {
        servicePayload.dayOfWeek = dayOfWeek as DayOfWeek; // Cast here
    } else if (updates.hasOwnProperty('dayOfWeek') && dayOfWeek === undefined) {
        // If dayOfWeek was explicitly provided as undefined in the input body
        servicePayload.dayOfWeek = undefined;
    }
    // If dayOfWeek was not in `updates` at all, it remains undefined in servicePayload due to Partial<...>

    // Update the availability rule
    const availabilityRule = await updateAvailabilityRule(ruleId, servicePayload);
    
    const response = NextResponse.json(toStandardResponse({ availabilityRule }));
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability rules PUT endpoint', { userId, ruleId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to update availability rule',
      500,
      path,
      method,
      userId
    );
  }
});

/**
 * DELETE handler for removing an availability rule
 */
export const DELETE = withAuth(async (request: NextRequest, context: { params?: any }, userId: string, userRoles: UserRole[] = []) => {
  const startTime = performance.now();
  const path = request.nextUrl.pathname;
  const method = request.method;
  const ruleId = context.params?.id;

  try {
    if (!ruleId) {
      logger.warn('Missing availability rule ID for DELETE', { userId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.VALIDATION,
        'Availability rule ID is required',
        400,
        path,
        method,
        userId
      );
    }
    
    // Get the rule to check authorization
    const rule = await getAvailabilityRuleById(ruleId);
    
    if (!rule) {
      logger.warn('Availability rule not found for DELETE', { userId, ruleId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.RESOURCE_NOT_FOUND,
        'Availability rule not found',
        404,
        path,
        method,
        userId
      );
    }
    
    // Authorization check
    if (!hasPermission(userId, userRoles, rule.builderId)) {
      logger.warn('Unauthorized attempt to DELETE availability rule', { userId, targetBuilderId: rule.builderId, ruleId, path, method });
      return createAuthErrorResponse(
        AuthErrorType.AUTHORIZATION,
        'Not authorized to delete this availability rule',
        403,
        path,
        method,
        userId
      );
    }
    
    await deleteAvailabilityRule(ruleId);
    
    const response = NextResponse.json(toStandardResponse(null, { message: 'Availability rule deleted successfully' }));
    return addAuthPerformanceMetrics(response, startTime, true, path, method, userId);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in availability rules DELETE endpoint', { userId, ruleId, error: errorMessage, path, method });
    Sentry.captureException(error);
    return createAuthErrorResponse(
      AuthErrorType.SERVER,
      'Failed to delete availability rule',
      500,
      path,
      method,
      userId
    );
  }
});