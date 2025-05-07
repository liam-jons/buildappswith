/**
 * Stripe payment server actions
 * Version: 1.1.0
 * 
 * Server-side actions for payment functionality with Calendly integration
 */

'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { PrismaClient } from '@prisma/client'
import * as stripeServer from './stripe-server'
import { z } from 'zod'
import { logger } from '../logger'
import type { CheckoutSessionRequest, CheckoutSessionResponse } from './types'
import { getBookingById, updateBookingPayment, updateBookingStatus } from '../scheduling/real-data/scheduling-service'
import { trackBookingEvent, AnalyticsEventType } from '../scheduling/calendly/analytics'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * Create a Stripe checkout session for a booking
 * 
 * This server action creates a checkout session using the Stripe API,
 * allowing a user to pay for a booking. It validates the user's
 * authentication and ownership of the booking.
 * 
 * @param request Checkout session request data
 * @returns Checkout session response with URL and session ID
 */
export async function createCheckoutSession(
  request: CheckoutSessionRequest
): Promise<{
  success: boolean;
  message: string;
  data?: CheckoutSessionResponse;
  error?: {
    type: string;
    code?: string;
    detail?: string;
  };
}> {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
        error: {
          type: 'authentication_error',
          detail: 'User must be authenticated to create a checkout session'
        }
      }
    }
    
    // Verify ownership of the booking
    if (request.bookingData.clientId && request.bookingData.clientId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        error: {
          type: 'authorization_error',
          detail: 'Not authorized to create this checkout session'
        }
      }
    }
    
    // Track checkout attempt
    trackBookingEvent(AnalyticsEventType.CHECKOUT_INITIATED, {
      builderId: request.bookingData.builderId,
      sessionTypeId: request.bookingData.sessionTypeId,
      clientId: userId,
      hasBookingId: !!request.bookingData.id,
      hasCalendlyId: !!request.bookingData.calendlyEventId
    })
    
    // Check if this is an existing booking
    if (request.bookingData.id) {
      // Get the booking to verify it exists and check ownership
      const booking = await prisma.booking.findUnique({
        where: { id: request.bookingData.id },
        include: {
          sessionType: true,
          builder: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          client: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
      
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: {
            type: 'not_found',
            detail: 'Booking not found'
          }
        }
      }
      
      // Verify ownership
      if (booking.clientId !== userId) {
        return {
          success: false,
          message: 'Not authorized',
          error: {
            type: 'authorization_error',
            detail: 'Not authorized to access this booking'
          }
        }
      }
      
      // If booking is already paid, return an error
      if (booking.paymentStatus === 'PAID') {
        return {
          success: false,
          message: 'Booking already paid',
          error: {
            type: 'invalid_request',
            detail: 'This booking has already been paid for'
          }
        }
      }
      
      // Create parameters for Stripe checkout
      const checkoutParams = {
        builderId: booking.builderId,
        builderName: booking.builder?.user?.name || 'Builder',
        sessionType: booking.sessionType.title,
        sessionPrice: booking.sessionType.price.toNumber(),
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        timeZone: booking.clientTimezone || 'UTC',
        userId: userId,
        userEmail: booking.client?.email || '',
        userName: booking.client?.name || '',
        successUrl: `${request.returnUrl}?status=success&booking_id=${booking.id}`,
        cancelUrl: `${request.returnUrl}?status=cancelled&booking_id=${booking.id}`,
        currency: booking.sessionType.currency || 'usd',
        bookingId: booking.id,
        // Add Calendly fields if they exist
        ...(booking.calendlyEventId && { calendlyEventId: booking.calendlyEventId })
      }
      
      // Create a checkout session using the server utility
      const result = await stripeServer.createBookingCheckoutSession(checkoutParams)
      
      if (!result.success) {
        logger.error('Failed to create checkout session', {
          bookingId: booking.id,
          error: result.error
        })
        
        return {
          success: false,
          message: 'Failed to create checkout session',
          error: result.error
        }
      }
      
      // Update the booking with the Stripe session ID
      try {
        await updateBookingPayment(
          booking.id,
          'UNPAID', // Keep as unpaid until payment is confirmed
          result.data.id
        )
        
        logger.info('Updated booking with Stripe session ID', {
          bookingId: booking.id,
          stripeSessionId: result.data.id
        })
      } catch (dbError) {
        logger.error('Failed to update booking with session ID', {
          bookingId: booking.id,
          sessionId: result.data.id,
          error: dbError
        })
        // Continue anyway, as the checkout session is created
      }
      
      // Track checkout session created
      trackBookingEvent(AnalyticsEventType.CHECKOUT_SESSION_CREATED, {
        bookingId: booking.id,
        stripeSessionId: result.data.id,
        builderId: booking.builderId,
        sessionTypeId: booking.sessionTypeId || '',
        amount: booking.sessionType.price.toNumber(),
        calendlyEventId: booking.calendlyEventId || undefined
      })
      
      return {
        success: true,
        message: 'Checkout session created',
        data: {
          sessionId: result.data.id,
          url: result.data.url || ''
        }
      }
    } else if (request.bookingData.calendlyEventId) {
      // Handle Calendly bookings that don't have a booking ID yet
      // This case can happen when the user comes from Calendly but 
      // we haven't created a booking record in our system yet
      
      // Check if a booking already exists with this Calendly event ID
      const existingBooking = await prisma.booking.findFirst({
        where: { calendlyEventId: request.bookingData.calendlyEventId },
        include: {
          sessionType: true,
          builder: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
      
      if (existingBooking) {
        // This is a duplicate request for the same Calendly event
        // Update the request to use the existing booking ID
        logger.info('Found existing booking for Calendly event', {
          bookingId: existingBooking.id,
          calendlyEventId: request.bookingData.calendlyEventId
        })
        
        // Create parameters for Stripe checkout
        const checkoutParams = {
          builderId: existingBooking.builderId,
          builderName: existingBooking.builder?.user?.name || 'Builder',
          sessionType: existingBooking.sessionType.title,
          sessionPrice: existingBooking.sessionType.price.toNumber(),
          startTime: existingBooking.startTime.toISOString(),
          endTime: existingBooking.endTime.toISOString(),
          timeZone: existingBooking.clientTimezone || 'UTC',
          userId: userId,
          userEmail: existingBooking.client?.email || '',
          userName: existingBooking.client?.name || '',
          successUrl: `${request.returnUrl}?status=success&booking_id=${existingBooking.id}`,
          cancelUrl: `${request.returnUrl}?status=cancelled&booking_id=${existingBooking.id}`,
          currency: existingBooking.sessionType.currency || 'usd',
          bookingId: existingBooking.id,
          calendlyEventId: existingBooking.calendlyEventId
        }
        
        // Create a checkout session using the server utility
        const result = await stripeServer.createBookingCheckoutSession(checkoutParams)
        
        if (!result.success) {
          return {
            success: false,
            message: 'Failed to create checkout session',
            error: result.error
          }
        }
        
        // Update the booking with the Stripe session ID
        try {
          await updateBookingPayment(
            existingBooking.id,
            'UNPAID', // Keep as unpaid until payment is confirmed
            result.data.id
          )
          
          logger.info('Updated existing booking with Stripe session ID', {
            bookingId: existingBooking.id,
            stripeSessionId: result.data.id
          })
        } catch (dbError) {
          logger.error('Failed to update existing booking with session ID', {
            bookingId: existingBooking.id,
            sessionId: result.data.id,
            error: dbError
          })
          // Continue anyway, as the checkout session is created
        }
        
        // Track checkout session created
        trackBookingEvent(AnalyticsEventType.CHECKOUT_SESSION_CREATED, {
          bookingId: existingBooking.id,
          stripeSessionId: result.data.id,
          builderId: existingBooking.builderId,
          sessionTypeId: existingBooking.sessionTypeId || '',
          amount: existingBooking.sessionType.price.toNumber(),
          calendlyEventId: existingBooking.calendlyEventId
        })
        
        return {
          success: true,
          message: 'Checkout session created for existing Calendly booking',
          data: {
            sessionId: result.data.id,
            url: result.data.url || ''
          }
        }
      }
      
      // We need to create a new booking from the Calendly data
      
      // First, get the session type to get pricing info
      const sessionType = await prisma.sessionType.findUnique({
        where: { id: request.bookingData.sessionTypeId },
        include: {
          builder: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
      
      if (!sessionType) {
        return {
          success: false,
          message: 'Session type not found',
          error: {
            type: 'not_found',
            detail: 'Session type not found for Calendly booking'
          }
        }
      }
      
      // Get client information
      const client = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
      
      if (!client) {
        return {
          success: false,
          message: 'Client not found',
          error: {
            type: 'not_found',
            detail: 'Client user not found'
          }
        }
      }
      
      // Create a new booking record
      try {
        const newBooking = await prisma.booking.create({
          data: {
            builderId: sessionType.builderId,
            clientId: userId,
            sessionTypeId: sessionType.id,
            title: sessionType.title,
            description: sessionType.description,
            startTime: new Date(request.bookingData.startTime),
            endTime: new Date(request.bookingData.endTime),
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            amount: sessionType.price,
            clientTimezone: request.bookingData.clientTimezone,
            calendlyEventId: request.bookingData.calendlyEventId,
            calendlyEventUri: request.bookingData.calendlyEventUri,
            calendlyInviteeUri: request.bookingData.calendlyInviteeUri
          }
        })
        
        logger.info('Created new booking from Calendly data', {
          bookingId: newBooking.id,
          calendlyEventId: request.bookingData.calendlyEventId
        })
        
        // Track booking creation
        trackBookingEvent(AnalyticsEventType.BOOKING_CREATED, {
          bookingId: newBooking.id,
          builderId: newBooking.builderId,
          clientId: newBooking.clientId,
          sessionTypeId: newBooking.sessionTypeId || '',
          startTime: newBooking.startTime.toISOString(),
          amount: newBooking.amount?.toNumber(),
          isCalendly: true,
          calendlyEventId: request.bookingData.calendlyEventId
        })
        
        // Create parameters for Stripe checkout
        const checkoutParams = {
          builderId: newBooking.builderId,
          builderName: sessionType.builder?.user?.name || 'Builder',
          sessionType: sessionType.title,
          sessionPrice: sessionType.price.toNumber(),
          startTime: newBooking.startTime.toISOString(),
          endTime: newBooking.endTime.toISOString(),
          timeZone: request.bookingData.clientTimezone || 'UTC',
          userId: userId,
          userEmail: client.email || '',
          userName: client.name || '',
          successUrl: `${request.returnUrl}?status=success&booking_id=${newBooking.id}`,
          cancelUrl: `${request.returnUrl}?status=cancelled&booking_id=${newBooking.id}`,
          currency: sessionType.currency || 'usd',
          bookingId: newBooking.id,
          calendlyEventId: request.bookingData.calendlyEventId
        }
        
        // Create a checkout session using the server utility
        const result = await stripeServer.createBookingCheckoutSession(checkoutParams)
        
        if (!result.success) {
          return {
            success: false,
            message: 'Failed to create checkout session',
            error: result.error
          }
        }
        
        // Update the booking with the Stripe session ID
        try {
          await updateBookingPayment(
            newBooking.id,
            'UNPAID', // Keep as unpaid until payment is confirmed
            result.data.id
          )
          
          logger.info('Updated new booking with Stripe session ID', {
            bookingId: newBooking.id,
            stripeSessionId: result.data.id
          })
        } catch (dbError) {
          logger.error('Failed to update new booking with session ID', {
            bookingId: newBooking.id,
            sessionId: result.data.id,
            error: dbError
          })
          // Continue anyway, as the checkout session is created
        }
        
        // Track checkout session created
        trackBookingEvent(AnalyticsEventType.CHECKOUT_SESSION_CREATED, {
          bookingId: newBooking.id,
          stripeSessionId: result.data.id,
          builderId: newBooking.builderId,
          sessionTypeId: newBooking.sessionTypeId || '',
          amount: sessionType.price.toNumber(),
          calendlyEventId: request.bookingData.calendlyEventId
        })
        
        return {
          success: true,
          message: 'Checkout session created for new Calendly booking',
          data: {
            sessionId: result.data.id,
            url: result.data.url || ''
          }
        }
      } catch (createError) {
        logger.error('Failed to create new booking from Calendly data', {
          calendlyEventId: request.bookingData.calendlyEventId,
          error: createError
        })
        
        return {
          success: false,
          message: 'Failed to create booking from Calendly data',
          error: {
            type: 'database_error',
            detail: createError instanceof Error ? createError.message : 'Unknown error'
          }
        }
      }
    } else {
      // For a new booking without Calendly integration, we would normally create it first,
      // but this case is not implemented yet.
      return {
        success: false,
        message: 'Creating checkout sessions for new non-Calendly bookings is not implemented yet',
        error: {
          type: 'not_implemented',
          detail: 'This functionality requires the scheduling service'
        }
      }
    }
  } catch (error: any) {
    logger.error('Error creating checkout session', { error, request })
    
    return {
      success: false,
      message: 'Failed to create checkout session',
      error: {
        type: 'unknown_error',
        detail: error.message || 'An unexpected error occurred'
      }
    }
  }
}

/**
 * Handle a successful payment
 * 
 * This server action updates a booking's payment and status after
 * a successful payment has been processed.
 * 
 * @param sessionId Stripe checkout session ID
 * @returns Success status
 */
export async function handleSuccessfulPayment(sessionId: string): Promise<{
  success: boolean;
  message: string;
  bookingId?: string;
  error?: {
    type: string;
    detail?: string;
  };
}> {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
        error: {
          type: 'authentication_error',
          detail: 'User must be authenticated to handle payments'
        }
      }
    }
    
    // Get the checkout session from Stripe
    const sessionResult = await stripeServer.getCheckoutSession(sessionId)
    
    if (!sessionResult.success) {
      return {
        success: false,
        message: 'Failed to retrieve checkout session',
        error: sessionResult.error
      }
    }
    
    const session = sessionResult.data
    
    // Get booking ID from metadata
    const bookingId = session.metadata?.bookingId
    
    if (!bookingId) {
      return {
        success: false,
        message: 'Booking ID not found in session metadata',
        error: {
          type: 'invalid_data',
          detail: 'Checkout session does not have a booking ID in metadata'
        }
      }
    }
    
    // Verify the booking exists and is owned by the user
    const booking = await getBookingById(bookingId)
    
    if (!booking) {
      return {
        success: false,
        message: 'Booking not found',
        error: {
          type: 'not_found',
          detail: `Booking ${bookingId} not found`
        }
      }
    }
    
    // Verify ownership
    if (booking.clientId !== userId) {
      return {
        success: false,
        message: 'Not authorized',
        error: {
          type: 'authorization_error',
          detail: 'Not authorized to access this booking'
        }
      }
    }
    
    // Check payment status from the session
    const paymentStatus = session.payment_status
    
    if (paymentStatus !== 'paid') {
      return {
        success: false,
        message: 'Payment not completed',
        bookingId,
        error: {
          type: 'payment_incomplete',
          detail: `Payment status is ${paymentStatus}`
        }
      }
    }
    
    // Update the booking payment status
    try {
      await updateBookingPayment(
        bookingId,
        'PAID',
        sessionId
      )
      
      logger.info('Updated booking payment status to PAID', {
        bookingId,
        stripeSessionId: sessionId
      })
    } catch (updateError) {
      logger.error('Failed to update booking payment status', {
        bookingId,
        stripeSessionId: sessionId,
        error: updateError
      })
      
      return {
        success: false,
        message: 'Failed to update booking payment status',
        bookingId,
        error: {
          type: 'database_error',
          detail: 'Error updating booking payment status'
        }
      }
    }
    
    // Update the booking status to CONFIRMED if it's not already
    try {
      if (booking.status === 'PENDING') {
        await updateBookingStatus(
          bookingId,
          'CONFIRMED'
        )
        
        logger.info('Updated booking status to CONFIRMED', {
          bookingId,
          stripeSessionId: sessionId
        })
      }
    } catch (updateError) {
      logger.error('Failed to update booking status', {
        bookingId,
        stripeSessionId: sessionId,
        error: updateError
      })
      
      // Continue anyway, as the payment was successful
    }
    
    // Track payment success
    trackBookingEvent(AnalyticsEventType.PAYMENT_COMPLETED, {
      bookingId,
      stripeSessionId: sessionId,
      builderId: booking.builderId,
      clientId: booking.clientId,
      amount: booking.amount,
      calendlyEventId: booking.calendlyEventId
    })
    
    // Revalidate any paths that might display this booking
    revalidatePath('/booking/confirmation')
    revalidatePath('/dashboard/bookings')
    
    return {
      success: true,
      message: 'Payment processed successfully',
      bookingId
    }
  } catch (error: any) {
    logger.error('Error handling successful payment', { error, sessionId })
    
    return {
      success: false,
      message: 'Failed to process successful payment',
      error: {
        type: 'unknown_error',
        detail: error.message || 'An unexpected error occurred'
      }
    }
  }
}

/**
 * Check the status of a checkout session
 * 
 * @param sessionId Stripe checkout session ID
 * @returns Session status and details
 */
export async function getCheckoutSessionStatus(sessionId: string): Promise<{
  success: boolean;
  message: string;
  data?: {
    status: string;
    paymentStatus: string;
    bookingId?: string;
    calendlyEventId?: string;
  };
  error?: {
    type: string;
    code?: string;
    detail?: string;
  };
}> {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
        error: {
          type: 'authentication_error',
          detail: 'User must be authenticated to check session status'
        }
      }
    }
    
    // Get the session from Stripe
    const result = await stripeServer.getCheckoutSession(sessionId)
    
    if (!result.success) {
      return {
        success: false,
        message: 'Failed to retrieve checkout session',
        error: result.error
      }
    }
    
    const session = result.data
    
    // Get booking ID and Calendly ID from metadata
    const bookingId = session.metadata?.bookingId
    const calendlyEventId = session.metadata?.calendlyEventId
    
    // If there's a booking ID, verify ownership
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      })
      
      if (booking && booking.clientId !== userId) {
        return {
          success: false,
          message: 'Not authorized',
          error: {
            type: 'authorization_error',
            detail: 'Not authorized to access this session'
          }
        }
      }
    }
    
    return {
      success: true,
      message: 'Checkout session retrieved',
      data: {
        status: session.status,
        paymentStatus: session.payment_status,
        bookingId,
        calendlyEventId
      }
    }
  } catch (error: any) {
    logger.error('Error retrieving checkout session', { error, sessionId })
    
    return {
      success: false,
      message: 'Failed to retrieve checkout session',
      error: {
        type: 'unknown_error',
        detail: error.message || 'An unexpected error occurred'
      }
    }
  }
}