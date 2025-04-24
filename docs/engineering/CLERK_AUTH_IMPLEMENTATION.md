# Clerk Authentication Implementation Guide

## Overview

This document details the implementation of Clerk authentication in the Buildappswith platform, replacing NextAuth.js. It provides all necessary information for developers working with the new authentication system.

**Version: 1.0.59**  
**Last Updated: April 24, 2025**

## Architecture

### Key Components

1. **Data Access Layer**
   - Location: `/lib/auth/data-access.ts`
   - Purpose: Abstracts all database operations related to users and authentication
   - Design: Repository pattern with clear method signatures

2. **Auth Helpers**
   - Location: `/lib/auth/clerk/helpers.ts`
   - Purpose: Provides utilities for working with Clerk users and sessions
   - Key features: User fetching, role verification, session handling

3. **API Middleware**
   - Location: `/lib/auth/clerk/api-auth.ts`
   - Purpose: Protects API routes and provides authenticated user data
   - Variants: `withAuth`, `withRole`, `withAdmin`, `withBuilder`

4. **UI Components**
   - Location: `/components/auth/*`
   - Purpose: User-facing authentication interfaces
   - Components: ClerkAuthForm, AuthErrorBoundary, LoadingState

### Authentication Flow

1. **Sign Up Flow**
   - User registers through Clerk UI
   - On successful registration, Clerk creates a user record
   - User data is synchronized to our database (User table)
   - Initial roles are assigned (default: CLIENT)

2. **Sign In Flow**
   - User authenticates through Clerk UI
   - Clerk validates credentials and creates a session
   - Session data is made available through Clerk's hooks and middleware
   - API requests include the session token automatically

3. **Session Management**
   - Clerk handles session persistence and renewal
   - Active sessions can be managed through Clerk Dashboard
   - Sessions can be revoked programmatically or through the dashboard

## Implementation Details

### Data Models

The integration syncs between Clerk users and our database:

```typescript
// User in our database
interface User {
  id: string;            // Database primary key
  clerkId: string;       // Reference to Clerk user ID
  name: string | null;
  email: string;
  image: string | null;
  roles: UserRole[];     // Array of assigned roles
  verified: boolean;     // Email verification status
  stripeCustomerId?: string | null;
}

// AuthUser (combined Clerk + database data)
interface AuthUser {
  id: string;            // Database user ID
  clerkId: string;       // Clerk user ID
  name: string | null;
  email: string;
  image: string | null;
  roles: UserRole[];
  verified: boolean;
  stripeCustomerId?: string | null;
}
```

### API Route Protection

All API routes should use the middleware helpers for authentication:

```typescript
// For routes requiring any authenticated user
export const GET = withAuth(async (request, user) => {
  // Implementation with authenticated user
});

// For admin-only routes
export const POST = withAdmin(async (request, user) => {
  // Implementation with admin user
});

// For builder-only routes
export const PUT = withBuilder(async (request, user) => {
  // Implementation with builder user
});

// For custom role requirements
export const DELETE = withRole(UserRole.CUSTOM_ROLE, async (request, user) => {
  // Implementation with specific role
});
```

### Client-Side Authentication

In client components, use Clerk's hooks for authentication state:

```typescript
"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export function ProfileClient() {
  const { isLoaded, userId, sessionId } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  if (!userId) {
    return <div>Not authenticated</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.fullName}</h1>
      {/* Component content */}
    </div>
  );
}
```

### Server-Side Authentication

In server components and actions, use Clerk's server utilities:

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/clerk/helpers";

export async function ServerComponent() {
  // Using Clerk's built-in functions
  const { userId } = auth();
  const clerkUser = await currentUser();
  
  // Using our custom helper for combined data
  const user = await getCurrentUser();
  
  // Component implementation
}
```

## Testing

### Authentication Test Page

A test page is available at `/test/auth` to verify authentication flows. This page:

1. Displays current authentication state
2. Shows user information retrieved from backend
3. Provides sign-in and sign-out functionality
4. Tests role-based access

### API Testing

Postman collections for testing authentication are available in the `/postman` directory. They include:

1. Authentication flow tests
2. Role-based access tests
3. Different API endpoints with authentication

## Troubleshooting

### Common Issues

1. **Missing User Data**
   - Symptom: User authenticated with Clerk but no database record exists
   - Solution: Check `findOrCreateUser` implementation in helpers.ts

2. **Role Issues**
   - Symptom: User has incorrect roles or missing roles
   - Solution: Verify role assignment in createUser and check database roles column

3. **Clerk Integration Errors**
   - Symptom: Clerk components fail to load or initialize
   - Solution: Check environment variables and Content Security Policy

### Error Tracking

All authentication errors are tracked in Sentry with:
- User context (ID, email)
- Error type and location
- Stack trace for debugging

## Migration Guide

### Migrating API Routes

To migrate a NextAuth route to Clerk:

1. Update imports:
   ```typescript
   // From
   import { auth } from "@/lib/auth/auth";
   
   // To
   import { withAuth } from "@/lib/auth/clerk/api-auth";
   import { AuthUser } from "@/lib/auth/clerk/helpers";
   ```

2. Update handler signature:
   ```typescript
   // From
   export async function GET(request) {
     const session = await auth();
     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     // Implementation
   }
   
   // To
   export const GET = withAuth(async (request, user) => {
     // Implementation with user already authenticated
   });
   ```

3. Add Sentry error tracking:
   ```typescript
   import * as Sentry from "@sentry/nextjs";
   
   export const GET = withAuth(async (request, user) => {
     try {
       // Implementation
     } catch (error) {
       console.error("Error:", error);
       Sentry.captureException(error);
       return NextResponse.json({ error: "An error occurred" }, { status: 500 });
     }
   });
   ```

## Security Considerations

1. **Content Security Policy**
   - Clerk requires specific CSP directives for its scripts
   - Update `next.config.js` with appropriate headers

2. **Environment Variables**
   - Protect Clerk API keys and secrets
   - Use different API keys for development and production

3. **Role Management**
   - Validate roles on every protected request
   - Prevent role spoofing by using server-side validation

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Prisma User Management](https://www.prisma.io/docs/guides/other/user-management)
