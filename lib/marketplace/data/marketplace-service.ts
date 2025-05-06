import { prisma } from '@/lib/db';
import { 
  BuilderProfileListing, 
  BuilderProfileData,
  MarketplaceFilters, 
  PaginatedResponse,
  MarketplaceFilterOptions
} from '../types';
import { Prisma } from '@prisma/client';

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
    const where: Prisma.BuilderProfileWhereInput = {
      searchable: true,
      // Only include profiles if their user is active and not deleted
      user: {
        active: true,
        deletedAt: null,
      }
    };
    
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
    const total = await prisma.builderProfile.count({ where });
    
    // Fetch builders with all required relations
    const builders = await prisma.builderProfile.findMany({
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
    
    // Transform to the expected format
    const builderListings: BuilderProfileListing[] = builders.map((builder) => ({
      id: builder.id,
      userId: builder.userId,
      name: builder.displayName || builder.user.name || 'Unknown Builder',
      displayName: builder.displayName,
      bio: builder.bio || undefined,
      headline: builder.headline || undefined,
      tagline: builder.tagline || undefined,
      avatarUrl: builder.user.imageUrl || undefined,
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
    }));
    
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
    console.error('Error fetching builders:', error);
    throw error;
  }
}

/**
 * Fetch a single builder profile by ID with all details
 */
export async function fetchBuilderById(builderId: string): Promise<BuilderProfileData | null> {
  try {
    const builder = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            active: true,
            deletedAt: true,
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
    
    if (!builder || !builder.user.active || builder.user.deletedAt) {
      return null;
    }
    
    // Transform the data to the expected format
    const builderProfile: BuilderProfileData = {
      id: builder.id,
      userId: builder.userId,
      name: builder.displayName || builder.user.name || 'Unknown Builder',
      displayName: builder.displayName || undefined,
      bio: builder.bio || undefined,
      headline: builder.headline || undefined,
      tagline: builder.tagline || undefined,
      avatarUrl: builder.user.imageUrl || undefined,
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
    
    return builderProfile;
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
    const featuredBuilders = await prisma.builderProfile.findMany({
      where: {
        featured: true,
        searchable: true,
        user: {
          active: true,
          deletedAt: null,
        },
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
    
    // Transform to the expected format
    return featuredBuilders.map((builder) => ({
      id: builder.id,
      userId: builder.userId,
      name: builder.displayName || builder.user.name || 'Unknown Builder',
      displayName: builder.displayName || undefined,
      bio: builder.bio || undefined,
      headline: builder.headline || undefined,
      tagline: builder.tagline || undefined,
      avatarUrl: builder.user.imageUrl || undefined,
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
    }));
  } catch (error) {
    console.error('Error fetching featured builders:', error);
    throw error;
  }
}

/**
 * Get all available skills for marketplace filtering
 */
export async function getAvailableSkills(): Promise<string[]> {
  try {
    // Get skills that at least one builder has
    const builderSkills = await prisma.builderSkill.findMany({
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
    const builderProfile = await prisma.builderProfile.findFirst({
      where: {
        userId,
        user: {
          active: true,
          deletedAt: null,
        },
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