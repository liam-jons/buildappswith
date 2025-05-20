'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BookingStateEnum } from '@/lib/scheduling/state-machine/types';
import { SessionType } from '@/lib/scheduling/types';
import { useBookingFlow } from '@/lib/contexts/booking-flow-context';
import { useBookingManager } from '@/hooks/scheduling';
import { CalendlyCalendar } from '../calendly/calendly-calendar';
import { CalendlyEvent, CalendlyQuestionAnswer } from '../calendly/calendly-model';
import { SessionTypeSelector } from './session-type-selector';
import { SessionTypeCategory } from './session-type-category';
import { PathwaySelector } from './pathway-selector';
import { useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

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
  const { isSignedIn } = useAuth();
  const { state, dispatch, selectPathway, setCustomQuestionResponse } = useBookingFlow();
  const {
    initializeBooking,
    startCalendlyScheduling,
    handleCalendlyScheduled,
    startPaymentProcess,
    checkPaymentStatus,
    resetBookingFlow
  } = useBookingManager();
  
  // Debug logging
  React.useEffect(() => {
    console.log('BookingFlow Debug:', {
      builderId,
      sessionTypesCount: sessionTypes.length,
      isSignedIn,
      sessionTypes: sessionTypes.map(s => ({
        id: s.id,
        title: s.title,
        requiresAuth: s.requiresAuth,
        category: s.eventTypeCategory,
        price: s.price
      }))
    });
  }, [builderId, sessionTypes, isSignedIn]);
  
  const searchParams = useSearchParams();
  const [isRecovering, setIsRecovering] = useState(false);
  const [showPathwaySelector, setShowPathwaySelector] = useState(false);
  
  // Filter sessions based on authentication status
  const availableSessions = sessionTypes.filter(session => {
    if (isSignedIn) {
      return true; // Authenticated users can see all sessions
    }
    return !session.requiresAuth; // Unauthenticated users can only see public sessions
  });
  
  // Debug available sessions
  console.log('Available sessions for user:', {
    isSignedIn,
    availableCount: availableSessions.length,
    available: availableSessions.map(s => s.title)
  });
  
  // Group sessions by category
  const groupedSessions = React.useMemo(() => {
    const groups: Record<string, SessionType[]> = {
      free: [],
      pathway: [],
      specialized: [],
      other: []
    };
    
    availableSessions.forEach(session => {
      const category = session.eventTypeCategory || 'other';
      if (groups[category]) {
        groups[category].push(session);
      } else {
        groups.other.push(session);
      }
    });
    
    return groups;
  }, [availableSessions]);
  
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
          // Check if session requires pathway selection
          if (isSignedIn && sessionType.eventTypeCategory === 'pathway' && !state.pathway) {
            setShowPathwaySelector(true);
            return;
          }
          
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
    startCalendlyScheduling,
    isSignedIn,
    state.pathway
  ]);
  
  // Handle session type selection
  const handleSelectSessionType = async (sessionType: SessionType) => {
    if (!builderId) {
      logger.error('Missing builder ID for booking flow');
      return;
    }
    
    // Check if session requires pathway selection
    if (isSignedIn && sessionType.eventTypeCategory === 'pathway' && !state.pathway) {
      // For authenticated users with pathway sessions
      const bookingId = await initializeBooking(sessionType, builderId);
      if (bookingId) {
        setShowPathwaySelector(true);
      }
      return;
    }
    
    // For unauthenticated users or authenticated without pathway requirements
    if (!isSignedIn) {
      // For unauthenticated users, we need to set up the state without creating a booking
      const tempBookingId = uuidv4();
      
      // Set up the booking state for unauthenticated users
      dispatch({ 
        type: 'SELECT_SESSION_TYPE', 
        payload: { 
          sessionType, 
          builderId 
        } 
      });
      
      // Initialize the booking state with a temporary ID
      dispatch({
        type: 'INITIATE_CALENDLY',
        payload: { bookingId: tempBookingId }
      });
      
      // Directly start Calendly embed (not through state machine)
      return;
    } else {
      // For authenticated users, initialize booking first
      const bookingId = await initializeBooking(sessionType, builderId);
      
      if (bookingId) {
        await startCalendlyScheduling();
      }
    }
  };
  
  // Handle pathway selection
  const handlePathwaySelect = async (pathway: string) => {
    selectPathway(pathway);
    setShowPathwaySelector(false);
    await startCalendlyScheduling();
  };
  
  // Handle Calendly event scheduling
  const handleCalendlyEvent = async (event: CalendlyEvent) => {
    // Extract event details
    const { uri: calendlyEventUri, invitee } = event || {};
    const calendlyInviteeUri = invitee?.uri;
    const startTime = event?.start_time;
    const endTime = event?.end_time;
    
    // Extract custom question responses if available
    const customQuestionResponse = event?.questions_and_answers as CalendlyQuestionAnswer[] | undefined;
    
    // If unauthenticated user, create the booking now
    if (!isSignedIn && !state.bookingId) {
      const selectedSession = sessionTypes.find(s => s.id === state.sessionTypeId);
      
      if (selectedSession && builderId) {
        try {
          // Create booking through the new create endpoint
          const response = await fetch('/api/scheduling/bookings/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              builderId,
              sessionTypeId: selectedSession.id,
              calendlyEventUri,
              calendlyInviteeUri,
              startTime,
              endTime,
              customQuestionResponse,
              clientEmail: invitee?.email,
              clientName: invitee?.name
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create booking');
          }
          
          const data = await response.json();
          
          // Update state with the booking ID
          dispatch({ 
            type: 'INITIATE_CALENDLY', 
            payload: { bookingId: data.bookingId }
          });
          
        } catch (error) {
          logger.error('Error creating anonymous booking', { error });
        }
      }
    }
    
    // Store custom question response
    if (customQuestionResponse) {
      setCustomQuestionResponse(customQuestionResponse);
    }
    
    await handleCalendlyScheduled(
      calendlyEventUri,
      calendlyInviteeUri,
      startTime,
      endTime,
      customQuestionResponse
    );
    
    // Only continue to payment if the session requires it
    const selectedSession = sessionTypes.find(s => s.id === state.sessionTypeId);
    if (selectedSession && selectedSession.price > 0) {
      await startPaymentProcess();
    }
  };
  
  // Render error state
  if (state.error) {
    return (
      <div className="booking-flow-error p-6 bg-red-50 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900">Error</h3>
        <p className="text-red-700">{state.error.message}</p>
        <button
          onClick={resetBookingFlow}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Start Over
        </button>
      </div>
    );
  }
  
  // Render loading state
  if (state.loading || isRecovering) {
    return (
      <div className="booking-flow-loading flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          {isRecovering ? 'Recovering session...' : 'Loading...'}
        </p>
      </div>
    );
  }
  
  // Render pathway selector if needed
  if (showPathwaySelector) {
    return (
      <div className="booking-flow-pathway-selector p-6">
        <h2 className="text-2xl font-bold mb-4">Select Your Learning Pathway</h2>
        <p className="text-muted-foreground mb-6">
          Choose the pathway that best aligns with your goals
        </p>
        <PathwaySelector
          onSelect={handlePathwaySelect}
          selectedPathway={state.pathway}
        />
      </div>
    );
  }
  
  // Render appropriate step based on state
  const renderStep = () => {
    switch (state.step) {
      case BookingStateEnum.IDLE:
        return (
          <div className="space-y-8">
            {!isSignedIn && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-900">
                  Sign in to access all session types and learning pathways
                </p>
              </div>
            )}
            
            {groupedSessions.free.length > 0 && (
              <SessionTypeCategory
                title="Free Sessions"
                sessions={groupedSessions.free}
                onSelect={handleSelectSessionType}
              />
            )}
            
            {isSignedIn && groupedSessions.pathway.length > 0 && (
              <SessionTypeCategory
                title="Learning Pathway Sessions"
                sessions={groupedSessions.pathway}
                onSelect={handleSelectSessionType}
              />
            )}
            
            {groupedSessions.specialized.length > 0 && (
              <SessionTypeCategory
                title="Specialized Sessions"
                sessions={groupedSessions.specialized}
                onSelect={handleSelectSessionType}
              />
            )}
            
            {groupedSessions.other.length > 0 && (
              <SessionTypeCategory
                title="Other Sessions"
                sessions={groupedSessions.other}
                onSelect={handleSelectSessionType}
              />
            )}
          </div>
        );
      
      case BookingStateEnum.SESSION_TYPE_SELECTED:
      case BookingStateEnum.CALENDLY_SCHEDULING_INITIATED:
        const selectedSessionType = sessionTypes.find(st => st.id === state.sessionTypeId);
        
        if (!selectedSessionType || !selectedSessionType.calendlyEventTypeUri) {
          return (
            <div className="booking-flow-error p-6 bg-yellow-50 rounded-lg">
              <p className="text-yellow-900">Session type not found or Calendly URL not configured.</p>
              <button
                onClick={resetBookingFlow}
                className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Start Over
              </button>
            </div>
          );
        }
        
        // Generate a booking ID for anonymous users if needed
        const bookingId = state.bookingId || uuidv4();
        
        // Use API-based calendar instead of iframe
        // Get the Calendly event type ID from the URI or use the ID directly
        let eventTypeUri = '';
        
        if (selectedSessionType.calendlyEventTypeId) {
          // Use the event type ID to construct the API URI
          eventTypeUri = `https://api.calendly.com/event_types/${selectedSessionType.calendlyEventTypeId}`;
        } else if (selectedSessionType.calendlyEventTypeUri) {
          // Extract the event type ID from the URI if needed
          const uriParts = selectedSessionType.calendlyEventTypeUri.split('/');
          const eventSlug = uriParts[uriParts.length - 1];
          // For now, we'll use the full URI format that matches the API
          eventTypeUri = `https://api.calendly.com/event_types/${eventSlug}`;
        }
        
        return (
          <CalendlyCalendar
            eventTypeUri={eventTypeUri}
            sessionType={{
              title: selectedSessionType.title,
              duration: selectedSessionType.durationMinutes || 30,
              price: selectedSessionType.price || 0
            }}
            onSelectTimeSlot={async (slot) => {
              // Create booking confirmation with selected time slot
              try {
                const response = await fetch('/api/scheduling/bookings/confirm', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    sessionTypeId: selectedSessionType.id,
                    timeSlot: {
                      startTime: slot.startTime.toISOString(),
                      endTime: slot.endTime.toISOString(),
                      schedulingUrl: slot.schedulingUrl
                    },
                    clientDetails: {
                      name: state.userName || (isSignedIn ? 'User' : 'Guest'),
                      email: state.userEmail || (isSignedIn ? 'user@example.com' : 'guest@example.com'),
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    bookingId: state.bookingId,
                    pathway: state.pathway,
                    notes: state.customQuestionResponse
                  })
                });
                
                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Failed to confirm booking');
                }
                
                const data = await response.json();
                
                // Handle payment if required
                if (data.paymentRequired && data.checkoutUrl) {
                  // Redirect to payment
                  window.location.href = data.checkoutUrl;
                } else {
                  // Update state with confirmed booking
                  dispatch({
                    type: 'BOOKING_CONFIRMED',
                    payload: {
                      startTime: data.booking.startTime,
                      endTime: data.booking.endTime
                    }
                  });
                  
                  // Also update Calendly event URI if provided
                  dispatch({
                    type: 'CALENDLY_EVENT_SCHEDULED',
                    payload: {
                      calendlyEventUri: data.booking.calendlyEventId,
                      calendlyInviteeUri: data.booking.calendlyEventId, // We don't have a separate invitee URI yet
                      startTime: data.booking.startTime,
                      endTime: data.booking.endTime
                    }
                  });
                }
              } catch (error) {
                logger.error('Error confirming booking', { error });
                dispatch({
                  type: 'SET_ERROR',
                  payload: { error: error instanceof Error ? error : new Error('Unknown error') }
                });
              }
            }}
          />
        );
      
      case BookingStateEnum.PAYMENT_SUCCEEDED:
      case BookingStateEnum.BOOKING_CONFIRMED:
        return (
          <div className="booking-success p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900">Booking Confirmed!</h3>
            <p className="text-green-700">Your session has been scheduled successfully.</p>
            {state.startTime && (
              <p className="text-green-600 mt-2">
                Start time: {new Date(state.startTime).toLocaleString()}
              </p>
            )}
            <button
              onClick={resetBookingFlow}
              className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
            >
              Book Another Session
            </button>
          </div>
        );
      
      case BookingStateEnum.PAYMENT_FAILED:
        return (
          <div className="booking-flow-error p-6 bg-red-50 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900">Payment Failed</h3>
            <p className="text-red-700">
              We couldn't process your payment. Please try again or contact support.
            </p>
            <button
              onClick={() => startPaymentProcess()}
              className="bg-red-600 text-white px-4 py-2 rounded mt-4 hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={resetBookingFlow}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mt-4 ml-4 hover:bg-gray-400"
            >
              Start Over
            </button>
          </div>
        );
      
      case BookingStateEnum.CANCELLATION_REQUESTED:
        return (
          <div className="booking-cancellation p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">Cancellation Requested</h3>
            <p className="text-gray-700">Your cancellation request is being processed.</p>
            <button
              onClick={resetBookingFlow}
              className="bg-gray-600 text-white px-4 py-2 rounded mt-4 hover:bg-gray-700"
            >
              Book New Session
            </button>
          </div>
        );
      
      default:
        return (
          <div className="booking-default p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-700">Unknown booking state. Please start over.</p>
            <button
              onClick={resetBookingFlow}
              className="bg-gray-600 text-white px-4 py-2 rounded mt-4 hover:bg-gray-700"
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