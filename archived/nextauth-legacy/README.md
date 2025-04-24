# NextAuth Legacy Files

This directory contains archived files from the NextAuth.js authentication system that was replaced by Clerk in version 1.0.63.

These files are kept for reference purposes only and are no longer used in the application. They may be useful for understanding the previous authentication implementation or for rollback in case of issues with the new authentication system.

## Structure

- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler
- `lib/auth/auth-config.ts` - NextAuth configuration
- `lib/auth/auth.ts` - Main NextAuth implementation
- `lib/auth/auth-utils.ts` - Helper utilities for NextAuth
- `lib/contexts/auth/auth-provider.tsx` - React context provider for NextAuth

## Migration Details

The migration from NextAuth to Clerk was completed in version 1.0.63 (April 24, 2025). The migration involved:

1. Replacing NextAuth client components with Clerk equivalents
2. Updating API routes to use Clerk authentication
3. Migrating user roles to Clerk's metadata system
4. Removing NextAuth dependencies from the project

See `/docs/engineering/CLERK_AUTH_IMPLEMENTATION.md` for details about the new authentication implementation.