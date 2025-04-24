import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import * as Sentry from '@sentry/nextjs';

/**
 * GET handler for testing authentication
 * Returns authenticated user data if available
 * Version: 1.0.59
 */
export const GET = withAuth(async (request: NextRequest, user: AuthUser) => {
  try {
    // Log the authenticated user for debugging
    console.log('Authenticated user in test route:', {
      id: user.id,
      clerkId: user.clerkId,
      roles: user.roles,
      email: user.email
    });
    
    // Return the authenticated user data
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        image: user.image,
        roles: user.roles,
        verified: user.verified,
        stripeCustomerId: user.stripeCustomerId
      }
    });
  } catch (error) {
    // Log and report the error
    console.error('Error in test auth route:', error);
    Sentry.captureException(error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to get authenticated user data' }, 
      { status: 500 }
    );
  }
});
