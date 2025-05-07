/**
 * Calendly booking flow service
 * Version: 1.0.0
 * 
 * Service for managing the booking flow between Calendly and Stripe
 */

import { createCalendlySchedulingLink } from './client-api'
import type { SessionType } from '@/lib/scheduling/types'
import type { CalendlySchedulingLinkRequest } from './types'

/**
 * Booking flow state
 */
export type BookingFlowState = {
  step: 'SELECT_SESSION_TYPE' | 'SCHEDULE_TIME' | 'CONFIRM_BOOKING' | 'PAYMENT';
  sessionType?: SessionType;
  bookingId?: string;
  schedulingUrl?: string;
  calendlyEventTypeId?: string;
  error?: string;
}

/**
 * Start the booking flow with a selected session type
 * 
 * @param sessionType Selected session type
 * @param user User information
 * @param returnUrl URL to return to after scheduling
 * @returns Next state for the booking flow
 */
export async function startBookingFlow(
  sessionType: SessionType,
  user: {
    id: string;
    name?: string;
    email?: string;
    timezone?: string;
  },
  returnUrl: string
): Promise<BookingFlowState> {
  try {
    // Make sure we have a Calendly event type ID
    if (!sessionType.calendlyEventTypeId) {
      return {
        step: 'SELECT_SESSION_TYPE',
        error: 'This session type is not configured for Calendly scheduling'
      }
    }
    
    // Create the scheduling link for Calendly
    const request: CalendlySchedulingLinkRequest = {
      eventTypeId: sessionType.calendlyEventTypeId,
      name: user.name || '',
      email: user.email || '',
      timezone: user.timezone,
      sessionTypeId: sessionType.id,
      clientId: user.id,
      returnUrl
    }
    
    const result = await createCalendlySchedulingLink(request)
    
    if (!result.success || !result.data) {
      return {
        step: 'SELECT_SESSION_TYPE',
        sessionType,
        error: result.error || 'Failed to create scheduling link'
      }
    }
    
    // Return the next state with the scheduling URL
    return {
      step: 'SCHEDULE_TIME',
      sessionType,
      schedulingUrl: result.data.bookingUrl,
      calendlyEventTypeId: result.data.eventTypeId
    }
  } catch (error) {
    console.error('Error starting booking flow:', error)
    
    return {
      step: 'SELECT_SESSION_TYPE',
      sessionType,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

/**
 * Store booking flow state in session storage
 * 
 * @param state Booking flow state
 */
export function storeBookingFlowState(state: BookingFlowState): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('calendly_booking_flow', JSON.stringify(state))
  }
}

/**
 * Retrieve booking flow state from session storage
 * 
 * @returns Booking flow state or null if not found
 */
export function getBookingFlowState(): BookingFlowState | null {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('calendly_booking_flow')
    
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing booking flow state:', error)
      }
    }
  }
  
  return null
}

/**
 * Clear booking flow state from session storage
 */
export function clearBookingFlowState(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('calendly_booking_flow')
  }
}