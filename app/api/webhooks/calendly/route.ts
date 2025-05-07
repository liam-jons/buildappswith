/**
 * Calendly Webhook Handler
 * Version: 1.1.0
 * 
 * API for handling Calendly webhook events with enhanced security
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCalendlyService } from '@/lib/scheduling/calendly'
import { calendlyWebhookSchema } from '@/lib/scheduling/schemas'
import { logger } from '@/lib/logger'
import { verifyWebhookRequest, WebhookSignatureError, logWebhookEvent } from '@/lib/scheduling/calendly/webhook-security'
import { trackBookingEvent, AnalyticsEventType } from '@/lib/scheduling/calendly/analytics'
import { processRefund } from '@/lib/scheduling/calendly/refund-service'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * POST handler for Calendly webhooks
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body
    const rawBody = await req.text()
    
    try {
      // Verify webhook signature
      verifyWebhookRequest(req.headers, rawBody, {
        skipVerificationInDev: true,
        replayProtection: true
      })
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        logger.warn('Calendly webhook signature verification failed', {
          code: error.code,
          message: error.message
        })
        
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 401 }
        )
      }
      
      // For other errors, fall through to general error handling
      throw error
    }
    
    // Parse request body
    const payload = JSON.parse(rawBody)
    
    // Log webhook event for monitoring/analytics
    logWebhookEvent(payload.event, payload.payload)
    
    // Track webhook event in analytics
    trackBookingEvent(AnalyticsEventType.WEBHOOK_RECEIVED, {
      webhookEvent: payload.event,
      calendlyEventId: payload.payload.event?.uuid,
      calendlyEventTypeId: payload.payload.event_type?.uuid,
      userEmail: payload.payload.invitee?.email,
      userName: payload.payload.invitee?.name,
      bookingStartTime: payload.payload.event?.start_time,
      bookingEndTime: payload.payload.event?.end_time
    })
    
    // Validate webhook payload
    const validationResult = calendlyWebhookSchema.safeParse(payload)
    
    if (!validationResult.success) {
      logger.warn('Invalid Calendly webhook payload', {
        payload,
        errors: validationResult.error.format()
      })
      
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    // Get Calendly service
    const calendlyService = getCalendlyService()
    
    // Process the webhook event
    const result = await calendlyService.processWebhookEvent(payload)
    
    if (!result) {
      return NextResponse.json({
        success: true,
        message: 'Webhook received but no action taken',
        event: payload.event
      })
    }
    
    // Handle different event types
    try {
      switch (payload.event) {
        case 'invitee.created':
          await handleInviteeCreated(result)
          break
        case 'invitee.canceled':
          await handleInviteeCanceled(result)
          break
        case 'invitee.rescheduled':
          await handleInviteeRescheduled(result)
          break
        default:
          logger.info(`Unhandled Calendly webhook event type: ${payload.event}`)
      }
    } catch (error) {
      logger.error(`Error processing Calendly webhook ${payload.event}`, { error })
      
      // Track webhook processing error
      trackBookingEvent(AnalyticsEventType.WEBHOOK_ERROR, {
        webhookEvent: payload.event,
        calendlyEventId: payload.payload.event?.uuid,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Return 202 Accepted to prevent Calendly from retrying
      // We've already validated and logged the webhook, so we can handle it asynchronously
      return NextResponse.json({
        success: true,
        message: 'Webhook accepted but processing failed',
        event: payload.event
      }, { status: 202 })
    }
    
    // Track successful webhook processing
    trackBookingEvent(AnalyticsEventType.WEBHOOK_PROCESSED, {
      webhookEvent: payload.event,
      calendlyEventId: payload.payload.event?.uuid,
      bookingId: result?.id
    })
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event: payload.event
    })
  } catch (error: any) {
    logger.error('Error processing Calendly webhook', { error })
    
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Handle invitee.created event
 * 
 * @param result Processed booking data
 */
async function handleInviteeCreated(result: any) {
  // Check for existing booking first
  const existingBooking = await prisma.booking.findFirst({
    where: { calendlyEventId: result.calendlyEventId }
  })
  
  if (existingBooking) {
    // Update the existing booking
    await prisma.booking.update({
      where: { id: existingBooking.id },
      data: {
        status: result.status,
        paymentStatus: result.paymentStatus,
        startTime: new Date(result.startTime),
        endTime: new Date(result.endTime),
        calendlyEventUri: result.calendlyEventUri,
        calendlyInviteeUri: result.calendlyInviteeUri,
        updatedAt: new Date()
      }
    })
    
    logger.info('Updated existing booking from Calendly event', {
      bookingId: existingBooking.id,
      calendlyEventId: result.calendlyEventId
    })
  } else {
    try {
      // Create a new booking
      const newBooking = await prisma.booking.create({
        data: {
          builderId: result.builderId,
          clientId: result.clientId,
          sessionTypeId: result.sessionTypeId,
          title: result.title,
          description: result.description || '',
          startTime: new Date(result.startTime),
          endTime: new Date(result.endTime),
          status: result.status,
          paymentStatus: result.paymentStatus,
          amount: result.amount,
          clientTimezone: result.clientTimezone,
          builderTimezone: result.builderTimezone,
          calendlyEventId: result.calendlyEventId,
          calendlyEventUri: result.calendlyEventUri,
          calendlyInviteeUri: result.calendlyInviteeUri
        }
      })
      
      logger.info('Created new booking from Calendly event', {
        bookingId: newBooking.id,
        calendlyEventId: result.calendlyEventId
      })
    } catch (error) {
      logger.error('Failed to create booking from Calendly event', {
        error,
        calendlyEventId: result.calendlyEventId
      })
      throw error
    }
  }
}

/**
 * Handle invitee.canceled event
 * 
 * @param result Processed booking data
 */
async function handleInviteeCanceled(result: any) {
  // Find the booking to cancel
  const booking = await prisma.booking.findFirst({
    where: { calendlyEventId: result.calendlyEventId }
  })
  
  if (booking) {
    // Get cancellation details from the Calendly event
    const cancellationReason = result.cancellation?.reason || 'Cancelled via Calendly'
    const canceller = result.cancellation?.canceler_type === 'host' ? 'builder' : 'client'
    
    // Update booking status
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        cancellationReason,
        cancelledBy: canceller.toUpperCase(),
        updatedAt: new Date()
      }
    })
    
    logger.info('Cancelled booking from Calendly event', {
      bookingId: booking.id,
      calendlyEventId: result.calendlyEventId,
      canceller,
      reason: cancellationReason
    })
    
    // If the booking has a payment, process refund
    if (booking.stripeSessionId && booking.paymentStatus === 'PAID') {
      logger.info('Booking has payment, processing refund', {
        bookingId: booking.id,
        stripeSessionId: booking.stripeSessionId
      })
      
      // Track cancellation event before refund processing
      trackBookingEvent(AnalyticsEventType.BOOKING_CANCELLED, {
        bookingId: booking.id,
        calendlyEventId: result.calendlyEventId,
        stripeSessionId: booking.stripeSessionId,
        cancelledBy: canceller,
        reason: cancellationReason
      })
      
      // Process the refund
      try {
        const refundResult = await processRefund(
          booking.id,
          canceller,
          cancellationReason
        )
        
        logger.info('Refund process completed', {
          bookingId: booking.id,
          success: refundResult.success,
          policy: refundResult.policy,
          amount: refundResult.amount,
          reason: refundResult.reason
        })
      } catch (error) {
        logger.error('Error processing refund for cancelled booking', {
          bookingId: booking.id,
          calendlyEventId: result.calendlyEventId,
          error
        })
      }
    } else {
      // Track cancellation event for non-paid bookings
      trackBookingEvent(AnalyticsEventType.BOOKING_CANCELLED, {
        bookingId: booking.id,
        calendlyEventId: result.calendlyEventId,
        cancelledBy: canceller,
        reason: cancellationReason,
        paymentStatus: booking.paymentStatus
      })
    }
  } else {
    logger.warn('Booking not found for Calendly cancellation', {
      calendlyEventId: result.calendlyEventId
    })
  }
}

/**
 * Handle invitee.rescheduled event
 * 
 * @param result Processed booking data
 */
async function handleInviteeRescheduled(result: any) {
  // Find the booking to reschedule
  const booking = await prisma.booking.findFirst({
    where: { calendlyEventId: result.calendlyEventId }
  })
  
  if (booking) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        startTime: new Date(result.startTime),
        endTime: new Date(result.endTime),
        updatedAt: new Date()
      }
    })
    
    logger.info('Rescheduled booking from Calendly event', {
      bookingId: booking.id,
      calendlyEventId: result.calendlyEventId,
      oldStartTime: booking.startTime,
      newStartTime: new Date(result.startTime)
    })
  } else {
    logger.warn('Booking not found for Calendly reschedule', {
      calendlyEventId: result.calendlyEventId
    })
  }
}