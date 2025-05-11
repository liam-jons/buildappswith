/**
 * Booking State Machine Service
 * 
 * This module provides the main service for interacting with the booking state machine
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../logger';
import { 
  BookingContext, 
  BookingEventEnum, 
  BookingStateData, 
  BookingStateEnum, 
  TransitionPayload, 
  TransitionResult 
} from './types';
import { 
  executeTransition, 
  getAllowedTransitions, 
  getInitialState, 
  getInitialStateData, 
  isValidTransition 
} from './state-machine';
import { 
  deleteBookingState, 
  getBookingState, 
  getBookingsInState, 
  getTransitionHistory, 
  initializeBookingState, 
  updateBookingState 
} from './storage';

/**
 * Initialize a new booking
 */
export async function createBooking(
  initialData: Partial<BookingStateData> = {}
): Promise<BookingContext> {
  const bookingId = initialData.bookingId || uuidv4();
  const initialState = getInitialState();
  const initialStateData = {
    ...getInitialStateData(),
    ...initialData,
    bookingId
  };
  
  logger.info('Creating new booking', { bookingId });
  
  return initializeBookingState(bookingId, initialState, initialStateData);
}

/**
 * Transition a booking to a new state
 */
export async function transitionBooking(
  bookingId: string,
  event: BookingEventEnum,
  data: Partial<BookingStateData> = {}
): Promise<TransitionResult> {
  try {
    logger.info('Transitioning booking', { bookingId, event });
    
    // Get the current booking state
    const bookingContext = await getBookingState(bookingId);
    if (!bookingContext) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    
    // Check if the transition is valid
    if (!isValidTransition(bookingContext.state, event)) {
      throw new Error(`Invalid transition: ${event} from state ${bookingContext.state}`);
    }
    
    // Execute the transition
    const payload: TransitionPayload = { event, data };
    const transitionResult = await executeTransition(bookingContext, payload);
    
    // Update the booking state
    if (transitionResult.success) {
      await updateBookingState(bookingId, transitionResult);
    } else {
      // If transition failed, handle error case
      logger.error('Transition failed', {
        bookingId,
        error: transitionResult.error?.message,
        event
      });
      
      // Create error transition if needed
      if (event !== BookingEventEnum.ERROR_OCCURRED) {
        // If this wasn't already an error transition, create one
        const errorPayload: TransitionPayload = {
          event: BookingEventEnum.ERROR_OCCURRED,
          data: {
            error: {
              message: transitionResult.error?.message || 'Unknown error',
              timestamp: new Date().toISOString(),
              source: 'state-machine-service'
            }
          }
        };
        
        // Execute error transition
        const errorTransitionResult = await executeTransition(bookingContext, errorPayload);
        await updateBookingState(bookingId, errorTransitionResult);
      }
    }
    
    return transitionResult;
  } catch (error) {
    logger.error('Error transitioning booking', { 
      bookingId, 
      event,
      error: error instanceof Error ? error.message : String(error) 
    });
    
    // Return error result
    return {
      success: false,
      previousState: BookingStateEnum.ERROR,
      currentState: BookingStateEnum.ERROR,
      stateData: {
        bookingId,
        error: {
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          source: 'state-machine-service'
        }
      },
      timestamp: new Date().toISOString(),
      event,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Get the current booking state
 */
export async function getBooking(bookingId: string): Promise<BookingContext | null> {
  return getBookingState(bookingId);
}

/**
 * Get the transition history for a booking
 */
export async function getBookingTransitionHistory(bookingId: string): Promise<any[]> {
  return getTransitionHistory(bookingId);
}

/**
 * Get the allowed transitions for a booking
 */
export async function getBookingAllowedTransitions(bookingId: string): Promise<BookingEventEnum[]> {
  const bookingContext = await getBookingState(bookingId);
  if (!bookingContext) {
    return [];
  }
  
  return getAllowedTransitions(bookingContext.state);
}

/**
 * Recover a booking from an error state
 */
export async function recoverBooking(
  bookingId: string,
  recoveryState: BookingStateEnum,
  recoveryData: Partial<BookingStateData> = {}
): Promise<TransitionResult> {
  try {
    logger.info('Recovering booking', { bookingId, recoveryState });
    
    // Get the current booking state
    const bookingContext = await getBookingState(bookingId);
    if (!bookingContext) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    
    // Check if the booking is in an error state
    if (bookingContext.state !== BookingStateEnum.ERROR) {
      throw new Error(`Booking is not in error state: ${bookingId}`);
    }
    
    // Execute the recovery transition
    const payload: TransitionPayload = { 
      event: BookingEventEnum.RECOVER,
      data: {
        ...recoveryData,
        error: undefined // Clear the error
      }
    };
    
    const transitionResult = await executeTransition(bookingContext, payload);
    
    // Force the state to the recovery state
    const forcedResult: TransitionResult = {
      ...transitionResult,
      currentState: recoveryState
    };
    
    // Update the booking state
    await updateBookingState(bookingId, forcedResult);
    
    return forcedResult;
  } catch (error) {
    logger.error('Error recovering booking', { 
      bookingId, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Handle a Calendly webhook event
 */
export async function handleCalendlyWebhook(
  eventType: string,
  payload: any
): Promise<TransitionResult | null> {
  try {
    logger.info('Handling Calendly webhook', { eventType });
    
    // Extract the booking ID from the payload (implementation depends on your webhook structure)
    const bookingId = extractBookingIdFromCalendlyPayload(eventType, payload);
    if (!bookingId) {
      logger.warn('No booking ID found in Calendly webhook', { eventType, payload });
      return null;
    }
    
    // Get the current booking state
    const bookingContext = await getBookingState(bookingId);
    if (!bookingContext) {
      logger.warn('Booking not found for Calendly webhook', { bookingId, eventType });
      return null;
    }
    
    // Map the Calendly event type to a booking event
    const bookingEvent = mapCalendlyEventToBookingEvent(eventType, payload);
    if (!bookingEvent) {
      logger.warn('Unable to map Calendly event to booking event', { eventType });
      return null;
    }
    
    // Extract relevant data from the payload
    const stateData = extractDataFromCalendlyPayload(eventType, payload);
    
    // Transition the booking
    return transitionBooking(bookingId, bookingEvent, stateData);
  } catch (error) {
    logger.error('Error handling Calendly webhook', { 
      eventType, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Handle a Stripe webhook event
 */
export async function handleStripeWebhook(
  eventType: string,
  payload: any
): Promise<TransitionResult | null> {
  try {
    logger.info('Handling Stripe webhook', { eventType });
    
    // Extract the booking ID from the payload (implementation depends on your webhook structure)
    const bookingId = extractBookingIdFromStripePayload(eventType, payload);
    if (!bookingId) {
      logger.warn('No booking ID found in Stripe webhook', { eventType });
      return null;
    }
    
    // Get the current booking state
    const bookingContext = await getBookingState(bookingId);
    if (!bookingContext) {
      logger.warn('Booking not found for Stripe webhook', { bookingId, eventType });
      return null;
    }
    
    // Map the Stripe event type to a booking event
    const bookingEvent = mapStripeEventToBookingEvent(eventType, payload);
    if (!bookingEvent) {
      logger.warn('Unable to map Stripe event to booking event', { eventType });
      return null;
    }
    
    // Extract relevant data from the payload
    const stateData = extractDataFromStripePayload(eventType, payload);
    
    // Transition the booking
    return transitionBooking(bookingId, bookingEvent, stateData);
  } catch (error) {
    logger.error('Error handling Stripe webhook', { 
      eventType, 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Extract booking ID from Calendly payload
 */
function extractBookingIdFromCalendlyPayload(eventType: string, payload: any): string | null {
  try {
    // Implementation depends on your webhook structure
    // For example:
    return payload.payload?.tracking?.utm_content || null;
  } catch (error) {
    logger.error('Error extracting booking ID from Calendly payload', { 
      eventType, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Extract booking ID from Stripe payload
 */
function extractBookingIdFromStripePayload(eventType: string, payload: any): string | null {
  try {
    // Implementation depends on your webhook structure
    // For example:
    return payload.data?.object?.metadata?.bookingId || null;
  } catch (error) {
    logger.error('Error extracting booking ID from Stripe payload', { 
      eventType, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Map Calendly event type to booking event
 */
function mapCalendlyEventToBookingEvent(eventType: string, payload: any): BookingEventEnum | null {
  switch (eventType) {
    case 'invitee.created':
      return BookingEventEnum.CALENDLY_WEBHOOK_RECEIVED;
    case 'invitee.canceled':
      return BookingEventEnum.REQUEST_CANCELLATION;
    default:
      logger.warn('Unknown Calendly event type', { eventType });
      return null;
  }
}

/**
 * Map Stripe event type to booking event
 */
function mapStripeEventToBookingEvent(eventType: string, payload: any): BookingEventEnum | null {
  switch (eventType) {
    case 'checkout.session.completed':
      return BookingEventEnum.PAYMENT_SUCCEEDED;
    case 'checkout.session.expired':
      return BookingEventEnum.PAYMENT_FAILED;
    case 'payment_intent.succeeded':
      return BookingEventEnum.PAYMENT_SUCCEEDED;
    case 'payment_intent.payment_failed':
      return BookingEventEnum.PAYMENT_FAILED;
    default:
      logger.warn('Unknown Stripe event type', { eventType });
      return null;
  }
}

/**
 * Extract data from Calendly payload
 */
function extractDataFromCalendlyPayload(eventType: string, payload: any): Partial<BookingStateData> {
  try {
    // Implementation depends on your webhook structure
    // For example:
    if (eventType === 'invitee.created') {
      return {
        calendlyEventId: payload.payload?.event?.uuid,
        calendlyEventUri: payload.payload?.event?.uri,
        calendlyInviteeUri: payload.payload?.invitee?.uri,
        startTime: payload.payload?.event?.start_time,
        endTime: payload.payload?.event?.end_time
      };
    } else if (eventType === 'invitee.canceled') {
      return {
        cancelReason: payload.payload?.cancellation?.reason,
        cancelledAt: payload.payload?.cancellation?.canceled_at,
        cancelledBy: payload.payload?.cancellation?.canceled_by
      };
    }
    
    return {};
  } catch (error) {
    logger.error('Error extracting data from Calendly payload', { 
      eventType, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return {};
  }
}

/**
 * Extract data from Stripe payload
 */
function extractDataFromStripePayload(eventType: string, payload: any): Partial<BookingStateData> {
  try {
    // Implementation depends on your webhook structure
    // For example:
    if (eventType === 'checkout.session.completed') {
      return {
        stripeSessionId: payload.data?.object?.id,
        stripePaymentIntentId: payload.data?.object?.payment_intent
      };
    } else if (eventType === 'payment_intent.succeeded') {
      return {
        stripePaymentIntentId: payload.data?.object?.id
      };
    } else if (eventType === 'payment_intent.payment_failed') {
      return {
        stripePaymentIntentId: payload.data?.object?.id,
        error: {
          code: payload.data?.object?.last_payment_error?.code,
          message: payload.data?.object?.last_payment_error?.message,
          timestamp: new Date().toISOString(),
          source: 'stripe'
        }
      };
    }
    
    return {};
  } catch (error) {
    logger.error('Error extracting data from Stripe payload', { 
      eventType, 
      error: error instanceof Error ? error.message : String(error) 
    });
    return {};
  }
}