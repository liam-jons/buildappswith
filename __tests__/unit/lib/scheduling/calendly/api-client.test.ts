/**
 * Unit tests for the Calendly API client
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockServer } from '../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { 
  CalendlyApiClient, 
  CalendlyApiError,
  getCalendlyApiClient 
} from '@/lib/scheduling/calendly/api-client';
import { 
  mockCalendlyUser,
  mockCalendlyEventTypes,
  createMockCalendlyEvent
} from '../../../../mocks/scheduling/mock-calendly-data';

describe('CalendlyApiClient', () => {
  let apiClient: CalendlyApiClient;
  
  beforeEach(() => {
    // Reset mock server handlers
    mockServer.resetHandlers();
    // Create a new instance for each test
    apiClient = new CalendlyApiClient();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('getCurrentUser', () => {
    it('should fetch and return the current user', async () => {
      // Mock the users/me endpoint
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.json(mockCalendlyUser);
        })
      );
      
      const user = await apiClient.getCurrentUser();
      
      expect(user).toEqual(mockCalendlyUser);
      expect(user.resource.email).toEqual(mockCalendlyUser.resource.email);
    });
    
    it('should handle authentication errors', async () => {
      // Mock a 401 response
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
      
      await expect(apiClient.getCurrentUser()).rejects.toThrow(CalendlyApiError);
      await expect(apiClient.getCurrentUser()).rejects.toMatchObject({
        isAuthError: true,
        statusCode: 401
      });
    });
    
    it('should handle network errors', async () => {
      // Mock a network error
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.error();
        })
      );
      
      await expect(apiClient.getCurrentUser()).rejects.toThrow(CalendlyApiError);
    });
  });
  
  describe('getEventTypes', () => {
    it('should fetch and return event types', async () => {
      // Mock the users/me endpoint for the current user
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.json(mockCalendlyUser);
        })
      );
      
      // Mock the event_types endpoint
      mockServer.use(
        http.get('https://api.calendly.com/event_types', () => {
          return HttpResponse.json(mockCalendlyEventTypes);
        })
      );
      
      const result = await apiClient.getEventTypes();
      
      expect(result).toEqual(mockCalendlyEventTypes);
      expect(result.collection.length).toEqual(mockCalendlyEventTypes.collection.length);
      
      // Check that it has the expected properties
      const firstEventType = result.collection[0];
      expect(firstEventType).toHaveProperty('name');
      expect(firstEventType).toHaveProperty('duration');
      expect(firstEventType).toHaveProperty('scheduling_url');
    });
    
    it('should pass the correct query parameters', async () => {
      // Mock the users/me endpoint
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.json(mockCalendlyUser);
        })
      );
      
      // Set up a spy to verify the query parameters
      let capturedUrl: URL | undefined;
      
      mockServer.use(
        http.get('https://api.calendly.com/event_types', ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(mockCalendlyEventTypes);
        })
      );
      
      // Call with options to test parameter passing
      await apiClient.getEventTypes({
        count: 10,
        pageToken: 'test-page-token',
        sort: 'name:asc'
      });
      
      // Verify the query parameters
      expect(capturedUrl).toBeDefined();
      expect(capturedUrl?.searchParams.get('count')).toEqual('10');
      expect(capturedUrl?.searchParams.get('page_token')).toEqual('test-page-token');
      expect(capturedUrl?.searchParams.get('sort')).toEqual('name:asc');
    });
    
    it('should filter by user URI when provided', async () => {
      const userUri = 'https://api.calendly.com/users/test-user-id';
      
      // Set up a spy to verify the query parameters
      let capturedUrl: URL | undefined;
      
      mockServer.use(
        http.get('https://api.calendly.com/event_types', ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(mockCalendlyEventTypes);
        })
      );
      
      // Call with user URI
      await apiClient.getEventTypes({ userUri });
      
      // Verify the user parameter
      expect(capturedUrl).toBeDefined();
      expect(capturedUrl?.searchParams.get('user')).toEqual(userUri);
    });
  });
  
  describe('getEventType', () => {
    it('should fetch and return a specific event type', async () => {
      const eventTypeId = mockCalendlyEventTypes.collection[0].uri.split('/').pop() || '';
      
      // Mock the event_types/:id endpoint
      mockServer.use(
        http.get(`https://api.calendly.com/event_types/${eventTypeId}`, () => {
          return HttpResponse.json({
            resource: mockCalendlyEventTypes.collection[0]
          });
        })
      );
      
      const result = await apiClient.getEventType(eventTypeId);
      
      expect(result.resource).toEqual(mockCalendlyEventTypes.collection[0]);
      expect(result.resource.name).toEqual(mockCalendlyEventTypes.collection[0].name);
      expect(result.resource.duration).toEqual(mockCalendlyEventTypes.collection[0].duration);
    });
    
    it('should handle a full URI as input', async () => {
      const eventTypeUri = mockCalendlyEventTypes.collection[0].uri;
      const eventTypeId = eventTypeUri.split('/').pop() || '';
      
      // Set up a spy to verify the endpoint called
      let capturedUrl: string | undefined;
      
      mockServer.use(
        http.get('*', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({
            resource: mockCalendlyEventTypes.collection[0]
          });
        })
      );
      
      await apiClient.getEventType(eventTypeUri);
      
      // Verify the correct endpoint was called with the ID extracted from the URI
      expect(capturedUrl).toContain(`/event_types/${eventTypeId}`);
    });
  });
  
  describe('getEvents', () => {
    it('should fetch and return scheduled events', async () => {
      // Mock the users/me endpoint for the current user
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.json(mockCalendlyUser);
        })
      );
      
      // Create mock events
      const mockEvents = {
        collection: [
          createMockCalendlyEvent(),
          createMockCalendlyEvent()
        ],
        pagination: {
          count: 2,
          next_page: null,
          next_page_token: null,
          previous_page: null,
          previous_page_token: null
        }
      };
      
      // Mock the scheduled_events endpoint
      mockServer.use(
        http.get('https://api.calendly.com/scheduled_events', () => {
          return HttpResponse.json(mockEvents);
        })
      );
      
      const result = await apiClient.getEvents();
      
      expect(result).toEqual(mockEvents);
      expect(result.collection.length).toEqual(2);
      
      // Check that it has the expected properties
      const firstEvent = result.collection[0];
      expect(firstEvent).toHaveProperty('start_time');
      expect(firstEvent).toHaveProperty('end_time');
      expect(firstEvent).toHaveProperty('name');
    });
    
    it('should pass filtering parameters correctly', async () => {
      // Mock the users/me endpoint
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.json(mockCalendlyUser);
        })
      );
      
      // Set up a spy to verify the query parameters
      let capturedUrl: URL | undefined;
      
      mockServer.use(
        http.get('https://api.calendly.com/scheduled_events', ({ request }) => {
          capturedUrl = new URL(request.url);
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
        })
      );
      
      // Call with filtering options
      const minStartTime = '2023-01-01T00:00:00Z';
      const maxStartTime = '2023-12-31T23:59:59Z';
      
      await apiClient.getEvents({
        minStartTime,
        maxStartTime,
        status: 'active'
      });
      
      // Verify the query parameters
      expect(capturedUrl).toBeDefined();
      expect(capturedUrl?.searchParams.get('min_start_time')).toEqual(minStartTime);
      expect(capturedUrl?.searchParams.get('max_start_time')).toEqual(maxStartTime);
      expect(capturedUrl?.searchParams.get('status')).toEqual('active');
    });
  });
  
  describe('getEvent', () => {
    it('should fetch and return a specific event', async () => {
      const mockEvent = createMockCalendlyEvent();
      const eventId = mockEvent.uri.split('/').pop() || '';
      
      // Mock the scheduled_events/:id endpoint
      mockServer.use(
        http.get(`https://api.calendly.com/scheduled_events/${eventId}`, () => {
          return HttpResponse.json({
            resource: mockEvent
          });
        })
      );
      
      const result = await apiClient.getEvent(eventId);
      
      expect(result.resource).toEqual(mockEvent);
      expect(result.resource.start_time).toEqual(mockEvent.start_time);
      expect(result.resource.end_time).toEqual(mockEvent.end_time);
    });
  });
  
  describe('singleton instance', () => {
    it('should return the same instance when getCalendlyApiClient is called multiple times', () => {
      const instance1 = getCalendlyApiClient();
      const instance2 = getCalendlyApiClient();
      
      expect(instance1).toBe(instance2);
    });
  });
});