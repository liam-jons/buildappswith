# Clerk Authentication Testing Guide

This comprehensive guide documents approaches and best practices for testing authentication components in the Buildappswith platform. It covers all aspects of authentication testing, from unit tests to integration tests and manual verification.

**Current Version: 1.0.138**  
**Last Updated: April 28, 2025**

## Authentication Test Strategy

### Test Pyramid Approach

Our authentication testing follows a pyramid approach:

1. **Unit Tests**: Testing isolated components and functions
2. **Component Tests**: Testing UI components with mocked authentication
3. **Integration Tests**: Testing authentication flows across components
4. **E2E Tests**: Testing complete user flows with real authentication systems

### Test Environment Configuration

For authentication testing, we use these environments:

1. **Local Testing**: Using Clerk's test mode with test API keys
2. **CI Testing**: Using mocked Clerk authentication
3. **Staging Tests**: Using separate Clerk application instance
4. **Production Verification**: Manual verification of critical flows

## Mocking Clerk Authentication

### Basic Mocking Approach

We use a standardized approach to mock Clerk authentication:

```typescript
// Import our custom test utilities
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('Authentication Component Tests', () => {
  // Set up mocks before each test
  beforeEach(() => {
    setupMockClerk('client'); // Mock as client user
  });

  // Reset mocks after each test
  afterEach(() => {
    resetMockClerk();
  });

  it('renders authenticated view for client users', () => {
    // Test implementation
  });
});
```

### Available Mock User Types

The test utilities support these predefined user types:

| User Type | Description | Roles | Additional Properties |
|-----------|-------------|-------|----------------------|
| `client` | Standard client user | `CLIENT` | `stripeCustomerId` |
| `builder` | Builder user | `BUILDER` | `stripeCustomerId`, `builderProfile` |
| `admin` | Admin user | `ADMIN` | Full access |
| `multiRole` | User with multiple roles | `CLIENT`, `BUILDER` | Combined permissions |
| `unverified` | Unverified user | `CLIENT` | `verified: false` |

### Custom User Mocking

For advanced scenarios, customize the mock user:

```typescript
import { configureMockClerk } from '@/__tests__/utils/clerk-test-utils';

const customMock = configureMockClerk('client', {
  // Customize public metadata
  publicMetadata: {
    roles: [UserRole.CLIENT],
    verified: true,
    stripeCustomerId: 'custom-stripe-id',
    completedOnboarding: false, // Custom property
  },
  // Customize user properties
  firstName: 'Custom',
  lastName: 'User',
  // Add other properties as needed
});

vi.mock('@clerk/nextjs', () => customMock);
```

### Testing Authentication States

Test different authentication states:

```typescript
import { 
  createUnauthenticatedMock, 
  createLoadingMock,
  createErrorMock
} from '@/__tests__/utils/clerk-test-utils';

// Unauthenticated state
it('shows login button when not authenticated', () => {
  vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
  render(<NavigationMenu />);
  expect(screen.getByText('Sign In')).toBeInTheDocument();
});

// Loading state
it('shows loading indicator during authentication', () => {
  vi.mock('@clerk/nextjs', () => createLoadingMock());
  render(<NavigationMenu />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});

// Error state
it('shows error message on authentication error', () => {
  vi.mock('@clerk/nextjs', () => createErrorMock('Failed to authenticate'));
  render(<AuthStatusIndicator />);
  expect(screen.getByText('Authentication error')).toBeInTheDocument();
});
```

## Testing Clerk Hooks

### Basic Hook Testing

Test custom authentication hooks:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth, useUser, useHasRole } from '@/lib/auth/hooks';
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';
import { UserRole } from '@/lib/auth/types';

describe('Auth Hooks', () => {
  beforeEach(() => {
    setupMockClerk('client');
  });

  afterEach(() => {
    resetMockClerk();
  });

  it('useAuth provides user and status', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.isClient).toBe(true);
  });

  it('useUser returns correct user data', () => {
    const { result } = renderHook(() => useUser());
    
    expect(result.current.user).toMatchObject({
      name: 'Test User',
      email: 'client@example.com',
      roles: [UserRole.CLIENT],
    });
  });

  it('useHasRole correctly identifies roles', () => {
    const { result: clientResult } = renderHook(() => useHasRole(UserRole.CLIENT));
    const { result: adminResult } = renderHook(() => useHasRole(UserRole.ADMIN));
    
    expect(clientResult.current).toBe(true);
    expect(adminResult.current).toBe(false);
  });
});
```

### Testing Custom Auth Hook Behaviors

Test specific behaviors of custom hooks:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSignOut } from '@/lib/auth/hooks';
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('useSignOut Hook', () => {
  beforeEach(() => {
    setupMockClerk('client');
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost:3000/dashboard' }
    });
  });

  afterEach(() => {
    resetMockClerk();
    vi.restoreAllMocks();
  });

  it('calls Clerk signOut and redirects to callback URL', async () => {
    const { result } = renderHook(() => useSignOut());
    
    await act(async () => {
      await result.current({ callbackUrl: '/login' });
    });
    
    // Verify redirection
    expect(window.location.href).toBe('/login');
  });
});
```

## Testing Protected Components

### Testing Role-Based Access

Test components with role-based access control:

```typescript
import { render, screen } from '@/__tests__/utils/vitest-utils';
import AdminDashboard from '@/components/admin/dashboard';
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('AdminDashboard', () => {
  afterEach(() => {
    resetMockClerk();
  });

  it('shows admin content for admin users', () => {
    setupMockClerk('admin');
    render(<AdminDashboard />);
    expect(screen.getByText('Admin Controls')).toBeInTheDocument();
  });

  it('shows access denied for non-admin users', () => {
    setupMockClerk('client');
    render(<AdminDashboard />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});
```

### Testing Authentication Redirects

Test redirection behavior for protected routes:

```typescript
import { render, screen } from '@/__tests__/utils/vitest-utils';
import ProtectedPage from '@/app/protected/page';
import { setupMockClerk, createUnauthenticatedMock, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';
import { mockRouter } from '@/__tests__/utils/next-router-mock';

describe('ProtectedPage', () => {
  beforeEach(() => {
    mockRouter.push('/protected');
  });

  afterEach(() => {
    resetMockClerk();
    vi.clearAllMocks();
  });

  it('shows content for authenticated users', () => {
    setupMockClerk('client');
    render(<ProtectedPage />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users', () => {
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    render(<ProtectedPage />);
    
    // Check that router was called with redirect
    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/login')
    );
  });
});
```

## Testing API Route Protection

### Testing withAuth and withRole Wrappers

Test API route protection wrappers:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole } from '@/lib/auth/clerk/api-auth';
import { UserRole } from '@/lib/auth/types';
import { mockClerkServerAuth } from '@/__tests__/utils/clerk-test-utils';

describe('API Auth Wrappers', () => {
  let mockRequest: NextRequest;
  
  beforeEach(() => {
    mockRequest = new NextRequest('http://localhost:3000/api/test');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('withAuth wrapper', () => {
    it('calls handler with authenticated user', async () => {
      // Mock Clerk server auth
      mockClerkServerAuth({
        isAuthenticated: true,
        userId: 'test-user-id',
        roles: [UserRole.CLIENT]
      });
      
      // Create test handler
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      
      // Wrap handler with withAuth
      const protectedHandler = withAuth(mockHandler);
      
      // Call protected handler
      await protectedHandler(mockRequest);
      
      // Verify handler was called with user
      expect(mockHandler).toHaveBeenCalledWith(
        mockRequest,
        expect.objectContaining({ id: expect.any(String) })
      );
    });

    it('returns 401 for unauthenticated requests', async () => {
      // Mock unauthenticated state
      mockClerkServerAuth({
        isAuthenticated: false
      });
      
      // Create test handler
      const mockHandler = vi.fn();
      
      // Wrap handler with withAuth
      const protectedHandler = withAuth(mockHandler);
      
      // Call protected handler
      const response = await protectedHandler(mockRequest);
      
      // Verify 401 response
      expect(response.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('withRole wrapper', () => {
    it('allows access for users with required role', async () => {
      // Mock authenticated admin
      mockClerkServerAuth({
        isAuthenticated: true,
        userId: 'test-admin-id',
        roles: [UserRole.ADMIN]
      });
      
      // Create test handler
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      
      // Wrap handler with withRole
      const protectedHandler = withRole(UserRole.ADMIN, mockHandler);
      
      // Call protected handler
      await protectedHandler(mockRequest);
      
      // Verify handler was called
      expect(mockHandler).toHaveBeenCalled();
    });

    it('returns 403 for users without required role', async () => {
      // Mock authenticated client
      mockClerkServerAuth({
        isAuthenticated: true,
        userId: 'test-client-id',
        roles: [UserRole.CLIENT]
      });
      
      // Create test handler
      const mockHandler = vi.fn();
      
      // Wrap handler with withRole
      const protectedHandler = withRole(UserRole.ADMIN, mockHandler);
      
      // Call protected handler
      const response = await protectedHandler(mockRequest);
      
      // Verify 403 response
      expect(response.status).toBe(403);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});
```

## Testing Webhook Handling

### Mocking Webhook Requests

Test webhook handler with mocked requests:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/webhooks/clerk/route';
import { createMockWebhookEvent } from '@/__tests__/utils/clerk-test-utils';
import * as dataAccess from '@/lib/auth/data-access';

describe('Clerk Webhook Handler', () => {
  beforeEach(() => {
    // Mock database operations
    vi.spyOn(dataAccess.authData, 'findUserByClerkId').mockResolvedValue(null);
    vi.spyOn(dataAccess.authData, 'createUser').mockResolvedValue({
      id: 'db-user-id',
      clerkId: 'clerk-user-id',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['CLIENT'],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    vi.spyOn(dataAccess.authData, 'updateUser').mockResolvedValue({
      id: 'db-user-id',
      clerkId: 'clerk-user-id',
      name: 'Updated User',
      email: 'test@example.com',
      roles: ['CLIENT'],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates new user on user.created event', async () => {
    // Create mock webhook request for user.created
    const { request, mockSignature } = createMockWebhookEvent({
      type: 'user.created',
      data: {
        id: 'clerk-user-id',
        first_name: 'Test',
        last_name: 'User',
        primary_email_address_id: 'email-id',
        email_addresses: [{
          id: 'email-id',
          email_address: 'test@example.com',
          verification: { status: 'verified' }
        }],
        public_metadata: {
          roles: ['CLIENT']
        }
      }
    });
    
    // Mock headers to include signature
    const headers = new Headers(request.headers);
    headers.set('svix-signature', mockSignature);
    headers.set('svix-id', 'event-id');
    headers.set('svix-timestamp', Date.now().toString());
    
    const mockRequest = new NextRequest(request.url, {
      method: 'POST',
      body: request.body,
      headers
    });
    
    // Call webhook handler
    const response = await POST(mockRequest);
    
    // Verify response and database calls
    expect(response.status).toBe(200);
    expect(dataAccess.authData.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        clerkId: 'clerk-user-id',
        email: 'test@example.com'
      })
    );
  });

  it('updates existing user on user.updated event', async () => {
    // Mock existing user
    vi.spyOn(dataAccess.authData, 'findUserByClerkId').mockResolvedValue({
      id: 'db-user-id',
      clerkId: 'clerk-user-id',
      name: 'Old Name',
      email: 'test@example.com',
      roles: ['CLIENT'],
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create mock webhook request for user.updated
    const { request, mockSignature } = createMockWebhookEvent({
      type: 'user.updated',
      data: {
        id: 'clerk-user-id',
        first_name: 'Updated',
        last_name: 'User',
        primary_email_address_id: 'email-id',
        email_addresses: [{
          id: 'email-id',
          email_address: 'test@example.com',
          verification: { status: 'verified' }
        }],
        public_metadata: {
          roles: ['CLIENT', 'BUILDER']
        }
      }
    });
    
    // Mock headers to include signature
    const headers = new Headers(request.headers);
    headers.set('svix-signature', mockSignature);
    headers.set('svix-id', 'event-id');
    headers.set('svix-timestamp', Date.now().toString());
    
    const mockRequest = new NextRequest(request.url, {
      method: 'POST',
      body: request.body,
      headers
    });
    
    // Call webhook handler
    const response = await POST(mockRequest);
    
    // Verify response and database calls
    expect(response.status).toBe(200);
    expect(dataAccess.authData.updateUser).toHaveBeenCalledWith(
      'db-user-id',
      expect.objectContaining({
        name: 'Updated User',
        roles: ['CLIENT', 'BUILDER']
      })
    );
  });

  it('verifies webhook signature', async () => {
    // Create mock webhook request with invalid signature
    const { request } = createMockWebhookEvent({
      type: 'user.created',
      data: { id: 'clerk-user-id' }
    });
    
    // Set invalid signature
    const headers = new Headers(request.headers);
    headers.set('svix-signature', 'invalid-signature');
    headers.set('svix-id', 'event-id');
    headers.set('svix-timestamp', Date.now().toString());
    
    const mockRequest = new NextRequest(request.url, {
      method: 'POST',
      body: request.body,
      headers
    });
    
    // Call webhook handler
    const response = await POST(mockRequest);
    
    // Verify 401 response
    expect(response.status).toBe(401);
    expect(dataAccess.authData.createUser).not.toHaveBeenCalled();
  });
});
```

## Advanced Testing Scenarios

### Testing Authentication State Changes

Test components when authentication state changes:

```typescript
import { render, screen, act } from '@/__tests__/utils/vitest-utils';
import AuthStatusIndicator from '@/components/auth-status-indicator';
import { createMockClerkContext, createUnauthenticatedMock } from '@/__tests__/utils/clerk-test-utils';

describe('AuthStatusIndicator with state changes', () => {
  it('updates when authentication state changes', async () => {
    // Start with authenticated state
    const { mockSignOut, updateClerkState } = createMockClerkContext('client');
    vi.mock('@clerk/nextjs', () => mockClerkContext);
    
    const { rerender } = render(<AuthStatusIndicator />);
    
    // Verify authenticated state
    expect(screen.getByText('Signed in as Test User')).toBeInTheDocument();
    
    // Simulate sign out
    await act(async () => {
      mockSignOut.mockResolvedValue(undefined);
      await updateClerkState({ isSignedIn: false, userId: null });
    });
    
    // Re-render component
    rerender(<AuthStatusIndicator />);
    
    // Verify unauthenticated state
    expect(screen.getByText('Not signed in')).toBeInTheDocument();
  });
});
```

### Testing Role Changes

Test behavior when user roles change:

```typescript
import { render, screen, act } from '@/__tests__/utils/vitest-utils';
import UserRoleBadges from '@/components/user-role-badges';
import { createMockClerkContext } from '@/__tests__/utils/clerk-test-utils';
import { UserRole } from '@/lib/auth/types';

describe('UserRoleBadges with role changes', () => {
  it('updates when roles change', async () => {
    // Start with client role
    const { updateClerkState } = createMockClerkContext('client');
    vi.mock('@clerk/nextjs', () => mockClerkContext);
    
    const { rerender } = render(<UserRoleBadges />);
    
    // Verify client badge
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.queryByText('Builder')).not.toBeInTheDocument();
    
    // Update roles to include builder
    await act(async () => {
      await updateClerkState({
        publicMetadata: {
          roles: [UserRole.CLIENT, UserRole.BUILDER]
        }
      });
    });
    
    // Re-render component
    rerender(<UserRoleBadges />);
    
    // Verify both badges
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
  });
});
```

## Integration Testing Authentication

### Test Auth Flows End-to-End

Test complete authentication flows using integration tests:

```typescript
describe('Authentication Flows', () => {
  beforeAll(() => {
    // Set up test database and Clerk test environment
  });

  afterAll(() => {
    // Clean up test resources
  });

  it('allows user to sign up and access protected content', async () => {
    // Navigate to sign-up page
    await page.goto('/signup');
    
    // Fill sign-up form
    await page.fill('input[name="email"]', 'new-user@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.fill('input[name="firstName"]', 'New');
    await page.fill('input[name="lastName"]', 'User');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for verification page
    await page.waitForURL('**/verify*');
    
    // Complete verification (mocked in test environment)
    await completeVerification(page, 'new-user@example.com');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify logged-in state
    expect(await page.isVisible('text=Welcome, New')).toBe(true);
    
    // Navigate to protected page
    await page.goto('/protected');
    
    // Verify access to protected content
    expect(await page.isVisible('text=Protected Content')).toBe(true);
  });
});
```

## Examples of Mocking Clerk for Different Test Scenarios

### 1. Mocking for Client Component Tests

```typescript
// Example: Testing a Profile Component
import { render, screen } from '@/__tests__/utils/vitest-utils';
import UserProfile from '@/components/user/profile';
import { setupMockClerk, resetMockClerk } from '@/__tests__/utils/clerk-test-utils';

describe('UserProfile', () => {
  afterEach(() => {
    resetMockClerk();
  });

  it('displays client profile correctly', () => {
    setupMockClerk('client');
    render(<UserProfile />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('client@example.com')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
  });

  it('displays builder profile with additional information', () => {
    setupMockClerk('builder');
    render(<UserProfile />);
    
    expect(screen.getByText('Test Builder')).toBeInTheDocument();
    expect(screen.getByText('builder@example.com')).toBeInTheDocument();
    expect(screen.getByText('Builder')).toBeInTheDocument();
    expect(screen.getByText('Builder Profile')).toBeInTheDocument();
  });
});
```

### 2. Mocking for Server Component Tests

```typescript
// Example: Testing a Server Component
import { renderServerComponent } from '@/__tests__/utils/server-component-utils';
import UserServerProfile from '@/app/profile/page';
import { mockClerkServerUser } from '@/__tests__/utils/clerk-test-utils';

describe('UserServerProfile', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays user profile information from server', async () => {
    // Mock Clerk server user
    mockClerkServerUser({
      id: 'clerk-id',
      firstName: 'Server',
      lastName: 'User',
      emailAddresses: [{
        id: 'email-id',
        emailAddress: 'server@example.com',
        verification: { status: 'verified' }
      }],
      primaryEmailAddressId: 'email-id',
      publicMetadata: {
        roles: ['CLIENT']
      }
    });
    
    // Render server component
    const { getByText } = await renderServerComponent(<UserServerProfile />);
    
    // Verify rendered content
    expect(getByText('Server User')).toBeInTheDocument();
    expect(getByText('server@example.com')).toBeInTheDocument();
  });
});
```

### 3. Mocking for API Route Tests

```typescript
// Example: Testing a Protected API Route
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/profile/route';
import { mockClerkServerAuth } from '@/__tests__/utils/clerk-test-utils';

describe('Profile API', () => {
  beforeEach(() => {
    // Mock database operations
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns user profile for authenticated users', async () => {
    // Mock authenticated user
    mockClerkServerAuth({
      isAuthenticated: true,
      userId: 'user-id',
      roles: ['CLIENT']
    });
    
    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/profile');
    
    // Call API route
    const response = await GET(request);
    const data = await response.json();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      user: {
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        roles: ['CLIENT']
      }
    });
  });

  it('returns 401 for unauthenticated users', async () => {
    // Mock unauthenticated state
    mockClerkServerAuth({
      isAuthenticated: false
    });
    
    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/profile');
    
    // Call API route
    const response = await GET(request);
    
    // Verify response
    expect(response.status).toBe(401);
  });
});
```

## Best Practices for Authentication Testing

1. **Reset Mocks Between Tests**: Always reset authentication mocks between tests to avoid state leakage.
2. **Test Error States**: Include tests for authentication failures, permission errors, and edge cases.
3. **Separate Client/Server Testing**: Use appropriate mocking approaches for client and server components.
4. **Test Role Transitions**: Verify behavior when user roles change, especially for conditional UI elements.
5. **Secure Webhook Testing**: Test webhook handlers with proper signature verification checks.
6. **Cover All Auth Flows**: Test sign-in, sign-up, sign-out, and password reset flows.
7. **Use Realistic Test Data**: Make test data representative of real user scenarios.
8. **Mock External Dependencies**: Avoid calling Clerk API directly in unit and component tests.
9. **Integration Test Critical Paths**: Use end-to-end tests for the most critical authentication flows.
10. **Track Test Coverage**: Monitor authentication code coverage to ensure comprehensive testing.

## References

- [Clerk Testing Documentation](https://clerk.com/docs/testing)
- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [Documentation of Vitest Mocking](https://vitest.dev/guide/mocking.html)
- [Buildappswith Test Strategy](/docs/engineering/testing/TEST_STRATEGY.md)