# Clerk Custom Hooks Implementation

## Overview

This document details the implementation of custom client-side hooks for authentication in the Buildappswith platform. These hooks provide a consistent interface for authentication and role-based access control while abstracting the underlying Clerk authentication logic.

## Key Files and Components

- `/lib/auth/clerk-hooks.ts` - Custom hook implementations
- `/lib/auth/hooks.ts` - Re-exports of custom hooks for importing throughout the application
- Components using custom hooks (e.g., `site-header.tsx`)

## Custom Hooks

### Authentication Hooks

1. **`useAuth()`**
   - Enhanced version of Clerk's `useAuth` hook
   - Provides additional properties for role-based access: `isAdmin`, `isBuilder`, `isClient`
   - Includes the transformed user object

2. **`useUser()`**
   - Transforms Clerk's user data into application-specific format
   - Returns `{ user: ExtendedUser | null, isLoaded: boolean }`
   - Handles loading states and ensures proper typing

3. **`useAuthStatus()`**
   - Simple hook for checking authentication status
   - Returns `{ isAuthenticated: boolean, isLoading: boolean }`
   - Useful for conditional rendering based on auth status

4. **`useSignOut()`**
   - Wraps Clerk's sign-out functionality
   - Adds support for `callbackUrl` option
   - Ensures consistent sign-out experience

### Role-Based Access Control Hooks

1. **`useHasRole(role: UserRole)`**
   - Checks if the authenticated user has a specific role
   - Returns boolean indicating role status

2. **`useIsAdmin()`**
   - Convenience hook for checking admin role
   - Returns boolean indicating admin status

3. **`useIsBuilder()`**
   - Convenience hook for checking builder role
   - Returns boolean indicating builder status

4. **`useIsClient()`**
   - Convenience hook for checking client role
   - Returns boolean indicating client status

## Usage Examples

### Basic Authentication Check

```tsx
import { useAuth } from "@/lib/auth/hooks";

function MyComponent() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  return isSignedIn ? (
    <div>Authenticated Content</div>
  ) : (
    <div>Please sign in</div>
  );
}
```

### Role-Based Access Control

```tsx
import { useHasRole } from "@/lib/auth/hooks";
import { UserRole } from "@/lib/auth/types";

function AdminOnlyComponent() {
  const isAdmin = useHasRole(UserRole.ADMIN);
  
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Dashboard Content</div>;
}
```

### User Data Access

```tsx
import { useUser } from "@/lib/auth/hooks";

function UserProfile() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Not signed in</div>;
  }
  
  return (
    <div>
      <h1>Profile for {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(", ")}</p>
    </div>
  );
}
```

### Sign-Out Functionality

```tsx
import { useSignOut } from "@/lib/auth/hooks";

function SignOutButton() {
  const signOut = useSignOut();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };
  
  return (
    <button onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
```

## Technical Decisions

1. **Direct Extension Approach**
   - The custom hooks extend Clerk's hooks rather than replacing them
   - This ensures compatibility with Clerk's API while adding application-specific functionality

2. **Types Integration**
   - `ExtendedUser` interface defines the expected user structure
   - Proper typing ensures consistency throughout the application

3. **Role-Based Hook Design**
   - Role-specific hooks (e.g., `useIsAdmin`) provide a clean, semantic API
   - This simplifies component code and improves readability

4. **Loading State Handling**
   - All hooks handle loading states consistently
   - Prevents issues with attempting to access user data before it's available

## Migration Path

When migrating components from direct Clerk usage to these custom hooks:

1. Update imports to use hooks from `@/lib/auth/hooks` instead of `@clerk/nextjs`
2. Replace direct Clerk user access with the transformed user from `useUser()`
3. Replace role checking logic with appropriate role hooks
4. Update sign-out handlers to use the `useSignOut()` hook

## Validation

To verify the correctness of the hook implementation:

1. **User Object Transformation**
   - Ensure the `ExtendedUser` object contains all required fields
   - Verify proper handling of optional fields (e.g., `stripeCustomerId`)

2. **Role Checking**
   - Test with users having different role combinations
   - Verify proper handling of users with no roles

3. **Loading States**
   - Test rendering during loading state
   - Ensure components don't attempt to use user data before it's available

4. **Sign Out**
   - Verify redirection to correct URL after sign-out
   - Ensure proper cleanup of user session

## Next Steps

1. **Component Migration**
   - Update remaining components to use custom hooks
   - Standardize hook usage patterns across the application

2. **Testing**
   - Implement comprehensive tests for authentication hooks
   - Create mock providers for testing authentication-dependent components

3. **Documentation**
   - Update component documentation to reflect hook usage
   - Add hook examples to onboarding materials for new developers
