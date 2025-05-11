/**
 * Booking State Machine Implementation
 * 
 * This module implements the core state machine logic for the booking flow
 */

import { logger } from '../../logger';
import { 
  BookingContext, 
  BookingEventEnum, 
  BookingStateData, 
  BookingStateEnum,
  BookingStateMachine,
  StateTransition, 
  TransitionPayload, 
  TransitionResult, 
  stateToStatusMapping
} from './types';

// Define the state machine transitions
const stateMachineDefinition: BookingStateMachine = {
  initialState: BookingStateEnum.IDLE,
  states: {
    [BookingStateEnum.IDLE]: {
      transitions: {
        [BookingEventEnum.SELECT_SESSION_TYPE]: BookingStateEnum.SESSION_TYPE_SELECTED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Entering IDLE state', { bookingId: stateData.bookingId });
          return stateData;
        }
      }
    },
    [BookingStateEnum.SESSION_TYPE_SELECTED]: {
      transitions: {
        [BookingEventEnum.INITIATE_CALENDLY_SCHEDULING]: BookingStateEnum.CALENDLY_SCHEDULING_INITIATED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Session type selected', { 
            bookingId: stateData.bookingId, 
            sessionTypeId: stateData.sessionTypeId 
          });
          return stateData;
        }
      }
    },
    [BookingStateEnum.CALENDLY_SCHEDULING_INITIATED]: {
      transitions: {
        [BookingEventEnum.SCHEDULE_EVENT]: BookingStateEnum.CALENDLY_EVENT_SCHEDULED,
        [BookingEventEnum.CALENDLY_WEBHOOK_RECEIVED]: BookingStateEnum.CALENDLY_EVENT_SCHEDULED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Calendly scheduling initiated', { 
            bookingId: stateData.bookingId
          });
          return stateData;
        }
      }
    },
    [BookingStateEnum.CALENDLY_EVENT_SCHEDULED]: {
      transitions: {
        [BookingEventEnum.INITIATE_PAYMENT]: BookingStateEnum.PAYMENT_REQUIRED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Calendly event scheduled', { 
            bookingId: stateData.bookingId,
            calendlyEventId: stateData.calendlyEventId
          });
          // Update the booking status
          return {
            ...stateData,
            bookingStatus: stateToStatusMapping[BookingStateEnum.CALENDLY_EVENT_SCHEDULED].bookingStatus,
            paymentStatus: stateToStatusMapping[BookingStateEnum.CALENDLY_EVENT_SCHEDULED].paymentStatus,
          };
        }
      }
    },
    [BookingStateEnum.PAYMENT_REQUIRED]: {
      transitions: {
        [BookingEventEnum.INITIATE_PAYMENT]: BookingStateEnum.PAYMENT_PENDING,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Payment required', { 
            bookingId: stateData.bookingId
          });
          return stateData;
        }
      }
    },
    [BookingStateEnum.PAYMENT_PENDING]: {
      transitions: {
        [BookingEventEnum.STRIPE_WEBHOOK_RECEIVED]: BookingStateEnum.PAYMENT_PROCESSING,
        [BookingEventEnum.PAYMENT_SUCCEEDED]: BookingStateEnum.PAYMENT_SUCCEEDED,
        [BookingEventEnum.PAYMENT_FAILED]: BookingStateEnum.PAYMENT_FAILED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Payment pending', { 
            bookingId: stateData.bookingId,
            stripeSessionId: stateData.stripeSessionId
          });
          return stateData;
        }
      }
    },
    [BookingStateEnum.PAYMENT_PROCESSING]: {
      transitions: {
        [BookingEventEnum.PAYMENT_SUCCEEDED]: BookingStateEnum.PAYMENT_SUCCEEDED,
        [BookingEventEnum.PAYMENT_FAILED]: BookingStateEnum.PAYMENT_FAILED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Payment processing', { 
            bookingId: stateData.bookingId,
            stripeSessionId: stateData.stripeSessionId
          });
          return stateData;
        }
      }
    },
    [BookingStateEnum.PAYMENT_SUCCEEDED]: {
      transitions: {
        [BookingEventEnum.STRIPE_WEBHOOK_RECEIVED]: BookingStateEnum.BOOKING_CONFIRMED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Payment succeeded', { 
            bookingId: stateData.bookingId,
            stripeSessionId: stateData.stripeSessionId,
            stripePaymentIntentId: stateData.stripePaymentIntentId
          });
          
          // Update the booking and payment status
          return {
            ...stateData,
            bookingStatus: stateToStatusMapping[BookingStateEnum.PAYMENT_SUCCEEDED].bookingStatus,
            paymentStatus: stateToStatusMapping[BookingStateEnum.PAYMENT_SUCCEEDED].paymentStatus,
          };
        }
      }
    },
    [BookingStateEnum.PAYMENT_FAILED]: {
      transitions: {
        [BookingEventEnum.INITIATE_PAYMENT]: BookingStateEnum.PAYMENT_PENDING,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Payment failed', { 
            bookingId: stateData.bookingId,
            stripeSessionId: stateData.stripeSessionId,
            error: stateData.error
          });
          
          // Update the payment status
          return {
            ...stateData,
            paymentStatus: stateToStatusMapping[BookingStateEnum.PAYMENT_FAILED].paymentStatus,
          };
        }
      }
    },
    [BookingStateEnum.BOOKING_CONFIRMED]: {
      transitions: {
        [BookingEventEnum.MARK_COMPLETED]: BookingStateEnum.BOOKING_COMPLETED,
        [BookingEventEnum.REQUEST_CANCELLATION]: BookingStateEnum.CANCELLATION_REQUESTED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Booking confirmed', { 
            bookingId: stateData.bookingId
          });
          
          // Update the booking status
          return {
            ...stateData,
            bookingStatus: stateToStatusMapping[BookingStateEnum.BOOKING_CONFIRMED].bookingStatus,
          };
        }
      }
    },
    [BookingStateEnum.BOOKING_COMPLETED]: {
      transitions: {
        // Terminal state, no transitions out
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Booking completed', { 
            bookingId: stateData.bookingId
          });
          
          // Update the booking status
          return {
            ...stateData,
            bookingStatus: stateToStatusMapping[BookingStateEnum.BOOKING_COMPLETED].bookingStatus,
          };
        }
      }
    },
    [BookingStateEnum.CANCELLATION_REQUESTED]: {
      transitions: {
        [BookingEventEnum.PROCESS_REFUND]: BookingStateEnum.REFUND_REQUIRED,
        [BookingEventEnum.CALENDLY_WEBHOOK_RECEIVED]: BookingStateEnum.CANCELLATION_PROCESSING,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Cancellation requested', { 
            bookingId: stateData.bookingId,
            cancelReason: stateData.cancelReason,
            cancelledBy: stateData.cancelledBy
          });
          
          // Update the state data with cancellation timestamp
          return {
            ...stateData,
            cancelledAt: stateData.cancelledAt || new Date().toISOString(),
            bookingStatus: stateToStatusMapping[BookingStateEnum.CANCELLATION_REQUESTED].bookingStatus,
          };
        }
      }
    },
    [BookingStateEnum.CANCELLATION_PROCESSING]: {
      transitions: {
        [BookingEventEnum.PROCESS_REFUND]: BookingStateEnum.REFUND_REQUIRED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Cancellation processing', { 
            bookingId: stateData.bookingId,
            calendlyEventId: stateData.calendlyEventId
          });
          
          return stateData;
        }
      }
    },
    [BookingStateEnum.CANCELLATION_COMPLETED]: {
      transitions: {
        // Terminal state, no transitions out
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Cancellation completed', { 
            bookingId: stateData.bookingId
          });
          
          return stateData;
        }
      }
    },
    [BookingStateEnum.REFUND_REQUIRED]: {
      transitions: {
        [BookingEventEnum.PROCESS_REFUND]: BookingStateEnum.REFUND_PROCESSING,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Refund required', { 
            bookingId: stateData.bookingId,
            stripePaymentIntentId: stateData.stripePaymentIntentId
          });
          
          return stateData;
        }
      }
    },
    [BookingStateEnum.REFUND_PROCESSING]: {
      transitions: {
        [BookingEventEnum.REFUND_PROCESSED]: BookingStateEnum.REFUND_COMPLETED,
        [BookingEventEnum.ERROR_OCCURRED]: BookingStateEnum.ERROR,
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Refund processing', { 
            bookingId: stateData.bookingId,
            stripePaymentIntentId: stateData.stripePaymentIntentId
          });
          
          return stateData;
        }
      }
    },
    [BookingStateEnum.REFUND_COMPLETED]: {
      transitions: {
        // Terminal state, no transitions out
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.info('Refund completed', { 
            bookingId: stateData.bookingId,
            stripeRefundId: stateData.stripeRefundId,
            refundAmount: stateData.refundAmount
          });
          
          // Update the payment status
          return {
            ...stateData,
            paymentStatus: stateToStatusMapping[BookingStateEnum.REFUND_COMPLETED].paymentStatus,
          };
        }
      }
    },
    [BookingStateEnum.ERROR]: {
      transitions: {
        [BookingEventEnum.RECOVER]: BookingStateEnum.IDLE, // Default recovery to idle
      },
      handlers: {
        onEntry: async (stateData) => {
          logger.error('Error occurred in booking state machine', { 
            bookingId: stateData.bookingId,
            error: stateData.error,
            lastState: stateData.lastEventType
          });
          
          // Generate a recovery token
          return {
            ...stateData,
            recoveryToken: generateRecoveryToken(stateData),
          };
        }
      }
    },
  },
};

/**
 * Generate a recovery token for error recovery
 */
function generateRecoveryToken(stateData: BookingStateData): string {
  // In a real implementation, this would generate a secure token
  // that could be used to recover the booking session
  return `recovery-${stateData.bookingId}-${Date.now()}`;
}

/**
 * Execute the state transition
 */
export async function executeTransition(
  context: BookingContext,
  payload: TransitionPayload
): Promise<TransitionResult> {
  try {
    const { state: currentState, stateData: currentStateData, bookingId } = context;
    const { event, data: newData = {} } = payload;
    
    logger.debug('Executing state transition', { 
      bookingId, 
      currentState, 
      event,
      data: newData 
    });
    
    // Find the current state definition
    const stateDefinition = stateMachineDefinition.states[currentState];
    if (!stateDefinition) {
      throw new Error(`Invalid state: ${currentState}`);
    }
    
    // Check if the transition is allowed
    const nextState = stateDefinition.transitions[event];
    if (!nextState) {
      throw new Error(`Invalid transition: ${event} from state ${currentState}`);
    }
    
    // Merge the new data with the current state data
    const mergedStateData: BookingStateData = {
      ...currentStateData,
      ...newData,
      lastEventType: event,
      timestamp: new Date().toISOString()
    };
    
    // Execute onExit handler for the current state if it exists
    let updatedStateData = mergedStateData;
    if (stateDefinition.handlers?.onExit) {
      updatedStateData = await stateDefinition.handlers.onExit(mergedStateData);
    }
    
    // Find the next state definition
    const nextStateDefinition = stateMachineDefinition.states[nextState];
    if (!nextStateDefinition) {
      throw new Error(`Invalid next state: ${nextState}`);
    }
    
    // Execute onEntry handler for the next state if it exists
    if (nextStateDefinition.handlers?.onEntry) {
      updatedStateData = await nextStateDefinition.handlers.onEntry(updatedStateData);
    }
    
    // Return the transition result
    return {
      success: true,
      previousState: currentState,
      currentState: nextState,
      stateData: updatedStateData,
      timestamp: new Date().toISOString(),
      event
    };
  } catch (error) {
    logger.error('Error executing state transition', { 
      bookingId: context.bookingId, 
      error: error instanceof Error ? error.message : String(error),
      currentState: context.state
    });
    
    // Return error result
    return {
      success: false,
      previousState: context.state,
      currentState: context.state,
      stateData: {
        ...context.stateData,
        error: {
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          source: 'state-machine'
        }
      },
      timestamp: new Date().toISOString(),
      event: payload.event,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}

/**
 * Get the initial state data
 */
export function getInitialStateData(): BookingStateData {
  return {
    timestamp: new Date().toISOString()
  };
}

/**
 * Get the initial state
 */
export function getInitialState(): BookingStateEnum {
  return stateMachineDefinition.initialState;
}

/**
 * Get the allowed transitions for a given state
 */
export function getAllowedTransitions(state: BookingStateEnum): BookingEventEnum[] {
  const stateDefinition = stateMachineDefinition.states[state];
  if (!stateDefinition) {
    return [];
  }
  
  return Object.keys(stateDefinition.transitions) as BookingEventEnum[];
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(
  currentState: BookingStateEnum, 
  event: BookingEventEnum
): boolean {
  const stateDefinition = stateMachineDefinition.states[currentState];
  if (!stateDefinition) {
    return false;
  }
  
  return !!stateDefinition.transitions[event];
}

/**
 * Get the next state for a given state and event
 */
export function getNextState(
  currentState: BookingStateEnum,
  event: BookingEventEnum
): BookingStateEnum | null {
  const stateDefinition = stateMachineDefinition.states[currentState];
  if (!stateDefinition) {
    return null;
  }
  
  return stateDefinition.transitions[event] || null;
}

/**
 * Export the state machine definition
 */
export const bookingStateMachine = stateMachineDefinition;