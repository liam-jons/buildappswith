import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/auth/clerk/api-auth';
import { AuthUser } from '@/lib/auth/clerk/helpers';
import * as Sentry from '@sentry/nextjs';
import { createPrototypeBuilderProfile } from '@/lib/services/builder-service';
import { UserRole } from '@/lib/auth/types';

/**
 * POST handler for creating a prototype builder profile for Liam Jones
 * This endpoint is for admin use during the initial setup phase.
 * Protected by Clerk admin authentication.
 */
export const POST = withAdmin(async (request: NextRequest, user: AuthUser) => {
  try {
    // In development, allow any authenticated user
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode: bypassing strict admin role check');
    }
    
    // Create prototype builder profile
    const result = await createPrototypeBuilderProfile();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating prototype builder profile:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to create prototype builder profile' }, 
      { status: 500 }
    );
  }
});