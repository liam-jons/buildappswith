# Auth Context Type Alignment

## Implementation Summary

This document outlines the implementation of standardized authentication context types for the BuildAppsWith platform. The goal is to ensure consistent and type-safe authentication state management throughout the application.

## 1. Enhanced Auth Types

We've updated the auth types to use standardized enums and provide comprehensive interfaces:

```typescript
// File: lib/auth/types.ts

import { 
  UserRole, 
  AuthStatus, 
  ProfileType 
} from '@/lib/types/enums';

// Permission type with all possible permissions
export type Permission = 
  | 'view:profile'
  | 'edit:profile'
  | 'view:builder'
  | 'edit:builder'
  | 'manage:bookings'
  | 'manage:sessions'
  | 'admin:access'
  | 'payment:view'
  | 'payment:manage';

// Role-Permission mapping
export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

// Permission checker function type
export type PermissionChecker = (permission: Permission) => boolean;

// Authentication state
export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error?: AuthError | null;
}

// Authentication context
export interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  isLoaded: boolean;
  isSignedIn: boolean;
  roles: UserRole[];
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  // ...other methods
}

// Auth provider props
export interface AuthProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AuthState>;
  onError?: (error: AuthError) => void;
}

// Profile route context
export interface ProfileRouteContext {
  userId: string;
  clerkId: string;
  user: {
    id: string;
    roles: UserRole[];
    [key: string]: any;
  };
  profileId?: string;
  profileType?: ProfileType;
  isOwner: boolean;
  isAdmin: boolean;
}
```

## 2. Permission Utilities

We've added utilities for working with permissions:

```typescript
/**
 * Type guard to check if a value is a valid Permission
 */
export function isValidPermission(value: string): value is Permission {
  const validPermissions: Permission[] = [
    'view:profile',
    'edit:profile',
    'view:builder',
    'edit:builder',
    'manage:bookings',
    'manage:sessions',
    'admin:access',
    'payment:view',
    'payment:manage'
  ];
  
  return validPermissions.includes(value as Permission);
}

/**
 * Helper function to get default permissions for a role
 */
export function getDefaultPermissionsForRole(role: UserRole): Permission[] {
  switch (role) {
    case UserRole.ADMIN:
      return [
        'view:profile',
        'edit:profile',
        'view:builder',
        'edit:builder',
        'manage:bookings',
        'manage:sessions',
        'admin:access',
        'payment:view',
        'payment:manage'
      ];
    case UserRole.BUILDER:
      return [
        'view:profile',
        'edit:profile',
        'manage:bookings',
        'manage:sessions'
      ];
    // ...other roles
  }
}
```

## 3. Updated Profile Auth Middleware

We've enhanced the profile auth middleware to use the new types and support permission-based access control:

```typescript
// File: lib/middleware/profile-auth.ts

import { 
  UserRole,
  ProfileType,
  AccessType
} from '@/lib/types/enums';
import {
  Permission,
  ProfileRouteContext,
  ProfileRouteHandler,
  getDefaultPermissionsForRole
} from '@/lib/auth/types';

export function withProfileAccess(
  handler: ProfileRouteHandler,
  options: {
    requireAuth?: boolean;
    allowedRoles?: UserRole[];
    requiredPermissions?: Permission[];
    allowOwner?: boolean;
    allowAdmin?: boolean;
  } = {
    // default options
  }
) {
  // Implementation details...
  
  // Check permission-based access if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    // Get all permissions for user's roles
    const userPermissions = user.roles.flatMap(
      role => getDefaultPermissionsForRole(role)
    );
    
    // Check if user has all required permissions
    const hasPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );
    
    if (!hasPermissions) {
      // Handle unauthorized access
    }
  }
  
  // Rest of implementation...
}
```

## 4. Auth Component Updates

We've updated the auth components to use the standardized types:

```typescript
// File: components/auth/auth-status.tsx

import { 
  UserRole, 
  AuthStatus as AuthStatusEnum 
} from '@/lib/types/enums';

export function AuthStatus({ className, compact = false }: AuthStatusProps) {
  const { isSignedIn, isLoaded, status, roles, hasRole } = useAuth();
  // Implementation using standardized types
  
  if (status === AuthStatusEnum.LOADING || !isLoaded) {
    // Handle loading state
  }
  
  if (status === AuthStatusEnum.UNAUTHENTICATED || !isSignedIn) {
    // Handle unauthenticated state
  }
  
  // Rest of implementation...
}
```

## 5. Standardized Barrel Exports

We've updated the barrel export files to consistently export the new types:

```typescript
// lib/auth/index.ts

// Import standardized enums to re-export
import { 
  UserRole, 
  AuthStatus,
  ProfileType 
} from '@/lib/types/enums';

// Re-export standardized enums for convenience
export { 
  UserRole, 
  AuthStatus,
  ProfileType 
};

// Export types
export type {
  AuthUser,
  AuthState,
  AuthContextType,
  AuthProviderProps,
  AuthError,
  AuthResponse,
  AuthOptions,
  AuthMiddlewareOptions,
  AuthObject,
  Permission,
  RolePermission,
  PermissionChecker,
  ProfileRouteContext,
  ProfileRouteHandler
} from './types';

// Export functions from types
export {
  isValidPermission,
  getDefaultPermissionsForRole
} from './types';
```

## Benefits

- **Improved Type Safety**: Strong typing for authentication state and user objects
- **Consistent Auth Status**: Standardized enum values for authentication states
- **Permission-Based Auth**: Enhanced role-based access control with granular permissions
- **Auth Provider Props**: Standardized props interface for authentication providers
- **Profile Route Context**: Improved context typing for profile routes

## Usage Examples

```typescript
// Example 1: Using the auth context
import { useAuth } from '@/lib/auth';
import { AuthStatus } from '@/lib/types/enums';

function MyComponent() {
  const { status, user, hasPermission } = useAuth();
  
  if (status === AuthStatus.LOADING) {
    return <LoadingSpinner />;
  }
  
  if (status === AuthStatus.UNAUTHENTICATED) {
    return <SignInPrompt />;
  }
  
  if (hasPermission('edit:profile')) {
    return <ProfileEditor />;
  }
  
  return <ProfileViewer />;
}

// Example 2: Using permission-based middleware
import { withProfileAccess } from '@/lib/middleware/profile-auth';

const handler = (req, context) => {
  // Handle authenticated request with permission check
};

export default withProfileAccess(handler, {
  requireAuth: true,
  requiredPermissions: ['edit:profile']
});
```

## Next Steps

1. Update the auth hooks to fully implement the new context pattern
2. Add comprehensive unit tests for the permission system
3. Create additional middleware helpers for common auth patterns
4. Implement more granular permission checks in UI components