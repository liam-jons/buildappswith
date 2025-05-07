/**
 * Stripe Webhook Handler
 * Version: 1.1.0
 * 
 * API for handling Stripe webhook events with logging and security
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Stripe } from 'stripe'
import { logger } from '@/lib/logger'
import { stripe } from '@/lib/stripe/stripe-server'
import { updateBookingPayment, updateBookingStatus } from '@/lib/scheduling/real-data/scheduling-service'
import { trackBookingEvent, AnalyticsEventType } from '@/lib/scheduling/calendly/analytics'

// Initialize Prisma client
const prisma = new PrismaClient()

/**
 * Verify Stripe webhook signature
 * 
 * @param signature Signature header from Stripe
 * @param body Raw request body
 * @returns Whether the signature is valid
 */
function verifyStripeSignature(signature: string, body: string): boolean {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      logger.warn('Stripe webhook secret is not configured')
      // In development, we can skip verification
      if (process.env.NODE_ENV === 'development') {
        return true
      }
      return false
    }
    
    // Verify the signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
    
    return true
  } catch (error) {
    logger.error('Stripe webhook signature verification failed', { error })
    return false
  }
}

/**
 * POST handler for Stripe webhooks
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body
    const rawBody = await req.text()
    
    // Get Stripe signature from headers
    const signature = req.headers.get('stripe-signature')
    
    // Verify signature
    if (!signature || !verifyStripeSignature(signature, rawBody)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    // Parse the webhook event
    const event = JSON.parse(rawBody) as Stripe.Event
    
    // Log the webhook event
    logger.info('Received Stripe webhook', {
      eventId: event.id,
      eventType: event.type
    })
    
    // Track webhook event in analytics
    trackBookingEvent(AnalyticsEventType.STRIPE_WEBHOOK_RECEIVED, {
      eventId: event.id,
      eventType: event.type
    })
    
    // Process based on event type
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      
      case 'checkout.session.expired': {
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break
      }
      
      case 'payment_intent.succeeded': {
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      }
      
      case 'payment_intent.payment_failed': {
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      }
      
      default: {
        logger.info(`Unhandled Stripe webhook event type: ${event.type}`)
      }
    }
    
    // Track successful webhook processing
    trackBookingEvent(AnalyticsEventType.STRIPE_WEBHOOK_PROCESSED, {
      eventId: event.id,
      eventType: event.type
    })
    
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      event: event.type
    })
  } catch (error: any) {
    logger.error('Error processing Stripe webhook', { error })
    
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout.session.completed event
 * 
 * @param session Checkout session object
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout.session.completed', {
    sessionId: session.id
  })
  
  // Get booking ID from metadata
  const bookingId = session.metadata?.bookingId
  const calendlyEventId = session.metadata?.calendlyEventId
  
  if (!bookingId) {
    logger.warn('No booking ID in checkout session metadata', {
      sessionId: session.id
    })
    return
  }
  
  try {
    // Check if the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!booking) {
      logger.warn('Booking not found for completed checkout session', {
        bookingId,
        sessionId: session.id
      })
      return
    }
    
    // Check if the payment is already processed
    if (booking.paymentStatus === 'PAID') {
      logger.info('Booking already marked as paid', {
        bookingId,
        sessionId: session.id
      })
      return
    }
    
    // Update the booking payment status
    await updateBookingPayment(
      bookingId,
      'PAID',
      session.id
    )
    
    logger.info('Updated booking payment status to PAID', {
      bookingId,
      sessionId: session.id
    })
    
    // Update the booking status to CONFIRMED if it's still PENDING
    if (booking.status === 'PENDING') {
      await updateBookingStatus(
        bookingId,
        'CONFIRMED'
      )
      
      logger.info('Updated booking status to CONFIRMED', {
        bookingId,
        sessionId: session.id
      })
    }
    
    // Track payment completion
    trackBookingEvent(AnalyticsEventType.PAYMENT_COMPLETED, {
      bookingId,
      stripeSessionId: session.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      amount: booking.amount?.toNumber(),
      calendlyEventId: booking.calendlyEventId
    })
  } catch (error) {
    logger.error('Error handling checkout.session.completed', {
      sessionId: session.id,
      bookingId,
      error
    })
    
    // Rethrow to send failure response
    throw error
  }
}

/**
 * Handle checkout.session.expired event
 * 
 * @param session Checkout session object
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  logger.info('Processing checkout.session.expired', {
    sessionId: session.id
  })
  
  // Get booking ID from metadata
  const bookingId = session.metadata?.bookingId
  
  if (!bookingId) {
    logger.warn('No booking ID in expired checkout session metadata', {
      sessionId: session.id
    })
    return
  }
  
  try {
    // Check if the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!booking) {
      logger.warn('Booking not found for expired checkout session', {
        bookingId,
        sessionId: session.id
      })
      return
    }
    
    // Check if the payment is already processed
    if (booking.paymentStatus !== 'UNPAID') {
      logger.info('Booking already has payment processed', {
        bookingId,
        sessionId: session.id,
        paymentStatus: booking.paymentStatus
      })
      return
    }
    
    // Update the booking payment status to FAILED
    await updateBookingPayment(
      bookingId,
      'FAILED',
      session.id
    )
    
    logger.info('Updated booking payment status to FAILED due to expiration', {
      bookingId,
      sessionId: session.id
    })
    
    // Track payment failure
    trackBookingEvent(AnalyticsEventType.PAYMENT_FAILED, {
      bookingId,
      stripeSessionId: session.id,
      reason: 'Checkout session expired',
      builderId: booking.builderId,
      clientId: booking.clientId
    })
  } catch (error) {
    logger.error('Error handling checkout.session.expired', {
      sessionId: session.id,
      bookingId,
      error
    })
    
    // Rethrow to send failure response
    throw error
  }
}

/**
 * Handle payment_intent.succeeded event
 * 
 * @param paymentIntent Payment intent object
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Processing payment_intent.succeeded', {
    paymentIntentId: paymentIntent.id
  })
  
  // Get session ID from metadata
  const sessionId = paymentIntent.metadata?.checkout_session_id
  
  if (!sessionId) {
    logger.info('No checkout session ID in payment intent', {
      paymentIntentId: paymentIntent.id
    })
    return
  }
  
  try {
    // Find the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    // Get booking ID from session metadata
    const bookingId = session.metadata?.bookingId
    
    if (!bookingId) {
      logger.warn('No booking ID in checkout session metadata', {
        sessionId,
        paymentIntentId: paymentIntent.id
      })
      return
    }
    
    // Check if the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!booking) {
      logger.warn('Booking not found for payment intent', {
        bookingId,
        paymentIntentId: paymentIntent.id
      })
      return
    }
    
    // Check if the payment is already processed
    if (booking.paymentStatus === 'PAID') {
      logger.info('Booking already marked as paid', {
        bookingId,
        paymentIntentId: paymentIntent.id
      })
      return
    }
    
    // Update the booking payment status
    await updateBookingPayment(
      bookingId,
      'PAID',
      sessionId
    )
    
    logger.info('Updated booking payment status to PAID', {
      bookingId,
      paymentIntentId: paymentIntent.id
    })
    
    // Update the booking status to CONFIRMED if it's still PENDING
    if (booking.status === 'PENDING') {
      await updateBookingStatus(
        bookingId,
        'CONFIRMED'
      )
      
      logger.info('Updated booking status to CONFIRMED', {
        bookingId,
        paymentIntentId: paymentIntent.id
      })
    }
    
    // Track payment completion
    trackBookingEvent(AnalyticsEventType.PAYMENT_COMPLETED, {
      bookingId,
      stripeSessionId: sessionId,
      paymentIntentId: paymentIntent.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      amount: booking.amount?.toNumber(),
      calendlyEventId: booking.calendlyEventId
    })
  } catch (error) {
    logger.error('Error handling payment_intent.succeeded', {
      paymentIntentId: paymentIntent.id,
      error
    })
    
    // Rethrow to send failure response
    throw error
  }
}

/**
 * Handle payment_intent.payment_failed event
 * 
 * @param paymentIntent Payment intent object
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.info('Processing payment_intent.payment_failed', {
    paymentIntentId: paymentIntent.id
  })
  
  // Get session ID from metadata
  const sessionId = paymentIntent.metadata?.checkout_session_id
  
  if (!sessionId) {
    logger.info('No checkout session ID in payment intent', {
      paymentIntentId: paymentIntent.id
    })
    return
  }
  
  try {
    // Find the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    // Get booking ID from session metadata
    const bookingId = session.metadata?.bookingId
    
    if (!bookingId) {
      logger.warn('No booking ID in checkout session metadata', {
        sessionId,
        paymentIntentId: paymentIntent.id
      })
      return
    }
    
    // Check if the booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    
    if (!booking) {
      logger.warn('Booking not found for failed payment intent', {
        bookingId,
        paymentIntentId: paymentIntent.id
      })
      return
    }
    
    // Check if the payment status is already updated
    if (booking.paymentStatus !== 'UNPAID') {
      logger.info('Booking payment status already updated', {
        bookingId,
        paymentIntentId: paymentIntent.id,
        paymentStatus: booking.paymentStatus
      })
      return
    }
    
    // Get failure reason from the payment intent
    const errorMessage = paymentIntent.last_payment_error?.message || 'Unknown payment failure'
    const errorCode = paymentIntent.last_payment_error?.code || 'unknown_error'
    
    // Update the booking payment status
    await updateBookingPayment(
      bookingId,
      'FAILED',
      sessionId
    )
    
    logger.info('Updated booking payment status to FAILED', {
      bookingId,
      paymentIntentId: paymentIntent.id,
      errorCode,
      errorMessage
    })
    
    // Track payment failure
    trackBookingEvent(AnalyticsEventType.PAYMENT_FAILED, {
      bookingId,
      stripeSessionId: sessionId,
      paymentIntentId: paymentIntent.id,
      builderId: booking.builderId,
      clientId: booking.clientId,
      errorCode,
      errorMessage
    })
  } catch (error) {
    logger.error('Error handling payment_intent.payment_failed', {
      paymentIntentId: paymentIntent.id,
      error
    })
    
    // Rethrow to send failure response
    throw error
  }
}