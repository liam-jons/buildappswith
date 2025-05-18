/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Use `api.ts` for client-side API functions and `data/marketplace-service.ts` for server-side operations.
 */

import { BuilderProfileData } from "@/components/profile/builder-profile";
import { 
  MarketplaceFilters, 
  BuildersResponse, 
  MarketplaceFilterOptions,
  PaginatedResponse
} from "./types";

/**
 * Fetch builders from the API with pagination and filtering
 * @deprecated Use `api.ts:fetchBuilders` instead
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
    
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
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
 * @deprecated Use `api.ts:fetchBuilderById` instead
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
 * @deprecated Use `api.ts:fetchFeaturedBuilders` instead
 */
export async function fetchFeaturedBuilders(limit: number = 3): Promise<BuilderProfileData[]> {
  try {
    const response = await fetch(`/api/marketplace/featured?limit=${limit}`);
    
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
 * @deprecated Use `api.ts:fetchMarketplaceFilterOptions` instead
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
