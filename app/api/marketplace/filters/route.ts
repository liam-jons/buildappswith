import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceFilterOptions } from '@/lib/marketplace';

/**
 * GET handler for fetching available marketplace filter options
 */
export async function GET(request: NextRequest) {
  try {
    // Get all available marketplace filter options from the data service
    const filterOptions = await getMarketplaceFilterOptions();
    
    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error('Error in marketplace filters endpoint:', error);
    
    // Provide fallback filter options in case of error
    return NextResponse.json({
      skills: [],
      validationTiers: [
        { value: 1, label: 'Entry Level' },
        { value: 2, label: 'Established' },
        { value: 3, label: 'Expert' }
      ],
      availability: [
        { value: 'available', label: 'Available Now' },
        { value: 'limited', label: 'Limited Availability' },
        { value: 'unavailable', label: 'Unavailable' }
      ],
      sortOptions: [
        { value: 'featured', label: 'Featured' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'projects', label: 'Most Projects' },
        { value: 'hourly_rate_asc', label: 'Hourly Rate: Low to High' },
        { value: 'hourly_rate_desc', label: 'Hourly Rate: High to Low' },
        { value: 'validation', label: 'Validation Level' },
        { value: 'recent', label: 'Recently Joined' }
      ]
    });
  }
}