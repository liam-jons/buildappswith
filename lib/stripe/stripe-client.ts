/**
 * Client-side Stripe utilities
 * This file contains utilities for initializing the Stripe client
 * and creating checkout sessions from the client
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

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
 * @returns The checkout session ID
 */
export async function createCheckoutSession({
  builderId,
  sessionType,
  startTime,
  endTime,
  timeZone,
  customerId,
}: {
  builderId: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  customerId?: string;
}) {
  // Create a checkout session on the server
  const response = await fetch("/api/checkout/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      builderId,
      sessionType,
      startTime,
      endTime,
      timeZone,
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  const { id } = await response.json();
  return id;
}

/**
 * Redirect to Stripe checkout
 * @param sessionId - The Stripe checkout session ID
 */
export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error("Stripe failed to initialize");
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw new Error(error.message);
  }
}
