## Session Context

- **Session Type**: Implementation
- **Component Focus**: E2E Testing Infrastructure & Core User Journey Tests
- **Current Branch**: feature/more-testing
- **Related Documentation**: docs/testing/E2E_TESTING_COMPREHENSIVE_PLAN.md, docs/testing/NEXT_STEPS.md, docs/engineering/CALENDLY_STRIPE_ARCHITECTURE.md
- **Project root directory**: /Users/liamj/Documents/development/buildappswith

## Implementation Objectives

- Implement core E2E testing infrastructure based on the comprehensive plan
- Create reusable page object models for critical user flows
- Develop webhook simulators for Calendly and Stripe integration testing
- Build database isolation and seeding mechanisms for E2E tests
- Implement authentication test utilities for Clerk integration
- Create test cases for the highest-priority user journeys
- Set up proper test reporting and error handling

## Implementation Plan

1. **E2E Test Infrastructure Setup**
   - Create necessary folder structure and base files
   - Extend Playwright configuration for different test scenarios
   - Set up utility functions for test isolation and reliability
   - Implement logging and reporting mechanisms
   - Create test fixture management for consistent testing

2. **Page Object Model Implementation**
   - Develop base page object class with common functionality
   - Create specialized page objects for authentication flows
   - Implement page objects for booking and payment processes
   - Build marketplace page objects for search and filtering
   - Ensure consistent error handling across page objects

3. **Webhook Simulation Infrastructure**
   - Create webhook simulator for Calendly events with proper signatures
   - Implement Stripe webhook simulator for payment events
   - Build utility functions for webhook payload generation
   - Develop integration with the booking state machine for testing
   - Implement request verification similar to production code

4. **Database Testing Utilities**
   - Extend existing transaction isolation for E2E tests
   - Create database seeding utilities for consistent test data
   - Implement reset mechanisms between test runs
   - Build mechanisms to verify database state during tests
   - Ensure proper cleanup after test execution

5. **Critical User Journey Implementation**
   - Implement authentication flow tests (signup, signin, profile)
   - Create booking flow tests with Calendly integration
   - Develop payment integration tests with Stripe
   - Implement marketplace navigation and search tests
   - Create tests for error recovery scenarios

## Technical Specifications

### Page Object Structure

Page Objects should follow this pattern:

```typescript
export class AuthPage {
  constructor(private page: Page) {}

  // Navigation methods
  async navigateToLogin(): Promise<void> {
    await this.page.goto('/login');
  }

  // Action methods
  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /log in|sign in/i }).click();
    await this.page.waitForURL(/.*\/(dashboard|profile|builder|admin)/);
  }

  // State verification methods
  async isLoggedIn(): Promise<boolean> {
    return await this.page.getByRole('button', { name: /account|profile/i }).isVisible();
  }

  // Error handling methods
  async getErrorMessage(): Promise<string|null> {
    const errorElement = this.page.getByRole('alert');
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }
}
```

### Webhook Simulator Pattern

Webhook simulators should follow this pattern:

```typescript
export class CalendlyWebhookSimulator {
  constructor(
    private baseUrl: string, 
    private signingKey: string = 'test-signing-key'
  ) {}

  async sendEvent(
    bookingId: string, 
    eventType: 'invitee.created' | 'invitee.canceled',
    eventData: Partial<CalendlyEventData> = {}
  ): Promise<Response> {
    const payload = this.createPayload(bookingId, eventType, eventData);
    const signature = this.generateSignature(payload);
    
    return await fetch(`${this.baseUrl}/api/webhooks/calendly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': signature
      },
      body: JSON.stringify(payload)
    });
  }

  private createPayload(bookingId: string, eventType: string, eventData: any): object {
    // Create standardized payload with event data
  }

  private generateSignature(payload: any): string {
    // Generate HMAC signature using signing key
  }
}
```

### Database Isolation Pattern

Database isolation should follow this pattern:

```typescript
export async function withE2EIsolation<T>(
  callback: (db: PrismaClient) => Promise<T>
): Promise<T> {
  // Set up isolated database state
  const prisma = new PrismaClient();
  
  try {
    // Begin transaction
    const result = await prisma.$transaction(async (tx) => {
      return await callback(tx);
    }, {
      maxWait: 10000,
      timeout: 60000,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
    
    return result;
  } finally {
    // Clean up
    await prisma.$disconnect();
  }
}
```

### Critical User Journey Test Pattern

Tests should follow this pattern:

```typescript
test('complete booking flow with payment', async ({ page }) => {
  const authPage = new AuthPage(page);
  const marketplacePage = new MarketplacePage(page);
  const builderProfilePage = new BuilderProfilePage(page);
  const bookingPage = new BookingPage(page);
  const paymentPage = new PaymentPage(page);
  
  // Set up test data
  const testBuilder = await withE2EIsolation(async (db) => {
    return await createTestBuilder(db);
  });
  
  // Authentication
  await authPage.navigateToLogin();
  await authPage.login('client-test1@buildappswith.com', 'TestClient123!');
  expect(await authPage.isLoggedIn()).toBeTruthy();
  
  // Navigate to builder profile
  await marketplacePage.navigate();
  await marketplacePage.searchForBuilder(testBuilder.name);
  await marketplacePage.selectBuilder(testBuilder.name);
  
  // Select session type and book
  await builderProfilePage.selectSessionType(0);
  await bookingPage.selectDate('next-available');
  await bookingPage.selectTimeSlot(0);
  await bookingPage.continueToPayment();
  
  // Complete payment
  await paymentPage.fillPaymentDetails({
    cardNumber: '4242424242424242',
    expiry: '12/30',
    cvc: '123'
  });
  await paymentPage.confirmPayment();
  
  // Verify confirmation
  await expect(page.getByText(/booking confirmed/i)).toBeVisible();
  
  // Simulate webhook for payment completion
  const webhookSim = new StripeWebhookSimulator(baseUrl);
  const response = await webhookSim.sendEvent(
    'checkout.session.completed', 
    { bookingId: bookingPage.getBookingId() }
  );
  expect(response.status).toBe(200);
  
  // Verify booking status updated
  await page.reload();
  await expect(page.getByText(/payment received/i)).toBeVisible();
});
```

### Feature Flag Testing Pattern

```typescript
export async function withFeatureFlag<T>(
  page: Page,
  flag: string,
  value: boolean,
  callback: () => Promise<T>
): Promise<T> {
  // Set feature flag value
  await page.evaluate(
    ([flagName, flagValue]) => {
      localStorage.setItem(`ff_${flagName}`, flagValue ? 'true' : 'false');
    },
    [flag, value]
  );
  
  try {
    // Run the test with the feature flag set
    return await callback();
  } finally {
    // Reset feature flag to default
    await page.evaluate(
      (flagName) => {
        localStorage.removeItem(`ff_${flagName}`);
      },
      flag
    );
  }
}
```

## Implementation Notes

1. **Test Isolation**: Each test must be fully isolated with no dependencies on other tests
2. **Error Handling**: Implement robust error handling and reporting for test failures
3. **Timeouts**: Use appropriate timeouts and waiting strategies to prevent flaky tests
4. **Selectors**: Prefer data-testid attributes for element selection where possible
5. **Authentication**: Leverage the existing auth utilities for consistent test setup
6. **Mocking Strategy**: Prefer API mocking over service mocking for external dependencies
7. **Webhook Security**: Implement proper signature verification for webhook testing
8. **Database State**: Always verify database state independently of UI assertions
9. **Visual Testing**: For visual regression tests, account for acceptable variation
10. **Documentation**: Document all page objects, test utilities, and test patterns

## Expected Outputs

- Complete E2E test infrastructure with folder structure
- Reusable page objects for all critical user flows
- Webhook simulators for Calendly and Stripe
- Database isolation and seeding utilities
- Authentication test utilities for different user roles
- Test cases for highest-priority user journeys:
  - Authentication (signup, signin, profile)
  - Booking flow with Calendly integration
  - Payment flow with Stripe integration
  - Marketplace navigation and search
- Proper test reporting and error handling
- Documentation of testing patterns and utilities

There MUST BE NO WORKAROUNDS at this critical stage - if you get stuck with anything, please stop and ask for guidance. Testing infrastructure must be robust, maintainable, and provide consistent results.