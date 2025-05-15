'use client';

import React, { useState } from 'react';
import { CalendlyCalendar } from '@/components/scheduling/calendly/calendly-calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { format } from 'date-fns';

export default function CalendlyApiTestPage() {
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: Date;
    endTime: Date;
    schedulingUrl: string;
  } | null>(null);

  // Test with a known event type URI - you'll need to replace this with an actual one
  const eventTypeUri = 'https://api.calendly.com/event_types/YOUR_EVENT_TYPE_ID';
  
  // Mock session type data
  const sessionType = {
    title: 'Getting Started - Businesses',
    duration: 30,
    price: 0
  };

  const handleSelectTimeSlot = (slot: {
    startTime: Date;
    endTime: Date;
    schedulingUrl: string;
  }) => {
    setSelectedSlot(slot);
  };

  const handleBooking = () => {
    if (selectedSlot) {
      // In a real implementation, you would create a booking here
      // For now, we'll just log the selected slot
      console.log('Selected slot:', selectedSlot);
      
      // You could also redirect to the Calendly scheduling URL
      // window.open(selectedSlot.schedulingUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Calendly API Integration Test</h1>
      
      <div className="mb-8">
        <CalendlyCalendar
          eventTypeUri={eventTypeUri}
          sessionType={sessionType}
          onSelectTimeSlot={handleSelectTimeSlot}
        />
      </div>

      {selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Time Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Date:</strong> {format(selectedSlot.startTime, 'MMMM d, yyyy')}
              </p>
              <p>
                <strong>Time:</strong> {format(selectedSlot.startTime, 'h:mm a')} - {format(selectedSlot.endTime, 'h:mm a')}
              </p>
              <p>
                <strong>Session:</strong> {sessionType.title}
              </p>
              <p>
                <strong>Duration:</strong> {sessionType.duration} minutes
              </p>
              <p>
                <strong>Price:</strong> ${sessionType.price}
              </p>
            </div>
            
            <div className="mt-6 flex gap-4">
              <Button onClick={handleBooking}>
                Confirm Booking
              </Button>
              <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                Select Different Time
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-muted rounded-md">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Replace the eventTypeUri with an actual Calendly event type URI</li>
          <li>The calendar will fetch available dates for the next 7 days</li>
          <li>Click on a date to see available time slots</li>
          <li>Click on a time slot to select it</li>
          <li>The booking flow can be customized based on your needs</li>
        </ol>
        
        <p className="mt-4 text-sm text-muted-foreground">
          Note: You need valid Calendly API credentials in your environment variables for this to work.
        </p>
      </div>
    </div>
  );
}