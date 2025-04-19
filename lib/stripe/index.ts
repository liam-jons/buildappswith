/**
 * Stripe utilities for Buildappswith
 * This module exports server-side Stripe utilities for use in the application
 */

import * as serverUtils from './stripe-server';

export { serverUtils };

/**
 * Creates a Stripe checkout session for a booking
 * @param bookingData The booking data
 * @param returnUrl The URL to return to after checkout
 * @returns The Stripe checkout session URL
 */
export async function createCheckoutSession(bookingData: any, returnUrl: string) {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingData,
        returnUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Retrieves a Stripe checkout session
 * @param sessionId The Stripe session ID
 * @returns The session data
 */
export async function getCheckoutSession(sessionId: string) {
  try {
    const response = await fetch(`/api/stripe/sessions/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to retrieve checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}
