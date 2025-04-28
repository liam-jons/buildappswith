'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { format, parseISO } from 'date-fns';
import { TimeSlot, SessionType } from '@/lib/scheduling/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MessageSquare, CalendarClock, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { completeBookingWithPayment, StripeClientErrorType } from '@/lib/stripe/stripe-client';

interface BookingFormProps {
  sessionType: SessionType;
  timeSlot: TimeSlot;
  builderId: string;
  onComplete: () => void;
  onBack: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  sessionType,
  timeSlot,
  builderId,
  onComplete,
  onBack
}) => {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  // Get formatted dates from time slot
  const startTime = parseISO(timeSlot.startTime);
  const endTime = parseISO(timeSlot.endTime);
  
  // Get local timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!isLoaded || !user) {
        throw new Error('You must be signed in to book a session');
      }
      
      // Prepare booking data
      const bookingData = {
        sessionTypeId: sessionType.id,
        builderId: builderId,
        clientId: user.id,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        status: 'pending',
        paymentStatus: 'unpaid',
        clientTimezone: timeZone,
        builderTimezone: timeZone, // This would be fetched from builder profile
        notes: notes
      };
      
      // Determine the return URL for Stripe checkout
      const returnUrl = `${window.location.origin}/booking/confirmation`;
      
      // Complete the booking with payment in one unified process
      const result = await completeBookingWithPayment(bookingData, returnUrl);
      
      if (!result.success) {
        // Handle different error types for better user messaging
        let errorMessage = result.message;
        
        switch (result.error?.type) {
          case StripeClientErrorType.CHECKOUT:
            errorMessage = 'Unable to create payment session. Please try again.';
            break;
          case StripeClientErrorType.REDIRECT:
            errorMessage = 'Unable to redirect to payment page. Please try again.';
            break;
          case StripeClientErrorType.NETWORK:
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case StripeClientErrorType.INITIALIZATION:
            errorMessage = 'Payment system initialization failed. Please try again later.';
            break;
          default:
            errorMessage = result.error?.detail || 'An error occurred during the booking process.';
        }
        
        throw new Error(errorMessage);
      }
      
      // No need to call onComplete() as we're redirecting to Stripe
      // The confirmation will happen after the user returns from Stripe
      
    } catch (error: any) {
      console.error('Error processing booking payment:', error);
      setError(error.message || 'Failed to process booking. Please try again.');
      toast.error(error.message || 'Failed to process booking');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded) {
    return <div>Loading user information...</div>;
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Payment Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Booking summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-3">Booking Summary</h3>
          
          <div className="space-y-3">
            <div className="flex">
              <Calendar className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-gray-600">{format(startTime, 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex">
              <Clock className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-gray-600">
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')} ({timeZone})
                </p>
              </div>
            </div>
            
            <div className="flex">
              <CalendarClock className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Session Type</p>
                <p className="text-gray-600">{sessionType.title} ({sessionType.durationMinutes} minutes)</p>
              </div>
            </div>
            
            <div className="flex">
              <CreditCard className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Price</p>
                <p className="text-gray-600">{sessionType.price} {sessionType.currency}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional details form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Additional Details</h3>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes for the builder (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Share any information that might help the builder prepare for your session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
      </div>
      
      {/* Session description */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start">
            <MessageSquare className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">About this session</h4>
              <p className="text-gray-600 mt-1">{sessionType.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : (
            'Complete Booking'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingForm;