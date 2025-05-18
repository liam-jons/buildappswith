# E2E Testing Comprehensive Implementation Plan

This document outlines the comprehensive end-to-end (E2E) testing strategy for the BuildAppsWith platform, focusing on critical user journeys through the integrated systems: Clerk authentication, Calendly booking, and marketplace.

## Test Architecture

### Folder Structure

```
__tests__/
├── e2e/                             # E2E tests using Playwright
│   ├── auth/                        # Authentication flows
│   │   ├── signin.test.ts           # Sign-in functionality
│   │   ├── signup.test.ts           # Sign-up functionality
│   │   ├── auth-flow.test.ts        # Complete auth flow
│   │   └── profile-management.test.ts # Profile editing and management
│   ├── booking/                     # Booking and payment flows
│   │   ├── booking-flow.test.ts     # End-to-end booking journey
│   │   ├── booking-management.test.ts # Managing bookings
│   │   ├── calendly-booking-flow.test.ts # Calendly-specific flow
│   │   └── payment-integration.test.ts # Stripe payment process
│   ├── marketplace/                 # Marketplace experiences
│   │   ├── browse-experience.test.ts # Browsing the marketplace
│   │   ├── builder-profile.test.ts  # Viewing builder profiles
│   │   └── search-filter.test.ts    # Search and filtering
│   ├── visual/                      # Visual regression tests
│   │   ├── snapshots.test.ts        # Component snapshots
│   │   └── visual-regression.test.ts # Visual regression
│   ├── fixtures/                    # Test fixtures and data
│   │   ├── auth-fixtures.ts         # Authentication fixtures
│   │   ├── booking-fixtures.ts      # Booking data fixtures
│   │   └── marketplace-fixtures.ts  # Marketplace data fixtures
│   ├── utils/                       # Test utilities
│   │   ├── webhook-simulators.ts    # Simulate Calendly/Stripe webhooks
│   │   ├── feature-flag-utils.ts    # Control feature flags
│   │   └── monitoring-utils.ts      # Sentry/Datadog integration
│   ├── global-setup.ts              # Global Playwright setup
│   └── page-objects/                # Page Object Models
│       ├── auth-pages.ts            # Authentication page objects
│       ├── booking-pages.ts         # Booking page objects
│       └── marketplace-pages.ts     # Marketplace page objects
└── utils/
    ├── e2e/                         # E2E specific utilities
    │   ├── auth-utils.ts            # Authentication utilities
    │   ├── async-utils.ts           # Async helpers
    │   └── index.ts                 # Utility exports
    └── database/                    # Database utilities for testing
        ├── reset.ts                 # Database reset
        ├── seed-test-users.ts       # User seeding
        └── transaction.ts           # Transaction isolation
```

### Page Object Model

We will implement the Page Object Model (POM) pattern to make tests more maintainable and readable:

```typescript
// Example page object for authentication
export class AuthPage {
  constructor(private page: Page) {}

  async navigateToLogin() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /log in|sign in/i }).click();
    await this.page.waitForURL(/.*\/(dashboard|profile|builder|admin)/);
  }

  async signup(email: string, password: string, name: string) {
    await this.page.goto('/signup');
    await this.page.getByLabel(/name/i).fill(name);
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
    await this.page.getByRole('button', { name: /sign up/i }).click();
    await this.page.waitForURL(/.*\/onboarding/);
  }

  // More authentication methods...
}
```

## External Service Mocking Strategy

### Clerk Authentication

We will use the existing auth helpers in `__tests__/utils/e2e-auth-utils.ts` which already support:
- Creating authenticated sessions for different user roles
- Logging in and out users
- Role switching for multi-role users

### Calendly Integration

For Calendly tests, we will implement two strategies:

1. **Mock API Approach**:
   - Intercept Calendly API calls using Playwright's request interception
   - Return standardized mock responses for event creation, etc.
   - Simulate webhooks with the appropriate signatures

2. **State Machine Testing**:
   - Test the state machine directly to verify transitions
   - Create webhook simulator to trigger transitions

Example webhook simulator:
```typescript
export class WebhookSimulator {
  static async sendCalendlyWebhook(bookingId: string, eventType: string) {
    const payload = {
      event: eventType,
      payload: {
        event_type: { uuid: 'test-event-type-id' },
        event: { uuid: 'test-calendly-event-id' },
        invitee: { uuid: 'test-invitee-id' },
        tracking: { utm_content: bookingId }
      }
    };
    
    const secret = process.env.CALENDLY_WEBHOOK_SIGNING_KEY || 'test-key';
    const payloadString = JSON.stringify(payload);
    const signature = createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');
    
    return await fetch(`${baseUrl}/api/webhooks/calendly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'calendly-webhook-signature': signature
      },
      body: payloadString
    });
  }
}
```

### Stripe Integration

For Stripe tests:

1. **Mock API Approach**:
   - Intercept Stripe API calls
   - Return standardized mock responses
   - Simulate checkout completion

2. **Webhook Simulation**:
   - Simulate webhook events with proper signatures
   - Test recovery flows with different payment states

## Critical User Journey Tests

### 1. Authentication Flow

```typescript
test('complete user authentication flow', async ({ page }) => {
  const authPage = new AuthPage(page);
  
  // Sign up process
  await authPage.navigateToSignup();
  await authPage.signup('new-user@example.com', 'Password123!', 'New User');
  
  // Complete onboarding
  const onboardingPage = new OnboardingPage(page);
  await onboardingPage.selectRole('client');
  await onboardingPage.completeProfile();
  
  // Verify dashboard access
  await expect(page).toHaveURL(/.*\/dashboard/);
  
  // Sign out
  await authPage.logout();
  
  // Sign back in
  await authPage.navigateToLogin();
  await authPage.login('new-user@example.com', 'Password123!');
  
  // Verify successful login
  await expect(page).toHaveURL(/.*\/dashboard/);
});
```

### 2. Booking and Payment Flow

```typescript
test('complete booking and payment flow', async ({ page }) => {
  // Setup authenticated builder
  await setupAuth(page, 'established-builder');
  
  // Create session type for testing
  const sessionId = await createTestSessionType(page);
  
  // Setup authenticated client
  await setupAuth(page, 'client');
  
  // Navigate to builder profile
  const marketplacePage = new MarketplacePage(page);
  await marketplacePage.navigateToBuilderProfile('established-builder');
  
  // Select session type
  const builderProfilePage = new BuilderProfilePage(page);
  await builderProfilePage.selectSessionType(sessionId);
  
  // Complete Calendly booking
  const bookingPage = new BookingPage(page);
  await bookingPage.selectTimeSlot();
  await bookingPage.confirmBooking();
  
  // Complete payment
  const paymentPage = new PaymentPage(page);
  await paymentPage.fillPaymentDetails();
  await paymentPage.submitPayment();
  
  // Verify booking confirmation
  await expect(page).toHaveURL(/.*\/booking\/confirmation/);
  await expect(page.getByText(/booking confirmed/i)).toBeVisible();
});
```

### 3. Marketplace Flow

```typescript
test('marketplace search and filtering', async ({ page }) => {
  // Setup authenticated client
  await setupAuth(page, 'client');
  
  // Navigate to marketplace
  const marketplacePage = new MarketplacePage(page);
  await marketplacePage.navigate();
  
  // Test search functionality
  await marketplacePage.search('javascript');
  await expect(page.getByText(/javascript/i)).toBeVisible();
  
  // Test filtering
  await marketplacePage.filterByExpertise('frontend');
  
  // Verify filter results
  const builderCards = await page.getByTestId('builder-card').count();
  expect(builderCards).toBeGreaterThan(0);
  
  // Test sort functionality
  await marketplacePage.sortBy('price-asc');
  
  // Verify builder profile navigation
  await marketplacePage.clickOnBuilderCard(0);
  await expect(page).toHaveURL(/.*\/marketplace\/builders\/[\w-]+/);
});
```

## Database Isolation and Seeding

We will implement a robust approach to database isolation:

1. **Test Database**:
   - Separate test database with proper schema
   - Reset between test runs

2. **Transaction Isolation**:
   - Wrap E2E tests in transactions that roll back
   - Utilize `withTestTransaction` pattern for API isolation

3. **Test Data Seeding**:
   - Pre-seed standard test users (already implemented)
   - Add fixtures for marketplace and session types

Example database reset between tests:
```typescript
// In global setup
import { resetDatabase } from '../utils/database/reset';

async function globalSetup(config: FullConfig) {
  // Authentication setup (existing)
  
  // Reset and seed the database
  await resetDatabase();
  await seedTestData();
}
```

## Feature Flag Control

Create utilities to control feature flags in tests:

```typescript
// feature-flag-utils.ts
export async function setFeatureFlag(
  flag: string, 
  value: boolean
): Promise<void> {
  // Implementation to set feature flag value for testing
}

export async function withFeatureFlag<T>(
  flag: string, 
  value: boolean, 
  callback: () => Promise<T>
): Promise<T> {
  try {
    await setFeatureFlag(flag, value);
    return await callback();
  } finally {
    // Reset flag to default
    await setFeatureFlag(flag, defaultValues[flag]);
  }
}
```

Example usage in tests:
```typescript
test('marketplace with dynamic features', async ({ page }) => {
  await withFeatureFlag('UseDynamicMarketplace', true, async () => {
    // Test with dynamic marketplace enabled
  });
});
```

## Visual Testing Strategy

Implement visual testing using Playwright's snapshot capabilities:

```typescript
// In visual-regression.test.ts
test('marketplace UI matches visual baseline', async ({ page }) => {
  await page.goto('/marketplace');
  
  // Take screenshot and compare with baseline
  await expect(page).toHaveScreenshot('marketplace.png');
});
```

## Monitoring Integration

Integrate with Sentry and Datadog for test monitoring:

1. **Sentry Integration**:
   - Error reporting during tests
   - Performance monitoring

2. **Datadog Integration**:
   - Test run metrics
   - Test coverage reporting

## CI/CD Integration

```yaml
# GitHub Actions workflow for E2E tests
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Setup test database
        run: pnpm db:setup:test
        
      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          CLERK_SECRET_KEY: ${{ secrets.TEST_CLERK_SECRET_KEY }}
          STRIPE_SECRET_KEY: ${{ secrets.TEST_STRIPE_SECRET_KEY }}
          
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: playwright-report
          path: playwright-report/
          
      - name: Report to Datadog
        if: always()
        run: pnpm report:datadog
        env:
          DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
```

## Implementation Timeline

1. **Phase 1: Foundation (Week 1)**
   - Set up E2E test architecture
   - Implement database isolation
   - Create webhook simulators
   - Develop page objects

2. **Phase 2: Authentication Tests (Week 1)**
   - Implement auth flow tests
   - Test role-based access
   - Test profile management

3. **Phase 3: Booking-Payment Tests (Week 2)**
   - Implement booking flow tests
   - Test Calendly integration
   - Test Stripe integration
   - Test error recovery flows

4. **Phase 4: Marketplace Tests (Week 2)**
   - Implement search tests
   - Test filtering and navigation
   - Test integration with booking

5. **Phase 5: Visual & Monitoring (Week 3)**
   - Set up visual testing
   - Implement Sentry integration
   - Set up Datadog reporting

6. **Phase 6: CI/CD Integration (Week 3)**
   - Configure GitHub Actions
   - Set up test reporting
   - Implement performance benchmarking

## Integration with Existing Test Infrastructure

The new E2E testing implementation will build upon the existing test infrastructure:

1. **Authentication Utilities**:
   - Leverage `__tests__/utils/e2e-auth-utils.ts` for auth state management
   - Extend with role-specific testing capabilities

2. **Database Utilities**:
   - Enhance `__tests__/utils/database/reset.ts` for E2E test isolation
   - Implement deterministic seeding for repeatable tests

3. **MSW Integration**:
   - Apply lessons from MSW fixes to E2E mocking strategies
   - Create consistent patterns for API simulation

4. **Visual Testing**:
   - Extend existing visual regression tests
   - Implement cross-browser visual testing

This comprehensive plan will ensure robust coverage of critical user journeys, making the platform more resilient to changes and providing confidence in new feature deployments.