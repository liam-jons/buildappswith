import { db } from '@/lib/db';
import { AICapability, Domain, TimelineFilters } from '@/lib/timeline/types';
import { Prisma } from '@prisma/client';

/**
 * Fetch AI capabilities with pagination and filtering
 * 
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @param filters Optional filters to apply
 * @returns Paginated capabilities with full metadata
 */
export async function fetchCapabilities(
  page: number = 1,
  limit: number = 5,
  filters?: {
    domains?: string[],
    showModelImprovements?: boolean,
    dateRange?: {
      start: string,
      end: string
    }
  }
) {
  try {
    // Build where clause based on filters
    const where: Prisma.AICapabilityWhereInput = {};
    
    // Apply domain filters
    if (filters?.domains && filters.domains.length > 0) {
      where.domain = {
        in: filters.domains,
      };
    }
    
    // Apply model improvement filter
    if (filters?.showModelImprovements === false) {
      where.isModelImprovement = false;
    }
    
    // Apply date range filter
    if (filters?.dateRange) {
      const { start, end } = filters.dateRange;
      
      if (start) {
        where.date = {
          ...where.date,
          gte: new Date(start),
        };
      }
      
      if (end) {
        where.date = {
          ...where.date,
          lte: new Date(end),
        };
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await db.aICapability.count({ where });
    
    // Fetch capabilities with their related data
    const capabilities = await db.aICapability.findMany({
      where,
      orderBy: {
        date: 'desc', // Newest first
      },
      skip,
      take: limit,
      include: {
        examples: true,
        limitations: {
          select: {
            description: true,
          }
        },
        technicalRequirements: {
          select: {
            description: true,
          }
        }
      }
    });
    
    // Transform data to match our API interface
    const transformedData: AICapability[] = capabilities.map(capability => ({
      id: capability.id,
      date: capability.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      title: capability.title,
      description: capability.description,
      domain: capability.domain as Domain,
      isModelImprovement: capability.isModelImprovement,
      modelName: capability.modelName || undefined,
      source: capability.source || undefined,
      verified: capability.verified,
      examples: capability.examples.map(example => ({
        title: example.title,
        description: example.description,
        implementation: example.implementation || undefined,
      })),
      limitations: capability.limitations.map(limitation => limitation.description),
      technicalRequirements: capability.technicalRequirements.map(req => req.description),
    }));
    
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
    console.error('Error fetching capabilities:', error);
    throw new Error('Failed to fetch AI capabilities');
  }
}

/**
 * Get all available domains from capabilities
 * 
 * @returns Array of unique domains
 */
export async function getAvailableDomains(): Promise<Domain[]> {
  try {
    const domains = await db.aICapability.findMany({
      select: {
        domain: true
      },
      distinct: ['domain']
    });
    
    return domains.map(d => d.domain) as Domain[];
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw new Error('Failed to fetch available domains');
  }
}

/**
 * Get date range for the entire timeline
 * 
 * @returns Object with start and end dates
 */
export async function getTimelineRange() {
  try {
    const [oldest, newest] = await Promise.all([
      db.aICapability.findFirst({
        orderBy: {
          date: 'asc'
        },
        select: {
          date: true
        }
      }),
      db.aICapability.findFirst({
        orderBy: {
          date: 'desc'
        },
        select: {
          date: true
        }
      })
    ]);
    
    return {
      start: oldest?.date.toISOString().split('T')[0] || '',
      end: newest?.date.toISOString().split('T')[0] || ''
    };
  } catch (error) {
    console.error('Error fetching timeline range:', error);
    throw new Error('Failed to fetch timeline date range');
  }
}
