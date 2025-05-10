# Clerk SDK Migration Plan

## Overview

This document outlines the plan to migrate from the deprecated `@clerk/clerk-sdk-node` to the recommended `@clerk/express` package. As announced by Clerk, support for `@clerk/clerk-sdk-node` will end on January 10, 2025. This migration is necessary to ensure our authentication system remains supported and secure.

## Migration Timeline

1. **Phase 1: Analysis & Planning** (Current - Aug 2025)
   - Document current usage of Clerk SDK
   - Research new `@clerk/express` API
   - Create test plan for authentication flows
   - Document API differences and required changes

2. **Phase 2: Development** (Sept 2025 - Oct 2025)
   - Create migration branch
   - Implement changes in non-critical paths first
   - Develop and test auth middleware
   - Update API routes and server components

3. **Phase 3: Testing** (Nov 2025)
   - Run comprehensive test suite
   - Perform security audit
   - Test all user roles and permissions

4. **Phase 4: Deployment** (Dec 2025)
   - Deploy to staging
   - Run final verification
   - Deploy to production
   - Monitor for any issues

## Key API Differences

### @clerk/clerk-sdk-node

```typescript
import { users } from '@clerk/clerk-sdk-node';

// Get user
const user = await users.getUser(userId);

// Update user metadata
await users.updateUser(userId, {
  publicMetadata: { role: 'CLIENT' },
});
```

### @clerk/express

```typescript
import { ClerkExpressWithAuth } from '@clerk/express';
import { clerkClient } from '@clerk/clerk-sdk-node';

// Initialize middleware
const clerkMiddleware = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Get user (clerkClient is still used)
const user = await clerkClient.users.getUser(userId);

// Update user metadata (clerkClient is still used)
await clerkClient.users.updateUser(userId, {
  publicMetadata: { role: 'CLIENT' },
});
```

## Required Changes

1. **Dependencies Update**
   - Add `@clerk/express`
   - Maintain `@clerk/clerk-sdk-node` during migration
   - Update types and interfaces

2. **Middleware Changes**
   - Replace custom middleware with Clerk Express middleware
   - Update authentication checks
   - Refactor authorization logic

3. **API Routes**
   - Update all API routes to use new middleware
   - Ensure proper error handling
   - Maintain backward compatibility where possible

4. **Testing**
   - Update mock implementations
   - Test all authentication flows
   - Verify role-based authorization still works

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking authentication flows | Comprehensive testing plan with coverage for all auth scenarios |
| Performance impact | Benchmark before and after to identify any regressions |
| Deployment issues | Canary deployment and gradual rollout |
| Missed API endpoints | Code scanning to identify all Clerk SDK usages |

## References

- [Clerk Changelog: Node SDK EOL](https://clerk.com/changelog/2025-01-10-node-sdk-eol)
- [Clerk Express Documentation](https://clerk.com/docs/integration/express)
- [Migration Guide from Clerk](https://clerk.com/docs/migration/node-to-express)