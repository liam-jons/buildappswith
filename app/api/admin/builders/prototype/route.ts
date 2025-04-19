import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth'; // Updated import
import { createPrototypeBuilderProfile } from '@/lib/services/builder-service';
import { UserRole } from '@/lib/auth/types';

/**
 * POST handler for creating a prototype builder profile for Liam Jones
 * This endpoint is for admin use during the initial setup phase.
 * In production, it should be protected by admin authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth(); // Updated to use auth() instead of getServerSession
    
    // In development, allow access without authentication to simplify testing
    if (process.env.NODE_ENV === 'production') {
      if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      
      // In production, restrict to ADMIN role
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
    }
    
    // Create prototype builder profile
    const result = await createPrototypeBuilderProfile();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating prototype builder profile:', error);
    return NextResponse.json(
      { error: 'Failed to create prototype builder profile' }, 
      { status: 500 }
    );
  }
}