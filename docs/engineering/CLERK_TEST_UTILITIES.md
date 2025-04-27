# Testing with Clerk Authentication

This document provides guidance on testing components and functionality that use Clerk authentication in the Buildappswith platform.

## Overview

After migrating from NextAuth.js to Clerk (v1.0.109), our test utilities have been updated to properly support Clerk authentication. This document explains how to use these updated utilities to test components and API routes that rely on authentication.

## Test Utilities

### Core Files

- `__tests__/utils/clerk-test-utils.ts`: Core implementation of Clerk mocking utilities
- `__tests__/utils/test-utils.tsx`: Main testing utility for React Testing Library
- `__tests__/utils/vitest-utils.tsx`: Similar to test-utils but with Vitest-specific implementations
- `__mocks__/@clerk/nextjs.ts`: Centralized mock implementation for Clerk

### Key Features

- Mock different user roles (client, builder, admin, multiRole)
- Simulate authenticated and unauthenticated states
- Support for loading states
- Consistent typing with the production codebase
- Helper functions for common testing patterns

## Basic Usage

### Component Testing

```tsx
import { render, screen } from '@/__tests__/utils/test-utils';
import ProfilePage from '@/app/profile/page';

describe('ProfilePage', () => {
  it('renders client profile when user has client role', () => {
    // Render with client role user (default)
    render(<ProfilePage />);
    
    expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
  });
  
  it('renders builder profile when user has builder role', () => {
    // Render with builder role user
    render(<ProfilePage />, { userType: 'builder' });
    
    expect(screen.getByText('Builder Dashboard')).toBeInTheDocument();
  });
  
  it('renders admin profile when user has admin role', () => {
    // Render with admin role user
    render(<ProfilePage />, { userType: 'admin' });
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});
```

### Testing with Custom User Data

```tsx
import { render, screen } from '@/__tests__/utils/test-utils';
import UserProfile from '@/components/profile/user-profile';

describe('UserProfile', () => {
  it('displays custom user information', () => {
    render(<UserProfile />, { 
      userType: 'client',
      userOverrides: {
        name: 'Custom User',
        email: 'custom@example.com',
        roles: ['CLIENT', 'ADMIN'],
      }
    });
    
    expect(screen.getByText('Custom User')).toBeInTheDocument();
    expect(screen.getByText('custom@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin Access')).toBeInTheDocument();
  });
});
```

### Testing Unauthenticated States

```tsx
import { render, screen } from '@/__tests__/utils/test-utils';
import { resetMockClerk, createUnauthenticatedMock } from '@/__tests__/utils/clerk-test-utils';
import { vi } from 'vitest';
import Dashboard from '@/app/dashboard/page';

describe('Dashboard', () => {
  it('shows login button for unauthenticated users', () => {
    // Reset and create unauthenticated Clerk mock
    resetMockClerk();
    vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
    
    render(<Dashboard />);
    
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });
});
```

## Advanced Usage

### Testing Middleware

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@clerk/nextjs';
import { clerkMiddleware } from '@/lib/auth/clerk-middleware';

// Mock Clerk's authMiddleware
vi.mock('@clerk/nextjs', () => ({
  authMiddleware: vi.fn(),
  redirectToSignIn: vi.fn().mockImplementation((options) => {
    return NextResponse.redirect(new URL('/login', options?.returnBackUrl || 'http://localhost'));
  }),
}));

describe('Clerk Middleware', () => {
  const mockRequest = new NextRequest(new URL('http://localhost/dashboard'));
  const mockAuthenticatedRequest = new NextRequest(new URL('http://localhost/dashboard'));
  mockAuthenticatedRequest.headers.set('x-auth-user-id', 'test-user-id');

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Setup the authMiddleware mock implementation
    vi.mocked(authMiddleware).mockImplementation((options) => {
      return async (req) => {
        // Extract auth info from request headers for testing purposes
        const userId = req.headers.get('x-auth-user-id');
        const isPublicRoute = options.publicRoutes?.some(route => {
          if (typeof route === 'string') {
            return req.nextUrl.pathname.startsWith(route);
          }
          return route.test(req.nextUrl.pathname);
        }) || false;
        
        // Call the afterAuth handler with the auth state
        return options.afterAuth(
          { userId, isPublicRoute },
          req,
          { nextUrl: req.nextUrl }
        );
      };
    });
  });

  it('redirects unauthenticated users to login', async () => {
    const middleware = clerkMiddleware;
    const response = await middleware(mockRequest);
    
    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toContain('/login');
  });

  it('allows authenticated users to access protected routes', async () => {
    const middleware = clerkMiddleware;
    const response = await middleware(mockAuthenticatedRequest);
    
    expect(response).toBeUndefined(); // NextResponse.next() returns undefined in tests
  });
});
```

### Testing API Routes

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { mockUsers } from '@/__tests__/mocks/users';
import { POST } from '@/app/api/profile/route';

// Mock Clerk's auth function
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(),
}));

describe('Profile API Route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    // Mock unauthenticated state
    vi.mocked(auth).mockReturnValue({
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    });
    
    const request = new NextRequest(
      new URL('http://localhost/api/profile'),
      { method: 'POST', body: JSON.stringify({ name: 'Test User' }) }
    );
    
    const response = await POST(request);
    
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual(
      expect.objectContaining({ error: 'Unauthorized' })
    );
  });

  it('updates user profile for authenticated requests', async () => {
    // Mock authenticated state
    vi.mocked(auth).mockReturnValue({
      userId: mockUsers.client.clerkId,
      sessionId: 'test-session-id',
      getToken: vi.fn().mockResolvedValue('test-token'),
    });
    
    const request = new NextRequest(
      new URL('http://localhost/api/profile'),
      { method: 'POST', body: JSON.stringify({ name: 'Updated Name' }) }
    );
    
    const response = await POST(request);
    
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.objectContaining({ 
        success: true,
        data: expect.objectContaining({ name: 'Updated Name' })
      })
    );
  });
});
```

## Best Practices

1. **Use the Right Utility**:
   - Use `test-utils.tsx` for most component tests
   - Use `vitest-utils.tsx` for Vitest-specific tests
   - Use `clerk-test-utils.ts` directly for advanced mocking needs

2. **Role-Based Testing**:
   - Test components with different user roles to ensure proper access control
   - Check that UI elements are conditionally rendered based on roles

3. **Test Authentication States**:
   - Test both authenticated and unauthenticated states
   - Verify that redirects and access controls work correctly

4. **Mock Only What You Need**:
   - The base mocks provide most functionality you'll need
   - Override only the specific behaviors required for your test

5. **Maintain Type Safety**:
   - Use TypeScript to ensure your mocks match the expected interfaces
   - Leverage vi.mocked() for proper typing of mocked functions

## Troubleshooting

### Common Issues

1. **Mock Not Being Applied**:
   - Make sure you're importing from the correct test utilities file
   - Check that you're not overriding the mock in your test

2. **Authentication State Not Working**:
   - Verify you're using the correct user type
   - Check if you need to reset mocks between tests with `resetMockClerk()`

3. **Type Errors**:
   - Use `vi.mocked()` to ensure TypeScript recognizes the mock methods
   - Check that your mock implementation matches the expected interface

### Getting Help

If you encounter issues with the test utilities, check:

1. The comprehensive README in `__tests__/utils/README.md`
2. The test verification file in `__tests__/utils/test-utilities.test.tsx`
3. The Clerk documentation on testing: https://clerk.com/docs/testing/testing-overview

## References

- [ADR 0002: Migrate from NextAuth to Clerk](/docs/architecture/decisions/0002-migrate-from-nextauth-to-clerk.md)
- [ADR 0025: Standardize Clerk Test Utilities](/docs/architecture/decisions/0025-standardize-clerk-test-utilities.md)
- [Clerk Documentation](https://clerk.com/docs)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
