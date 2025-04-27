import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionTypes, createSessionType } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import { UserRole } from '@/lib/auth/types';
import * as Sentry from '@sentry/nextjs';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string(),
});

// Validation schema for creating a session type
const createSessionTypeSchema = z.object({
  builderId: z.string(),
  title: z.string().min(3).max(100),
  description: z.string().max(500),
  durationMinutes: z.number().int().positive().max(480), // Max 8 hours
  price: z.number().nonnegative(),
  currency: z.string().length(3), // ISO 4217 currency code
  isActive: z.boolean(),
  color: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

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
        { error: 'Invalid query parameters', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    const { builderId } = result.data;
    
    // Fetch session types
    try {
      const sessionTypes = await getSessionTypes(builderId);
      return NextResponse.json({ sessionTypes });
    } catch (error: any) {
      // If the service is not fully implemented, return mock data
      if (error.message === 'SessionType database implementation required') {
        // Import mock data
        const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
        
        // Filter mock session types for the requested builder
        const filteredTypes = mockSessionTypes.filter(st => st.builderId === builderId);
        
        return NextResponse.json({ 
          sessionTypes: filteredTypes,
          warning: 'Using mock data - database implementation pending'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in session types endpoint:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to fetch session types' }, 
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new session type
 * Updated to use Clerk authentication
 */
export const POST = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = createSessionTypeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session type data', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    // Authorization check - only allow creating session types for own profile
    // or if user is an admin
    const isAdminUser = user.roles.includes(UserRole.ADMIN);
    const isOwnProfile = user.id === result.data.builderId;
    
    if (!isAdminUser && !isOwnProfile) {
      return NextResponse.json(
        { error: 'Not authorized to create session types for this builder' }, 
        { status: 403 }
      );
    }
    
    // Create the session type
    try {
      const sessionType = await createSessionType(result.data);
      return NextResponse.json(
        { sessionType }, 
        { status: 201 }
      );
    } catch (error: any) {
      // If the service is not fully implemented, return mock data
      if (error.message === 'SessionType database implementation required') {
        // Import mock data
        const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
        
        // Create a mock session type with an ID
        const mockSessionType = {
          id: 'mock-' + Math.random().toString(36).substring(2, 15),
          ...result.data
        };
        
        return NextResponse.json({ 
          sessionType: mockSessionType,
          warning: 'Using mock data - database implementation pending'
        }, { status: 201 });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating session type:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to create session type' }, 
      { status: 500 }
    );
  }
});