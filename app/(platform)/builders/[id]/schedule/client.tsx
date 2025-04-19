"use client";

import { useState, useEffect } from 'react';
import { BuilderCalendar } from '@/components/scheduling/client/builder-calendar';
import { BookingForm } from '@/components/scheduling/client/booking-form';
import { mockBuilderSchedulingProfile } from '@/lib/scheduling/mock-data';
import { TimeSlot, SessionType, Booking } from '@/lib/scheduling/types';
import { Button } from '@/components/ui/button';
import { TextShimmer } from '@/components/magicui/text-shimmer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ScheduleClientProps {
  builderId: string;
}

export default function ScheduleClient({ builderId }: ScheduleClientProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(mockBuilderSchedulingProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  
  // Mock client ID for demonstration
  const clientId = "client-demo";
  
  // Simulate loading profile data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSelectTimeSlot = (slot: TimeSlot, sessionType: SessionType) => {
    setSelectedSlot(slot);
    setSelectedSessionType(sessionType);
    window.scrollTo(0, 0);
  };
  
  const handleBookingComplete = (booking: Booking) => {
    // In a real implementation, we would save the booking to the database
    // and redirect to a success page
    console.log("Booking completed:", booking);
    
    // Navigate back to the builder profile
    router.push(`/builders/${builderId}`);
  };
  
  const resetBookingForm = () => {
    setSelectedSlot(null);
    setSelectedSessionType(null);
  };
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            <p className="text-muted-foreground">Loading builder&apos;s availability...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile.isAcceptingBookings) {
    return (
      <div className="container py-10">
        <Link href={`/builders/${builderId}`} passHref>
          <Button variant="ghost" className="flex items-center mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
        
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">This builder is not accepting bookings</h1>
          <p className="text-muted-foreground max-w-md mb-6">
          The builder is currently not accepting new bookings. 
          Please check back later or contact them directly.
          </p>
          <Link href={`/builders/${builderId}`} passHref>
            <Button>Return to Builder Profile</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Link href={`/builders/${builderId}`} passHref>
        <Button variant="ghost" className="flex items-center mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
      </Link>
      
      {selectedSlot && selectedSessionType ? (
        <div className="mb-8">
          <BookingForm
            builderId={builderId}
            clientId={clientId}
            selectedSlot={selectedSlot}
            sessionType={selectedSessionType}
            builderTimezone={profile.timezone}
            onBookingComplete={handleBookingComplete}
            onCancel={resetBookingForm}
          />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <TextShimmer className="text-3xl font-bold">
              Book a Session
            </TextShimmer>
            <p className="text-muted-foreground mt-1">
              Select a time to schedule your session with this builder
            </p>
          </div>
          
          <BuilderCalendar
            builderProfile={profile}
            onSelectTimeSlot={handleSelectTimeSlot}
          />
        </>
      )}
    </div>
  );
}