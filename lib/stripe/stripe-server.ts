/**
 * Server-side Stripe utilities
 * This file contains utilities for working with Stripe on the server
 * Version: 1.1.0
 */

import { Stripe } from "stripe";
import { logger } from "@/lib/logger";
import { updateBookingPayment, updateBookingStatus, getBookingById } from "../scheduling/real-data/scheduling-service";
import { BookingStatus as PrismaBookingStatus, PaymentStatus as PrismaPaymentStatus } from '@prisma/client';

// Stripe error type classification
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

// Standard response structure for all Stripe operations
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

// Type for customer parameters
export interface CustomerParams {
  email: string;
  name?: string | null;
  userId: string;
}

// Type for booking checkout parameters
export interface BookingCheckoutParams {
  builderId: string;
  builderName: string;
  sessionType: string;
  sessionPrice: number;
  startTime: string;
  endTime: string;
  timeZone: string;
  customerId?: string;
  userId: string;
  userEmail: string;
  userName?: string | null;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
  bookingId?: string;
  metadata?: Record<string, any>;
  paymentOption?: string;
  clientName?: string | null;
}

// Initialize Stripe with proper typing
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2025-03-31.basil' as const,
  appInfo: {
    name: 'Buildappswith',
    version: '1.0.134',
  },
});

// Export the typed instance
export const stripe = stripeInstance;

/**
 * Creates a typed Stripe client instance
 *
 * This is a factory function that ensures proper initialization and configuration
 * of the Stripe client, including error handling for missing API keys.
 *
 * @returns A configured Stripe instance or null if configuration is invalid
 */
export function createStripeClient(): Stripe | null {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      logger.error('Stripe secret key is missing from environment variables');
      return null;
    }

    return new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil' as const,
      appInfo: {
        name: 'Buildappswith',
        version: '1.0.134',
      },
    });
  } catch (error) {
    logger.error('Failed to initialize Stripe client', { error });
    return null;
  }
}

/**
 * Helper function to handle Stripe errors consistently
 * 
 * @param error - The error thrown by Stripe
 * @param logContext - Additional context for logging
 * @returns Standardized error object
 */
export function handleStripeError(error: any, logContext: Record<string, any> = {}): {
  type: StripeErrorType;
  code?: string;
  detail?: string;
} {
  let errorType = StripeErrorType.UNKNOWN;
  let errorCode = undefined;
  let errorDetail = error.message || 'Unknown error occurred';

  // Classify the error based on Stripe's error types
  if (error.type) {
    switch (error.type) {
      case 'StripeAuthenticationError':
        errorType = StripeErrorType.AUTHENTICATION;
        break;
      case 'StripeAPIError':
        errorType = StripeErrorType.API;
        break;
      case 'StripeCardError':
        errorType = StripeErrorType.CARD;
        break;
      case 'StripeIdempotencyError':
        errorType = StripeErrorType.IDEMPOTENCY;
        break;
      case 'StripeInvalidRequestError':
        errorType = StripeErrorType.INVALID_REQUEST;
        break;
      case 'StripeRateLimitError':
        errorType = StripeErrorType.RATE_LIMIT;
        break;
      default:
        errorType = StripeErrorType.UNKNOWN;
    }
  }

  // Extract error code if available
  if (error.code) {
    errorCode = error.code;
  }

  // Log the error with context
  logger.error('Stripe operation failed', {
    ...logContext,
    errorType,
    errorCode,
    errorDetail
  });

  return {
    type: errorType,
    code: errorCode,
    detail: errorDetail
  };
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
  const { email, name, userId } = params;
  const logContext = { email, userId };
  
  try {
    logger.debug('Searching for existing customer', logContext);
    
    // First, check if the customer already exists
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    // If customer exists, return the ID
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logger.info('Found existing customer', { ...logContext, customerId });
      
      return {
        success: true,
        message: 'Found existing customer',
        data: customerId
      };
    }

    // Create a new customer if one doesn't exist
    logger.debug('Creating new customer', logContext);
    const customerMetadata = { userId };
    
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: customerMetadata
    });

    logger.info('Created new customer', { ...logContext, customerId: customer.id });
    
    return {
      success: true,
      message: 'Created new customer',
      data: customer.id
    };
  } catch (error) {
    const errorDetail = handleStripeError(error, logContext);
    
    return {
      success: false,
      message: 'Failed to get or create customer',
      error: errorDetail
    };
  }
}

/**
 * Create a checkout session for a builder booking
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
    customerId: providedCustomerId,
    userId,
    userEmail,
    userName,
    successUrl,
    cancelUrl,
    currency = 'usd',
    bookingId
  } = params;

  const logContext = {
    builderId,
    userId,
    sessionType,
    bookingId
  };

  try {
    logger.debug('Creating booking checkout session', logContext);

    // Get or create a customer
    let customerId = providedCustomerId;
    if (!customerId) {
      const customerResult = await getOrCreateCustomer({
        email: userEmail,
        name: userName,
        userId
      });

      if (!customerResult.success) {
        return {
          success: false,
          message: 'Failed to get or create customer for checkout',
          error: customerResult.error
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
            currency: currency,
            product_data: {
              name: `${sessionType} with ${builderName}`,
              description: `${formattedDate} at ${formattedTime} (${timeZone})`,
            },
            unit_amount: sessionPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
    });

    logger.info('Created checkout session', { 
      ...logContext, 
      sessionId: session.id 
    });
    
    // If a booking ID was provided, update the booking with the session ID
    if (bookingId) {
      try {
        await updateBookingPayment(
          bookingId,
          PrismaPaymentStatus.UNPAID,
          session.id
        );
        
        logger.info('Updated booking with checkout session ID', { 
          bookingId, 
          sessionId: session.id 
        });
      } catch (dbError) {
        // Log the error but don't fail the checkout creation
        logger.error('Failed to update booking with session ID', {
          bookingId,
          sessionId: session.id,
          error: dbError
        });
      }
    }

    return {
      success: true,
      message: 'Checkout session created successfully',
      data: session
    };
  } catch (error) {
    const errorDetail = handleStripeError(error, logContext);
    
    return {
      success: false,
      message: 'Failed to create checkout session',
      error: errorDetail
    };
  }
}

/**
 * Get a checkout session by ID
 * 
 * @param sessionId - Stripe checkout session ID
 * @returns A promise resolving to a StripeOperationResult with the session
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<StripeOperationResult<Stripe.Checkout.Session>> {
  const logContext = { sessionId };
  
  try {
    logger.debug('Retrieving checkout session', logContext);
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    });
    
    logger.info('Retrieved checkout session', { 
      ...logContext, 
      status: session.status,
      paymentStatus: session.payment_status 
    });
    
    return {
      success: true,
      message: 'Checkout session retrieved successfully',
      data: session
    };
  } catch (error) {
    const errorDetail = handleStripeError(error, logContext);
    
    return {
      success: false,
      message: 'Failed to retrieve checkout session',
      error: errorDetail
    };
  }
}

/**
 * Create a refund for a payment
 * 
 * @param paymentIntentId - Stripe payment intent ID
 * @param amount - Amount to refund (in cents)
 * @param reason - Reason for the refund
 * @returns A promise resolving to a StripeOperationResult with the refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<StripeOperationResult<Stripe.Refund>> {
  const logContext = { paymentIntentId, amount, reason };
  
  try {
    logger.debug('Creating refund', logContext);
    
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason
    });
    
    logger.info('Created refund', { 
      ...logContext, 
      refundId: refund.id,
      status: refund.status
    });
    
    return {
      success: true,
      message: 'Refund created successfully',
      data: refund
    };
  } catch (error) {
    const errorDetail = handleStripeError(error, logContext);
    
    return {
      success: false,
      message: 'Failed to create refund',
      error: errorDetail
    };
  }
}

/**
 * Handle a Stripe webhook event
 * 
 * @param event - The Stripe event object
 * @returns A promise resolving to a StripeOperationResult
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<StripeOperationResult<{ handled: boolean }>> {
  const logContext = { 
    eventId: event.id,
    eventType: event.type
  };
  
  try {
    logger.debug('Processing webhook event', logContext);
    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const { bookingId } = session.metadata || {};
        
        logger.info('Payment succeeded', { 
          ...logContext, 
          sessionId,
          bookingId
        });
        
        // Update the booking if a booking ID was provided
        if (bookingId) {
          try {
            // First, verify the booking exists
            const booking = await getBookingById(bookingId);
            
            if (!booking) {
              logger.error('Booking not found for completed payment', {
                ...logContext,
                bookingId
              });
              
              return {
                success: false,
                message: 'Booking not found for completed payment',
                error: {
                  type: StripeErrorType.INVALID_REQUEST,
                  detail: `Booking ${bookingId} not found`
                }
              };
            }
            
            // Update the booking payment status
            await updateBookingPayment(
              bookingId,
              PrismaPaymentStatus.PAID,
              sessionId
            );
            
            // Update the booking status to confirmed
            await updateBookingStatus(
              bookingId,
              PrismaBookingStatus.CONFIRMED
            );
            
            logger.info('Updated booking status for completed payment', {
              ...logContext,
              bookingId,
              status: 'confirmed',
              paymentStatus: 'paid'
            });
          } catch (dbError) {
            logger.error('Failed to update booking for completed payment', {
              ...logContext,
              bookingId,
              error: dbError
            });
            
            const detailMessage = dbError instanceof Error ? dbError.message : 'Unknown database error while updating booking.';
            return {
              success: false,
              message: 'Failed to update booking for completed payment',
              error: {
                type: StripeErrorType.UNKNOWN,
                detail: `Database error: ${detailMessage}`
              }
            };
          }
        } else {
          logger.warn('No booking ID in metadata for completed payment', {
            ...logContext,
            sessionId
          });
        }
        
        break;
      }
      
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const sessionId = paymentIntent.metadata?.checkout_session_id;
        const { bookingId } = paymentIntent.metadata || {};
        
        logger.info('Payment failed', { 
          ...logContext, 
          paymentIntentId: paymentIntent.id,
          sessionId,
          bookingId
        });
        
        // Update the booking if a booking ID was provided
        if (bookingId) {
          try {
            // Update the booking payment status
            await updateBookingPayment(
              bookingId,
              PrismaPaymentStatus.UNPAID,
              sessionId
            );
            
            logger.info('Updated booking for failed payment', {
              ...logContext,
              bookingId,
              paymentStatus: 'unpaid'
            });
          } catch (dbError) {
            logger.error('Failed to update booking for failed payment', {
              ...logContext,
              bookingId,
              error: dbError
            });
            
            const detailMessage = dbError instanceof Error ? dbError.message : 'Unknown database error while updating booking for failed payment.';
            return {
              success: false,
              message: 'Failed to update booking for failed payment',
              error: {
                type: StripeErrorType.UNKNOWN,
                detail: `Database error: ${detailMessage}`
              }
            };
          }
        } else {
          logger.warn('No booking ID in metadata for failed payment', {
            ...logContext,
            paymentIntentId: paymentIntent.id
          });
        }
        
        break;
      }
      
      // Handle other webhook events as needed
      default:
        logger.info(`Unhandled event type: ${event.type}`, logContext);
    }
    
    return {
      success: true,
      message: `Processed webhook event: ${event.type}`,
      data: { handled: true }
    };
  } catch (error) {
    const errorDetail = handleStripeError(error, logContext);
    
    return {
      success: false,
      message: 'Failed to process webhook event',
      error: errorDetail
    };
  }
}
