/**
 * Data model for the scheduling system
 * Handles builder availability, session types, and bookings
 */

// Time slot represents a specific bookable time period
export interface TimeSlot {
  id: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  isBooked: boolean;
}

// AvailabilityRule defines recurring weekly availability
export interface AvailabilityRule {
  id: string;
  builderId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // 24-hour format "HH:MM"
  endTime: string; // 24-hour format "HH:MM"
  isRecurring: boolean;
}

// AvailabilityException handles days off or special availability
export interface AvailabilityException {
  id: string;
  builderId: string;
  date: string; // ISO format date
  isAvailable: boolean; // false = blocked day, true = special availability
  slots?: TimeSlot[]; // only if isAvailable is true
}

// SessionType defines the kinds of bookings a builder offers
export interface SessionType {
  id: string;
  builderId: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive: boolean;
  color?: string; // For visual distinction in the calendar
  maxParticipants?: number; // For group sessions
}

// Booking represents a scheduled session between builder and client
export interface Booking {
  id: string;
  sessionTypeId: string;
  builderId: string;
  clientId: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'failed';
  paymentId?: string; // Stripe payment ID
  checkoutSessionId?: string; // Stripe checkout session ID
  clientTimezone: string; // IANA timezone name
  builderTimezone: string; // IANA timezone name
  notes?: string;
  createdAt: string; // ISO format
  updatedAt: string; // ISO format
}

// BuilderSchedulingProfile contains builder's scheduling preferences
export interface BuilderSchedulingProfile {
  builderId: string;
  minimumNotice: number; // Minimum minutes before a session can be booked
  bufferBetweenSessions: number; // Minutes between consecutive sessions
  maximumAdvanceBooking: number; // Maximum days in advance a client can book
  availabilityRules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  sessionTypes: SessionType[];
  timezone: string; // IANA timezone name
  isAcceptingBookings: boolean;
}

// ClientSchedulingProfile contains client's scheduling preferences
export interface ClientSchedulingProfile {
  clientId: string;
  timezone: string; // IANA timezone name
  preferredSessionTypes: string[]; // Array of session type IDs
  bookings: Booking[];
}