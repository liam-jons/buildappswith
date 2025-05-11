# End-to-End Testing Implementation

This document provides comprehensive documentation for the E2E testing infrastructure implemented for the BuildAppsWith platform.

## Overview

Our End-to-End testing framework is built on Playwright and follows the Page Object Model pattern for maintainability and scalability. The implementation includes support for:

- Authentication state management for different user roles
- Webhook simulators for Calendly and Stripe integrations
- Database isolation and test data seeding
- Feature flag testing utilities
- Visual regression testing
- Test reporting and error tracking

## Directory Structure

```
__tests__/e2e/
├── page-objects/              # Page Object Model classes
│   ├── base-page.ts           # Base page object with common functionalities
│   ├── auth-pages.ts          # Authentication-related page objects
│   ├── marketplace-pages.ts   # Marketplace page objects
│   ├── booking-pages.ts       # Booking flow page objects
│   └── index.ts               # Export all page objects
├── utils/                     # E2E testing utilities
│   ├── webhook-simulators.ts  # Webhook simulators for Calendly and Stripe
│   ├── database-isolation.ts  # Database isolation utilities
│   ├── feature-flag-utils.ts  # Feature flag testing utilities
│   └── test-data-helpers.ts   # Test data generation utilities
├── auth/                      # Authentication-related tests
├── booking/                   # Booking flow tests
├── marketplace/               # Marketplace tests
├── global-setup.ts            # Global setup for authentication
└── basic.test.ts              # Basic tests that don't require authentication
```

## Playwright Configurations

We have multiple Playwright configurations for different testing scenarios:

- `playwright.config.ts`: Main configuration with authentication support
- `playwright.simple.config.ts`: Simplified configuration for tests without authentication
- `playwright.visual.config.ts`: Configuration for visual regression testing

### Main Configuration (playwright.config.ts)

The main configuration includes:

- Test directory: `__tests__/e2e`
- Global setup for authentication
- Multiple test projects for different browsers and authentication states
- HTML and JSON test reporters
- Screenshot on failure and trace on retry

### Simple Configuration (playwright.simple.config.ts)

The simple configuration:

- Skips authentication setup
- Only runs on Chromium browser
- Only runs tests in the `basic.test.ts` file
- Does not require any authentication state

### Visual Configuration (playwright.visual.config.ts)

The visual testing configuration:

- Includes snapshot comparison utilities
- Runs visual regression tests
- Produces visual difference reports

## Authentication in E2E Tests

Authentication state is managed using Playwright's storage state mechanism. The `global-setup.ts` script creates authenticated states for all test user roles:

- Client
- Premium Client
- New Builder
- Established Builder
- Admin
- Multi-role users

### Creating Authentication States

Authentication states are created during the global setup:

```typescript
// From global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { globalSetup as setupAuthStates } from '../utils/e2e-auth-utils';

async function globalSetup(config: FullConfig): Promise<void> {
  const browser = await chromium.launch();
  
  try {
    const { baseURL } = config.projects[0].use;
    await setupAuthStates(browser, { baseURL });
    console.log('Successfully created all authentication states');
  } catch (error) {
    console.error('Failed to setup authentication states:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
```

### Using Authentication States in Tests

Authentication states can be used in tests:

```typescript
// In a test file
import { test } from '@playwright/test';

// Use a pre-authenticated state for a specific role
test.use({ storageState: '.auth/client.json' });

test('client dashboard shows correct content', async ({ page }) => {
  await page.goto('/dashboard');
  // Test with authenticated client user
});
```

### Authentication Utilities

The `e2e-auth-utils.ts` file provides utilities for creating and managing authentication states:

- `AuthUtils.signInUser()`: Signs in a user through the UI
- `AuthUtils.createAuthState()`: Creates an authentication state for a user role
- `AuthUtils.createAllAuthStates()`: Creates auth states for all user roles
- `switchToRole()`: Switches between roles for multi-role users
- `getTestUser()`: Gets a test user by role and number

## Page Object Model

We use the Page Object Model pattern to encapsulate page-specific logic:

### Base Page

The `BasePage` class provides common functionality for all page objects:

```typescript
// Simplified example of base-page.ts
export class BasePage {
  constructor(protected page: Page) {}
  
  async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }
  
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
  
  // Common navigation methods
  async goToHome(): Promise<void> {
    await this.navigate('/');
  }
  
  async goToMarketplace(): Promise<void> {
    await this.navigate('/marketplace');
  }
  
  // Element interaction methods
  async fillInput(selector: string, text: string): Promise<void> {
    await this.page.fill(selector, text);
  }
  
  async clickButton(text: string): Promise<void> {
    await this.page.getByRole('button', { name: text }).click();
  }
  
  // Assertion methods
  async expectVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }
  
  async expectText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }
}
```

### Page Object Examples

#### Auth Pages

```typescript
// Simplified example of auth-pages.ts
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  
  async navigate(): Promise<void> {
    await super.navigate('/login');
  }
  
  async login(email: string, password: string): Promise<DashboardPage> {
    await this.page.fill('#identifier-field', email);
    await this.page.click('button[type="submit"]');
    await this.page.fill('#password-field', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL(/.*\/dashboard/);
    return new DashboardPage(this.page);
  }
}
```

#### Marketplace Pages

```typescript
// Simplified example of marketplace-pages.ts
export class MarketplacePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  
  async navigate(): Promise<void> {
    await super.navigate('/marketplace');
  }
  
  async searchForBuilder(name: string): Promise<void> {
    await this.page.fill('[data-testid="search-input"]', name);
    await this.page.press('[data-testid="search-input"]', 'Enter');
  }
  
  async filterByExpertise(expertise: string): Promise<void> {
    await this.page.click('[data-testid="filter-button"]');
    await this.page.click(`text=${expertise}`);
    await this.page.click('[data-testid="apply-filters"]');
  }
  
  async clickBuilderCard(index: number = 0): Promise<BuilderProfilePage> {
    await this.page.click(`[data-testid="builder-card"]:nth-of-type(${index + 1})`);
    await this.page.waitForURL(/.*\/marketplace\/builders\/.*/);
    return new BuilderProfilePage(this.page);
  }
}
```

#### Booking Pages

```typescript
// Simplified example of booking-pages.ts
export class BookingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  
  async navigate(builderId: string): Promise<void> {
    await super.navigate(`/book/${builderId}`);
  }
  
  async selectSessionType(name: string): Promise<void> {
    await this.page.click(`text=${name}`);
  }
  
  async selectTimeSlot(dateIndex: number = 0, timeIndex: number = 0): Promise<void> {
    // Select date
    await this.page.click(`[data-testid="date-option"]:nth-of-type(${dateIndex + 1})`);
    
    // Select time
    await this.page.click(`[data-testid="time-slot"]:nth-of-type(${timeIndex + 1})`);
    
    // Proceed
    await this.page.click('[data-testid="confirm-time-button"]');
  }
  
  async fillBookingDetails(details: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  }): Promise<void> {
    await this.page.fill('[name="name"]', details.name);
    await this.page.fill('[name="email"]', details.email);
    if (details.phone) await this.page.fill('[name="phone"]', details.phone);
    if (details.notes) await this.page.fill('[name="notes"]', details.notes);
    
    await this.page.click('[data-testid="submit-booking"]');
  }
  
  async getBookingConfirmation(): Promise<string> {
    await this.page.waitForURL(/.*\/booking\/confirmation\/.*/);
    return this.page.locator('[data-testid="booking-reference"]').textContent();
  }
}
```

## Webhook Simulators

For testing Calendly and Stripe integrations, we've implemented webhook simulators that generate properly signed payloads:

### Calendly Webhook Simulator

```typescript
// Simplified example from webhook-simulators.ts
export async function simulateCalendlyWebhook(
  request: APIRequestContext,
  {
    event,
    payload,
    signature = generateCalendlySignature(payload)
  }: {
    event: string;
    payload: Record<string, any>;
    signature?: string;
  }
): Promise<APIResponse> {
  const webhookUrl = '/api/webhooks/calendly';
  
  return request.post(webhookUrl, {
    headers: {
      'Calendly-Webhook-Signature': signature,
      'Content-Type': 'application/json'
    },
    data: {
      event,
      payload
    }
  });
}

function generateCalendlySignature(payload: Record<string, any>): string {
  const secret = process.env.CALENDLY_WEBHOOK_SECRET || 'test-secret';
  const jsonPayload = JSON.stringify(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(jsonPayload);
  return hmac.digest('hex');
}
```

### Stripe Webhook Simulator

```typescript
// Simplified example from webhook-simulators.ts
export async function simulateStripeWebhook(
  request: APIRequestContext,
  {
    eventType,
    data,
    signature = generateStripeSignature(data)
  }: {
    eventType: string;
    data: Record<string, any>;
    signature?: string;
  }
): Promise<APIResponse> {
  const webhookUrl = '/api/webhooks/stripe';
  
  const payload = {
    id: `evt_${Date.now()}`,
    object: 'event',
    api_version: '2022-11-15',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: data
    },
    type: eventType
  };
  
  return request.post(webhookUrl, {
    headers: {
      'Stripe-Signature': signature,
      'Content-Type': 'application/json'
    },
    data: payload
  });
}

function generateStripeSignature(payload: Record<string, any>): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadString = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${payloadString}`;
  const hmac = createHmac('sha256', secret);
  hmac.update(signedPayload);
  return `t=${timestamp},v1=${hmac.digest('hex')}`;
}
```

## Database Isolation

Tests use transaction-based isolation to prevent test data from persisting:

```typescript
// Simplified example from database-isolation.ts
export async function withIsolatedDatabase<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = new PrismaClient();
  
  try {
    // Start a transaction
    return await prisma.$transaction(async (tx) => {
      const result = await callback(tx);
      // Transaction will be rolled back automatically
      throw new Error('ROLLBACK_TRANSACTION');
    });
  } catch (error) {
    if (error.message \!== 'ROLLBACK_TRANSACTION') {
      throw error;
    }
    return null as any;
  } finally {
    await prisma.$disconnect();
  }
}
```

## Feature Flag Testing

Feature flag utilities allow testing different feature configurations:

```typescript
// Simplified example from feature-flag-utils.ts
export async function withFeatureFlags<T>(
  page: Page,
  flags: Record<string, boolean>,
  callback: () => Promise<T>
): Promise<T> {
  // Save original flag values
  const originalFlags = await page.evaluate(() => {
    return window.featureFlags || {};
  });
  
  // Set flags for test
  await page.evaluate((testFlags) => {
    window.featureFlags = { ...window.featureFlags, ...testFlags };
  }, flags);
  
  try {
    // Run the test with the flags set
    return await callback();
  } finally {
    // Restore original flags
    await page.evaluate((flags) => {
      window.featureFlags = flags;
    }, originalFlags);
  }
}
```

## Running Tests

### NPM Scripts

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI mode for debugging
pnpm test:e2e:ui

# Run simplified tests that don't require authentication
pnpm test:e2e:simple

# Run visual regression tests
pnpm test:visual
```

### Running with Specific Configurations

```bash
# Run a specific test file
npx playwright test path/to/test.ts

# Run tests with a specific browser
npx playwright test --project=firefox

# Run tests with a specific configuration
npx playwright test --config=playwright.simple.config.ts

# Run tests with UI mode for debugging
npx playwright test --ui

# Run tests and open report
npx playwright test --reporter=html && npx playwright show-report
```

## Test Reports

Playwright generates HTML and JSON reports for test runs:

- HTML report: Available at the URL displayed after test completion
- JSON report: Saved in `test-results/e2e/playwright-results.json`

## Best Practices

1. **Use Page Objects**: Encapsulate page-specific logic in page objects
2. **Prefer Role-Based Selectors**: Use `getByRole()` instead of CSS selectors when possible
3. **Robust Selectors**: Make selectors robust to UI changes
4. **Proper Waits**: Use explicit waits rather than arbitrary timeouts
5. **Independent Tests**: Tests should be independent and not rely on each other
6. **Database Isolation**: Always use database isolation utilities
7. **Test Data**: Use test data helpers to create consistent test data

## Known Issues and Workarounds

1. **Authentication Selectors**: Clerk authentication selectors can change. Our solution uses multiple selector strategies with fallbacks.
2. **Visual Testing Flakiness**: Element positions can change slightly across browsers. Use comparison with tolerance.
3. **Dev Server Synchronization**: Tests may start before the dev server is ready. Use retry mechanisms.
4. **File Uploads**: Use Playwright's `setInputFiles()` method for file uploads rather than simulating drag-and-drop.
5. **Mobile Testing**: Mobile mode requires different selectors. Use the proper device emulation settings.

## Future Improvements

1. Add more page objects for additional user journeys
2. Improve test parallelization and performance
3. Add axe accessibility testing
4. Implement API-driven auth state setup for better performance
5. Integrate with CI/CD for automated testing on pull requests
EOF < /dev/null