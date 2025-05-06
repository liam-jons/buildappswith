/**
 * Profile API client functions
 * Version: 1.0.0
 * 
 * Client-side API functions for profile
 */

import { 
  BuilderProfile, 
  BuilderProfileResponse, 
  BuilderProfilesResponse,
  CreateProfileRequest,
  UpdateProfileRequest
} from './types';

/**
 * Get a builder profile by its ID
 */
export async function getBuilderProfileById(id: string): Promise<BuilderProfileResponse> {
  try {
    const response = await fetch(`/api/profile/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to fetch profile' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Get a builder profile by its slug
 */
export async function getBuilderProfileBySlug(slug: string): Promise<BuilderProfileResponse> {
  try {
    const response = await fetch(`/api/profile/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to fetch profile' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Get a builder profile by Clerk user ID
 */
export async function getBuilderProfileByClerkId(clerkUserId: string): Promise<BuilderProfileResponse> {
  try {
    const response = await fetch(`/api/profile/clerk/${clerkUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to fetch profile' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Get all builder profiles with optional filtering
 */
export async function getAllBuilderProfiles(
  params?: {
    featured?: boolean;
    adhdFocus?: boolean;
    limit?: number;
    page?: number;
  }
): Promise<BuilderProfilesResponse> {
  try {
    let url = '/api/profile';
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
      if (params.adhdFocus !== undefined) queryParams.append('adhdFocus', params.adhdFocus.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to fetch profiles' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Create a new builder profile
 */
export async function createBuilderProfile(
  profileData: CreateProfileRequest
): Promise<BuilderProfileResponse> {
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to create profile' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Update an existing builder profile
 */
export async function updateBuilderProfile(
  id: string,
  profileData: UpdateProfileRequest
): Promise<BuilderProfileResponse> {
  try {
    const response = await fetch(`/api/profile/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to update profile' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Delete a builder profile
 */
export async function deleteBuilderProfile(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/profile/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to delete profile' };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}