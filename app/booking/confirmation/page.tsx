'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCheckoutSessionStatus, createCheckoutSession } from '@/lib/stripe/actions';
import { PaymentConfirmation } from '@/components/payment';
import { PaymentStatus } from '@/lib/stripe/types';
import { Card, CardContent } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { useToast } from '@/components/ui/core/sonner';
import { useAuth } from '@/hooks/auth';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/core/loading-spinner';
import { BookingConfirmation } from '@/components/scheduling/calendly';
import { getBookingFlowState, clearBookingFlowState } from '@/lib/scheduling/calendly';
import { BookingStatus } from '@/lib/scheduling/types';

/**
 * Booking Confirmation Page
 * 
 * This page serves two purposes:
 * 1. Shows the confirmation of a Calendly booking before payment (from the Calendly flow)
 * 2. Shows the confirmation status of a booking after payment processing (from the Stripe flow)
 */
export default function BookingConfirmationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [isCalendlyFlow, setIsCalendlyFlow] = useState(false);
  
  // Get query parameters
  const sessionId = searchParams.get('session_id');
  const status = searchParams.get('status');
  const bookingId = searchParams.get('booking_id');
  
  // Load details when the page loads
  useEffect(() => {
    async function loadDetails() {
      // First check if user is authenticated
      if (!isAuthLoaded || !isUserLoaded) {
        return; // Wait for auth to load
      }
      
      if (!isSignedIn) {
        setError('Please sign in to view your booking');
        setLoading(false);
        return;
      }
      
      // Determine which flow we're in
      if (sessionId) {
        // Stripe payment flow (completed payment)
        try {
          // Get checkout session details
          const result = await getCheckoutSessionStatus(sessionId);
          
          if (!result.success) {
            setError(result.error?.detail || 'Failed to load session details');
            toast({
              title: 'Error',
              description: 'Unable to load payment details',
              variant: 'destructive'
            });
          } else {
            setSessionData(result.data);
            
            // This would normally fetch booking details using a server action
            // Since we're waiting on the scheduling service implementation, we'll
            // just show placeholder booking data for now
            setBookingData({
              title: 'Consultation Session',
              description: 'One-on-one consultation with a builder specialist',
              builder: 'Liam (Builder)',
              date: new Date().toISOString(),
              duration: '60 minutes',
              price: '$150.00'
            });
          }
        } catch (e: any) {
          setError(e.message || 'An error occurred');
          toast({
            title: 'Error',
            description: 'Something went wrong',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Calendly flow (needs payment)
        // Handle status from Calendly redirect
        if (status === 'cancelled') {
          setError('Booking was cancelled');
          setLoading(false);
          return;
        }
        
        // Get booking state from session storage
        const state = getBookingFlowState();
        
        if (!state || !state.sessionType) {
          setError('Booking information not found');
          setLoading(false);
          return;
        }
        
        // Create a placeholder booking until we get the real one from the API
        const placeholderBooking = {
          id: bookingId || 'pending',
          builderId: state.sessionType.builderId,
          clientId: user?.id || '',
          sessionTypeId: state.sessionType.id,
          title: state.sessionType.title,
          description: state.sessionType.description,
          startTime: new Date().toISOString(), // Will be replaced with actual time
          endTime: new Date(Date.now() + state.sessionType.durationMinutes * 60000).toISOString(),
          status: BookingStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          amount: state.sessionType.price,
          calendlyEventTypeId: state.sessionType.calendlyEventTypeId,
          calendlyEventTypeUri: state.sessionType.calendlyEventTypeUri
        };
        
        setBookingData(placeholderBooking);
        setSessionData({ sessionType: state.sessionType });
        setIsCalendlyFlow(true);
        setLoading(false);
      }
    }
    
    loadDetails();
  }, [sessionId, status, bookingId, isSignedIn, isAuthLoaded, isUserLoaded, user?.id, toast]);
  
  // Handle proceeding to payment
  const handleProceedToPayment = async () => {
    if (!bookingData || !user) return;
    
    try {
      setLoading(true);
      
      // Create a checkout session
      const result = await createCheckoutSession({
        bookingData: {
          id: bookingData.id !== 'pending' ? bookingData.id : undefined,
          builderId: bookingData.builderId,
          sessionTypeId: bookingData.sessionTypeId,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          clientId: user.id,
          clientTimezone: bookingData.clientTimezone,
          // Include Calendly fields if available
          calendlyEventId: bookingData.calendlyEventId,
          calendlyEventUri: bookingData.calendlyEventUri,
          calendlyInviteeUri: bookingData.calendlyInviteeUri
        },
        returnUrl: `${window.location.origin}/booking/confirmation`
      });
      
      if (!result.success || !result.data) {
        setError(result.message || 'Failed to create checkout session');
        setLoading(false);
        return;
      }
      
      // Redirect to the checkout session
      window.location.href = result.data.url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };
  
  // Handle cancellation
  const handleCancel = () => {
    clearBookingFlowState();
    router.push('/');
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container py-12">
        <Card className="max-w-xl mx-auto p-6">
          <div className="text-center">
            <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container py-12">
        <Card className="max-w-xl mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Confirmation</h1>
            <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If this is a Calendly flow (before payment), show the booking confirmation
  if (isCalendlyFlow) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center">Booking Confirmation</h1>
        
        <BookingConfirmation
          booking={bookingData}
          sessionType={sessionData?.sessionType}
          isPending={loading}
          error={error || undefined}
          onProceedToPayment={handleProceedToPayment}
          onCancel={handleCancel}
        />
      </div>
    );
  }
  
  // Otherwise, this is a Stripe flow (after payment), show the payment confirmation
  // Use the appropriate payment status based on the Stripe session status
  const paymentStatus = status === 'success' ? PaymentStatus.PAID : 
                      status === 'cancelled' ? PaymentStatus.FAILED :
                      sessionData?.paymentStatus || PaymentStatus.UNPAID;
  
  return (
    <div className="container py-12">
      {bookingData && (
        <PaymentConfirmation
          paymentStatus={paymentStatus}
          sessionData={bookingData}
          showAddToCalendar={paymentStatus === PaymentStatus.PAID}
        />
      )}
    </div>
  );
}