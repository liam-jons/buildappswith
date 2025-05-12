# Clerk Test Utilities

## Overview

This document describes the test utilities available for working with Clerk authentication in our test suite. These utilities allow you to easily mock Clerk authentication with different user types and states.

## Available Utilities

### 1. Mock Providers in Test Utilities

The `test-utils.tsx` and `vitest-utils.tsx` files have been updated to use Clerk authentication instead of NextAuth. Both files now use:

```typescript
<ClerkProvider publishableKey="test_key">
  <ThemeProvider>
    {children}
    <Toaster />
  </ThemeProvider>
</ClerkProvider>
```

This means that any component rendered with the `render` function from these utilities will be wrapped in the Clerk authentication context.

### 2. Mock User Data

The mock user data now follows Clerk's user structure instead of the NextAuth format:

```typescript
export const mockUser: ClerkUser = {
  id: 'clerk-client-id',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  username: 'testuser',
  primaryEmailAddress: {
    emailAddress: 'client@example.com',
    id: 'email-id',
    verification: { status: 'verified' }
  },
  primaryEmailAddressId: 'email-id',
  emailAddresses: [{
    emailAddress: 'client@example.com',
    id: 'email-id',
    verification: { status: 'verified' }
  }],
  imageUrl: '/images/avatar-placeholder.png',
  publicMetadata: {
    roles: [UserRole.CLIENT],
    verified: true,
    completedOnboarding: true,
    stripeCustomerId: 'stripe-client-id'
  },
  privateMetadata: {},
  unsafeMetadata: {},
  reload: vi.fn().mockResolvedValue(undefined)
}
```

### 3. Specialized Clerk Test Utilities

For more flexibility, use the specialized Clerk test utilities in `__tests__/utils/clerk-test-utils.ts`:

#### Setting Up Mocks

```typescript
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

// In beforeEach or beforeAll
setupMockClerk('client'); // Mock as client user
// or
setupMockClerk('builder'); // Mock as builder user
// or
setupMockClerk('admin'); // Mock as admin user
// or
setupMockClerk('multiRole'); // Mock as multi-role user
// or
setupMockClerk('unverified'); // Mock as unverified user

// In afterEach or afterAll
resetMockClerk();
```

#### Configuring Custom Users

```typescript
import { configureMockClerk } from '@/__tests__/utils/clerk-test-utils';

// Configure with custom properties
const mockClerk = configureMockClerk('client', {
  publicMetadata: {
    completedOnboarding: false,
    // other custom metadata
  }
});
```

#### Testing Unauthenticated State

```typescript
import { createUnauthenticatedMock } from '@/__tests__/utils/clerk-test-utils';

// Mock an unauthenticated state
const unauthenticatedMock = createUnauthenticatedMock();
vi.mock('@clerk/nextjs', () => unauthenticatedMock);
```

#### Testing Loading State

```typescript
import { createLoadingMock } from '@/__tests__/utils/clerk-test-utils';

// Mock a loading state
const loadingMock = createLoadingMock();
vi.mock('@clerk/nextjs', () => loadingMock);
```

## Usage Examples

### Basic Component Test

```typescript
import { render, screen } from '@/__tests__/utils/vitest-utils';
import UserProfile from '@/components/user-profile';
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('UserProfile', () => {
  beforeEach(() => {
    setupMockClerk('client');
  });

  afterEach(() => {
    resetMockClerk();
  });

  it('renders user name', () => {
    render(<UserProfile />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

### Testing Different User Types

```typescript
import { render, screen } from '@/__tests__/utils/vitest-utils';
import Dashboard from '@/components/dashboard';
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('Dashboard', () => {
  afterEach(() => {
    resetMockClerk();
  });

  it('shows client dashboard for client users', () => {
    setupMockClerk('client');
    render(<Dashboard />);
    expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
  });

  it('shows builder dashboard for builder users', () => {
    setupMockClerk('builder');
    render(<Dashboard />);
    expect(screen.getByText('Builder Dashboard')).toBeInTheDocument();
  });

  it('shows admin dashboard for admin users', () => {
    setupMockClerk('admin');
    render(<Dashboard />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
```

### Testing Auth-Protected Routes

```typescript
import { render, screen } from '@/__tests__/utils/vitest-utils';
import ProtectedPage from '@/app/protected/page';
import { setupMockClerk, createUnauthenticatedMock, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('ProtectedPage', () => {
  afterEach(() => {
    resetMockClerk();
  });

  it('shows content for authenticated users', () => {
    setupMockClerk('client');
    render(<ProtectedPage />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users', () => {
    const unauthenticatedMock = createUnauthenticatedMock();
    vi.mock('@clerk/nextjs', () => unauthenticatedMock);
    
    render(<ProtectedPage />);
    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Always Reset Mocks**: Use `resetMockClerk()` after each test to avoid state leakage between tests.
2. **Use Consistent Types**: Import `ClerkUser` type from clerk-test-utils for type safety.
3. **Mock at the Right Level**: Set up mocks at the level you need - component tests often work best with the global render wrapper, while more specific tests may need direct mocking.
4. **Testing API Routes**: For API routes, use the `auth()`, `currentUser()` and other server functions from the mock.

## References

- [Clerk Testing Documentation](https://clerk.com/docs/testing)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
