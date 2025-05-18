# Clerk Authentication and Profile Integration

## Overview

This document summarizes the implementation of the Clerk authentication and profile integration for the Buildappswith platform. This integration ensures data consistency between Clerk authentication and the application database, with particular focus on user profiles, roles, and permissions.

## Implementation Phases

The implementation was structured into three completed phases, with a fourth phase planned for the future:

### Phase 1: Foundation

- **Webhook Endpoint**: Created a robust webhook handler at `/app/api/webhooks/clerk/route.ts` to process events from Clerk
- **Database Models**: Added `WebhookEvent` and `AuditLog` models to the Prisma schema for event tracking and security auditing
- **Signature Verification**: Implemented SVIX-based signature verification to ensure webhook authenticity
- **Event Handlers**: Created handlers for `user.created`, `user.updated`, and `user.deleted` events
- **Idempotency**: Implemented webhook idempotency logic to prevent duplicate processing
- **IP Allowlisting**: Added security through IP allowlisting for Clerk webhook endpoints

### Phase 2: Data Synchronization

- **Profile Sync Service**: Implemented a comprehensive profile data synchronization service in `/lib/profile/data-service.ts`
- **Role Synchronization**: Created bidirectional role synchronization between Clerk metadata and database profiles
- **Security Logging**: Added detailed security logging for all webhook events and sensitive operations
- **API Authentication**: Enhanced profile API routes with proper authentication checks
- **RBAC Middleware**: Implemented middleware in `/lib/middleware/profile-auth.ts` for role-based access control

### Phase 3: UI Integration

- **Auth Provider**: Created a `ProfileAuthProvider` component that provides authentication context to profile components
- **Profile Components**: Enhanced the `BuilderProfile` component to respect permissions based on authentication state
- **Permission System**: Implemented a granular permission system (`canView`, `canEdit`, `canDelete`, `canVerify`)
- **Secure Editing**: Created a secure profile editing flow with proper permission controls

## Key Features

### Email Reconciliation

The integration includes special handling for email domain discrepancies, particularly addressing the use case where a user's email might differ between Clerk (e.g., `liam@buildappswith.ai`) and the database (e.g., `liam@buildappswith.com`). The reconciliation logic:

1. Detects email changes in webhook events
2. Identifies buildappswith domain variations
3. Creates audit logs for domain-specific reconciliation
4. Provides a utility function `reconcileEmailDiscrepancy()` for manual reconciliation when needed

### Role-Based Access Control

The profile system now enforces role-based access control:

- **Viewers**: Any user can view public profile information
- **Owners**: Profile owners can edit their own profiles
- **Administrators**: Admins have advanced permissions including verification and, in some cases, deletion

### Security Logging

A comprehensive security logging system was implemented:

- All webhook events are logged with their processing status
- Profile access attempts are recorded with the permission type and outcome
- Role changes are tracked with before and after states
- All logs include IP address and timestamp for audit purposes

### Webhook Processing

The webhook processing system includes:

- Signature verification using SVIX
- IP allowlisting for Clerk's webhook service
- Idempotency tracking to prevent duplicate processing
- Structured error handling with appropriate HTTP responses
- Metrics collection for monitoring and performance analysis

## Database Schema Changes

The following models were added to the Prisma schema:

```prisma
model WebhookEvent {
  id              String    @id @default(cuid())
  svixId          String    @unique
  type            String
  payload         Json
  processed       Boolean   @default(false)
  processingError String?
  processingCount Int       @default(0)
  lastProcessed   DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([type])
  @@index([processed, processingCount])
}

model WebhookMetric {
  id             String   @id @default(cuid())
  type           String
  status         String
  processingTime Float
  error          String?
  timestamp      DateTime @default(now())
  
  @@index([type])
  @@index([status])
  @@index([timestamp])
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  targetId    String?
  targetType  String?
  details     Json
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([timestamp])
  @@index([targetType, targetId])
}

model Organization {
  id        String    @id @default(cuid())
  clerkId   String    @unique
  name      String
  slug      String?   @unique
  imageUrl  String?
  active    Boolean   @default(true)
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([slug])
}
```

Additionally, the User model was updated with:

```prisma
model User {
  // Existing fields...
  
  active           Boolean         @default(true)
  deletedAt        DateTime?
  imageUrl         String?         // Added alongside existing image field
  
  // Existing relations...
}
```

## API Endpoints

The following API endpoints were enhanced with authentication:

- `/api/profiles/builder/[id]`: Added authentication middleware with public read access but protected edit capabilities
- More endpoints will be updated in future iterations

## Client Components

New or enhanced client components:

- **ProfileAuthProvider**: Context provider for profile authentication state (`/components/profile/profile-auth-provider.tsx`)
- **BuilderProfileWrapper**: Enhanced wrapper using the auth context (`/components/profile/builder-profile-wrapper.tsx`)

## Usage Examples

### Profile Authorization Check

Server-side route using the auth middleware:

```typescript
import { withProfileAccess } from '@/lib/middleware/profile-auth';

export const GET = withProfileAccess(
  async (req, { profileId, isOwner, isAdmin }) => {
    // Handler implementation
  }, 
  { requireAuth: false } // Optional configuration
);
```

### Client-side Permission Check

Using the auth context in a client component:

```tsx
import { useProfileAuth } from '@/components/profile/profile-auth-provider';

function ProfileActionButton() {
  const { permissions, isOwner } = useProfileAuth();
  
  if (!permissions.canEdit) {
    return null;
  }
  
  return <Button>Edit Profile</Button>;
}
```

## Environment Variables

The integration requires the following environment variables:

- `CLERK_WEBHOOK_SECRET`: Secret for verifying Clerk webhook signatures
- `CLERK_SECRET_KEY`: Secret key for Clerk API operations
- `CLERK_PUBLISHABLE_KEY`: Publishable key for Clerk client SDK

## Future Work (Phase 4)

Future enhancements planned for the integration:

- **Testing**: Create comprehensive unit and integration tests for the auth-profile integration
- **Admin Dashboard**: Develop an admin interface for webhook monitoring and manual reconciliation
- **Enhanced Security**: Implement additional security measures such as rate limiting
- **Additional Events**: Handle more Clerk webhook events like `session.created` and `verification.verified`

## Conclusion

The Clerk Authentication and Profile Integration provides a robust foundation for user management in the Buildappswith platform. It ensures data consistency between the authentication provider and the application database while providing appropriate security controls and audit logging.

This implementation allows for future expansion of profile features while maintaining a clean separation of concerns between authentication and profile management.