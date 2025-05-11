Session Context

- Session Type: Testing Implementation
- Component Focus: Testing the Calendly-Integrated Booking Flow
- Current Branch: feature/calendly-integration-tests
- Related Documentation: /docs/engineering/CALENDLY_INTEGRATION.md,
/docs/engineering/CALENDLY_ERROR_HANDLING.md,
/docs/engineering/CALENDLY_PERFORMANCE_CONSIDERATIONS.md
- Project root directory: /Users/liamj/Documents/development/buildappswith

Implementation Objectives

- Implement comprehensive testing suite for the Calendly integration
- Create unit tests for core functionality components
- Implement integration tests for end-to-end booking flow
- Build webhook testing infrastructure with signature verification
- Create mocks and fixtures for Calendly API responses
- Implement UI component tests for booking interface
- Add performance tests for critical paths

Implementation Plan

1. Test Environment Setup

- Create test configuration for Calendly integration
- Set up mock Calendly API server for tests
- Create test database seeding for booking-related data
- Set up webhook testing utilities
- Create fixtures for Calendly API responses

2. Unit Test Implementation

- Write tests for CalendlyApiClient class
- Test token management and authentication
- Create tests for webhook signature verification
- Add tests for error handling and categorization
- Test caching mechanisms and invalidation

3. API Integration Tests

- Test session type retrieval and mapping
- Implement tests for booking creation flow
- Test webhook processing for different event types
- Create tests for payment integration
- Test error scenarios and fallback mechanisms

4. UI Component Tests

- Test session type display components
- Create tests for booking button and flow
- Test loading and error states
- Implement accessibility tests for booking components
- Test responsive behavior across devices

5. End-to-End Flow Tests

- Create tests for complete booking flow
- Test cancellation and reschedule scenarios
- Implement payment completion tests
- Test error recovery in the booking flow
- Add browser compatibility tests

6. Performance Tests

- Set up performance test baselines
- Test caching effectiveness
- Measure API response times
- Test concurrent webhook processing
- Implement load testing for booking system

7. Security Tests

- Test webhook signature verification
- Implement tests for rate limiting
- Test authorization controls
- Create tests for input validation
- Test token security mechanisms

8. Mock Implementation

- Create mock Calendly API for testing
- Implement mock webhook sender
- Add mock Stripe checkout for testing
- Create utilities for generating test data
- Implement test helpers for common operations

Technical Specifications

Mock Calendly API

```typescript
export class MockCalendlyApi {
  // Mock storage
  private eventTypes: CalendlyEventType[] = [];
  private events: CalendlyEvent[] = [];
  
  // Configuration for behavior
  public shouldFailAuth = false;
  public shouldTimeout = false;
  
  constructor(fixtures?: any) {
    // Initialize with fixtures if provided
    if (fixtures) {
      this.eventTypes = fixtures.eventTypes || [];
      this.events = fixtures.events || [];
    } else {
      // Load default fixtures
      this.loadDefaultFixtures();
    }
  }
  
  // Mock API endpoints
  async getUserInfo(): Promise<any> {
    this.simulateFailures();
    return this.mockUserResponse();
  }
  
  async getEventTypes(): Promise<any> {
    this.simulateFailures();
    return { collection: this.eventTypes };
  }
  
  // Helper methods
  private simulateFailures() {
    if (this.shouldFailAuth) {
      throw new Error('401 Unauthorized');
    }
    
    if (this.shouldTimeout) {
      throw new Error('Request timeout');
    }
  }
  
  // Other methods for controlling mock behavior
}
```

Webhook Testing Utilities

```typescript
export function generateMockWebhook(
  eventType: string,
  data: any,
  secret: string
): { body: string; signature: string } {
  const body = JSON.stringify({
    event: eventType,
    payload: data
  });
  
  // Generate valid signature
  const hmac = crypto.createHmac('sha256', secret);
  const signature = hmac.update(body).digest('hex');
  
  return { body, signature };
}

export async function sendMockWebhook(
  url: string,
  eventType: string,
  data: any,
  secret: string
): Promise<Response> {
  const { body, signature } = generateMockWebhook(eventType, data, secret);
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Calendly-Webhook-Signature': signature
    },
    body
  });
}
```

Unit Test Example

```typescript
describe('CalendlyApiClient', () => {
  let mockFetch: jest.SpyInstance;
  
  beforeEach(() => {
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation();
  });
  
  afterEach(() => {
    mockFetch.mockRestore();
  });
  
  test('should retrieve event types successfully', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ collection: [{ id: '123', name: 'Test Event' }] })
    });
    
    const client = new CalendlyApiClient('test-token');
    const result = await client.getEventTypes();
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/event_types'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });
  
  test('should handle API errors correctly', async () => {
    // Mock error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' })
    });
    
    const client = new CalendlyApiClient('invalid-token');
    
    await expect(client.getEventTypes()).rejects.toThrow('Authentication failed');
  });
});
```

Integration Test Example

```typescript
describe('Booking Flow Integration', () => {
  let mockCalendlyApi: MockCalendlyApi;
  
  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
    
    // Setup mock API
    mockCalendlyApi = new MockCalendlyApi();
    mockApiServer.use(
      rest.get('https://api.calendly.com/event_types', (req, res, ctx) => {
        return res(ctx.json(mockCalendlyApi.getEventTypes()));
      })
    );
  });
  
  afterAll(async () => {
    // Cleanup
    await cleanupTestDatabase();
  });
  
  test('should create booking and redirect to Calendly', async () => {
    // Setup test client and user
    const { user } = await createTestUser();
    
    // Create test builder with Calendly session types
    const builder = await createTestBuilder({
      hasCalendlyIntegration: true
    });
    
    // Get session type
    const sessionTypes = await getSessionTypes(builder.id);
    
    // Initialize booking
    const response = await server.post('/api/scheduling/bookings', {
      builderId: builder.id,
      sessionTypeId: sessionTypes[0].id,
      clientId: user.id
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    
    // Verify booking record
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId }
    });
    
    expect(booking).not.toBeNull();
    expect(booking?.status).toBe('PENDING_SCHEDULING');
    
    // Verify Calendly redirect URL
    expect(data.schedulingUrl).toContain('calendly.com');
  });
});
```

End-to-End Test Example

```typescript
test('end-to-end booking flow with payment', async ({ page }) => {
  // Mock responses for external services
  await mockCalendlyApi.setup();
  await mockStripeApi.setup();
  
  // Login as client
  await loginAsTestUser(page);
  
  // Visit builder profile
  await page.goto(`/profile/${testBuilder.id}`);
  
  // Select session type
  await page.click('[data-testid="session-type-card-0"]');
  
  // Click book now
  await page.click('[data-testid="book-session-button"]');
  
  // Verify redirected to Calendly (mock)
  expect(page.url()).toContain('calendly-mock');
  
  // Select time slot in mock Calendly UI
  await page.click('[data-testid="time-slot-option"]');
  await page.click('[data-testid="confirm-booking-button"]');
  
  // Verify redirected to payment page
  expect(page.url()).toContain('/booking/payment');
  
  // Complete payment using mock Stripe
  await page.fill('[data-testid="card-number"]', '4242424242424242');
  await page.fill('[data-testid="card-expiry"]', '12/30');
  await page.fill('[data-testid="card-cvc"]', '123');
  await page.click('[data-testid="submit-payment-button"]');
  
  // Verify redirected to confirmation page
  await page.waitForURL(url => url.pathname.includes('/booking/confirmation'));
  
  // Verify booking status in UI
  expect(await page.textContent('[data-testid="booking-status"]'))
    .toContain('Confirmed');
  
  // Verify database state
  const booking = await prisma.booking.findFirst({
    where: { clientId: testUser.id },
    orderBy: { createdAt: 'desc' }
  });
  
  expect(booking?.status).toBe('CONFIRMED');
  expect(booking?.paymentStatus).toBe('PAID');
});
```

Webhook Test Example

```typescript
test('should process invitee.created webhook correctly', async () => {
  // Create test booking
  const booking = await createTestBooking({
    status: 'PENDING_SCHEDULING'
  });
  
  // Generate mock webhook data
  const webhookData = {
    event_type: { uuid: 'evt_123' },
    invitee: { uuid: 'inv_123', email: 'test@example.com' },
    event: {
      uuid: 'evt_123',
      start_time: '2023-08-15T10:00:00Z',
      end_time: '2023-08-15T11:00:00Z'
    },
    tracking: {
      utm_source: 'buildappswith',
      utm_content: booking.id
    }
  };
  
  // Send mock webhook
  const response = await sendMockWebhook(
    '/api/webhooks/calendly',
    'invitee.created',
    webhookData,
    'test-webhook-secret'
  );
  
  expect(response.status).toBe(200);
  
  // Verify booking was updated
  const updatedBooking = await prisma.booking.findUnique({
    where: { id: booking.id }
  });
  
  expect(updatedBooking?.status).toBe('PENDING_PAYMENT');
  expect(updatedBooking?.calendlyEventId).toBe('evt_123');
  expect(updatedBooking?.calendlyInviteeId).toBe('inv_123');
  expect(updatedBooking?.startTime).toEqual(new Date('2023-08-15T10:00:00Z'));
});
```

Implementation Notes

1. Create isolated test environments to avoid external API calls
2. Use dependency injection to allow mocking of external services
3. Test both happy paths and error scenarios thoroughly
4. Validate webhook security implementation with both valid and invalid signatures
5. Create comprehensive fixtures for different Calendly response types
6. Test performance under load, especially for webhook processing
7. Ensure proper cleanup between tests to avoid state leakage
8. Test the complete flow from session type selection to payment confirmation

Expected Outputs

- Comprehensive test suite for Calendly integration
- Mocking infrastructure for Calendly API and webhooks
- Integration tests for booking flow
- Unit tests for core functionality
- UI component tests
- End-to-end tests for complete booking flow
- Performance test baselines
- Security test coverage

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance. Testing is critical for ensuring the reliability of this integration.