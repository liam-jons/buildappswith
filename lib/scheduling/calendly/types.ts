/**
 * Calendly integration types
 * Version: 1.0.0
 * 
 * TypeScript type definitions for Calendly integration
 */

import type { 
  CalendlyEventType, 
  CalendlyEvent, 
  CalendlyInvitee 
} from './api-client'

/**
 * Calendly event type mapped to our system
 */
export interface MappedCalendlyEventType {
  id: string
  calendlyEventTypeId: string
  calendlyEventTypeUri: string
  title: string
  description: string
  durationMinutes: number
  price: number
  currency: string
  color: string
  isActive: boolean
  maxParticipants?: number
  builderId: string
}

/**
 * Calendly booking mapped to our system
 */
export interface MappedCalendlyBooking {
  id?: string
  builderId: string
  clientId: string
  sessionTypeId: string
  calendlyEventId: string
  calendlyEventUri: string
  calendlyInviteeUri: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED'
  amount?: number
  stripeSessionId?: string
  clientTimezone?: string
  builderTimezone?: string
}

/**
 * Request to create a Calendly scheduling link
 */
export interface CalendlySchedulingLinkRequest {
  eventTypeId: string
  name: string
  email: string
  timezone?: string
  sessionTypeId: string
  clientId: string
  returnUrl: string
}

/**
 * Response with Calendly scheduling link
 */
export interface CalendlySchedulingLinkResponse {
  bookingUrl: string
  eventTypeId: string
  sessionTypeId: string
}

/**
 * Calendly event creation webhook payload
 */
export interface CalendlyWebhookEventCreatedPayload {
  event: 'invitee.created'
  payload: {
    event_type: {
      uuid: string
      kind: string
      slug: string
      name: string
      duration: number
      owner: {
        type: string
        uuid: string
      }
    }
    event: {
      uuid: string
      start_time: string
      end_time: string
      location: {
        type: string
        location?: string
        join_url?: string
      }
    }
    invitee: {
      uuid: string
      email: string
      name: string
      timezone: string
      created_at: string
      updated_at: string
      questions_and_answers: {
        question: string
        answer: string
      }[]
      tracking: {
        utm_source?: string
        utm_medium?: string
        utm_campaign?: string
        utm_content?: string
        utm_term?: string
        salesforce_uuid?: string
      }
      cancel_url: string
      reschedule_url: string
      status: string
      text_reminder_number: string | null
      no_show: {
        label: string
      } | null
    }
    questions_and_answers: {
      question: string
      answer: string
    }[]
    cancel_url: string
    reschedule_url: string
  }
}

/**
 * Calendly event cancellation webhook payload
 */
export interface CalendlyWebhookEventCancelledPayload {
  event: 'invitee.canceled'
  payload: {
    event_type: {
      uuid: string
      kind: string
      slug: string
      name: string
      duration: number
      owner: {
        type: string
        uuid: string
      }
    }
    event: {
      uuid: string
      start_time: string
      end_time: string
      location: {
        type: string
        location?: string
        join_url?: string
      }
    }
    invitee: {
      uuid: string
      email: string
      name: string
      timezone: string
      created_at: string
      updated_at: string
      questions_and_answers: {
        question: string
        answer: string
      }[]
      tracking: {
        utm_source?: string
        utm_medium?: string
        utm_campaign?: string
        utm_content?: string
        utm_term?: string
        salesforce_uuid?: string
      }
      cancel_url: string
      reschedule_url: string
      status: string
      text_reminder_number: string | null
      no_show: {
        label: string
      } | null
      cancellation: {
        canceled_by: string
        reason: string
        canceler_type: string
      }
    }
    questions_and_answers: {
      question: string
      answer: string
    }[]
    cancel_url: string
    reschedule_url: string
    cancellation: {
      canceled_by: string
      reason: string
      canceler_type: string
    }
  }
}

/**
 * Calendly webhook payload types
 */
export type CalendlyWebhookPayload = 
  | CalendlyWebhookEventCreatedPayload
  | CalendlyWebhookEventCancelledPayload

/**
 * Calendly service configuration
 */
export interface CalendlyConfig {
  apiToken: string
  organizationUri?: string
  webhookSigningKey?: string
}