# Error Testing Patterns

## Overview

This document defines comprehensive patterns for testing error scenarios and edge cases in the BuildAppsWith platform. It provides a structured approach to ensure robust error handling across the application.

**Date**: May 8, 2025  
**Branch**: feature/testing-enhancement  
**Status**: Approved

## Core Error Testing Categories

### 1. Network Failures

- Request timeouts
- Connection interruptions
- Slow network conditions
- Partial data transmission

### 2. API Response Errors

- Status code errors (400s, 500s)
- Malformed response data
- Missing required fields
- Permission/authorization errors

### 3. User Input Edge Cases

- Boundary values
- Invalid format data
- Extremely large inputs
- Special characters and encoding issues

### 4. State Transition Errors

- Interrupted workflows
- Concurrent operations
- Race conditions
- Stale data handling

## Error Testing Utilities

```typescript
// __tests__/utils/error-testing.ts
import { Page, Request, Route } from '@playwright/test';

export class ErrorTestingUtils {
  /**
   * Simulates network error for specific request
   */
  static async simulateNetworkError(
    page: Page, 
    urlPattern: RegExp | string,
    errorType: 'abort' | 'timeout' | 'failed'
  ): Promise<void> {
    await page.route(urlPattern, route => {
      if (errorType === 'abort') {
        route.abort('aborted');
      } else if (errorType === 'timeout') {
        route.abort('timedout');
      } else {
        route.abort('failed');
      }
    });
  }

  /**
   * Simulates slow network for specific request
   */
  static async simulateSlowResponse(
    page: Page,
    urlPattern: RegExp | string,
    delayMs: number
  ): Promise<void> {
    await page.route(urlPattern, async route => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      await route.continue();
    });
  }

  /**
   * Simulates specific API error response
   */
  static async simulateApiError(
    page: Page,
    urlPattern: RegExp | string,
    status: number,
    body: object = { error: 'Simulated error' }
  ): Promise<void> {
    await page.route(urlPattern, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body)
      });
    });
  }

  /**
   * Simulates specific validation error
   */
  static async simulateValidationError(
    page: Page,
    urlPattern: RegExp | string, 
    fieldErrors: Record<string, string>
  ): Promise<void> {
    await page.route(urlPattern, route => {
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Validation Error',
          fields: fieldErrors
        })
      });
    });
  }

  /**
   * Simulates authorization error
   */
  static async simulateAuthError(
    page: Page,
    urlPattern: RegExp | string,
    authErrorType: 'unauthorized' | 'forbidden' = 'unauthorized'
  ): Promise<void> {
    const status = authErrorType === 'unauthorized' ? 401 : 403;
    const message = authErrorType === 'unauthorized' 
      ? 'Authentication required' 
      : 'Insufficient permissions';
      
    await page.route(urlPattern, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: message
        })
      });
    });
  }

  /**
   * Simulates service unavailable error
   */
  static async simulateServiceUnavailable(
    page: Page,
    urlPattern: RegExp | string
  ): Promise<void> {
    await page.route(urlPattern, route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Service Temporarily Unavailable'
        })
      });
    });
  }

  /**
   * Simulates partial response with missing fields
   */
  static async simulatePartialResponse(
    page: Page,
    urlPattern: RegExp | string,
    transform: (data: any) => any
  ): Promise<void> {
    await page.route(urlPattern, async route => {
      const response = await route.fetch();
      const data = await response.json();
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(transform(data))
      });
    });
  }

  /**
   * Simulates network conditions
   */
  static async simulateNetworkConditions(
    page: Page, 
    conditions: {
      download?: number; // Download speed in bytes/s
      upload?: number;   // Upload speed in bytes/s
      latency?: number;  // Latency in ms
    }
  ): Promise<void> {
    const { download = undefined, upload = undefined, latency = undefined } = conditions;
    const client = await page.context().newCDPSession(page);
    
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: download,
      uploadThroughput: upload,
      latency
    });
  }

  /**
   * Restore normal network conditions
   */
  static async restoreNetworkConditions(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);
    
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0
    });
  }
}
```

## Example Error Testing Patterns

### Network Error Testing Pattern

```typescript
// Example test for network error handling
import { test, expect } from '@playwright/test';
import { ErrorTestingUtils } from '../utils/error-testing';

test('displays error message when API request fails due to network error', async ({ page }) => {
  // Go to page that makes API requests
  await page.goto('/marketplace');
  
  // Simulate network error for API call
  await ErrorTestingUtils.simulateNetworkError(
    page, 
    /\/api\/marketplace\/builders/,
    'failed'
  );
  
  // Trigger action that makes the API call
  await page.getByRole('button', { name: 'Load More' }).click();
  
  // Verify error handling UI is shown
  await expect(page.getByTestId('error-message')).toBeVisible();
  await expect(page.getByText(/network error|connection issue/i)).toBeVisible();
  
  // Verify retry functionality
  await page.getByRole('button', { name: /retry|try again/i }).click();
  
  // Restore normal behavior first
  await page.unroute(/\/api\/marketplace\/builders/);
  
  // Verify recovery after retry
  await expect(page.getByTestId('builder-card')).toBeVisible();
});
```

### API Error Testing Pattern

```typescript
// Example test for API error handling
import { test, expect } from '@playwright/test';
import { ErrorTestingUtils } from '../utils/error-testing';

test('handles validation errors during form submission', async ({ page }) => {
  // Navigate to booking page
  await page.goto('/book/established-builder');
  
  // Select session type and move to booking form
  await page.getByTestId('session-type-card').first().click();
  await page.getByRole('button', { name: /continue/i }).click();
  
  // Move to calendar view and select date/time
  const availableDay = page.locator('.calendar-day:not(.calendar-day-disabled)').first();
  await availableDay.click();
  await page.getByTestId('time-slot').first().click();
  await page.getByRole('button', { name: /continue/i }).click();
  
  // Set up validation error simulation
  await ErrorTestingUtils.simulateValidationError(
    page,
    /\/api\/scheduling\/bookings/,
    {
      description: 'Project description is too short',
      email: 'Invalid email format'
    }
  );
  
  // Fill and submit form
  await page.getByLabel(/project description/i).fill('Test');
  await page.getByRole('button', { name: /continue|next|payment/i }).click();
  
  // Verify specific error messages are displayed
  await expect(page.getByText(/description is too short/i)).toBeVisible();
  await expect(page.getByText(/invalid email format/i)).toBeVisible();
  
  // Clear error simulation
  await page.unroute(/\/api\/scheduling\/bookings/);
  
  // Fix form and retry
  await page.getByLabel(/project description/i).fill('This is a detailed project description that meets the minimum length requirements.');
  await page.getByRole('button', { name: /continue|next|payment/i }).click();
  
  // Verify progress to next step
  await expect(page).toHaveURL(/.*checkout\.stripe\.com.*|.*\/payment.*/);
});
```

### Authentication Error Testing Pattern

```typescript
// Example test for authentication error handling
import { test, expect } from '@playwright/test';
import { ErrorTestingUtils } from '../utils/error-testing';

test('handles session expiration gracefully', async ({ page }) => {
  // Log in first
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test-client@buildappswith.com');
  await page.getByLabel(/password/i).fill('TestClient123!');
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  
  // Navigate to profile page
  await page.goto('/dashboard');
  
  // Simulate auth token expiration
  await ErrorTestingUtils.simulateAuthError(
    page,
    /\/api\/profiles\/me/,
    'unauthorized'
  );
  
  // Trigger authenticated request
  await page.getByRole('button', { name: /refresh/i }).click();
  
  // Verify user is prompted to reauthenticate
  await expect(page.getByText(/session expired|log in again/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  
  // Clear route override
  await page.unroute(/\/api\/profiles\/me/);
});
```

### Service Outage Testing Pattern

```typescript
// Example test for service unavailable handling
import { test, expect } from '@playwright/test';
import { ErrorTestingUtils } from '../utils/error-testing';

test('handles backend service outage appropriately', async ({ page }) => {
  // Navigate to booking page
  await page.goto('/book/established-builder');
  
  // Simulate service outage for all API calls
  await ErrorTestingUtils.simulateServiceUnavailable(
    page,
    /\/api\/.*/
  );
  
  // Try to interact with the page
  await page.getByTestId('session-type-card').first().click();
  await page.getByRole('button', { name: /continue/i }).click();
  
  // Verify system-wide error message
  await expect(page.getByTestId('service-error')).toBeVisible();
  await expect(page.getByText(/service (unavailable|temporarily down)/i)).toBeVisible();
  
  // Verify presence of alternative contact method
  await expect(page.getByText(/contact support|try again later/i)).toBeVisible();
  
  // Clear route override
  await page.unroute(/\/api\/.*/);
});
```

## Error Testing Guidelines

### Test Recovery

Always test that the application can recover after errors are resolved:

```typescript
test('recovers after connection is restored', async ({ page }) => {
  // Setup error condition
  await ErrorTestingUtils.simulateNetworkError(/* ... */);
  
  // Verify error state
  // ...
  
  // Restore normal conditions
  await page.unroute(/* ... */);
  
  // Verify recovery
  await page.getByRole('button', { name: /retry/i }).click();
  await expect(page.getByTestId('content')).toBeVisible();
});
```

### User Experience

Focus on validation of error messages, retry options, and fallback content:

```typescript
test('shows user-friendly error messages', async ({ page }) => {
  // Setup technical error
  await ErrorTestingUtils.simulateApiError(
    page,
    /\/api\/data/,
    500,
    { error: 'Internal server error: ECONNREFUSED' }
  );
  
  // Trigger error
  await page.getByRole('button', { name: /load data/i }).click();
  
  // Verify user-friendly error (not technical details)
  await expect(page.getByText(/something went wrong/i)).toBeVisible();
  await expect(page.getByText(/ECONNREFUSED/)).not.toBeVisible();
});
```

### Error Boundaries

Test that errors don't cascade beyond expected boundaries:

```typescript
test('error boundary contains component errors', async ({ page }) => {
  // Navigate to page with error boundary
  await page.goto('/marketplace');
  
  // Inject script to cause React error in component
  await page.evaluate(() => {
    const element = document.querySelector('[data-testid="builder-card"]');
    if (element) {
      const error = new Error('Injected error for testing');
      error.name = 'TestingError';
      throw error;
    }
  });
  
  // Verify error boundary caught the error
  await expect(page.getByTestId('error-boundary')).toBeVisible();
  
  // Verify error doesn't affect other components
  await expect(page.getByTestId('search-filters')).toBeVisible();
});
```

### Consistency

Test consistent error handling patterns across similar components:

```typescript
test('shows consistent error UI across components', async ({ page }) => {
  // Set up error for different components
  await ErrorTestingUtils.simulateApiError(
    page,
    /\/api\/marketplace/,
    500
  );
  
  await ErrorTestingUtils.simulateApiError(
    page,
    /\/api\/scheduling/,
    500
  );
  
  // Navigate to pages with similar components
  await page.goto('/marketplace');
  await expect(page.getByTestId('error-message')).toBeVisible();
  
  await page.goto('/book/builder');
  await expect(page.getByTestId('error-message')).toBeVisible();
  
  // Verify consistent styling and message pattern
  const marketplaceError = await page.getByTestId('error-message').screenshot();
  
  await page.goto('/book/builder');
  const bookingError = await page.getByTestId('error-message').screenshot();
  
  // Compare visual consistency
  expect(marketplaceError).toMatchSnapshot('error-ui.png');
});
```

### Edge Cases

Include timing-related tests like errors during form submission and page navigation:

```typescript
test('handles error during form submission', async ({ page }) => {
  // Navigate to form
  await page.goto('/book/builder');
  
  // Fill out form
  await page.getByLabel(/name/i).fill('Test User');
  
  // Set up error to trigger DURING submission
  await page.route(/\/api\/booking/, async route => {
    // Let request start but fail midway
    await new Promise(resolve => setTimeout(resolve, 500));
    route.abort('failed');
  });
  
  // Submit form and verify loading state
  await page.getByRole('button', { name: /submit/i }).click();
  await expect(page.getByTestId('loading-indicator')).toBeVisible();
  
  // Verify error state after failure
  await expect(page.getByTestId('error-message')).toBeVisible();
  
  // Verify form data is preserved
  await expect(page.getByLabel(/name/i)).toHaveValue('Test User');
});
```

## Integration with Testing Framework

### Test Tags

Use test tags to categorize error tests:

```typescript
test.describe('Error handling', () => {
  test('handles network errors', async ({ page }) => {
    // Test network errors
  });

  test('handles validation errors', async ({ page }) => {
    // Test validation errors
  });
  
  test('handles authentication errors', async ({ page }) => {
    // Test auth errors
  });
  
  test('handles service unavailability', async ({ page }) => {
    // Test service unavailability
  });
});
```

### Test Data

Use specialized test data for error scenarios:

```typescript
// In test data seeds
export const errorTestData = {
  invalidUser: {
    // User with invalid data for testing validation
  },
  expiredSession: {
    // User with expired session for testing auth errors
  },
  // Other error-specific test data
};
```

## Best Practices

1. **Test Recovery**: Always test that the application can recover after errors are resolved
2. **User Experience**: Focus on validation of error messages, retry options, and fallback content
3. **Error Boundaries**: Test that errors don't cascade beyond expected boundaries
4. **Consistency**: Test consistent error handling patterns across similar components
5. **Edge Cases**: Include timing-related tests like errors during form submission and page navigation

## Common Pitfalls

1. **Only testing happy path flows**: Ensure all error scenarios are covered
2. **Missing tests for transient network conditions**: Test intermittent failures and recovery
3. **Not checking error recovery mechanisms**: Verify system can recover from errors
4. **Hardcoding error expectations**: Test for user-friendly messages, not implementation details
5. **Ignoring edge cases**: Test rare but important scenarios like concurrent operations

## Implementation Timeline

1. **Phase 1**: Error testing utilities implementation (Completed)
2. **Phase 2**: Network and API error testing patterns (Completed)
3. **Phase 3**: Authentication and validation error patterns (Completed)
4. **Phase 4**: Service unavailability and system error patterns (In Progress)
5. **Phase 5**: Integration with existing test suites (Planned)