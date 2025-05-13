import { db } from '@/lib/db';
import {
  BuilderProfileListing,
  BuilderProfileData,
  MarketplaceFilters,
  PaginatedResponse,
  MarketplaceFilterOptions
} from '../types';
import { Prisma } from '@prisma/client';
import { createDomainLogger } from '@/lib/logger';
import { addDemoAccountFilters, enhanceWithDemoStatus } from './demo-account-handler';

// Create a marketplace logger
const marketplaceLogger = createDomainLogger('marketplace-service');

/**
 * Fetch builders with pagination and filtering
 */
export async function fetchBuilders(
  page: number = 1,
  limit: number = 9,
  filters?: MarketplaceFilters
): Promise<PaginatedResponse<BuilderProfileListing>> {
  try {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where conditions
    let where: Prisma.BuilderProfileWhereInput = {
      searchable: true,
      // The User model in the current schema doesn't have deletedAt field
      // So we don't filter by deletedAt
    };
    
    // Apply demo account filtering
    where = addDemoAccountFilters(where, filters);
    
    // Add validation tier filter
    if (filters?.validationTiers && filters.validationTiers.length > 0) {
      where.validationTier = {
        in: filters.validationTiers,
      };
    }
    
    // Add availability filter
    if (filters?.availability && filters.availability.length > 0) {
      where.availability = {
        in: filters.availability,
      };
    }
    
    // Add ADHD focus filter
    if (filters?.adhd_focus !== undefined) {
      where.adhd_focus = filters.adhd_focus;
    }
    
    // Add featured filter
    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }
    
    // Add hourly rate range filter
    if (filters?.minHourlyRate !== undefined || filters?.maxHourlyRate !== undefined) {
      where.hourlyRate = {};
      
      if (filters?.minHourlyRate !== undefined) {
        where.hourlyRate.gte = new Prisma.Decimal(filters.minHourlyRate);
      }
      
      if (filters?.maxHourlyRate !== undefined) {
        where.hourlyRate.lte = new Prisma.Decimal(filters.maxHourlyRate);
      }
    }
    
    // Add skills filter using BuilderSkill relation
    if (filters?.skills && filters.skills.length > 0) {
      where.skills = {
        some: {
          skill: {
            slug: {
              in: filters.skills,
            },
          },
        },
      };
    }
    
    // Add text search for name, bio, headline, or tagline
    if (filters?.searchQuery) {
      where.OR = [
        {
          user: {
            name: {
              contains: filters.searchQuery,
              mode: 'insensitive',
            },
          },
        },
        {
          displayName: {
            contains: filters.searchQuery,
            mode: 'insensitive',
          },
        },
        {
          bio: {
            contains: filters.searchQuery,
            mode: 'insensitive',
          },
        },
        {
          headline: {
            contains: filters.searchQuery,
            mode: 'insensitive',
          },
        },
        {
          tagline: {
            contains: filters.searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }
    
    // Determine sort order
    let orderBy: Prisma.BuilderProfileOrderByWithRelationInput = {};
    
    switch (filters?.sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'projects':
        orderBy = { completedProjects: 'desc' };
        break;
      case 'hourly_rate_asc':
        orderBy = { hourlyRate: 'asc' };
        break;
      case 'hourly_rate_desc':
        orderBy = { hourlyRate: 'desc' };
        break;
      case 'validation':
        orderBy = { validationTier: 'desc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        // Default sort by featured first, then validation tier, then rating
        orderBy = [
          { featured: 'desc' },
          { validationTier: 'desc' },
          { rating: 'desc' },
        ];
    }
    
    // Count total matching builders for pagination
    let total = 0;
    try {
      // Log the count operation for debugging
      marketplaceLogger.debug('Counting builder profiles', { where });
      total = await db.builderProfile.count({ where });
      marketplaceLogger.debug('Count result', { total });
    } catch (countError) {
      marketplaceLogger.error('Error counting builder profiles', {
        error: countError instanceof Error ? countError.message : String(countError),
        where
      });
      // Default to 0 on error to prevent breaking the function
      total = 0;
    }

    // Fetch builders with all required relations
    let builders = [];
    try {
      marketplaceLogger.debug('Finding builder profiles', { where, skip, take: limit });
      
      builders = await db.builderProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            isDemo: true,
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
              },
            },
          },
          orderBy: {
            proficiency: 'desc',
          },
          take: 10, // Limit to top 10 skills
        },
      },
    });
    } catch (findError) {
      marketplaceLogger.error('Error finding builder profiles', {
        error: findError instanceof Error ? findError.message : String(findError),
        where
      });
      // Return empty array on error
      builders = [];
    }

    // Transform to the expected format with user field mapping
    const builderListings: BuilderProfileListing[] = builders.map((builder) => {
      try {
        // Apply user field mapping to handle schema differences
        // Field mapping no longer needed after schema change
        const mappedUser = builder.user;
        marketplaceLogger.debug('User fields', {
          userId: builder.userId,
          hasImageUrl: !!mappedUser.imageUrl,
        });

        // Create base builder profile
      const baseProfile = {
        id: builder.id,
        userId: builder.userId,
        name: builder.displayName || mappedUser.name || 'Unknown Builder',
        displayName: builder.displayName,
        bio: builder.bio || undefined,
        headline: builder.headline || undefined,
        tagline: builder.tagline || undefined,
        // Only use imageUrl after mapping to ensure consistency
        avatarUrl: mappedUser.imageUrl || undefined,
        validationTier: builder.validationTier,
        skills: builder.skills.map((s) => s.skill.name),
        topSkills: builder.topSkills || [],
        hourlyRate: builder.hourlyRate ? Number(builder.hourlyRate) : undefined,
        rating: builder.rating || undefined,
        featured: builder.featured,
        availability: (builder.availability as any) || 'available',
        adhd_focus: builder.adhd_focus,
        completedProjects: builder.completedProjects,
        responseRate: builder.responseRate || undefined,
      };
      
      // Add demo status information
      return enhanceWithDemoStatus(baseProfile, mappedUser);
      } catch (error) {
        marketplaceLogger.error('Error mapping builder to listing', {
          builderId: builder.id,
          error: error instanceof Error ? error.message : String(error)
        });

        // Return a fallback object with required fields to prevent page crashes
        return {
          id: builder.id,
          userId: builder.userId || 'unknown',
          name: builder.displayName || 'Unknown Builder',
          validationTier: builder.validationTier || 1,
          skills: [],
          topSkills: [],
          featured: false,
          availability: 'available',
          adhd_focus: false,
          completedProjects: 0,
          isDemo: false // Default to not a demo account
        };
      }
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: builderListings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    marketplaceLogger.error('Error fetching builders:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      page,
      limit,
      filters
    });

    // Return empty result instead of throwing to prevent page crash
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
}

/**
 * Fetch a single builder profile by ID with all details
 */
export async function fetchBuilderById(builderId: string): Promise<BuilderProfileData | null> {
  try {
    // Log the operation
    marketplaceLogger.debug('Fetching builder profile by ID', { builderId });

    const builder = await db.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            // Remove fields that don't exist in the schema
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
              },
            },
          },
          orderBy: {
            proficiency: 'desc',
          },
        },
        apps: {
          where: {
            // Optional filters for apps if needed
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        sessionTypes: {
          where: {
            isActive: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
    });
    
    if (!builder) {
      return null;
    }
    
    // Transform the data to the expected format
    try {
      // Apply user field mapping to ensure consistent field access
      // Field mapping no longer needed after schema change
      const mappedUser = builder.user;
      marketplaceLogger.debug('User fields for builder profile', {
        userId: builder.userId,
        hasImageUrl: !!mappedUser.imageUrl
      });

      // Create base builder profile data
      const baseProfile: BuilderProfileData = {
        id: builder.id,
        userId: builder.userId,
        name: builder.displayName || mappedUser.name || 'Unknown Builder',
        displayName: builder.displayName || undefined,
        bio: builder.bio || undefined,
        headline: builder.headline || undefined,
        tagline: builder.tagline || undefined,
        // Only use imageUrl after mapping to ensure consistency
        avatarUrl: mappedUser.imageUrl || undefined,
        validationTier: builder.validationTier,
        skills: builder.skills.map((s) => s.skill.name),
        topSkills: builder.topSkills || [],
        hourlyRate: builder.hourlyRate ? Number(builder.hourlyRate) : undefined,
        rating: builder.rating || undefined,
        featured: builder.featured,
        availability: (builder.availability as any) || 'available',
        adhd_focus: builder.adhd_focus,
        completedProjects: builder.completedProjects,
        responseRate: builder.responseRate || undefined,
        slug: builder.slug || undefined,
        socialLinks: builder.socialLinks as any || {},
        domains: builder.domains || [],
        badges: builder.badges || [],
        expertiseAreas: builder.expertiseAreas as Record<string, any> || {},
        portfolioItems: (builder.portfolioItems as any[]) || [],
        apps: builder.apps.map((app) => ({
          id: app.id,
          title: app.title,
          description: app.description,
          imageUrl: app.imageUrl || undefined,
          technologies: app.technologies,
          status: app.status,
          appUrl: app.appUrl || undefined,
          adhd_focused: app.adhd_focused,
        })),
        sessionTypes: builder.sessionTypes.map((session) => ({
          id: session.id,
          title: session.title,
          description: session.description,
          durationMinutes: session.durationMinutes,
          price: Number(session.price),
          currency: session.currency,
          isActive: session.isActive,
          color: session.color || undefined,
        })),
      };

      // Add demo status information
      return enhanceWithDemoStatus(baseProfile, mappedUser);
    } catch (error) {
      marketplaceLogger.error('Error transforming builder profile data', {
        builderId: builder.id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Failed to transform builder profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  } catch (error) {
    console.error(`Error fetching builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Fetch featured builders for homepage or similar displays
 */
export async function fetchFeaturedBuilders(limit: number = 3): Promise<BuilderProfileListing[]> {
  try {
    // Log the operation
    marketplaceLogger.debug('Fetching featured builders', { limit });

    const featuredBuilders = await db.builderProfile.findMany({
      where: {
        featured: true,
        searchable: true,
        // User model doesn't have deletedAt field in current schema
      },
      orderBy: [
        { validationTier: 'desc' },
        { rating: 'desc' },
      ],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            isDemo: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
          orderBy: {
            proficiency: 'desc',
          },
          take: 5,
        },
      },
    });
    
    // Transform to the expected format with user field mapping
    return featuredBuilders.map((builder) => {
      try {
        // Apply user field mapping to handle schema differences
        // Field mapping no longer needed after schema change
        const mappedUser = builder.user;
        marketplaceLogger.debug('User fields for featured builder', {
          userId: builder.userId,
          hasImageUrl: !!mappedUser.imageUrl
        });

        // Create base builder profile
        const baseProfile = {
          id: builder.id,
          userId: builder.userId,
          name: builder.displayName || mappedUser.name || 'Unknown Builder',
          displayName: builder.displayName || undefined,
          bio: builder.bio || undefined,
          headline: builder.headline || undefined,
          tagline: builder.tagline || undefined,
          // Only use imageUrl after mapping to ensure consistency
          avatarUrl: mappedUser.imageUrl || undefined,
          validationTier: builder.validationTier,
          skills: builder.skills.map((s) => s.skill.name),
          topSkills: builder.topSkills || [],
          hourlyRate: builder.hourlyRate ? Number(builder.hourlyRate) : undefined,
          rating: builder.rating || undefined,
          featured: builder.featured,
          availability: (builder.availability as any) || 'available',
          adhd_focus: builder.adhd_focus,
          completedProjects: builder.completedProjects,
          responseRate: builder.responseRate || undefined,
        };
        
        // Add demo status information
        return enhanceWithDemoStatus(baseProfile, mappedUser);
      } catch (error) {
        marketplaceLogger.error('Error mapping featured builder', {
          builderId: builder.id,
          error: error instanceof Error ? error.message : String(error)
        });

        // Return a fallback object with required fields to prevent page crashes
        return {
          id: builder.id,
          userId: builder.userId || 'unknown',
          name: builder.displayName || 'Unknown Builder',
          validationTier: builder.validationTier || 1,
          skills: [],
          topSkills: [],
          featured: true,
          availability: 'available',
          adhd_focus: false,
          completedProjects: 0,
          isDemo: false // Default to not a demo account
        };
      }
    });
  } catch (error) {
    marketplaceLogger.error('Error fetching featured builders:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      limit
    });

    // Return empty array to prevent page crash
    return [];
  }
}

/**
 * Get all available skills for marketplace filtering
 */
export async function getAvailableSkills(): Promise<string[]> {
  try {
    // Get skills that at least one builder has
    const builderSkills = await db.builderSkill.findMany({
      select: {
        skill: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      distinct: ['skillId'],
    });
    
    // Return unique skill names
    return [...new Set(builderSkills.map((s) => s.skill.name))];
  } catch (error) {
    console.error('Error fetching available skills:', error);
    throw error;
  }
}

/**
 * Get all available marketplace filter options
 */
export async function getMarketplaceFilterOptions(): Promise<MarketplaceFilterOptions> {
  try {
    // Get skills
    const skills = await getAvailableSkills();
    
    return {
      // Map skill names to value/label pairs
      skills: skills.map((skill) => ({
        value: skill.toLowerCase().replace(/\s+/g, '-'),
        label: skill,
      })),
      
      // Validation tier options
      validationTiers: [
        { value: 1, label: 'Entry Level' },
        { value: 2, label: 'Established' },
        { value: 3, label: 'Expert' },
      ],
      
      // Availability options
      availability: [
        { value: 'available', label: 'Available Now' },
        { value: 'limited', label: 'Limited Availability' },
        { value: 'unavailable', label: 'Unavailable' },
      ],
      
      // Sort options
      sortOptions: [
        { value: 'featured', label: 'Featured' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'projects', label: 'Most Projects' },
        { value: 'hourly_rate_asc', label: 'Hourly Rate: Low to High' },
        { value: 'hourly_rate_desc', label: 'Hourly Rate: High to Low' },
        { value: 'validation', label: 'Validation Level' },
        { value: 'recent', label: 'Recently Joined' },
      ],
    };
  } catch (error) {
    console.error('Error fetching marketplace filter options:', error);
    throw error;
  }
}

/**
 * Get a builder profile by user ID
 * 
 * @param userId - The ID of the user
 * @returns The builder profile, or null if not found
 */
export async function getBuilderProfileByUserId(userId: string): Promise<{ id: string } | null> {
  try {
    const builderProfile = await db.builderProfile.findFirst({
      where: {
        userId,
        // Remove user.deletedAt filter that doesn't match the schema
      },
      select: {
        id: true,
      },
    });
    
    return builderProfile;
  } catch (error) {
    console.error(`Error fetching builder profile for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Track marketplace analytics event
 */
export async function trackMarketplaceEvent(
  type: string,
  userId?: string,
  builderId?: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    // Implementation for tracking analytics events
    // This could be implemented with a separate analytics service
    console.log('Marketplace event:', { type, userId, builderId, data });
    
    // For now just log the event
  } catch (error) {
    // Don't throw errors for analytics tracking
    console.error('Error tracking marketplace event:', error);
  }
}