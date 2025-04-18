import { NextRequest, NextResponse } from 'next/server';
import { fetchFeaturedBuilders } from '@/lib/marketplace/real-data/marketplace-service';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(10).default(3),
});

/**
 * GET handler for fetching featured builders
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
    
    const { limit } = result.data;
    
    // Fetch data
    const featuredBuilders = await fetchFeaturedBuilders(limit);
    
    return NextResponse.json({ data: featuredBuilders });
  } catch (error) {
    console.error('Error in featured builders endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured builders' }, 
      { status: 500 }
    );
  }
}
