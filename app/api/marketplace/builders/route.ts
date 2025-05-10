import { NextRequest, NextResponse } from 'next/server';
import { fetchBuilders } from '@/lib/marketplace/data/marketplace-service';
import { MarketplaceFilters } from '@/lib/marketplace/types';
import { trackMarketplaceEvent } from '@/lib/marketplace/data/marketplace-service';
import { enhancedLogger } from '@/lib/enhanced-logger';

// Create a logger for this API route
const apiLogger = enhancedLogger.child({
  domain: 'api',
  route: 'marketplace/builders'
});

/**
 * GET handler for fetching builders with pagination and filtering
 */
export async function GET(request: NextRequest) {
  apiLogger.info('Marketplace builders request received', {
    url: request.url,
    method: request.method
  });

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Log search parameters for debugging
    apiLogger.debug('Search parameters', {
      params: Object.fromEntries(searchParams.entries())
    });
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    
    // Check for valid pagination values
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }
    
    // Build filters object from query parameters
    const filters: MarketplaceFilters = {};
    
    // Search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filters.searchQuery = searchQuery;
    }
    
    // Validation tiers
    const validationTiersParam = searchParams.get('validationTiers');
    if (validationTiersParam) {
      const validationTiers = validationTiersParam.split(',').map((t) => parseInt(t, 10));
      if (validationTiers.some((t) => isNaN(t) || t < 1 || t > 3)) {
        return NextResponse.json(
          { error: 'Invalid validation tier values' },
          { status: 400 }
        );
      }
      filters.validationTiers = validationTiers;
    }
    
    // Skills
    const skillsParam = searchParams.get('skills');
    if (skillsParam) {
      filters.skills = skillsParam.split(',');
    }
    
    // Availability
    const availabilityParam = searchParams.get('availability');
    if (availabilityParam) {
      filters.availability = availabilityParam.split(',');
    }
    
    // ADHD focus
    const adhdFocusParam = searchParams.get('adhd_focus');
    if (adhdFocusParam) {
      filters.adhd_focus = adhdFocusParam === 'true';
    }
    
    // Featured
    const featuredParam = searchParams.get('featured');
    if (featuredParam) {
      filters.featured = featuredParam === 'true';
    }
    
    // Sort order
    const sortBy = searchParams.get('sortBy');
    if (sortBy) {
      filters.sortBy = sortBy;
    }
    
    // Hourly rate range
    const minHourlyRate = searchParams.get('minHourlyRate');
    if (minHourlyRate) {
      const rate = parseFloat(minHourlyRate);
      if (!isNaN(rate) && rate >= 0) {
        filters.minHourlyRate = rate;
      }
    }
    
    const maxHourlyRate = searchParams.get('maxHourlyRate');
    if (maxHourlyRate) {
      const rate = parseFloat(maxHourlyRate);
      if (!isNaN(rate) && rate >= 0) {
        filters.maxHourlyRate = rate;
      }
    }
    
    // Fetch builders with filters
    const builders = await fetchBuilders(page, limit, filters);
    
    // Track search event (don't await to avoid blocking the response)
    if (searchQuery || Object.keys(filters).length > 0) {
      trackMarketplaceEvent('search_query', undefined, undefined, {
        filters,
        page,
        limit,
      });
    }
    
    // Log success metrics
    apiLogger.info('Marketplace builders request successful', {
      totalItems: builders.pagination.total,
      totalPages: builders.pagination.totalPages,
      itemsReturned: builders.data.length
    });

    return NextResponse.json(builders);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isPrismaError = errorMessage.includes('Prisma') || errorMessage.includes('prisma');

    apiLogger.error('Error in marketplace builders endpoint:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      isPrismaError
    });

    // Enhanced error details for debugging
    const errorDetails = {
      type: isPrismaError ? 'database_error' : 'server_error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    };

    // Return a friendly error message with empty data to prevent UI crashes
    return NextResponse.json(
      {
        error: 'Failed to fetch builders',
        errorDetails: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        data: [],
        pagination: {
          page: 1,
          limit: 9,
          total: 0,
          totalPages: 0,
          hasMore: false
        }
      },
      { status: 500 }
    );
  }
}