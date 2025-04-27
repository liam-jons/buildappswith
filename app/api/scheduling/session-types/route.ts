import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTypes, createSessionType, updateSessionType, deleteSessionType } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth, withRole } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
});

// Validation schema for creating a session type
const sessionTypeSchema = z.object({
  builderId: z.string().min(1, 'Builder ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters'),
  durationMinutes: z.number().int().positive().max(480, 'Duration cannot exceed 8 hours'), 
  price: z.number().nonnegative('Price must be non-negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'), // ISO 4217 currency code
  isActive: z.boolean(),
  color: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

// Helper to handle service errors with mock data fallback
async function handleServiceWithMock<T>(
  serviceCall: () => Promise<T>,
  mockGenerator: () => T,
  errorMessage: string
): Promise<{ result: T; warning?: string }> {
  try {
    const result = await serviceCall();
    return { result };
  } catch (error: any) {
    // If the service is not fully implemented, return mock data
    if (error.message && error.message.includes('database implementation required')) {
      const mockResult = mockGenerator();
      return { 
        result: mockResult,
        warning: 'Using mock data - database implementation pending'
      };
    }
    
    // Otherwise, re-throw the error
    console.error(errorMessage, error);
    throw error;
  }
}

/**
 * Helper to check if user has permission to modify a builder's session types
 */
function hasPermission(user: AuthUser, builderId: string): boolean {
  const isAdmin = user.roles.includes(UserRole.ADMIN);
  const isOwnProfile = user.id === builderId;
  return isAdmin || isOwnProfile;
}

/**
 * GET handler for fetching session types for a builder
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
    
    // Import mock data (will only be used if needed)
    const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
    
    // Fetch session types with mock fallback
    const { result: sessionTypes, warning } = await handleServiceWithMock(
      () => getSessionTypes(builderId),
      () => mockSessionTypes.filter(st => st.builderId === builderId),
      `Error fetching session types for builder ${builderId}`
    );
    
    return NextResponse.json({ 
      sessionTypes,
      ...(warning ? { warning } : {})
    });
    
  } catch (error) {
    console.error('Error in session types GET endpoint:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to fetch session types' }, 
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new session type
 */
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = sessionTypeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session type data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const sessionTypeData = result.data;
    
    // Authorization check
    if (!hasPermission(user, sessionTypeData.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to create session types for this builder' }, 
        { status: 403 }
      );
    }
    
    // Import mock data (will only be used if needed)
    const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
    
    // Create the session type with mock fallback
    const { result: sessionType, warning } = await handleServiceWithMock(
      () => createSessionType(sessionTypeData),
      () => ({
        id: `mock-${Date.now()}`,
        ...sessionTypeData
      }),
      'Error creating session type'
    );
    
    return NextResponse.json({ 
      sessionType,
      ...(warning ? { warning } : {})
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error in session types POST endpoint:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to create session type' }, 
      { status: 500 }
    );
  }
});

/**
 * PUT handler for updating an existing session type
 */
export const PUT = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get session type ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session type ID is required' }, 
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data (partial schema for updates)
    const partialSchema = sessionTypeSchema.partial();
    const result = partialSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session type data', details: result.error.format() }, 
        { status: 400 }
      );
    }
    
    const updates = result.data;
    
    // Authorization check
    if (updates.builderId && !hasPermission(user, updates.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to update session types for this builder' }, 
        { status: 403 }
      );
    }
    
    // Import mock data (will only be used if needed)
    const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
    
    // Update the session type with mock fallback
    const { result: sessionType, warning } = await handleServiceWithMock(
      () => updateSessionType(id, updates),
      () => {
        const existingType = mockSessionTypes.find(st => st.id === id);
        return {
          id,
          ...existingType,
          ...updates
        };
      },
      `Error updating session type ${id}`
    );
    
    return NextResponse.json({ 
      sessionType,
      ...(warning ? { warning } : {})
    });
    
  } catch (error) {
    console.error('Error in session types PUT endpoint:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to update session type' }, 
      { status: 500 }
    );
  }
});

/**
 * DELETE handler for removing a session type
 */
export const DELETE = withAuth(async (request: NextRequest, user: AuthUser, { params }: { params: { id: string } }) => {
  try {
    // Get session type ID from URL
    const id = params?.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session type ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get the session type to check ownership
    const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
    
    // Get session type data (either real or mock)
    const { result: sessionTypes } = await handleServiceWithMock(
      () => getSessionTypes('all'),
      () => mockSessionTypes,
      'Error fetching session types for authorization check'
    );
    
    const sessionType = sessionTypes.find(st => st.id === id);
    
    if (!sessionType) {
      return NextResponse.json(
        { error: 'Session type not found' }, 
        { status: 404 }
      );
    }
    
    // Authorization check
    if (!hasPermission(user, sessionType.builderId)) {
      return NextResponse.json(
        { error: 'Not authorized to delete this session type' }, 
        { status: 403 }
      );
    }
    
    // Delete the session type with mock fallback
    const { result: success, warning } = await handleServiceWithMock(
      () => deleteSessionType(id),
      () => true,
      `Error deleting session type ${id}`
    );
    
    return NextResponse.json({ 
      success,
      ...(warning ? { warning } : {})
    });
    
  } catch (error) {
    console.error('Error in session types DELETE endpoint:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to delete session type' }, 
      { status: 500 }
    );
  }
});