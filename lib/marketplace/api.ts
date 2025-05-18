import { 
  BuilderProfileListing, 
  BuilderProfileData, 
  MarketplaceFilters, 
  MarketplaceFilterOptions,
  BuildersResponse,
  PaginatedResponse,
  AnalyticsSummary,
  AnalyticsTimeseries,
  SuccessMetrics,
  AnalyticsPeriod
} from './types';

/**
 * Marketplace API
 * Version: 1.1.0
 * 
 * Client-side API functions for interacting with marketplace endpoints
 */

/**
 * Fetch builders from the API with pagination and filtering
 */
export async function fetchBuilders(
  page: number = 1, 
  limit: number = 9,
  filters?: MarketplaceFilters
): Promise<BuildersResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (filters?.searchQuery) {
      params.append('search', filters.searchQuery);
    }
    
    if (filters?.validationTiers && filters.validationTiers.length > 0) {
      params.append('validationTiers', filters.validationTiers.join(','));
    }
    
    if (filters?.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','));
    }
    
    if (filters?.availability && filters.availability.length > 0) {
      params.append('availability', filters.availability.join(','));
    }
    
    if (filters?.adhd_focus !== undefined) {
      params.append('adhd_focus', filters.adhd_focus.toString());
    }
    
    if (filters?.featured !== undefined) {
      params.append('featured', filters.featured.toString());
    }
    
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    
    if (filters?.minHourlyRate !== undefined) {
      params.append('minHourlyRate', filters.minHourlyRate.toString());
    }
    
    if (filters?.maxHourlyRate !== undefined) {
      params.append('maxHourlyRate', filters.maxHourlyRate.toString());
    }
    
    // Fetch data from API
    const response = await fetch(`/api/marketplace/builders?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch builders: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching builders:", error);
    throw error;
  }
}

/**
 * Fetch a single builder by ID
 */
export async function fetchBuilderById(builderId: string): Promise<BuilderProfileData | null> {
  try {
    const response = await fetch(`/api/marketplace/builders/${builderId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch builder: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching builder ${builderId}:`, error);
    throw error;
  }
}

/**
 * Fetch featured builders
 */
export async function fetchFeaturedBuilders(limit: number = 3): Promise<BuilderProfileListing[]> {
  try {
    const response = await fetch(`/api/marketplace/builders?featured=true&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured builders: ${response.status}`);
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching featured builders:", error);
    throw error;
  }
}

/**
 * Fetch available marketplace filter options
 */
export async function fetchMarketplaceFilterOptions(): Promise<MarketplaceFilterOptions> {
  try {
    const response = await fetch('/api/marketplace/filters');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch filter options: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching marketplace filters:", error);
    // Return empty filters as fallback
    return { skills: [] };
  }
}

/**
 * Analytics API Functions
 */

/**
 * Fetch analytics summary for builder dashboard
 */
export async function fetchBuilderAnalyticsSummary(period: number = 30): Promise<AnalyticsSummary> {
  try {
    const response = await fetch(`/api/marketplace/builders/analytics?metrics=summary&period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics summary: ${response.status}`);
    }
    
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    // Return mock data as fallback
    return {
      profileViews: 0,
      profileViewsChange: 0,
      searchAppearances: 0,
      searchAppearancesChange: 0,
      bookingRequests: 0,
      bookingRequestsChange: 0,
      conversionRate: 0,
      conversionRateChange: 0
    };
  }
}

/**
 * Fetch analytics timeseries for builder dashboard
 */
export async function fetchBuilderAnalyticsTimeseries(period: number = 30): Promise<AnalyticsTimeseries> {
  try {
    const response = await fetch(`/api/marketplace/builders/analytics?metrics=timeseries&period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics timeseries: ${response.status}`);
    }
    
    const data = await response.json();
    return data.timeseries;
  } catch (error) {
    console.error("Error fetching analytics timeseries:", error);
    // Return empty timeseries as fallback
    return {
      profileViews: [],
      searchAppearances: [],
      bookingRequests: []
    };
  }
}

/**
 * Fetch success metrics for builder dashboard
 */
export async function fetchBuilderSuccessMetrics(): Promise<SuccessMetrics> {
  try {
    const response = await fetch('/api/marketplace/builders/analytics?metrics=success');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch success metrics: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error fetching success metrics:", error);
    // Return empty metrics as fallback
    return { metrics: [] };
  }
}