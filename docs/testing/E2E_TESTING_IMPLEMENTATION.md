# E2E Testing Implementation

This document outlines the implementation of end-to-end (E2E) testing for the BuildAppsWith platform using Playwright.

## Testing Architecture

The E2E test suite is organized around three core user flows:

1. **Authentication Flows**
   - Sign-up process
   - Login with role-based redirects
   - Profile management and role switching
   - Authentication persistence

2. **Booking Journeys**
   - Builder selection
   - Session type selection
   - Calendar and time slot booking
   - Form validation
   - Payment processing with Stripe
   - Booking management (view, reschedule, cancel)

3. **Marketplace Discovery**
   - Browse experience
   - Search functionality
   - Filtering and sorting
   - Builder profile viewing

## Directory Structure

```
__tests__/
  e2e/
    auth/
      signin.test.ts
      signup.test.ts
      profile-management.test.ts
    booking/
      booking-flow.test.ts
      booking-management.test.ts
      payment-integration.test.ts
    marketplace/
      browse-experience.test.ts
      search-filter.test.ts
      builder-profile.test.ts
    visual/
      visual-regression.test.ts
      snapshots.test.ts
  utils/
    e2e-auth-utils.ts
    e2e-async-utils.ts
```

## Authentication State Management

The test framework implements a sophisticated authentication state management system:

- Pre-created authentication states for different user roles (client, builder, admin)
- Storage of authentication state between test runs for performance
- Programmatic login for tests requiring fresh authentication
- Global setup to initialize auth states before test execution

### Test User Personas

| Role | Email | Password | Use Cases |
|------|-------|----------|-----------|
| Client | test-client@buildappswith.com | TestClient123! | Browsing, booking |
| Premium Client | premium-client@buildappswith.com | PremiumClient123! | Rebooking, history |
| New Builder | new-builder@buildappswith.com | NewBuilder123! | Profile setup |
| Established Builder | established-builder@buildappswith.com | EstablishedBuilder123! | Managing bookings |
| Admin | admin@buildappswith.com | AdminUser123! | Admin features |
| Multi-role | multi-role@buildappswith.com | MultiRole123! | Role switching |

## Asynchronous Operation Utilities

The `e2e-async-utils.ts` module provides utilities for handling asynchronous operations:

- Element stability detection for animations
- Network request monitoring and idle detection
- API response waiting
- Toast notification detection
- Form validity checking
- Retry mechanisms for flaky operations

## Visual Regression Testing

The framework includes visual regression testing using Playwright's built-in capabilities:

- Baseline screenshots stored in `__tests__/e2e/visual/visual-regression.test.ts-snapshots/`
- Tests for critical pages across different browsers and device sizes
- Configurable pixel difference thresholds

### Managing Visual Baselines

When UI changes are intentional, update the visual baselines:

```bash
pnpm exec playwright test --config=playwright.visual.config.ts visual-regression.test.ts --update-snapshots
```

## Configuration

Two Playwright configurations are provided:

1. **Standard E2E Tests**: `playwright.config.ts`
   - Includes authentication setup
   - Runs functional tests across browsers

2. **Visual Tests**: `playwright.visual.config.ts`
   - Skips authentication setup
   - Configures visual comparison settings
   - Runs visual regression tests

## Running Tests

Execute the following commands to run tests:

### All E2E Tests
```bash
pnpm exec playwright test
```

### Authentication Tests Only
```bash
pnpm exec playwright test auth/
```

### Booking Tests Only
```bash
pnpm exec playwright test booking/
```

### Marketplace Tests Only
```bash
pnpm exec playwright test marketplace/
```

### Visual Regression Tests
```bash
pnpm exec playwright test --config=playwright.visual.config.ts visual-regression.test.ts
```

### Update Visual Baselines
```bash
pnpm exec playwright test --config=playwright.visual.config.ts visual-regression.test.ts --update-snapshots
```

## CI Integration

The E2E tests are configured to run in CI environments with appropriate settings:

- Reduced parallelism in CI to prevent resource contention
- Automatic retry for flaky tests
- JSON report generation for CI visualization
- Screenshot capture on test failure

## Best Practices

When writing or modifying E2E tests:

1. **Test Isolation**: Each test should be independent and not rely on state from other tests
2. **Deterministic Selectors**: Prefer data-testid attributes for stable element selection
3. **Waiting Patterns**: Use appropriate waiting strategies instead of arbitrary timeouts
4. **Error Scenarios**: Test both happy paths and error conditions
5. **Visual Testing**: Update visual baselines when making intentional UI changes
6. **Authentication**: Use the appropriate authentication state for your test scenario