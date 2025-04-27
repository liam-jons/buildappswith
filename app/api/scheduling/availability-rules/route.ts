import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getAvailabilityRules, 
  createAvailabilityRule, 
  updateAvailabilityRule, 
  deleteAvailabilityRule 
} from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
});

// Validation schema for creating/updating an availability rule
const availabilityRuleSchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in 24-hour format (HH:MM)'),
  isRecurring: z.boolean().default(true),
}).refine(data => data.startTime < data.endTime, {
  message: 'Start time must be before end time',
  path: ['startTime']
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
 * GET handler for fetching availability rules for a builder
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
    
    const { builderId } = result.data;
    
    // Fetch availability rules
    const availabilityRules = await getAvailabilityRules(builderId);
    
    return NextResponse.json({ availabilityRules });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability rules GET endpoint');
  }
}

/**
 * POST handler for creating a new availability rule
 */
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = availabilityRuleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid availability rule data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const ruleData = result.data;
    
    // Authorization check
    if (!hasPermission(user, ruleData.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to create availability rules for this builder' }, 
        { status: 403 }
      );
    }
    
    // Create the availability rule
    const availabilityRule = await createAvailabilityRule(ruleData);
    
    return NextResponse.json({ availabilityRule }, { status: 201 });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability rules POST endpoint');
  }
});

/**
 * PUT handler for updating an existing availability rule
 */
export const PUT = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get rule ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Availability rule ID is required' }, 
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data (partial schema for updates)
    const partialSchema = availabilityRuleSchema.partial();
    const result = partialSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid availability rule data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const updates = result.data;
    
    // Authorization check
    if (updates.builderId && !hasPermission(user, updates.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to update availability rules for this builder' }, 
        { status: 403 }
      );
    }
    
    // Update the availability rule
    const availabilityRule = await updateAvailabilityRule(id, updates);
    
    return NextResponse.json({ availabilityRule });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability rules PUT endpoint');
  }
});

/**
 * DELETE handler for removing an availability rule
 */
export const DELETE = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get rule ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Availability rule ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get the rule to check authorization
    const rules = await getAvailabilityRules('all');
    const rule = rules.find(r => r.id === id);
    
    if (!rule) {
      return NextResponse.json(
        { error: 'Availability rule not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check
    if (!hasPermission(user, rule.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this availability rule' }, 
        { status: 403 }
      );
    }
    
    // Delete the availability rule
    const success = await deleteAvailabilityRule(id);
    
    return NextResponse.json({ success });
    
  } catch (error) {
    return handleServiceError(error, 'Error in availability rules DELETE endpoint');
  }
});