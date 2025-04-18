import { 
  BuilderSchedulingProfile, 
  SessionType, 
  AvailabilityRule,
  Booking,
  TimeSlot,
  ClientSchedulingProfile
} from '../scheduling/types';
import { mockBuilderSchedulingProfile, mockSessionTypes, mockAvailabilityRules } from '../scheduling/mock-data';

// Base API URL for scheduling endpoints
const SCHEDULING_API_URL = '/api/scheduling';

/**
 * Error handler for API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `API Error: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}

/**
 * Generic API fetcher with error handling
 */
async function apiFetch<T>(
  endpoint: string, 
  options?: RequestInit,
  fallbackData?: T
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    return await handleResponse<T>(response);
  } catch (error) {
    console.error(`API fetch error for ${endpoint}:`, error);
    
    // If fallback data is provided, return it instead of throwing
    if (fallbackData !== undefined) {
      console.warn(`Using fallback data for ${endpoint}`);
      return fallbackData as T;
    }
    
    throw error;
  }
}

/**
 * Get builder scheduling profile
 */
export async function getBuilderProfile(
  builderId: string
): Promise<{ profile: BuilderSchedulingProfile; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/profiles/builder/${builderId}`,
    undefined,
    { profile: {
      ...mockBuilderSchedulingProfile,
      builderId
    }}
  );
}

/**
 * Get session types for a builder
 */
export async function getSessionTypes(
  builderId: string
): Promise<{ sessionTypes: SessionType[]; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/session-types?builderId=${builderId}`,
    undefined,
    { 
      sessionTypes: mockSessionTypes.filter(st => st.builderId === builderId),
      warning: 'Using mock data from client' 
    }
  );
}

/**
 * Create a session type
 */
export async function createSessionType(
  sessionType: Omit<SessionType, 'id'>
): Promise<{ sessionType: SessionType; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/session-types`,
    {
      method: 'POST',
      body: JSON.stringify(sessionType),
    },
    {
      sessionType: {
        id: `mock-${Date.now()}`,
        ...sessionType
      },
      warning: 'Using mock data from client'
    }
  );
}

/**
 * Update a session type
 */
export async function updateSessionType(
  id: string,
  updates: Partial<Omit<SessionType, 'id'>>
): Promise<{ sessionType: SessionType; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/session-types/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    {
      sessionType: {
        id,
        builderId: updates.builderId || 'unknown',
        title: updates.title || 'Unknown',
        description: updates.description || '',
        durationMinutes: updates.durationMinutes || 60,
        price: updates.price || 0,
        currency: updates.currency || 'USD',
        isActive: updates.isActive !== undefined ? updates.isActive : true,
        color: updates.color,
      },
      warning: 'Using mock data from client'
    }
  );
}

/**
 * Delete a session type
 */
export async function deleteSessionType(
  id: string
): Promise<{ success: boolean; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/session-types/${id}`,
    {
      method: 'DELETE',
    },
    { success: true, warning: 'Using mock data from client' }
  );
}

/**
 * Get availability rules for a builder
 */
export async function getAvailabilityRules(
  builderId: string
): Promise<{ rules: AvailabilityRule[]; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/availability/rules?builderId=${builderId}`,
    undefined,
    { 
      rules: mockAvailabilityRules.filter(rule => rule.builderId === builderId),
      warning: 'Using mock data from client' 
    }
  );
}

/**
 * Create an availability rule
 */
export async function createAvailabilityRule(
  rule: Omit<AvailabilityRule, 'id'>
): Promise<{ rule: AvailabilityRule; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/availability/rules`,
    {
      method: 'POST',
      body: JSON.stringify(rule),
    },
    {
      rule: {
        id: `mock-${Date.now()}`,
        ...rule
      },
      warning: 'Using mock data from client'
    }
  );
}

/**
 * Update an availability rule
 */
export async function updateAvailabilityRule(
  id: string,
  updates: Partial<Omit<AvailabilityRule, 'id'>>
): Promise<{ rule: AvailabilityRule; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/availability/rules/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    {
      rule: {
        id,
        builderId: updates.builderId || 'unknown',
        dayOfWeek: updates.dayOfWeek !== undefined 
          ? updates.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6 
          : 1,
        startTime: updates.startTime || '09:00',
        endTime: updates.endTime || '17:00',
        isRecurring: updates.isRecurring !== undefined ? updates.isRecurring : true,
      },
      warning: 'Using mock data from client'
    }
  );
}

/**
 * Delete an availability rule
 */
export async function deleteAvailabilityRule(
  id: string
): Promise<{ success: boolean; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/availability/rules/${id}`,
    {
      method: 'DELETE',
    },
    { success: true, warning: 'Using mock data from client' }
  );
}

/**
 * Get available time slots for a builder
 */
export async function getAvailableTimeSlots(
  builderId: string,
  startDate: string,
  endDate: string,
  sessionTypeId?: string
): Promise<{ slots: TimeSlot[]; warning?: string }> {
  let endpoint = `${SCHEDULING_API_URL}/availability/time-slots?builderId=${builderId}&startDate=${startDate}&endDate=${endDate}`;
  
  if (sessionTypeId) {
    endpoint += `&sessionTypeId=${sessionTypeId}`;
  }
  
  return apiFetch(
    endpoint,
    undefined,
    { 
      slots: [], // This would need a more complex mock implementation
      warning: 'Using mock data from client' 
    }
  );
}

/**
 * Get bookings for a builder or client
 */
export async function getBookings({
  builderId,
  clientId,
  startDate,
  endDate,
  status
}: {
  builderId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}): Promise<{ bookings: Booking[]; warning?: string }> {
  let params = new URLSearchParams();
  
  if (builderId) params.append('builderId', builderId);
  if (clientId) params.append('clientId', clientId);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);
  
  return apiFetch(
    `${SCHEDULING_API_URL}/bookings?${params.toString()}`,
    undefined,
    { 
      bookings: [], // This would need more complex mock implementation
      warning: 'Using mock data from client' 
    }
  );
}

/**
 * Create a booking
 */
export async function createBooking(
  booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ booking: Booking; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/bookings`,
    {
      method: 'POST',
      body: JSON.stringify(booking),
    },
    {
      booking: {
        id: `mock-${Date.now()}`,
        ...booking,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      warning: 'Using mock data from client'
    }
  );
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<{ booking: Booking; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/bookings/${bookingId}/status`,
    {
      method: 'PUT',
      body: JSON.stringify({ status }),
    },
    {
      booking: {
        id: bookingId,
        sessionTypeId: '',
        builderId: '',
        clientId: '',
        startTime: '',
        endTime: '',
        status,
        clientTimezone: '',
        builderTimezone: '',
        createdAt: '',
        updatedAt: new Date().toISOString(),
      },
      warning: 'Using mock data from client'
    }
  );
}

/**
 * Get client scheduling profile
 */
export async function getClientProfile(
  clientId: string
): Promise<{ profile: ClientSchedulingProfile; warning?: string }> {
  return apiFetch(
    `${SCHEDULING_API_URL}/profiles/client/${clientId}`,
    undefined,
    { 
      profile: {
        clientId,
        timezone: 'America/New_York',
        preferredSessionTypes: [],
        bookings: []
      },
      warning: 'Using mock data from client'
    }
  );
}
