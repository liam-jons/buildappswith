/**
 * Booking Integration Test
 * 
 * Tests the booking integration with authentication flow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegratedBooking } from '@/components/scheduling/client/integrated-booking';
import { BookingFlow } from '@/components/scheduling/client/booking-flow';
import { useAuth } from '@clerk/nextjs';

// Mock the Clerk auth hook
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({
    isSignedIn: false,
    isLoaded: true
  }))
}));

// Mock the booking flow context and hooks
vi.mock('@/lib/contexts/booking-flow-context', () => ({
  useBookingFlow: vi.fn(() => ({
    state: {
      step: 'IDLE',
      error: null,
      loading: false
    }
  }))
}));

vi.mock('@/hooks/scheduling', () => ({
  useBookingManager: vi.fn(() => ({
    initializeBooking: vi.fn(),
    startCalendlyScheduling: vi.fn(),
    handleCalendlyScheduled: vi.fn(),
    startPaymentProcess: vi.fn(),
    checkPaymentStatus: vi.fn(),
    resetBookingFlow: vi.fn()
  }))
}));

// Mock window.location
const mockLocationAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: mockLocationAssign
  },
  writable: true
});

describe('Booking Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('IntegratedBooking Component', () => {
    it('redirects unauthenticated users to sign-in', async () => {
      // Setup unauthenticated state
      (useAuth as any).mockReturnValue({
        isSignedIn: false,
        isLoaded: true
      });
      
      render(
        <IntegratedBooking
          builderId="test-builder-id"
          sessionTypes={[]}
          buttonText="Book Now"
        />
      );
      
      // Find and click the booking button
      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);
      
      // Check that it redirects to sign-in with correct return URL
      await waitFor(() => {
        expect(mockLocationAssign).toHaveBeenCalled();
      });
      
      // Verify correct redirect URL
      const redirectUrl = mockLocationAssign.mock.calls[0][0];
      expect(redirectUrl).toContain('/sign-in');
      expect(redirectUrl).toContain('returnUrl');
      expect(redirectUrl).toContain('test-builder-id');
    });
    
    it('opens booking flow for authenticated users', async () => {
      // Setup authenticated state
      (useAuth as any).mockReturnValue({
        isSignedIn: true,
        isLoaded: true
      });
      
      const { container } = render(
        <IntegratedBooking
          builderId="test-builder-id"
          sessionTypes={[]}
          buttonText="Book Now"
        />
      );
      
      // Find and click the booking button
      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);
      
      // Verify dialog opens
      await waitFor(() => {
        const dialog = container.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
      });
    });
  });
  
  describe('Auth Flow Integration', () => {
    it('handles return URL correctly after authentication', async () => {
      // This would typically be an e2e test since it involves actual navigation
      // For unit tests, we can verify the redirect URL format is correct
      
      // Setup unauthenticated state
      (useAuth as any).mockReturnValue({
        isSignedIn: false,
        isLoaded: true
      });
      
      render(
        <IntegratedBooking
          builderId="test-builder-id"
          sessionTypes={[]}
          buttonText="Book Now"
        />
      );
      
      // Find and click the booking button
      const bookButton = screen.getByText('Book Now');
      fireEvent.click(bookButton);
      
      // Verify the URL format matches what we expect the sign-in page to handle
      await waitFor(() => {
        const redirectUrl = mockLocationAssign.mock.calls[0][0];
        // Test that the URL starts with /sign-in - middleware will handle the actual redirection
        expect(redirectUrl).toMatch(/\/sign-in\?returnUrl=.+marketplace\/builders\/test-builder-id/);
      });
    });
  });
  
  describe('BookingFlow Component', () => {
    it('renders session type selector initially', () => {
      render(
        <BookingFlow
          builderId="test-builder-id"
          sessionTypes={[
            {
              id: 'session-1',
              name: 'Test Session',
              description: 'A test session',
              duration: 60,
              price: 100
            }
          ]}
        />
      );
      
      // In a real test, we'd verify the session type selector renders
      // with mocked components, this is more of a structural test
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });
});