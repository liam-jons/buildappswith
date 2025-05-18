# ADR 0025: Standardize Clerk Test Utilities

## Status

Accepted

## Context

After migrating from NextAuth.js to Clerk for authentication (see ADR 0002), our test utilities still referenced NextAuth.js, causing inconsistencies between our production code and test environment. This made tests unreliable and difficult to maintain, as they were testing against a different authentication system than what was used in production.

We needed to update our test utilities to properly support Clerk authentication while maintaining a consistent developer experience across the codebase.

## Decision

We've decided to:

1. Standardize Clerk mocking across the codebase by centralizing mock implementations in `__mocks__/@clerk/nextjs.ts`
2. Update test utilities (`vitest-utils.tsx` and `test-utils.tsx`) to use Clerk authentication mocks
3. Create a comprehensive test utilities API that makes it easy to test with different user roles and authentication states
4. Implement proper TypeScript typing for all mock functions to improve developer experience
5. Create detailed documentation for using the test utilities

## Approach

Our approach follows these principles:

1. **Centralized Mocking**: We've centralized mock implementations in `__mocks__/@clerk/nextjs.ts` to ensure consistency
2. **Role-Based Testing**: We've implemented a user role system that makes it easy to test with different authentication contexts
3. **TypeScript Integration**: We've used Vitest's `MockInstance` type to ensure proper typing of mock functions
4. **Developer Experience**: We've created helper functions that simplify the process of setting up authenticated tests
5. **Backward Compatibility**: We've maintained compatibility with existing test patterns to minimize the need for test rewrites

## Consequences

### Positive

- Tests now accurately reflect the production authentication system
- Consistent mocking approach across all tests
- Proper TypeScript typing for improved developer experience
- Clear documentation for using the test utilities
- Standardized patterns for authentication in tests

### Negative

- Existing tests will need to be updated to use the new utilities
- Some complexity in mock implementations to support different authentication states
- Need to maintain compatibility with both Jest and Vitest testing approaches

## References

- ADR 0002: Migrate from NextAuth to Clerk
- ADR 0024: Standardize Profile Management with Clerk
- [Clerk Authentication Documentation](https://clerk.com/docs/authentication/testing)
- [Vitest Mocking Documentation](https://vitest.dev/guide/mocking.html)
