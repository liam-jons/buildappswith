/**
 * Server-side Stripe utilities
 * This file contains utilities for working with Stripe on the server
 * @version 1.0.124
 */

import { Stripe } from "stripe";
import { logger } from "../logger";

/**
 * Supported Stripe API version
 * This should be updated when new features are needed
 */
export const STRIPE_API_VERSION = '2025-03-31.basil' as const;

/**
 * Error types specific to Stripe operations
 */
export enum StripeErrorType {
  AUTHENTICATION = 'authentication_error',
  API = 'api_error',
  CARD = 'card_error',
  IDEMPOTENCY = 'idempotency_error',
  INVALID_REQUEST = 'invalid_request_error',
  RATE_LIMIT = 'rate_limit_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}

/**
 * Standardized response format for Stripe operations
 */
export interface StripeOperationResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: StripeErrorType;
    code?: string;
    detail?: string;
  };
}

/**
 * Initialize Stripe with proper typing and configuration
 */
const stripeInstance = new Stripe(
  process.env.STRIPE_SECRET_KEY || "", 
  {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: {
      name: 'Buildappswith',
      version: '1.0.124',
      url: 'https://buildappswith.com',
    },
    telemetry: process.env.NODE_ENV === 'production', // Disable telemetry in development
  }
);

/**
 * Typed Stripe instance for use in the application
 */
export const stripe = stripeInstance;

/**
 * Parameters for creating or retrieving a customer
 */
export interface CustomerParams {
  /** User's email address */
  email: string;
  /** User's name (optional) */
  name?: string | null;
  /** User's unique ID from the auth system */
  userId: string;
  /** Additional metadata to store with the customer */
  metadata?: Record<string, string>;
}

/**
 * Get or create a Stripe customer by email
 * 
 * This function first checks if a customer with the given email exists,
 * and creates a new one if not found.
 * 
 * @param params - Customer parameters including email, name, and userId
 * @returns A promise resolving to a StripeOperationResult with the customer ID
 */
export async function getOrCreateCustomer(
  params: CustomerParams
): Promise<StripeOperationResult<string>> {
  const { email, name, userId, metadata = {} } = params;
  const logContext = { userId, email };

  try {
    logger.debug('Searching for existing Stripe customer', logContext);
    
    // First, check if the user already has a customer ID in Stripe
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    // Return existing customer if found
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logger.debug('Found existing Stripe customer', { ...logContext, customerId });
      
      return {
        success: true,
        message: 'Existing customer found',
        data: customerId,
      };
    }

    // Create a new customer if one doesn't exist
    const customerMetadata = {
      userId,
      ...metadata,
    };
    
    logger.info('Creating new Stripe customer', { ...logContext, metadata: customerMetadata });
    
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: customerMetadata,
    });

    logger.info('Stripe customer created successfully', { 
      ...logContext, 
      customerId: customer.id 
    });

    return {
      success: true,
      message: 'New customer created',
      data: customer.id,
    };
  } catch (error) {
    const errorDetail = handleStripeError(error);
    
    logger.error('Failed to get or create Stripe customer', {
      ...logContext,
      error: errorDetail,
    });

    return {
      success: false,
      message: 'Failed to get or create customer',
      error: errorDetail,
    };
  }
}

/**
 * Parameters for creating a booking checkout session
 */
export interface BookingCheckoutParams {
  /** Builder's unique ID */
  builderId: string;
  /** Builder's display name */
  builderName: string;
  /** Type of session being booked */
  sessionType: string;
  /** Price of the session in the currency's base unit (e.g., cents for USD) */
  sessionPrice: number;
  /** ISO timestamp for session start */
  startTime: string;
  /** ISO timestamp for session end */
  endTime: string;
  /** User's timezone (e.g., 'America/New_York') */
  timeZone: string;
  /** Stripe customer ID (optional - will be created if not provided) */
  customerId?: string;
  /** User's unique ID from the auth system */
  userId: string;
  /** User's email address */
  userEmail: string;
  /** User's name (optional) */
  userName?: string | null;
  /** URL to redirect after successful payment */
  successUrl: string;
  /** URL to redirect after cancelled payment */
  cancelUrl: string;
  /** Currency code (default: 'usd') */
  currency?: string;
  /** Optional booking ID for existing booking */
  bookingId?: string;
}

/**
 * Create a checkout session for a builder booking
 * 
 * This function creates a Stripe checkout session for booking a session
 * with a builder. If no customer ID is provided, it will create one.
 * 
 * @param params - Booking checkout parameters
 * @returns A promise resolving to a StripeOperationResult with the checkout session
 */
export async function createBookingCheckoutSession(
  params: BookingCheckoutParams
): Promise<StripeOperationResult<Stripe.Checkout.Session>> {
  const {
    builderId,
    builderName,
    sessionType,
    sessionPrice,
    startTime,
    endTime,
    timeZone,
    customerId: existingCustomerId,
    userId,
    userEmail,
    userName,
    successUrl,
    cancelUrl,
    currency = 'usd',
    bookingId,
  } = params;

  const logContext = {
    userId,
    builderId,
    sessionType,
    bookingId,
  };

  try {
    logger.debug('Creating booking checkout session', logContext);

    // If no customer ID is provided, get or create one
    let customerId = existingCustomerId;
    if (!customerId) {
      const customerResult = await getOrCreateCustomer({
        email: userEmail,
        name: userName,
        userId,
        metadata: {
          source: 'booking_checkout',
        },
      });

      if (!customerResult.success) {
        logger.error('Failed to get or create customer for checkout', {
          ...logContext,
          error: customerResult.error,
        });
        
        return {
          success: false,
          message: 'Failed to create customer for checkout',
          error: customerResult.error,
        };
      }

      customerId = customerResult.data;
    }

    // Format the date for the session description
    const date = new Date(startTime);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone,
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    });

    // Prepare metadata for the checkout session
    const sessionMetadata: Record<string, string> = {
      builderId,
      userId,
      sessionType,
      startTime,
      endTime,
      timeZone,
    };

    // Add booking ID to metadata if provided
    if (bookingId) {
      sessionMetadata.bookingId = bookingId;
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${sessionType} with ${builderName}`,
              description: `${formattedDate} at ${formattedTime} (${timeZone})`,
            },
            unit_amount: sessionPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
    });

    logger.info('Checkout session created successfully', {
      ...logContext,
      sessionId: session.id,
    });

    return {
      success: true,
      message: 'Checkout session created successfully',
      data: session,
    };
  } catch (error) {
    const errorDetail = handleStripeError(error);
    
    logger.error('Failed to create checkout session', {
      ...logContext,
      error: errorDetail,
    });

    return {
      success: false,
      message: 'Failed to create checkout session',
      error: errorDetail,
    };
  }
}

/**
 * Handle a Stripe webhook event
 * 
 * This function processes different types of Stripe webhook events
 * and returns a standardized result.
 * 
 * @param event - The Stripe event to handle
 * @returns A promise resolving to a StripeOperationResult with the processing result
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<StripeOperationResult> {
  const logContext = { 
    eventId: event.id,
    eventType: event.type,
  };

  try {
    logger.info(`Processing webhook event: ${event.type}`, logContext);
    
    // Process different event types
    switch (event.type) {
      case "checkout.session.completed": {
        return await handleCheckoutSessionCompleted(event);
      }
      case "payment_intent.succeeded": {
        return await handlePaymentIntentSucceeded(event);
      }
      case "payment_intent.payment_failed": {
        return await handlePaymentIntentFailed(event);
      }
      // Add other event types as needed
      default: {
        logger.info(`Unhandled event type: ${event.type}`, logContext);
        return { 
          success: true, 
          message: `Unhandled event type: ${event.type}` 
        };
      }
    }
  } catch (error) {
    const errorDetail = handleStripeError(error);
    
    logger.error('Error processing webhook event', { 
      ...logContext, 
      error: errorDetail,
    });
    
    return { 
      success: false, 
      message: 'Error processing webhook event',
      error: errorDetail,
    };
  }
}

/**
 * Handle a successful checkout session completion
 * 
 * @param event - The Stripe event containing checkout session data
 * @returns A promise resolving to a StripeOperationResult with the processing result
 */
async function handleCheckoutSessionCompleted(
  event: Stripe.Event
): Promise<StripeOperationResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  const logContext = { sessionId: session.id, eventId: event.id };
  
  logger.info(`Payment succeeded for session: ${session.id}`, logContext);
  
  // Extract booking information from metadata
  const {
    bookingId,
    builderId,
    userId: clientId,
    sessionTypeId,
    startTime,
    endTime,
  } = session.metadata || {};
  
  // Validate required metadata
  if (!builderId || !clientId || !sessionTypeId || !startTime || !endTime) {
    const missingFields = [];
    if (!builderId) missingFields.push('builderId');
    if (!clientId) missingFields.push('clientId');
    if (!sessionTypeId) missingFields.push('sessionTypeId');
    if (!startTime) missingFields.push('startTime');
    if (!endTime) missingFields.push('endTime');
    
    logger.error('Missing required metadata in checkout session', { 
      ...logContext, 
      metadata: session.metadata,
      missingFields,
    });
    
    return { 
      success: false, 
      message: 'Missing required metadata in checkout session',
      error: {
        type: StripeErrorType.VALIDATION,
        detail: `Missing fields: ${missingFields.join(', ')}`,
      },
    };
  }
  
  try {
    // In a real implementation, this would update your database
    // TODO: Implement database update using Prisma
    // const updatedBooking = await prisma.booking.update({
    //   where: { id: bookingId },
    //   data: {
    //     status: 'CONFIRMED',
    //     paymentStatus: 'PAID',
    //     stripeSessionId: session.id,
    //     updatedAt: new Date(),
    //   },
    // });
    
    // For now, we'll just log the details
    const bookingDetails = {
      bookingId,
      builderId,
      clientId,
      sessionTypeId,
      startTime,
      endTime,
      paymentStatus: "PAID",
      stripeSessionId: session.id,
    };
    
    logger.info('Booking confirmed with payment', { 
      ...logContext,
      booking: bookingDetails 
    });
    
    return { 
      success: true, 
      message: 'Checkout session completed successfully', 
      data: bookingDetails 
    };
  } catch (error) {
    const errorDetail = handleStripeError(error);
    
    logger.error('Failed to update booking after payment', { 
      ...logContext, 
      bookingId, 
      error: errorDetail,
    });
    
    return { 
      success: false, 
      message: 'Failed to update booking after payment',
      error: errorDetail,
    };
  }
}

/**
 * Handle a successful payment intent
 * 
 * @param event - The Stripe event containing payment intent data
 * @returns A promise resolving to a StripeOperationResult with the processing result
 */
async function handlePaymentIntentSucceeded(
  event: Stripe.Event
): Promise<StripeOperationResult> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const logContext = { 
    paymentIntentId: paymentIntent.id,
    eventId: event.id,
  };
  
  logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`, logContext);
  
  // Additional handling if needed
  // This might be redundant with checkout.session.completed in many cases
  
  return { 
    success: true, 
    message: `PaymentIntent ${paymentIntent.id} succeeded`,
    data: {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    },
  };
}

/**
 * Handle a failed payment intent
 * 
 * @param event - The Stripe event containing payment intent data
 * @returns A promise resolving to a StripeOperationResult with the processing result
 */
async function handlePaymentIntentFailed(
  event: Stripe.Event
): Promise<StripeOperationResult> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const logContext = { 
    paymentIntentId: paymentIntent.id,
    eventId: event.id,
    error: paymentIntent.last_payment_error,
    metadata: paymentIntent.metadata,
  };
  
  logger.error(`PaymentIntent failed: ${paymentIntent.id}`, logContext);
  
  // TODO: Update booking status in the database
  // TODO: Notify user about the failed payment
  
  return { 
    success: true, 
    message: `PaymentIntent ${paymentIntent.id} failed`,
    data: {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error,
      status: paymentIntent.status,
    },
  };
}

/**
 * Extract error details from a Stripe error
 * 
 * This function standardizes error handling for Stripe operations
 * by extracting relevant details from different error types.
 * 
 * @param error - The error object from a Stripe operation
 * @returns A standardized error object
 */
function handleStripeError(error: unknown): {
  type: StripeErrorType;
  code?: string;
  detail?: string;
} {
  // Handle Stripe errors
  if (typeof error === 'object' && error !== null && 'type' in error) {
    const stripeError = error as Stripe.StripeError;
    return {
      type: stripeError.type as StripeErrorType,
      code: stripeError.code,
      detail: stripeError.message,
    };
  }
  
  // Handle generic errors
  return {
    type: StripeErrorType.UNKNOWN,
    detail: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Retrieve a checkout session by ID
 * 
 * @param sessionId - The Stripe checkout session ID
 * @returns A promise resolving to a StripeOperationResult with the session data
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<StripeOperationResult<Stripe.Checkout.Session>> {
  const logContext = { sessionId };
  
  try {
    logger.debug('Retrieving checkout session', logContext);
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    });
    
    logger.debug('Checkout session retrieved successfully', logContext);
    
    return {
      success: true,
      message: 'Checkout session retrieved successfully',
      data: session,
    };
  } catch (error) {
    const errorDetail = handleStripeError(error);
    
    logger.error('Failed to retrieve checkout session', {
      ...logContext,
      error: errorDetail,
    });
    
    return {
      success: false,
      message: 'Failed to retrieve checkout session',
      error: errorDetail,
    };
  }
}

/**
 * Create a refund for a payment
 * 
 * @param paymentIntentId - The Stripe payment intent ID to refund
 * @param amount - Optional amount to refund (in cents), defaults to full amount
 * @param reason - Optional reason for the refund
 * @returns A promise resolving to a StripeOperationResult with the refund data
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<StripeOperationResult<Stripe.Refund>> {
  const logContext = { 
    paymentIntentId,
    amount,
    reason,
  };
  
  try {
    logger.info('Creating refund', logContext);
    
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundParams.amount = amount;
    }
    
    if (reason) {
      refundParams.reason = reason;
    }
    
    const refund = await stripe.refunds.create(refundParams);
    
    logger.info('Refund created successfully', {
      ...logContext,
      refundId: refund.id,
      status: refund.status,
    });
    
    return {
      success: true,
      message: 'Refund created successfully',
      data: refund,
    };
  } catch (error) {
    const errorDetail = handleStripeError(error);
    
    logger.error('Failed to create refund', {
      ...logContext,
      error: errorDetail,
    });
    
    return {
      success: false,
      message: 'Failed to create refund',
      error: errorDetail,
    };
  }
}
