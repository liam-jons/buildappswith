/**
 * Booking Button Component
 *
 * This component handles the booking initiation process, triggering authentication
 * only at the booking stage for users viewing public profiles.
 *
 * Version: 1.1.0 - Updated with Calendly Integration
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/core/button';

export interface BookingButtonProps {
  builderId: string;
  sessionTypeId?: string;
  calendlyEventTypeId?: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  fullWidth?: boolean;
  label?: string;
  sessionTitle?: string;
}

/**
 * Button that initiates the booking process, redirecting to login if needed
 */
export function BookingButton({
  builderId,
  sessionTypeId,
  calendlyEventTypeId,
  className,
  size = 'default',
  variant = 'default',
  fullWidth = false,
  label = 'Book a Session',
}: BookingButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBooking = () => {
    setIsLoading(true);

    // Build the booking URL with the builder ID and optional session type
    let bookingUrl = `/book/${builderId}`;

    // Add query parameters for session type and Calendly integration
    const params = new URLSearchParams();

    if (sessionTypeId) {
      params.append('sessionTypeId', sessionTypeId);
    }

    if (calendlyEventTypeId) {
      params.append('calendlyEventTypeId', calendlyEventTypeId);
    }

    // Append query parameters if any exist
    const queryString = params.toString();
    if (queryString) {
      bookingUrl += `?${queryString}`;
    }

    if (!isSignedIn) {
      // For unauthenticated users, redirect to login with return URL to booking
      const returnUrl = encodeURIComponent(bookingUrl);
      router.push(`/login?returnUrl=${returnUrl}`);
    } else {
      // For authenticated users, proceed directly to booking
      router.push(bookingUrl);
    }
  };
  
  // Show loading state while auth is being checked
  if (!isLoaded) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
        data-testid="booking-button-loading"
      >
        Loading...
      </Button>
    );
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleBooking}
      disabled={isLoading}
      data-testid="booking-button"
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {isLoading ? 'Loading...' : label}
    </Button>
  );
}

/**
 * Pre-configured button for booking a specific session type
 */
export function SessionBookingButton({
  sessionTypeId,
  builderId,
  sessionTitle,
  ...props
}: BookingButtonProps) {
  return (
    <BookingButton
      builderId={builderId}
      sessionTypeId={sessionTypeId}
      label={`Book ${sessionTitle || 'this session'}`}
      {...props}
    />
  );
}
