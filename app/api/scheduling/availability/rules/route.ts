import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailabilityRules, createAvailabilityRule } from '@/lib/scheduling/real-data/scheduling-service';
import { auth } from '@/lib/auth/auth';
import { UserRole } from '@/lib/auth/types';

// Validation schema for query parameters
const querySchema = z.object({
  builderId: z.string(),
});

// Validation schema for creating an availability rule
const createRuleSchema = z.object({
  builderId: z.string(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM 24-hour format
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM 24-hour format
  isRecurring: z.boolean(),
});

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
        { error: 'Invalid query parameters', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    const { builderId } = result.data;
    
    // Fetch availability rules
    try {
      const rules = await getAvailabilityRules(builderId);
      return NextResponse.json({ rules });
    } catch (error: any) {
      // If the service is not fully implemented, return mock data
      if (error.message === 'AvailabilityRule database implementation required') {
        // Import mock data
        const { mockAvailabilityRules } = await import('@/lib/scheduling/mock-data');
        
        // Filter rules for the requested builder
        const filteredRules = mockAvailabilityRules.filter(rule => rule.builderId === builderId);
        
        return NextResponse.json({ 
          rules: filteredRules,
          warning: 'Using mock data - database implementation pending'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error in availability rules endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability rules' }, 
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating a new availability rule
 */
export async function POST(request: NextRequest) {
  try {
    // Get session for auth check
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = createRuleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid availability rule data', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    // Authorization check - only allow creating rules for own profile
    // or if user is an admin
    const isAdminUser = session.user.roles.includes(UserRole.ADMIN);
    const isOwnProfile = session.user.id === result.data.builderId;
    
    if (!isAdminUser && !isOwnProfile) {
      return NextResponse.json(
        { error: 'Not authorized to create availability rules for this builder' }, 
        { status: 403 }
      );
    }
    
    // Validate time range
    if (result.data.startTime >= result.data.endTime) {
      return NextResponse.json(
        { error: 'Start time must be before end time' }, 
        { status: 400 }
      );
    }
    
    // Create the availability rule
    try {
      const rule = await createAvailabilityRule({
        ...result.data,
        dayOfWeek: result.data.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6
      });
      
      return NextResponse.json(
        { rule }, 
        { status: 201 }
      );
    } catch (error: any) {
      // If the service is not fully implemented, return mock data
      if (error.message === 'AvailabilityRule database implementation required') {
        // Create a mock rule with an ID
        const mockRule = {
          id: 'mock-' + Math.random().toString(36).substring(2, 15),
          ...result.data,
          dayOfWeek: result.data.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6
        };
        
        return NextResponse.json({ 
          rule: mockRule,
          warning: 'Using mock data - database implementation pending'
        }, { status: 201 });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error creating availability rule:', error);
    return NextResponse.json(
      { error: 'Failed to create availability rule' }, 
      { status: 500 }
    );
  }
}