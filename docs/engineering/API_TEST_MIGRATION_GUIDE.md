# API Test Migration Guide: NextAuth.js to Clerk

This document provides specific guidance for migrating API tests from NextAuth.js to the new Clerk authentication system.

## Overview

API tests require a different approach than component tests because they interact with the Clerk `auth()` function rather than React hooks like `useUser()` and `useAuth()`. The key differences include:

1. How the authentication state is mocked
2. How the user data is passed to the API handler
3. How roles and permissions are verified

## Migration Steps

### 1. Update Imports

```typescript
// From
const { mockUsers, setupMockAuth, resetMockAuth } = require('../utils/auth-test-utils');

// To
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockUsers } from '../mocks/users';
import { resetMockClerk } from '../utils/clerk-test-utils';
```

### 2. Update Auth Mocking

```typescript
// Before
beforeEach(() => {
  setupMockAuth('client');
});

afterEach(() => {
  resetMockAuth();
});

// After
const { auth } = require('@clerk/nextjs');

beforeEach(() => {
  // Configure auth to return authenticated user
  vi.mocked(auth).mockReturnValue({
    userId: mockUsers.client.clerkId,
    sessionId: `session-${mockUsers.client.clerkId}`,
    getToken: vi.fn().mockResolvedValue('test-token'),
  });
});

afterEach(() => {
  resetMockClerk();
});
```

### 3. Update API Handler Mocks

```typescript
// Before (NextAuth.js helpers)
jest.mock('@/lib/auth/helpers', () => ({
  requireAuth: jest.fn(),
  requireRole: jest.fn(),
  hasRole: jest.fn(),
}));

// After (Clerk helpers)
vi.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  hasRole: vi.fn(),
}));
```

### 4. Update Test for Unauthenticated State

```typescript
// Before
setupMockAuth(null); // or some equivalent for unauthenticated state

// After
vi.mocked(auth).mockReturnValue({
  userId: null,
  sessionId: null,
  getToken: vi.fn().mockResolvedValue(null),
});
```

### 5. Update Test for Different Roles

```typescript
// Before
setupMockAuth('admin');

// After
vi.mocked(auth).mockReturnValue({
  userId: mockUsers.admin.clerkId,
  sessionId: `session-${mockUsers.admin.clerkId}`,
  getToken: vi.fn().mockResolvedValue('admin-token'),
});
```

## Example: API Test Migration

Here's a complete example of migrating an API test:

### Before (NextAuth.js)

```javascript
const { mockUsers, setupMockAuth, resetMockAuth } = require('../../utils/auth-test-utils');
const handler = require('@/pages/api/profiles/[id]');

jest.mock('@/lib/auth/helpers', () => ({
  requireAuth: jest.fn().mockImplementation((req, res, next) => next()),
  requireRole: jest.fn().mockImplementation((role) => (req, res, next) => next()),
  hasRole: jest.fn().mockReturnValue(true),
}));

const mockReq = (params = {}) => ({
  query: { id: 'test-profile-id', ...params },
  method: 'GET',
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Profile API Handler', () => {
  beforeEach(() => {
    setupMockAuth('client');
  });
  
  afterEach(() => {
    resetMockAuth();
    jest.clearAllMocks();
  });
  
  it('returns 200 with profile data', async () => {
    const req = mockReq();
    const res = mockRes();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: expect.any(Object),
    });
  });
  
  it('returns 401 when not authenticated', async () => {
    setupMockAuth(null);
    
    const req = mockReq();
    const res = mockRes();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

### After (Clerk)

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockUsers } from '../../mocks/users';
import { resetMockClerk } from '../../utils/clerk-test-utils';
import handler from '@/app/api/profiles/[id]/route';

// Mock auth module
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(),
}));

// Import after mock setup
const { auth } = require('@clerk/nextjs');

// Mock auth helpers
vi.mock('@/lib/auth/clerk/helpers', () => ({
  requireAuth: vi.fn().mockImplementation((req, res, next) => next()),
  requireRole: vi.fn().mockImplementation((role) => (req, res, next) => next()),
  hasRole: vi.fn().mockReturnValue(true),
}));

// Helper for creating mock request and response
const createMockRequestResponse = (params = {}) => {
  const req = {
    url: `https://buildappswith.com/api/profiles/${params.id || 'test-profile-id'}`,
    method: 'GET',
    json: vi.fn().mockResolvedValue({}),
  };
  
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockResolvedValue({}),
  };
  
  return { req, res };
};

describe('Profile API Handler', () => {
  beforeEach(() => {
    // Configure auth to return authenticated user
    vi.mocked(auth).mockReturnValue({
      userId: mockUsers.client.clerkId,
      sessionId: `session-${mockUsers.client.clerkId}`,
      getToken: vi.fn().mockResolvedValue('test-token'),
    });
  });
  
  afterEach(() => {
    resetMockClerk();
    vi.clearAllMocks();
  });
  
  it('returns 200 with profile data', async () => {
    const { req, res } = createMockRequestResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: expect.any(Object),
    });
  });
  
  it('returns 401 when not authenticated', async () => {
    // Mock unauthenticated state
    vi.mocked(auth).mockReturnValue({
      userId: null,
      sessionId: null,
      getToken: vi.fn().mockResolvedValue(null),
    });
    
    const { req, res } = createMockRequestResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
```

## Common Challenges

### Handling Auth Session Data

In Clerk, the auth session data has a different structure than in NextAuth.js. Make sure you're returning the right properties:

```typescript
// Clerk auth session structure
{
  userId: string | null,
  sessionId: string | null,
  getToken: () => Promise<string | null>
}
```

### Testing API Routes with App Router

If you're using the Next.js App Router, API routes are defined differently as route handlers. The testing approach changes slightly:

```typescript
// For App Router route handlers
import handler from '@/app/api/profiles/[id]/route';

// Create mock request
const req = new Request('https://buildappswith.com/api/profiles/test-id');

// Test the handler
const response = await handler(req);
expect(response.status).toBe(200);
```

### Testing Middleware Integration

If your API routes rely on middleware, you may need to mock the middleware behavior separately:

```typescript
// Mock middleware modules
vi.mock('@/middleware', () => ({
  middleware: vi.fn().mockImplementation((req) => ({
    ...req,
    auth: {
      userId: mockUsers.client.clerkId,
      sessionId: `session-${mockUsers.client.clerkId}`,
    }
  }))
}));
```

## Best Practices

1. **Use TypeScript**: Convert JavaScript test files to TypeScript for better type safety
2. **Consistent Mocking**: Use the centralized mock implementation approach
3. **Testing Authentication States**: Test both authenticated and unauthenticated states
4. **Testing Different Roles**: Test API behavior with different user roles
5. **Error Handling**: Test error conditions and edge cases

## References

- [TEST_MIGRATION_PLAN.md](/docs/TEST_MIGRATION_PLAN.md)
- [Clerk Testing Documentation](https://clerk.com/docs/testing/testing-overview)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Next.js API Testing](https://nextjs.org/docs/app/building-your-application/testing)
