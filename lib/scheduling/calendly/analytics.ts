/**
 * Booking Flow Analytics
 * Version: 1.0.0
 * 
 * Analytics tracking for Calendly booking flow
 */

import { logger } from '@/lib/logger'

/**
 * Analytics event types
 */
export enum AnalyticsEventType {
  // Booking flow steps
  BOOKING_FLOW_STARTED = 'booking_flow_started',
  SESSION_TYPE_SELECTED = 'session_type_selected',
  CALENDLY_WIDGET_LOADED = 'calendly_widget_loaded',
  CALENDLY_WIDGET_ERROR = 'calendly_widget_error',
  TIME_SLOT_SELECTED = 'time_slot_selected',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CREATED = 'booking_created',
  BOOKING_COMPLETED = 'booking_completed',
  BOOKING_ABANDONED = 'booking_abandoned',
  
  // Payment flow events
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_EXPIRED = 'payment_expired',
  PAYMENT_REFUNDED = 'payment_refunded',
  
  // Stripe-specific events
  CHECKOUT_INITIATED = 'checkout_initiated',
  CHECKOUT_SESSION_CREATED = 'checkout_session_created',
  CHECKOUT_COMPLETED = 'checkout_completed',
  CHECKOUT_ABANDONED = 'checkout_abandoned',
  CHECKOUT_EXPIRED = 'checkout_expired',
  
  // Stripe API events
  CHECKOUT_API_REQUESTED = 'checkout_api_requested',
  CHECKOUT_API_SUCCEEDED = 'checkout_api_succeeded',
  CHECKOUT_API_FAILED = 'checkout_api_failed',
  CHECKOUT_API_ERROR = 'checkout_api_error',
  
  // Webhook events
  WEBHOOK_RECEIVED = 'webhook_received',
  WEBHOOK_PROCESSED = 'webhook_processed',
  WEBHOOK_ERROR = 'webhook_error',
  STRIPE_WEBHOOK_RECEIVED = 'stripe_webhook_received',
  STRIPE_WEBHOOK_PROCESSED = 'stripe_webhook_processed',
  STRIPE_WEBHOOK_ERROR = 'stripe_webhook_error',
  
  // Booking management
  BOOKING_VIEWED = 'booking_viewed',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_RESCHEDULED = 'booking_rescheduled',
  
  // API events
  API_ERROR = 'api_error',
  
  // Edge cases
  BOOKING_CONFLICT = 'booking_conflict',
  TIMEZONE_ISSUE = 'timezone_issue',
  AVAILABILITY_ERROR = 'availability_error',
  DUPLICATE_BOOKING = 'duplicate_booking',
  DUPLICATE_PAYMENT = 'duplicate_payment',
  PAYMENT_MISMATCH = 'payment_mismatch'
}

/**
 * Analytics event properties
 */
export interface AnalyticsEventProperties {
  // User information
  userId?: string
  builderId?: string
  userType?: 'client' | 'builder' | 'admin'
  userRole?: string
  
  // Session information
  sessionId?: string
  sessionTypeId?: string
  sessionDuration?: number
  sessionPrice?: number
  
  // Booking information
  bookingId?: string
  bookingStartTime?: string
  bookingEndTime?: string
  bookingStatus?: string
  
  // Time tracking
  timeSpent?: number
  timeInStep?: number
  totalFlowTime?: number
  
  // Payment information
  paymentStatus?: string
  paymentAmount?: number
  currency?: string
  stripeSessionId?: string
  
  // Error information
  errorCode?: string
  errorMessage?: string
  errorType?: string
  
  // Calendly information
  calendlyEventId?: string
  calendlyEventTypeId?: string
  
  // Location information
  timezone?: string
  
  // Any additional properties
  [key: string]: any
}

/**
 * Booking flow analytics service
 * 
 * Tracks events and metrics for the booking flow
 */
export class BookingAnalytics {
  private static instance: BookingAnalytics
  private enabled: boolean
  private sessionStarts: Map<string, number> = new Map()
  private stepStarts: Map<string, number> = new Map()
  
  /**
   * Create a new booking analytics service
   * 
   * @param enabled Whether analytics is enabled
   */
  private constructor(enabled = true) {
    this.enabled = enabled
  }
  
  /**
   * Get the booking analytics instance (singleton)
   * 
   * @returns Booking analytics instance
   */
  public static getInstance(): BookingAnalytics {
    if (!BookingAnalytics.instance) {
      const analyticsEnabled = process.env.ENABLE_BOOKING_ANALYTICS !== 'false'
      BookingAnalytics.instance = new BookingAnalytics(analyticsEnabled)
    }
    
    return BookingAnalytics.instance
  }
  
  /**
   * Track a booking flow event
   * 
   * @param eventType Event type
   * @param properties Event properties
   */
  public trackEvent(eventType: AnalyticsEventType, properties: AnalyticsEventProperties = {}): void {
    if (!this.enabled) {
      return
    }
    
    try {
      // Calculate time spent in this step if we have a session ID
      if (properties.sessionId && this.stepStarts.has(properties.sessionId)) {
        const stepStartTime = this.stepStarts.get(properties.sessionId)
        if (stepStartTime) {
          properties.timeInStep = Date.now() - stepStartTime
        }
        
        // Update step start time for the next step
        this.stepStarts.set(properties.sessionId, Date.now())
      }
      
      // Calculate total flow time if we're completing or abandoning the flow
      if (
        properties.sessionId && 
        (eventType === AnalyticsEventType.BOOKING_COMPLETED || 
         eventType === AnalyticsEventType.BOOKING_ABANDONED)
      ) {
        const sessionStartTime = this.sessionStarts.get(properties.sessionId)
        if (sessionStartTime) {
          properties.totalFlowTime = Date.now() - sessionStartTime
          
          // Clean up maps to prevent memory leaks
          this.sessionStarts.delete(properties.sessionId)
          this.stepStarts.delete(properties.sessionId)
        }
      }
      
      // If this is the start of a booking flow, save the session start time
      if (eventType === AnalyticsEventType.BOOKING_FLOW_STARTED && properties.sessionId) {
        this.sessionStarts.set(properties.sessionId, Date.now())
        this.stepStarts.set(properties.sessionId, Date.now())
      }
      
      // Log the event for now (would be sent to analytics service in production)
      logger.info('Booking Analytics', {
        event: eventType,
        ...properties,
        timestamp: new Date().toISOString()
      })
      
      // TODO: Send to analytics service (e.g., Segment, Mixpanel, Datadog, etc.)
      // In production, you would implement this based on your analytics provider
    } catch (error) {
      logger.error('Error tracking analytics event', {
        eventType,
        properties,
        error
      })
    }
  }
  
  /**
   * Start tracking a booking flow step
   * 
   * @param sessionId Session ID
   */
  public startStep(sessionId: string): void {
    if (!this.enabled) {
      return
    }
    
    this.stepStarts.set(sessionId, Date.now())
  }
  
  /**
   * Track a booking flow error
   * 
   * @param errorType Error type
   * @param errorMessage Error message
   * @param properties Additional properties
   */
  public trackError(errorType: string, errorMessage: string, properties: AnalyticsEventProperties = {}): void {
    if (!this.enabled) {
      return
    }
    
    this.trackEvent(AnalyticsEventType.API_ERROR, {
      ...properties,
      errorType,
      errorMessage
    })
  }
  
  /**
   * Track a Calendly webhook event
   * 
   * @param webhookEvent Webhook event type
   * @param properties Event properties
   */
  public trackWebhook(webhookEvent: string, properties: AnalyticsEventProperties = {}): void {
    if (!this.enabled) {
      return
    }
    
    this.trackEvent(AnalyticsEventType.WEBHOOK_RECEIVED, {
      ...properties,
      webhookEvent
    })
  }
  
  /**
   * Enable or disable analytics tracking
   * 
   * @param enabled Whether analytics should be enabled
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }
  
  /**
   * Check if analytics tracking is enabled
   * 
   * @returns Whether analytics is enabled
   */
  public isEnabled(): boolean {
    return this.enabled
  }
  
  /**
   * Periodically clean up old sessions to prevent memory leaks
   * Called automatically on a schedule
   */
  private cleanupOldSessions(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    
    for (const [sessionId, startTime] of this.sessionStarts.entries()) {
      if (now - startTime > maxAge) {
        this.sessionStarts.delete(sessionId)
        this.stepStarts.delete(sessionId)
      }
    }
  }
}

// Setup cleanup interval
setInterval(() => {
  BookingAnalytics.getInstance()['cleanupOldSessions']()
}, 3600000) // Run every hour

/**
 * Get the booking analytics instance
 * 
 * @returns Booking analytics instance
 */
export function getBookingAnalytics(): BookingAnalytics {
  return BookingAnalytics.getInstance()
}

/**
 * Track a booking flow event (convenience function)
 * 
 * @param eventType Event type
 * @param properties Event properties
 */
export function trackBookingEvent(eventType: AnalyticsEventType, properties: AnalyticsEventProperties = {}): void {
  const analytics = getBookingAnalytics()
  analytics.trackEvent(eventType, properties)
}