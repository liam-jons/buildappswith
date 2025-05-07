/**
 * Stripe payment validation schemas
 * Version: 1.1.0
 * 
 * Zod schemas for payment data validation with Calendly integration
 */

import { z } from 'zod';

/**
 * Schema for booking data in checkout requests
 */
export const bookingDataSchema = z.object({
  id: z.string().optional(),
  builderId: z.string(),
  sessionTypeId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  clientId: z.string().optional(),
  clientTimezone: z.string().optional(),
  // Calendly specific fields
  calendlyEventId: z.string().optional(),
  calendlyEventUri: z.string().optional(),
  calendlyInviteeUri: z.string().optional(),
});

/**
 * Schema for checkout session requests
 */
export const checkoutSessionSchema = z.object({
  bookingData: bookingDataSchema,
  returnUrl: z.string().url(),
});

/**
 * Type for checkout session request input
 */
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

/**
 * Schema for payment status requests
 */
export const paymentStatusSchema = z.object({
  sessionId: z.string(),
  bookingId: z.string().optional(),
});

/**
 * Type for payment status request input
 */
export type PaymentStatusInput = z.infer<typeof paymentStatusSchema>;
