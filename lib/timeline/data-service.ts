import { AICapability, Domain, TimelineFilters } from './types';

/**
 * Fetch AI capabilities from the API with pagination and filtering
 * 
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @param filters Optional filters to apply
 * @returns Paginated capabilities
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
    // Build URL with query parameters
    const url = new URL('/api/timeline/capabilities', window.location.origin);
    
    // Add pagination
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    // Add filters if provided
    if (filters?.domains && filters.domains.length > 0) {
      url.searchParams.append('domains', filters.domains.join(','));
    }
    
    if (filters?.showModelImprovements !== undefined) {
      url.searchParams.append('showModelImprovements', filters.showModelImprovements.toString());
    }
    
    if (filters?.dateRange?.start) {
      url.searchParams.append('dateStart', filters.dateRange.start);
    }
    
    if (filters?.dateRange?.end) {
      url.searchParams.append('dateEnd', filters.dateRange.end);
    }
    
    // Make request
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    throw new Error('Failed to fetch timeline data');
  }
}

/**
 * Get all available domains from the API
 */
export async function getAvailableDomains(): Promise<Domain[]> {
  try {
    const response = await fetch('/api/timeline/domains');
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.domains;
  } catch (error) {
    console.error('Error fetching domains:', error);
    throw new Error('Failed to fetch available domains');
  }
}

/**
 * Get date range for the entire timeline
 */
export async function getTimelineRange() {
  try {
    const response = await fetch('/api/timeline/range');
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching timeline range:', error);
    throw new Error('Failed to fetch timeline date range');
  }
}
