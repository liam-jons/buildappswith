/**
 * Mock handlers for Calendly API endpoints
 */
import { http, HttpResponse } from 'msw';
import crypto from 'crypto';
import { 
  mockCalendlyUser, 
  mockCalendlyOrganization, 
  mockCalendlyEventTypes,
  mockCalendlyEventType,
  createMockCalendlyEvent,
  createMockCalendlyInvitee,
  createMockSchedulingLink,
  mappedCalendlyEventTypes
} from './mock-calendly-data';

// Webhook signing secret for testing
export const MOCK_WEBHOOK_SECRET = 'whsec_mock_secret_for_testing';

/**
 * Generate a mock webhook signature
 * 
 * @param body Request body as string
 * @param secret Webhook signing secret
 * @returns Signature string
 */
export function generateMockSignature(body: string, secret: string = MOCK_WEBHOOK_SECRET): string {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(body).digest('hex');
}

export const mockCalendlyHandlers = [
  // Calendly internal API endpoints
  
  // Get current user
  http.get('https://api.calendly.com/users/me', () => {
    return HttpResponse.json(mockCalendlyUser);
  }),
  
  // Get organization
  http.get('https://api.calendly.com/organizations/*', () => {
    return HttpResponse.json(mockCalendlyOrganization);
  }),
  
  // Get event types
  http.get('https://api.calendly.com/event_types', ({ request }) => {
    const url = new URL(request.url);
    const count = url.searchParams.get('count');
    const userUri = url.searchParams.get('user');
    
    // Filter by user if specified
    if (userUri && !userUri.includes(mockCalendlyUser.resource.uri)) {
      return HttpResponse.json({
        collection: [],
        pagination: {
          count: 0,
          next_page: null,
          next_page_token: null,
          previous_page: null,
          previous_page_token: null
        }
      });
    }
    
    return HttpResponse.json(mockCalendlyEventTypes);
  }),
  
  // Get specific event type
  http.get('https://api.calendly.com/event_types/:uuid', ({ params }) => {
    const { uuid } = params;
    
    // Find matching event type
    const eventType = mockCalendlyEventTypes.collection.find(
      et => et.uri.includes(uuid as string)
    );
    
    if (!eventType) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({ resource: eventType });
  }),
  
  // Get scheduled events
  http.get('https://api.calendly.com/scheduled_events', ({ request }) => {
    const url = new URL(request.url);
    const userUri = url.searchParams.get('user');
    const status = url.searchParams.get('status');
    
    // Generate mock events
    const events = [
      createMockCalendlyEvent(),
      createMockCalendlyEvent({
        start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      })
    ];
    
    // Filter by user if specified
    const filteredEvents = userUri 
      ? events.filter(event => 
          event.event_memberships.some(membership => 
            membership.user === userUri
          )
        ) 
      : events;
    
    // Filter by status if specified
    const statusFilteredEvents = status
      ? filteredEvents.filter(event => event.status === status)
      : filteredEvents;
    
    return HttpResponse.json({
      collection: statusFilteredEvents,
      pagination: {
        count: statusFilteredEvents.length,
        next_page: null,
        next_page_token: null,
        previous_page: null,
        previous_page_token: null
      }
    });
  }),
  
  // Get specific scheduled event
  http.get('https://api.calendly.com/scheduled_events/:uuid', ({ params }) => {
    const { uuid } = params;
    const event = createMockCalendlyEvent({ uuid });
    
    return HttpResponse.json({ resource: event });
  }),
  
  // Get invitees for an event
  http.get('https://api.calendly.com/scheduled_events/:eventId/invitees', ({ params }) => {
    const { eventId } = params;
    const invitee = createMockCalendlyInvitee(eventId as string);
    
    return HttpResponse.json({
      collection: [invitee],
      pagination: {
        count: 1,
        next_page: null,
        next_page_token: null,
        previous_page: null,
        previous_page_token: null
      }
    });
  }),
  
  // Our internal API endpoints
  
  // Get event types
  http.get('/api/scheduling/calendly/event-types', () => {
    return HttpResponse.json({ eventTypes: mappedCalendlyEventTypes });
  }),
  
  // Create scheduling link
  http.post('/api/scheduling/calendly/scheduling-link', async ({ request }) => {
    const body = await request.json();
    const { eventTypeId, sessionTypeId } = body;
    
    const schedulingLink = createMockSchedulingLink({
      eventTypeId,
      sessionTypeId
    });
    
    return HttpResponse.json(schedulingLink);
  }),
  
  // Process webhook
  http.post('/api/webhooks/calendly', async ({ request }) => {
    try {
      // Check for webhook signature
      const signature = request.headers.get('calendly-webhook-signature');
      if (!signature) {
        return new HttpResponse(
          JSON.stringify({ error: 'Missing webhook signature' }),
          { status: 401 }
        );
      }
      
      // Get the raw request body
      const rawBody = await request.text();
      
      // Verify signature
      const expectedSignature = generateMockSignature(rawBody);
      if (signature !== expectedSignature) {
        return new HttpResponse(
          JSON.stringify({ error: 'Invalid webhook signature', code: 'invalid_signature' }),
          { status: 401 }
        );
      }
      
      // Parse the request body
      const payload = JSON.parse(rawBody);
      
      // Return successful response
      return HttpResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        event: payload.event
      });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ error: 'Error processing webhook' }),
        { status: 500 }
      );
    }
  })
];