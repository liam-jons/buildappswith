'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/core/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/core/sonner';
import { useRouter } from 'next/navigation';

interface CheckoutButtonProps {
  bookingData: {
    id?: string;
    builderId: string;
    sessionTypeId: string;
    startTime: string;
    endTime: string;
    clientId?: string;
    clientTimezone?: string;
    // Calendly fields
    calendlyEventId?: string;
    calendlyEventUri?: string;
    calendlyInviteeUri?: string;
  };
  returnUrl: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}

/**
 * Checkout button that initiates the Stripe checkout flow
 * 
 * This component handles the API call to create a checkout session
 * and redirects the user to Stripe's hosted checkout page.
 */
export function CheckoutButton({
  bookingData,
  returnUrl,
  children = 'Proceed to Payment',
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
}: CheckoutButtonProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingData,
          returnUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}