'use client';

import React, { useEffect, useState } from 'react';
import { BookingStateEnum } from '@/lib/scheduling/state-machine/types';
import { SessionType } from '@/lib/scheduling/types';
import { useBookingFlow } from '@/lib/contexts/booking-flow-context';
import { useBookingManager } from '@/hooks/scheduling';
import { CalendlyEmbed } from '../calendly';
import { SessionTypeSelector } from './session-type-selector';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';

interface BookingFlowProps {
  builderId?: string;
  sessionTypes?: SessionType[];
  preselectedSessionTypeId?: string;
}

export function BookingFlow({
  builderId,
  sessionTypes = [],
  preselectedSessionTypeId
}: BookingFlowProps) {
  const { state } = useBookingFlow();
  const {
    initializeBooking,
    startCalendlyScheduling,
    handleCalendlyScheduled,
    startPaymentProcess,
    checkPaymentStatus,
    resetBookingFlow
  } = useBookingManager();
  
  const searchParams = useSearchParams();
  const [isRecovering, setIsRecovering] = useState(false);
  
  // Handle URL parameters for recovery
  useEffect(() => {
    const handleRecoveryParams = async () => {
      if (!searchParams) return;
      
      const bookingId = searchParams.get('bookingId');
      const stripeSessionId = searchParams.get('session_id') || searchParams.get('stripeSessionId');
      
      if (bookingId && stripeSessionId) {
        setIsRecovering(true);
        
        // Check payment status
        await checkPaymentStatus(stripeSessionId);
        
        setIsRecovering(false);
      }
    };
    
    handleRecoveryParams();
  }, [searchParams, checkPaymentStatus]);
  
  // Preselect session type if provided
  useEffect(() => {
    const handlePreselectedSessionType = async () => {
      if (preselectedSessionTypeId && builderId && sessionTypes.length > 0) {
        const sessionType = sessionTypes.find(st => st.id === preselectedSessionTypeId);
        
        if (sessionType) {
          const bookingId = await initializeBooking(sessionType, builderId);
          
          if (bookingId) {
            await startCalendlyScheduling();
          }
        }
      }
    };
    
    handlePreselectedSessionType();
  }, [
    preselectedSessionTypeId, 
    builderId, 
    sessionTypes, 
    initializeBooking, 
    startCalendlyScheduling
  ]);
  
  // Handle session type selection
  const handleSelectSessionType = async (sessionType: SessionType) => {
    if (!builderId) {
      logger.error('Missing builder ID for booking flow');
      return;
    }
    
    const bookingId = await initializeBooking(sessionType, builderId);
    
    if (bookingId) {
      await startCalendlyScheduling();
    }
  };
  
  // Handle Calendly event scheduling
  const handleCalendlyEvent = async (
    calendlyEventUri: string,
    calendlyInviteeUri: string,
    startTime?: string,
    endTime?: string
  ) => {
    await handleCalendlyScheduled(
      calendlyEventUri,
      calendlyInviteeUri,
      startTime,
      endTime
    );
    
    // Start payment process
    await startPaymentProcess();
  };
  
  // Render error state
  if (state.error) {
    return (
      <div className="booking-flow-error">
        <h3>Error</h3>
        <p>{state.error.message}</p>
        <button
          onClick={resetBookingFlow}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Start Over
        </button>
      </div>
    );
  }
  
  // Render loading state
  if (state.loading || isRecovering) {
    return (
      <div className="booking-flow-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4">
          {isRecovering ? 'Recovering session...' : 'Loading...'}
        </p>
      </div>
    );
  }
  
  // Render appropriate step based on state
  const renderStep = () => {
    switch (state.step) {
      case BookingStateEnum.IDLE:
        return (
          <SessionTypeSelector
            sessionTypes={sessionTypes}
            onSelect={handleSelectSessionType}
          />
        );
      
      case BookingStateEnum.SESSION_TYPE_SELECTED:
      case BookingStateEnum.CALENDLY_SCHEDULING_INITIATED:
        const selectedSessionType = sessionTypes.find(st => st.id === state.sessionTypeId);
        
        if (!selectedSessionType || !selectedSessionType.calendlyEventTypeUri) {
          return (
            <div className="booking-flow-error">
              <p>Session type not found or Calendly URL not configured.</p>
              <button
                onClick={resetBookingFlow}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Start Over
              </button>
            </div>
          );
        }
        
        return (
          <CalendlyEmbed
            url={selectedSessionType.calendlyEventTypeUri}
            prefill={{
              name: '',
              email: '',
              customAnswers: {
                a1: state.bookingId || '',
              }
            }}
            utmParams={{
              utmContent: state.bookingId || '',
            }}
            onEventScheduled={handleCalendlyEvent}
          />
        );
      
      case BookingStateEnum.PAYMENT_SUCCEEDED:
      case BookingStateEnum.BOOKING_CONFIRMED:
        return (
          <div className="booking-success">
            <h3>Booking Confirmed!</h3>
            <p>Your session has been scheduled successfully.</p>
            {state.startTime && (
              <p>
                Start time: {new Date(state.startTime).toLocaleString()}
              </p>
            )}
            <button
              onClick={resetBookingFlow}
              className="bg-primary text-white px-4 py-2 rounded mt-4"
            >
              Book Another Session
            </button>
          </div>
        );
      
      case BookingStateEnum.PAYMENT_FAILED:
        return (
          <div className="booking-flow-error">
            <h3>Payment Failed</h3>
            <p>
              We couldn't process your payment. Please try again or contact support.
            </p>
            <button
              onClick={() => startPaymentProcess()}
              className="bg-primary text-white px-4 py-2 rounded mt-4"
            >
              Try Again
            </button>
            <button
              onClick={resetBookingFlow}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mt-4 ml-4"
            >
              Start Over
            </button>
          </div>
        );
      
      case BookingStateEnum.CANCELLATION_REQUESTED:
        return (
          <div className="booking-cancellation">
            <h3>Cancellation Requested</h3>
            <p>Your cancellation request is being processed.</p>
            <button
              onClick={resetBookingFlow}
              className="bg-primary text-white px-4 py-2 rounded mt-4"
            >
              Book New Session
            </button>
          </div>
        );
      
      default:
        return (
          <div className="booking-default">
            <p>Unknown booking state. Please start over.</p>
            <button
              onClick={resetBookingFlow}
              className="bg-primary text-white px-4 py-2 rounded mt-4"
            >
              Start Over
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="booking-flow-container p-4">
      {renderStep()}
    </div>
  );
}