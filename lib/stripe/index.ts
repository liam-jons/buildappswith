import Stripe from 'stripe';

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10', // Use the latest API version
});

/**
 * Creates a Stripe Checkout session for a booking
 */
export async function createCheckoutSession(bookingData: any, returnUrl: string) {
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Retrieves a Stripe Checkout session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  // This would typically be a server-side function
  // For client-side, we'd have an API route to proxy this
  const response = await fetch(`/api/stripe/sessions/${sessionId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retrieve session');
  }
  
  return response.json();
}

/**
 * Updates a booking's payment status after successful payment
 */
export async function updateBookingPaymentStatus(bookingId: string, paymentStatus: string) {
  // In a real implementation, this would update the booking in your database
  console.log(`Updating booking ${bookingId} with payment status: ${paymentStatus}`);
  // Implementation depends on your data storage strategy
}

/**
 * Format price for display (e.g., 9900 -> $99.00)
 */
export function formatPrice(amount: number, currency: string = 'usd') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  
  return formatter.format(amount / 100);
}
