import { NextRequest, NextResponse } from 'next/server';
import { createPrototypeBuilderProfile } from '@/lib/services/builder-service';

/**
 * This endpoint creates the prototype builder profile for Liam Jones
 * Only available in development mode
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const result = await createPrototypeBuilderProfile();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating prototype builder profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}