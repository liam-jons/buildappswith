# Clerk Webhook Implementation for Profile Synchronization

## Overview

This document outlines the implementation of webhooks for synchronizing user data between Clerk (authentication provider) and the Buildappswith platform database. The webhooks will ensure that user profile information remains consistent between the authentication system and our application database.

## Webhook Events to Handle

### Primary Events

1. **user.created**
   - Triggered when a new user signs up
   - Create corresponding User record in database
   - Initialize empty profiles based on user roles
   - Set clerkId as a foreign key for future reference

2. **user.updated**
   - Triggered when user information is changed in Clerk
   - Update corresponding User record in database
   - Sync basic profile fields (name, email, avatar)
   - Handle role changes

3. **user.deleted**
   - Triggered when a user account is deleted in Clerk
   - Soft delete corresponding User record in database
   - Mark associated profiles as inactive

### Secondary Events (Future Implementation)

4. **session.created**
   - Track user session creation for analytics
   - Update user's last login timestamp

5. **session.removed**
   - Track user session termination for analytics
   - Monitor for potential security issues

6. **verification.verified**
   - Update user's verification status in database
   - Enable additional features for verified users

## Implementation Architecture

### 1. Webhook Handler Route

Location: `/app/api/webhooks/clerk/route.ts`

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { 
  handleUserCreated, 
  handleUserUpdated, 
  handleUserDeleted 
} from '@/lib/auth/webhook-handlers';
import { WebhookEvent } from '@/lib/auth/types';

export async function POST(req: NextRequest) {
  // Security verification
  const payload = await req.text();
  const headersList = headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  // Validate webhook signature
  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.error('Missing Svix headers');
    return Response.json({ success: false, error: 'Missing Svix headers' }, { status: 400 });
  }

  // Idempotency check
  // Check if we've already processed this webhook ID
  
  // Webhook verification
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('Missing webhook secret');
    return Response.json({ success: false, error: 'Missing webhook secret' }, { status: 500 });
  }

  const wh = new Webhook(webhookSecret);
  
  let event: WebhookEvent;
  
  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error('Invalid webhook signature', { error: err });
    return Response.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 });
  }

  // Process based on event type
  try {
    // Record webhook event for monitoring
    
    // Different handlers based on event type
    switch (event.type) {
      case 'user.created':
        await handleUserCreated(event.data);
        break;
      case 'user.updated':
        await handleUserUpdated(event.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(event.data);
        break;
      // Future implementations:
      // case 'session.created':
      // case 'session.removed':
      // case 'verification.verified':
      default:
        logger.info(`Unhandled webhook event type: ${event.type}`);
    }

    return Response.json({ success: true });
  } catch (err) {
    const error = err as Error;
    logger.error('Error processing webhook', { 
      error: error.message, 
      eventType: event.type, 
      eventId: svixId 
    });
    
    // Return 200 even on error to prevent webhook retries
    // We'll handle retries ourselves via monitoring
    return Response.json({ 
      success: false, 
      error: 'Error processing webhook' 
    }, { status: 200 });
  }
}
```

### 2. Webhook Event Handlers

Location: `/lib/auth/webhook-handlers.ts`

```typescript
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { UserRole } from '@/lib/auth/types';
import { createProfile } from '@/lib/profile/actions';

// Handler for user.created event
export async function handleUserCreated(userData: any) {
  const {
    id: clerkId,
    email_addresses,
    username,
    first_name,
    last_name,
    image_url,
    public_metadata
  } = userData;

  // Extract primary email
  const email = email_addresses[0]?.email_address;
  if (!email) {
    logger.error('No email found for user', { clerkId });
    return;
  }

  // Extract roles from metadata or use default
  const roles = (public_metadata?.roles as UserRole[]) || [UserRole.CLIENT];
  
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If exists but doesn't have clerkId, update it
      if (!existingUser.clerkId) {
        await db.user.update({
          where: { id: existingUser.id },
          data: { clerkId }
        });
      }
      return;
    }

    // Create new user record
    const user = await db.user.create({
      data: {
        clerkId,
        email,
        name: username || [first_name, last_name].filter(Boolean).join(' '),
        image: image_url,
        roles: roles,
        emailVerified: email_addresses[0]?.verification?.status === 'verified' 
          ? new Date() 
          : null
      },
    });

    // Initialize profiles based on roles
    if (roles.includes(UserRole.BUILDER)) {
      await db.builderProfile.create({
        data: {
          userId: user.id,
          // Initialize with empty/default values
          domains: [],
          badges: [],
          availableForHire: true,
          validationTier: 1,
        }
      });
    }

    if (roles.includes(UserRole.CLIENT)) {
      await db.clientProfile.create({
        data: {
          userId: user.id,
          // Initialize with empty/default values
        }
      });
    }

    logger.info('Created new user from Clerk webhook', { userId: user.id, clerkId });
  } catch (error) {
    logger.error('Error creating user from webhook', { error, clerkId, email });
    throw error;
  }
}

// Handler for user.updated event
export async function handleUserUpdated(userData: any) {
  const {
    id: clerkId,
    email_addresses,
    username,
    first_name,
    last_name,
    image_url,
    public_metadata
  } = userData;

  // Extract primary email
  const primaryEmail = email_addresses[0]?.email_address;
  if (!primaryEmail) {
    logger.error('No email found for user update', { clerkId });
    return;
  }

  // Extract roles from metadata or use default
  const roles = (public_metadata?.roles as UserRole[]) || [UserRole.CLIENT];
  
  try {
    // Find user by clerkId
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });

    if (!user) {
      logger.error('User not found for update', { clerkId });
      return;
    }

    // Update basic user info
    await db.user.update({
      where: { id: user.id },
      data: {
        email: primaryEmail, // Update email if changed
        name: username || [first_name, last_name].filter(Boolean).join(' '),
        image: image_url,
        roles: roles, // Update roles
        emailVerified: email_addresses[0]?.verification?.status === 'verified' 
          ? user.emailVerified || new Date() 
          : null
      }
    });

    // Handle profile changes based on role changes
    
    // If user gained BUILDER role but doesn't have a builder profile
    if (roles.includes(UserRole.BUILDER) && !user.builderProfile) {
      await db.builderProfile.create({
        data: {
          userId: user.id,
          domains: [],
          badges: [],
          availableForHire: true,
          validationTier: 1,
        }
      });
    }
    
    // If user gained CLIENT role but doesn't have a client profile
    if (roles.includes(UserRole.CLIENT) && !user.clientProfile) {
      await db.clientProfile.create({
        data: {
          userId: user.id,
        }
      });
    }

    // Handle email changes - important to ensure consistency
    if (primaryEmail !== user.email) {
      logger.info('User email changed', { 
        userId: user.id, 
        oldEmail: user.email, 
        newEmail: primaryEmail 
      });
      
      // Any additional logic for email changes
    }

    logger.info('Updated user from Clerk webhook', { userId: user.id, clerkId });
  } catch (error) {
    logger.error('Error updating user from webhook', { error, clerkId });
    throw error;
  }
}

// Handler for user.deleted event
export async function handleUserDeleted(userData: any) {
  const { id: clerkId } = userData;
  
  try {
    // Find user by clerkId
    const user = await db.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      logger.warn('User not found for deletion', { clerkId });
      return;
    }

    // Soft delete - we don't actually delete user data
    // Instead, mark as inactive and anonymize sensitive data
    await db.user.update({
      where: { id: user.id },
      data: {
        // Add a "deleted" field to the User model if not already present
        // deleted: true,
        // For now, we'll just clear some fields
        emailVerified: null,
        // Don't remove clerkId as it helps us track this was a deleted user
      }
    });

    logger.info('Soft-deleted user from Clerk webhook', { userId: user.id, clerkId });
  } catch (error) {
    logger.error('Error deleting user from webhook', { error, clerkId });
    throw error;
  }
}
```

### 3. Webhook Event Types

Location: `/lib/auth/types.ts` (additions to existing file)

```typescript
// Add to the existing types file

export interface WebhookEvent {
  data: any;
  object: string;
  type: string;
}

export interface WebhookUserData {
  id: string;
  email_addresses: {
    email_address: string;
    verification: {
      status: string;
      strategy: string;
    };
    id: string;
  }[];
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  public_metadata: {
    roles?: UserRole[];
    [key: string]: any;
  };
  // Add other fields as needed
}

// Additional models for webhook tracking
// These should be added to the Prisma schema

export interface WebhookRecord {
  id: string;
  svixId: string;
  eventType: string;
  processed: boolean;
  processingErrors?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Database Schema Updates

Add to Prisma schema:

```prisma
// Add to the existing schema.prisma file

model WebhookEvent {
  id              String    @id @default(cuid())
  svixId          String    @unique
  eventType       String
  payload         Json
  processed       Boolean   @default(false)
  processingError String?
  processedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// Optional: Add to User model for tracking deletion
model User {
  // ... existing fields
  deleted         Boolean   @default(false)
  deletedAt       DateTime?
}
```

## Security Considerations

1. **Webhook Signature Verification**
   - Verify Svix signatures using the webhook secret
   - Reject requests without proper headers

2. **IP Allowlisting**
   - Configure allowlisting to only accept requests from Svix IP ranges
   - Implement at the infrastructure level or in the webhook handler

3. **Rate Limiting**
   - Implement rate limiting on the webhook endpoint
   - Monitor for unusual activity patterns

4. **Idempotency**
   - Track processed webhook IDs to prevent duplicate processing
   - Store webhook events in database with svixId as unique identifier

5. **Error Handling**
   - Implement comprehensive error logging
   - Return 200 status even for errors to prevent automatic retries
   - Implement custom retry logic with exponential backoff

## Monitoring and Observability

1. **Webhook Dashboard**
   - Create an admin dashboard to view webhook events
   - Track success/failure rates
   - Provide manual retry functionality

2. **Alerts**
   - Set up alerts for webhook processing errors
   - Monitor for webhook processing delays

3. **Logging**
   - Implement structured logging for all webhook events
   - Include all relevant identifiers for traceability

## Implementation Steps

1. **Add Webhook Event Model**
   - Update Prisma schema with WebhookEvent model
   - Run migration to create table
   - Generate Prisma client

2. **Implement Webhook Handler**
   - Create webhook route with signature verification
   - Implement event handlers for each event type
   - Add idempotency check

3. **Security Enhancements**
   - Implement IP allowlisting
   - Add rate limiting
   - Enable comprehensive error logging

4. **Testing**
   - Create test cases for each webhook event type
   - Test error handling and retry logic
   - Validate data synchronization

5. **Monitoring**
   - Implement webhook event tracking
   - Create admin dashboard for monitoring
   - Set up alerting for failures

## Next Steps and Future Enhancements

1. **Expanded Event Handling**
   - Handle additional Clerk events (session events, verification events)
   - Implement finer-grained updates based on changed fields

2. **Advanced Synchronization**
   - Two-way synchronization between database and Clerk
   - Bulk synchronization for admin operations

3. **Performance Optimizations**
   - Queue-based processing for high-volume scenarios
   - Batch updates for related records

4. **Enhanced Security**
   - Additional validation checks
   - Automated security scanning
   - Regular audit reviews

## Conclusion

This webhook implementation will ensure reliable synchronization between Clerk authentication and our database profiles. By following best practices for security, idempotency, and error handling, we can maintain data consistency and provide a seamless user experience.