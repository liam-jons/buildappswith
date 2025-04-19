/**
 * Server-side Stripe utilities
 * This file contains utilities for working with Stripe on the server
 */

import { Stripe } from "stripe";

// Initialize Stripe with proper typing
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2025-03-31.basil' as const, // Updated to match expected version format
});

// Export the typed instance
export const stripe = stripeInstance;

/**
 * Get or create a Stripe customer
 * @param email - User's email address
 * @param name - User's name
 * @param userId - User's ID from auth system
 * @returns Stripe customer ID
 */
export async function getOrCreateCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name?: string | null;
  userId: string;
}) {
  // First, check if the user already has a customer ID stored
  // In a real implementation, this would query your database

  // For MVP, we'll search for the customer in Stripe
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0].id;
  }

  // Create a new customer if one doesn't exist
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for a builder booking
 * @param params Booking information
 * @returns The checkout session
 */
export async function createBookingCheckoutSession({
  builderId,
  builderName,
  sessionType,
  sessionPrice,
  startTime,
  endTime,
  timeZone,
  customerId,
  userId,
  userEmail,
  userName,
  successUrl,
  cancelUrl,
}: {
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
}) {
  // If no customer ID is provided, get or create one
  if (!customerId) {
    customerId = await getOrCreateCustomer({
      email: userEmail,
      name: userName,
      userId,
    });
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

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
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
    metadata: {
      builderId,
      userId,
      sessionType,
      startTime,
      endTime,
      timeZone,
    },
  });

  return session;
}

/**
 * Handle a Stripe webhook event
 * @param event The Stripe event
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // In a real implementation, this would update your database
      // For MVP, we'll just log the completed session
      console.log("Payment succeeded:", session.id);
      
      // Extract booking information from metadata
      const {
        builderId,
        userId,
        sessionType,
        startTime,
        endTime,
        timeZone,
      } = session.metadata || {};
      
      // Create the booking record
      if (builderId && userId && sessionType && startTime && endTime) {
        // In a real implementation, this would create a booking in your database
        console.log("Creating booking:", {
          builderId,
          userId,
          sessionType,
          startTime,
          endTime,
          timeZone,
          paymentStatus: "paid",
          paymentId: session.id,
        });
      }
      
      break;
    }
    // Handle other webhook events as needed
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
