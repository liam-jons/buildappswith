'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { 
  BookingStateEnum, 
  BookingEventEnum,
  BookingStateData,
  ClientBookingState
} from '../scheduling/state-machine/types';
import { SessionType } from '../scheduling/types';

// Initial state for the booking flow
const initialBookingState: ClientBookingState = {
  step: BookingStateEnum.IDLE,
  loading: false,
  error: undefined,
  bookingId: undefined,
  builderId: undefined,
  sessionTypeId: undefined,
  calendlyEventUri: undefined,
  calendlyInviteeUri: undefined,
  stripeSessionId: undefined,
  stripePaymentIntentId: undefined,
  paymentStatus: undefined,
  bookingStatus: undefined,
  startTime: undefined,
  endTime: undefined,
  recoveryUrl: undefined
};

// Action types for the reducer
type BookingAction = 
  | { type: 'SELECT_SESSION_TYPE'; payload: { sessionType: SessionType; builderId: string; } }
  | { type: 'INITIATE_CALENDLY'; payload?: { bookingId?: string; } }
  | { type: 'CALENDLY_EVENT_SCHEDULED'; payload: { 
      calendlyEventUri: string; 
      calendlyInviteeUri: string;
      startTime?: string;
      endTime?: string;
    }
  }
  | { type: 'INITIATE_PAYMENT'; payload?: { stripeSessionId?: string; } }
  | { type: 'PAYMENT_PENDING'; payload: { stripeSessionId: string; } }
  | { type: 'PAYMENT_PROCESSING'; payload?: { stripePaymentIntentId?: string; } }
  | { type: 'PAYMENT_SUCCEEDED'; payload?: { stripePaymentIntentId?: string; } }
  | { type: 'PAYMENT_FAILED'; payload?: { error?: { message: string; code?: string; } } }
  | { type: 'BOOKING_CONFIRMED'; payload?: { startTime?: string; endTime?: string; } }
  | { type: 'REQUEST_CANCELLATION'; payload?: { reason?: string; } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: { message: string; code?: string; } }
  | { type: 'RESET_ERROR' }
  | { type: 'INIT_FROM_URL_PARAMS'; payload: Partial<ClientBookingState> }
  | { type: 'RECOVERY_INITIATED'; payload: { recoveryUrl: string; } }
  | { type: 'RESET' };

// Reducer function for booking flow
function bookingReducer(state: ClientBookingState, action: BookingAction): ClientBookingState {
  switch (action.type) {
    case 'SELECT_SESSION_TYPE':
      return {
        ...state,
        step: BookingStateEnum.SESSION_TYPE_SELECTED,
        builderId: action.payload.builderId,
        sessionTypeId: action.payload.sessionType.id,
        bookingId: state.bookingId || uuidv4(), // Generate a new ID if not present
        loading: false,
        error: undefined
      };
    
    case 'INITIATE_CALENDLY':
      return {
        ...state,
        step: BookingStateEnum.CALENDLY_SCHEDULING_INITIATED,
        bookingId: action.payload?.bookingId || state.bookingId,
        loading: false,
        error: undefined
      };
    
    case 'CALENDLY_EVENT_SCHEDULED':
      return {
        ...state,
        step: BookingStateEnum.CALENDLY_EVENT_SCHEDULED,
        calendlyEventUri: action.payload.calendlyEventUri,
        calendlyInviteeUri: action.payload.calendlyInviteeUri,
        startTime: action.payload.startTime || state.startTime,
        endTime: action.payload.endTime || state.endTime,
        loading: false,
        error: undefined
      };
    
    case 'INITIATE_PAYMENT':
      return {
        ...state,
        step: BookingStateEnum.PAYMENT_REQUIRED,
        stripeSessionId: action.payload?.stripeSessionId || state.stripeSessionId,
        loading: false,
        error: undefined
      };
    
    case 'PAYMENT_PENDING':
      return {
        ...state,
        step: BookingStateEnum.PAYMENT_PENDING,
        stripeSessionId: action.payload.stripeSessionId,
        loading: true,
        error: undefined
      };
    
    case 'PAYMENT_PROCESSING':
      return {
        ...state,
        step: BookingStateEnum.PAYMENT_PROCESSING,
        stripePaymentIntentId: action.payload?.stripePaymentIntentId || state.stripePaymentIntentId,
        loading: true,
        error: undefined
      };
    
    case 'PAYMENT_SUCCEEDED':
      return {
        ...state,
        step: BookingStateEnum.PAYMENT_SUCCEEDED,
        stripePaymentIntentId: action.payload?.stripePaymentIntentId || state.stripePaymentIntentId,
        loading: false,
        error: undefined
      };
    
    case 'PAYMENT_FAILED':
      return {
        ...state,
        step: BookingStateEnum.PAYMENT_FAILED,
        loading: false,
        error: action.payload?.error || { message: 'Payment failed' }
      };
    
    case 'BOOKING_CONFIRMED':
      return {
        ...state,
        step: BookingStateEnum.BOOKING_CONFIRMED,
        startTime: action.payload?.startTime || state.startTime,
        endTime: action.payload?.endTime || state.endTime,
        loading: false,
        error: undefined
      };
    
    case 'REQUEST_CANCELLATION':
      return {
        ...state,
        step: BookingStateEnum.CANCELLATION_REQUESTED,
        loading: true,
        error: undefined
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'RESET_ERROR':
      return {
        ...state,
        error: undefined
      };
    
    case 'INIT_FROM_URL_PARAMS':
      return {
        ...state,
        ...action.payload
      };
    
    case 'RECOVERY_INITIATED':
      return {
        ...state,
        recoveryUrl: action.payload.recoveryUrl
      };
    
    case 'RESET':
      return initialBookingState;
    
    default:
      return state;
  }
}

// Create context type
interface BookingFlowContextType {
  state: ClientBookingState;
  dispatch: React.Dispatch<BookingAction>;
  // Helper functions
  selectSessionType: (sessionType: SessionType, builderId: string) => void;
  initiateCalendly: (bookingId?: string) => void;
  handleCalendlyScheduled: (calendlyEventUri: string, calendlyInviteeUri: string, startTime?: string, endTime?: string) => void;
  initiatePayment: (stripeSessionId?: string) => void;
  handlePaymentSuccess: (stripePaymentIntentId?: string) => void;
  handlePaymentFailure: (error?: { message: string; code?: string }) => void;
  confirmBooking: (startTime?: string, endTime?: string) => void;
  requestCancellation: (reason?: string) => void;
  resetFlow: () => void;
}

// Create context with default values
const BookingFlowContext = createContext<BookingFlowContextType>({
  state: initialBookingState,
  dispatch: () => null,
  selectSessionType: () => {},
  initiateCalendly: () => {},
  handleCalendlyScheduled: () => {},
  initiatePayment: () => {},
  handlePaymentSuccess: () => {},
  handlePaymentFailure: () => {},
  confirmBooking: () => {},
  requestCancellation: () => {},
  resetFlow: () => {}
});

// Provider props
interface BookingFlowProviderProps {
  children: ReactNode;
  initialState?: Partial<ClientBookingState>;
}

// Provider component
export function BookingFlowProvider({ 
  children, 
  initialState = {} 
}: BookingFlowProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize with combined initial state
  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialBookingState,
    ...initialState
  });
  
  // Handle URL parameters for state restoration
  useEffect(() => {
    if (!searchParams) return;
    
    const bookingId = searchParams.get('bookingId');
    const step = searchParams.get('step') as BookingStateEnum | null;
    const sessionTypeId = searchParams.get('sessionTypeId');
    const builderId = searchParams.get('builderId');
    const stripeSessionId = searchParams.get('stripeSessionId');
    const calendlyEventUri = searchParams.get('calendlyEventUri');
    
    // Only initialize from URL if we have necessary parameters
    if (bookingId && (step || sessionTypeId || builderId || stripeSessionId || calendlyEventUri)) {
      logger.debug('Initializing booking flow from URL params', {
        bookingId,
        step,
        sessionTypeId,
        builderId
      });
      
      const stateFromUrl: Partial<ClientBookingState> = {
        bookingId: bookingId || undefined,
        step: step as BookingStateEnum || BookingStateEnum.IDLE,
        sessionTypeId: sessionTypeId || undefined,
        builderId: builderId || undefined,
        stripeSessionId: stripeSessionId || undefined,
        calendlyEventUri: calendlyEventUri || undefined
      };
      
      dispatch({ type: 'INIT_FROM_URL_PARAMS', payload: stateFromUrl });
      
      // If we have a stripeSessionId and are in the right state, check payment status
      if (stripeSessionId && step === BookingStateEnum.PAYMENT_PENDING) {
        checkPaymentStatus(stripeSessionId);
      }
    }
  }, [searchParams]);
  
  // Helper function to check payment status
  const checkPaymentStatus = async (stripeSessionId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to check payment status
      const response = await fetch(`/api/stripe/checkout/status?sessionId=${stripeSessionId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check payment status');
      }
      
      // Handle different payment statuses
      if (data.paymentStatus === 'PAID') {
        dispatch({ type: 'PAYMENT_SUCCEEDED', payload: { stripePaymentIntentId: data.paymentIntentId } });
        dispatch({ type: 'BOOKING_CONFIRMED' });
      } else if (data.paymentStatus === 'FAILED') {
        dispatch({ type: 'PAYMENT_FAILED', payload: { error: { message: 'Payment failed' } } });
      }
      
    } catch (error) {
      logger.error('Error checking payment status', { 
        error: error instanceof Error ? error.message : String(error),
        stripeSessionId 
      });
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error ? error.message : 'Failed to check payment status' 
        } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // Helper functions for state transitions
  const selectSessionType = (sessionType: SessionType, builderId: string) => {
    dispatch({ type: 'SELECT_SESSION_TYPE', payload: { sessionType, builderId } });
  };
  
  const initiateCalendly = (bookingId?: string) => {
    dispatch({ type: 'INITIATE_CALENDLY', payload: { bookingId } });
  };
  
  const handleCalendlyScheduled = (
    calendlyEventUri: string, 
    calendlyInviteeUri: string,
    startTime?: string,
    endTime?: string
  ) => {
    dispatch({ 
      type: 'CALENDLY_EVENT_SCHEDULED', 
      payload: { 
        calendlyEventUri, 
        calendlyInviteeUri,
        startTime,
        endTime
      } 
    });
  };
  
  const initiatePayment = (stripeSessionId?: string) => {
    if (stripeSessionId) {
      dispatch({ type: 'PAYMENT_PENDING', payload: { stripeSessionId } });
    } else {
      dispatch({ type: 'INITIATE_PAYMENT' });
    }
  };
  
  const handlePaymentSuccess = (stripePaymentIntentId?: string) => {
    dispatch({ type: 'PAYMENT_SUCCEEDED', payload: { stripePaymentIntentId } });
  };
  
  const handlePaymentFailure = (error?: { message: string; code?: string }) => {
    dispatch({ type: 'PAYMENT_FAILED', payload: { error } });
  };
  
  const confirmBooking = (startTime?: string, endTime?: string) => {
    dispatch({ type: 'BOOKING_CONFIRMED', payload: { startTime, endTime } });
  };
  
  const requestCancellation = (reason?: string) => {
    dispatch({ type: 'REQUEST_CANCELLATION', payload: { reason } });
  };
  
  const resetFlow = () => {
    dispatch({ type: 'RESET' });
  };
  
  // Context value
  const contextValue = {
    state,
    dispatch,
    selectSessionType,
    initiateCalendly,
    handleCalendlyScheduled,
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentFailure,
    confirmBooking,
    requestCancellation,
    resetFlow
  };
  
  return (
    <BookingFlowContext.Provider value={contextValue}>
      {children}
    </BookingFlowContext.Provider>
  );
}

// Custom hook for using the booking flow context
export function useBookingFlow() {
  const context = useContext(BookingFlowContext);
  
  if (!context) {
    throw new Error('useBookingFlow must be used within a BookingFlowProvider');
  }
  
  return context;
}

// Export the context and provider
export { BookingFlowContext, initialBookingState };