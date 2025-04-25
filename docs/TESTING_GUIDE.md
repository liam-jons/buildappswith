# Testing Guide

## Overview
This document explains how to write and run tests for the Buildappswith platform.

## Running Tests
- `npm run test:verify` - Run basic component tests
- `npm run test:form` - Run form interaction tests
- `npm run test:all` - Run all unit tests
- `npm run test:auth` - Run authentication tests

## Writing Tests
### Component Tests
Use the basic test utilities to test component rendering:

```jsx
const { render, screen } = require('../utils/test-utils-basic')

describe('Component Name', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Form Tests
Test form interactions using fireEvent:

```jsx
const { render, screen, fireEvent } = require('../utils/test-utils-basic')

describe('Form Component', () => {
  it('handles input correctly', () => {
    render(<FormComponent />)
    fireEvent.change(screen.getByLabelText('Label'), { 
      target: { value: 'Test Input' } 
    })
    expect(screen.getByLabelText('Label')).toHaveValue('Test Input')
  })
})
```

## Authentication Testing
The platform now includes comprehensive authentication testing utilities to test components and routes with different user roles. These utilities allow you to simulate different authenticated states and test role-based access control.

### Testing Authenticated Components
Use `renderWithAuth` to test components that require authentication:

```jsx
const { renderWithAuth } = require('../utils/auth-test-utils')

describe('Protected Component', () => {
  it('renders for client users', () => {
    const { getByTestId } = renderWithAuth(<ProtectedComponent />, {
      userType: 'client',
    })
    
    expect(getByTestId('client-content')).toBeInTheDocument()
  })
  
  it('shows builder-specific content for builders', () => {
    const { getByTestId } = renderWithAuth(<ProtectedComponent />, {
      userType: 'builder',
    })
    
    expect(getByTestId('builder-content')).toBeInTheDocument()
  })
})
```

### Available User Types
The authentication testing utilities provide several pre-configured user types:

- `client` - Standard user with CLIENT role
- `builder` - User with BUILDER role
- `admin` - User with ADMIN role
- `multiRole` - User with both CLIENT and BUILDER roles
- `unverified` - User with unverified email

You can also customize user properties with the `userOverrides` parameter:

```jsx
renderWithAuth(<ProtectedComponent />, {
  userType: 'client',
  userOverrides: {
    name: 'Custom Name',
    roles: ['CLIENT', 'CUSTOM_ROLE'],
  },
})
```

### Testing Protected API Routes
Use the authentication utilities to test API routes that require authentication:

```jsx
const { mockUsers, setupMockAuth } = require('../utils/auth-test-utils')
const { requireAuth, requireRole } = require('@/lib/auth/clerk/helpers')

// Mock the auth helpers
jest.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
}))

describe('Protected API', () => {
  it('allows authenticated requests', async () => {
    // Setup mock user
    setupMockAuth('client')
    
    // Configure requireAuth to return a mock user
    requireAuth.mockResolvedValueOnce(mockUsers.client)
    
    // Test the API handler
    // ...
  })
})
```

### Helper Functions
The authentication testing utilities include several helper functions:

- `renderWithAuth` - Render a component with authentication
- `setupMockAuth` - Configure authentication mocks
- `resetMockAuth` - Reset authentication mocks
- `requiresAuthentication` - Test if a component requires authentication
- `requiresRole` - Test if a component requires a specific role
- `createMockUser` - Create a custom mock user

### Real-World Authentication Testing Examples

#### Testing Protected Routes
Test components that use role-based access control, like `ProtectedRoute`:

```jsx
describe('ProtectedRoute Component', () => {
  it('redirects to login if user is not authenticated', async () => {
    // Mock unauthenticated session
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(null),
    });

    const router = require('next/navigation').useRouter();

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/login');
    });

    // Check that protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children if user has the required role', async () => {
    // Mock authenticated session with admin role
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        user: {
          id: 'admin-id',
          roles: [UserRole.ADMIN],
        },
      }),
    });

    render(
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
});
```

#### Testing Role-Based Layouts
Test layout components that restrict access based on roles:

```jsx
describe('AdminDashboardLayout Component', () => {
  it('renders the admin layout with ProtectedRoute wrapper', async () => {
    render(
      <AdminDashboardLayout>
        <div>Admin Dashboard Content</div>
      </AdminDashboardLayout>
    );

    // Verify protected route is used with admin role
    const protectedRoute = screen.getByTestId('protected-route');
    expect(protectedRoute).toHaveAttribute('data-roles', UserRole.ADMIN);
    
    // Verify content is rendered
    expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument();
  });

  it('restricts access for non-admin users', async () => {
    // Mock authenticated session with client role (non-admin)
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        user: {
          id: 'client-id',
          roles: [UserRole.CLIENT],
        },
      }),
    });

    const router = require('next/navigation').useRouter();

    render(
      <RealAdminDashboardLayout>
        <div>Admin Dashboard Content</div>
      </RealAdminDashboardLayout>
    );

    // Wait for authentication check to complete and redirect
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });

    // Check that admin content is not rendered
    expect(screen.queryByText('Admin Dashboard Content')).not.toBeInTheDocument();
  });
});
```

#### Testing Components with Different User Roles
Test how UI components behave with different user roles:

```jsx
describe('BuilderProfileClient Component', () => {
  it('allows all authenticated users to view builder profiles regardless of role', async () => {
    // Test with different user roles
    const roles = ['client', 'builder', 'admin', 'multiRole'];
    
    for (const role of roles) {
      // Reset DOM and mocks
      document.body.innerHTML = '';
      jest.clearAllMocks();
      resetMockAuth();
      
      renderWithAuth(<BuilderProfileClient builderId="test-builder-id" />, {
        userType: role,
      });
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Test Builder')).toBeInTheDocument();
      });
      
      // Verify profile content is visible
      expect(screen.getByText('AI Developer')).toBeInTheDocument();
    }
  });
  
  it('allows unauthenticated users to view builder profiles', async () => {
    // Mock unauthenticated user
    jest.mock('@clerk/nextjs', () => ({
      useUser: () => ({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      }),
      useAuth: () => ({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        getToken: jest.fn().mockResolvedValue(null),
      }),
      ClerkProvider: ({ children }) => <>{children}</>,
      SignedIn: () => null,
      SignedOut: ({ children }) => <>{children}</>,
    }));
    
    // Render component without auth wrapper
    render(<BuilderProfileClient builderId="test-builder-id" />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Builder')).toBeInTheDocument();
    });
    
    // Verify profile content is visible
    expect(screen.getByText('AI Developer')).toBeInTheDocument();
  });
});
```

## Test Organization
The testing directory structure follows this organization:

```
buildappswith/
├── __tests__/
│   ├── components/    # Component tests
│   │   ├── ui/        # UI component tests
│   │   ├── landing/   # Landing page component tests
│   │   ├── auth/      # Authentication component tests
│   │   ├── marketplace/ # Marketplace component tests
│   │   └── ...
│   ├── integration/   # Integration tests
│   │   ├── marketplace/ # Marketplace integration tests
│   │   ├── profile/   # Profile page integration tests
│   │   └── ...
│   ├── api/           # API route tests
│   ├── unit/          # Unit tests
│   │   ├── lib/       # Library function tests
│   │   ├── utils/     # Utility function tests
│   │   └── ...
│   ├── mocks/         # Mock data and functions
│   │   ├── builders.ts # Builder mock data
│   │   ├── users.ts   # User mock data
│   │   └── ...
│   └── utils/         # Test utilities
│       ├── test-utils-basic.js  # Basic render functions
│       ├── auth-test-utils.js   # Authentication test utilities
│       └── ...
```

## Best Practices

### Component Testing
1. Test the component's appearance and behavior, not its implementation details
2. Focus on user interactions, not internal state
3. Use role-based queries when possible (`getByRole`, `getByLabelText`)
4. Test accessibility concerns where appropriate

### Authentication Testing
1. Test components with different user roles to ensure proper access control
2. Test protected routes to verify unauthorized users are blocked
3. Use the appropriate auth testing utility for your testing needs
4. Reset authentication mocks after each test to avoid state leakage

### Form Testing
1. Use `fireEvent.change` for input changes
2. Test form validation behavior
3. Verify error messages appear when expected
4. Test submission behavior

### General Guidelines
1. Keep tests focused and specific
2. Use descriptive test names that indicate what's being tested
3. Group related tests with describe blocks
4. Use beforeEach for common setup
5. Clean up after tests with afterEach when needed

## Future Testing Roadmap

The next phases of testing implementation will include:

1. ✅ **Enhanced Authentication Testing**
   - Utilities for testing different user roles
   - Session simulation for protected routes

2. **Component Test Coverage**
   - ✅ BuilderProfile component testing
   - ✅ Admin components with role-based access
   - ✅ Protected route testing
   - Marketplace component testing
   - Additional complex interactive components

3. **Integration Testing**
   - Cross-component interactions
   - User journey testing
   - API integration testing

4. **E2E Testing with Playwright**
   - Full user flows
   - Cross-browser testing
   - Visual regression testing

5. **CI/CD Integration**
   - Automated testing in GitHub Actions
   - Test coverage reporting
   - Performance monitoring
