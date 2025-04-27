# Profile Management Testing Strategy

This document outlines the comprehensive testing approach implemented for the profile management components in Buildappswith. These components were recently refactored to use direct Clerk authentication, replacing the previous compatibility layer.

## Test Structure Overview

The test implementation is organized into three main categories:

1. **API Endpoint Tests**: Testing the `/api/profiles/user` endpoint that handles profile creation, updates, and retrieval
2. **Onboarding Page Tests**: Testing the user onboarding flow and form functionality
3. **Profile Settings Page Tests**: Testing the profile settings management interface

Each category includes both Jest (for legacy compatibility) and Vitest implementations (for future development).

## Authentication Mocking Utilities

To support testing of components that use Clerk authentication, we've created specialized mocking utilities:

### Clerk Test Utilities (`clerk-test-utils.ts`)

This module provides type-safe mocking of Clerk's authentication hooks and functions:

- `configureMockClerk()`: Creates a comprehensive mock of Clerk's API with support for different user roles
- `createUnauthenticatedMock()`: Creates a mock representing an unauthenticated state
- `createLoadingMock()`: Creates a mock representing a loading state before authentication completes
- `setupMockClerk()`: Configures the mock for a test and applies the vi.mock
- `resetMockClerk()`: Cleans up mocks after test completion

### React Testing Utilities (`vitest-auth-utils.tsx`)

This module provides React testing utilities that integrate with the Clerk mocks:

- `AuthProvider`: A React component that wraps children with authentication context
- `renderWithAuth()`: A custom render function that sets up authentication before rendering
- `requiresAuthentication()`: A helper to test if a component requires authentication
- `requiresRole()`: A helper to test if a component requires a specific role

## API Endpoint Testing Approach

For the `/api/profiles/user` endpoint, we test:

1. **GET Requests**:
   - Successful retrieval of user profile data
   - Error handling when authentication fails

2. **POST Requests**:
   - Basic profile updates with name changes
   - Adding new roles to the user
   - Builder profile creation during onboarding
   - Duplicate builder profile prevention
   - Request validation
   - Error handling for database failures

All tests use mocking for dependencies like `authData`, `clerkClient`, and the database. This ensures tests are isolated and predictable.

## Component Testing Approach

For both the onboarding page and profile settings page, we test:

1. **Rendering**:
   - Initial form rendering with correct fields and labels
   - Loading states
   - Form pre-filling with user data

2. **Authentication States**:
   - Redirects for unauthenticated users
   - Handling of loading states
   - Role-based component rendering

3. **Form Submission**:
   - Successful form submission with different roles
   - Form validation for required fields
   - Error handling for API failures
   - Loading states during submission

4. **User Experience**:
   - Form accessibility
   - Feedback to the user (toast messages)
   - Disabled fields behaving correctly

## Testing Considerations

### Accessibility Testing

All component tests include checks for accessibility:
- Form labels properly associated with inputs
- ARIA attributes correctly implemented
- Focus management during loading states
- Keyboard navigation support

### Error Handling

Comprehensive error scenarios are tested:
- API failure responses
- Network errors
- Validation errors
- Permission errors

### Edge Cases

Several edge cases are specifically tested:
- Users with multiple roles
- Unverified users
- Users with and without payment methods
- Role transitions (client to builder, etc.)

## Testing Tools and Patterns

### Mock Implementations

The tests use a consistent approach to mocking:
- Clear separation between mock declaration and implementation
- Type-safe mocks using Vitest's built-in typing
- Proper cleanup between tests to prevent cross-test contamination

### Test Fixtures

User fixtures are defined in `mocks/users.ts` with preset test users for each role:
- `client`: Standard client user
- `builder`: Standard builder user
- `admin`: Administrator user
- `multiRole`: User with multiple roles
- `unverified`: User who hasn't verified their email

### Testing Best Practices

These tests follow several key best practices:
- Each test focuses on a single behavior or scenario
- Tests are independent and don't rely on other tests
- Mocks are reset before each test
- Assertions are specific about what they're checking
- Tests use helper functions to reduce repetition

## Future Testing Improvements

While the current test implementation provides excellent coverage, future improvements could include:

1. **E2E Testing**: Adding Playwright-based end-to-end tests for critical flows
2. **Visual Regression Testing**: Implementing visual comparison for UI components
3. **Performance Testing**: Adding tests for component rendering performance
4. **Mutation Testing**: Implementing mutation testing to verify test quality
5. **Property-Based Testing**: Adding property-based tests for validation logic

## Running the Tests

Tests can be run using either Jest or Vitest:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run only profile tests
npm run test -- -t "profile"

# Run with coverage
npm run test:coverage
```

## Conclusion

The comprehensive test suite for profile management components ensures that the refactored authentication implementation works correctly across different user scenarios. By testing both API endpoints and React components, we have confidence in the robustness of the profile management system.
