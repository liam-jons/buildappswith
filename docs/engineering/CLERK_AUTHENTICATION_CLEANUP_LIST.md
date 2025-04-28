# Authentication Cleanup Recommended Actions

This document identifies any remaining NextAuth remnants and legacy authentication files that should be moved or deleted as part of the final pre-launch cleanup.

**Current Version: 1.0.138**  
**Last Updated: April 28, 2025**

## Files to Delete

The following files are no longer needed and should be deleted:

1. `/lib/auth/auth.ts` - Legacy NextAuth implementation (warned for removal in v1.1.0)
2. `/lib/auth/next-auth.d.ts` - NextAuth type definitions
3. `/app/api/auth/[...nextauth]/route.ts` - NextAuth API route
4. `/components/auth/auth-provider-legacy.tsx` - Previous auth provider component
5. `/components/auth/next-auth-provider.tsx` - NextAuth provider component
6. `/__tests__/utils/next-auth-mock.ts` - NextAuth mock utilities
7. `/app/api/auth/callback/route.ts` - Legacy auth callback routes

## Files to Archive (Move to /archive)

These files should be preserved for reference but moved to the archive directory:

1. `/docs/archive/NEXTAUTH_IMPLEMENTATION.md` - Documentation of previous implementation
2. `/docs/archive/AUTH_MIGRATION_PLAN.md` - Migration plan (now completed)
3. `/lib/archive/auth-legacy/` - All legacy auth utility functions

## Files to Update

These files may contain references to NextAuth that should be updated or removed:

1. `/middleware.ts` - Ensure all NextAuth references are removed
2. `/lib/db/schema.ts` - Remove any NextAuth-specific fields if present
3. `/__tests__/utils/test-utils.tsx` - Verify complete migration to Clerk mocks
4. `/docs/engineering/TEST_CREATION_GUIDE.md` - Update auth testing documentation

## Database Cleanup (Optional)

Consider these database cleanup operations if not already performed:

1. Remove `Account` and `Session` tables if they were used by NextAuth
2. Remove `User.accounts` relations if present
3. Ensure `clerkId` is properly indexed for performance

## Configuration Cleanup

Check these configuration files for NextAuth references:

1. `/.env.example` - Remove NextAuth environment variables
2. `/next.config.js` - Remove any NextAuth-specific configurations
3. `/vitest.config.ts` - Update mock configurations for testing

## Middleware Configuration

Update the middleware configuration to ensure proper Clerk integration:

1. Remove any NextAuth-specific middleware logic
2. Update public routes configuration to match current requirements
3. Ensure proper CSP headers for Clerk domains

## Next Steps After Cleanup

After completing the cleanup:

1. Run a full test suite to verify no regressions
2. Update version number to indicate completion of authentication cleanup
3. Deploy to staging environment for verification
4. Document the final authentication architecture

## Verification Checklist

Use this checklist to verify complete removal of NextAuth:

- [ ] No imports from `next-auth` anywhere in codebase
- [ ] No references to NextAuth in documentation (except archive)
- [ ] All auth-related tests passing with Clerk mocks
- [ ] No NextAuth environment variables in use
- [ ] Database schema updated to remove NextAuth tables
- [ ] API routes properly protected with Clerk authentication

## References

- [Clerk Migration Guide](https://clerk.com/docs/nextjs/migrate-from-nextauth)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Clerk.dev Documentation](https://clerk.dev/docs)
- [Buildappswith Authentication Status](/docs/engineering/CLERK_AUTHENTICATION_STATUS.md)