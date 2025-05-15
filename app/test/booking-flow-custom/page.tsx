'use client';

import React from 'react';
import { BookingFlow } from '@/components/scheduling/client/booking-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/core/card';

// Mock session types for testing
const mockSessionTypes = [
  {
    id: '1',
    builderId: '1',
    title: 'Getting Started - Businesses',
    description: 'A free 30-minute session for businesses',
    durationMinutes: 30,
    price: 0,
    currency: 'USD',
    isActive: true,
    calendlyEventTypeId: 'YOUR_EVENT_TYPE_ID_HERE', // Replace with actual ID
    calendlyEventTypeUri: '/getting-started-businesses',
    requiresAuth: false,
    eventTypeCategory: 'free'
  },
  {
    id: '2',
    builderId: '1',
    title: 'Growth Strategy Session',
    description: 'A 60-minute paid session',
    durationMinutes: 60,
    price: 49,
    currency: 'USD',
    isActive: true,
    calendlyEventTypeId: 'YOUR_EVENT_TYPE_ID_HERE', // Replace with actual ID
    calendlyEventTypeUri: '/growth-strategy-session',
    requiresAuth: true,
    eventTypeCategory: 'pathway'
  }
];

export default function BookingFlowCustomTestPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Custom Booking Flow Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• This uses the custom CalendlyCalendar component (no iframe)</p>
            <p>• Fetches available times via Calendly API</p>
            <p>• Provides a native UI that matches our design system</p>
            <p>• No more full Calendly site loading in the iframe!</p>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-md">
            <p className="text-amber-900 font-semibold">Important:</p>
            <p className="text-amber-800">
              You need to update the calendlyEventTypeId in the session types 
              with actual IDs from your Calendly account.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="border rounded-lg p-6">
        <BookingFlow 
          builderId="1"
          sessionTypes={mockSessionTypes}
        />
      </div>
    </div>
  );
}