import { NextRequest, NextResponse } from 'next/server';
import { fetchBuilderById, trackMarketplaceEvent } from '@/lib/marketplace/data/marketplace-service';

/**
 * GET handler for fetching a single builder by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const builderId = params.id;
    
    if (!builderId) {
      return NextResponse.json(
        { error: 'Builder ID is required' }, 
        { status: 400 }
      );
    }
    
    // Fetch builder data
    const builder = await fetchBuilderById(builderId);
    
    if (!builder) {
      return NextResponse.json(
        { error: 'Builder not found' }, 
        { status: 404 }
      );
    }
    
    // Track profile view event (don't await to avoid blocking the response)
    trackMarketplaceEvent('profile_view', undefined, builderId);
    
    return NextResponse.json(builder);
  } catch (error) {
    console.error(`Error fetching builder:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch builder profile' }, 
      { status: 500 }
    );
  }
}