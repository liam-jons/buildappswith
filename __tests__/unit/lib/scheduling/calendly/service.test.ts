/**
 * Unit tests for Calendly service
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockServer } from '../../../../mocks/server';
import { http, HttpResponse } from 'msw';
import { CalendlyService } from '@/lib/scheduling/calendly/service';
import { CalendlyApiClient } from '@/lib/scheduling/calendly/api-client';
import { 
  mockCalendlyUser,
  mockCalendlyEventTypes,
  createMockWebhookPayload
} from '../../../../mocks/scheduling/mock-calendly-data';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockSessionType = {
    id: 'session-1',
    builderId: 'builder-1',
    title: 'Initial Consultation',
    description: 'A brief intro call to discuss your project needs',
    price: { toNumber: () => 0 },
    builder: {
      user: {
        name: 'Test Builder',
        email: 'test-builder@example.com'
      },
      timezone: 'America/Los_Angeles'
    }
  };
  
  const mockBooking = {
    id: 'booking-1',
    builderId: 'builder-1',
    clientId: 'client-1',
    sessionTypeId: 'session-1',
    title: 'Initial Consultation',
    description: 'A brief intro call to discuss your project needs',
    startTime: new Date(),
    endTime: new Date(Date.now() + 30 * 60 * 1000),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    amount: { toNumber: () => 0 },
    stripeSessionId: null,
    clientTimezone: 'America/New_York',
    builderTimezone: 'America/Los_Angeles'
  };
  
  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      sessionType: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'session-1') {
            return Promise.resolve(mockSessionType);
          }
          return Promise.resolve(null);
        })
      },
      booking: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.calendlyEventId === 'test-event-id') {
            return Promise.resolve(mockBooking);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(() => Promise.resolve({
          ...mockBooking,
          id: 'new-booking-1'
        })),
        update: vi.fn().mockImplementation(() => Promise.resolve({
          ...mockBooking,
          status: 'CANCELLED'
        }))
      },
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === 'client-1') {
            return Promise.resolve({
              id: 'client-1',
              name: 'Test Client',
              email: 'test-client@example.com'
            });
          }
          return Promise.resolve(null);
        })
      }
    }))
  };
});

describe('CalendlyService', () => {
  let mockApiClient: CalendlyApiClient;
  let service: any; // Using any to allow adding private method mocks
  
  beforeEach(() => {
    // Reset mock server handlers
    mockServer.resetHandlers();
    
    // Create a mock API client
    mockApiClient = {
      getCurrentUser: vi.fn().mockResolvedValue(mockCalendlyUser),
      getEventTypes: vi.fn().mockResolvedValue(mockCalendlyEventTypes),
      getEventType: vi.fn().mockResolvedValue({
        resource: mockCalendlyEventTypes.collection[0]
      }),
      verifyToken: vi.fn().mockResolvedValue(true)
    } as unknown as CalendlyApiClient;
    
    // Create a new service instance
    service = new CalendlyService(mockApiClient);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('getEventTypes', () => {
    it('should fetch and map event types', async () => {
      const result = await service.getEventTypes();
      
      // Verify API client was called
      expect(mockApiClient.getCurrentUser).toHaveBeenCalled();
      expect(mockApiClient.getEventTypes).toHaveBeenCalled();
      
      // Verify the result
      expect(result).toHaveLength(mockCalendlyEventTypes.collection.length);
      expect(result[0]).toHaveProperty('calendlyEventTypeId');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('durationMinutes');
      
      // Check mapping is correct
      expect(result[0].title).toEqual(mockCalendlyEventTypes.collection[0].name);
      expect(result[0].durationMinutes).toEqual(mockCalendlyEventTypes.collection[0].duration);
    });
    
    it('should handle API errors', async () => {
      // Mock an error from the API client
      mockApiClient.getCurrentUser = vi.fn().mockRejectedValue(new Error('API Error'));
      
      await expect(service.getEventTypes()).rejects.toThrow('API Error');
    });
  });
  
  describe('createSchedulingLink', () => {
    it('should create a scheduling link with user parameters', async () => {
      const request = {
        eventTypeId: 'event-type-1',
        name: 'Test Client',
        email: 'test-client@example.com',
        timezone: 'America/New_York',
        sessionTypeId: 'session-1',
        clientId: 'client-1',
        returnUrl: 'https://example.com/booking/confirmation'
      };
      
      const result = await service.createSchedulingLink(request);
      
      // Verify API client was called
      expect(mockApiClient.getEventType).toHaveBeenCalledWith(request.eventTypeId);
      
      // Verify the result
      expect(result).toHaveProperty('bookingUrl');
      expect(result).toHaveProperty('eventTypeId');
      expect(result).toHaveProperty('sessionTypeId');
      
      // Check URL parameters
      expect(result.bookingUrl).toContain(request.sessionTypeId);
      expect(result.bookingUrl).toContain(request.clientId);
      expect(result.bookingUrl).toContain('utm_source=buildappswith');
    });
    
    it('should handle missing event type', async () => {
      // Mock null response from getEventType
      mockApiClient.getEventType = vi.fn().mockResolvedValue(null);
      
      const request = {
        eventTypeId: 'non-existent',
        name: 'Test Client',
        email: 'test-client@example.com',
        timezone: 'America/New_York',
        sessionTypeId: 'session-1',
        clientId: 'client-1',
        returnUrl: 'https://example.com/booking/confirmation'
      };
      
      await expect(service.createSchedulingLink(request)).rejects.toThrow('Event type not found');
    });
  });
  
  describe('processWebhookEvent', () => {
    it('should process invitee.created event', async () => {
      const eventId = 'test-event-id';
      const inviteeId = 'test-invitee-id';

      const webhookPayload = createMockWebhookPayload('invitee.created', eventId, inviteeId, {
        payload: {
          invitee: {
            tracking: {
              utm_source: 'buildappswith',
              utm_medium: 'scheduling',
              utm_campaign: 'booking',
              utm_content: 'session_type_id=session-1&client_id=client-1'
            }
          },
          questions_and_answers: [
            {
              question: 'session_type_id',
              answer: 'session-1'
            },
            {
              question: 'client_id',
              answer: 'client-1'
            }
          ]
        }
      });

      // Mock the private method directly using any type
      service.processEventCreated = vi.fn().mockResolvedValue({
        builderId: 'builder-1',
        clientId: 'client-1',
        sessionTypeId: 'session-1',
        calendlyEventId: eventId,
        status: 'PENDING'
      });

      const result = await service.processWebhookEvent(webhookPayload);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.builderId).toEqual('builder-1');
      expect(result?.clientId).toEqual('client-1');
      expect(result?.sessionTypeId).toEqual('session-1');
      expect(result?.calendlyEventId).toEqual(eventId);
      expect(result?.status).toEqual('PENDING');
    });
    
    it('should process invitee.canceled event', async () => {
      const eventId = 'test-event-id';
      const inviteeId = 'test-invitee-id';

      const webhookPayload = createMockWebhookPayload('invitee.canceled', eventId, inviteeId);

      // Mock the private method directly using any type
      service.processEventCancelled = vi.fn().mockResolvedValue({
        id: 'booking-1',
        builderId: 'builder-1',
        clientId: 'client-1',
        sessionTypeId: 'session-1',
        calendlyEventId: eventId,
        status: 'CANCELLED'
      });

      const result = await service.processWebhookEvent(webhookPayload);

      // Verify the result
      expect(result).not.toBeNull();
      expect(result?.id).toEqual('booking-1');
      expect(result?.status).toEqual('CANCELLED');
    });
    
    it('should handle unrecognized event types', async () => {
      const webhookPayload = {
        event: 'unrecognized.event',
        payload: {}
      };
      
      const result = await service.processWebhookEvent(webhookPayload as any);
      
      // Should return null for unhandled event types
      expect(result).toBeNull();
    });
    
    it('should handle missing session type', async () => {
      const eventId = 'test-event-id';
      const inviteeId = 'test-invitee-id';

      const webhookPayload = createMockWebhookPayload('invitee.created', eventId, inviteeId, {
        payload: {
          invitee: {
            tracking: {
              utm_source: 'buildappswith',
              utm_medium: 'scheduling',
              utm_campaign: 'booking',
              utm_content: 'session_type_id=non-existent&client_id=client-1'
            }
          }
        }
      });

      // In our implementation, the service doesn't have direct Prisma access
      // Instead of modifying the service directly, we can test the behavior
      // by ensuring our mock data doesn't include the session type

      // Override the mock API client's behavior
      mockApiClient.getEventType = vi.fn().mockResolvedValue(null);

      const result = await service.processWebhookEvent(webhookPayload);

      // Should return null when session type is not found
      expect(result).toBeNull();
    });
  });
});