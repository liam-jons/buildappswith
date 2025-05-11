# Auth-Profile Integration Implementation Guide

This guide provides a structured approach to implementing the Clerk Authentication and Profile Integration. It organizes tasks into logical phases and provides practical guidance for each implementation step.

## Implementation Phases

The implementation is divided into four key phases:

1. **Foundation**: Setting up webhook infrastructure and basic event handling
2. **Data Synchronization**: Implementing bidirectional data flow between Clerk and profiles
3. **UI Integration**: Enhancing profile components with authentication context
4. **Testing & Hardening**: Comprehensive testing and security enhancements

## Phase 1: Foundation

Focus on establishing the core webhook infrastructure and event handling mechanism.

### Tasks:

1. **Set up webhook endpoint infrastructure**
   - Create `/app/api/webhooks/clerk/route.ts`
   - Configure environment variables (CLERK_WEBHOOK_SECRET)
   - Set up basic request handling and logging

2. **Create WebhookEvent and AuditLog database models**
   - Add models to Prisma schema
   - Run migration to create tables
   - Generate Prisma client

3. **Implement webhook signature verification**
   - Install svix library (`npm install svix`)
   - Add signature verification logic
   - Implement error handling for verification failures

4. **Create user.created webhook handler**
   - Create handler function in `/lib/auth/webhook-handlers.ts`
   - Implement user creation/lookup logic
   - Initialize empty profiles based on roles

5. **Create user.updated webhook handler**
   - Implement handler for user update events
   - Update user details in database
   - Handle role changes and profile associations

6. **Create user.deleted webhook handler**
   - Implement soft deletion for users
   - Handle associated profile records
   - Maintain audit trail for deletions

7. **Implement webhook idempotency logic**
   - Track processed webhook IDs
   - Add logic to skip duplicate events
   - Log duplicate events for monitoring

### Getting Started with Phase 1:

1. **Create the webhook endpoint file**:

```tsx
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { WebhookEvent } from '@/lib/auth/types';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  // Get the webhook payload
  const payload = await req.text();
  
  // Get the Svix headers for verification
  const headersList = headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');
  
  // Validate webhook secret is configured
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
  }
  
  // Validate Svix headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn('Missing Svix headers');
    return NextResponse.json({ success: false, error: 'Missing webhook headers' }, { status: 400 });
  }
  
  try {
    // Initialize webhook instance for verification
    const wh = new Webhook(webhookSecret);
    
    // Verify the webhook signature
    const event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
    
    // TODO: Implement idempotency check
    // TODO: Add event tracking
    // TODO: Add event handler logic
    
    // For now, log the event and return success
    logger.info(`Received webhook event: ${event.type}`, { svixId, eventType: event.type });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Error processing webhook', { error: err, svixId });
    return NextResponse.json({ success: false, error: 'Error processing webhook' }, { status: 400 });
  }
}
```

2. **Add the required database models to your Prisma schema**:

```prisma
// Add to schema.prisma

model WebhookEvent {
  id              String      @id @default(cuid())
  svixId          String      @unique
  eventType       String
  payload         Json
  processed       Boolean     @default(false)
  processingError String?
  processingCount Int         @default(0)
  lastProcessed   DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([eventType])
  @@index([processed, processingCount]) // For retry queries
}

model AuditLog {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  action      String
  userId      String
  targetId    String?
  details     Json
  ipAddress   String?
  userAgent   String?
  
  @@index([userId])
  @@index([action])
  @@index([timestamp])
}
```

3. **Create webhook handler types**:

```typescript
// lib/auth/types.ts (add to existing file)

export interface WebhookEvent {
  data: any;
  object: string;
  type: string;
}

export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  // Add more event types as needed
}

export enum AuditAction {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  PROFILE_CREATED = 'PROFILE_CREATED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  ROLE_ADDED = 'ROLE_ADDED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  // Add more audit actions as needed
}
```

## Phase 2: Data Synchronization

Focus on bidirectional data flow between Clerk and the database profiles.

### Tasks:

8. **Create profile data synchronization service**
   - Implement service in `/lib/profile/data-service.ts`
   - Add functions for finding/creating profiles
   - Add utility for transforming between Clerk and DB formats

9. **Update Clerk-Profile role synchronization logic**
   - Implement role change detection
   - Update both Clerk metadata and database roles
   - Create corresponding profiles for new roles

10. **Add security logging for webhook events**
    - Create audit logging functions
    - Log key events (user creation, role changes)
    - Add context for security analysis

11. **Enhance profile API routes with auth checks**
    - Update profile-related API routes with auth middleware
    - Add role-based access checks
    - Implement proper error handling for auth failures

12. **Implement RBAC middleware for profile endpoints**
    - Create reusable RBAC middleware
    - Implement role checking logic
    - Apply middleware to profile routes

### Getting Started with Phase 2:

1. **Create the profile data service**:

```typescript
// lib/profile/data-service.ts
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { clerkClient } from '@clerk/nextjs/server';
import { UserRole } from '@/lib/auth/types';

/**
 * Find or create a user based on Clerk ID and user data
 */
export async function findOrCreateUser(clerkId: string, userData: any) {
  try {
    // First try to find user by clerkId
    let user = await db.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    // If found, return the user
    if (user) {
      return user;
    }
    
    // Extract email from Clerk data
    const email = userData.email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error('No email address found in user data');
    }
    
    // Try to find user by email (for reconciliation)
    user = await db.user.findUnique({
      where: { email },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    // If user exists with email but no clerkId, update with clerkId
    if (user && !user.clerkId) {
      user = await db.user.update({
        where: { id: user.id },
        data: { clerkId },
        include: {
          builderProfile: true,
          clientProfile: true
        }
      });
      
      logger.info('Updated existing user with Clerk ID', { userId: user.id, clerkId });
      return user;
    }
    
    // If no user found, create a new one
    const name = userData.username || 
                 (userData.first_name && userData.last_name) ? 
                 `${userData.first_name} ${userData.last_name}`.trim() : 
                 'Unknown User';
    
    // Extract roles from metadata or use default
    const roles = (userData.public_metadata?.roles as UserRole[]) || [UserRole.CLIENT];
    
    // Create new user
    user = await db.user.create({
      data: {
        clerkId,
        email,
        name,
        image: userData.image_url,
        roles,
        emailVerified: userData.email_addresses?.[0]?.verification?.status === 'verified' ? 
                       new Date() : null
      },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    
    logger.info('Created new user from Clerk data', { userId: user.id, clerkId });
    
    // Create profiles based on roles if needed
    await ensureProfilesForUser(user.id, roles);
    
    return user;
  } catch (error) {
    logger.error('Error in findOrCreateUser', { error, clerkId });
    throw error;
  }
}

/**
 * Ensure user has profiles matching their roles
 */
export async function ensureProfilesForUser(userId: string, roles: UserRole[]) {
  try {
    // Check if user has a builder profile
    if (roles.includes(UserRole.BUILDER)) {
      const builderProfile = await db.builderProfile.findUnique({
        where: { userId }
      });
      
      // Create builder profile if it doesn't exist
      if (!builderProfile) {
        await db.builderProfile.create({
          data: {
            userId,
            domains: [],
            badges: [],
            availableForHire: true,
            validationTier: 1
          }
        });
        
        logger.info('Created builder profile for user', { userId });
      }
    }
    
    // Check if user has a client profile
    if (roles.includes(UserRole.CLIENT)) {
      const clientProfile = await db.clientProfile.findUnique({
        where: { userId }
      });
      
      // Create client profile if it doesn't exist
      if (!clientProfile) {
        await db.clientProfile.create({
          data: { userId }
        });
        
        logger.info('Created client profile for user', { userId });
      }
    }
  } catch (error) {
    logger.error('Error in ensureProfilesForUser', { error, userId });
    throw error;
  }
}

/**
 * Synchronize Clerk user data with database user record
 */
export async function syncUserData(clerkId: string, userData: any) {
  try {
    // Find the user in the database
    const user = await db.user.findUnique({
      where: { clerkId }
    });
    
    if (!user) {
      logger.error('User not found for sync', { clerkId });
      return null;
    }
    
    // Extract primary email from Clerk
    const primaryEmail = userData.email_addresses?.[0]?.email_address;
    
    // Extract name components
    const name = userData.username || 
                 (userData.first_name && userData.last_name) ? 
                 `${userData.first_name} ${userData.last_name}`.trim() : 
                 user.name; // Fall back to existing name
    
    // Extract verified status
    const isVerified = userData.email_addresses?.[0]?.verification?.status === 'verified';
    
    // Extract roles from metadata or keep existing
    const clerkRoles = userData.public_metadata?.roles as UserRole[] || user.roles;
    
    // Update the user record
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        email: primaryEmail || user.email,
        name,
        image: userData.image_url || user.image,
        emailVerified: isVerified ? (user.emailVerified || new Date()) : null,
        roles: clerkRoles
      }
    });
    
    // Ensure profiles match roles
    await ensureProfilesForUser(user.id, clerkRoles);
    
    return updatedUser;
  } catch (error) {
    logger.error('Error in syncUserData', { error, clerkId });
    throw error;
  }
}
```

2. **Create RBAC middleware for profile routes**:

```typescript
// lib/middleware/profile-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';

type ProfileRouteHandler = (
  req: NextRequest,
  context: { userId: string, user: any, profileId?: string }
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware to ensure user has access to profile
 */
export function withProfileAccess(handler: ProfileRouteHandler) {
  return async (req: NextRequest, context: { params: { id?: string } }) => {
    // Get auth info from Clerk
    const { userId } = auth();
    
    // Check if authenticated
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    try {
      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, roles: true }
      });
      
      if (!user) {
        logger.error('User not found in database', { clerkId: userId });
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // If we have a profile ID from the route
      if (context.params?.id) {
        const profileId = context.params.id;
        
        // For builder profile access
        const profile = await db.builderProfile.findUnique({
          where: { id: profileId },
          select: { userId: true }
        });
        
        if (!profile) {
          return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }
        
        // Check if user is the profile owner or an admin
        const isOwner = profile.userId === user.id;
        const isAdmin = user.roles.includes(UserRole.ADMIN);
        
        if (!isOwner && !isAdmin) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
        
        // Call handler with context
        return handler(req, { userId: user.id, user, profileId });
      }
      
      // If no profile ID, just pass user info
      return handler(req, { userId: user.id, user });
    } catch (error) {
      logger.error('Error in profile access middleware', { error });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Middleware to ensure user is an admin
 */
export function withAdminProfileAccess(handler: ProfileRouteHandler) {
  return async (req: NextRequest, context: { params: { id?: string } }) => {
    // Get auth info from Clerk
    const { userId } = auth();
    
    // Check if authenticated
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    try {
      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, roles: true }
      });
      
      if (!user) {
        logger.error('User not found in database', { clerkId: userId });
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Check if user is an admin
      const isAdmin = user.roles.includes(UserRole.ADMIN);
      
      if (!isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      
      // Get profileId from params if available
      const profileId = context.params?.id;
      
      // Call handler with context
      return handler(req, { userId: user.id, user, profileId });
    } catch (error) {
      logger.error('Error in admin profile access middleware', { error });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
```

## Phase 3: UI Integration

Focus on enhancing profile components with authentication context.

### Tasks:

13. **Create ProfileAuthProvider component**
    - Implement context provider in `/components/profile/profile-auth-provider.tsx`
    - Expose permissions and auth state to child components
    - Add helper hooks for permission checks

14. **Enhance BuilderProfile component with auth context**
    - Update component to use auth context
    - Implement conditional rendering based on permissions
    - Add loading states for auth data

15. **Create secure profile editing flow**
    - Implement edit form with auth checks
    - Add client-side validation
    - Create optimistic UI updates

17. **Add IP allowlisting for webhook endpoints**
    - Research Clerk webhook IP ranges
    - Implement middleware for IP checking
    - Add configuration for environment-specific IPs

### Getting Started with Phase 3:

1. **Create the ProfileAuthProvider component**:

```tsx
// components/profile/profile-auth-provider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { BuilderProfile, ProfilePermissions } from "@/lib/profile/types";

interface ProfileAuthContextType {
  profile: BuilderProfile;
  permissions: ProfilePermissions;
  isOwner: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const ProfileAuthContext = createContext<ProfileAuthContextType | null>(null);

interface ProfileAuthProviderProps {
  children: ReactNode;
  profile: BuilderProfile;
  initialPermissions?: Partial<ProfilePermissions>;
}

export function ProfileAuthProvider({
  children,
  profile,
  initialPermissions = {}
}: ProfileAuthProviderProps) {
  // Get authentication state from Clerk
  const { isSignedIn, isAdmin, user, isLoaded } = useAuth();
  
  // Determine if the current user is the profile owner
  const isOwner = !!isSignedIn && !!user && user.id === profile.userId;
  
  // Calculate permissions based on auth state and initial permissions
  const permissions: ProfilePermissions = {
    canView: true, // Public profiles are viewable by all
    canEdit: isOwner || !!isAdmin || !!initialPermissions.canEdit,
    canDelete: (isOwner || !!isAdmin) && !!initialPermissions.canDelete,
    canVerify: !!isAdmin && !!initialPermissions.canVerify
  };
  
  // Context value
  const contextValue: ProfileAuthContextType = {
    profile,
    permissions,
    isOwner: !!isOwner,
    isAdmin: !!isAdmin,
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded
  };
  
  return (
    <ProfileAuthContext.Provider value={contextValue}>
      {children}
    </ProfileAuthContext.Provider>
  );
}

export function useProfileAuth() {
  const context = useContext(ProfileAuthContext);
  
  if (!context) {
    throw new Error("useProfileAuth must be used within a ProfileAuthProvider");
  }
  
  return context;
}
```

2. **Update the BuilderProfile component to use auth context**:

```tsx
// components/profile/builder-profile-wrapper.tsx
import { ProfileAuthProvider } from './profile-auth-provider';
import { BuilderProfile } from './builder-profile';
import { getBuilderProfileById } from '@/lib/profile/actions';
import { auth } from '@clerk/nextjs/server';

interface BuilderProfileWrapperProps {
  profileId: string;
}

export async function BuilderProfileWrapper({ profileId }: BuilderProfileWrapperProps) {
  // Get auth state on the server
  const { userId } = auth();
  
  // Fetch profile data
  const profile = await getBuilderProfileById(profileId);
  
  if (!profile) {
    return <div>Profile not found</div>;
  }
  
  // Calculate initial permissions on the server
  const initialPermissions = {
    canView: true,
    canEdit: userId === profile.user?.clerkId,
    canDelete: false,
    canVerify: false
  };
  
  return (
    <ProfileAuthProvider 
      profile={profile} 
      initialPermissions={initialPermissions}
    >
      <BuilderProfile />
    </ProfileAuthProvider>
  );
}
```

## Phase 4: Testing & Hardening (TO BE COMPLETED IN A SEPARATE SESSION - CLAUDE: take no action with phase 4 on this session, except documenting the integration.)

Focus on comprehensive testing and security enhancements.

### Tasks:

18. **Create test mocks for Clerk authentication**
    - Implement mock Clerk user object
    - Create test helpers for auth scenarios
    - Add mock webhook event generator

19. **Write unit tests for webhook handlers**
    - Test each webhook handler function
    - Add tests for edge cases and error handling
    - Create test for email discrepancy resolution

20. **Write integration tests for profile-auth interaction**
    - Test profile components with various auth states
    - Test profile API routes with auth headers
    - Verify proper permission checking

21. **Implement enhanced security headers**
    - Add Content-Security-Policy headers
    - Configure other security headers (X-Frame-Options, etc.)
    - Test headers are properly applied

22. **Create admin dashboard for webhook monitoring**
    - Implement simple dashboard for webhook events
    - Add filtering and sorting capabilities
    - Create visual indicators for errors

23. **Document integration for development team**
    - Create comprehensive documentation
    - Include code examples for common scenarios
    - Document security considerations

24. **Configure monitoring and alerts for webhook failures**
    - Set up logging alerts for webhook errors
    - Create monitoring dashboard
    - Configure notification channels

### Getting Started with Phase 4:

1. **Create test mocks for Clerk authentication**:

```typescript
// __tests__/mocks/clerk-auth.ts
import { UserRole } from '@/lib/auth/types';

export function mockClerkUser({
  id = 'user_123',
  firstName = 'Test',
  lastName = 'User',
  email = 'test@example.com',
  imageUrl = 'https://example.com/avatar.png',
  roles = [UserRole.CLIENT],
  emailVerified = true
} = {}) {
  return {
    id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    primaryEmailAddress: {
      emailAddress: email,
      verification: {
        status: emailVerified ? 'verified' : 'unverified'
      }
    },
    imageUrl,
    publicMetadata: {
      roles
    }
  };
}

export function mockClerkWebhookEvent({
  type = 'user.created',
  id = 'evt_123',
  data = mockClerkUser()
} = {}) {
  return {
    type,
    id,
    data,
    object: 'event'
  };
}

export function mockClerkAuth({
  isSignedIn = true,
  isLoaded = true,
  user = mockClerkUser()
} = {}) {
  return {
    isSignedIn,
    isLoaded,
    user: isSignedIn ? user : null
  };
}
```

2. **Write a unit test for webhook handlers**:

```typescript
// __tests__/lib/auth/webhook-handlers.test.ts
import { describe, it, expect, vi } from 'vitest';
import { handleUserCreated, handleUserUpdated } from '@/lib/auth/webhook-handlers';
import { mockClerkWebhookEvent } from '../../mocks/clerk-auth';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    builderProfile: {
      create: vi.fn(),
      findUnique: vi.fn()
    },
    clientProfile: {
      create: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Webhook Handlers', () => {
  describe('handleUserCreated', () => {
    it('creates a new user when one does not exist', async () => {
      // Mock the database to return null for findUnique (user not found)
      vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);
      
      // Mock successful user creation
      const createdUser = { id: 'db_user_123', email: 'test@example.com', roles: ['CLIENT'] };
      vi.mocked(db.user.create).mockResolvedValueOnce(createdUser);
      
      // Mock successful profile creation
      vi.mocked(db.clientProfile.create).mockResolvedValueOnce({ id: 'profile_123' });
      
      // Call the handler with a mock webhook event
      const event = mockClerkWebhookEvent();
      await handleUserCreated(event.data);
      
      // Verify the user was created with correct data
      expect(db.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          clerkId: event.data.id,
          email: event.data.primaryEmailAddress.emailAddress
        })
      }));
      
      // Verify a client profile was created
      expect(db.clientProfile.create).toHaveBeenCalled();
    });
    
    it('updates existing user with clerkId when email matches', async () => {
      // Mock finding a user by clerkId (not found)
      vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);
      
      // Mock finding a user by email (found)
      const existingUser = { 
        id: 'db_user_123', 
        email: 'test@example.com', 
        clerkId: null, 
        roles: ['CLIENT'] 
      };
      vi.mocked(db.user.findUnique).mockResolvedValueOnce(existingUser);
      
      // Mock successful user update
      const updatedUser = { ...existingUser, clerkId: 'user_123' };
      vi.mocked(db.user.update).mockResolvedValueOnce(updatedUser);
      
      // Call the handler with a mock webhook event
      const event = mockClerkWebhookEvent();
      await handleUserCreated(event.data);
      
      // Verify the user was updated with correct clerkId
      expect(db.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: existingUser.id },
        data: expect.objectContaining({
          clerkId: event.data.id
        })
      }));
    });
  });
  
  // Add more tests for other handlers...
});
```

## Implementation Tips

1. **Start with the Foundation Phase**: Focus on getting the webhook endpoint working with basic verification and logging before adding complex handlers.

2. **Test as You Go**: Write tests for each component as you implement it, rather than leaving all testing for the end.

3. **Use Feature Flags**: Consider implementing feature flags to control the rollout of authentication changes, especially for profile components.

4. **Environment-Specific Configuration**: Use environment variables to configure different behaviors in development and production.

5. **Security First**: Prioritize security measures like signature verification and proper auth checks from the beginning.

6. **Handle Edge Cases**: Account for edge cases like users with missing emails, conflicting data, and authentication failures.

7. **Monitor Webhook Events**: Set up logging and monitoring early to track webhook processing and catch issues. (We also have Sentry and Datadog)

## Dependencies

Ensure the following dependencies are installed:

```bash
npm install svix @clerk/nextjs zod
```

## Configuration

1. **Environment Variables**:

Add these to your `.env` file:

```
CLERK_WEBHOOK_SECRET=your_webhook_secret
CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

2. **Webhook Setup in Clerk Dashboard**:

- Go to your Clerk Dashboard
- Navigate to "Webhooks"
- Create a new webhook endpoint
- Enter your webhook URL (e.g., `https://your-domain.com/api/webhooks/clerk`)
- Select events to subscribe to (user.created, user.updated, user.deleted at minimum)
- Copy the signing secret to your .env file as CLERK_WEBHOOK_SECRET

## Conclusion

This implementation guide provides a structured approach to integrating Clerk authentication with the Buildappswith profile system. By following these steps and implementing the provided code examples, you'll create a robust, secure, and user-friendly authentication experience that maintains data consistency between Clerk and your database profiles.

Remember to test thoroughly at each step, prioritize security, and document your implementation for other developers on the team. With careful attention to detail, this integration will provide a solid foundation for user authentication and profile management in the Buildappswith platform.