import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSkills } from '@/lib/marketplace/real-data/marketplace-service';

/**
 * GET handler for fetching available marketplace filters
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get available skills
    let availableSkills: string[] = [];
    try {
      availableSkills = await getAvailableSkills();
    } catch (error) {
      console.error('Error fetching available skills:', error);
      // Continue with empty skills array
    }
    
    // Validation tiers
    const validationTiers = [
      { value: 'entry', label: 'Entry Level' },
      { value: 'established', label: 'Established' },
      { value: 'expert', label: 'Expert' }
    ];
    
    // Availability options
    const availability = [
      { value: 'available', label: 'Available Now' },
      { value: 'limited', label: 'Limited Availability' },
      { value: 'unavailable', label: 'Unavailable' }
    ];
    
    // Sort options
    const sortOptions = [
      { value: 'rating', label: 'Highest Rated' },
      { value: 'projects', label: 'Most Projects' },
      { value: 'recent', label: 'Recently Joined' }
    ];
    
    return NextResponse.json({
      skills: availableSkills.map(skill => ({ value: skill, label: skill })),
      validationTiers,
      availability,
      sortOptions
    });
  } catch (error) {
    console.error('Error in marketplace filters endpoint:', error);
    // Return empty filters instead of error
    return NextResponse.json({
      skills: [],
      validationTiers: [
        { value: 'entry', label: 'Entry Level' },
        { value: 'established', label: 'Established' },
        { value: 'expert', label: 'Expert' }
      ],
      availability: [
        { value: 'available', label: 'Available Now' },
        { value: 'limited', label: 'Limited Availability' },
        { value: 'unavailable', label: 'Unavailable' }
      ],
      sortOptions: [
        { value: 'rating', label: 'Highest Rated' },
        { value: 'projects', label: 'Most Projects' },
        { value: 'recent', label: 'Recently Joined' }
      ]
    });
  }
}
