# Authentication Domain

## Overview

The BuildAppsWith authentication system is built on the Clerk Express SDK integration, providing a robust, secure, and standardized approach to authentication across the application.

The auth domain follows the golden standard architecture pattern used in the marketplace domain, with a clean and well-organized structure.

## Architecture

The authentication domain is organized as follows:

```
lib/auth/
├── index.ts              # Barrel export (public API)
├── actions.ts            # Server actions
├── api.ts                # API utilities
├── api-auth.ts           # API route protection
├── hooks.ts              # Client hooks 
├── middleware.ts         # Middleware
├── server.ts             # Server utilities
├── utils.ts              # Shared utilities
├── types.ts              # Type definitions
├── schemas.ts            # Zod schemas
├── security-logging.ts   # Security logging utilities
├── adapters/             # Implementation details
│   └── clerk-express/    # Clerk Express SDK specific code
│       ├── adapter.ts    # Clerk Express adapter
│       ├── errors.ts     # Auth error types
│       └── config.ts     # Clerk configuration
└── README.md             # Domain documentation
```

## Usage

### Client-Side Authentication

```typescript
// Import auth hooks
import { useAuth, useUser, useIsAdmin } from '@/lib/auth';

// Use in your components
function ProfileComponent() {
  const { user, isLoaded, isSignedIn } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <div>Please sign in</div>;
  
  return <div>Hello, {user.name}</div>;
}

// Role-based access control
function AdminPanel() {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) return <div>Unauthorized</div>;
  
  return <div>Admin Panel</div>;
}
```

### Server-Side Authentication

```typescript
// In server components or API routes
import { getServerAuth, requireServerAuth, requireServerRole, UserRole } from '@/lib/auth';

// Server component example
export default async function ProfilePage() {
  // Get auth information (doesn't throw if not authenticated)
  const auth = getServerAuth();
  
  if (!auth.isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  // Or require authentication (throws if not authenticated)
  try {
    const authRequired = requireServerAuth();
    // User is definitely authenticated here
  } catch (error) {
    // Handle authentication error
  }
  
  // Require specific role
  try {
    const adminAuth = requireServerRole(UserRole.ADMIN);
    // User is authenticated and has ADMIN role
  } catch (error) {
    // Handle authentication or authorization error
  }
  
  return <div>Authenticated server component</div>;
}
```

### API Route Protection

```typescript
// In API route handlers
import { withAuth, withRole, UserRole } from '@/lib/auth';

// Basic authentication protection
export const GET = withAuth(async (req, userId) => {
  // User is authenticated, userId is available
  return Response.json({ message: 'Authenticated API route' });
});

// Role-based protection
export const POST = withRole(UserRole.ADMIN, async (req, userId, roles) => {
  // User is authenticated and has ADMIN role
  return Response.json({ message: 'Admin-only API route' });
});
```

### Higher-Order Component (HOC) for Client Routes

```typescript
import { withAuth, UserRole } from '@/lib/auth';

// Protect a client component
const ProtectedComponent = withAuth(MyComponent, {
  redirectTo: '/login',
  requiredRoles: [UserRole.CLIENT],
  requireAllRoles: false, // default is false (any role matches)
});
```

## Implementation Details

### Authentication Provider

The auth system uses Clerk's Express SDK integration via a custom adapter layer that bridges Clerk with Next.js. The system is implemented with performance monitoring, standardized error handling, and comprehensive logging.

### Role-Based Access Control

The system supports three primary roles:
- `ADMIN`: System administrators with full access
- `BUILDER`: Service providers/builders with access to their resources
- `CLIENT`: Customers/clients with access to their projects

These roles are stored in Clerk's user metadata and made available throughout the application via convenient hooks and utilities.

## Migration

If you're updating existing code that used the previous authentication pattern, replace:

```typescript
// Old pattern (deprecated)
import { useAuth } from '@/hooks/auth';

// New pattern
import { useAuth } from '@/lib/auth';
```

All functionality remains backward compatible, but direct imports from `@/lib/auth` are preferred.
