# Express SDK Client Usage Guide

This guide provides practical examples and best practices for using the Express SDK authentication system in client components.

## Quick Start

### Setup

Wrap your application or authenticated sections with the Express Auth Provider:

```tsx
// In your root layout or authenticated section
import { ExpressAuthProvider } from "@/components/auth";

export default function AuthenticatedLayout({ children }) {
  return (
    <ExpressAuthProvider>
      {children}
    </ExpressAuthProvider>
  );
}
```

### Basic Authentication Checks

Use authentication hooks to check if a user is signed in:

```tsx
import { useAuth, useAuthStatus } from "@/hooks/auth";

function ProfileButton() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  
  if (isLoading) {
    return <span>Loading...</span>;
  }
  
  if (!isAuthenticated) {
    return <a href="/login">Sign in</a>;
  }
  
  return <a href="/profile">My Profile</a>;
}
```

## Authentication Hooks

### Core Hooks

| Hook | Description | Example |
|------|-------------|---------|
| `useAuth()` | Complete authentication state | `const { isSignedIn, isLoaded, roles } = useAuth();` |
| `useAuthStatus()` | Simple authenticated status | `const { isAuthenticated, isLoading } = useAuthStatus();` |
| `useUser()` | User profile information | `const { user } = useUser();` |
| `useSignOut()` | Sign out functionality | `const signOut = useSignOut();` |

### Role-Based Hooks

| Hook | Description | Example |
|------|-------------|---------|
| `useHasRole(role)` | Check for specific role | `const isBuilder = useHasRole(UserRole.BUILDER);` |
| `useIsAdmin()` | Check for admin role | `const isAdmin = useIsAdmin();` |
| `useIsBuilder()` | Check for builder role | `const isBuilder = useIsBuilder();` |
| `useIsClient()` | Check for client role | `const isClient = useIsClient();` |
| `useHasAnyRole(roles)` | Check for any role in list | `const hasAccess = useHasAnyRole([UserRole.ADMIN, UserRole.BUILDER]);` |
| `useHasAllRoles(roles)` | Check for all roles in list | `const hasBothRoles = useHasAllRoles([UserRole.BUILDER, UserRole.CLIENT]);` |

### Permission-Based Hooks

| Hook | Description | Example |
|------|-------------|---------|
| `usePermission(permission)` | Check for specific permission | `const canEditProfile = usePermission('profile:edit');` |
| `useAnyPermission(permissions)` | Check for any permission in list | `const hasAccess = useAnyPermission(['profile:view', 'profile:edit']);` |
| `useAllPermissions(permissions)` | Check for all permissions in list | `const fullAccess = useAllPermissions(['booking:create', 'booking:edit']);` |

### Token Management Hooks

| Hook | Description | Example |
|------|-------------|---------|
| `useAuthToken()` | Token management utilities | `const { token, refreshToken, getToken } = useAuthToken();` |
| `useAuthenticatedFetch()` | Fetch with auth tokens | `const fetchWithAuth = useAuthenticatedFetch();` |

## Protected Components

### Route Protection

Protect entire routes or page sections:

```tsx
import { ProtectedRoute } from "@/components/auth";
import { UserRole } from "@/lib/auth/types";

export default function AdminPage() {
  return (
    <ProtectedRoute 
      requiredRoles={[UserRole.ADMIN]} 
      redirectUrl="/login"
    >
      <AdminDashboard />
    </ProtectedRoute>
  );
}
```

### Conditional Rendering

Conditionally render UI elements based on roles:

```tsx
import { RoleProtected } from "@/components/auth";
import { UserRole } from "@/lib/auth/types";

function DashboardActions() {
  return (
    <div className="actions">
      {/* Available to everyone */}
      <button>View Profile</button>
      
      {/* Only visible to builders */}
      <RoleProtected 
        requiredRoles={[UserRole.BUILDER]} 
        fallback={null}
      >
        <button>Manage Portfolio</button>
      </RoleProtected>
      
      {/* Only visible to admins */}
      <RoleProtected 
        requiredRoles={[UserRole.ADMIN]} 
        fallback={null}
      >
        <button>Admin Settings</button>
      </RoleProtected>
    </div>
  );
}
```

### Permission-Based Protection

Control access based on specific permissions:

```tsx
import { PermissionProtected } from "@/components/auth";

function BookingActions({ bookingId }) {
  return (
    <div className="booking-actions">
      <PermissionProtected 
        permissions={['booking:view']} 
        fallback={null}
      >
        <button>View Details</button>
      </PermissionProtected>
      
      <PermissionProtected 
        permissions={['booking:edit']} 
        fallback={null}
      >
        <button>Edit Booking</button>
      </PermissionProtected>
      
      <PermissionProtected 
        permissions={['booking:delete']} 
        fallback={<p>Contact admin to delete</p>}
      >
        <button>Delete Booking</button>
      </PermissionProtected>
    </div>
  );
}
```

## Authentication Status Components

### Basic Status Display

Show authentication status:

```tsx
import { AuthStatus } from "@/components/auth";

function ProfilePage() {
  return (
    <div className="profile-page">
      <h1>Profile</h1>
      <AuthStatus className="auth-status-panel" />
      {/* Rest of profile content */}
    </div>
  );
}
```

### Compact Header Status

Use the compact variant for headers:

```tsx
import { HeaderAuthStatus } from "@/components/auth";

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="logo">My App</div>
      <nav>{/* Navigation links */}</nav>
      <HeaderAuthStatus />
    </header>
  );
}
```

## Error Handling

### Using the Error Boundary

The error boundary is automatically included with `ExpressAuthProvider`. For manual use:

```tsx
import { AuthErrorBoundary } from "@/components/auth";

function ProfileSection() {
  return (
    <AuthErrorBoundary
      fallback={<p>Unable to load profile due to authentication error</p>}
    >
      <ProfileContent />
    </AuthErrorBoundary>
  );
}
```

### Handling Authentication Errors in Async Operations

```tsx
import { withAuthErrorHandling, dispatchAuthError } from "@/components/auth";

// Automatic error handling
async function fetchUserData() {
  return withAuthErrorHandling(async () => {
    const response = await fetch('/api/user/profile');
    
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    
    return response.json();
  });
}

// Manual error dispatching
function handleApiError(error) {
  if (error.status === 401 || error.status === 403) {
    dispatchAuthError(new Error('Authentication failed'));
    return true;
  }
  return false;
}
```

## Advanced Usage

### Custom Role Requirements

Combine role checks for complex authorization scenarios:

```tsx
import { useHasAnyRole, useHasAllRoles } from "@/hooks/auth";
import { UserRole } from "@/lib/auth/types";

function ComplexPermissionComponent() {
  // Admin OR (Builder AND Client)
  const isAdmin = useIsAdmin();
  const hasBuilderAndClient = useHasAllRoles([UserRole.BUILDER, UserRole.CLIENT]);
  const hasAccess = isAdmin || hasBuilderAndClient;
  
  if (!hasAccess) {
    return <p>You need special access</p>;
  }
  
  return <div>Special content</div>;
}
```

### Token Management

Use the token management hooks for advanced scenarios:

```tsx
import { useAuthToken } from "@/hooks/auth";

function TokenAwareComponent() {
  const { token, refreshToken, isTokenExpired } = useAuthToken();
  
  const handleAction = async () => {
    if (isTokenExpired) {
      await refreshToken();
    }
    
    // Use the token for authenticated API calls
    const bearerToken = await getToken();
    // Make your API call with the token
  };
  
  return (
    <button onClick={handleAction}>
      Perform Authenticated Action
    </button>
  );
}
```

### Authentication Context Provider with Storage

For advanced use cases with local storage persistence:

```tsx
import { ExpressAuthProvider } from "@/components/auth";
import { useEffect } from "react";

function PersistentAuthProvider({ children }) {
  // Example of adding persistence to auth state (implementation varies)
  useEffect(() => {
    const handleAuthChange = (e) => {
      if (e.key === 'auth-state-change') {
        // Handle auth state changes across tabs
      }
    };
    
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);
  
  return (
    <ExpressAuthProvider>
      {children}
    </ExpressAuthProvider>
  );
}
```

## Best Practices

1. **Use Specialized Hooks**: Prefer specific hooks like `useIsAdmin()` over generic checks for better code clarity
2. **Role vs Permission**: Use role checks for broad access control and permission checks for specific actions
3. **Memoize Complex Checks**: For complex authorization logic, use `useMemo` to prevent unnecessary re-renders
4. **Error Recovery**: Always provide meaningful error recovery options when authentication issues occur
5. **Loading States**: Show appropriate loading states during authentication checks
6. **Avoid Deep Nesting**: Instead of deeply nesting role checks, use composed hooks for complex conditions

## Common Pitfalls

1. **Server Components**: Remember that authentication hooks can only be used in client components
2. **Error Handling**: Don't rely on try/catch alone; use the `withAuthErrorHandling` utility
3. **Token Expiration**: Be aware of token expiration; don't assume tokens remain valid indefinitely
4. **Over-Checking**: Don't check auth status unnecessarily; use the provider and specialized components
5. **Missing Provider**: Ensure all components using auth hooks are descendants of `ExpressAuthProvider`

## Debugging Tips

1. **Authentication State**: Use the `AuthStatus` component to visualize current auth state
2. **Error Simulation**: Use debug controls in development to simulate different auth errors
3. **Token Inspection**: Examine the token data for role and permission issues
4. **Network Monitoring**: Watch network requests for auth-related API calls

By following this guide, you'll be able to implement robust, performant authentication in your client components using the Express SDK.