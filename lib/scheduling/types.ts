/**
 * Scheduling types
 * Version: 1.0.0
 * 
 * TypeScript type definitions for scheduling
 */

/**
 * Booking status
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * Payment status
 */
export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

/**
 * Session type
 */
export interface SessionType {
  id: string;
  builderId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  color?: string;
  maxParticipants?: number;
  calendlyEventTypeId?: string;
  calendlyEventTypeUri?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Booking
 */
export interface Booking {
  id: string;
  builderId: string;
  clientId: string;
  sessionTypeId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount?: number;
  stripeSessionId?: string;
  clientTimezone?: string;
  builderTimezone?: string;
  calendlyEventId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Booking request
 */
export interface BookingRequest {
  sessionTypeId: string;
  builderId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  clientTimezone?: string;
}

/**
 * Integration type for different scheduling providers
 */
export enum SchedulingIntegrationType {
  NATIVE = 'NATIVE',
  CALENDLY = 'CALENDLY',
}

/**
 * Availability rule for weekly schedule
 */
export interface AvailabilityRule {
  id: string;
  builderId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  isRecurring: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Availability exception for specific dates
 */
export interface AvailabilityException {
  id: string;
  builderId: string;
  date: string; // Format: "YYYY-MM-DD"
  isAvailable: boolean;
  slots?: TimeSlot[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Time slot for a specific date availability
 */
export interface TimeSlot {
  id?: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  isBooked: boolean;
}
