'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingFlow } from '@/lib/contexts/booking-flow-context';
import { useBookingManager } from '@/hooks/scheduling';
import { BookingStateEnum } from '@/lib/scheduling/state-machine/types';
import { Card } from '@/components/ui/core';
import { logger } from '@/lib/logger';

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const { state } = useBookingFlow();
  const { 
    checkPaymentStatus, 
    getBookingDetails,
    resetBookingFlow
  } = useBookingManager();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);
  
  // Get query parameters
  const bookingId = searchParams?.get('bookingId') || state.bookingId;
  const step = searchParams?.get('step');
  const stripeSessionId = searchParams?.get('session_id');
  
  useEffect(() => {
    async function handleConfirmation() {
      setLoading(true);
      
      try {
        // If we have a session ID, check payment status
        if (stripeSessionId) {
          logger.info('Checking payment status from URL', { stripeSessionId });
          const paymentSucceeded = await checkPaymentStatus(stripeSessionId);
          
          if (!paymentSucceeded) {
            setError('Your payment was not completed. Please try again.');
            setLoading(false);
            return;
          }
        }
        
        // Fetch booking details
        if (bookingId) {
          const details = await getBookingDetails(bookingId);
          setBookingDetails(details);
        } else {
          setError('Booking ID is missing');
        }
      } catch (err) {
        logger.error('Error handling confirmation', { 
          error: err instanceof Error ? err.message : String(err),
          bookingId,
          stripeSessionId
        });
        
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to load booking confirmation'
        );
      } finally {
        setLoading(false);
      }
    }
    
    handleConfirmation();
  }, [bookingId, stripeSessionId, checkPaymentStatus, getBookingDetails]);
  
  if (loading) {
    return (
      <div className="confirmation-loading flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4">Processing your booking...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="confirmation-error p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={resetBookingFlow}
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
        >
          Return to Booking
        </button>
      </div>
    );
  }
  
  if (state.step === BookingStateEnum.PAYMENT_SUCCEEDED || 
      state.step === BookingStateEnum.BOOKING_CONFIRMED) {
    return (
      <div className="confirmation-success p-4 max-w-4xl mx-auto">
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-700">Booking Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your booking. Your session has been scheduled.
            </p>
          </div>
          
          <div className="booking-details border-t border-gray-200 pt-4">
            <h2 className="font-semibold text-lg mb-3">Booking Details:</h2>
            
            {bookingDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Session Type</p>
                  <p className="font-medium">{bookingDetails.title}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {bookingDetails.startTime && 
                      new Date(bookingDetails.startTime).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">
                    {bookingDetails.sessionType?.durationMinutes || '-'} minutes
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {bookingDetails.status}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p>Booking details are not available</p>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                resetBookingFlow();
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Return to Home
            </button>
            
            <button
              onClick={resetBookingFlow}
              className="ml-4 px-4 py-2 bg-gray-200 text-gray-800 rounded"
            >
              Book Another Session
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Default view for other states
  return (
    <div className="confirmation-default p-4 max-w-4xl mx-auto">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Booking Status</h1>
        
        <p>
          Your booking is being processed. Current status: {state.step}
        </p>
        
        <div className="mt-8">
          <button
            onClick={resetBookingFlow}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Return to Booking
          </button>
        </div>
      </Card>
    </div>
  );
}
