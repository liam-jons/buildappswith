/**
 * Booking Conflict Handler
 * Version: 1.0.0
 * 
 * Utilities for handling booking conflicts and edge cases
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'
import { getCalendlyApiClient } from './api-client'
import { CalendlyApiError } from './api-client'
import { convertDateBetweenTimezones, normalizeTimezone } from './timezone-utils'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * Booking conflict error
 */
export class BookingConflictError extends Error {
  code: 'time_conflict' | 'double_booking' | 'calendly_conflict' | 'availability_error'
  details?: any
  
  constructor(message: string, code: BookingConflictError['code'], details?: any) {
    super(message)
    this.name = 'BookingConflictError'
    this.code = code
    this.details = details
  }
}

/**
 * Check if a booking conflicts with existing bookings for a builder
 * 
 * @param builderId Builder ID
 * @param startTime Start time of the new booking
 * @param endTime End time of the new booking
 * @param excludeBookingId Optional booking ID to exclude from check (e.g., for updates)
 * @returns True if there's a conflict, false otherwise
 */
export async function checkForBookingConflicts(
  builderId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  try {
    // Find any bookings that overlap with the proposed time slot
    const conflicts = await prisma.booking.findMany({
      where: {
        builderId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          // New booking starts during existing booking
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime }
          },
          // New booking ends during existing booking
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime }
          },
          // New booking completely contains existing booking
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime }
          }
        ]
      }
    })
    
    return conflicts.length > 0
  } catch (error) {
    logger.error('Error checking for booking conflicts', {
      builderId,
      startTime,
      endTime,
      excludeBookingId,
      error
    })
    throw error
  }
}

/**
 * Check if there's any conflict with Calendly for a specific event type
 * This directly checks with the Calendly API
 * 
 * @param eventTypeId Calendly event type ID
 * @param startTime Proposed start time
 * @param endTime Proposed end time
 * @returns True if there's a conflict, false otherwise
 */
export async function checkCalendlyAvailability(
  eventTypeId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const client = getCalendlyApiClient()
    
    // Get the event type to ensure it exists
    await client.getEventType(eventTypeId)
    
    // Check for scheduled events in the same time period
    const events = await client.getEvents({
      minStartTime: startTime.toISOString(),
      maxStartTime: endTime.toISOString(),
      status: 'active'
    })
    
    return events.collection.length > 0
  } catch (error) {
    // Convert CalendlyApiError to BookingConflictError
    if (error instanceof CalendlyApiError) {
      throw new BookingConflictError(
        `Error checking Calendly availability: ${error.message}`,
        'availability_error',
        { statusCode: error.statusCode, errorCode: error.errorCode }
      )
    }
    
    // Log and rethrow other errors
    logger.error('Error checking Calendly availability', {
      eventTypeId,
      startTime,
      endTime,
      error
    })
    throw error
  }
}

/**
 * Handle booking conflicts by suggesting alternative times
 * 
 * @param builderId Builder ID
 * @param startTime Proposed start time
 * @param endTime Proposed end time
 * @param timezone Client's timezone
 * @param eventTypeId Calendly event type ID
 * @returns Array of suggested alternative times
 */
export async function suggestAlternativeTimes(
  builderId: string,
  startTime: Date,
  endTime: Date,
  timezone: string,
  eventTypeId: string
): Promise<Array<{ startTime: Date, endTime: Date }>> {
  try {
    const normalizedTimezone = normalizeTimezone(timezone)
    const sessionDuration = endTime.getTime() - startTime.getTime()
    const suggestions: Array<{ startTime: Date, endTime: Date }> = []
    
    // Suggest times later the same day (if before 6pm)
    const sixPm = new Date(startTime)
    sixPm.setHours(18, 0, 0, 0)
    
    if (startTime < sixPm) {
      const laterToday = new Date(startTime.getTime() + sessionDuration + 30 * 60000) // 30 min later
      const laterTodayEnd = new Date(laterToday.getTime() + sessionDuration)
      
      if (laterToday < sixPm && !(await checkForBookingConflicts(builderId, laterToday, laterTodayEnd))) {
        suggestions.push({
          startTime: laterToday,
          endTime: laterTodayEnd
        })
      }
    }
    
    // Suggest next day, same time
    const nextDay = new Date(startTime)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayEnd = new Date(nextDay.getTime() + sessionDuration)
    
    if (!(await checkForBookingConflicts(builderId, nextDay, nextDayEnd))) {
      suggestions.push({
        startTime: nextDay,
        endTime: nextDayEnd
      })
    }
    
    // Suggest next week, same day and time
    const nextWeek = new Date(startTime)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const nextWeekEnd = new Date(nextWeek.getTime() + sessionDuration)
    
    if (!(await checkForBookingConflicts(builderId, nextWeek, nextWeekEnd))) {
      suggestions.push({
        startTime: nextWeek,
        endTime: nextWeekEnd
      })
    }
    
    return suggestions
  } catch (error) {
    logger.error('Error suggesting alternative times', {
      builderId,
      startTime,
      endTime,
      timezone,
      eventTypeId,
      error
    })
    throw error
  }
}

/**
 * Validate a booking request to check for conflicts
 * 
 * @param bookingData Booking data
 * @returns Validated booking data or throws a BookingConflictError
 */
export async function validateBookingRequest(bookingData: {
  builderId: string
  startTime: Date
  endTime: Date
  timezone: string
  calendlyEventTypeId?: string
  bookingId?: string
}): Promise<typeof bookingData> {
  try {
    const { builderId, startTime, endTime, timezone, calendlyEventTypeId, bookingId } = bookingData
    
    // Check for conflicts with other bookings
    const hasConflict = await checkForBookingConflicts(builderId, startTime, endTime, bookingId)
    
    if (hasConflict) {
      // Get conflicting bookings
      const conflicts = await prisma.booking.findMany({
        where: {
          builderId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          id: bookingId ? { not: bookingId } : undefined,
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } }
          ]
        },
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true
        }
      })
      
      // Suggest alternative times
      const alternatives = await suggestAlternativeTimes(
        builderId,
        startTime,
        endTime,
        timezone,
        calendlyEventTypeId || ''
      )
      
      throw new BookingConflictError(
        'Booking conflicts with existing bookings',
        'time_conflict',
        { conflicts, alternatives }
      )
    }
    
    // If there's a Calendly event type ID, check with Calendly too
    if (calendlyEventTypeId) {
      try {
        // This will throw if there's a conflict
        const hasCalendlyConflict = await checkCalendlyAvailability(
          calendlyEventTypeId,
          startTime,
          endTime
        )
        
        if (hasCalendlyConflict) {
          // Suggest alternative times
          const alternatives = await suggestAlternativeTimes(
            builderId,
            startTime,
            endTime,
            timezone,
            calendlyEventTypeId
          )
          
          throw new BookingConflictError(
            'Booking conflicts with Calendly schedule',
            'calendly_conflict',
            { alternatives }
          )
        }
      } catch (error) {
        if (error instanceof BookingConflictError) {
          throw error
        }
        
        // For other errors, log and continue (fail open)
        logger.error('Error checking Calendly availability during validation', {
          calendlyEventTypeId,
          startTime,
          endTime,
          error
        })
      }
    }
    
    return bookingData
  } catch (error) {
    // Re-throw BookingConflictError instances
    if (error instanceof BookingConflictError) {
      throw error
    }
    
    // Log and wrap other errors
    logger.error('Error validating booking request', {
      bookingData: { ...bookingData, startTime: bookingData.startTime.toISOString(), endTime: bookingData.endTime.toISOString() },
      error
    })
    throw new BookingConflictError(
      'Error validating booking request',
      'availability_error',
      { originalError: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}

/**
 * Handle a double booking scenario (when a booking is created for a slot that's already taken)
 * 
 * @param bookingId Booking ID that has a conflict
 * @param conflictingBookingId ID of the conflicting booking
 * @returns Resolution status and details
 */
export async function handleDoubleBooking(
  bookingId: string,
  conflictingBookingId: string
): Promise<{
  success: boolean
  resolution: 'cancelled' | 'rescheduled' | 'failed'
  details?: any
}> {
  try {
    // Get both bookings
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        sessionType: true,
        builder: {
          include: {
            user: true
          }
        },
        client: true
      }
    })
    
    const conflictingBooking = await prisma.booking.findUnique({
      where: { id: conflictingBookingId },
      include: {
        client: true
      }
    })
    
    if (!booking || !conflictingBooking) {
      return {
        success: false,
        resolution: 'failed',
        details: { error: 'One or both bookings not found' }
      }
    }
    
    // In this example, we'll prioritize the conflicting booking (first come, first served)
    // and cancel the newer booking
    
    // Update the booking status to cancelled
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    })
    
    // If this booking has a Calendly event, cancel it there too
    if (booking.calendlyEventId) {
      try {
        // TODO: Implement Calendly cancellation
        // This would involve calling the Calendly API to cancel the event
        logger.info('Calendly event cancellation required for double booking', {
          bookingId,
          calendlyEventId: booking.calendlyEventId
        })
      } catch (error) {
        logger.error('Error cancelling Calendly event for double booking', {
          bookingId,
          calendlyEventId: booking.calendlyEventId,
          error
        })
      }
    }
    
    // If payment was made, it should be refunded
    if (booking.paymentStatus === 'PAID') {
      logger.info('Refund required for cancelled booking due to double booking', {
        bookingId,
        paymentStatus: booking.paymentStatus,
        stripeSessionId: booking.stripeSessionId
      })
      
      // TODO: Implement refund logic
    }
    
    // Generate alternative time suggestions
    const alternatives = await suggestAlternativeTimes(
      booking.builderId,
      booking.startTime,
      booking.endTime,
      booking.clientTimezone || 'UTC',
      booking.sessionType?.calendlyEventTypeId || ''
    )
    
    logger.info('Handled double booking by cancelling the newer booking', {
      cancelledBookingId: bookingId,
      prioritizedBookingId: conflictingBookingId,
      alternativesCount: alternatives.length
    })
    
    return {
      success: true,
      resolution: 'cancelled',
      details: {
        clientNotificationNeeded: true,
        clientEmail: booking.client?.email,
        clientName: booking.client?.name,
        builderName: booking.builder?.user?.name,
        originalTime: booking.startTime,
        alternatives
      }
    }
  } catch (error) {
    logger.error('Error handling double booking', {
      bookingId,
      conflictingBookingId,
      error
    })
    
    return {
      success: false,
      resolution: 'failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}