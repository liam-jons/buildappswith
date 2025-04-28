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
import { Calendar, Clock, MessageSquare, CalendarClock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

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
      
      // Create the booking
      const response = await fetch('/api/scheduling/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      // Successful booking
      onComplete();
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
      toast.error(error.message || 'Failed to create booking');
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
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
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