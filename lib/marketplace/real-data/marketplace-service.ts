import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { ValidationTier } from '@/components/profile/validation-tier-badge';
import { createPrototypeBuilderProfile } from '@/lib/services/builder-service';

/**
 * Type definitions for marketplace filters
 */
export interface BuilderFilters {
  skills?: string[];
  validationTiers?: ValidationTier[];
  availability?: ('available' | 'limited' | 'unavailable')[];
  searchQuery?: string;
}

/**
 * Transform Prisma BuilderProfile data to match frontend BuilderProfileData interface
 */
function transformBuilderProfile(
  builder: any
): any {
  return {
    id: builder.id,
    name: builder.user.name || '',
    title: builder.headline || '',
    bio: builder.bio || '',
    avatarUrl: builder.user.image,
    coverImageUrl: null, // This would need to be added to the schema if needed
    validationTier: mapValidationTierNumber(builder.validationTier),
    joinDate: builder.user.createdAt,
    completedProjects: 0, // This would need to be calculated from projects table
    rating: builder.rating || 0,
    responseRate: 0, // This would need to be added to the schema if needed
    skills: builder.skills.map((skill: any) => skill.skill.name),
    availability: {
      status: builder.availableForHire ? 'available' : 'unavailable'
    },
    portfolio: builder.portfolioItems || []
  };
}

/**
 * Map numeric validation tier to string representation
 */
function mapValidationTierNumber(tier: number): ValidationTier {
  switch (tier) {
    case 1:
      return 'entry';
    case 2:
      return 'established';
    case 3:
      return 'expert';
    default:
      return 'entry';
  }
}

/**
 * Map string validation tier to numeric representation
 */
function mapValidationTierString(tier: ValidationTier): number {
  switch (tier) {
    case 'entry':
      return 1;
    case 'established':
      return 2;
    case 'expert':
      return 3;
    default:
      return 1;
  }
}

/**
 * Fetch builders with pagination and filtering
 * 
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @param filters Optional filters to apply
 * @returns Paginated builder profiles with metadata
 */
export async function fetchBuilders(
  page: number = 1,
  limit: number = 9,
  filters?: BuilderFilters
) {
  try {
    // Check if there are any builder profiles
    const builderCount = await db.builderProfile.count();
    
    // If no builders exist and we're running in development, create a prototype builder
    if (builderCount === 0 && process.env.NODE_ENV !== 'production') {
      try {
        await createPrototypeBuilderProfile();
        console.log('Created prototype builder profile because none existed');
      } catch (err) {
        console.warn('Failed to create prototype builder profile:', err);
      }
    }
    
    // Build where clause based on filters
    const where: Prisma.BuilderProfileWhereInput = {};

    // Text search across multiple fields
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      where.OR = [
        { headline: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        // Skills are handled separately below
      ];
    }
    
    // Validation tier filter
    if (filters?.validationTiers && filters.validationTiers.length > 0) {
      where.validationTier = {
        in: filters.validationTiers.map(tier => mapValidationTierString(tier))
      };
    }
    
    // Availability filter
    if (filters?.availability && filters.availability.length > 0) {
      // For now we only have availableForHire boolean, so we need to map the availability statuses
      if (filters.availability.includes('available')) {
        where.availableForHire = true;
      } else if (
        filters.availability.includes('unavailable') && 
        !filters.availability.includes('available') &&
        !filters.availability.includes('limited')
      ) {
        where.availableForHire = false;
      }
      // The 'limited' status would require schema changes to properly implement
    }
    
    // Skills filter requires a more complex query
    let skillsFilter = {};
    if (filters?.skills && filters.skills.length > 0) {
      skillsFilter = {
        skills: {
          some: {
            skill: {
              name: {
                in: filters.skills
              }
            }
          }
        }
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await db.builderProfile.count({
      where: {
        ...where,
        ...skillsFilter
      }
    });
    
    // Fetch builders with their related data
    const builders = await db.builderProfile.findMany({
      where: {
        ...where,
        ...skillsFilter
      },
      orderBy: {
        rating: 'desc' // Default sorting by rating
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                domain: true
              }
            }
          }
        }
      }
    });
    
    // Transform builder data to match frontend interface
    const transformedData = builders.map(transformBuilderProfile);
    
    return {
      data: transformedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount
      }
    };
  } catch (error) {
    console.error('Error fetching builders:', error);
    throw new Error('Failed to fetch builders');
  }
}

/**
 * Fetch a single builder by ID
 * 
 * @param builderId The ID of the builder to fetch
 * @returns Builder profile or null if not found
 */
export async function fetchBuilderById(builderId: string) {
  try {
    const builder = await db.builderProfile.findUnique({
      where: {
        id: builderId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                domain: true
              }
            }
          }
        }
      }
    });
    
    if (!builder) {
      return null;
    }
    
    return transformBuilderProfile(builder);
  } catch (error) {
    console.error(`Error fetching builder ${builderId}:`, error);
    throw new Error('Failed to fetch builder profile');
  }
}

/**
 * Fetch featured builders
 * 
 * @param limit Maximum number of featured builders to return
 * @returns Array of featured builder profiles
 */
export async function fetchFeaturedBuilders(limit: number = 3) {
  try {
    const builders = await db.builderProfile.findMany({
      where: {
        featuredBuilder: true
      },
      take: limit,
      orderBy: {
        rating: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                domain: true
              }
            }
          }
        }
      }
    });
    
    return builders.map(transformBuilderProfile);
  } catch (error) {
    console.error('Error fetching featured builders:', error);
    throw new Error('Failed to fetch featured builders');
  }
}

/**
 * Get all available skills from builder profiles
 * 
 * @returns Array of unique skills
 */
export async function getAvailableSkills(): Promise<string[]> {
  try {
    const skills = await db.skill.findMany({
      select: {
        name: true
      },
      where: {
        userSkills: {
          some: {} // Only select skills that are used by at least one builder
        }
      },
      distinct: ['name']
    });
    
    return skills.map(s => s.name);
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw new Error('Failed to fetch available skills');
  }
}
