# Auth-Profile Integration Continuation Prompt

## Overview

We are implementing the integration between Clerk authentication and the Buildappswith platform's profile system. This integration ensures that changes in Clerk (email, name, avatar) properly propagate to database profiles, and that user roles and permissions are correctly managed across both systems.

## Current Progress

We have completed the planning phase and created comprehensive documentation for the integration:

1. **CLERK_PROFILE_WEBHOOK_IMPLEMENTATION.md** - Detailed webhook implementation design
2. **CLERK_PROFILE_SYNC_ARCHITECTURE.md** - Architecture for data synchronization
3. **PROFILE_AUTH_INTEGRATION.md** - Client-side component integration design
4. **AUTH_PROFILE_TEST_CASES.md** - Comprehensive test cases for auth-profile integration
5. **AUTH_PROFILE_SECURITY_CONSIDERATIONS.md** - Security considerations and mitigations
6. **AUTH_PROFILE_INTEGRATION_PLAN.md** - Overall implementation plan
7. **AUTH_PROFILE_IMPLEMENTATION_GUIDE.md** - Step-by-step implementation guide

We've structured the implementation into four phases:

1. **Foundation**: Setting up webhook infrastructure and basic event handling
2. **Data Synchronization**: Implementing bidirectional data flow
3. **UI Integration**: Enhancing profile components with auth context
4. **Testing & Hardening**: Comprehensive testing and security enhancements

## Current Todo Items

We've created a structured todo list of 24 items, with the first 17 items focusing on the core implementation:

**Phase 1: Foundation**
1. Set up webhook endpoint infrastructure
2. Create WebhookEvent and AuditLog database models
3. Implement webhook signature verification
4. Create user.created webhook handler
5. Create user.updated webhook handler
6. Create user.deleted webhook handler
7. Implement webhook idempotency logic

**Phase 2: Data Synchronization**
8. Create profile data synchronization service
9. Update Clerk-Profile role synchronization logic
10. Add security logging for webhook events
11. Enhance profile API routes with auth checks
12. Implement RBAC middleware for profile endpoints
13. Implement reconciliation process for email discrepancies

**Phase 3: UI Integration**
14. Create ProfileAuthProvider component
15. Enhance BuilderProfile component with auth context
16. Create secure profile editing flow
17. Add IP allowlisting for webhook endpoints

**Phase 4: Testing & Hardening (to be completed in a separate session)**
Items 18-24 will be handled separately.

## Key Email Discrepancy Case

A specific use case to address is the email discrepancy between Clerk and our database for Liam Jons:
- Clerk email: liam@buildappswith.ai
- Database email: liam@buildappswith.com

This will be a good test case for our sync mechanism to resolve inconsistencies.

## Current Database Schema

The User model in our Prisma schema has the following structure:

```prisma
model User {
  id               String          @id @default(cuid())
  name             String?
  email            String          @unique
  emailVerified    DateTime?
  image            String?
  isFounder        Boolean         @default(false)
  stripeCustomerId String?
  verified         Boolean         @default(false)
  clerkId          String?         @unique
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  roles            UserRole[]      @default([CLIENT])
  capabilities     AICapability[]
  accounts         Account[]
  bookingsAsClient Booking[]       @relation("BookingsAsClient")
  builderProfile   BuilderProfile?
  clientProfile    ClientProfile?
  sessions         Session[]
}
```

And the BuilderProfile model:

```prisma
model BuilderProfile {
  id               String         @id @default(cuid())
  userId           String         @unique
  bio              String?
  headline         String?
  hourlyRate       Decimal?       @db.Decimal(10, 2)
  featuredBuilder  Boolean        @default(false)
  domains          String[]
  badges           String[]
  rating           Float?
  portfolioItems   Json[]
  validationTier   Int            @default(1)
  availableForHire Boolean        @default(true)
  adhd_focus       Boolean        @default(false)
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  socialLinks      Json?
  apps             App[]
  bookings         Booking[]
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  skills           BuilderSkill[]
  sessionTypes     SessionType[]
}
```

## Implementation Details

We need to start implementing the first phases of the integration. The implementation guide provides starter code for key components, including:

1. Webhook endpoint (`/app/api/webhooks/clerk/route.ts`)
2. Prisma schema additions for WebhookEvent and AuditLog models
3. Webhook handler types and functions
4. Profile data synchronization service
5. RBAC middleware for profile endpoints
6. ProfileAuthProvider component for UI integration

The first phase is focused on establishing the webhook infrastructure and handlers, followed by data synchronization between Clerk and the database, and finally UI integration for profile components.

## Next Steps

Please help us implement the auth-profile integration, starting with Phase 1 (Foundation). Based on our implementation guide, we should:

1. Create the webhook endpoint file and basic structure
2. Add WebhookEvent and AuditLog models to Prisma schema
3. Implement webhook signature verification
4. Create handlers for user.created, user.updated, and user.deleted events
5. Add idempotency logic to prevent duplicate processing

After completing Phase 1, we can proceed to Phase 2 (Data Synchronization) and Phase 3 (UI Integration).

Note that Testing & Hardening (Phase 4) will be handled in a separate session, so we can focus purely on implementation for now.