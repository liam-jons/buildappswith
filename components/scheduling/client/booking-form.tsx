"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TimeSlot, SessionType, Booking } from '@/lib/scheduling/types';
import { formatInTimezone, detectClientTimezone } from '@/lib/scheduling/utils';
import { format, parseISO, addMinutes } from 'date-fns';
import { createBooking } from '@/lib/api-client/scheduling';
import { createCheckoutSession } from '@/lib/stripe';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Calendar, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
import { BorderBeam } from '@/components/magicui/border-beam';
import { useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';

interface BookingFormProps {
  builderId: string;
  clientId: string;
  selectedSlot: TimeSlot;
  sessionType: SessionType;
  builderTimezone: string;
  onBookingComplete: (booking: Booking) => void;
  onCancel: () => void;
}

export function BookingForm({
  builderId,
  clientId,
  selectedSlot,
  sessionType,
  builderTimezone,
  onBookingComplete,
  onCancel
}: BookingFormProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const clientTimezone = detectClientTimezone();
  
  const startDate = parseISO(selectedSlot.startTime);
  const endDate = parseISO(selectedSlot.endTime);
  
  // Check if this is a featured builder (for payment requirement)
  const isFeaturedBuilder = builderId === 'founder'; // This would be a more sophisticated check in production
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setPaymentError(null);
    
    // Create the booking object
    const newBookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      sessionTypeId: sessionType.id,
      builderId,
      clientId,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      status: 'pending',
      paymentStatus: isFeaturedBuilder ? 'unpaid' : undefined, // Only set payment status for featured builders
      clientTimezone,
      builderTimezone,
      notes,
    };
    
    try {
      // Create the booking
      const { booking: newBooking, warning } = await createBooking(newBookingData);
      setUsingMockData(!!warning);
      
      if (isFeaturedBuilder) {
        // For featured builders, redirect to Stripe checkout
        const baseUrl = window.location.origin;
        const returnUrl = `${baseUrl}/payment`;
        
        try {
          // Create a checkout session and redirect to Stripe
          const { url } = await createCheckoutSession(newBooking, returnUrl);
          
          if (url) {
            // Redirect to Stripe checkout
            window.location.href = url;
            return; // Exit early as we're redirecting
          } else {
            throw new Error('Failed to create checkout session');
          }
        } catch (error) {
          console.error('Payment error:', error);
          setPaymentError('Failed to process payment. Please try again.');
          setIsSubmitting(false);
          return;
        }
      } else {
        // For regular builders, continue with the standard flow (no payment)
        setIsSubmitting(false);
        setIsComplete(true);
        
        // Call the completion handler after a short delay to show the success state
        setTimeout(() => {
          onBookingComplete(newBooking);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      setPaymentError(error.message || 'Failed to process booking');
      toast.error('Failed to create booking. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <BorderBeam
      className="relative rounded-lg"
      size={shouldReduceMotion ? "none" : "small"}
      delay={1}
      duration={3}
    >
      <Card className="w-full max-w-2xl mx-auto">
        {isComplete ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Your booking request has been sent to the builder.
              You&apos;ll receive a confirmation email shortly.
            </p>
            <Button onClick={() => onBookingComplete(null as any)}>
              Return to Builder Profile
            </Button>
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Confirm Your Booking</CardTitle>
              <CardDescription>Review the details before confirming your session</CardDescription>
              
              {usingMockData && (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-yellow-700 dark:text-yellow-300">
                    Using demo mode. This booking won&apos;t be permanently saved.
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{sessionType.title}</h3>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="font-medium">{sessionType.price} {sessionType.currency}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{format(startDate, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {formatInTimezone(selectedSlot.startTime, 'h:mm a', clientTimezone)} - 
                      {formatInTimezone(selectedSlot.endTime, 'h:mm a', clientTimezone)}
                      <span className="text-muted-foreground ml-1">
                        ({sessionType.durationMinutes} minutes)
                      </span>
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {sessionType.description}
                </p>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes for the Builder (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Share what you&apos;d like to discuss in this session..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="flex items-center">
                  <span className="font-medium mr-2">Your timezone:</span>
                  {clientTimezone}
                </p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Builder&apos;s timezone:</span>
                  {builderTimezone}
                </p>
              </div>
              
              {isFeaturedBuilder && (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 text-sm">
                  <div className="font-medium mb-1">Featured Builder Session</div>
                  <p className="text-muted-foreground">
                    This session requires payment. You&apos;ll be redirected to our secure payment processor to complete your booking.
                  </p>
                  <div className="mt-2 font-medium">
                    {sessionType.price} {sessionType.currency}
                  </div>
                </div>
              )}
              
              {paymentError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-800 dark:text-red-300">
                  <div className="font-medium mb-1">Payment Error</div>
                  <p>{paymentError}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </BorderBeam>
  );
}