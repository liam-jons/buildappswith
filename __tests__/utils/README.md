# Test Utilities for Buildappswith

This directory contains utilities for testing components and functionality in the Buildappswith platform.

## Overview

The test utilities provide a consistent way to test components with the Clerk authentication system. They handle mocking the authentication state, user information, and other common testing needs.

## Available Utilities

### `clerk-test-utils.ts`

The core implementation of Clerk mocking utilities:

- `configureMockClerk(userType, overrides)`: Creates a mock implementation of Clerk hooks and components for a specific user type.
- `createUnauthenticatedMock()`: Creates a mock for testing unauthenticated states.
- `createLoadingMock()`: Creates a mock for testing loading states.
- `setupMockClerk(userType, overrides)`: Sets up Vitest mocking for Clerk automatically.
- `resetMockClerk()`: Resets all Clerk mocks.

### `test-utils.tsx`

The main testing utility for React Testing Library:

- `render(ui, options)`: Custom render function that wraps components with necessary providers and Clerk mocks.
- `mockFetch()`: Mock implementation of the fetch API.
- `mockApi(path, response, options)`: Helper to create mock API endpoints.
- `runAccessibilityTests(container)`: Helper for testing accessibility.

### `vitest-utils.tsx`

Similar to `test-utils.tsx` but with specific implementations for Vitest:

- `render(ui, options)`: Custom render function for Vitest tests.
- `runAccessibilityTests(container)`: Helper for testing accessibility.

## Usage Examples

### Basic Component Testing

```tsx
import { render, screen } from '@/tests/utils/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Different User Types

```tsx
import { render, screen } from '@/tests/utils/test-utils';
import ProfilePage from '@/app/profile/page';

describe('ProfilePage', () => {
  it('renders client profile', () => {
    render(<ProfilePage />, { userType: 'client' });
    
    expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
  });
  
  it('renders builder profile', () => {
    render(<ProfilePage />, { userType: 'builder' });
    
    expect(screen.getByText('Builder Dashboard')).toBeInTheDocument();
  });
});
```

### Testing with Custom User Data

```tsx
import { render, screen } from '@/tests/utils/test-utils';
import WelcomePage from '@/app/welcome/page';

describe('WelcomePage', () => {
  it('shows personalized welcome message', () => {
    render(<WelcomePage />, { 
      userType: 'client',
      userOverrides: {
        name: 'John Doe',
        email: 'john@example.com',
      }
    });
    
    expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
  });
});
```

### Testing Unauthenticated States

```tsx
import { render, screen } from '@/tests/utils/test-utils';
import { resetMockClerk, createUnauthenticatedMock } from '@/tests/utils/clerk-test-utils';
import Dashboard from '@/app/dashboard/page';
import { vi } from 'vitest';

describe('Dashboard', () => {
  it('redirects unauthenticated users', () => {
    // Reset and create unauthenticated Clerk mock
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    render(<Dashboard />);
    
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });
});
```

## Advanced Usage

### Mocking API Responses

```tsx
import { render, screen, mockApi } from '@/tests/utils/test-utils';
import UserProfile from '@/components/UserProfile';
import { vi } from 'vitest';

describe('UserProfile', () => {
  it('fetches and displays user data', async () => {
    // Mock global fetch
    global.fetch = mockApi('/api/profile', { 
      name: 'John Doe', 
      bio: 'Software developer' 
    });
    
    render(<UserProfile userId="123" />);
    
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software developer')).toBeInTheDocument();
  });
});
```

### Testing Accessibility

```tsx
import { render, runAccessibilityTests } from '@/tests/utils/test-utils';
import LoginForm from '@/components/LoginForm';

describe('LoginForm', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<LoginForm />);
    
    await runAccessibilityTests(container);
  });
});
```

## Troubleshooting

### Common Issues

1. **Mock not being applied correctly**
   - Make sure you're importing from the correct test utilities file.
   - Check that you're not overriding the mock in your test.

2. **Authentication state not working as expected**
   - Verify you're using the correct user type.
   - Check if you need to reset mocks between tests.

3. **Custom user data not appearing**
   - Ensure you're passing the userOverrides correctly.
   - Check the property names match what the component expects.

### Updating Mock Implementations

If you need to extend or modify the mock implementations:

1. Update `clerk-test-utils.ts` with new mock behaviors.
2. Update the centralized mock in `__mocks__/@clerk/nextjs.ts` if needed.
3. Run the test-utilities.test.tsx file to verify your changes work correctly.
