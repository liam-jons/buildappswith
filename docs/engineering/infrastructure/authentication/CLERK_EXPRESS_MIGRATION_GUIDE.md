# Clerk Express SDK Migration Guide

*Version: 1.0.0*
*Date: 2025-05-11*
*Status: Draft*

## Overview
This document outlines the migration from Clerk NextJS SDK to Clerk Express SDK for improved performance, security, and flexibility.

## Migration Benefits
- Improved performance with Express SDK
- Enhanced middleware capabilities
- Better error handling
- More flexible authentication flows
- Improved role-based access control

## Architecture Changes
The migration involves several architectural changes:

1. **Middleware Pattern**: Using Express SDK adapter with Next.js middleware
2. **Server Authentication**: Enhanced server-side authentication utilities
3. **API Protection**: Improved route protection with better error handling
4. **Client Compatibility**: Backward compatible client hooks

## Migration Steps

### 1. Update Dependencies
```bash
# Install Clerk Express SDK
pnpm add @clerk/express
```

### 2. Update Middleware
```typescript
// Before
import { authMiddleware } from "@clerk/nextjs";

// After
import { createClerkExpressMiddleware } from "@/lib/auth/express/adapter";
const clerkExpressMiddleware = createClerkExpressMiddleware();
```

### 3. Update Server Components
```typescript
// Before
import { auth } from "@clerk/nextjs";
const { userId } = auth();

// After
import { getServerAuth } from "@/lib/auth/express/server-auth";
const { userId } = getServerAuth();
```

### 4. Update API Routes
```typescript
// Before
import { auth } from "@clerk/nextjs";

// After
import { withAuth, withRole } from "@/lib/auth/express/api-auth";

// Protected route handler
export const GET = withAuth(async (req) => {
  // Handler implementation
});
```

### 5. Update Client Components
```typescript
// Before
import { useAuth } from "@clerk/nextjs";

// After
import { useAuth } from "@/lib/auth/express/client-auth";
```

## Implementation Details

### Express SDK Adapter
The adapter bridges Express SDK and Next.js middleware:

```typescript
// lib/auth/express/adapter.ts
import { clerkMiddleware as clerkExpressMiddleware, getAuth } from "@clerk/express";
import { NextRequest, NextResponse } from "next/server";

export function createClerkExpressMiddleware() {
  return async function clerkExpressAdapter(req: NextRequest) {
    // Create Express-compatible request/response
    // Apply Clerk Express middleware
    // Handle authentication flow
    // Return appropriate Next.js response
  };
}
```

### Server-Side Authentication
Enhanced utilities for server components:

```typescript
// lib/auth/express/server-auth.ts
import { getAuth } from "@clerk/express";
import { headers } from "next/headers";

export function getServerAuth() {
  const headersList = headers();
  const userId = headersList.get('x-clerk-auth-user-id');
  const sessionId = headersList.get('x-clerk-auth-session-id');

  return {
    userId,
    sessionId,
    isAuthenticated: !!userId,
  };
}

export function hasServerRole(role: string) {
  // Check if user has the specified role
}
```

### API Route Protection
Secure API routes with authentication and role requirements:

```typescript
// lib/auth/express/api-auth.ts
import { requireAuth, getAuth } from "@clerk/express";

export function withAuth(handler) {
  return async function authProtectedHandler(req) {
    // Apply authentication middleware
    // If authenticated, call handler
    // Otherwise return 401
  };
}

export function withRole(role, handler) {
  return withAuth(async (req) => {
    // Check if user has required role
    // If authorized, call handler
    // Otherwise return 403
  });
}
```

### Client-Side Hooks
Enhanced client hooks with role support:

```typescript
// lib/auth/express/client-auth.ts
import { useAuth as useClerkAuth } from "@clerk/nextjs";

export function useAuth() {
  // Use original Clerk hook
  // Add role management
  // Return enhanced auth object
}

export function usePermission(permission) {
  // Check if user has the specified permission
}
```

## Common Issues and Solutions

### Authentication Headers Missing
**Problem**: Server components can't access auth state
**Solution**: Ensure middleware properly sets auth headers

```typescript
// In middleware adapter
response.headers.set('x-clerk-auth-user-id', auth.userId);
response.headers.set('x-clerk-auth-session-id', auth.sessionId || '');
```

### Role-Based Access Not Working
**Problem**: Role checks failing even when user has the role
**Solution**: Check session claims format and parsing

```typescript
// Debug session claims
const auth = getFullServerAuth();
console.log('Session claims:', auth?.sessionClaims);
```

### API Routes Return 401 for Authenticated Users
**Problem**: Express adapter not properly handling auth state
**Solution**: Verify request headers are correctly mapped

```typescript
// Fix adapter implementation
function adaptNextRequestToExpress(req: NextRequest) {
  // Ensure all headers are properly converted
  const headers = Object.fromEntries(req.headers.entries());
  // Rest of implementation
}
```

## Testing Authentication Changes

### Server-Side Auth Test
```typescript
// app/auth-test/page.tsx
import { getServerAuth, hasServerRole } from "@/lib/auth/express/server-auth";

export default function AuthTestPage() {
  const auth = getServerAuth();
  const isAdmin = hasServerRole('admin');
  
  return (
    <div className="p-4">
      <h1>Auth Test</h1>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
      <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### API Protection Test
```typescript
// app/api/auth-test/route.ts
import { withAuth, withRole } from "@/lib/auth/express/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req) => {
  return NextResponse.json({
    message: 'Authenticated API',
    userId: req.auth.userId
  });
});

export const POST = withRole('admin', async (req) => {
  return NextResponse.json({
    message: 'Admin only API'
  });
});
```

## Migration Checklist
- [ ] Install Clerk Express SDK
- [ ] Create adapter layer for Express SDK
- [ ] Implement server authentication utilities
- [ ] Create API route protection functions
- [ ] Update client-side hooks
- [ ] Update middleware implementation
- [ ] Test authentication flows
- [ ] Verify role-based access control
- [ ] Document changes for the team

## Further Reading
- [Clerk Express SDK Documentation](https://clerk.com/docs/references/backend/express)
- [Authentication Best Practices](/docs/engineering/infrastructure/authentication/AUTH_BEST_PRACTICES.md)
- [Clerk API Reference](/docs/engineering/infrastructure/authentication/CLERK_API_REFERENCE.md)