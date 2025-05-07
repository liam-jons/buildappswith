'use client';

import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe only once (outside the component)
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise && typeof window !== 'undefined') {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

interface StripeProviderProps {
  children: React.ReactNode;
}

/**
 * StripeProvider component
 * 
 * Provides Stripe Elements context to payment components.
 * This should wrap any component that uses Stripe Elements.
 */
export function StripeProvider({ children }: StripeProviderProps) {
  // Default configuration options for Stripe Elements
  const options = {
    mode: 'payment',
    currency: 'usd',
    appearance: {
      theme: 'stripe',
      labels: 'floating',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      {children}
    </Elements>
  );
}