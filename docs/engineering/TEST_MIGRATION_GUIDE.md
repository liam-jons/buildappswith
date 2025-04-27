# Test Migration Guide: NextAuth.js to Clerk

This document provides practical guidance for migrating tests from NextAuth.js to Clerk authentication in the Buildappswith platform.

## Overview

As part of our migration from NextAuth.js to Clerk for authentication (completed in v1.0.109), we need to update our test suite to reflect the new authentication system. This guide provides step-by-step instructions for migrating different types of tests.

## Prerequisites

Before migrating tests, ensure you understand:

1. The structure of the new Clerk authentication system (see `docs/AUTH_CLEANUP_SUMMARY.md`)
2. The design of the new test utilities (see `docs/architecture/decisions/0025-standardize-clerk-test-utilities.md`)
3. The overall migration approach (see `docs/architecture/decisions/0026-test-migration-approach.md`)

## Migration Steps by Test Type

### Component Tests

For component tests that use authentication:

1. **Update Imports**:
   ```typescript
   // From
   const { renderWithAuth, mockUsers } = require('../../utils/auth-test-utils')
   
   // To
   import { renderWithAuth, mockUsers } from '../../utils/auth-test-utils';
   import { vi } from 'vitest';
   ```

2. **Update Unauthenticated Testing**:
   ```typescript
   // From
   jest.mock('@clerk/nextjs', () => ({ ... }))
   
   // To
   resetMockClerk();
   vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
   ```

3. **Replace Jest with Vitest**:
   ```typescript
   // From
   jest.fn()
   
   // To
   vi.fn()
   ```

4. **Use Direct Clerk Imports**:
   ```typescript
   // Ensure to import functions from @clerk/nextjs
   const { useUser, useAuth } = require('@clerk/nextjs');
   ```

### API Route Tests

For API route tests that use authentication:

1. **Update Auth Mocking**:
   ```typescript
   // Import after mock setup
   const { auth } = require('@clerk/nextjs');
   
   // Configure auth to return authenticated user
   vi.mocked(auth).mockReturnValue({
     userId: mockUsers.client.clerkId,
     sessionId: `session-${mockUsers.client.clerkId}`,
     getToken: vi.fn().mockResolvedValue('test-token'),
   });
   ```

2. **Update API Handlers**:
   ```typescript
   // Update API handler mocks to use the new Clerk helpers
   vi.mock('@/lib/auth/clerk/helpers', () => ({
     requireAuth: vi.fn(),
     requireRole: vi.fn(),
     hasRole: vi.fn(),
   }));
   ```

### Middleware Tests

For middleware tests:

1. **Update Clerk Mocking**:
   ```typescript
   vi.mock('@clerk/nextjs', () => {
     // Import the default mock
     const { authMiddleware, redirectToSignIn } = vi.importActual('__mocks__/@clerk/nextjs.ts');
     
     // Customize for specific test needs
     return {
       authMiddleware: vi.fn(({ afterAuth }) => {
         return async (req) => {
           // Use headers for test configuration
           const userId = req.headers.get('x-auth-user-id');
           const isPublicRoute = req.headers.get('x-is-public-route') === 'true';
           
           return afterAuth(
             { userId, isPublicRoute },
             req,
             { nextUrl: req.nextUrl }
           );
         };
       }),
       // Other mocks as needed...
     };
   });
   ```

2. **Update Request Creation**:
   ```typescript
   // Create request with authenticated user
   const req = new NextRequest(new URL('https://buildappswith.com/dashboard'));
   req.headers.set('x-auth-user-id', mockUsers.client.clerkId);
   ```

## TypeScript Conversion Tips

When converting JavaScript tests to TypeScript:

1. **Rename Files**: Change the file extension from `.jsx` or `.js` to `.tsx` or `.ts`

2. **Add Type Annotations**:
   ```typescript
   // From
   function renderWithAuth(ui, options = {}) {
     // ...
   }
   
   // To
   function renderWithAuth(
     ui: React.ReactElement,
     options: {
       userType?: UserMockType,
       userOverrides?: Record<string, any>,
       renderOptions?: Omit<RenderOptions, 'wrapper'>
     } = {}
   ) {
     // ...
   }
   ```

3. **Use Type Imports**:
   ```typescript
   import { UserRole } from '@/lib/auth/types';
   import { UserMockType } from './clerk-test-utils';
   ```

4. **Use Vitest Types**:
   ```typescript
   import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
   import type { MockInstance } from 'vitest';
   ```

## Common Patterns

### Testing Different User Roles

```typescript
// Test client role
it('shows client content for users with CLIENT role', () => {
  const { getByTestId } = renderWithAuth(<Component />, { userType: 'client' });
  expect(getByTestId('client-content')).toBeInTheDocument();
});

// Test builder role
it('shows builder content for users with BUILDER role', () => {
  const { getByTestId } = renderWithAuth(<Component />, { userType: 'builder' });
  expect(getByTestId('builder-content')).toBeInTheDocument();
});

// Test admin role
it('shows admin content for users with ADMIN role', () => {
  const { getByTestId } = renderWithAuth(<Component />, { userType: 'admin' });
  expect(getByTestId('admin-content')).toBeInTheDocument();
});
```

### Testing Unauthenticated State

```typescript
it('shows login message for unauthenticated users', () => {
  resetMockClerk();
  vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
  
  const { getByText } = render(<Component />);
  expect(getByText('Please sign in')).toBeInTheDocument();
});
```

### Testing Custom User Properties

```typescript
it('displays custom user information', () => {
  const { getByText } = renderWithAuth(<Component />, {
    userType: 'client',
    userOverrides: {
      name: 'Custom Name',
      email: 'custom@example.com',
      roles: ['CLIENT', 'ADMIN'],
    }
  });
  
  expect(getByText('Custom Name')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Mock Not Being Applied**:
   - Check that you're importing from the correct test utilities file
   - Verify that you're not overriding the mock elsewhere

2. **Authentication State Issues**:
   - Ensure you're using the correct user type
   - Check if you need to reset mocks between tests with `resetMockClerk()`

3. **Type Errors**:
   - Use `vi.mocked()` to ensure TypeScript recognizes mock methods
   - Check that your mock implementation matches the expected interface

### Getting Help

If you encounter issues, check the following resources:

- The test utilities README at `__tests__/utils/README.md`
- The test verification file at `__tests__/utils/test-utilities.test.tsx`
- The migration plan at `docs/TEST_MIGRATION_PLAN.md`

## References

- [ADR 0002: Migrate from NextAuth to Clerk](/docs/architecture/decisions/0002-migrate-from-nextauth-to-clerk.md)
- [ADR 0025: Standardize Clerk Test Utilities](/docs/architecture/decisions/0025-standardize-clerk-test-utilities.md)
- [ADR 0026: Test Migration Approach](/docs/architecture/decisions/0026-test-migration-approach.md)
- [Clerk Documentation](https://clerk.com/docs/testing/testing-overview)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
