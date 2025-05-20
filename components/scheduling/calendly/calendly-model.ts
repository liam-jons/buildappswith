/**
 * Calendly Model
 * Version: 1.0.0
 * 
 * Type definitions for Calendly integration components
 * This serves as the shared type definitions between UI components
 */

// Import backend types we need to reference
import { BookingStatus, PaymentStatus, SessionType } from '@/lib/scheduling/types';
import type { 
  CalendlyEventType as BackendCalendlyEventType,
  MappedCalendlyEventType,
  MappedCalendlyBooking
} from '@/lib/scheduling/calendly';

/**
 * Re-export the backend types for UI components
 */
export type { MappedCalendlyEventType, MappedCalendlyBooking };

/**
 * Frontend version of Calendly Event Type
 * Provides simpler access to fields needed by UI components
 */
export interface CalendlyEventType extends Omit<MappedCalendlyEventType, 'price'> {
  price: number; // Ensure price is a number instead of Decimal
}

/**
 * Event object returned by Calendly widget
 */
export interface CalendlyEvent {
  uri: string;
  invitee: {
    uri: string;
    email: string;
    name: string;
  };
  start_time: string;
  end_time: string;
  event_type_uuid: string;
  questions_and_answers?: CalendlyQuestionAnswer[];
}

/**
 * Question and answer data from Calendly events
 */
export interface CalendlyQuestionAnswer {
  question: string;
  answer: string;
  position: number;
}

/**
 * Calendly API response for getCalendlyEventTypes
 */
export interface CalendlyEventTypesResponse {
  success: boolean;
  eventTypes?: CalendlyEventType[];
  error?: string;
}

/**
 * Calendly API response for getting available time slots
 */
export interface CalendlyAvailableTimesResponse {
  success: boolean;
  timeSlots?: Array<{
    startTime: Date;
    endTime: Date;
    schedulingUrl: string;
    inviteesRemaining: number;
  }>;
  error?: string;
}

/**
 * Calendar date range for fetching available time slots
 */
export interface CalendlyDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Time slot object for use in UI components
 */
export interface CalendlyTimeSlot {
  startTime: Date;
  endTime: Date;
  schedulingUrl: string;
  inviteesRemaining?: number;
  isBooked?: boolean;
}

/**
 * Calendly Window global interface for TypeScript
 */
export interface CalendlyWindowType {
  initInlineWidget: (options: {
    url: string;
    parentElement: HTMLElement;
    prefill?: Record<string, string>;
    utm?: Record<string, string>;
    hideEventTypeDetails?: boolean;
    hideLandingPageDetails?: boolean;
    hideGdprBanner?: boolean;
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    height?: string;
  }) => void;
}

// Augment Window interface to include Calendly global
declare global {
  interface Window {
    Calendly?: CalendlyWindowType;
  }
}

/**
 * Booking data returned from Calendly integrations
 */
export interface CalendlyBooking {
  id?: string;
  builderId: string;
  clientId: string;
  sessionTypeId: string;
  calendlyEventId: string;
  calendlyEventUri: string;
  calendlyInviteeUri: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: BookingStatus | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: PaymentStatus | 'UNPAID' | 'PAID' | 'REFUNDED' | 'FAILED';
  amount?: number;
  stripeSessionId?: string;
  clientTimezone?: string;
  builderTimezone?: string;
}
