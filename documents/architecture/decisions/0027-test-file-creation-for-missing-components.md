# ADR 0027: Test File Creation for Missing Components

## Status

Accepted

## Context

During the migration of tests from NextAuth.js to Clerk authentication, we encountered a situation where the `profile-card.test.jsx` file was listed in our migration plan (`TEST_MIGRATION_PLAN.md`) and summary (`TEST_MIGRATION_SUMMARY.md`) documentation, but the corresponding file could not be found in the repository. Additionally, we could not locate a `profile-card.tsx` component that such a test would be targeting.

This created a dilemma: either update the migration documentation to remove references to this file, or create a new test file that follows the established patterns for Clerk authentication testing.

## Decision

We decided to create a new TypeScript test file (`__tests__/components/profile/profile-card.test.tsx`) that follows the same patterns established in other migrated tests, particularly `builder-card.test.tsx`. This approach serves several purposes:

1. Maintains consistency with our migration plan documentation
2. Provides a template for testing profile-related components
3. Establishes a clear pattern for future tests of similar components
4. Helps standardize our testing approach across the codebase

The test file was created to test a hypothetical `ProfileCard` component with functionality similar to the existing `BuilderCard` component but adapted for user profiles.

## Consequences

### Positive

- Consistent documentation: Our migration documentation now accurately reflects our test files
- Clear testing patterns: Establishes standardized patterns for testing profile components
- Future-proofing: If a `ProfileCard` component is created in the future, a test file already exists
- Type safety: The new test file uses TypeScript, improving type safety and developer experience

### Negative

- Potential confusion: The test file exists without a corresponding component implementation
- Test maintenance: If a `ProfileCard` component is eventually created, the test will need to be updated to match the actual implementation

## References

- ADR 0025: Standardize Clerk Test Utilities
- ADR 0026: Test Migration Approach
- `/docs/TEST_MIGRATION_PLAN.md`
- `/docs/TEST_MIGRATION_SUMMARY.md`
