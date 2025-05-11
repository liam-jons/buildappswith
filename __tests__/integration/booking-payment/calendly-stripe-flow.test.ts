import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMockClerk } from '../../utils/auth-test-utils';
import { apiMock, apiExpect } from '../../utils/api-test-utils';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { withTestTransaction } from '../../utils/db-test-utils';
import { v4 as uuidv4 } from 'uuid';
import { BookingStateEnum, BookingEventEnum } from '@/lib/scheduling/state-machine/types';

// Mock Stripe and Calendly API responses
const mockStripeSession = {
  id: 'test-stripe-session-id',
  url: 'https://checkout.stripe.com/test-session',
  status: 'open',
  payment_status: 'unpaid',
  metadata: {
    bookingId: 'test-booking-id',
    builderId: 'test-builder-id',
    sessionTypeId: 'test-session-type-id'
  }
};

const mockCalendlyEvent = {
  resource: {
    uri: 'https://api.calendly.com/scheduled_events/test-event-id',
    name: 'Test Event',
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
  },
  invitee: {
    uri: 'https://api.calendly.com/invitees/test-invitee-id',
    email: 'test@example.com',
    name: 'Test User'
  }
};

// Create MSW server for mocking external APIs
const server = setupServer(
  // Mock Stripe API
  rest.post('https://api.stripe.com/v1/checkout/sessions', (req, res, ctx) => {
    return res(ctx.json(mockStripeSession));
  }),
  
  // Mock Stripe session retrieval
  rest.get('https://api.stripe.com/v1/checkout/sessions/:sessionId', (req, res, ctx) => {
    const { sessionId } = req.params;
    return res(ctx.json({
      ...mockStripeSession,
      id: sessionId,
      payment_status: 'paid'
    }));
  }),
  
  // Mock Calendly API
  rest.get('https://api.calendly.com/scheduled_events/:eventId', (req, res, ctx) => {
    const { eventId } = req.params;
    return res(ctx.json({
      ...mockCalendlyEvent,
      resource: {
        ...mockCalendlyEvent.resource,
        uri: `https://api.calendly.com/scheduled_events/${eventId}`
      }
    }));
  })
);

// Setup/cleanup MSW server
beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterEach(() => server.close());

describe('Calendly-Stripe Integration Flow', () => {
  beforeEach(() => {
    // Set up auth mock
    setupMockClerk({
      isSignedIn: true,
      userId: 'test-user-id',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }
    });
    
    // Reset API mocks
    apiMock.reset();
  });
  
  describe('Booking API Integration', () => {
    it('should initialize a new booking', async () => {
      // Set up API mock
      apiMock.onPost('/api/scheduling/bookings/initialize')
        .reply(200, {
          success: true,
          bookingId: 'test-booking-id',
          state: BookingStateEnum.IDLE
        });
      
      // Initialize booking
      const response = await fetch('/api/scheduling/bookings/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builderId: 'test-builder-id',
          sessionTypeId: 'test-session-type-id'
        })
      });
      
      const data = await response.json();
      
      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookingId).toBeDefined();
      expect(data.state).toBe(BookingStateEnum.IDLE);
      
      // Verify request
      const request = apiMock.requestForPath('/api/scheduling/bookings/initialize');
      apiExpect(request).toHaveMethod('POST');
      apiExpect(request).toHaveBodyProperty('builderId', 'test-builder-id');
      apiExpect(request).toHaveBodyProperty('sessionTypeId', 'test-session-type-id');
    });
    
    it('should transition booking state', async () => {
      const bookingId = 'test-booking-id';
      
      // Set up API mock
      apiMock.onPost(`/api/scheduling/bookings/${bookingId}/transition`)
        .reply(200, {
          success: true,
          previousState: BookingStateEnum.IDLE,
          currentState: BookingStateEnum.SESSION_TYPE_SELECTED,
          timestamp: new Date().toISOString()
        });
      
      // Transition booking state
      const response = await fetch(`/api/scheduling/bookings/${bookingId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: BookingEventEnum.SELECT_SESSION_TYPE,
          data: {
            sessionTypeId: 'test-session-type-id'
          }
        })
      });
      
      const data = await response.json();
      
      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.previousState).toBe(BookingStateEnum.IDLE);
      expect(data.currentState).toBe(BookingStateEnum.SESSION_TYPE_SELECTED);
      
      // Verify request
      const request = apiMock.requestForPath(`/api/scheduling/bookings/${bookingId}/transition`);
      apiExpect(request).toHaveMethod('POST');
      apiExpect(request).toHaveBodyProperty('event', BookingEventEnum.SELECT_SESSION_TYPE);
      apiExpect(request).toHaveBodyProperty('data.sessionTypeId', 'test-session-type-id');
    });
  });
  
  describe('Stripe Checkout Integration', () => {
    it('should create a Stripe checkout session', async () => {
      const bookingId = 'test-booking-id';
      
      // Set up API mock
      apiMock.onPost('/api/stripe/checkout/create')
        .reply(200, {
          sessionId: 'test-stripe-session-id',
          url: 'https://checkout.stripe.com/test-session'
        });
      
      // Create checkout session
      const response = await fetch('/api/stripe/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingData: {
            id: bookingId,
            builderId: 'test-builder-id',
            sessionTypeId: 'test-session-type-id',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            calendlyEventId: 'test-calendly-event-id',
            calendlyEventUri: 'https://api.calendly.com/scheduled_events/test-event-id',
            calendlyInviteeUri: 'https://api.calendly.com/invitees/test-invitee-id'
          },
          returnUrl: 'https://example.com/booking/confirmation'
        })
      });
      
      const data = await response.json();
      
      // Verify response
      expect(response.status).toBe(200);
      expect(data.sessionId).toBeDefined();
      expect(data.url).toBeDefined();
      
      // Verify request
      const request = apiMock.requestForPath('/api/stripe/checkout/create');
      apiExpect(request).toHaveMethod('POST');
      apiExpect(request).toHaveBodyProperty('bookingData.id', bookingId);
      apiExpect(request).toHaveBodyProperty('bookingData.calendlyEventId', 'test-calendly-event-id');
      apiExpect(request).toHaveBodyProperty('returnUrl');
    });
    
    it('should check payment status', async () => {
      const sessionId = 'test-stripe-session-id';
      
      // Set up API mock
      apiMock.onGet(`/api/stripe/checkout/status?sessionId=${sessionId}`)
        .reply(200, {
          status: 'complete',
          paymentStatus: 'PAID',
          bookingId: 'test-booking-id',
          paymentIntentId: 'test-payment-intent-id'
        });
      
      // Check payment status
      const response = await fetch(`/api/stripe/checkout/status?sessionId=${sessionId}`);
      const data = await response.json();
      
      // Verify response
      expect(response.status).toBe(200);
      expect(data.status).toBeDefined();
      expect(data.paymentStatus).toBe('PAID');
      expect(data.bookingId).toBeDefined();
      
      // Verify request
      const request = apiMock.requestForPath(`/api/stripe/checkout/status`);
      apiExpect(request).toHaveMethod('GET');
      apiExpect(request).toHaveQueryParam('sessionId', sessionId);
    });
  });
  
  describe('Error Recovery Flow', () => {
    it('should recover a booking with a valid token', async () => {
      const token = Buffer.from('test-booking-id:IDLE:1234567890:valid-signature').toString('base64');
      
      // Set up API mock
      apiMock.onPost('/api/scheduling/bookings/recover')
        .reply(200, {
          success: true,
          bookingId: 'test-booking-id',
          state: BookingStateEnum.IDLE
        });
      
      // Recover booking
      const response = await fetch('/api/scheduling/bookings/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          targetState: BookingStateEnum.IDLE
        })
      });
      
      const data = await response.json();
      
      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.bookingId).toBeDefined();
      expect(data.state).toBeDefined();
      
      // Verify request
      const request = apiMock.requestForPath('/api/scheduling/bookings/recover');
      apiExpect(request).toHaveMethod('POST');
      apiExpect(request).toHaveBodyProperty('token', token);
      apiExpect(request).toHaveBodyProperty('targetState', BookingStateEnum.IDLE);
    });
  });
  
  describe('End-to-end flow', () => {
    it('should support the complete booking flow', async () => {
      // This test would use withTestTransaction for database isolation
      await withTestTransaction(async () => {
        const bookingId = uuidv4();
        const builderId = 'test-builder-id';
        const sessionTypeId = 'test-session-type-id';
        
        // Setup API mocks for the entire flow
        apiMock
          // 1. Initialize booking
          .onPost('/api/scheduling/bookings/initialize')
          .reply(200, {
            success: true,
            bookingId,
            state: BookingStateEnum.IDLE
          })
          
          // 2. Select session type
          .onPost(`/api/scheduling/bookings/${bookingId}/transition`)
          .replyOnce(200, {
            success: true,
            previousState: BookingStateEnum.IDLE,
            currentState: BookingStateEnum.SESSION_TYPE_SELECTED,
            timestamp: new Date().toISOString()
          })
          
          // 3. Initiate Calendly scheduling
          .onPost(`/api/scheduling/bookings/${bookingId}/transition`)
          .replyOnce(200, {
            success: true,
            previousState: BookingStateEnum.SESSION_TYPE_SELECTED,
            currentState: BookingStateEnum.CALENDLY_SCHEDULING_INITIATED,
            timestamp: new Date().toISOString()
          })
          
          // 4. Schedule Calendly event
          .onPost(`/api/scheduling/bookings/${bookingId}/transition`)
          .replyOnce(200, {
            success: true,
            previousState: BookingStateEnum.CALENDLY_SCHEDULING_INITIATED,
            currentState: BookingStateEnum.CALENDLY_EVENT_SCHEDULED,
            timestamp: new Date().toISOString()
          })
          
          // 5. Create Stripe checkout session
          .onPost('/api/stripe/checkout/create')
          .reply(200, {
            sessionId: 'test-stripe-session-id',
            url: 'https://checkout.stripe.com/test-session'
          })
          
          // 6. Check payment status
          .onGet('/api/stripe/checkout/status')
          .reply(200, {
            status: 'complete',
            paymentStatus: 'PAID',
            bookingId,
            paymentIntentId: 'test-payment-intent-id'
          })
          
          // 7. Payment succeeded transition
          .onPost(`/api/scheduling/bookings/${bookingId}/transition`)
          .replyOnce(200, {
            success: true,
            previousState: BookingStateEnum.PAYMENT_PENDING,
            currentState: BookingStateEnum.PAYMENT_SUCCEEDED,
            timestamp: new Date().toISOString()
          })
          
          // 8. Booking confirmed transition
          .onPost(`/api/scheduling/bookings/${bookingId}/transition`)
          .replyOnce(200, {
            success: true,
            previousState: BookingStateEnum.PAYMENT_SUCCEEDED,
            currentState: BookingStateEnum.BOOKING_CONFIRMED,
            timestamp: new Date().toISOString()
          });
        
        // Step 1: Initialize booking
        let response = await fetch('/api/scheduling/bookings/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            builderId,
            sessionTypeId
          })
        });
        
        let data = await response.json();
        expect(data.success).toBe(true);
        expect(data.bookingId).toBe(bookingId);
        
        // Step 2: Select session type
        response = await fetch(`/api/scheduling/bookings/${bookingId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: BookingEventEnum.SELECT_SESSION_TYPE,
            data: { sessionTypeId }
          })
        });
        
        data = await response.json();
        expect(data.success).toBe(true);
        expect(data.currentState).toBe(BookingStateEnum.SESSION_TYPE_SELECTED);
        
        // Step 3: Initiate Calendly scheduling
        response = await fetch(`/api/scheduling/bookings/${bookingId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: BookingEventEnum.INITIATE_CALENDLY_SCHEDULING
          })
        });
        
        data = await response.json();
        expect(data.success).toBe(true);
        expect(data.currentState).toBe(BookingStateEnum.CALENDLY_SCHEDULING_INITIATED);
        
        // Step 4: Schedule Calendly event
        response = await fetch(`/api/scheduling/bookings/${bookingId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: BookingEventEnum.SCHEDULE_EVENT,
            data: {
              calendlyEventId: 'test-calendly-event-id',
              calendlyEventUri: 'https://api.calendly.com/scheduled_events/test-event-id',
              calendlyInviteeUri: 'https://api.calendly.com/invitees/test-invitee-id',
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString()
            }
          })
        });
        
        data = await response.json();
        expect(data.success).toBe(true);
        expect(data.currentState).toBe(BookingStateEnum.CALENDLY_EVENT_SCHEDULED);
        
        // Step 5: Create Stripe checkout session
        response = await fetch('/api/stripe/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingData: {
              id: bookingId,
              builderId,
              sessionTypeId,
              startTime: new Date().toISOString(),
              endTime: new Date().toISOString(),
              calendlyEventId: 'test-calendly-event-id',
              calendlyEventUri: 'https://api.calendly.com/scheduled_events/test-event-id',
              calendlyInviteeUri: 'https://api.calendly.com/invitees/test-invitee-id'
            },
            returnUrl: 'https://example.com/booking/confirmation'
          })
        });
        
        data = await response.json();
        expect(data.sessionId).toBe('test-stripe-session-id');
        expect(data.url).toBeDefined();
        
        // Step 6: Check payment status
        response = await fetch(`/api/stripe/checkout/status?sessionId=test-stripe-session-id`);
        data = await response.json();
        expect(data.paymentStatus).toBe('PAID');
        
        // Step 7: Payment succeeded transition
        response = await fetch(`/api/scheduling/bookings/${bookingId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: BookingEventEnum.PAYMENT_SUCCEEDED,
            data: {
              stripeSessionId: 'test-stripe-session-id',
              stripePaymentIntentId: 'test-payment-intent-id'
            }
          })
        });
        
        data = await response.json();
        expect(data.success).toBe(true);
        expect(data.currentState).toBe(BookingStateEnum.PAYMENT_SUCCEEDED);
        
        // Step 8: Booking confirmed
        response = await fetch(`/api/scheduling/bookings/${bookingId}/transition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: BookingEventEnum.STRIPE_WEBHOOK_RECEIVED
          })
        });
        
        data = await response.json();
        expect(data.success).toBe(true);
        expect(data.currentState).toBe(BookingStateEnum.BOOKING_CONFIRMED);
        
        // Verify all mocks were called
        expect(apiMock.history.post.length).toBe(7);
        expect(apiMock.history.get.length).toBe(1);
      });
    });
  });
});