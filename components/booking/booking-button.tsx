/**
 * Booking Button Component
 * 
 * This component handles the booking initiation process, triggering authentication
 * only at the booking stage for users viewing public profiles.
 * 
 * Version: 1.0.0
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/core/button';

interface BookingButtonProps {
  builderId: string;
  sessionTypeId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'primary' | 'secondary';
  fullWidth?: boolean;
  label?: string;
}

/**
 * Button that initiates the booking process, redirecting to login if needed
 */
export function BookingButton({
  builderId,
  sessionTypeId,
  className,
  size = 'md',
  variant = 'primary',
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
    if (sessionTypeId) {
      bookingUrl += `?sessionTypeId=${sessionTypeId}`;
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
}: BookingButtonProps & { sessionTitle?: string }) {
  return (
    <BookingButton
      builderId={builderId}
      sessionTypeId={sessionTypeId}
      label={`Book ${sessionTitle || 'this session'}`}
      {...props}
    />
  );
}
