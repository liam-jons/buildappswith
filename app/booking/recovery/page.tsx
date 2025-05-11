'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/core';
import { BookingStateEnum } from '@/lib/scheduling/state-machine/types';
import { logger } from '@/lib/logger';

export default function RecoveryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  useEffect(() => {
    async function recoverBooking() {
      setLoading(true);
      setError(null);
      
      try {
        const token = searchParams?.get('token');
        
        if (!token) {
          setError('Recovery token is missing');
          setLoading(false);
          return;
        }
        
        // Call the recovery API
        const response = await fetch('/api/scheduling/bookings/recover', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token,
            targetState: BookingStateEnum.IDLE
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to recover booking');
        }
        
        if (!data.success) {
          throw new Error('Recovery failed');
        }
        
        // Set success state
        setRecoverySuccess(true);
        setBookingId(data.bookingId);
        
        // Redirect to booking page after a short delay
        setTimeout(() => {
          if (data.bookingId) {
            // If we have a booking ID, redirect to booking page
            router.push(`/booking/schedule?bookingId=${data.bookingId}`);
          } else {
            // Otherwise, redirect to the main booking page
            router.push('/booking/schedule');
          }
        }, 3000);
        
      } catch (err) {
        logger.error('Error recovering booking', { 
          error: err instanceof Error ? err.message : String(err)
        });
        
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to recover booking session'
        );
      } finally {
        setLoading(false);
      }
    }
    
    recoverBooking();
  }, [searchParams, router]);
  
  if (loading) {
    return (
      <div className="recovery-loading flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4">Recovering your booking session...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="recovery-error p-6 max-w-4xl mx-auto">
        <Card className="p-6 bg-red-50 border border-red-200">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Recovery Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/booking/schedule')}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Start New Booking
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
            >
              Return to Home
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (recoverySuccess) {
    return (
      <div className="recovery-success p-6 max-w-4xl mx-auto">
        <Card className="p-6 bg-green-50 border border-green-200">
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
            <h1 className="text-2xl font-bold text-green-700">Recovery Successful!</h1>
            <p className="text-gray-600 mt-2">
              Your booking session has been recovered. Redirecting you in a moment...
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => router.push(
                bookingId 
                  ? `/booking/schedule?bookingId=${bookingId}` 
                  : '/booking/schedule'
              )}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Continue Booking
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Default loading fallback
  return (
    <div className="recovery-default flex justify-center items-center min-h-[400px]">
      <p>Processing your recovery request...</p>
    </div>
  );
}