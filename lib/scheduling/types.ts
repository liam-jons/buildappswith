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
 * Represents a specific day of the week.
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Time slot for a specific date availability
 */
export interface TimeSlot {
  id?: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  isBooked: boolean;
}

/**
 * Input for a time slot, where isBooked might be optional
 */
export interface TimeSlotInput {
  startTime: string; // ISO format or "HH:MM"
  endTime: string;   // ISO format or "HH:MM"
  isBooked?: boolean;
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
  requiresAuth?: boolean;
  eventTypeCategory?: 'free' | 'pathway' | 'specialized' | string;
  isRecurring?: boolean;
  timeZone?: string;
  effectiveDate?: string; // Format: "YYYY-MM-DD"
  expirationDate?: string; // Format: "YYYY-MM-DD"
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Booking
 */
export interface Booking {
  id: string;
  builderId: string;
  clientId: string | null;
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
  pathway?: string;
  customQuestionResponse?: any;
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
  calendlyEventId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
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
  dayOfWeek: DayOfWeek; // 0 = Sunday, 6 = Saturday
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  isRecurring: boolean;
  effectiveDate?: string; // Format: "YYYY-MM-DD"
  expirationDate?: string; // Format: "YYYY-MM-DD"
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
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Default availability rule structure for SchedulingSettings, representing a slot in a week.
 */
export interface WeeklySlot {
  dayOfWeek: DayOfWeek; 
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string;   // Format: "HH:MM" in 24-hour format
}

/**
 * Scheduling settings for a builder
 */
export interface SchedulingSettings {
  id: string;
  builderId: string;
  timezone?: string;
  bufferBefore?: number; // In minutes
  bufferAfter?: number;  // In minutes
  useCalendly?: boolean;
  calendlyUsername?: string;
  calendlyUserId?: string;
  defaultAvailability?: WeeklySlot[]; // Updated from DefaultAvailabilityRule[]
  createdAt?: string;
  updatedAt?: string;
}

// --- Input types for service functions --- 

/**
 * Input for creating an AvailabilityException
 */
export interface CreateAvailabilityExceptionInput {
  builderId: string;
  date: string; // Format: "YYYY-MM-DD"
  isAvailable: boolean;
  slots?: TimeSlotInput[];
  reason?: string;
}

/**
 * Input for updating an AvailabilityException
 */
export type UpdateAvailabilityExceptionInput = Partial<Omit<CreateAvailabilityExceptionInput, 'builderId' | 'date'>>;

/**
 * Input for creating an AvailabilityRule
 */
export interface CreateAvailabilityRuleInput {
  builderId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isRecurring?: boolean;
  effectiveDate?: string; // Format: "YYYY-MM-DD"
  expirationDate?: string; // Format: "YYYY-MM-DD"
}

/**
 * Input for updating an AvailabilityRule
 */
export type UpdateAvailabilityRuleInput = Partial<Omit<CreateAvailabilityRuleInput, 'builderId'>>;

/**
 * Input for updating SchedulingSettings
 */
export interface UpdateSchedulingSettingsInput {
  timezone?: string;
  bufferBefore?: number; // In minutes
  bufferAfter?: number;  // In minutes
  useCalendly?: boolean;
  calendlyUsername?: string;
  calendlyUserId?: string;
  defaultAvailability?: WeeklySlot[]; // Updated from DefaultAvailabilityRule[]
}
