/**
 * Calendly API Client
 * Version: 1.1.0
 * 
 * Utility functions for interacting with the Calendly API
 * Enhanced with key rotation and security features
 */

import { logger } from '@/lib/logger'
import { TokenStatus, getCalendlyKeyManager } from './key-manager'

// Base URLs for Calendly API
const CALENDLY_API_BASE_URL = 'https://api.calendly.com'

/**
 * Calendly API error
 */
export class CalendlyApiError extends Error {
  statusCode?: number
  errorCode?: string
  isAuthError: boolean

  constructor(message: string, statusCode?: number, errorCode?: string, isAuthError = false) {
    super(message)
    this.name = 'CalendlyApiError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isAuthError = isAuthError
  }
}

/**
 * Options for API requests
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: Record<string, any>
  queryParams?: Record<string, any>
}

/**
 * Request metrics for monitoring and debugging
 */
interface RequestMetrics {
  endpoint: string
  method: string
  startTime: number
  endTime?: number
  duration?: number
  status?: number
  success: boolean
  error?: string
  retryCount: number
}

/**
 * Available times response from Calendly API
 */
interface CalendlyAvailableTimesResponse {
  collection: Array<{
    status: string;
    invitees_remaining: number;
    start_time: string;
    scheduling_url: string;
  }>;
}

/**
 * Event types response from Calendly API
 */
interface CalendlyEventTypesResponse {
  collection: any[];
  pagination: {
    count: number;
    next_page?: string;
  };
}

/**
 * Event type response from Calendly API
 */
interface CalendlyEventTypeResponse {
  resource: any;
}

/**
 * User response from Calendly API
 */
interface CalendlyUserResponse {
  resource: {
    uri: string;
    current_organization: string;
  };
}

/**
 * Organization response from Calendly API
 */
interface CalendlyOrganizationResponse {
  resource: any;
}

/**
 * Calendly API client class
 */
export class CalendlyApiClient {
  private organizationUri?: string
  private retryCount = 0
  private maxRetries = 3
  private lastRequestMetrics: RequestMetrics[] = []

  /**
   * Create a new Calendly API client
   * 
   * @param organizationUri Optional organization URI
   */
  constructor(organizationUri?: string) {
    this.organizationUri = organizationUri
  }

  /**
   * Get request metrics for the last few API calls
   * 
   * @returns Array of request metrics
   */
  public getRequestMetrics(): RequestMetrics[] {
    return [...this.lastRequestMetrics]
  }

  /**
   * Make an authenticated request to the Calendly API
   * 
   * @param endpoint API endpoint (without base URL)
   * @param options Request options
   * @returns Response data
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, queryParams } = options
    
    // Initialize metrics
    const metrics: RequestMetrics = {
      endpoint,
      method,
      startTime: Date.now(),
      success: false,
      retryCount: this.retryCount
    }
    
    try {
      // Get token from key manager
      const keyManager = getCalendlyKeyManager()
      const token = keyManager.getToken()
      
      // Build URL with query parameters if present
      let url = `${CALENDLY_API_BASE_URL}${endpoint}`
      
      if (queryParams) {
        const params = new URLSearchParams()
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
        
        const queryString = params.toString()
        if (queryString) {
          url += `?${queryString}`
        }
      }
      
      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      
      // Add body for non-GET requests if present
      if (method !== 'GET' && body) {
        requestOptions.body = JSON.stringify(body)
      }
      
      // Make the request
      const response = await fetch(url, requestOptions)
      
      // Update metrics with response data
      metrics.endTime = Date.now()
      metrics.duration = metrics.endTime - metrics.startTime
      metrics.status = response.status
      
      // Handle non-successful responses
      if (!response.ok) {
        let errorMessage = `Calendly API error: ${response.status} ${response.statusText}`
        let errorData: any
        let isAuthError = response.status === 401 || response.status === 403
        
        try {
          errorData = await response.json()
          if (errorData) {
            errorMessage = errorData.message || errorMessage
          }
        } catch (e) {
          // If we can't parse the error response, just use the status text
        }
        
        // Log error details
        logger.error('Calendly API request failed', {
          endpoint,
          method,
          status: response.status,
          error: errorData || response.statusText,
          duration: metrics.duration
        })
        
        // Mark token as failed if authentication error
        if (isAuthError) {
          keyManager.markTokenFailed('CALENDLY_API_TOKEN', TokenStatus.INVALID)
          
          // If we have a secondary token and haven't retried too many times, retry with new token
          if (this.retryCount < this.maxRetries) {
            this.retryCount++
            logger.warn('Retrying Calendly API request with new token', { 
              attempt: this.retryCount, 
              maxRetries: this.maxRetries 
            })
            
            // Store failed metrics and retry
            metrics.success = false
            metrics.error = errorMessage
            this.lastRequestMetrics.unshift(metrics)
            this.trimMetrics()
            
            return this.request<T>(endpoint, options)
          }
          
          // Reset retry count for next requests
          this.retryCount = 0
        }
        
        // Store metrics for failed request
        metrics.success = false
        metrics.error = errorMessage
        this.lastRequestMetrics.unshift(metrics)
        this.trimMetrics()
        
        throw new CalendlyApiError(
          errorMessage,
          response.status,
          errorData?.error || 'unknown_error',
          isAuthError
        )
      }
      
      // Update metrics for successful request
      metrics.success = true
      this.lastRequestMetrics.unshift(metrics)
      this.trimMetrics()
      
      // Reset retry count for next requests
      this.retryCount = 0
      
      // Return the response data
      const data = await response.json()
      return data as T
    } catch (error) {
      // Store metrics for errored request if not already stored
      if (!metrics.endTime) {
        metrics.endTime = Date.now()
        metrics.duration = metrics.endTime - metrics.startTime
        metrics.success = false
        metrics.error = error instanceof Error ? error.message : 'Unknown error'
        this.lastRequestMetrics.unshift(metrics)
        this.trimMetrics()
      }
      
      // Re-throw CalendlyApiError instances
      if (error instanceof CalendlyApiError) {
        throw error
      }
      
      // Log unexpected errors and wrap them
      logger.error('Unexpected error in Calendly API client', {
        endpoint,
        method,
        error,
        retryCount: this.retryCount
      })
      
      // Reset retry count for next requests
      this.retryCount = 0
      
      throw new CalendlyApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'client_error'
      )
    }
  }
  
  /**
   * Trim metrics array to prevent memory issues
   */
  private trimMetrics() {
    if (this.lastRequestMetrics.length > 100) {
      this.lastRequestMetrics = this.lastRequestMetrics.slice(0, 100)
    }
  }

  /**
   * Get the current user for the provided token
   * 
   * @returns Calendly user data
   */
  async getCurrentUser() {
    return this.request<CalendlyUserResponse>('/users/me')
  }

  /**
   * Verify token validity by making a lightweight API call
   * 
   * @returns True if token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      if (error instanceof CalendlyApiError && error.isAuthError) {
        return false
      }
      // For non-auth errors, return true as the token itself might be valid
      return true
    }
  }

  /**
   * Get organization for the current user
   * If organizationUri is provided during client initialization, that will be used
   * Otherwise, it will fetch the user's primary organization
   * 
   * @returns Calendly organization data
   */
  async getOrganization() {
    if (this.organizationUri) {
      return this.request<CalendlyOrganizationResponse>(this.organizationUri.replace(CALENDLY_API_BASE_URL, ''))
    }
    
    // If no organization URI is set, get the user and their primary organization
    const user = await this.getCurrentUser()
    return this.request<CalendlyOrganizationResponse>(user.resource.current_organization.replace(CALENDLY_API_BASE_URL, ''))
  }

  /**
   * Get all event types for the current user or organization
   * 
   * @param options Options for filtering event types
   * @returns List of Calendly event types
   */
  async getEventTypes(options: {
    organizationUri?: string
    userUri?: string
    count?: number
    pageToken?: string
    sort?: string
    useCache?: boolean
    cacheTtlSeconds?: number
  } = {}) {
    // Default cache settings
    const useCache = options.useCache ?? true
    const cacheTtlSeconds = options.cacheTtlSeconds ?? 300 // 5 minutes default
    
    // Check cache for event types if enabled and in production
    if (useCache && process.env.NODE_ENV === 'production') {
      const cacheKey = `calendly_event_types_${JSON.stringify(options)}`
      
      // TODO: Implement caching mechanism (e.g., Redis, in-memory)
      // For now, we'll skip actual caching implementation
    }
    
    // Determine which scope to use (organization, user, or default to current user)
    let queryParams: Record<string, any> = {}
    
    if (options.organizationUri) {
      queryParams.organization = options.organizationUri
    } else if (options.userUri) {
      queryParams.user = options.userUri
    } else {
      // Default to current user
      const user = await this.getCurrentUser()
      queryParams.user = user.resource.uri
    }
    
    // Add pagination and sorting parameters
    if (options.count) queryParams.count = options.count
    if (options.pageToken) queryParams.page_token = options.pageToken
    if (options.sort) queryParams.sort = options.sort
    
    const response = await this.request<CalendlyEventTypesResponse>('/event_types', {
      queryParams
    })
    
    // Store in cache if enabled and in production
    if (useCache && process.env.NODE_ENV === 'production') {
      const cacheKey = `calendly_event_types_${JSON.stringify(options)}`
      
      // TODO: Implement caching mechanism (e.g., Redis, in-memory)
      // For now, we'll skip actual caching implementation
    }
    
    return response
  }

  /**
   * Get available times for an event type
   * 
   * @param eventTypeUri URI of the event type
   * @param startTime Start time in ISO-8601 format
   * @param endTime End time in ISO-8601 format (max 7 days from start)
   * @returns List of available time slots
   */
  async getEventTypeAvailableTimes(
    eventTypeUri: string,
    startTime: Date,
    endTime: Date
  ) {
    // Validate time range (max 7 days)
    const daysDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      throw new CalendlyApiError(
        'Time range cannot exceed 7 days',
        400,
        'invalid_range'
      );
    }

    // Validate times are in the future
    const now = new Date();
    if (startTime < now) {
      throw new CalendlyApiError(
        'Start time must be in the future',
        400,
        'invalid_start_time'
      );
    }

    const queryParams = {
      event_type: eventTypeUri,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    };

    return this.request<CalendlyAvailableTimesResponse>('/event_type_available_times', {
      queryParams
    });
  }

  /**
   * Get details of a specific event type
   * 
   * @param eventTypeUri URI of the event type
   * @param useCache Whether to use cache (default: true)
   * @returns Event type details
   */
  async getEventType(eventTypeUri: string, useCache = true) {
    // Extract the UUID from the URI if a full URI is provided
    const uuid = eventTypeUri.includes('/') 
      ? eventTypeUri.split('/').pop() 
      : eventTypeUri
    
    // Check cache for event type if enabled and in production
    if (useCache && process.env.NODE_ENV === 'production') {
      const cacheKey = `calendly_event_type_${uuid}`
      
      // TODO: Implement caching mechanism (e.g., Redis, in-memory)
      // For now, we'll skip actual caching implementation
    }
    
    const response = await this.request<CalendlyEventTypeResponse>(`/event_types/${uuid}`)
    
    // Store in cache if enabled and in production
    if (useCache && process.env.NODE_ENV === 'production') {
      const cacheKey = `calendly_event_type_${uuid}`
      
      // TODO: Implement caching mechanism (e.g., Redis, in-memory)
      // For now, we'll skip actual caching implementation
    }
    
    return response
  }

  /**
   * Get scheduled events
   * 
   * @param options Options for filtering events
   * @returns List of Calendly events
   */
  async getEvents(options: {
    organizationUri?: string
    userUri?: string
    count?: number
    pageToken?: string
    sort?: string
    minStartTime?: string
    maxStartTime?: string
    status?: 'active' | 'canceled'
    useCache?: boolean
  } = {}) {
    // Default cache settings
    const useCache = options.useCache ?? false // Default to no cache for events as they change frequently
    
    // Determine which scope to use (organization, user, or default to current user)
    let queryParams: Record<string, any> = {}
    
    if (options.organizationUri) {
      queryParams.organization = options.organizationUri
    } else if (options.userUri) {
      queryParams.user = options.userUri
    } else {
      // Default to current user
      const user = await this.getCurrentUser()
      queryParams.user = user.resource.uri
    }
    
    // Add filtering parameters
    if (options.minStartTime) queryParams.min_start_time = options.minStartTime
    if (options.maxStartTime) queryParams.max_start_time = options.maxStartTime
    if (options.status) queryParams.status = options.status
    
    // Add pagination and sorting parameters
    if (options.count) queryParams.count = options.count
    if (options.pageToken) queryParams.page_token = options.pageToken
    if (options.sort) queryParams.sort = options.sort
    
    return this.request<CalendlyEventsResponse>('/scheduled_events', {
      queryParams
    })
  }

  /**
   * Get details of a specific event
   * 
   * @param eventUri URI of the event
   * @returns Event details
   */
  async getEvent(eventUri: string) {
    // Extract the UUID from the URI if a full URI is provided
    const uuid = eventUri.includes('/') 
      ? eventUri.split('/').pop() 
      : eventUri
      
    return this.request<CalendlyEventResponse>(`/scheduled_events/${uuid}`)
  }

  /**
   * Get invitees for a specific event
   * 
   * @param eventUri URI of the event
   * @param options Pagination options
   * @returns List of invitees
   */
  async getEventInvitees(eventUri: string, options: {
    count?: number
    pageToken?: string
    sort?: string
    email?: string
    status?: 'active' | 'canceled'
  } = {}) {
    // Extract the UUID from the URI if a full URI is provided
    const uuid = eventUri.includes('/') 
      ? eventUri.split('/').pop() 
      : eventUri
    
    let queryParams: Record<string, any> = {}
    
    // Add filtering parameters
    if (options.email) queryParams.email = options.email
    if (options.status) queryParams.status = options.status
    
    // Add pagination and sorting parameters
    if (options.count) queryParams.count = options.count
    if (options.pageToken) queryParams.page_token = options.pageToken
    if (options.sort) queryParams.sort = options.sort
    
    return this.request<CalendlyInviteesResponse>(`/scheduled_events/${uuid}/invitees`, {
      queryParams
    })
  }
}

// Singleton instance with lazy initialization
let clientInstance: CalendlyApiClient | null = null

/**
 * Get a singleton instance of the Calendly API client
 * 
 * @returns Calendly API client
 */
export function getCalendlyApiClient(): CalendlyApiClient {
  if (!clientInstance) {
    clientInstance = new CalendlyApiClient()
  }
  
  return clientInstance
}

/**
 * Verify Calendly API token validity
 * 
 * @returns True if token is valid, false otherwise
 */
export async function verifyCalendlyApiToken(): Promise<boolean> {
  try {
    const client = getCalendlyApiClient()
    return await client.verifyToken()
  } catch (error) {
    logger.error('Error verifying Calendly API token', { error })
    return false
  }
}

// Type definitions for Calendly API responses

export interface CalendlyUserResponse {
  resource: {
    uri: string
    name: string
    slug: string
    email: string
    scheduling_url: string
    timezone: string
    avatar_url: string
    created_at: string
    updated_at: string
    current_organization: string
  }
}

export interface CalendlyOrganizationResponse {
  resource: {
    uri: string
    name: string
    is_sandbox: boolean
  }
}

export interface CalendlyEventTypesResponse {
  collection: CalendlyEventType[]
  pagination: CalendlyPagination
}

export interface CalendlyEventTypeResponse {
  resource: CalendlyEventType
}

export interface CalendlyEventsResponse {
  collection: CalendlyEvent[]
  pagination: CalendlyPagination
}

export interface CalendlyEventResponse {
  resource: CalendlyEvent
}

export interface CalendlyInviteesResponse {
  collection: CalendlyInvitee[]
  pagination: CalendlyPagination
}

export interface CalendlyPagination {
  count: number
  next_page: string | null
  next_page_token: string | null
  previous_page: string | null
  previous_page_token: string | null
}

export interface CalendlyEventType {
  uri: string
  name: string
  active: boolean
  slug: string
  scheduling_url: string
  duration: number
  description: string | null
  color: string
  secret: boolean
  type: 'StandardEventType' | 'AdhocEventType'
  created_at: string
  updated_at: string
  profile: {
    type: string
    name: string
    owner: string
  }
  kind: string
  internal_note: string | null
  custom_questions: CalendlyCustomQuestion[]
  pool_resources: {
    type: string
    active: boolean
  }
}

export interface CalendlyCustomQuestion {
  name: string
  type: 'string' | 'text' | 'single_select' | 'multi_select' | 'phone_number' | 'boolean'
  position: number
  enabled: boolean
  required: boolean
  answer_choices?: string[]
  include_other?: boolean
}

export interface CalendlyEvent {
  uri: string
  name: string
  status: 'active' | 'canceled'
  start_time: string
  end_time: string
  event_type: string
  location: {
    type: string
    location?: string
    join_url?: string
  }
  invitees_counter: {
    active: number
    limit: number
    total: number
  }
  created_at: string
  updated_at: string
  event_memberships: {
    user: string
  }[]
  cancellation?: {
    canceled_by: string
    reason: string
    canceler_type: string
  }
}

export interface CalendlyInvitee {
  uri: string
  email: string
  name: string
  status: 'active' | 'canceled'
  questions_and_answers: {
    question: string
    answer: string
  }[]
  timezone: string
  created_at: string
  updated_at: string
  event: string
  text_reminder_number: string | null
  rescheduled: boolean
  old_invitee: string | null
  new_invitee: string | null
  cancel_url: string
  reschedule_url: string
  payment?: {
    external_id: string
    status: string
    amount: number
    currency: string
    terms: string
    successful: boolean
  }
  cancellation?: {
    canceled_by: string
    reason: string
  }
}