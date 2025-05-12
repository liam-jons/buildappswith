'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/core/dialog';
import { Button } from '@/components/ui/core/button';
import { BookingFlow } from '@/components/scheduling/client/booking-flow';
import { CalendlyEmbed } from '@/components/scheduling/calendly/calendly-embed';
import { X } from 'lucide-react';
import { SessionType } from '@/lib/scheduling/types';

interface IntegratedBookingProps {
  builderId: string;
  sessionTypes: SessionType[];
  initialSessionTypeId?: string;
  className?: string;
  buttonText?: string;
  children?: React.ReactNode;
}

/**
 * IntegratedBooking Component
 * 
 * A unified booking component that can be embedded directly into builder profiles.
 * Handles authentication checks, booking flow integration, and UI state.
 */
export function IntegratedBooking({
  builderId,
  sessionTypes = [],
  initialSessionTypeId,
  className,
  buttonText = "Book a Session",
  children
}: IntegratedBookingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  // Handle booking button click
  const handleBookingClick = () => {
    if (!isLoaded) return; // Wait until auth is loaded

    if (!isSignedIn) {
      // Redirect to sign-in with return URL
      const returnUrl = `/marketplace/builders/${builderId}`;
      // Use the original URL format - middleware will handle the redirection
      window.location.href = `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`;
      return;
    }

    setIsOpen(true);
  };

  // Close booking dialog
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="default"
        onClick={handleBookingClick}
        className={cn("gap-1.5", className)}
        disabled={!isLoaded}
      >
        {children || buttonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Book a Session</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          
          <div className="py-4">
            <BookingFlow
              builderId={builderId}
              sessionTypes={sessionTypes}
              preselectedSessionTypeId={initialSessionTypeId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}