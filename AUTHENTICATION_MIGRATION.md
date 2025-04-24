# Authentication Migration: NextAuth.js to Clerk

## Overview

This document outlines the migration process from NextAuth.js to Clerk for the Buildappswith platform.

### Motivation

While NextAuth.js has served our initial authentication needs, we're migrating to Clerk for the following reasons:

1. **Improved User Management**: Clerk provides a more comprehensive user management system with built-in profile management, user settings, and account verification.
2. **Enhanced Security**: Clerk offers advanced security features including device management, 2FA, and organization-level permissions.
3. **Multi-tenant Architecture**: As we scale, Clerk's organization features will support our multi-tenant requirements.
4. **Simplified Implementation**: Clerk provides a more consistent authentication implementation across different parts of the application.
5. **Developer Experience**: Clerk's SDK and documentation make it easier to implement and maintain auth features.

### Current Auth Implementation

The current implementation uses NextAuth.js with:
- GitHub OAuth provider
- Email provider for passwordless login
- Custom session handling and JWT configuration
- Role-based access control (CLIENT, BUILDER, ADMIN)
- Session user data stored in the database via Prisma adapter

### Migration Approach

Our migration strategy follows these principles:

1. **Incremental Implementation**: Migrate components one at a time to minimize disruption.
2. **Database Compatibility**: Ensure Clerk user IDs are compatible with existing database relationships.
3. **Feature Parity**: Maintain all existing authentication features during migration.
4. **Testing**: Verify authentication flows work correctly after each change.

## Migration Steps

### 1. Install and Configure Clerk

- Install Clerk SDK
- Set up environment variables
- Create ClerkProvider component to replace SessionProvider

### 2. Middleware Implementation

- Replace NextAuth middleware with Clerk middleware
- Configure public and protected routes
- Handle role-based access control

### 3. API Route Updates

- Update authentication checks in API routes
- Create helper functions for standardized auth verification
- Ensure compatibility with existing database queries

### 4. UI Component Updates

- Update login, registration, and profile components
- Replace NextAuth signIn/signOut with Clerk equivalents
- Integrate Clerk's prebuilt components where appropriate

### 5. Database Schema Updates

- Create user ID compatibility layer
- Update Prisma schema if needed
- Migrate existing user data (if required)

### 6. Testing

- Verify all authentication flows
- Test role-based access
- Ensure all protected routes remain secure

## Implementation Details

### Environment Variables

```
# Clerk Auth (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk Auth (Development)
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### ClerkProvider Implementation

```tsx
import { ClerkProvider } from '@clerk/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
```

### Middleware Configuration

```tsx
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ["/", "/api/(.*)"]
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Auth Helper Functions

```tsx
import { currentUser } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { UserRole } from '@/lib/auth/types';

// Get complete user with roles from database
export async function getCurrentUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  // Fetch additional user data from database
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });
  
  return {
    id: user.id,
    name: user.firstName + ' ' + user.lastName,
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
    roles: dbUser?.roles || [UserRole.CLIENT],
    verified: !!user.emailAddresses[0].verification?.status === 'verified',
    clerkId: user.id,
    stripeCustomerId: dbUser?.stripeCustomerId
  };
}

// Helper for API route auth
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
```

## Database Considerations

During the migration, we'll need to:

1. Add a `clerkId` field to our User table in the database
2. Create a migration script to populate this field for existing users (if needed)
3. Update our API routes to fetch users by Clerk ID instead of NextAuth ID

## Rollback Plan

If issues arise during migration:

1. Maintain both auth systems temporarily
2. Implement feature flags to switch between auth providers
3. Revert to NextAuth if critical problems occur, using git history to restore previous implementation

## Timeline

1. Setup & Configuration (Day 1)
2. Middleware & Core Components (Day 1)
3. API Route Updates (Day 1-2)
4. UI Component Updates (Day 2)
5. Testing & Verification (Day 2)
6. Production Deployment (Day 3)
