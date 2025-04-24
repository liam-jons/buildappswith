# Clerk Authentication Migration Reference

This document serves as a comprehensive reference for the Clerk authentication migration, including all context and decisions made during the migration process.

**Current Version: 1.0.65**  
**Last Updated: April 24, 2025**

## Migration Status

The migration from NextAuth to Clerk authentication is now complete:

1. ✅ **API Routes Migration**: All API routes have been migrated to use Clerk authentication (v1.0.60-1.0.61)
2. ✅ **Client Components Migration**: All client components have been updated to use Clerk directly (v1.0.63)
3. ✅ **Dependency Updates**: NextAuth dependencies have been removed from package.json
4. ✅ **Legacy Code Handling**: NextAuth files have been archived to `/archived/nextauth-legacy/`
5. ✅ **Founder Admin Account**: Created in Clerk dashboard via organization creation
6. ✅ **Production Webhook**: Webhook for user event handling has been set up in production
7. ✅ **Webhook Implementation**: Created webhook handler for Clerk user events (v1.0.64)
8. ✅ **Database Migration**: Added clerkId field and created reset script (v1.0.64)
9. ✅ **Security Headers**: Updated CSP headers for Clerk domains (v1.0.64)

## Database Approach

**Important: Clean Database Approach**
- No need to migrate existing users - we're starting with a clean database
- This eliminates the need for complex migration scripts between NextAuth and Clerk
- Will implement webhook-based user creation flow where Clerk user events trigger database record creation

## Implementation Details

### Authentication Components

1. **AuthProvider**: Updated to use Clerk's `ClerkProvider`
   - File: `/components/auth/auth-provider.tsx`
   - Handles theme integration and appearance configuration

2. **User Auth Form**: Migrated to use Clerk's authentication methods
   - File: `/components/user-auth-form.tsx`
   - Supports email and GitHub authentication flows

3. **Site Header**: Updated to use Clerk hooks directly
   - File: `/components/site-header.tsx`
   - Handles user profile, authentication state, and sign-out

### User Webhook Handler

A webhook handler is needed to sync Clerk user events with our database:
- Location: `/app/api/webhooks/clerk/route.ts`
- Handles `user.created` and `user.updated` events
- Creates or updates database records when Clerk user events occur
- Preserves role information from Clerk's publicMetadata

### Completed Implementation

1. **Webhook Handler (v1.0.64)**:
   - Created webhook handler at `/app/api/webhooks/clerk/route.ts`
   - Implemented user creation/update logic based on Clerk events
   - Added proper role synchronization from metadata
   - Enhanced with comprehensive error handling

2. **Database Schema Updates (v1.0.64)**:
   - Added migration to ensure `clerkId` field in User model
   - Created reset script at `/scripts/reset-database-for-clerk.js`
   - Implemented clean database approach with migration script

3. **Security Updates (v1.0.64)**:
   - Updated Content Security Policy for Clerk domains
   - Enhanced middleware to skip CSRF checks for webhooks
   - Added proper security headers in all responses

### Next Steps

1. **Testing and Verification**:
   - Test sign-in flows with different providers
   - Verify role-based access controls
   - Ensure proper database record creation

2. **Clean Up Placeholder Files**:
   - Remove NextAuth placeholder files in a future release
   - Complete final documentation updates

## Environment Configuration

### Development Environment
Required environment variables for local development:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Production Environment
Production environment variables (already set in Vercel):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- Sign-in/sign-up URL configurations

## Clerk Implementation Resources

1. **Webhook Documentation**: [Clerk Webhooks](https://clerk.com/docs/integration/webhooks)
2. **User Management**: [Clerk User Management](https://clerk.com/docs/users/user-management)
3. **Metadata API**: [Clerk Metadata](https://clerk.com/docs/users/metadata)

## Content Security Policy Updates

The middleware.ts file needs CSP updates to allow Clerk domains:
```typescript
// Add to your CSP
frame-src: [
  'self',
  'clerk.buildappswith.dev',
  '*.clerk.accounts.dev',
],
img-src: [
  'self',
  'img.clerk.com',
  'images.clerk.dev',
  // other sources
],
connect-src: [
  'self', 
  'clerk.buildappswith.dev',
  '*.clerk.accounts.dev',
  // other sources
],
```