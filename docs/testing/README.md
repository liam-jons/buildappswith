# BuildAppsWith Testing Framework

This document provides an overview of the testing infrastructure implemented for the BuildAppsWith platform.

## Table of Contents

1. [Test Types](#test-types)
2. [Testing Tools](#testing-tools)
3. [Directory Structure](#directory-structure)
4. [Test Configuration](#test-configuration)
5. [Mock Service Worker (MSW)](#mock-service-worker-msw)
6. [Authentication Testing](#authentication-testing)
7. [Database Testing](#database-testing)
8. [Running Tests](#running-tests)
9. [Writing New Tests](#writing-new-tests)
10. [CI/CD Integration](#cicd-integration)
11. [Common Issues and Solutions](#common-issues-and-solutions)

## Test Types

The testing framework includes:

- **Unit Tests**: Test individual functions, hooks, and components in isolation.
- **Integration Tests**: Test how components and services work together.
- **API Tests**: Test API endpoints and server routes.
- **End-to-End Tests**: Test complete user journeys through the application.
- **Visual Tests**: Test UI components for visual regression.
- **Accessibility Tests**: Ensure components meet accessibility standards.

## Testing Tools

The following tools are used in the testing framework:

- **Vitest**: Fast test runner for unit and integration tests
- **React Testing Library**: Component testing utilities
- **Mock Service Worker (MSW)**: API mocking for frontend tests
- **Playwright**: End-to-end testing framework
- **Jest-Axe**: Accessibility testing
- **Datadog**: Test reporting and monitoring

## Directory Structure

```
__tests__/
├── api/                      # API route tests
├── components/               # React component tests
├── e2e/                      # End-to-end tests using Playwright
├── integration/              # Integration tests for multiple components
├── middleware/               # Middleware tests
├── mocks/                    # Mock data and MSW handlers
│   ├── auth/                 # Authentication mocks
│   ├── marketplace/          # Marketplace mocks
│   ├── profile/              # Profile mocks
│   ├── scheduling/           # Scheduling mocks
│   ├── handlers.ts           # Combined MSW handlers
│   ├── initMocks.ts          # MSW initialization
│   └── server.ts             # MSW server setup
├── unit/                     # Unit tests
└── utils/                    # Test utilities
    ├── database/             # Database testing utilities
    ├── factory/              # Test data factories
    ├── seed/                 # Database seeding utilities
    ├── api-test-utils.ts     # API testing helpers
    ├── auth-test-utils.ts    # Authentication testing helpers
    ├── db-test-utils.ts      # Database testing helpers
    └── models.ts             # Test data models
```

## Test Configuration

### Vitest Configuration

Vitest is configured in `vitest.config.ts` with the following settings:

- **Test Environment**: JSDOM for simulating browser environment
- **Setup Files**: `vitest.setup.ts` for global test configuration
- **Coverage**: V8 provider with text, JSON, HTML, and JSON-summary reporters
- **Test Patterns**: Matches files with `.test.ts` and `.test.tsx` extensions

### MSW Configuration

Mock Service Worker is set up in:
- `__tests__/mocks/server.ts`: Server instance setup
- `__tests__/mocks/handlers.ts`: API route handlers
- `__tests__/mocks/initMocks.ts`: Lifecycle management

## Mock Service Worker (MSW)

MSW is used to mock API requests in tests. We've implemented comprehensive improvements to our MSW integration - see [MSW Integration Fixes](./MSW_INTEGRATION_FIXES.md) for details on all the enhancements.

### Basic Usage

```typescript
import { apiMock } from '@/__tests__/utils/api-test-utils';

// In your test setup
beforeEach(() => {
  // Mock a GET endpoint
  apiMock.get('/api/users', [{ id: 1, name: 'Test User' }]);

  // Mock a POST endpoint
  apiMock.post('/api/users/create', { id: 2, name: 'New User' });

  // Mock an error response
  apiMock.error('/api/users/invalid', 'get', 'User not found', 404);
});

// Clean up after tests
afterEach(() => {
  apiMock.reset();
});
```

### Capturing Request Data

```typescript
// Capture request data for inspection
const captureMock = apiMock.capture('/api/users/create', 'post', { id: 3 });

// Make API request in your test
await userEvent.click(screen.getByText('Submit'));

// Check what was sent in the request
const requestData = captureMock.getRequestData();
expect(requestData.name).toBe('Test User');

// Get headers and query parameters
const headers = captureMock.getRequestHeaders();
const params = captureMock.getRequestParams();
```

### Advanced Features

```typescript
// Add artificial delay to test loading states
const delayedMock = apiMock.get('/api/slow-endpoint', data, 200, {
  delayMs: 1000 // 1 second delay
});

// Simulate network errors
const errorMock = apiMock.get('/api/unstable', {}, 200, {
  networkError: true
});

// Add custom response headers
const headerMock = apiMock.get('/api/users/me', data, 200, {
  headers: { 'Cache-Control': 'no-cache' }
});

// Remember to clean up mocks when done
delayedMock.cleanup();
errorMock.cleanup();
headerMock.cleanup();
```

### Debugging MSW Issues

For testing issues related to MSW, use our diagnostic tool:

```bash
# Run basic diagnostics
node ./scripts/debug-msw.js

# Run with more options
node ./scripts/debug-msw.js --help
```

## Authentication Testing

Authentication testing utilities are provided in `__tests__/utils/auth-test-utils.ts` with significant enhancements for reliable testing. See [MSW Integration Fixes](./MSW_INTEGRATION_FIXES.md) for comprehensive details.

```typescript
import { renderWithAuth, setupMockClerk } from '@/__tests__/utils/auth-test-utils';

// Render a component with authentication context
const { user, findByRoleAndWait } = renderWithAuth(<ProfilePage />, {
  userType: 'builder',
  userOverrides: {
    roles: ['BUILDER', 'CLIENT']
  },
  providers: [ThemeProvider, StoreProvider] // Optional additional providers
});

// Use the user-event instance for interaction
await user.click(screen.getByRole('button'));

// Use async helpers
const element = await findByRoleAndWait('heading', 'Profile');

// For API testing, use setupApiAuth
const apiAuth = setupApiAuth('builder');
```

Available user types with consistent Clerk IDs:
- `client`: Regular client user
- `premium-client`: Premium client user
- `builder`: Established builder
- `new-builder`: New builder account
- `admin`: Administrator
- `dual-role`: User with both client and builder roles
- `triple-role`: User with client, builder, and admin roles
- `unauthenticated`: Not signed in

Helper functions for role checking:
```typescript
import { hasRole, getRolesForUserType } from '@/__tests__/utils/auth-test-utils';

// Check if a user type has a specific role
if (hasRole('builder', 'BUILDER')) {
  // Do builder-specific testing
}

// Get all roles for a user type
const roles = getRolesForUserType('triple-role'); // ['CLIENT', 'BUILDER', 'ADMIN']
```

## Database Testing

Database testing utilities are available in `__tests__/utils/db-test-utils.ts`:

```typescript
import { withTestTransaction } from '@/__tests__/utils/db-test-utils';

it('should create a user in the database', async () => {
  await withTestTransaction(async (prisma) => {
    // Your test code here
    const result = await prisma.user.create({
      data: { name: 'Test User', email: 'test@example.com' }
    });
    
    expect(result.id).toBeDefined();
  });
  // Transaction is automatically rolled back after test
});
```

## Running Tests

The following npm scripts are available for running tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate test coverage report
pnpm test:coverage

# Run specific test categories
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:api         # API tests
pnpm test:e2e         # End-to-end tests
pnpm test:middleware  # Middleware tests

# Debug MSW integration
pnpm test:msw         # Run MSW tests with debug logging
pnpm test:msw:debug   # Run MSW diagnostic script
```

## Writing New Tests

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { apiMock, apiExpect } from '@/__tests__/utils/api-test-utils';
import { fetchUsers } from '@/lib/api-client';

describe('API Client', () => {
  it('fetches users correctly', async () => {
    // Mock the API response
    apiMock.get('/api/users', [
      { id: 1, name: 'User 1' },
      { id: 2, name: 'User 2' }
    ]);
    
    // Call the API client function
    const result = await fetchUsers();
    
    // Verify the result
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('User 1');
  });
});
```

## CI/CD Integration

Tests are integrated into the CI/CD pipeline using GitHub Actions. The workflow is defined in `.github/workflows/test-suite.yml` and includes:

- Running unit and integration tests
- Running API tests
- Generating test coverage reports
- Executing E2E tests with Playwright
- Reporting results to Datadog

## Common Issues and Solutions

For a comprehensive list of common issues and solutions, see our [MSW Integration Fixes](./MSW_INTEGRATION_FIXES.md) and [MSW Test Fixes Summary](./MSW_TEST_FIXES_SUMMARY.md) documentation.

### MSW Issues

- **Unhandled Requests**: Make sure all API endpoints used in tests have corresponding handlers in MSW.
- **Mock Timing**: Use `waitFor` from Testing Library to handle async operations.
- **Server Already Running**: The MSW server should only be started once. The implementation handles this automatically.
- **Environment Variable Dependencies**: Use `vi.stubEnv()` to mock environment variables in tests.
- **Private Method Testing**: Use type casting to `any` to access private methods in tests.

### Authentication Issues

- **Missing User Roles**: Ensure you're using the correct `userType` or providing the necessary roles in `userOverrides`.
- **Clerk API Changes**: If Clerk API changes, update the mock implementations in `auth-test-utils.ts`.

### Database Issues

- **Isolation**: Always use `withTestTransaction` to ensure test isolation.
- **Test Data**: Use factories and seeds from `__tests__/utils/factory` for consistent test data.

### Debugging Tips

- Enable MSW debugging with `DEBUG_MSW=true` environment variable
- Run the MSW diagnostic script: `pnpm test:msw:debug`
- Check test coverage reports in `test-results/coverage`
EOF < /dev/null