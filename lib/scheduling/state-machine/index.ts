/**
 * State Machine Index
 *
 * This file exports all state machine functionality
 */

// Export state machine types
export * from './types';

// Export state machine core
export {
  bookingStateMachine,
  executeTransition,
  getAllowedTransitions,
  getInitialState,
  getInitialStateData,
  getNextState,
  isValidTransition
} from './state-machine';

// Export state machine storage
export {
  deleteBookingState,
  getBookingState,
  getBookingsInState,
  getTransitionHistory,
  initializeBookingState,
  updateBookingState
} from './storage';

// Export state machine service
export {
  createBooking,
  getBooking,
  getBookingAllowedTransitions,
  getBookingTransitionHistory,
  handleCalendlyWebhook,
  handleStripeWebhook,
  recoverBooking,
  transitionBooking
} from './service';

// Export security features
export {
  encryptSensitiveData,
  decryptSensitiveData,
  sanitizeForLogging,
  generateStateToken,
  verifyStateToken
} from './security';

// Export error handling features
export {
  ErrorCategory,
  CategorizedError,
  classifyError,
  handleBookingError,
  recoverBookingWithToken,
  retryBookingOperation,
  createRecoveryLink
} from './error-handling';