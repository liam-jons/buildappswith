import { NextRequest, NextResponse } from 'next/server';
import { getClientSchedulingProfile } from '@/lib/scheduling/real-data/scheduling-service';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import * as Sentry from '@sentry/nextjs';
import { UserRole } from '@/lib/auth/types';

/**
 * GET handler for fetching a client's scheduling profile
 * Updated to use Next.js 15 promise-based params and Clerk authentication
 */
export const GET = withAuth(async (
  request: NextRequest,
  user: AuthUser,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    // Await the params to get the id
    const params = await context.params;
    const { id } = params;
    
    // Authorization check - only the client or an admin can view their profile
    const isAdminUser = user.roles.includes(UserRole.ADMIN);
    const isOwnProfile = user.id === id;
    
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
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to fetch client scheduling profile' }, 
      { status: 500 }
    );
  }
});