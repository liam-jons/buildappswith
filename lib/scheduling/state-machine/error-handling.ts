/**
 * Error Handling and Recovery for Booking State Machine
 * 
 * This module provides error classification, recovery mechanisms,
 * and retry logic for the booking state machine.
 */

import { logger } from '../../logger';
import { 
  BookingContext, 
  BookingEventEnum, 
  BookingStateData, 
  BookingStateEnum, 
  TransitionResult 
} from './types';
import { generateStateToken, verifyStateToken } from './security';
import { getBookingState, updateBookingState } from './storage';
import { executeTransition } from './state-machine';

/**
 * Error categories for better handling
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  PAYMENT = 'PAYMENT',
  CALENDLY = 'CALENDLY',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Error with category
 */
export class CategorizedError extends Error {
  category: ErrorCategory;
  isRetryable: boolean;
  originalError?: Error;
  
  constructor(
    message: string, 
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    isRetryable: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = 'CategorizedError';
    this.category = category;
    this.isRetryable = isRetryable;
    this.originalError = originalError;
  }
}

/**
 * Classify an error into a specific category
 */
export function classifyError(error: Error | unknown): CategorizedError {
  if (error instanceof CategorizedError) {
    return error;
  }
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : String(error);
  
  // Check for validation errors
  if (
    errorMessage.toLowerCase().includes('validation') ||
    errorMessage.toLowerCase().includes('invalid') ||
    errorMessage.toLowerCase().includes('required')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.VALIDATION,
      false,
      error instanceof Error ? error : undefined
    );
  }
  
  // Check for authentication/authorization errors
  if (
    errorMessage.toLowerCase().includes('unauthorized') ||
    errorMessage.toLowerCase().includes('unauthenticated') ||
    errorMessage.toLowerCase().includes('permission') ||
    errorMessage.toLowerCase().includes('forbidden')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.AUTH,
      false,
      error instanceof Error ? error : undefined
    );
  }
  
  // Check for payment errors
  if (
    errorMessage.toLowerCase().includes('payment') ||
    errorMessage.toLowerCase().includes('stripe') ||
    errorMessage.toLowerCase().includes('card') ||
    errorMessage.toLowerCase().includes('charge')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.PAYMENT,
      true, // Most payment errors are retryable
      error instanceof Error ? error : undefined
    );
  }
  
  // Check for Calendly errors
  if (
    errorMessage.toLowerCase().includes('calendly') ||
    errorMessage.toLowerCase().includes('scheduling')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.CALENDLY,
      true, // Most Calendly errors are retryable
      error instanceof Error ? error : undefined
    );
  }
  
  // Check for database errors
  if (
    errorMessage.toLowerCase().includes('database') ||
    errorMessage.toLowerCase().includes('db') ||
    errorMessage.toLowerCase().includes('sql') ||
    errorMessage.toLowerCase().includes('query')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.DATABASE,
      true, // Database errors are often transient
      error instanceof Error ? error : undefined
    );
  }
  
  // Check for network errors
  if (
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('connection') ||
    errorMessage.toLowerCase().includes('offline') ||
    errorMessage.toLowerCase().includes('unreachable')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.NETWORK,
      true, // Network errors are often transient
      error instanceof Error ? error : undefined
    );
  }
  
  // Check for timeout errors
  if (
    errorMessage.toLowerCase().includes('timeout') ||
    errorMessage.toLowerCase().includes('timed out')
  ) {
    return new CategorizedError(
      errorMessage,
      ErrorCategory.TIMEOUT,
      true, // Timeout errors are often transient
      error instanceof Error ? error : undefined
    );
  }
  
  // Default to unknown
  return new CategorizedError(
    errorMessage,
    ErrorCategory.UNKNOWN,
    false, // Unknown errors are not retryable by default
    error instanceof Error ? error : undefined
  );
}

/**
 * Handle an error in the booking flow
 * 
 * Creates an error transition and returns a recovery token
 */
export async function handleBookingError(
  bookingId: string,
  error: Error | unknown,
  context?: {
    currentState?: BookingStateEnum;
    lastEventType?: BookingEventEnum;
  }
): Promise<{ 
  transitionResult: TransitionResult; 
  recoveryToken: string | null;
  recoveryUrl: string | null;
}> {
  try {
    const categorizedError = classifyError(error);
    
    logger.error('Handling booking error', {
      bookingId,
      errorMessage: categorizedError.message,
      errorCategory: categorizedError.category,
      isRetryable: categorizedError.isRetryable,
      currentState: context?.currentState,
      lastEventType: context?.lastEventType
    });
    
    // Get booking state if not provided
    let bookingContext: BookingContext | null = null;
    
    if (!context?.currentState) {
      bookingContext = await getBookingState(bookingId);
      
      if (!bookingContext) {
        logger.error('Unable to handle error, booking not found', { bookingId });
        
        // Create minimal transition result
        return {
          transitionResult: {
            success: false,
            previousState: BookingStateEnum.ERROR,
            currentState: BookingStateEnum.ERROR,
            stateData: {
              bookingId,
              error: {
                message: categorizedError.message,
                code: categorizedError.category,
                timestamp: new Date().toISOString(),
                source: 'error-handling'
              }
            },
            timestamp: new Date().toISOString(),
            error: categorizedError
          },
          recoveryToken: null,
          recoveryUrl: null
        };
      }
    } else {
      // Create booking context from provided data
      bookingContext = {
        bookingId,
        state: context.currentState,
        stateData: {
          bookingId,
          lastEventType: context.lastEventType
        }
      };
    }
    
    // Create error payload
    const errorPayload = {
      event: BookingEventEnum.ERROR_OCCURRED,
      data: {
        error: {
          message: categorizedError.message,
          code: categorizedError.category,
          timestamp: new Date().toISOString(),
          source: 'error-handling',
          isRetryable: categorizedError.isRetryable
        }
      }
    };
    
    // Execute error transition
    const transitionResult = await executeTransition(bookingContext, errorPayload);
    
    // Update booking state
    await updateBookingState(bookingId, transitionResult);
    
    // Generate recovery token and URL if error is retryable
    let recoveryToken = null;
    let recoveryUrl = null;
    
    if (categorizedError.isRetryable) {
      recoveryToken = generateStateToken(bookingId, bookingContext.state);
      
      // Create recovery URL
      // In a real implementation, this would use the actual app base URL
      const baseUrl = process.env.APP_URL || 'https://app.example.com';
      recoveryUrl = `${baseUrl}/booking/recovery?token=${encodeURIComponent(recoveryToken)}`;
    }
    
    return {
      transitionResult,
      recoveryToken,
      recoveryUrl
    };
    
  } catch (handlingError) {
    logger.error('Error in error handling system', { 
      bookingId, 
      error: handlingError instanceof Error ? handlingError.message : String(handlingError),
      originalError: error instanceof Error ? error.message : String(error)
    });
    
    // Return a fallback result
    return {
      transitionResult: {
        success: false,
        previousState: BookingStateEnum.ERROR,
        currentState: BookingStateEnum.ERROR,
        stateData: {
          bookingId,
          error: {
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            source: 'error-handling-system'
          }
        },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error : new Error(String(error))
      },
      recoveryToken: null,
      recoveryUrl: null
    };
  }
}

/**
 * Recover a booking from an error state using a recovery token
 */
export async function recoverBookingWithToken(
  token: string,
  targetState?: BookingStateEnum
): Promise<{ 
  success: boolean; 
  bookingId?: string; 
  transitionResult?: TransitionResult;
}> {
  try {
    // Verify the token
    const verification = verifyStateToken(token);
    
    if (!verification.isValid || !verification.bookingId) {
      logger.warn('Invalid or expired recovery token', { token });
      return { success: false };
    }
    
    const { bookingId, state: originalState } = verification;
    
    // Get current booking state
    const bookingContext = await getBookingState(bookingId);
    
    if (!bookingContext) {
      logger.error('Booking not found for recovery', { bookingId });
      return { success: false, bookingId };
    }
    
    // Only recover if the booking is in ERROR state
    if (bookingContext.state !== BookingStateEnum.ERROR) {
      logger.info('Booking is not in ERROR state, no recovery needed', { 
        bookingId, 
        currentState: bookingContext.state 
      });
      
      return { 
        success: true, 
        bookingId
      };
    }
    
    // Determine recovery state - either the specified target state,
    // the original state from the token, or IDLE as a fallback
    const recoveryState = targetState || 
      (originalState as BookingStateEnum) || 
      BookingStateEnum.IDLE;
    
    // Create recovery transition
    const recoveryPayload = {
      event: BookingEventEnum.RECOVER,
      data: {
        error: undefined // Clear the error
      }
    };
    
    // Execute recovery transition
    const initialTransition = await executeTransition(bookingContext, recoveryPayload);
    
    // Force the state to the recovery state if needed
    const transitionResult: TransitionResult = {
      ...initialTransition,
      currentState: recoveryState
    };
    
    // Update the booking state
    await updateBookingState(bookingId, transitionResult);
    
    logger.info('Successfully recovered booking', {
      bookingId,
      previousState: transitionResult.previousState,
      recoveryState
    });
    
    return {
      success: true,
      bookingId,
      transitionResult
    };
    
  } catch (error) {
    logger.error('Error recovering booking with token', { 
      error: error instanceof Error ? error.message : String(error),
      token
    });
    
    return { success: false };
  }
}

/**
 * Retry a failed booking operation
 * 
 * Implements exponential backoff for retries
 */
export async function retryBookingOperation<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    bookingId?: string;
    operationName?: string;
  }
): Promise<T> {
  // Default options
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    bookingId,
    operationName = 'booking operation'
  } = options || {};
  
  let attempt = 0;
  let delay = initialDelayMs;
  
  while (true) {
    try {
      attempt++;
      return await operation();
    } catch (error) {
      const categorizedError = classifyError(error);
      
      // Only retry if the error is retryable and we haven't exceeded max retries
      if (!categorizedError.isRetryable || attempt > maxRetries) {
        logger.error(`Failed ${operationName} after ${attempt} attempts`, {
          bookingId,
          error: categorizedError.message,
          category: categorizedError.category
        });
        
        throw error;
      }
      
      logger.warn(`Retrying ${operationName} (attempt ${attempt}/${maxRetries})`, {
        bookingId,
        error: categorizedError.message,
        category: categorizedError.category,
        nextRetryDelayMs: delay
      });
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffFactor, maxDelayMs);
    }
  }
}

/**
 * Create a recovery link for a booking
 */
export function createRecoveryLink(bookingId: string, state: BookingStateEnum): string {
  const token = generateStateToken(bookingId, state);
  const baseUrl = process.env.APP_URL || 'https://app.example.com';
  
  return `${baseUrl}/booking/recovery?token=${encodeURIComponent(token)}`;
}