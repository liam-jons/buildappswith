# Profile Management Architecture

This document outlines the architecture and implementation details for profile management in the Buildappswith platform.

## Overview

The profile management system is responsible for:

1. Capturing user information during onboarding
2. Managing user profile settings
3. Handling role assignments
4. Tracking onboarding completion status
5. Supporting builder profile creation for users who select the BUILDER role

## API Structure

### `/api/profiles/user`

This endpoint handles user profile management with the following operations:

- **GET**: Retrieves the current user's profile information
- **POST**: Updates the user's profile with validation

#### Authentication

All operations are protected with the `withAuth` middleware, which verifies the user is authenticated using Clerk.

#### Implementation Details

The endpoint interacts with both our database and Clerk:

```typescript
// Database updates through authData abstraction
const updatedUser = await authData.updateUser(user.id, {
  name: data.name,
});

// Role management
if (!user.roles.includes(data.role)) {
  await authData.addRole(user.id, data.role);
}

// Clerk metadata updates
await clerkClient.users.updateUser(user.clerkId, {
  firstName: data.name.split(' ')[0],
  lastName: data.name.includes(' ') ? data.name.split(' ').slice(1).join(' ') : '',
  publicMetadata: {
    ...user,
    roles: [...new Set([...user.roles, data.role])],
    verified: true,
    completedOnboarding: isOnboarding ? true : undefined,
  },
});
```

### `/api/profiles/builder`

For users with the BUILDER role, this endpoint manages builder-specific profile information:

- **GET**: Retrieves the builder profile of the authenticated user
- **POST**: Creates or updates the builder profile

## Client Components

### Onboarding Page

The onboarding page (`/app/onboarding/page.tsx`) handles the initial profile setup:

1. Collects basic user information (name, role)
2. Creates the appropriate user records
3. Marks the user as having completed onboarding
4. Redirects to the dashboard

Key implementation details:
- Uses direct Clerk authentication via `useUser` hook
- Implements form validation with Zod schema
- Posts to `/api/profiles/user` with `isOnboarding: true` flag

### Profile Settings Page

The profile settings page (`/app/profile-settings/page.tsx`) allows users to update their basic information:

1. Display current user data
2. Allow changes to name and role
3. Show account status information

Key implementation details:
- Uses direct Clerk authentication via `useUser` hook
- Implements form validation with Zod schema
- Posts to `/api/profiles/user` for updates

### Builder Profile Management

For users with the BUILDER role, the edit profile page (`/app/profile-settings/edit/page.tsx`) provides additional builder-specific profile management:

1. Uses the ProfileContext for state management
2. Allows editing of builder-specific information
3. Supports portfolio management

## Authentication Approach

All profile management components use direct Clerk authentication:

```typescript
// Modern approach using direct Clerk hooks
const { user, isLoaded } = useUser();

// Access user data
const userName = user?.fullName;
const userRoles = user?.publicMetadata.roles as UserRole[] || [];
```

This replaces the deprecated compatibility layer that was previously used.

## Form Validation

All profile forms use Zod schemas for validation:

```typescript
const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  role: z.enum([UserRole.CLIENT, UserRole.BUILDER, UserRole.ADMIN], {
    required_error: "Please select a role.",
  }),
});
```

These are combined with react-hook-form for client-side validation.

## State Management Approaches

Two approaches are used for state management:

1. **Direct State**: Simpler components use React's useState for local state management
2. **Context API**: More complex components like the builder profile editor use React Context for state management

## Future Improvements

1. Extract common form schemas into shared utilities
2. Create a unified approach to form state management
3. Implement more robust error handling and retries
4. Add comprehensive test coverage
5. Consider migration to React Server Components where appropriate

## References

- [Clerk Documentation](https://clerk.dev/docs)
- [Architecture Decision Record: Profile Management](../architecture/decisions/0024-standardize-profile-management-with-clerk.md)
- [Architecture Decision Record: Clerk Migration](../architecture/decisions/0002-migrate-from-nextauth-to-clerk.md)
