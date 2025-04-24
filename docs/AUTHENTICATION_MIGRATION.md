# Authentication Migration: NextAuth.js to Clerk

## Overview

This document outlines the migration process from NextAuth.js to Clerk for the Buildappswith platform. The decision to migrate was made based on a thorough code review that identified authentication inconsistencies and the need for more robust multi-tenant support.

## Migration Rationale

### Why Clerk?

1. **Comprehensive User Management**
   - Complete suite of user management features
   - Multi-tenant organization management built-in
   - Admin dashboard included

2. **Security Focus**
   - Dedicated authentication company with strong financial backing
   - Advanced security features (XSS protection, CSRF protection, session management)
   - Regular security audits and compliance

3. **Developer Experience**
   - Pre-built UI components optimized for Next.js
   - Excellent App Router integration
   - Consistent middleware approach

4. **Multi-tenant Architecture Support**
   - Built-in organization management
   - Role-based permissions
   - User grouping and management

5. **Active Development and Support**
   - Dedicated team focusing solely on authentication
   - Responsive support channels
   - Regular feature updates

### Considerations and Mitigations

| Consideration | Mitigation Strategy |
|---------------|---------------------|
| Cost at Scale | Free tier for development; Business plan costs manageable at scale |
| Vendor Lock-in | Implement abstraction layer for auth in our codebase |
| User ID Migration | Leverage Clerk's externalId feature for compatibility |
| API Route Updates | Standardize auth checks with helper functions |

## Migration Steps

### 1. Installation and Setup

```bash
# Install Clerk SDK
npm install @clerk/nextjs
```

Set up environment variables in `.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

### 2. Provider Migration

Replace NextAuth's SessionProvider with ClerkProvider in the application root:

```tsx
// Before (NextAuth)
import { AuthProvider } from "@/lib/contexts/auth/auth-provider";

// After (Clerk)
import { ClerkProvider } from '@clerk/nextjs';
```

### 3. Middleware Implementation

Replace the current auth middleware with Clerk's middleware:

```tsx
// Current middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from './lib/csrf';
import { rateLimit } from './lib/rate-limit';

// New middleware.ts with Clerk
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
```

### 4. API Route Authentication

Update authentication checks in API routes:

```tsx
// Before (NextAuth)
const session = await auth();
if (!session?.user) {
  return NextResponse.json(
    { error: 'Authentication required' }, 
    { status: 401 }
  );
}

// After (Clerk)
import { auth } from '@clerk/nextjs/server';

const { userId } = auth();
if (!userId) {
  return NextResponse.json(
    { error: 'Authentication required' }, 
    { status: 401 }
  );
}
```

### 5. Database User ID Compatibility

Two approaches for handling user IDs:

1. **Use Clerk's externalId Field**
   - Maintain compatibility with existing user IDs
   - Set user's NextAuth ID as externalId in Clerk

2. **Update Database Schema**
   - Modify the database to use Clerk's user IDs
   - Update foreign key relationships

### 6. UI Component Updates

Replace NextAuth UI components with Clerk equivalents:

| NextAuth Component | Clerk Component |
|-------------------|-----------------|
| Custom Sign In | `<SignIn />` |
| Custom Sign Up | `<SignUp />` |
| Profile management | `<UserProfile />` |
| User button/avatar | `<UserButton />` |

### 7. Role-Based Access Control

Update role-based access control to use Clerk's permission system:

```tsx
// Before (NextAuth)
if (!session?.user?.roles?.includes(UserRole.ADMIN)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// After (Clerk)
import { auth, clerkClient } from '@clerk/nextjs';

const { userId } = auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

const user = await clerkClient.users.getUser(userId);
if (!user.publicMetadata.role === 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

## Testing Plan

1. **Authentication Flows**
   - Sign up process
   - Sign in process
   - Password reset
   - Email verification
   - Social authentication (if applicable)

2. **Authorization Checks**
   - API routes protection
   - Role-based access
   - Protected pages

3. **Session Management**
   - Session persistence
   - Session expiration
   - Multiple device sessions

4. **User Management**
   - Profile updates
   - Account settings
   - User metadata

**Implementation Note**: Using the LLM-human collaborative development approach allows us to implement the core migration rapidly (typically within a single chat session). This enables us to focus more energy on thorough testing and refinement rather than the initial implementation.

## Rollback Plan

In case of critical issues, a rollback strategy has been defined:

1. Revert to the previous branch with NextAuth implementation
2. Ensure database compatibility with previous user IDs
3. Test authentication flows before re-deploying

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js SDK](https://clerk.com/docs/references/nextjs/overview)
- [NextAuth to Clerk Migration Guide](https://clerk.com/docs/references/nextjs/authjs-migration)
- [Clerk Discord Support](https://clerk.com/discord)
