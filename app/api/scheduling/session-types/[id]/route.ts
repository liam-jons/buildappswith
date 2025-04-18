import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateSessionType, deleteSessionType } from '@/lib/scheduling/real-data/scheduling-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Validation schema for updating a session type
const updateSessionTypeSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().positive().max(480).optional(), // Max 8 hours
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).optional(), // ISO 4217 currency code
  isActive: z.boolean().optional(),
  color: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
});

/**
 * PATCH handler for updating a session type
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get session for auth check
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = updateSessionTypeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid session type data', details: result.error.flatten() }, 
        { status: 400 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Fetch the session type to check permissions
    // 2. Verify the user has permission to update it
    
    // Update the session type
    try {
      const sessionType = await updateSessionType(id, result.data);
      return NextResponse.json({ sessionType });
    } catch (error: any) {
      // If the service is not fully implemented, return mock data
      if (error.message === 'SessionType database implementation required') {
        // Import mock data
        const { mockSessionTypes } = await import('@/lib/scheduling/mock-data');
        
        // Find the session type
        const sessionTypeIndex = mockSessionTypes.findIndex(st => st.id === id);
        
        if (sessionTypeIndex === -1) {
          return NextResponse.json(
            { error: 'Session type not found' }, 
            { status: 404 }
          );
        }
        
        // Create an updated mock session type
        const mockSessionType = {
          ...mockSessionTypes[sessionTypeIndex],
          ...result.data
        };
        
        return NextResponse.json({ 
          sessionType: mockSessionType,
          warning: 'Using mock data - database implementation pending'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error updating session type:`, error);
    return NextResponse.json(
      { error: 'Failed to update session type' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a session type
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get session for auth check
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Fetch the session type to check permissions
    // 2. Verify the user has permission to delete it
    
    // Delete the session type
    try {
      await deleteSessionType(id);
      return NextResponse.json(
        { success: true }, 
        { status: 200 }
      );
    } catch (error: any) {
      // If the service is not fully implemented, return mock success
      if (error.message === 'SessionType database implementation required') {
        return NextResponse.json({ 
          success: true,
          warning: 'Using mock data - database implementation pending'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error deleting session type:`, error);
    return NextResponse.json(
      { error: 'Failed to delete session type' }, 
      { status: 500 }
    );
  }
}
