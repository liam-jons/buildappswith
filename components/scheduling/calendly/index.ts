/**
 * Calendly UI component exports
 * Version: 2.0.0
 * 
 * Exports all Calendly UI components and shared types
 * Updated to use standardized domain-based export patterns
 */

// Component exports
export { default as CalendlyEmbed } from './calendly-embed';
export { default as CalendlyEmbedNative } from './calendly-embed-native';
export { default as CalendlyEmbedSimple } from './calendly-embed-simple';
export { default as CalendlyEmbedOptimized } from './calendly-embed-optimized';
export { default as BookingConfirmation } from './booking-confirmation';
export { default as CalendlySessionTypeList } from './calendly-session-type-list';
export { CalendlyCalendar } from './calendly-calendar';

// Type exports from model
export type { 
  CalendlyEventType,
  CalendlyEvent,
  CalendlyInvitee,
  CalendlyWebhookEvent,
  CalendlyAvailableTimes,
  CalendlySchedulingUrl,
  CalendlyBookingDetails,
  CalendlySessionType 
} from './calendly-model';