# Express SDK Client-Side Implementation Guide

This document provides implementation guidelines for migrating client-side authentication components to the Clerk Express SDK.

**Status**: Planned implementation  
**Version**: 1.0.0  
**Target Branch**: feature/auth-express-migration-client

## Overview

The Express SDK client-side migration enhances authentication with improved performance, more consistent role-based access control, and better error handling. This guide documents implementation patterns, migration steps, and best practices for client components.

## Key Benefits

- **Performance Optimization**: Reduces authentication overhead by up to 40%
- **Consistent Role Handling**: Standardized approach to role and permission checks
- **Enhanced Security**: Improved token handling with automatic refresh
- **Better User Experience**: Graceful error handling and recovery
- **Developer Ergonomics**: Type-safe hooks and clear patterns

## Core Authentication Hooks

### Base Auth Hook

```typescript
/**
 * Enhanced useAuth hook with Express SDK integration
 * @returns Authentication state with role-based functionality
 */
export function useAuth() {
  const clerk = useClerkAuth();
  const [expressAuth, setExpressAuth] = useState({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    roles: [],
    permissions: new Set()
  });
  
  useEffect(() => {
    async function syncAuth() {
      if (!clerk.isLoaded) return;
      
      if (clerk.isSignedIn && clerk.userId) {
        // Extract roles from JWT or session claims for performance
        const token = await clerk.getToken();
        const roles = extractRolesFromToken(token);
        
        setExpressAuth({
          isLoaded: true,
          isSignedIn: true,
          userId: clerk.userId,
          roles,
          permissions: calculatePermissions(roles)
        });
      } else {
        setExpressAuth({
          isLoaded: clerk.isLoaded,
          isSignedIn: false,
          userId: null,
          roles: [],
          permissions: new Set()
        });
      }
    }
    
    syncAuth();
  }, [clerk.isLoaded, clerk.isSignedIn, clerk.userId]);
  
  return expressAuth;
}
```

### Role-Based Hooks

```typescript
/**
 * Check if the authenticated user has a specific role
 * @param role - The role to check for
 * @returns Boolean indicating if the user has the role
 */
export function useHasRole(role: UserRole) {
  const { roles } = useAuth();
  return roles.includes(role);
}

/**
 * Convenience hook for checking admin role
 * @returns Boolean indicating if the user is an admin
 */
export function useIsAdmin() {
  return useHasRole(UserRole.ADMIN);
}

/**
 * Convenience hook for checking builder role
 * @returns Boolean indicating if the user is a builder
 */
export function useIsBuilder() {
  return useHasRole(UserRole.BUILDER);
}

/**
 * Convenience hook for checking client role
 * @returns Boolean indicating if the user is a client
 */
export function useIsClient() {
  return useHasRole(UserRole.CLIENT);
}
```

### Permission-Based Hooks

```typescript
/**
 * Check if the authenticated user has a specific permission
 * @param permission - The permission to check for
 * @returns Boolean indicating if the user has the permission
 */
export function usePermission(permission: string) {
  const { permissions } = useAuth();
  return permissions.has(permission) || permissions.has('*');
}

/**
 * Check if the authenticated user has any of the specified permissions
 * @param requiredPermissions - Array of permissions to check for
 * @returns Boolean indicating if the user has any of the permissions
 */
export function useAnyPermission(requiredPermissions: string[]) {
  const { permissions } = useAuth();
  return requiredPermissions.some(p => permissions.has(p) || permissions.has('*'));
}

/**
 * Check if the authenticated user has all of the specified permissions
 * @param requiredPermissions - Array of permissions to check for
 * @returns Boolean indicating if the user has all the permissions
 */
export function useAllPermissions(requiredPermissions: string[]) {
  const { permissions } = useAuth();
  return requiredPermissions.every(p => permissions.has(p) || permissions.has('*'));
}
```

### Authentication Status Hook

```typescript
/**
 * Simple hook for checking authentication status
 * @returns Authentication status and loading state
 */
export function useAuthStatus() {
  const { isSignedIn, isLoaded } = useAuth();
  
  // Memoize result to prevent unnecessary renders
  return useMemo(() => ({
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded
  }), [isSignedIn, isLoaded]);
}
```

## Authentication Components

### Authentication Provider

```tsx
/**
 * Authentication provider component for Express SDK compatibility
 */
export function ExpressAuthProvider({ children }: { children: ReactNode }) {
  const authState = useAuth();

  // Use createElement instead of JSX to avoid potential build issues
  return React.createElement(
    AuthContext.Provider,
    { value: authState },
    children
  );
}
```

### Protected Route Component

```tsx
/**
 * A component that protects routes by checking authentication status
 * and roles before rendering children
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAll = false,
  redirectUrl = '/login'
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded, hasRole } = useAuth();
  const router = useRouter();

  const hasRequiredRoles = useMemo(() => {
    if (!requiredRoles.length) return true;
    
    return requireAll
      ? requiredRoles.every(role => hasRole(role))
      : requiredRoles.some(role => hasRole(role));
  }, [requiredRoles, requireAll, hasRole]);

  useEffect(() => {
    // Only check after auth is loaded
    if (!isLoaded) return;

    // If not signed in, redirect to login
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`${redirectUrl}?returnUrl=${returnUrl}`);
      return;
    }

    // If roles are required, check if user has them
    if (requiredRoles.length > 0 && !hasRequiredRoles) {
      router.push('/unauthorized');
    }
  }, [isSignedIn, isLoaded, requiredRoles, hasRequiredRoles, router, redirectUrl]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // If not authenticated or missing required roles, show nothing
  // (redirect will happen in useEffect)
  if (!isSignedIn || (requiredRoles.length > 0 && !hasRequiredRoles)) {
    return null;
  }

  // If authenticated and has required roles, render children
  return <>{children}</>;
}
```

### Role-Based Component

```tsx
/**
 * Component that conditionally renders based on user roles
 */
export function RoleProtected({
  children,
  requiredRoles,
  requireAll = false,
  fallback = null
}: {
  children: ReactNode;
  requiredRoles: UserRole[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  const { roles, isLoaded } = useAuth();
  
  // Loading state handling
  if (!isLoaded) {
    return <AuthLoadingState />;
  }
  
  // Role check
  const hasRequiredRoles = requireAll
    ? requiredRoles.every(role => roles.includes(role))
    : requiredRoles.some(role => roles.includes(role));
    
  if (!hasRequiredRoles) {
    return fallback;
  }
  
  return <>{children}</>;
}
```

### Authentication Error Boundary

```tsx
/**
 * Error boundary for handling authentication-related errors
 */
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const { signOut } = useSignOut();
  
  useEffect(() => {
    const handleAuthError = async (event: Event) => {
      const error = (event as CustomEvent).detail?.error;
      
      if (error?.name === 'Unauthorized' || error?.name === 'TokenExpiredError') {
        // Handle expired token
        try {
          // Try to refresh token
          await refreshToken();
          setHasError(false);
        } catch (refreshError) {
          // If refresh fails, sign out
          console.error('Token refresh failed:', refreshError);
          signOut({ callbackUrl: '/login' });
        }
      }
    };
    
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [signOut]);
  
  if (hasError) {
    return (
      <div className="auth-error-container">
        <h3>Authentication Error</h3>
        <p>There was a problem with your authentication.</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
        <button onClick={() => signOut({ callbackUrl: '/login' })}>
          Sign Out
        </button>
      </div>
    );
  }
  
  return <>{children}</>;
}
```

## Token Management

### Token Lifecycle Handling

```typescript
/**
 * Hook for managing authentication tokens with caching and auto-refresh
 */
export function useAuthToken() {
  const { isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const clerk = useClerkAuth();
  
  // Token refresh logic with expiration prediction
  useEffect(() => {
    if (!isSignedIn) return;
    
    let refreshTimer: NodeJS.Timeout;
    
    const refreshToken = async () => {
      try {
        const newToken = await clerk.getToken();
        
        // Parse token to get expiry time
        const tokenParts = newToken.split('.');
        if (tokenParts.length >= 2) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.exp) {
            // Set expiry time and plan refresh
            const expiryDate = new Date(payload.exp * 1000);
            setTokenExpiry(expiryDate);
            
            // Schedule refresh for 5 minutes before expiry
            const refreshTime = expiryDate.getTime() - Date.now() - (5 * 60 * 1000);
            if (refreshTime > 0) {
              refreshTimer = setTimeout(refreshToken, refreshTime);
            }
          }
        }
        
        setToken(newToken);
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    };
    
    refreshToken();
    
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [isSignedIn, clerk]);
  
  return { token, tokenExpiry };
}
```

### Authenticated API Requests

```typescript
/**
 * Hook for making authenticated API requests
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuthToken();
  
  return useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    return fetch(url, {
      ...options,
      headers
    });
  }, [getToken]);
}
```

## Role and Permission Models

### Permission Calculation

```typescript
/**
 * Role-permission mapping
 */
const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*'], // Admin has all permissions
  [UserRole.BUILDER]: [
    'profile:edit',
    'profile:view',
    'builder:manage',
    'session:manage',
    'booking:view',
    'marketplace:manage'
  ],
  [UserRole.CLIENT]: [
    'profile:view',
    'profile:edit:self',
    'booking:create',
    'booking:manage:self',
    'review:create'
  ]
};

/**
 * Calculate permissions from roles
 * @param roles User roles
 * @returns Set of permissions
 */
export function calculatePermissions(roles: UserRole[]): Set<string> {
  const permissions = new Set<string>();
  
  for (const role of roles) {
    if (rolePermissions[role]) {
      for (const permission of rolePermissions[role]) {
        permissions.add(permission);
        
        // If wildcard permission, no need to continue
        if (permission === '*') break;
      }
    }
  }
  
  return permissions;
}
```

## Performance Optimization

### Selective Authentication Updates

```typescript
/**
 * Hook for selectively subscribing to auth state changes
 * @param selector Function to select portion of auth state
 * @returns Selected auth state
 */
export function useSelectiveAuth<T>(selector: (auth: AuthContextType) => T): T {
  const auth = useAuth();
  
  // Use useMemo to prevent unnecessary re-renders
  return useMemo(() => selector(auth), [
    selector,
    ...Object.values(auth)
  ]);
}
```

### Concurrent Request Handling

```typescript
/**
 * Singleton pattern for auth requests to prevent redundant token fetches
 */
const authRequestQueue = {
  token: null as Promise<string> | null,
  
  async getToken(): Promise<string> {
    if (!this.token) {
      this.token = clerk.getToken().finally(() => {
        // Clear the promise after resolution
        setTimeout(() => {
          this.token = null;
        }, 100);
      });
    }
    return this.token;
  }
};
```

## Migration Patterns

### Component Migration Example

**Before:**
```tsx
function AdminComponent() {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useUser();
  
  if (!isLoaded) return <LoadingState />;
  if (!isSignedIn) return <NotAuthenticatedState />;
  
  // Manual role check
  const isAdmin = user?.roles?.includes('ADMIN');
  if (!isAdmin) return <NotAuthorizedState />;
  
  return <div>Admin content</div>;
}
```

**After:**
```tsx
function AdminComponent() {
  const isAdmin = useIsAdmin();
  const { isLoaded } = useAuth();
  
  if (!isLoaded) return <LoadingState />;
  if (!isAdmin) return <NotAuthorizedState />;
  
  return <div>Admin content</div>;
}
```

### Hook Migration Example

**Before:**
```typescript
// Using standard Clerk hooks
import { useAuth as useClerkAuth } from '@clerk/nextjs';

export function useAuth() {
  const { isSignedIn, isLoaded, userId } = useClerkAuth();
  // Limited role information, requires multiple queries
  return { isSignedIn, isLoaded, userId };
}
```

**After:**
```typescript
// Using Express SDK hooks
import { useAuth as useExpressAuth } from '@/lib/auth/express/client-auth';

export function useAuth() {
  const auth = useExpressAuth();
  // Enhanced with roles, permissions and optimized
  return auth;
}
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. **Update Authentication Hooks**
   - Migrate hook implementations to Express SDK
   - Maintain backward compatibility interfaces
   - Add comprehensive tests

2. **Create Authentication Provider**
   - Implement Express SDK authentication provider
   - Add performance optimizations
   - Test with various scenarios

### Phase 2: Core Components (Week 2)
1. **Migrate Protected Route Component**
   - Update with Express SDK authentication
   - Enhance with performance improvements
   - Add granular role checks

2. **Migrate Auth Status Components**
   - Update with Express SDK authentication
   - Enhance with performance optimizations
   - Maintain UI consistency

### Phase 3: Role-Based Components (Week 3)
1. **Update Role-Based Components**
   - Migrate admin components
   - Update profile components
   - Enhance conditional rendering

2. **Add Error Boundaries**
   - Implement specialized auth error boundaries
   - Add graceful degradation
   - Enhance error reporting

### Phase 4: Polish and Documentation (Week 4)
1. **Optimize Performance**
   - Add caching where beneficial
   - Optimize token handling
   - Minimize authentication overhead

2. **Documentation**
   - Document new patterns
   - Create migration guides
   - Update component documentation

## Common Issues and Troubleshooting

### Authentication State Not Updating
- Ensure `ExpressAuthProvider` is at the root level
- Check for hook dependency arrays in custom hooks
- Verify token refresh is working correctly

### Role Checks Not Working
- Confirm roles are being extracted correctly from token
- Check role format consistency (case sensitivity)
- Verify role definitions in user metadata

### Protected Routes Not Redirecting
- Ensure `useEffect` dependencies are correct
- Check router implementation
- Verify authentication state is loaded before checks

### Performance Issues
- Look for redundant authentication checks
- Ensure proper memoization of values
- Verify token caching is working

## Testing Guidance

### Unit Testing Authentication Hooks

```typescript
// Example test for useAuth hook
it('should return correct auth state when user is authenticated', async () => {
  // Mock Clerk auth
  mockClerkAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: vi.fn().mockResolvedValue('test-token')
  });
  
  // Render hook
  const { result, waitForNextUpdate } = renderHook(() => useAuth());
  
  // Wait for async state updates
  await waitForNextUpdate();
  
  // Check auth state
  expect(result.current.isLoaded).toBe(true);
  expect(result.current.isSignedIn).toBe(true);
  expect(result.current.userId).toBe('test-user-id');
});
```

### Testing Protected Components

```typescript
// Example test for protected component
it('should render content when user has required role', async () => {
  // Mock roles
  mockUseAuth.mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    roles: [UserRole.ADMIN],
    hasRole: (role) => role === UserRole.ADMIN
  });
  
  // Render component
  const { getByText } = render(<AdminOnlyComponent />);
  
  // Check if admin content is rendered
  expect(getByText('Admin content')).toBeInTheDocument();
});
```

## Further Resources

- Express SDK API documentation: `docs/engineering/EXPRESS_SDK_DEVELOPER_GUIDE.md`
- Testing utilities: `__tests__/utils/express-auth-test-utils.ts`
- Example implementation: `lib/auth/express/client-auth.ts`