/**
 * Test utilities for Calendly integration testing
 */
import { mockServer } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { 
  mockCalendlyEventTypes, 
  createMockCalendlyEvent, 
  createMockCalendlyInvitee,
  createMockWebhookPayload
} from '../mocks/scheduling/mock-calendly-data';
import { generateMockSignature, MOCK_WEBHOOK_SECRET } from '../mocks/scheduling/calendly-handlers';
import fetch from 'node-fetch';

/**
 * Calendly test utilities
 */
export const calendlyTestUtils = {
  /**
   * Mock a specific event type response
   * 
   * @param eventTypeId Event type ID to mock
   * @param status HTTP status code to return
   * @param responseData Optional custom response data
   */
  mockEventType: (eventTypeId: string, status = 200, responseData?: any) => {
    // Find the requested event type or use the first one as default
    const eventType = mockCalendlyEventTypes.collection.find(
      et => et.uri.includes(eventTypeId)
    ) || mockCalendlyEventTypes.collection[0];
    
    mockServer.use(
      http.get(`https://api.calendly.com/event_types/${eventTypeId}`, () => {
        return HttpResponse.json(
          responseData || { resource: eventType },
          { status }
        );
      })
    );
  },
  
  /**
   * Mock an authentication error response
   */
  mockAuthError: () => {
    mockServer.use(
      http.get('https://api.calendly.com/users/me', () => {
        return new HttpResponse(
          JSON.stringify({
            message: 'Invalid authorization token',
            title: 'Unauthorized'
          }),
          { status: 401, statusText: 'Unauthorized' }
        );
      })
    );
  },
  
  /**
   * Create a mock booking event in Calendly
   * 
   * @param eventTypeId Event type ID to use
   * @returns Mock event data
   */
  createBookingEvent: (eventTypeId: string) => {
    const eventType = mockCalendlyEventTypes.collection.find(
      et => et.uri.includes(eventTypeId)
    ) || mockCalendlyEventTypes.collection[0];
    
    const event = createMockCalendlyEvent({
      event_type: eventType.uri
    });
    
    const invitee = createMockCalendlyInvitee(event.uri.split('/').pop() || '');
    
    return { event, invitee };
  },
  
  /**
   * Send a mock webhook to the specified endpoint
   * 
   * @param url Webhook endpoint URL
   * @param eventType Webhook event type
   * @param data Additional data for the webhook payload
   * @param useValidSignature Whether to use a valid signature
   * @returns Response from the webhook endpoint
   */
  sendMockWebhook: async (
    url: string,
    eventType: 'invitee.created' | 'invitee.canceled' | 'invitee.rescheduled',
    data: Record<string, any> = {},
    useValidSignature = true
  ) => {
    // Create the webhook payload
    const webhookPayload = createMockWebhookPayload(
      eventType,
      data.eventId,
      data.inviteeId,
      data
    );
    
    // Convert to string for signature generation
    const body = JSON.stringify(webhookPayload);
    
    // Generate signature
    const signature = useValidSignature 
      ? generateMockSignature(body, MOCK_WEBHOOK_SECRET)
      : 'invalid_signature';
    
    // Send the webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Calendly-Webhook-Signature': signature
      },
      body
    });
    
    return response;
  },
  
  /**
   * Mock a specific booking confirmation
   * 
   * @param bookingId Booking ID to confirm
   * @param eventId Calendly event ID
   * @param inviteeId Calendly invitee ID
   * @returns Mock confirmation data
   */
  mockBookingConfirmation: (bookingId: string, eventId: string, inviteeId: string) => {
    const event = createMockCalendlyEvent({
      uuid: eventId
    });
    
    const invitee = createMockCalendlyInvitee(eventId, {
      uuid: inviteeId,
      tracking: {
        utm_source: 'buildappswith',
        utm_medium: 'scheduling',
        utm_campaign: 'booking',
        utm_content: `booking_id=${bookingId}`
      }
    });
    
    return { event, invitee };
  },
  
  /**
   * Mock event types response
   * 
   * @param responseData Custom response data
   * @param status HTTP status code
   */
  mockEventTypes: (responseData?: any, status = 200) => {
    mockServer.use(
      http.get('/api/scheduling/calendly/event-types', () => {
        return HttpResponse.json(
          responseData || { eventTypes: mockCalendlyEventTypes.collection },
          { status }
        );
      })
    );
  },
  
  /**
   * Reset all custom handlers
   */
  reset: () => {
    mockServer.resetHandlers();
  }
};