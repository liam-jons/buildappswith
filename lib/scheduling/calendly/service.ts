/**
 * Calendly service
 * Version: 1.0.0
 * 
 * Service for interacting with Calendly API and mapping data to our system
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'
import { CalendlyApiClient, getCalendlyApiClient } from './api-client'
import type { 
  MappedCalendlyEventType, 
  MappedCalendlyBooking,
  CalendlySchedulingLinkRequest, 
  CalendlySchedulingLinkResponse,
  CalendlyWebhookPayload
} from './types'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * Calendly service class
 */
export class CalendlyService {
  private client: CalendlyApiClient

  /**
   * Create a new Calendly service
   * 
   * @param client Calendly API client
   */
  constructor(client: CalendlyApiClient) {
    this.client = client
  }

  /**
   * Get all event types for the current user
   * 
   * @returns List of mapped event types
   */
  async getEventTypes(): Promise<MappedCalendlyEventType[]> {
    try {
      // Get current user to ensure proper authentication
      const user = await this.client.getCurrentUser()
      
      // Get event types for the user
      const response = await this.client.getEventTypes({ userUri: user.resource.uri })
      
      // Map event types to our system format
      return response.collection.map(eventType => ({
        id: '', // This will be filled in from our database
        calendlyEventTypeId: eventType.uri.split('/').pop() || '',
        calendlyEventTypeUri: eventType.uri,
        title: eventType.name,
        description: eventType.description || `${eventType.name} - ${eventType.duration} minutes`,
        durationMinutes: eventType.duration,
        price: 0, // Price will be set in our system
        currency: 'USD', // Default currency
        color: eventType.color,
        isActive: eventType.active,
        builderId: '', // This will be filled in from our context
        maxParticipants: 1, // Default to 1 participant
      }))
    } catch (error) {
      logger.error('Failed to get Calendly event types', { error })
      throw error
    }
  }

  /**
   * Create a scheduling link for a Calendly event
   * 
   * @param request Scheduling link request
   * @returns Scheduling link response with booking URL
   */
  async createSchedulingLink(request: CalendlySchedulingLinkRequest): Promise<CalendlySchedulingLinkResponse> {
    try {
      // Get the event type details
      const eventType = await this.client.getEventType(request.eventTypeId)
      
      if (!eventType) {
        throw new Error(`Event type not found: ${request.eventTypeId}`)
      }
      
      // Create the scheduling URL with prefilled information
      const baseUrl = eventType.resource.scheduling_url
      const params = new URLSearchParams()
      
      // Add user information if provided
      if (request.name) params.append('name', request.name)
      if (request.email) params.append('email', request.email)
      
      // Add timezone if provided
      if (request.timezone) params.append('timezone', request.timezone)
      
      // Add custom tracking parameters for our application
      params.append('utm_source', 'buildappswith')
      params.append('utm_medium', 'scheduling')
      params.append('utm_campaign', 'booking')
      params.append('session_type_id', request.sessionTypeId)
      params.append('client_id', request.clientId)
      params.append('return_url', encodeURIComponent(request.returnUrl))
      
      // Construct the full booking URL
      const bookingUrl = `${baseUrl}?${params.toString()}`
      
      return {
        bookingUrl,
        eventTypeId: request.eventTypeId,
        sessionTypeId: request.sessionTypeId
      }
    } catch (error) {
      logger.error('Failed to create Calendly scheduling link', { error, request })
      throw error
    }
  }

  /**
   * Process a Calendly webhook event
   * 
   * @param payload Webhook payload
   * @returns Processed booking information
   */
  async processWebhookEvent(payload: CalendlyWebhookPayload): Promise<MappedCalendlyBooking | null> {
    try {
      // Extract event type based on the webhook event
      const eventType = payload.event
      
      switch (eventType) {
        case 'invitee.created':
          return this.processEventCreated(payload)
        case 'invitee.canceled':
          return this.processEventCancelled(payload)
        default:
          logger.warn('Unhandled Calendly webhook event type', { eventType })
          return null
      }
    } catch (error) {
      logger.error('Error processing Calendly webhook', { error, payload })
      throw error
    }
  }

  /**
   * Process an event created webhook
   * 
   * @param payload Event created payload
   * @returns Mapped booking information
   */
  private async processEventCreated(payload: CalendlyWebhookPayload): Promise<MappedCalendlyBooking | null> {
    if (payload.event !== 'invitee.created') return null
    
    const { event, event_type, invitee, questions_and_answers } = payload.payload
    
    // Extract session type ID from custom tracking parameters if present
    const qnaMap = new Map(questions_and_answers.map(qa => [qa.question, qa.answer]))
    const trackingInfo = invitee.tracking || {}
    
    // Look for our custom parameters in tracking or questions
    let sessionTypeId = ''
    let clientId = ''
    
    // Try to extract from tracking UTM parameters
    if (trackingInfo.utm_campaign === 'booking' && trackingInfo.utm_source === 'buildappswith') {
      // Parse from UTM content
      if (trackingInfo.utm_content) {
        try {
          const params = new URLSearchParams(trackingInfo.utm_content)
          sessionTypeId = params.get('session_type_id') || ''
          clientId = params.get('client_id') || ''
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    // If not found in tracking, look for a custom question that might have it
    if (!sessionTypeId || !clientId) {
      for (const qa of questions_and_answers) {
        if (qa.question.includes('session_type_id')) {
          sessionTypeId = qa.answer
        }
        if (qa.question.includes('client_id')) {
          clientId = qa.answer
        }
      }
    }
    
    // If we still don't have the session type ID or client ID, we can't process this booking
    if (!sessionTypeId || !clientId) {
      logger.warn('Unable to extract session type ID or client ID from Calendly webhook', {
        eventId: event.uuid,
        inviteeId: invitee.uuid,
        tracking: trackingInfo,
        questions: questions_and_answers
      })
      return null
    }
    
    // Find the associated session type to get builder ID and other details
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      include: { builder: true }
    })
    
    if (!sessionType) {
      logger.warn('Session type not found for Calendly booking', {
        sessionTypeId,
        eventId: event.uuid
      })
      return null
    }
    
    // Get client information
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    })
    
    if (!client) {
      logger.warn('Client not found for Calendly booking', {
        clientId,
        eventId: event.uuid
      })
      return null
    }
    
    // Map to our booking format
    return {
      builderId: sessionType.builderId,
      clientId,
      sessionTypeId,
      calendlyEventId: event.uuid,
      calendlyEventUri: `https://api.calendly.com/scheduled_events/${event.uuid}`,
      calendlyInviteeUri: `https://api.calendly.com/scheduled_events/${event.uuid}/invitees/${invitee.uuid}`,
      title: sessionType.title,
      description: sessionType.description,
      startTime: event.start_time,
      endTime: event.end_time,
      status: 'PENDING', // Default status
      paymentStatus: 'UNPAID', // Default payment status
      amount: sessionType.price.toNumber(),
      clientTimezone: invitee.timezone,
      builderTimezone: sessionType.builder?.timezone || undefined
    }
  }

  /**
   * Process an event cancelled webhook
   * 
   * @param payload Event cancelled payload
   * @returns Mapped booking information
   */
  private async processEventCancelled(payload: CalendlyWebhookPayload): Promise<MappedCalendlyBooking | null> {
    if (payload.event !== 'invitee.canceled') return null
    
    const { event, invitee } = payload.payload
    
    // Find the existing booking for this Calendly event
    const booking = await prisma.booking.findFirst({
      where: {
        calendlyEventId: event.uuid
      },
      include: {
        sessionType: true
      }
    })
    
    if (!booking) {
      logger.warn('Booking not found for Calendly cancellation', {
        eventId: event.uuid,
        inviteeId: invitee.uuid
      })
      return null
    }
    
    // Map to our booking format with cancelled status
    return {
      id: booking.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      sessionTypeId: booking.sessionTypeId || '',
      calendlyEventId: event.uuid,
      calendlyEventUri: `https://api.calendly.com/scheduled_events/${event.uuid}`,
      calendlyInviteeUri: `https://api.calendly.com/scheduled_events/${event.uuid}/invitees/${invitee.uuid}`,
      title: booking.title,
      description: booking.description || undefined,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      status: 'CANCELLED', // Set to cancelled
      paymentStatus: booking.paymentStatus,
      amount: booking.amount?.toNumber(),
      stripeSessionId: booking.stripeSessionId || undefined,
      clientTimezone: booking.clientTimezone || undefined,
      builderTimezone: booking.builderTimezone || undefined
    }
  }
}

// Singleton instance with lazy initialization
let serviceInstance: CalendlyService | null = null

/**
 * Get a singleton instance of the Calendly service
 * 
 * @returns Calendly service
 */
export function getCalendlyService(): CalendlyService {
  if (!serviceInstance) {
    const client = getCalendlyApiClient()
    serviceInstance = new CalendlyService(client)
  }
  
  return serviceInstance
}