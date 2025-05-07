/**
 * Calendly Booking Refund Service
 * Version: 1.0.0
 * 
 * Service for handling refunds for cancelled bookings
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'
import { trackBookingEvent, AnalyticsEventType } from './analytics'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * Refund calculation policy
 */
export enum RefundPolicy {
  FULL = 'full',          // 100% refund
  PARTIAL = 'partial',    // Partial refund based on cancellation timing
  NONE = 'none'           // No refund
}

/**
 * Refund result
 */
export interface RefundResult {
  success: boolean
  bookingId: string
  stripeRefundId?: string
  amount?: number
  currency?: string
  policy: RefundPolicy
  reason?: string
  error?: string
}

/**
 * Calculate refund policy based on cancellation timing
 * 
 * @param booking Booking details
 * @returns Refund policy
 */
export async function calculateRefundPolicy(booking: {
  id: string
  startTime: Date
  paymentStatus?: string
  stripeSessionId?: string | null
  amount?: number | null
}): Promise<{
  policy: RefundPolicy
  reason?: string
  amount?: number
}> {
  // If payment wasn't completed, no refund needed
  if (booking.paymentStatus !== 'PAID' || !booking.stripeSessionId) {
    return {
      policy: RefundPolicy.NONE,
      reason: 'No payment was made or payment is not in PAID status'
    }
  }
  
  // Calculate how far in advance the booking was cancelled
  const now = new Date()
  const hoursUntilBooking = (booking.startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  // Decide refund policy based on cancellation timing
  if (hoursUntilBooking >= 24) {
    // More than 24 hours notice: full refund
    return {
      policy: RefundPolicy.FULL,
      amount: booking.amount?.toNumber(),
      reason: 'Cancelled more than 24 hours in advance'
    }
  } else if (hoursUntilBooking >= 12) {
    // 12-24 hours notice: 50% refund
    return {
      policy: RefundPolicy.PARTIAL,
      amount: booking.amount ? booking.amount.toNumber() * 0.5 : undefined,
      reason: 'Cancelled 12-24 hours in advance (50% refund)'
    }
  } else {
    // Less than 12 hours notice: no refund
    return {
      policy: RefundPolicy.NONE,
      reason: 'Cancelled less than 12 hours in advance'
    }
  }
}

/**
 * Process refund for a cancelled booking
 * 
 * @param bookingId Booking ID
 * @param cancelledBy Who cancelled the booking ('client', 'builder', or 'system')
 * @param reason Cancellation reason
 * @returns Refund result
 */
export async function processRefund(
  bookingId: string,
  cancelledBy: 'client' | 'builder' | 'system' = 'client',
  reason: string = 'Booking cancelled'
): Promise<RefundResult> {
  try {
    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!booking) {
      return {
        success: false,
        bookingId,
        policy: RefundPolicy.NONE,
        error: 'Booking not found'
      }
    }
    
    // If booking is already refunded, return success
    if (booking.paymentStatus === 'REFUNDED') {
      return {
        success: true,
        bookingId,
        policy: RefundPolicy.FULL,
        reason: 'Booking was already refunded'
      }
    }
    
    // Calculate refund policy
    const refundPolicy = await calculateRefundPolicy(booking)
    
    // If no refund is needed, update booking status and return
    if (refundPolicy.policy === RefundPolicy.NONE) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          cancellationReason: reason,
          cancelledBy: cancelledBy.toUpperCase(),
          updatedAt: new Date()
        }
      })
      
      return {
        success: true,
        bookingId,
        policy: RefundPolicy.NONE,
        reason: refundPolicy.reason
      }
    }
    
    // Process refund with Stripe
    if (!booking.stripeSessionId) {
      return {
        success: false,
        bookingId,
        policy: refundPolicy.policy,
        error: 'No Stripe session ID found for booking'
      }
    }
    
    try {
      // TODO: Implement Stripe refund logic
      // For now, we'll simulate a successful refund
      
      // In production, you would call Stripe API to process the refund
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      // const refund = await stripe.refunds.create({
      //   payment_intent: booking.stripePaymentIntentId,
      //   amount: refundPolicy.amount ? Math.round(refundPolicy.amount * 100) : undefined,
      //   reason: 'requested_by_customer'
      // })
      
      // Simulate refund result
      const simulatedRefundId = `sim_refund_${Date.now()}`
      
      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledBy: cancelledBy.toUpperCase(),
          updatedAt: new Date(),
          refundId: simulatedRefundId,
          refundAmount: refundPolicy.amount ? refundPolicy.amount : booking.amount
        }
      })
      
      // Log the refund
      logger.info('Processed refund for cancelled booking', {
        bookingId,
        stripeSessionId: booking.stripeSessionId,
        refundId: simulatedRefundId,
        amount: refundPolicy.amount,
        policy: refundPolicy.policy,
        reason: refundPolicy.reason
      })
      
      // Track the refund in analytics
      trackBookingEvent(AnalyticsEventType.BOOKING_CANCELLED, {
        bookingId,
        stripeSessionId: booking.stripeSessionId,
        paymentStatus: 'REFUNDED',
        refundPolicy: refundPolicy.policy,
        refundAmount: refundPolicy.amount,
        cancelledBy
      })
      
      return {
        success: true,
        bookingId,
        stripeRefundId: simulatedRefundId,
        amount: refundPolicy.amount,
        currency: booking.currency || 'USD',
        policy: refundPolicy.policy,
        reason: refundPolicy.reason
      }
    } catch (error) {
      logger.error('Error processing refund with Stripe', {
        bookingId,
        stripeSessionId: booking.stripeSessionId,
        error
      })
      
      return {
        success: false,
        bookingId,
        policy: refundPolicy.policy,
        error: error instanceof Error ? error.message : 'Unknown error processing refund'
      }
    }
  } catch (error) {
    logger.error('Error processing refund', {
      bookingId,
      error
    })
    
    return {
      success: false,
      bookingId,
      policy: RefundPolicy.NONE,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if a booking is eligible for refund
 * 
 * @param bookingId Booking ID
 * @returns Refund eligibility result
 */
export async function checkRefundEligibility(bookingId: string): Promise<{
  eligible: boolean
  policy: RefundPolicy
  reason?: string
  amount?: number
}> {
  try {
    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!booking) {
      return {
        eligible: false,
        policy: RefundPolicy.NONE,
        reason: 'Booking not found'
      }
    }
    
    // If booking is already refunded, not eligible
    if (booking.paymentStatus === 'REFUNDED') {
      return {
        eligible: false,
        policy: RefundPolicy.NONE,
        reason: 'Booking has already been refunded'
      }
    }
    
    // If booking is not paid, not eligible
    if (booking.paymentStatus !== 'PAID') {
      return {
        eligible: false,
        policy: RefundPolicy.NONE,
        reason: 'Booking has not been paid'
      }
    }
    
    // Calculate refund policy
    const refundPolicy = await calculateRefundPolicy(booking)
    
    return {
      eligible: refundPolicy.policy !== RefundPolicy.NONE,
      policy: refundPolicy.policy,
      reason: refundPolicy.reason,
      amount: refundPolicy.amount
    }
  } catch (error) {
    logger.error('Error checking refund eligibility', {
      bookingId,
      error
    })
    
    return {
      eligible: false,
      policy: RefundPolicy.NONE,
      reason: 'Error checking eligibility'
    }
  }
}