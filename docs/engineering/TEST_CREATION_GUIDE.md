# Test Creation Guide

This document provides guidance for creating new tests in the Buildappswith platform, particularly focusing on components that interact with the authentication system.

## Test Structure

When creating component tests, follow this general structure:

1. **Setup and Imports**: Import necessary utilities and components, set up mocks.
2. **Test Descriptions**: Use clear, descriptive test names.
3. **Reset Mocks**: Reset all mocks after each test to ensure clean state.
4. **Test Basic Rendering**: Verify basic component rendering before testing interactions.
5. **Test Edge Cases**: Include tests for minimal data, edge cases, and error states.
6. **Test Authentication States**: Test both authenticated and unauthenticated states.
7. **Test Role-Based Behavior**: Test component behavior with different user roles.
8. **Test Accessibility**: Verify accessibility attributes and features.

## Authentication Testing

For components that interact with authentication:

### Authenticated Testing

```typescript
import { renderWithAuth } from '../../utils/auth-test-utils';

it('renders content for authenticated users', () => {
  const { getByText } = renderWithAuth(<YourComponent />, {
    userType: 'client', // or 'builder', 'admin', 'multiRole', 'unverified'
    userOverrides: {
      // Override specific user properties if needed
      name: 'Custom Name',
    },
  });
  
  expect(getByText('Protected Content')).toBeInTheDocument();
});
```

### Unauthenticated Testing

```typescript
import { resetMockClerk, createUnauthenticatedMock } from '../../utils/auth-test-utils';
import { vi } from 'vitest';

it('renders correctly for unauthenticated users', () => {
  // Set up unauthenticated state with Clerk
  resetMockClerk();
  vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
  
  const { getByText } = render(<YourComponent />);
  
  expect(getByText('Sign In')).toBeInTheDocument();
});
```

### Role-Based Testing

```typescript
it('shows different content based on user role', () => {
  // Test with client role
  const { getByText, queryByText, unmount } = renderWithAuth(<YourComponent />, {
    userType: 'client',
  });
  
  expect(getByText('Client Content')).toBeInTheDocument();
  expect(queryByText('Admin Content')).not.toBeInTheDocument();
  
  // Clean up
  unmount();
  
  // Test with admin role
  const { getByText: adminGetByText } = renderWithAuth(<YourComponent />, {
    userType: 'admin',
  });
  
  expect(adminGetByText('Admin Content')).toBeInTheDocument();
});
```

## Mocking Components

When testing components that include other complex components, mock them to simplify testing:

```typescript
// Mock the ValidationTierBadge component
vi.mock('@/components/profile/validation-tier-badge', () => ({
  ValidationTierBadge: ({ tier, size }: { tier: string, size?: string }) => (
    <div data-testid={`validation-tier-${tier}`} data-size={size}>
      Validation Tier: {tier}
    </div>
  ),
}));
```

## Testing Functionality

Test user interactions using fireEvent:

```typescript
it('handles button click correctly', () => {
  const { getByText } = renderWithAuth(<YourComponent />);
  
  // Click a button
  fireEvent.click(getByText('Submit'));
  
  // Check expected outcome
  expect(getByText('Success')).toBeInTheDocument();
});
```

## Testing Accessibility

Always include accessibility-focused tests:

```typescript
it('provides accessible information', () => {
  const { getByAltText, getByRole } = render(<YourComponent />);
  
  // Check alt text for images
  expect(getByAltText('Descriptive alt text')).toBeInTheDocument();
  
  // Check accessible role for interactive elements
  expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();
});
```

## Best Practices

1. **Use TypeScript**: Always use TypeScript for new test files.
2. **Clear Test Names**: Use descriptive test names that explain what behavior is being tested.
3. **Reset Mocks**: Always reset mocks between tests to ensure a clean state.
4. **Test Edge Cases**: Include tests for minimal data, empty states, and error conditions.
5. **Version Control**: Update version numbers and changelogs when adding significant tests.
6. **Documentation**: Keep test documentation up to date with any new patterns or approaches.
7. **Avoid Redundancy**: Don't duplicate test cases unnecessarily; focus on unique behaviors.
8. **Follow Established Patterns**: Use the existing test patterns in the codebase for consistency.

## References

- [TEST_MIGRATION_PLAN.md](/docs/TEST_MIGRATION_PLAN.md)
- [Clerk Testing Documentation](https://clerk.com/docs/testing/testing-overview)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Testing Library Documentation](https://testing-library.com/docs/)
