/**
 * Calendly client-side API utilities
 * Version: 1.0.0
 * 
 * Client-side functions for interacting with Calendly API endpoints
 */

import { logger } from '@/lib/logger'
import type { 
  CalendlySchedulingLinkRequest,
  CalendlySchedulingLinkResponse, 
  MappedCalendlyEventType
} from './types'

/**
 * Fetch Calendly event types mapped to session types
 * 
 * @returns List of mapped event types
 */
export async function getCalendlyEventTypes(): Promise<{
  success: boolean;
  eventTypes?: MappedCalendlyEventType[];
  error?: string;
}> {
  try {
    const response = await fetch('/api/scheduling/calendly/event-types', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to fetch Calendly event types'
      }
    }
    
    const data = await response.json()
    return {
      success: true,
      eventTypes: data.eventTypes
    }
  } catch (error) {
    logger.error('Error fetching Calendly event types', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create a Calendly scheduling link
 * 
 * @param request Scheduling link request
 * @returns Scheduling link response
 */
export async function createCalendlySchedulingLink(
  request: CalendlySchedulingLinkRequest
): Promise<{
  success: boolean;
  data?: CalendlySchedulingLinkResponse;
  error?: string;
}> {
  try {
    const response = await fetch('/api/scheduling/calendly/scheduling-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || 'Failed to create Calendly scheduling link'
      }
    }
    
    const data = await response.json()
    return {
      success: true,
      data
    }
  } catch (error) {
    logger.error('Error creating Calendly scheduling link', { error })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}