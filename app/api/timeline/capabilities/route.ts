import { NextRequest, NextResponse } from 'next/server';
import { fetchCapabilities } from '@/lib/timeline/real-data/timeline-service';
import { z } from 'zod';

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(5),
  domains: z.string().optional().transform(val => val ? val.split(',') : undefined),
  showModelImprovements: z.enum(['true', 'false']).optional().transform(val => 
    val === undefined ? undefined : val === 'true'
  ),
  dateStart: z.string().optional(),
  dateEnd: z.string().optional(),
});

/**
 * GET handler for fetching AI capabilities
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
    
    const { page, limit, domains, showModelImprovements, dateStart, dateEnd } = result.data;
    
    // Prepare filters
    const filters: any = {
      domains,
      showModelImprovements,
    };
    
    // Add date range if provided
    if (dateStart || dateEnd) {
      filters.dateRange = {
        start: dateStart,
        end: dateEnd,
      };
    }
    
    // Fetch data
    const capabilities = await fetchCapabilities(page, limit, filters);
    
    return NextResponse.json(capabilities);
  } catch (error) {
    console.error('Error in timeline capabilities endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch capabilities' }, 
      { status: 500 }
    );
  }
}
