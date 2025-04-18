"use client";

import { useState, useEffect } from 'react';
import { AvailabilityManager } from '@/components/scheduling/builder/availability-manager';
import { BookingOverview } from '@/components/scheduling/builder/booking-overview';
import { mockBuilderSchedulingProfile, mockBookings } from '@/lib/scheduling/mock-data';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/magicui/border-beam';
import { TextShimmer } from '@/components/magicui/text-shimmer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ManageSchedulePageProps {
  params: {
    id: string;
  };
}

export default function ManageSchedulePage({ params }: ManageSchedulePageProps) {
  const builderId = params.id;
  const [profile, setProfile] = useState(mockBuilderSchedulingProfile);
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
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            <p className="text-muted-foreground">Loading scheduling settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href={`/builders/${builderId}`} passHref>
            <Button variant="ghost" className="flex items-center mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <TextShimmer className="text-3xl font-bold">
            Manage Your Schedule
          </TextShimmer>
          <p className="text-muted-foreground mt-1">
            Configure your availability and manage your bookings
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AvailabilityManager builderId={builderId} initialProfile={profile} />
        </div>
        
        <div>
          <BookingOverview 
            bookings={mockBookings} 
            sessionTypes={profile.sessionTypes} 
            timezone={profile.timezone}
          />
        </div>
      </div>
    </div>
  );
}