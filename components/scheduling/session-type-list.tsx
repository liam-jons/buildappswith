'use client';

import React from 'react';
import { BookingButton } from '@/components/booking/booking-button';
import { Card, CardContent } from '@/components/ui/core/card';
import { Clock } from 'lucide-react';

interface SessionType {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
}

interface SessionTypeListProps {
  sessions: SessionType[];
  builderId: string;
  showBookingButtons?: boolean;
}

/**
 * Temporary component to display session types 
 * Will be replaced with full Calendly integration in future
 */
export function SessionTypeList({ 
  sessions, 
  builderId, 
  showBookingButtons = true 
}: SessionTypeListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No session types available for this builder.</p>
        <p className="text-sm mt-2">Try contacting them directly for booking options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center p-6">
              <div className="flex-grow">
                <h4 className="font-medium text-base">{session.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{session.description}</p>
                
                <div className="flex mt-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {session.duration} minutes
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">${session.price}</p>
                {showBookingButtons && (
                  <div className="mt-2">
                    <BookingButton 
                      builderId={builderId} 
                      sessionTypeId={session.id}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Looking for a custom session? Contact the builder directly.</p>
        <p className="mt-1 text-xs">Note: Calendly integration coming soon.</p>
      </div>
    </div>
  );
}