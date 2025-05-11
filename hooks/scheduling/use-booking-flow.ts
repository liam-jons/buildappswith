'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { 
  BookingEventEnum,
  BookingStateEnum,
  BookingStateData
} from '@/lib/scheduling/state-machine/types';
import { useBookingFlow } from '@/lib/contexts/booking-flow-context';
import { SessionType } from '@/lib/scheduling/types';

/**
 * Custom hook for managing the booking flow with server-side state machine
 */
export function useBookingManager() {
  const router = useRouter();
  const { state, dispatch, resetFlow } = useBookingFlow();
  const [isInitializing, setIsInitializing] = useState(false);
  
  /**
   * Initialize a new booking
   */
  const initializeBooking = useCallback(async (
    sessionType: SessionType,
    builderId: string
  ) => {
    try {
      setIsInitializing(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Generate a new booking ID
      const bookingId = uuidv4();
      
      // Call the API to initialize the booking
      const response = await fetch('/api/scheduling/bookings/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId,
          builderId,
          sessionTypeId: sessionType.id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize booking');
      }
      
      const data = await response.json();
      
      // Update client-side state
      dispatch({ 
        type: 'SELECT_SESSION_TYPE', 
        payload: { 
          sessionType, 
          builderId 
        } 
      });
      
      return bookingId;
    } catch (error) {
      logger.error('Error initializing booking', { 
        error: error instanceof Error ? error.message : String(error),
        sessionTypeId: sessionType.id,
        builderId
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to initialize booking'
        } 
      });
      
      return null;
    } finally {
      setIsInitializing(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch]);
  
  /**
   * Start Calendly scheduling
   */
  const startCalendlyScheduling = useCallback(async () => {
    if (!state.bookingId || !state.sessionTypeId || !state.builderId) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'Missing required booking information' } 
      });
      return false;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to transition the booking state
      const response = await fetch(`/api/scheduling/bookings/${state.bookingId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: BookingEventEnum.INITIATE_CALENDLY_SCHEDULING,
          data: {
            bookingId: state.bookingId,
            builderId: state.builderId,
            sessionTypeId: state.sessionTypeId
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start Calendly scheduling');
      }
      
      // Update client-side state
      dispatch({ type: 'INITIATE_CALENDLY', payload: { bookingId: state.bookingId } });
      
      return true;
    } catch (error) {
      logger.error('Error starting Calendly scheduling', { 
        error: error instanceof Error ? error.message : String(error),
        bookingId: state.bookingId
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to start Calendly scheduling'
        } 
      });
      
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.bookingId, state.sessionTypeId, state.builderId, dispatch]);
  
  /**
   * Handle Calendly event scheduling
   */
  const handleCalendlyScheduled = useCallback(async (
    calendlyEventUri: string,
    calendlyInviteeUri: string,
    startTime?: string,
    endTime?: string
  ) => {
    if (!state.bookingId) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'Missing booking ID' } 
      });
      return false;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to transition the booking state
      const response = await fetch(`/api/scheduling/bookings/${state.bookingId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: BookingEventEnum.SCHEDULE_EVENT,
          data: {
            calendlyEventUri,
            calendlyInviteeUri,
            startTime,
            endTime
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process Calendly event');
      }
      
      // Update client-side state
      dispatch({ 
        type: 'CALENDLY_EVENT_SCHEDULED', 
        payload: { 
          calendlyEventUri, 
          calendlyInviteeUri,
          startTime,
          endTime
        } 
      });
      
      return true;
    } catch (error) {
      logger.error('Error handling Calendly scheduled event', { 
        error: error instanceof Error ? error.message : String(error),
        bookingId: state.bookingId,
        calendlyEventUri
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to process Calendly event'
        } 
      });
      
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.bookingId, dispatch]);
  
  /**
   * Start payment process
   */
  const startPaymentProcess = useCallback(async () => {
    if (!state.bookingId || !state.calendlyEventUri) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'Missing required booking information' } 
      });
      return null;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to transition the booking state
      const transitionResponse = await fetch(`/api/scheduling/bookings/${state.bookingId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: BookingEventEnum.INITIATE_PAYMENT,
          data: {}
        })
      });
      
      if (!transitionResponse.ok) {
        const errorData = await transitionResponse.json();
        throw new Error(errorData.message || 'Failed to initiate payment');
      }
      
      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingData: {
            id: state.bookingId,
            builderId: state.builderId,
            sessionTypeId: state.sessionTypeId,
            startTime: state.startTime,
            endTime: state.endTime,
            calendlyEventUri: state.calendlyEventUri,
            calendlyInviteeUri: state.calendlyInviteeUri
          },
          returnUrl: `${window.location.origin}/booking/confirmation?bookingId=${state.bookingId}&step=${BookingStateEnum.PAYMENT_PENDING}`
        })
      });
      
      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }
      
      const { sessionId, url } = await checkoutResponse.json();
      
      // Update client-side state
      dispatch({ type: 'PAYMENT_PENDING', payload: { stripeSessionId: sessionId } });
      
      // Redirect to Stripe Checkout
      router.push(url);
      
      return sessionId;
    } catch (error) {
      logger.error('Error starting payment process', { 
        error: error instanceof Error ? error.message : String(error),
        bookingId: state.bookingId
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to start payment process'
        } 
      });
      
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [
    state.bookingId, 
    state.builderId, 
    state.sessionTypeId, 
    state.calendlyEventUri,
    state.calendlyInviteeUri,
    state.startTime,
    state.endTime,
    dispatch,
    router
  ]);
  
  /**
   * Check payment status
   */
  const checkPaymentStatus = useCallback(async (
    stripeSessionId: string = state.stripeSessionId || ''
  ) => {
    if (!stripeSessionId) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'Missing Stripe session ID' } 
      });
      return false;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to check payment status
      const response = await fetch(`/api/stripe/checkout/status?sessionId=${stripeSessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check payment status');
      }
      
      const data = await response.json();
      
      // Handle different payment statuses
      if (data.paymentStatus === 'PAID') {
        // Call API to transition the booking state if we have a booking ID
        if (state.bookingId) {
          await fetch(`/api/scheduling/bookings/${state.bookingId}/transition`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              event: BookingEventEnum.PAYMENT_SUCCEEDED,
              data: {
                stripePaymentIntentId: data.paymentIntentId
              }
            })
          });
        }
        
        dispatch({ 
          type: 'PAYMENT_SUCCEEDED', 
          payload: { stripePaymentIntentId: data.paymentIntentId } 
        });
        dispatch({ type: 'BOOKING_CONFIRMED' });
        
        return true;
      } else if (data.paymentStatus === 'FAILED') {
        // Call API to transition the booking state if we have a booking ID
        if (state.bookingId) {
          await fetch(`/api/scheduling/bookings/${state.bookingId}/transition`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              event: BookingEventEnum.PAYMENT_FAILED,
              data: {
                error: {
                  message: 'Payment failed',
                  code: 'payment_failed'
                }
              }
            })
          });
        }
        
        dispatch({ 
          type: 'PAYMENT_FAILED', 
          payload: { 
            error: { message: 'Payment failed', code: 'payment_failed' } 
          } 
        });
        
        return false;
      }
      
      // Payment is still pending
      return false;
    } catch (error) {
      logger.error('Error checking payment status', { 
        error: error instanceof Error ? error.message : String(error),
        stripeSessionId
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to check payment status'
        } 
      });
      
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.bookingId, state.stripeSessionId, dispatch]);
  
  /**
   * Request booking cancellation
   */
  const requestCancellation = useCallback(async (reason?: string) => {
    if (!state.bookingId) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'Missing booking ID' } 
      });
      return false;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to transition the booking state
      const response = await fetch(`/api/scheduling/bookings/${state.bookingId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: BookingEventEnum.REQUEST_CANCELLATION,
          data: {
            cancelReason: reason,
            cancelledAt: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request cancellation');
      }
      
      // Update client-side state
      dispatch({ type: 'REQUEST_CANCELLATION', payload: { reason } });
      
      return true;
    } catch (error) {
      logger.error('Error requesting cancellation', { 
        error: error instanceof Error ? error.message : String(error),
        bookingId: state.bookingId
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to request cancellation'
        } 
      });
      
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.bookingId, dispatch]);
  
  /**
   * Get booking details
   */
  const getBookingDetails = useCallback(async (bookingId: string = state.bookingId || '') => {
    if (!bookingId) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { message: 'Missing booking ID' } 
      });
      return null;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call API to get booking details
      const response = await fetch(`/api/scheduling/bookings/${bookingId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get booking details');
      }
      
      return await response.json();
    } catch (error) {
      logger.error('Error getting booking details', { 
        error: error instanceof Error ? error.message : String(error),
        bookingId
      });
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          message: error instanceof Error 
            ? error.message 
            : 'Failed to get booking details'
        } 
      });
      
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.bookingId, dispatch]);
  
  return {
    // State
    bookingState: state,
    isInitializing,
    
    // Actions
    initializeBooking,
    startCalendlyScheduling,
    handleCalendlyScheduled,
    startPaymentProcess,
    checkPaymentStatus,
    requestCancellation,
    getBookingDetails,
    resetBookingFlow: resetFlow
  };
}

export default useBookingManager;