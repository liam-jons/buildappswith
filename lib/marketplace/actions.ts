/**
 * Marketplace server actions
 * Version: 1.0.0
 * 
 * Server-side actions for marketplace functionality
 */

import { BuilderProfileListing } from './types';

type GetBuildersParams = {
  categoryId?: string;
  searchQuery?: string;
  sortBy?: string;
};

/**
 * Get builders for marketplace display
 * 
 * Server action to fetch builders with optional filtering
 */
export async function getBuilders(params?: GetBuildersParams): Promise<BuilderProfileListing[]> {
  try {
    // Build the query parameters
    const queryParams = new URLSearchParams();
    
    if (params?.categoryId) {
      queryParams.append('category', params.categoryId);
    }
    
    if (params?.searchQuery) {
      queryParams.append('search', params.searchQuery);
    }
    
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    
    // Add a default page size
    queryParams.append('limit', '12');
    
    // Get the base URL (works in both development and production)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://localhost:3000`;
    
    // Fetch the data from our own API
    const response = await fetch(`${baseUrl}/api/marketplace/builders?${queryParams.toString()}`, {
      // Use cache: no-store to ensure fresh data on each request
      cache: 'no-store',
      // Use standard credentials mode
      credentials: 'same-origin',
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching builders: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error in getBuilders server action:', error);
    // Return an empty array on error to prevent page crashes
    return [];
  }
}