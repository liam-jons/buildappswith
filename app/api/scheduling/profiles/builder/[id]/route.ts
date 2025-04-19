import { NextRequest, NextResponse } from 'next/server';
import { getBuilderSchedulingProfile } from '@/lib/scheduling/real-data/scheduling-service';
import { auth } from '@/lib/auth/auth';

/**
 * GET handler for fetching a builder's complete scheduling profile
 * Updated to use Next.js 15 promise-based params
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to get the id
    const params = await context.params;
    const { id } = params;
    
    // Fetch the builder scheduling profile
    try {
      const profile = await getBuilderSchedulingProfile(id);
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Builder profile not found' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json({ profile });
    } catch (error: any) {
      // If the service is not fully implemented, return mock data
      if (error.message === 'BuilderSchedulingProfile implementation required') {
        // Import mock data
        const { mockBuilderSchedulingProfile } = await import('@/lib/scheduling/mock-data');
        
        // Update the mock data to match requested builder
        const mockProfile = {
          ...mockBuilderSchedulingProfile,
          builderId: id,
        };
        
        return NextResponse.json({ 
          profile: mockProfile,
          warning: 'Using mock data - database implementation pending'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error fetching builder scheduling profile:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch builder scheduling profile' }, 
      { status: 500 }
    );
  }
}