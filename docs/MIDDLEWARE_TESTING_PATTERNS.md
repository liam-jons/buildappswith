# Middleware Testing Patterns

This document outlines the established patterns for testing middleware components in the Buildappswith platform. These patterns ensure consistent, reliable, and maintainable tests across the codebase.

## Version: 1.0.80

## Table of Contents

1. [Testing Architecture](#testing-architecture)
2. [Manual Module Mocking](#manual-module-mocking)
3. [Test Utilities](#test-utilities)
4. [Common Test Patterns](#common-test-patterns)
5. [Troubleshooting](#troubleshooting)

## Testing Architecture

The middleware testing architecture follows these key principles:

- **Isolation**: Each middleware component can be tested independently
- **Composition**: Full middleware stack can be tested through integration tests
- **Configurability**: Tests can modify middleware behavior through configuration
- **Reliability**: Consistent mocking patterns avoid timing and ordering issues

The test files are organized as follows:

- `__tests__/middleware/factory.test.ts`: Tests for the middleware factory
- `__tests__/middleware/integration.test.ts`: End-to-end middleware stack tests
- `__tests__/middleware/config.test.ts`: Configuration validation tests
- `__tests__/middleware/performance.test.ts`: Performance monitoring tests

## Manual Module Mocking

We use Vitest's manual module mocking capabilities to create reliable, consistent mocks for external dependencies. This approach avoids hoisting issues that can occur with inline `vi.mock()` calls.

### Directory Structure

```
/__mocks__/             # Mock implementations directory
  /@clerk/              # External package mocks
    /nextjs.ts          # Clerk authentication mocks
  /lib/                 # Internal module mocks (when needed)
    /csrf.ts            # CSRF protection mocks
    /rate-limit.ts      # Rate limiting mocks
```

### Implementation Pattern

All mocks follow this consistent pattern:

1. Define a mock implementation function
2. Create a vi.fn() wrapper
3. Export the wrapped function

Example from `__mocks__/@clerk/nextjs.ts`:

```typescript
// Define mock implementation
const authMiddlewareMock = (options: any) => {
  return async (req: NextRequest) => {
    // Implementation
    // ...
    return options.afterAuth(
      authState,
      req,
      { nextUrl: req.nextUrl }
    );
  };
};

// Create vi.fn() wrapper and export
export const authMiddleware = vi.fn(authMiddlewareMock);
```

This approach ensures that:
- The mocks support method chaining (mockImplementationOnce, mockReturnValue, etc.)
- Tests can override the default behavior when needed
- Tests can assert on how the mocks were called

## Test Utilities

The `/lib/middleware/test-utils.ts` file provides shared utilities for middleware testing:

### Request Creation

```typescript
// Create a mock request with headers
const req = createMockRequest('/api/test', 'GET', {
  'x-auth-user-id': 'user123',
  'x-csrf-token': 'valid-token'
});
```

### Authentication State

```typescript
// Create authenticated state
const authenticatedState = createMockAuthState('user123', false);

// Create public route state
const publicRouteState = createMockAuthState(null, true);
```

### Response Mocking

```typescript
// Create a JSON response with status code
const response = mockJsonResponse({ error: 'Unauthorized' }, { status: 401 });
```

## Common Test Patterns

### Mocking Authentication State

Use the centralized mock to override authentication behavior for specific tests:

```typescript
// Configure auth middleware with authenticated state
authMiddleware.mockImplementationOnce((options) => {
  return async (req: NextRequest) => {
    return options.afterAuth(authenticatedState, req, { nextUrl: req.nextUrl });
  };
});
```

### Testing API Protection

Test API protection by configuring the mock to return specific responses:

```typescript
// Mock CSRF protection to fail
vi.mocked(csrfProtection).mockResolvedValueOnce(
  mockJsonResponse({ error: 'Invalid CSRF token' }, { status: 403 })
);
```

### Testing Redirect Flows

Test redirect behavior by mocking the redirect function:

```typescript
// Set up redirect mock
const mockRedirectResponse = NextResponse.redirect(new URL('/sign-in', 'http://localhost'));
Object.defineProperty(mockRedirectResponse, 'status', { value: 307 });
redirectToSignIn.mockReturnValueOnce(mockRedirectResponse);
```

## Troubleshooting

### Type Errors with Mock Functions

If you encounter TypeScript errors related to mocking, such as:

```
Type error: vi.mocked(...).mockImplementationOnce is not a function
```

Ensure you're using the recommended pattern with separated mock implementation:

```typescript
// ❌ Incorrect: Direct mockImplementation
export const myMock = vi.fn().mockImplementation(() => {});

// ✅ Correct: Separated mock function 
const myMockImpl = () => {};
export const myMock = vi.fn(myMockImpl);
```

### Mock Not Working as Expected

If your mock doesn't behave as expected, check:

1. That you're using the actual mock and not a copy
2. That the mock is being reset between tests with `vi.resetAllMocks()`
3. That the mock is properly imported in your test file

### Inconsistent Test Results

If tests are passing individually but failing when run together:

1. Check for shared state between tests (mocks, global variables)
2. Ensure `beforeEach` hooks properly reset all mocks
3. Use `vi.resetAllMocks()` to clear all mock state between tests

---

This document will be updated as our testing patterns evolve. For questions or suggestions, please refer to the DECISIONS.md file for context on our testing approach.
