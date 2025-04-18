import { NextRequest, NextResponse } from 'next/server';
import { fetchBuilders } from '@/lib/marketplace/real-data/marketplace-service';
import { ValidationTier } from '@/components/profile/validation-tier-badge';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(9),
  search: z.string().optional(),
  validationTiers: z.string().optional().transform(val => 
    val ? val.split(',') as ValidationTier[] : undefined
  ),
  skills: z.string().optional().transform(val => 
    val ? val.split(',') : undefined
  ),
  availability: z.string().optional().transform(val => 
    val ? val.split(',') as ('available' | 'limited' | 'unavailable')[] : undefined
  ),
  sortBy: z.enum(['rating', 'projects', 'recent']).optional(),
});

/**
 * GET handler for fetching builders with pagination and filtering
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
    
    const { page, limit, search, validationTiers, skills, availability } = result.data;
    
    // Prepare filters
    const filters = {
      searchQuery: search,
      validationTiers,
      skills,
      availability,
    };
    
    try {
      // Fetch data
      const builders = await fetchBuilders(page, limit, filters);
      return NextResponse.json(builders);
    } catch (fetchError) {
      console.error('Error fetching builders data:', fetchError);
      // Return empty data structure instead of error
      return NextResponse.json({
        data: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      });
    }
  } catch (error) {
    console.error('Error in marketplace builders endpoint:', error);
    // Return empty data structure instead of error
    return NextResponse.json({
      data: [],
      pagination: {
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    });
  }
}
