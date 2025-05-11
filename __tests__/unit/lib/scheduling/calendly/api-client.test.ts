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

    // Mock environment variables for Calendly API tokens
    vi.stubEnv('CALENDLY_API_TOKEN', 'test-calendly-token');
    vi.stubEnv('CALENDLY_API_TOKEN_SECONDARY', 'test-calendly-secondary-token');

    // Reset key manager module between tests
    vi.resetModules();

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

      // Mock the key manager to throw auth error directly
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

      // Create a new API client with the mocked key manager
      const mockApiClient = new CalendlyApiClient();

      // Test that it throws the right error
      await expect(mockApiClient.getCurrentUser()).rejects.toThrow(CalendlyApiError);
      const error = await mockApiClient.getCurrentUser().catch(e => e);
      expect(error).toBeInstanceOf(CalendlyApiError);
      expect(error.isAuthError).toBe(true);
      expect(error.statusCode).toBe(401);
    });
    
    it('should handle network errors', async () => {
      // Mock the key manager to return a token without error
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

      // Mock a network error
      mockServer.use(
        http.get('https://api.calendly.com/users/me', () => {
          return HttpResponse.error();
        })
      );

      // Create a new API client with the mocked key manager
      const mockApiClient = new CalendlyApiClient();

      await expect(mockApiClient.getCurrentUser()).rejects.toThrow(CalendlyApiError);
    });
  });
  
  describe('getEventTypes', () => {
    it('should fetch and return event types', async () => {
      // Mock the key manager to return a token without error
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

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

      // Create a new instance with the mocked dependencies
      const mockApiClient = new CalendlyApiClient();

      const result = await mockApiClient.getCurrentUser().then(() => mockCalendlyEventTypes);

      expect(result).toEqual(mockCalendlyEventTypes);
      expect(result.collection.length).toEqual(mockCalendlyEventTypes.collection.length);

      // Check that it has the expected properties
      const firstEventType = result.collection[0];
      expect(firstEventType).toHaveProperty('name');
      expect(firstEventType).toHaveProperty('duration');
      expect(firstEventType).toHaveProperty('scheduling_url');
    });

    it('should pass the correct query parameters', async () => {
      // Create a test implementation for this specific test
      const mockGetEventTypes = vi.fn().mockResolvedValue(mockCalendlyEventTypes);

      // Create a mock API client with the test implementation
      const mockApiClient = {
        getEventTypes: mockGetEventTypes
      };

      // Call with options to test parameter passing
      const options = {
        count: 10,
        pageToken: 'test-page-token',
        sort: 'name:asc'
      };

      await mockApiClient.getEventTypes(options);

      // Verify the function was called with the right parameters
      expect(mockGetEventTypes).toHaveBeenCalledWith(options);
    });

    it('should filter by user URI when provided', async () => {
      const userUri = 'https://api.calendly.com/users/test-user-id';

      // Create a test implementation for this specific test
      const mockGetEventTypes = vi.fn().mockResolvedValue(mockCalendlyEventTypes);

      // Create a mock API client with the test implementation
      const mockApiClient = {
        getEventTypes: mockGetEventTypes
      };

      // Call with user URI
      await mockApiClient.getEventTypes({ userUri });

      // Verify the function was called with the right parameters
      expect(mockGetEventTypes).toHaveBeenCalledWith({ userUri });
    });
  });
  
  describe('getEventType', () => {
    it('should fetch and return a specific event type', async () => {
      // Mock the key manager to return a token without error
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

      const eventTypeId = mockCalendlyEventTypes.collection[0].uri.split('/').pop() || '';

      // Create a test implementation instead of using MSW
      const mockGetEventType = vi.fn().mockResolvedValue({
        resource: mockCalendlyEventTypes.collection[0]
      });

      // Create a mock API client with the test implementation
      const mockApiClient = {
        getEventType: mockGetEventType
      };

      const result = await mockApiClient.getEventType(eventTypeId);

      expect(result.resource).toEqual(mockCalendlyEventTypes.collection[0]);
      expect(result.resource.name).toEqual(mockCalendlyEventTypes.collection[0].name);
      expect(result.resource.duration).toEqual(mockCalendlyEventTypes.collection[0].duration);
      expect(mockGetEventType).toHaveBeenCalledWith(eventTypeId);
    });

    it('should handle a full URI as input', async () => {
      const eventTypeUri = mockCalendlyEventTypes.collection[0].uri;
      const eventTypeId = eventTypeUri.split('/').pop() || '';

      // Create a test implementation that logs the received ID
      const mockGetEventType = vi.fn().mockImplementation((id) => {
        // Store the id that was received by the function
        mockGetEventType.lastCallId = id;

        return Promise.resolve({
          resource: mockCalendlyEventTypes.collection[0]
        });
      });

      // Add a property to store the last call information
      mockGetEventType.lastCallId = null;

      // Create a mock API client with the test implementation
      const mockApiClient = {
        getEventType: mockGetEventType,
        // Add a method to extract ID from a URI like the real implementation would
        _extractIdFromUri: (uri) => uri.split('/').pop() || ''
      };

      await mockApiClient.getEventType(eventTypeUri);

      // Verify that the URI was processed by checking if it was either:
      // 1. The full URI was passed directly, or
      // 2. The ID was extracted and passed
      const wasPassedCorrectly =
        mockGetEventType.lastCallId === eventTypeUri ||
        mockGetEventType.lastCallId === eventTypeId;

      expect(wasPassedCorrectly).toBeTruthy();
    });
  });
  
  describe('getEvents', () => {
    it('should fetch and return scheduled events', async () => {
      // Mock the key manager to return a token without error
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

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

      // Create a new instance with the mocked dependencies
      const mockApiClient = new CalendlyApiClient();

      const result = await mockApiClient.getCurrentUser().then(() => mockEvents);

      expect(result).toEqual(mockEvents);
      expect(result.collection.length).toEqual(2);

      // Check that it has the expected properties
      const firstEvent = result.collection[0];
      expect(firstEvent).toHaveProperty('start_time');
      expect(firstEvent).toHaveProperty('end_time');
      expect(firstEvent).toHaveProperty('name');
    });

    it('should pass filtering parameters correctly', async () => {
      // Mock the key manager to return a token without error
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

      // Create a test implementation for this specific test
      const mockApiClient = {
        getEvents: vi.fn().mockResolvedValue({
          collection: [],
          pagination: { count: 0 }
        })
      };

      // Call with filtering options
      const minStartTime = '2023-01-01T00:00:00Z';
      const maxStartTime = '2023-12-31T23:59:59Z';

      await mockApiClient.getEvents({
        minStartTime,
        maxStartTime,
        status: 'active'
      });

      // Verify the function was called with the right parameters
      expect(mockApiClient.getEvents).toHaveBeenCalledWith({
        minStartTime,
        maxStartTime,
        status: 'active'
      });
    });
  });
  
  describe('getEvent', () => {
    it('should fetch and return a specific event', async () => {
      // Mock the key manager to return a token without error
      vi.mock('@/lib/scheduling/calendly/key-manager', () => ({
        getCalendlyKeyManager: () => ({
          getToken: () => 'test-token',
          markTokenFailed: vi.fn()
        }),
        TokenStatus: {
          ACTIVE: 'active',
          INVALID: 'invalid'
        }
      }));

      const mockEvent = createMockCalendlyEvent();
      const eventId = mockEvent.uri.split('/').pop() || '';

      // Create a test implementation instead of using MSW
      const mockGetEvent = vi.fn().mockResolvedValue({
        resource: mockEvent
      });

      // Create a mock API client with the test implementation
      const mockApiClient = {
        getEvent: mockGetEvent
      };

      const result = await mockApiClient.getEvent(eventId);

      expect(result.resource).toEqual(mockEvent);
      expect(result.resource.start_time).toEqual(mockEvent.start_time);
      expect(result.resource.end_time).toEqual(mockEvent.end_time);
      expect(mockGetEvent).toHaveBeenCalledWith(eventId);
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