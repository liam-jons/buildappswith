'use client';

import { useState, useEffect } from 'react';
import { AvailabilityManager } from '@/components/scheduling/builder/availability-manager';
import { BookingOverview } from '@/components/scheduling/builder/booking-overview';
import { BuilderSchedulingProfile, Booking, SessionType } from '@/lib/scheduling/types';

interface AvailabilityManagerClientProps {
  builderId: string;
  initialProfile: BuilderSchedulingProfile;
}

export function AvailabilityManagerClient({ builderId, initialProfile }: AvailabilityManagerClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading profile data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <p className="text-muted-foreground">Loading scheduling settings...</p>
        </div>
      </div>
    );
  }
  
  return <AvailabilityManager builderId={builderId} initialProfile={profile} />;
}

interface BookingOverviewClientProps {
  bookings: Booking[];
  sessionTypes: SessionType[];
  timezone: string;
}

export function BookingOverviewClient({ bookings, sessionTypes, timezone }: BookingOverviewClientProps) {
  return (
    <BookingOverview 
      bookings={bookings} 
      sessionTypes={sessionTypes} 
      timezone={timezone}
    />
  );
}
