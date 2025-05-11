/**
 * Booking State Machine Types
 * Version: 1.0.0
 * 
 * Type definitions for the booking state machine
 */

import { PaymentStatus as StripePaymentStatus } from '../../stripe/types';
import { BookingStatus, PaymentStatus } from '../types';

/**
 * All possible states in the booking state machine
 */
export enum BookingStateEnum {
  // Initial states
  IDLE = 'IDLE',
  SESSION_TYPE_SELECTED = 'SESSION_TYPE_SELECTED',
  
  // Calendly states
  CALENDLY_SCHEDULING_INITIATED = 'CALENDLY_SCHEDULING_INITIATED',
  CALENDLY_EVENT_SCHEDULED = 'CALENDLY_EVENT_SCHEDULED',
  
  // Payment states
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // Booking confirmation states
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  
  // Cancellation and rescheduling states
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  CANCELLATION_PROCESSING = 'CANCELLATION_PROCESSING',
  CANCELLATION_COMPLETED = 'CANCELLATION_COMPLETED',
  
  // Refund states
  REFUND_REQUIRED = 'REFUND_REQUIRED',
  REFUND_PROCESSING = 'REFUND_PROCESSING',
  REFUND_COMPLETED = 'REFUND_COMPLETED',
  
  // Error state
  ERROR = 'ERROR'
}

/**
 * All possible events that can trigger state transitions
 */
export enum BookingEventEnum {
  // User-initiated events
  SELECT_SESSION_TYPE = 'SELECT_SESSION_TYPE',
  INITIATE_CALENDLY_SCHEDULING = 'INITIATE_CALENDLY_SCHEDULING',
  SCHEDULE_EVENT = 'SCHEDULE_EVENT',
  INITIATE_PAYMENT = 'INITIATE_PAYMENT',
  REQUEST_CANCELLATION = 'REQUEST_CANCELLATION',
  
  // System-triggered events
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CALENDLY_WEBHOOK_RECEIVED = 'CALENDLY_WEBHOOK_RECEIVED',
  STRIPE_WEBHOOK_RECEIVED = 'STRIPE_WEBHOOK_RECEIVED',
  MARK_COMPLETED = 'MARK_COMPLETED',
  PROCESS_REFUND = 'PROCESS_REFUND',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  
  // Error events
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  RECOVER = 'RECOVER'
}

/**
 * State data structure that will be stored in the database
 */
export interface BookingStateData {
  // Core booking data
  bookingId?: string;
  builderId?: string;
  clientId?: string;
  sessionTypeId?: string;
  startTime?: string;
  endTime?: string;
  
  // Calendly specific data
  calendlyEventId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  
  // Stripe specific data
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  
  // Status tracking
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  
  // Cancellation and refund info
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  refundAmount?: number;
  stripeRefundId?: string;
  
  // Error tracking
  error?: {
    code?: string;
    message?: string;
    timestamp?: string;
    source?: string;
  };
  
  // Additional metadata
  timestamp?: string;
  recoveryToken?: string;
  lastEventType?: BookingEventEnum;
}

/**
 * State transition definition
 */
export interface StateTransition {
  from: BookingStateEnum;
  event: BookingEventEnum;
  to: BookingStateEnum;
  condition?: (stateData: BookingStateData) => boolean;
}

/**
 * State handler functions
 */
export interface StateHandlers {
  onEntry?: (stateData: BookingStateData) => Promise<BookingStateData>;
  onExit?: (stateData: BookingStateData) => Promise<BookingStateData>;
}

/**
 * State machine definition
 */
export interface BookingStateMachine {
  initialState: BookingStateEnum;
  states: {
    [key in BookingStateEnum]?: {
      transitions: {
        [event in BookingEventEnum]?: BookingStateEnum;
      };
      handlers?: StateHandlers;
    };
  };
}

/**
 * State transition result
 */
export interface TransitionResult {
  success: boolean;
  previousState: BookingStateEnum;
  currentState: BookingStateEnum;
  stateData: BookingStateData;
  timestamp: string;
  event?: BookingEventEnum;
  error?: Error;
}

/**
 * Booking context for state transitions
 */
export interface BookingContext {
  bookingId: string;
  state: BookingStateEnum;
  stateData: BookingStateData;
}

/**
 * Payload for state transition
 */
export interface TransitionPayload {
  event: BookingEventEnum;
  data?: Partial<BookingStateData>;
}

/**
 * Client-side booking state
 */
export interface ClientBookingState {
  step: BookingStateEnum;
  loading: boolean;
  error?: {
    message: string;
    code?: string;
  };
  bookingId?: string;
  builderId?: string;
  sessionTypeId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus?: PaymentStatus | StripePaymentStatus;
  bookingStatus?: BookingStatus;
  startTime?: string;
  endTime?: string;
  recoveryUrl?: string;
}

/**
 * Mapping between booking state and booking/payment status
 */
export const stateToStatusMapping: Record<BookingStateEnum, { 
  bookingStatus: BookingStatus,
  paymentStatus: PaymentStatus 
}> = {
  [BookingStateEnum.IDLE]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.SESSION_TYPE_SELECTED]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.CALENDLY_SCHEDULING_INITIATED]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.CALENDLY_EVENT_SCHEDULED]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.PAYMENT_REQUIRED]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.PAYMENT_PENDING]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.PAYMENT_PROCESSING]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  },
  [BookingStateEnum.PAYMENT_SUCCEEDED]: {
    bookingStatus: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.PAYMENT_FAILED]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.FAILED
  },
  [BookingStateEnum.BOOKING_CONFIRMED]: {
    bookingStatus: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.BOOKING_COMPLETED]: {
    bookingStatus: BookingStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.CANCELLATION_REQUESTED]: {
    bookingStatus: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.CANCELLATION_PROCESSING]: {
    bookingStatus: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.CANCELLATION_COMPLETED]: {
    bookingStatus: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED
  },
  [BookingStateEnum.REFUND_REQUIRED]: {
    bookingStatus: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.REFUND_PROCESSING]: {
    bookingStatus: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.PAID
  },
  [BookingStateEnum.REFUND_COMPLETED]: {
    bookingStatus: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED
  },
  [BookingStateEnum.ERROR]: {
    bookingStatus: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID
  }
};