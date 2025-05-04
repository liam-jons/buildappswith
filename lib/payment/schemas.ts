/**
 * Zod validation schemas for payment data
 */

import { z } from "zod";
import { PaymentStatus } from "./types";

/**
 * Schema for checkout session parameters
 */
export const checkoutSessionSchema = z.object({
  bookingId: z.string().uuid({
    message: "Booking ID must be a valid UUID",
  }),
  sessionTypeId: z.string().uuid({
    message: "Session type ID must be a valid UUID",
  }),
  returnUrl: z.string().url({
    message: "Return URL must be a valid URL",
  }),
  metadata: z
    .record(z.string(), z.string())
    .optional()
    .describe("Additional metadata for the checkout session"),
});

/**
 * Schema for payment status updates
 */
export const paymentStatusSchema = z.object({
  sessionId: z.string({
    required_error: "Session ID is required",
  }),
  status: z.nativeEnum(PaymentStatus, {
    required_error: "Payment status is required",
    invalid_type_error: "Status must be a valid payment status",
  }),
});

/**
 * Schema for webhook event validation
 */
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.any()),
  }),
});

/**
 * Schema for refund requests
 */
export const refundRequestSchema = z.object({
  paymentIntentId: z.string({
    required_error: "Payment intent ID is required",
  }),
  amount: z
    .number()
    .positive({
      message: "Refund amount must be positive",
    })
    .optional()
    .describe("Amount to refund in the smallest currency unit (e.g., cents)"),
  reason: z
    .enum(["requested_by_customer", "duplicate", "fraudulent"])
    .optional()
    .describe("Reason for the refund"),
});

/**
 * Schema for payment history filters
 */
export const paymentHistoryFilterSchema = z.object({
  startDate: z.string().optional().describe("Start date for filtering payments"),
  endDate: z.string().optional().describe("End date for filtering payments"),
  status: z.nativeEnum(PaymentStatus).optional().describe("Payment status filter"),
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(10)
    .describe("Maximum number of payments to return"),
  offset: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(0)
    .describe("Number of payments to skip"),
});

/**
 * Schema for payment intent creation
 */
export const paymentIntentSchema = z.object({
  amount: z.number().int().positive({
    message: "Amount must be a positive integer",
  }),
  currency: z.string().length(3, {
    message: "Currency must be a 3-letter ISO currency code",
  }),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for invoice creation
 */
export const invoiceSchema = z.object({
  customerId: z.string({
    required_error: "Customer ID is required",
  }),
  items: z.array(
    z.object({
      amount: z.number().int().positive(),
      currency: z.string().length(3),
      description: z.string(),
    })
  ),
  dueDate: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});
