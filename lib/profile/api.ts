/**
 * Profile API client functions
 * Version: 1.0.0
 * 
 * Client-side API functions for profile
 */

import { 
  BuilderProfileData, 
  BuilderProfileResponse, 
  BuilderProfileResponseData,
  UpdateBuilderProfileData
} from './types';
import { StandardApiResponse } from '@/lib/types/api-types';

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
      return { success: false, error: { message: error.message || 'Failed to fetch profile', code: 'fetch_error' } };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
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
      return { success: false, error: { message: error.message || 'Failed to fetch profile', code: 'fetch_error' } };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
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
      return { success: false, error: { message: error.message || 'Failed to fetch profile', code: 'fetch_error' } };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
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
): Promise<StandardApiResponse<BuilderProfileResponseData[]>> {
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
      return { success: false, error: { message: error.message || 'Failed to fetch profiles', code: 'fetch_error' } };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
    };
  }
}

/**
 * Create a new builder profile
 */
export async function createBuilderProfile(
  profileData: UpdateBuilderProfileData
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
      return { success: false, error: { message: error.message || 'Failed to create profile', code: 'create_error' } };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
    };
  }
}

/**
 * Update an existing builder profile
 */
export async function updateBuilderProfile(
  id: string,
  profileData: UpdateBuilderProfileData
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
      return { success: false, error: { message: error.message || 'Failed to update profile', code: 'update_error' } };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
    };
  }
}

/**
 * Delete a builder profile
 */
export async function deleteBuilderProfile(id: string): Promise<{ success: boolean; error?: { message: string; code: string } }> {
  try {
    const response = await fetch(`/api/profile/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: { message: error.message || 'Failed to delete profile', code: 'delete_error' } };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: { message: error instanceof Error ? error.message : 'An unexpected error occurred', code: 'unexpected_error' } 
    };
  }
}