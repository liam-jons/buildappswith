# Clerk Authentication Implementation

This document describes the implementation of Clerk authentication in the Buildappswith platform. It serves as a comprehensive guide for developers working with the authentication system.

**Current Version: 1.0.64**  
**Last Updated: April 24, 2025**

## Overview

Buildappswith uses [Clerk](https://clerk.com/) for authentication and user management. Clerk provides a secure, scalable solution with built-in features for multi-factor authentication, social login, and user management.

## Architecture

### Client-Side Authentication

On the client side, Clerk's authentication is implemented through:

1. **ClerkProvider**: Wraps the application to provide authentication context
2. **useAuth and useUser hooks**: Access authentication state and user data
3. **SignIn and SignUp components**: Handle user authentication flows

### Server-Side Authentication

Server-side authentication is implemented through:

1. **Middleware**: Protects routes based on authentication status and user roles
2. **currentUser()**: Accesses the authenticated user in API routes
3. **Role-based access control**: Validates user permissions based on roles
4. **Webhooks**: Synchronizes Clerk user events with our database

### Webhook Handler

The platform uses Clerk webhooks to keep the database in sync with authentication events:

```ts
// /app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  // Verify webhook signature
  // Extract event data
  // Handle user.created and user.updated events
  // Create or update database records
}
```

The webhook handler:
- Verifies the webhook signature using the CLERK_WEBHOOK_SECRET
- Creates new users in the database when they sign up through Clerk
- Updates user information when changes occur in Clerk
- Preserves role information from Clerk's publicMetadata
- Handles proper error logging and recovery

## User Roles

User roles are stored in Clerk's `publicMetadata` object as an array of role strings. The platform supports these primary roles:

- `CLIENT`: Standard user who can book sessions and request app development
- `BUILDER`: Verified developer who can create and offer services
- `ADMIN`: Platform administrator with full access

## Authentication Components

### AuthProvider

The `AuthProvider` component wraps the application with Clerk's `ClerkProvider` and configures theme support:

```tsx
// /components/auth/auth-provider.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          // Styling configuration
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
```

### Client-Side Hooks

Custom hooks have been created to provide a clean API for authentication:

```tsx
// /lib/auth/clerk-hooks.ts
export const useAuth = () => {
  const { isLoaded, isSignedIn, userId, sessionId } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // Extract roles from publicMetadata
  const roles = user?.publicMetadata?.roles as UserRole[] || [];
  
  // Create a compatible user object
  const compatUser = isSignedIn ? {
    id: user?.id || '',
    name: user?.fullName || user?.username || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    image: user?.imageUrl || '',
    roles,
    // Additional user properties
  } : null;
  
  return {
    user: compatUser,
    isLoading: !isLoaded || !isUserLoaded,
    isAuthenticated: !!isSignedIn && !!userId,
    isClient: roles.includes(UserRole.CLIENT) || false,
    isBuilder: roles.includes(UserRole.BUILDER) || false,
    isAdmin: roles.includes(UserRole.ADMIN) || false,
    status: isLoaded ? (isSignedIn ? "authenticated" : "unauthenticated") : "loading",
    // Authentication methods
    signIn: async () => {...},
    signOut: async () => {...},
  };
};
```

## API Route Protection

API routes are protected using a tiered middleware approach:

```ts
// Example of protected API route
import { currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401 
    });
  }
  
  // Get roles from user metadata
  const roles = user.publicMetadata.roles as string[] || [];
  
  // Check for specific role
  if (!roles.includes("ADMIN")) {
    return new NextResponse(JSON.stringify({ error: "Access Denied" }), { 
      status: 403 
    });
  }
  
  // Proceed with authorized access
  return NextResponse.json({ success: true });
}
```

## Authentication Flows

### Sign-In Process

1. User navigates to `/login`
2. Clerk's `SignIn` component or custom `UserAuthForm` handles authentication
3. Upon successful sign-in, user is redirected to the callbackUrl or dashboard
4. Session data is automatically managed by Clerk

### Sign-Out Process

1. User clicks sign-out button in the site header or user menu
2. `signOut()` function from Clerk is called
3. User is redirected to the homepage after session end

## Role Management

Roles are assigned and managed through:

1. **Initial Registration**: Basic CLIENT role assigned automatically
2. **Admin Dashboard**: Admins can modify user roles
3. **Builder Application**: Users can apply for BUILDER role
4. **Database Sync**: Roles are synchronized between Clerk and the application database

## Database Integration

### User Model

The User model in the database has been updated to support Clerk authentication:

```prisma
model User {
  id              String    @id @default(cuid())
  name            String?
  email           String    @unique
  emailVerified   DateTime?
  image           String?
  roles           UserRole[] @default([CLIENT])
  isFounder       Boolean   @default(false)
  stripeCustomerId String?
  verified        Boolean   @default(false)
  clerkId         String?   @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Other fields and relations...
}
```

The `clerkId` field stores the Clerk user ID and has a unique constraint to ensure data integrity.

### Database Migration

A migration script has been created to reset and prepare the database for Clerk authentication:

```javascript
// /scripts/reset-database-for-clerk.js
async function resetDatabase() {
  // Drop all tables
  // Recreate database schema
  // Run Prisma migrations
  // Create founder account placeholder
}
```

This script provides a clean approach to transitioning to Clerk without complex user data migration.

## Setting Up Local Development

To set up Clerk for local development:

1. Create a Clerk application in the [Clerk Dashboard](https://dashboard.clerk.com/)
2. Add development keys to `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_WEBHOOK_SECRET=whsec_...
   ```
3. Configure other environment variables:
   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   ```
4. Set up the webhook endpoint in Clerk Dashboard:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`
   - Secret: Use the same value as `CLERK_WEBHOOK_SECRET`

## Testing Authentication

Test authentication using these approaches:

1. **Manual Testing**: Use the Clerk Dashboard to create test users with different roles
2. **Automated Testing**: Create mock Clerk users for testing protected routes
3. **Local Development**: Use development keys to avoid affecting production data

## Troubleshooting

Common issues and solutions:

1. **Authentication State Not Available**: Ensure components are wrapped in ClerkProvider
2. **Role-Based Access Not Working**: Check that roles are correctly stored in user metadata
3. **Redirect Loops**: Verify that middleware configurations don't create circular redirects

## Security Considerations

1. **Role Validation**: Always validate roles on the server side, never trust client-side role claims
2. **CSRF Protection**: Clerk handles CSRF protection automatically
3. **Session Management**: Clerk manages secure sessions with proper expirations

## Future Enhancements

Planned improvements to the authentication system:

1. **Multi-Factor Authentication**: Enable advanced MFA options
2. **Organization Support**: Implement Clerk Organizations for team management
3. **Permission System**: Add granular permissions within roles
4. **Audit Logging**: Implement comprehensive authentication event logging