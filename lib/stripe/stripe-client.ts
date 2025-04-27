/**
 * Client-side Stripe utilities
 * This file contains utilities for initializing the Stripe client
 * and creating checkout sessions from the client
 * @version 1.0.111
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

// Define response type for consistent API communication
export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

// Response type for checkout session
export type CheckoutSessionResponse = {
  sessionId: string;
  url: string;
};

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
 * Uses idempotency to prevent duplicate charges
 * 
 * @param bookingData - The booking data to process
 * @param returnUrl - URL to return to after checkout
 * @returns The checkout session URL and ID
 */
export async function createCheckoutSession(
  bookingData: any, 
  returnUrl: string,
  idempotencyKey?: string
): Promise<ApiResponse<CheckoutSessionResponse>> {
  try {
    // Generate idempotency key if not provided
    // Using booking ID + timestamp for uniqueness
    const generatedKey = idempotencyKey || 
      `booking_${bookingData.id || 'new'}_${Date.now()}_${uuidv4().substring(0, 8)}`;
    
    logger.info("Creating checkout session", {
      bookingId: bookingData.id,
      idempotencyKey: generatedKey,
    });

    // Create a checkout session on the server
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": generatedKey,
      },
      body: JSON.stringify({
        bookingData,
        returnUrl,
      }),
    });

    // Parse the response
    const result = await response.json() as ApiResponse<CheckoutSessionResponse>;

    // Handle server errors
    if (!response.ok) {
      logger.error("Checkout session creation failed", {
        status: response.status,
        error: result.error,
        message: result.message,
      });
      
      return {
        success: false,
        message: result.message || "Failed to create checkout session",
        error: result.error || "UNKNOWN_ERROR",
      };
    }

    // Return the successful response
    logger.info("Checkout session created successfully", {
      sessionId: result.data?.sessionId,
    });
    
    return result;
  } catch (error) {
    // Handle client-side errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    logger.error("Client-side error creating checkout session", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return {
      success: false,
      message: "Failed to create checkout session",
      error: errorMessage,
    };
  }
}

/**
 * Redirect to Stripe checkout
 * @param sessionId - The Stripe checkout session ID
 * @param fallbackUrl - Optional URL to redirect to if the direct method fails
 * @returns Promise resolving to success status
 */
export async function redirectToCheckout(
  sessionId: string, 
  fallbackUrl?: string
): Promise<ApiResponse<null>> {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }

    logger.info("Redirecting to checkout", { sessionId });
    
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      logger.error("Stripe redirect error", { 
        error: error.message,
        sessionId,
      });
      
      // If a fallback URL was provided and we're in a browser context
      if (fallbackUrl && typeof window !== 'undefined') {
        logger.info("Using fallback URL for redirect", { fallbackUrl });
        window.location.href = fallbackUrl;
        return { success: true, message: "Redirected using fallback URL" };
      }
      
      throw new Error(error.message);
    }

    return { success: true, message: "Redirect initiated" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    logger.error("Failed to redirect to checkout", {
      error: errorMessage,
      sessionId,
    });
    
    return {
      success: false,
      message: "Failed to redirect to checkout",
      error: errorMessage,
    };
  }
}

/**
 * Retrieves a Stripe checkout session
 * @param sessionId The Stripe session ID
 * @returns Promise resolving to session data
 */
export async function getCheckoutSession(sessionId: string): Promise<ApiResponse<any>> {
  try {
    logger.info("Fetching checkout session", { sessionId });
    
    const response = await fetch(`/api/stripe/sessions/${sessionId}`);
    const result = await response.json() as ApiResponse<any>;

    if (!response.ok) {
      logger.error("Failed to retrieve checkout session", {
        status: response.status,
        error: result.error,
        sessionId,
      });
      
      return {
        success: false,
        message: result.message || "Failed to retrieve checkout session",
        error: result.error || "UNKNOWN_ERROR",
      };
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    logger.error("Client-side error retrieving checkout session", {
      error: errorMessage,
      sessionId,
    });
    
    return {
      success: false,
      message: "Failed to retrieve checkout session",
      error: errorMessage,
    };
  }
}