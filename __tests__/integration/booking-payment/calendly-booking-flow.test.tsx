/**
 * Integration tests for Calendly booking flow
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, render } from '@testing-library/react';
import { renderWithAuth } from '../../utils/auth-test-utils';
import { apiMock } from '../../utils/api-test-utils';
import { mockFactory } from '../../utils/mock-builders';
import { CalendlySessionTypeList } from '@/components/scheduling/calendly/calendly-session-type-list';
import { BookingConfirmation } from '@/components/scheduling/calendly/booking-confirmation';
import userEvent from '@testing-library/user-event';
import { mockCalendlyEventTypes, mappedCalendlyEventTypes } from '../../mocks/scheduling/mock-calendly-data';
import { mockServer } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Calendly Booking Flow Integration', () => {
  const mockBuilder = mockFactory.builder();
  
  beforeEach(() => {
    // Reset handlers
    mockServer.resetHandlers();
    
    // Set up API mocks
    apiMock.get('/api/scheduling/calendly/event-types', { eventTypes: mappedCalendlyEventTypes });
    
    // Mock scheduling link creation
    apiMock.post('/api/scheduling/calendly/scheduling-link', {
      bookingUrl: 'https://calendly.com/test-builder/initial-consultation?utm_source=buildappswith&session_type_id=session-1',
      eventTypeId: mockCalendlyEventTypes.collection[0].uri.split('/').pop(),
      sessionTypeId: 'session-1'
    });
  });
  
  afterEach(() => {
    apiMock.reset();
  });
  
  it('renders session types from Calendly API', async () => {
    // Render the component
    renderWithAuth(
      <CalendlySessionTypeList builderId={mockBuilder.id} />,
      { userType: 'client' }
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading available session types...')).not.toBeInTheDocument();
    });
    
    // Verify session types are displayed
    expect(screen.getByText(mappedCalendlyEventTypes[0].title)).toBeInTheDocument();
    expect(screen.getByText(mappedCalendlyEventTypes[1].title)).toBeInTheDocument();
    
    // Verify session durations are displayed
    expect(screen.getByText(`${mappedCalendlyEventTypes[0].durationMinutes} minutes`)).toBeInTheDocument();
    expect(screen.getByText(`${mappedCalendlyEventTypes[1].durationMinutes} minutes`)).toBeInTheDocument();
    
    // Verify prices are displayed
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText(`$${mappedCalendlyEventTypes[1].price.toFixed(2)}`)).toBeInTheDocument();
  });
  
  it('handles API errors gracefully', async () => {
    // Mock an error response
    apiMock.get('/api/scheduling/calendly/event-types', { error: 'Failed to load session types' }, 500);
    
    // Render the component
    renderWithAuth(
      <CalendlySessionTypeList builderId={mockBuilder.id} />,
      { userType: 'client' }
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading available session types...')).not.toBeInTheDocument();
    });
    
    // Verify error message is shown
    expect(screen.getByText('Error loading session types')).toBeInTheDocument();
    expect(screen.getByText('Unable to load session types from Calendly')).toBeInTheDocument();
    
    // Verify retry button exists
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
  
  it('handles empty session types list', async () => {
    // Mock an empty response
    apiMock.get('/api/scheduling/calendly/event-types', { eventTypes: [] });
    
    // Render the component
    renderWithAuth(
      <CalendlySessionTypeList builderId={mockBuilder.id} />,
      { userType: 'client' }
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading available session types...')).not.toBeInTheDocument();
    });
    
    // Verify empty state message
    expect(screen.getByText('No session types available for this builder.')).toBeInTheDocument();
  });
  
  it('displays booking confirmation and allows proceeding to payment', async () => {
    // Create mock booking data
    const mockBooking = {
      id: 'booking-123',
      builderId: mockBuilder.id,
      clientId: 'client-123',
      sessionTypeId: 'session-1',
      title: 'Initial Consultation',
      description: 'A brief intro call to discuss your project needs',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      calendlyEventId: 'evt-123',
      calendlyEventUri: 'https://api.calendly.com/scheduled_events/evt-123',
      calendlyInviteeUri: 'https://api.calendly.com/scheduled_events/evt-123/invitees/inv-123',
      clientTimezone: 'America/New_York'
    };
    
    const mockSessionType = mappedCalendlyEventTypes[0];
    
    // Mock payment creation
    const mockProceedToPayment = vi.fn();
    const mockCancel = vi.fn();
    
    // Render the component
    render(
      <BookingConfirmation
        booking={mockBooking}
        sessionType={mockSessionType}
        onProceedToPayment={mockProceedToPayment}
        onCancel={mockCancel}
      />
    );
    
    // Verify booking details are displayed
    expect(screen.getByText('Booking Confirmation')).toBeInTheDocument();
    expect(screen.getByText(mockBooking.title)).toBeInTheDocument();
    expect(screen.getByText(`${mockSessionType.durationMinutes} minutes`)).toBeInTheDocument();
    
    // Click proceed to payment button
    const user = userEvent.setup();
    await user.click(screen.getByText('Proceed to Payment'));
    
    // Verify payment function was called
    expect(mockProceedToPayment).toHaveBeenCalledTimes(1);
    
    // Test cancel button
    await user.click(screen.getByText('Cancel'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
  
  it('disables payment button when booking reservation expires', async () => {
    // Create mock booking with expired time
    const mockBooking = {
      id: 'booking-123',
      builderId: mockBuilder.id,
      clientId: 'client-123',
      sessionTypeId: 'session-1',
      title: 'Initial Consultation',
      description: 'A brief intro call to discuss your project needs',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      status: 'PENDING',
      paymentStatus: 'UNPAID'
    };
    
    const mockSessionType = mappedCalendlyEventTypes[0];
    
    // Mock functions
    const mockProceedToPayment = vi.fn();
    const mockCancel = vi.fn();
    
    // Render the component
    render(
      <BookingConfirmation
        booking={mockBooking}
        sessionType={mockSessionType}
        onProceedToPayment={mockProceedToPayment}
        onCancel={mockCancel}
        isPending={false}
        error="Booking Expired"
      />
    );
    
    // Verify error message is displayed
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Booking Expired')).toBeInTheDocument();
    
    // Button should be disabled
    expect(screen.getByText('Proceed to Payment')).toBeDisabled();
  });
});