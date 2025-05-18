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
 * Client-side API functions for interacting with marketplace endpoints.
 * These functions handle data fetching and error handling for marketplace-related operations.
 * 
 * @module marketplace/api
 */

/**
 * Fetch builders from the API with pagination and filtering options
 * 
 * @param page - Page number for pagination (starts at 1)
 * @param limit - Number of results per page
 * @param filters - Optional filters to apply to the builder search
 * @returns Promise containing builders response with pagination metadata
 * 
 * @example
 * // Fetch the first page of builders with no filters
 * const builders = await fetchBuilders(1, 10);
 * 
 * @example
 * // Fetch builders with specific validation tiers and skills
 * const filteredBuilders = await fetchBuilders(1, 20, {
 *   validationTiers: ['VERIFIED', 'EXPERT'],
 *   skills: ['react', 'typescript']
 * });
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
 * Fetch a single builder's detailed profile by their unique ID
 * 
 * @param builderId - Unique identifier for the builder
 * @returns Promise containing builder profile data or null if not found
 * 
 * @example
 * // Fetch a builder profile
 * const builder = await fetchBuilderById('builder-123');
 * if (builder) {
 *   console.log(`Found builder: ${builder.name}`);
 * }
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
 * Fetch a list of featured builders for homepage or promotional sections
 * 
 * @param limit - Maximum number of featured builders to return
 * @returns Promise containing an array of builder profile listings
 * 
 * @example
 * // Get 3 featured builders for homepage display
 * const featuredBuilders = await fetchFeaturedBuilders();
 * 
 * @example
 * // Get 5 featured builders for a larger showcase
 * const moreFeaturedBuilders = await fetchFeaturedBuilders(5);
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
 * Fetch available marketplace filter options for UI filter components
 * 
 * @returns Promise containing structured filter options for the marketplace
 * 
 * @example
 * // Get all available filter options
 * const filterOptions = await fetchMarketplaceFilterOptions();
 * console.log(`Available skills: ${filterOptions.skills.length}`);
 * 
 * @throws Will return an empty object with skills array if the API call fails
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
 * 
 * These functions handle fetching analytics data for builder dashboards,
 * including performance metrics, timeseries data, and success indicators.
 * Typically used in dashboard views and reporting interfaces.
 */

/**
 * Fetch analytics summary for builder dashboard
 * 
 * @param period - Time period in days for the analytics data (default: 30)
 * @returns Promise containing summary analytics data
 * 
 * @example
 * // Get last 30 days analytics
 * const summary = await fetchBuilderAnalyticsSummary();
 * 
 * @example
 * // Get last 7 days analytics
 * const weekSummary = await fetchBuilderAnalyticsSummary(7);
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
 * Fetch analytics timeseries data for builder dashboard charts
 * 
 * @param period - Time period in days for the timeseries data (default: 30)
 * @returns Promise containing timeseries analytics data
 * 
 * @example
 * // Get default 30-day timeseries data
 * const timeseries = await fetchBuilderAnalyticsTimeseries();
 * 
 * @example
 * // Get 90-day timeseries for quarterly analysis
 * const quarterlyData = await fetchBuilderAnalyticsTimeseries(90);
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
 * Fetch success metrics for builder dashboard performance indicators
 * 
 * @returns Promise containing success metrics data
 * 
 * @example
 * // Get builder success metrics
 * const metrics = await fetchBuilderSuccessMetrics();
 * console.log(`Conversion rate: ${metrics.conversionRate}%`);
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