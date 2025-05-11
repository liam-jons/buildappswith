# MSW Integration Fixes

This document provides detailed information about the improvements made to the Mock Service Worker (MSW) integration in the BuildAppsWith testing framework.

## Overview

We've implemented several significant improvements to the MSW testing infrastructure to resolve common issues and enhance the developer experience:

1. **Robust Singleton Pattern**
   - Eliminated duplicate server initialization issues
   - Added proper state tracking and lifecycle management
   - Improved server reuse across test suites

2. **Enhanced Request Handling**
   - Added support for delayed responses
   - Added simulation of network errors
   - Improved request data capture and inspection
   - Enhanced error response formatting

3. **Standardized Authentication Testing**
   - Integrated Clerk test user IDs with consistent mocks
   - Added automatic mock state tracking and resetting
   - Enhanced component rendering with authentication

4. **Debugging Utilities**
   - Created comprehensive debug script with diagnostic options
   - Added detailed logging for request/response flow
   - Implemented active mock tracking

5. **Comprehensive Integration Test**
   - Created test suite to verify all MSW functionality
   - Added validation for auth integration

## Key Files Updated

The following key files were updated:

1. **`__tests__/mocks/server.ts`**
   - Implemented true singleton pattern for MSW server
   - Added enhanced logging with configurable detail levels
   - Added proper error handling for unhandled exceptions

2. **`__tests__/mocks/initMocks.ts`**
   - Added proper test run counting to prevent premature server shutdown
   - Improved handler reset logic to maintain default handlers
   - Enhanced lifecycle hooks

3. **`__tests__/utils/api-test-utils.ts`**
   - Completely redesigned API mocking utilities
   - Added support for network errors, delays, and headers
   - Enhanced request capture with parameter extraction
   - Added cleanup methods for all mocks

4. **`__tests__/utils/auth-test-utils.ts`**
   - Standardized authentication testing with consistent Clerk IDs
   - Added automatic state tracking for tests
   - Enhanced component rendering with additional providers
   - Added helper methods for role verification

5. **`scripts/debug-msw.js`**
   - Created advanced diagnostic tool for MSW issues
   - Added command line options for different debugging modes
   - Implemented fix suggestions for common issues

6. **`__tests__/unit/msw-integration.test.ts`**
   - Implemented comprehensive test suite for MSW functionality
   - Added tests for all new features

## Using the Enhanced MSW Utilities

### Basic API Mocking

```typescript
import { apiMock } from '@/__tests__/utils/api-test-utils';

// Mock a successful GET response
const getMock = apiMock.get('/api/users', [
  { id: 1, name: 'User 1' },
  { id: 2, name: 'User 2' }
]);

// Mock a successful POST response
const postMock = apiMock.post('/api/users/create', { id: 3, success: true });

// Mock an error response
const errorMock = apiMock.error('/api/users/invalid', 'get', 'User not found', 404);

// Clean up mocks when done
getMock.cleanup();
postMock.cleanup();
errorMock.cleanup();

// Or reset all mocks at once
apiMock.reset();
```

### Advanced Mocking Features

```typescript
// Mock with artificial delay (useful for testing loading states)
const delayedMock = apiMock.get('/api/slow-resource', { data: 'Success' }, 200, {
  delayMs: 1000 // 1 second delay
});

// Mock network error (useful for testing error handling)
const networkErrorMock = apiMock.get('/api/unstable-endpoint', {}, 200, {
  networkError: true
});

// Mock with custom headers
const headeredMock = apiMock.get('/api/users/me', { name: 'User' }, 200, {
  headers: {
    'Cache-Control': 'no-cache',
    'X-Custom-Header': 'custom-value'
  }
});
```

### Capturing Request Data

```typescript
// Capture request data for inspection
const captureMock = apiMock.capture('/api/users/create', 'post', { id: 3 });

// Make request in your test
await fetch('/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'New User' })
});

// Inspect captured data
const requestData = captureMock.getRequestData();
expect(requestData.name).toBe('New User');

// Inspect headers
const headers = captureMock.getRequestHeaders();
expect(headers['content-type']).toBe('application/json');

// Inspect URL parameters
const params = captureMock.getRequestParams();
expect(params.filter).toBe('active');

// Check call count
expect(captureMock.getCallCount()).toBe(1);

// Use the wasCalledWith helper
expect(captureMock.wasCalledWith({ name: 'New User' })).toBe(true);
```

### Authentication Testing

```typescript
import { renderWithAuth } from '@/__tests__/utils/auth-test-utils';

// Render a component with authentication context
const { user } = renderWithAuth(<ProfilePage />, {
  userType: 'builder',
  userOverrides: {
    roles: ['ADMIN'] // Add extra roles if needed
  },
  providers: [ThemeProvider, StoreProvider] // Add additional providers
});

// Use the user-event instance for interaction testing
await user.click(screen.getByRole('button', { name: 'Save' }));

// Use the helpers for async testing
const element = await findByRoleAndWait('heading', 'Profile');
```

### Using the Debug Tool

```bash
# Run the basic MSW diagnostics
node ./scripts/debug-msw.js

# Run with specific test pattern
node ./scripts/debug-msw.js --test "auth-flow"

# Only verify setup without running tests
node ./scripts/debug-msw.js --verify-mock-setup

# Check internal MSW state
node ./scripts/debug-msw.js --check-internals

# Try to fix common issues
node ./scripts/debug-msw.js --fix-common-issues

# Show help message
node ./scripts/debug-msw.js --help
```

## Best Practices

1. **Cleanup After Tests**
   - Always clean up mocks after tests using `mock.cleanup()` or `apiMock.reset()`
   - This prevents test interference and ensures consistent behavior

2. **Use Specific Mocks**
   - Create mocks for specific endpoints rather than broad patterns
   - This makes tests more robust and less likely to interfere with each other

3. **Match API Specifications**
   - Ensure mock responses match the actual API response structure
   - Test different response types (success, validation errors, server errors)

4. **Test Error Handling**
   - Use `apiMock.error()` and network error simulation to test error handling
   - Verify your components gracefully handle different error scenarios

5. **Verify Authentication**
   - Use consistent user types and roles when testing authenticated components
   - Test both authorized and unauthorized scenarios
   - Use `renderWithAuth()` for components that depend on authentication

6. **Debug with Logging**
   - Enable MSW debug logging when investigating issues
   - Use `debug-msw.js` to diagnose common problems

## Troubleshooting

### Common Issues

1. **Handler Conflicts**
   - Problem: Handlers from different tests interfering with each other
   - Solution: Use `mock.cleanup()` after tests and prefer `apiMock` methods over direct server use

2. **Token Authentication Issues**
   - Problem: Auth token mismatch in tests
   - Solution: Use `setupMockClerk()` and consistent clerk IDs

3. **Component Not Rendering with Auth**
   - Problem: Components requiring authentication don't render properly
   - Solution: Use `renderWithAuth()` with the correct `userType`

4. **Unhandled Requests**
   - Problem: Seeing console warnings about unhandled requests
   - Solution: Add appropriate mocks for all API calls in your tests

5. **Inconsistent Test Behavior**
   - Problem: Tests work sometimes but fail other times
   - Solution: Check for mock state persistence between tests, ensure cleanup

6. **Environment Variable Dependencies**
   - Problem: Tests failing because they depend on environment variables that aren't set in the test environment
   - Solution: Use `vi.stubEnv()` to mock environment variables in tests or directly mock modules that read environment variables

7. **Private Method Testing**
   - Problem: Tests failing because they can't access private methods in classes
   - Solution: Use type casting to `any` for the service instance in tests to allow mocking private methods:
   ```typescript
   // Type as any to allow access to private methods
   const service: any = new Service();
   // Now you can mock private methods
   service.privateMethod = vi.fn().mockResolvedValue(expectedResult);
   ```

### Using the Debug Tool

For persistent issues, run the debug tool:

```bash
node ./scripts/debug-msw.js --check-internals
```

This will show the internal state of MSW and help identify issues with handlers, server initialization, or event listeners.

## Migration Guide

If you have existing tests using the old MSW patterns, update them as follows:

1. Replace direct server handler additions:

```typescript
// Old approach
mockServer.use(
  rest.get('/api/resource', (req, res, ctx) => {
    return res(ctx.json({ data: 'value' }));
  })
);

// New approach
const mock = apiMock.get('/api/resource', { data: 'value' });
// ... test code ...
mock.cleanup(); // Don't forget to clean up
```

2. Update error mocking:

```typescript
// Old approach
mockServer.use(
  rest.get('/api/error', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  })
);

// New approach
const mock = apiMock.error('/api/error', 'get', 'Not found', 404);
// ... test code ...
mock.cleanup();
```

3. Update auth testing:

```typescript
// Old approach
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: { /* mock user */ }
  })
}));

// New approach
import { renderWithAuth } from '@/__tests__/utils/auth-test-utils';

const { user } = renderWithAuth(<Component />, {
  userType: 'builder'
});
```

## Conclusion

These improvements to the MSW integration make testing more reliable, easier to debug, and more maintainable. The standardized patterns for API mocking and authentication testing should significantly reduce the time spent dealing with test-related issues.

Remember to run the MSW integration test suite whenever making changes to the testing framework to ensure compatibility:

```bash
pnpm test __tests__/unit/msw-integration.test.ts
```