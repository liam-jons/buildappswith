'use client';

import React from 'react';
import { CalendlyEmbedOptimized } from '@/components/scheduling/calendly/calendly-embed-optimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/core/card';

export default function CalendlyOptimizedTestPage() {
  const handleEventScheduled = (event: any) => {
    console.log('Event scheduled:', event);
    // Handle the booking confirmation here
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Optimized Calendly Embed Test</h1>
      
      <div className="mb-8">
        <CalendlyEmbedOptimized
          url="/getting-started-businesses"
          prefill={{
            name: "Test User",
            email: "test@example.com",
            timezone: "America/New_York"
          }}
          utm={{
            utmSource: "test-page",
            utmMedium: "embed",
            utmCampaign: "optimization-test"
          }}
          height="650px"
          onEventScheduled={handleEventScheduled}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• This optimized embed ensures only the widget is shown (not the full Calendly site)</p>
            <p>• Custom styling parameters match our design system</p>
            <p>• Proper error handling and loading states</p>
            <p>• Event scheduling callbacks for post-booking actions</p>
            <p>• Responsive height and width management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}