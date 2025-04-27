# Test Migration Plan: NextAuth.js to Clerk

## Overview

This document outlines the plan for migrating tests from NextAuth.js to the new Clerk authentication system. It serves as a guide for updating all test files to use the standardized Clerk test utilities.

## Migration Strategy

Our migration approach follows these principles:

1. **Incremental Migration**: Update tests in phases, starting with the core test utilities, then component tests, API route tests, and middleware tests
2. **Backward Compatibility**: Maintain compatibility with existing test patterns where possible
3. **Consistent Patterns**: Use the new standardized Clerk test utilities consistently across all tests
4. **Type Safety**: Enhance type safety with TypeScript and Vitest's `MockInstance` type
5. **Documentation**: Update documentation as needed to reflect the new testing approach

## Phase 1: Core Test Utilities (Completed)

- ✅ Create new `auth-test-utils-new.ts` file that uses the new `clerk-test-utils.ts`
- ✅ Update `renderWithAuth` function to use the new Clerk mocks
- ✅ Add backward compatibility functions for existing tests

## Phase 2: Component Tests

### General Update Pattern

For component tests:

1. Change imports:
   ```javascript
   // From
   const { renderWithAuth, mockUsers } = require('../../utils/auth-test-utils')
   
   // To
   import { renderWithAuth, mockUsers } from '../../utils/auth-test-utils-new';
   import { vi } from 'vitest';
   ```

2. Update unauthenticated testing:
   ```javascript
   // From
   jest.mock('@clerk/nextjs', () => ({ ... }))
   
   // To
   resetMockClerk();
   vi.mock('@clerk/nextjs', () => createUnauthenticatedMock());
   ```

3. Replace any references to `jest` with `vi`:
   ```javascript
   // From
   jest.fn()
   
   // To
   vi.fn()
   ```

4. Update any direct access to Clerk functions:
   ```javascript
   // Ensure to import functions from @clerk/nextjs
   const { useUser, useAuth } = require('@clerk/nextjs');
   ```

### Files to Update

Priority component tests:

- [x] `__tests__/components/auth/protected-component.test.jsx`
- [x] `__tests__/components/auth/protected-route.test.tsx`
- [x] `__tests__/components/marketplace/builder-card.test.tsx`
- [x] `__tests__/components/profile/profile-card.test.tsx`
- [ ] Additional component tests...

## Phase 3: API Route Tests

### General Update Pattern

For API route tests:

1. Update imports to use Vitest:
   ```javascript
   // From
   const { mockUsers, setupMockAuth, resetMockAuth } = require('../utils/auth-test-utils')
   
   // To
   import { vi, describe, it, expect, afterEach } from 'vitest';
   import { mockUsers } from '../mocks/users';
   import { resetMockClerk } from '../utils/clerk-test-utils';
   ```

2. Update auth mocking:
   ```javascript
   // Import after mock setup
   const { auth } = require('@clerk/nextjs');
   
   // Configure auth to return authenticated user
   vi.mocked(auth).mockReturnValue({
     userId: mockUsers.client.clerkId,
     sessionId: `session-${mockUsers.client.clerkId}`,
     getToken: vi.fn().mockResolvedValue('test-token'),
   });
   ```

3. Update API handler mocks to use the new clerk-based helpers.

### Files to Update

Priority API tests:

- [x] `__tests__/api/protected-route.test.js`
- [x] `__tests__/api/profiles/profile.test.ts` (migrated and converted to TypeScript in v1.0.118)
- [ ] `__tests__/api/stripe/subscription.test.js`
- [ ] Additional API tests...

## Phase 3: Middleware Tests

### General Update Pattern

For middleware tests:

1. Update imports:
   ```javascript
   import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
   import { mockUsers } from './__tests__/mocks/users';
   ```

2. Update Clerk mocking to use the centralized mock implementation:
   ```javascript
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
       // Other mocks...
     };
   });
   ```

3. Update request creation to include auth headers:
   ```javascript
   // Create request with authenticated user
   const req = new NextRequest(new URL('https://buildappswith.com/dashboard'));
   req.headers.set('x-auth-user-id', mockUsers.client.clerkId);
   ```

### Files to Update

Priority middleware tests:

- [x] `__tests__/middleware.test.ts`
- [ ] `__tests__/middleware/api-protection.test.ts`
- [ ] `__tests__/middleware/rbac.test.ts`
- [ ] Additional middleware tests...

## Phase 5: Final Steps

1. Rename the updated files to replace the originals
2. Update package.json to increment version number
3. Update CHANGELOG.md with migration details
4. Run tests to ensure everything works as expected

## Best Practices

1. **Use TypeScript**: Convert JavaScript test files to TypeScript when possible
2. **Consistent Mocking**: Use the centralized mock implementation in `__mocks__/@clerk/nextjs.ts`
3. **Role-Based Testing**: Test components with different user roles
4. **Testing Auth States**: Test both authenticated and unauthenticated states
5. **Error Handling**: Test error conditions and edge cases

## Troubleshooting

Common issues that may arise during migration:

1. **Mock not being applied**: Ensure you're importing from the correct test utilities file
2. **Authentication state issues**: Verify you're using the correct user type
3. **Type errors**: Use `vi.mocked()` to ensure TypeScript recognizes the mock methods
4. **Jest vs Vitest**: Be sure to replace all Jest functions with their Vitest equivalents

## References

- [Clerk Testing Documentation](https://clerk.com/docs/testing/testing-overview)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [ADR 0025: Standardize Clerk Test Utilities](/docs/architecture/decisions/0025-standardize-clerk-test-utilities.md)
