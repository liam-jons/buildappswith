/**
 * Mock data for Calendly API responses
 * Contains standardized fixtures for tests
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a mock Calendly UUID
 */
export function mockCalendlyUuid(): string {
  return uuidv4().replace(/-/g, '');
}

/**
 * Mock Calendly user response
 */
export const mockCalendlyUser = {
  resource: {
    uri: `https://api.calendly.com/users/${mockCalendlyUuid()}`,
    name: 'Test Builder',
    slug: 'test-builder',
    email: 'test-builder@example.com',
    scheduling_url: 'https://calendly.com/test-builder',
    timezone: 'America/Los_Angeles',
    avatar_url: 'https://example.com/avatar.png',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    current_organization: `https://api.calendly.com/organizations/${mockCalendlyUuid()}`
  }
};

/**
 * Mock Calendly organization response
 */
export const mockCalendlyOrganization = {
  resource: {
    uri: mockCalendlyUser.resource.current_organization,
    name: 'Test Organization',
    is_sandbox: false
  }
};

/**
 * Mock Calendly event types
 */
export const mockCalendlyEventTypes = {
  collection: [
    {
      uri: `https://api.calendly.com/event_types/${mockCalendlyUuid()}`,
      name: 'Initial Consultation',
      active: true,
      slug: 'initial-consultation',
      scheduling_url: 'https://calendly.com/test-builder/initial-consultation',
      duration: 30,
      description: 'A brief intro call to discuss your project needs',
      color: '#0066ff',
      secret: false,
      type: 'StandardEventType',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      profile: {
        type: 'User',
        name: 'Test Builder',
        owner: mockCalendlyUser.resource.uri
      },
      kind: 'solo',
      internal_note: null,
      custom_questions: [
        {
          name: 'What are your goals for this consultation?',
          type: 'text',
          position: 0,
          enabled: true,
          required: true
        }
      ],
      pool_resources: {
        type: 'PoolResources',
        active: false
      }
    },
    {
      uri: `https://api.calendly.com/event_types/${mockCalendlyUuid()}`,
      name: 'Technical Deep Dive',
      active: true,
      slug: 'technical-deep-dive',
      scheduling_url: 'https://calendly.com/test-builder/technical-deep-dive',
      duration: 60,
      description: 'Detailed discussion about your project\'s technical requirements',
      color: '#00cc66',
      secret: false,
      type: 'StandardEventType',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      profile: {
        type: 'User',
        name: 'Test Builder',
        owner: mockCalendlyUser.resource.uri
      },
      kind: 'solo',
      internal_note: null,
      custom_questions: [
        {
          name: 'Specific technical areas you want to discuss?',
          type: 'text',
          position: 0,
          enabled: true,
          required: true
        },
        {
          name: 'Your current tech stack?',
          type: 'text',
          position: 1,
          enabled: true,
          required: false
        }
      ],
      pool_resources: {
        type: 'PoolResources',
        active: false
      }
    }
  ],
  pagination: {
    count: 2,
    next_page: null,
    next_page_token: null,
    previous_page: null,
    previous_page_token: null
  }
};

/**
 * Mock single Calendly event type response
 */
export const mockCalendlyEventType = {
  resource: mockCalendlyEventTypes.collection[0]
};

/**
 * Generate a mock Calendly event
 * 
 * @param overrides Properties to override in the generated event
 */
export function createMockCalendlyEvent(overrides: Partial<any> = {}) {
  const eventId = mockCalendlyUuid();
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1); // Tomorrow
  startTime.setHours(10, 0, 0, 0); // 10:00 AM
  
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + 60); // 1 hour later
  
  return {
    uri: `https://api.calendly.com/scheduled_events/${eventId}`,
    name: 'Technical Deep Dive',
    status: 'active',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    event_type: mockCalendlyEventTypes.collection[1].uri,
    location: {
      type: 'zoom',
      join_url: 'https://zoom.us/j/123456789'
    },
    invitees_counter: {
      active: 1,
      limit: 1,
      total: 1
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    event_memberships: [
      {
        user: mockCalendlyUser.resource.uri
      }
    ],
    ...overrides
  };
}

/**
 * Generate a mock Calendly invitee
 * 
 * @param eventId Calendly event ID
 * @param overrides Properties to override in the generated invitee
 */
export function createMockCalendlyInvitee(eventId: string, overrides: Partial<any> = {}) {
  const inviteeId = mockCalendlyUuid();
  
  return {
    uri: `https://api.calendly.com/scheduled_events/${eventId}/invitees/${inviteeId}`,
    email: 'client@example.com',
    name: 'Test Client',
    status: 'active',
    questions_and_answers: [
      {
        question: 'Specific technical areas you want to discuss?',
        answer: 'API integration and authentication'
      },
      {
        question: 'Your current tech stack?',
        answer: 'Node.js, React, PostgreSQL'
      }
    ],
    timezone: 'America/New_York',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    event: `https://api.calendly.com/scheduled_events/${eventId}`,
    text_reminder_number: null,
    rescheduled: false,
    old_invitee: null,
    new_invitee: null,
    cancel_url: `https://calendly.com/cancellations/${mockCalendlyUuid()}`,
    reschedule_url: `https://calendly.com/reschedulings/${mockCalendlyUuid()}`,
    tracking: {
      utm_source: 'buildappswith',
      utm_medium: 'scheduling',
      utm_campaign: 'booking',
      utm_content: 'test'
    },
    ...overrides
  };
}

/**
 * Generate a mock Calendly webhook payload
 * 
 * @param eventType Webhook event type (e.g., 'invitee.created')
 * @param eventId Calendly event ID
 * @param inviteeId Calendly invitee ID
 * @param overrides Properties to override in the generated payload
 */
export function createMockWebhookPayload(
  eventType: 'invitee.created' | 'invitee.canceled' | 'invitee.rescheduled',
  eventId: string = mockCalendlyUuid(),
  inviteeId: string = mockCalendlyUuid(),
  overrides: Partial<any> = {}
) {
  const baseEvent = {
    uuid: eventId,
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
    location: {
      type: 'zoom',
      join_url: 'https://zoom.us/j/123456789'
    }
  };
  
  const baseInvitee = {
    uuid: inviteeId,
    email: 'client@example.com',
    name: 'Test Client',
    timezone: 'America/New_York',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions_and_answers: [
      {
        question: 'Specific technical areas you want to discuss?',
        answer: 'API integration and authentication'
      }
    ],
    tracking: {
      utm_source: 'buildappswith',
      utm_medium: 'scheduling',
      utm_campaign: 'booking',
      utm_content: 'session_type_id=session-123&client_id=client-123'
    },
    cancel_url: `https://calendly.com/cancellations/${mockCalendlyUuid()}`,
    reschedule_url: `https://calendly.com/reschedulings/${mockCalendlyUuid()}`,
    status: 'active',
    text_reminder_number: null,
    no_show: null
  };
  
  // Base payload structure common to all events
  const basePayload = {
    event_type: {
      uuid: mockCalendlyUuid(),
      kind: 'solo',
      slug: 'technical-deep-dive',
      name: 'Technical Deep Dive',
      duration: 60,
      owner: {
        type: 'users',
        uuid: mockCalendlyUuid()
      }
    },
    event: baseEvent,
    invitee: baseInvitee,
    questions_and_answers: baseInvitee.questions_and_answers,
    cancel_url: baseInvitee.cancel_url,
    reschedule_url: baseInvitee.reschedule_url
  };
  
  // Event-specific payload modifications
  let payload = { ...basePayload };
  
  if (eventType === 'invitee.canceled') {
    payload = {
      ...payload,
      cancellation: {
        canceled_by: 'invitee',
        reason: 'Schedule conflict',
        canceler_type: 'invitee'
      },
      invitee: {
        ...baseInvitee,
        status: 'canceled',
        cancellation: {
          canceled_by: 'invitee',
          reason: 'Schedule conflict'
        }
      }
    };
  } else if (eventType === 'invitee.rescheduled') {
    const oldStartTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    payload = {
      ...payload,
      invitee: {
        ...baseInvitee,
        rescheduled: true,
        old_invitee: `https://api.calendly.com/scheduled_events/${eventId}/invitees/${mockCalendlyUuid()}`
      },
      old_event: {
        ...baseEvent,
        start_time: oldStartTime
      },
      new_event: baseEvent
    };
  }
  
  return {
    event: eventType,
    payload: {
      ...payload,
      ...overrides
    }
  };
}

/**
 * Generate a mock event scheduling link response
 * 
 * @param params Parameters for the scheduling link
 */
export function createMockSchedulingLink(params: {
  eventTypeId: string;
  sessionTypeId: string;
}) {
  const { eventTypeId, sessionTypeId } = params;
  
  // Get the event type from our mock data or create a default one
  const eventType = mockCalendlyEventTypes.collection.find(et => 
    et.uri.includes(eventTypeId)) || mockCalendlyEventTypes.collection[0];
  
  const baseUrl = eventType.scheduling_url;
  const urlParams = new URLSearchParams({
    utm_source: 'buildappswith',
    utm_medium: 'scheduling',
    utm_campaign: 'booking',
    session_type_id: sessionTypeId,
    client_id: 'client-123',
    return_url: encodeURIComponent('https://buildappswith.com/booking/confirmation')
  });
  
  return {
    bookingUrl: `${baseUrl}?${urlParams.toString()}`,
    eventTypeId,
    sessionTypeId
  };
}

/**
 * Mapped Calendly event types for our system
 */
export const mappedCalendlyEventTypes = [
  {
    id: 'session-1',
    calendlyEventTypeId: mockCalendlyEventTypes.collection[0].uri.split('/').pop() || '',
    calendlyEventTypeUri: mockCalendlyEventTypes.collection[0].uri,
    title: mockCalendlyEventTypes.collection[0].name,
    description: mockCalendlyEventTypes.collection[0].description || '',
    durationMinutes: mockCalendlyEventTypes.collection[0].duration,
    price: 0,
    currency: 'USD',
    color: mockCalendlyEventTypes.collection[0].color,
    isActive: mockCalendlyEventTypes.collection[0].active,
    builderId: 'builder-1',
    maxParticipants: 1
  },
  {
    id: 'session-2',
    calendlyEventTypeId: mockCalendlyEventTypes.collection[1].uri.split('/').pop() || '',
    calendlyEventTypeUri: mockCalendlyEventTypes.collection[1].uri,
    title: mockCalendlyEventTypes.collection[1].name,
    description: mockCalendlyEventTypes.collection[1].description || '',
    durationMinutes: mockCalendlyEventTypes.collection[1].duration,
    price: 75,
    currency: 'USD',
    color: mockCalendlyEventTypes.collection[1].color,
    isActive: mockCalendlyEventTypes.collection[1].active,
    builderId: 'builder-1',
    maxParticipants: 1
  }
];