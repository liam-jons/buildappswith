# 24. Standardize Profile Management with Clerk

Date: 2025-04-26

## Status

Approved

## Context

We identified significant technical debt in our profile management components:

1. The onboarding and profile pages were using a compatibility layer for authentication that was originally designed to ease the transition from NextAuth.js to Clerk
2. Profile updates were implemented inconsistently across different components
3. Form validation and error handling varied between related user interfaces
4. API endpoints for updating user data were missing or incomplete
5. Role management was handled differently in different parts of the application

These inconsistencies created maintenance challenges and potential security issues.

## Decision

We will standardize profile management across the application by:

1. Creating a dedicated `/api/profiles/user` API endpoint that handles user profile updates with proper Clerk integration
2. Removing the authentication compatibility layer in profile-related components
3. Using direct Clerk authentication hooks (`useUser`, `useAuth`) for accessing user data
4. Implementing consistent form validation with Zod schemas
5. Standardizing user experience patterns for loading states and error handling
6. Ensuring proper role management through the API endpoint
7. Tracking onboarding completion status in Clerk's user metadata

## Consequences

### Positive

- Improved maintainability through consistent authentication patterns
- Enhanced security by using Clerk's APIs directly
- Better user experience with consistent loading and error states
- Reduced technical debt by eliminating the compatibility layer
- Easier implementation of future profile-related features
- Improved accessibility with standardized ARIA attributes and form labels

### Negative

- Temporary increase in implementation complexity during the transition
- Need to update tests to accommodate the new patterns
- Potential for regression issues that need careful monitoring

### Neutral

- Changes are consistent with the ongoing migration from NextAuth.js to Clerk
- API structure follows existing patterns in the codebase

## Implementation

The implementation follows these steps:

1. Create the `/api/profiles/user` API endpoint with proper validation
2. Update the onboarding page to use direct Clerk authentication
3. Update the profile settings page to follow the same patterns
4. Ensure consistent form validation with Zod schemas
5. Implement loading states and error handling consistently
6. Update version number and documentation

## References

- [Clerk Documentation](https://clerk.dev/docs)
- [ADR 0002: Migrate from NextAuth to Clerk](./0002-migrate-from-nextauth-to-clerk.md)
