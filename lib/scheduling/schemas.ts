/**
 * Scheduling validation schemas
 * Version: 1.0.0
 * 
 * Zod schemas for validating scheduling-related data
 */

import { z } from 'zod';

// Schema for validating booking request data
export const bookingRequestSchema = z.object({
  sessionTypeId: z.string().min(1, "Session type is required"),
  builderId: z.string().min(1, "Builder ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid start time format"),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, "Invalid end time format"),
  notes: z.string().optional(),
  clientTimezone: z.string().optional(),
  calendlyEventId: z.string().optional(),
  calendlyEventUri: z.string().optional(),
  calendlyInviteeUri: z.string().optional(),
});

// Schema for validating session type data
export const sessionTypeSchema = z.object({
  id: z.string().optional(),
  builderId: z.string().min(1, "Builder ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  durationMinutes: z.number().min(15, "Duration must be at least 15 minutes"),
  price: z.number().min(0, "Price must be non-negative"),
  currency: z.string().min(3, "Currency code is required"),
  isActive: z.boolean().default(true),
  color: z.string().optional(),
  maxParticipants: z.number().optional(),
  calendlyEventTypeId: z.string().optional(),
  calendlyEventTypeUri: z.string().optional(),
});

// Schema for validating availability rule data
export const availabilityRuleSchema = z.object({
  id: z.string().optional(),
  builderId: z.string().min(1, "Builder ID is required"),
  dayOfWeek: z.number().min(0).max(6, "Day of week must be between 0-6"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format"),
  timezone: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Schema for validating availability exception data
export const availabilityExceptionSchema = z.object({
  id: z.string().optional(),
  builderId: z.string().min(1, "Builder ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  isAvailable: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional(),
  reason: z.string().optional(),
});

// Schema for validating time slot request
export const timeSlotRequestSchema = z.object({
  builderId: z.string().min(1, "Builder ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  sessionTypeId: z.string().optional(),
  timezone: z.string().optional(),
});

// Schema for validating booking status update
export const bookingStatusUpdateSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

// Schema for validating payment status update
export const paymentStatusUpdateSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED", "FAILED"]),
  stripeSessionId: z.string().optional(),
});

// Schema for validating Calendly scheduling link request
export const calendlySchedulingLinkRequestSchema = z.object({
  eventTypeId: z.string().min(1, "Event type ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  timezone: z.string().optional(),
  sessionTypeId: z.string().min(1, "Session type ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  returnUrl: z.string().min(1, "Return URL is required"),
});

// Schema for validating Calendly event types request
export const calendlyEventTypesRequestSchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
});

// Schema for validating Calendly webhook payload
export const calendlyWebhookSchema = z.object({
  event: z.enum(["invitee.created", "invitee.canceled"]),
  payload: z.object({
    event_type: z.object({
      uuid: z.string(),
    }),
    event: z.object({
      uuid: z.string(),
      start_time: z.string(),
      end_time: z.string(),
    }),
    invitee: z.object({
      uuid: z.string(),
      email: z.string(),
      name: z.string(),
    }),
  }),
});