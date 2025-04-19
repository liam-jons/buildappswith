import { NextRequest, NextResponse } from 'next/server';
import { getClientSchedulingProfile } from '@/lib/scheduling/real-data/scheduling-service';
import { auth } from '@/lib/auth/auth';

/**
 * GET handler for fetching a client's scheduling profile
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
    
    // Get session for auth check
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    // Authorization check - only the client or an admin can view their profile
    const isAdminUser = session.user.role === 'ADMIN';
    const isOwnProfile = session.user.id === id;
    
    if (!isAdminUser && !isOwnProfile) {
      return NextResponse.json(
        { error: 'Not authorized to view this client profile' }, 
        { status: 403 }
      );
    }
    
    // Fetch the client scheduling profile
    const profile = await getClientSchedulingProfile(id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Client profile not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error(`Error fetching client scheduling profile:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch client scheduling profile' }, 
      { status: 500 }
    );
  }
}