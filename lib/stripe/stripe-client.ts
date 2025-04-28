/**
 * Client-side Stripe utilities
 * This file contains utilities for initializing the Stripe client
 * and creating checkout sessions from the client
 * Version: 1.0.133
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from "uuid";

// Stripe error type classification for client-side
export enum StripeClientErrorType {
  INITIALIZATION = 'stripe_initialization_error',
  NETWORK = 'network_error',
  CHECKOUT = 'checkout_error',
  SESSION = 'session_error',
  REDIRECT = 'redirect_error',
  PAYMENT = 'payment_error',
  UNKNOWN = 'unknown_error'
}

// Client-side response structure similar to server
export interface StripeClientResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    type: StripeClientErrorType;
    code?: string;
    detail?: string;
  };
}

// Initialize Stripe client
let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe client instance
 * @returns Promise resolving to the Stripe client
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
    );
  }
  return stripePromise;
};

/**
 * Create a checkout session for a builder booking
 * @param builderId - ID of the builder being booked
 * @param sessionType - Type of session being booked
 * @param startTime - Start time of the booking
 * @param endTime - End time of the booking
 * @param timeZone - User's timezone
 * @param customerId - Optional customer ID from auth system
 * @param bookingId - Booking ID for this session
 * @returns Promise resolving to a StripeClientResult with the session ID
 */
export async function createCheckoutSession({
  builderId,
  sessionType,
  startTime,
  endTime,
  timeZone,
  customerId,
  bookingId,
  returnUrl,
}: {
  builderId: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  customerId?: string;
  bookingId?: string;
  returnUrl: string;
}): Promise<StripeClientResult<{ sessionId: string; url: string }>> {
  try {
    // Generate idempotency key based on booking parameters
    const idempotencyKey = uuidv4();
    
    // Create a checkout session on the server
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        bookingData: {
          id: bookingId,
          builderId,
          sessionTypeId: sessionType,
          startTime,
          endTime,
          clientId: customerId,
        },
        returnUrl,
      }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: "Failed to create checkout session",
        error: {
          type: StripeClientErrorType.CHECKOUT,
          detail: errorData.error || "Server returned an error",
        },
      };
    }

    // Parse successful response
    const { sessionId, url } = await response.json();
    
    return {
      success: true,
      message: "Checkout session created successfully",
      data: { sessionId, url },
    };
  } catch (error: any) {
    // Handle network or other errors
    return {
      success: false,
      message: "Failed to create checkout session",
      error: {
        type: StripeClientErrorType.NETWORK,
        detail: error.message || "Network or client error occurred",
      },
    };
  }
}

/**
 * Redirect to Stripe checkout
 * @param sessionId - The Stripe checkout session ID or session URL
 * @returns Promise resolving to a StripeClientResult
 */
export async function redirectToCheckout(sessionIdOrUrl: string): Promise<StripeClientResult> {
  try {
    // Check if this is a URL or a session ID
    if (sessionIdOrUrl.startsWith('http')) {
      // If it's a URL, navigate directly
      window.location.href = sessionIdOrUrl;
      return {
        success: true,
        message: "Redirecting to checkout page",
      };
    }
    
    // Otherwise treat as a session ID and use Stripe's redirect
    const stripe = await getStripe();
    if (!stripe) {
      return {
        success: false,
        message: "Stripe failed to initialize",
        error: {
          type: StripeClientErrorType.INITIALIZATION,
          detail: "Stripe client could not be loaded",
        },
      };
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: sessionIdOrUrl,
    });

    if (error) {
      return {
        success: false,
        message: "Failed to redirect to checkout",
        error: {
          type: StripeClientErrorType.REDIRECT,
          code: error.code,
          detail: error.message,
        },
      };
    }

    return {
      success: true,
      message: "Redirecting to checkout page",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to redirect to checkout",
      error: {
        type: StripeClientErrorType.UNKNOWN,
        detail: error.message || "An unexpected error occurred",
      },
    };
  }
}

/**
 * Fetch details of a checkout session
 * @param sessionId - The Stripe checkout session ID
 * @returns Promise resolving to a StripeClientResult with session details
 */
export async function getCheckoutSessionDetails(
  sessionId: string
): Promise<StripeClientResult<any>> {
  try {
    const response = await fetch(`/api/stripe/sessions/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: "Failed to retrieve session details",
        error: {
          type: StripeClientErrorType.SESSION,
          detail: errorData.error || "Server returned an error",
        },
      };
    }

    const sessionData = await response.json();
    
    return {
      success: true,
      message: "Session details retrieved successfully",
      data: sessionData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to retrieve session details",
      error: {
        type: StripeClientErrorType.NETWORK,
        detail: error.message || "Network or client error occurred",
      },
    };
  }
}

/**
 * Complete the booking process with Stripe payment
 * This is a convenience function that combines creating a booking, 
 * creating a checkout session, and redirecting to Stripe
 * 
 * @param bookingData - The booking data
 * @param returnUrl - URL to return to after payment
 * @returns Promise resolving to a StripeClientResult
 */
export async function completeBookingWithPayment(
  bookingData: any,
  returnUrl: string
): Promise<StripeClientResult> {
  try {
    // Step 1: Create the booking
    const bookingResponse = await fetch('/api/scheduling/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!bookingResponse.ok) {
      const errorData = await bookingResponse.json();
      return {
        success: false,
        message: "Failed to create booking",
        error: {
          type: StripeClientErrorType.CHECKOUT,
          detail: errorData.error || "Failed to create booking record",
        },
      };
    }
    
    const { booking } = await bookingResponse.json();
    
    // Step 2: Create the checkout session
    const checkoutResult = await createCheckoutSession({
      builderId: bookingData.builderId,
      sessionType: bookingData.sessionTypeId,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      timeZone: bookingData.clientTimezone,
      customerId: bookingData.clientId,
      bookingId: booking.id,
      returnUrl,
    });
    
    if (!checkoutResult.success) {
      return checkoutResult;
    }
    
    // Step 3: Redirect to Stripe checkout
    return await redirectToCheckout(checkoutResult.data!.url);
    
  } catch (error: any) {
    return {
      success: false,
      message: "Payment process failed",
      error: {
        type: StripeClientErrorType.UNKNOWN,
        detail: error.message || "An unexpected error occurred during payment process",
      },
    };
  }
}
