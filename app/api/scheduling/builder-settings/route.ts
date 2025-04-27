import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getBuilderSchedulingProfile,
  updateBuilderSchedulingSettings
} from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
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
 * Helper to check if user has permission to modify a builder's settings
 */
function hasPermission(user: AuthUser, builderId: string): boolean {
  const isAdmin = user.roles.includes(UserRole.ADMIN);
  const isBuilder = user.roles.includes(UserRole.BUILDER);
  const isOwnProfile = user.id === builderId;
  return isAdmin || (isBuilder && isOwnProfile);
}

/**
 * GET handler for fetching builder scheduling profile
 */
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
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
    
    // Authorization check
    if (!hasPermission(user, builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to access this builder\'s scheduling profile' }, 
        { status: 403 }
      );
    }
    
    // Fetch builder scheduling profile
    const schedulingProfile = await getBuilderSchedulingProfile(builderId);
    
    if (!schedulingProfile) {
      return NextResponse.json(
        { error: 'Builder scheduling profile not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ schedulingProfile });
    
  } catch (error) {
    return handleServiceError(error, 'Error in builder settings GET endpoint');
  }
});

/**
 * PUT handler for updating builder scheduling settings
 */
export const PUT = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { builderId: string } }) => {
  try {
    // Get builder ID from URL
    const builderId = params?.builderId;
    
    if (!builderId) {
      return NextResponse.json(
        { error: 'Builder ID is required' }, 
        { status: 400 }
      );
    }
    
    // Authorization check
    if (!hasPermission(user, builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to update this builder\'s scheduling settings' }, 
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = settingsSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid scheduling settings data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const settings = result.data;
    
    // Update builder scheduling settings
    const schedulingProfile = await updateBuilderSchedulingSettings(builderId, settings);
    
    return NextResponse.json({ schedulingProfile });
    
  } catch (error) {
    return handleServiceError(error, 'Error in builder settings PUT endpoint');
  }
});