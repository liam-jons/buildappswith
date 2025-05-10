# Database Integration Patterns Guide

This document provides comprehensive guidance on standardized database integration patterns for the Buildappswith platform.

## Table of Contents

1. [Database Client Usage](#database-client-usage)
2. [Error Handling Patterns](#error-handling-patterns)
3. [Connection Management](#connection-management)
4. [Performance Optimization](#performance-optimization)
5. [Testing Database Code](#testing-database-code)
6. [Health Monitoring](#health-monitoring)
7. [Common Utility Functions](#common-utility-functions)
8. [Migration Best Practices](#migration-best-practices)

## Database Client Usage

### Importing the Database Client

Always use the standardized client export from the central location:

```typescript
// Correct usage
import { db } from '@/lib/db';

// For backward compatibility (avoid using in new code)
import { prisma } from '@/lib/db';

// INCORRECT - Never import directly from Prisma
import { PrismaClient } from '@prisma/client'; // AVOID THIS
```

### Client Instantiation

Never instantiate a new PrismaClient instance directly. Always use the shared singleton:

```typescript
// Correct
import { db } from '@/lib/db';

async function getUsers() {
  return db.user.findMany();
}

// INCORRECT - Creating a new client (avoid this)
const prisma = new PrismaClient(); // AVOID THIS
```

## Error Handling Patterns

### Standard Error Handling

Use the provided utility functions for consistent error handling:

```typescript
import { withDatabaseOperation } from '@/lib/db-error-handling';

async function getUserProfile(userId: string) {
  return withDatabaseOperation(
    async () => {
      return db.userProfile.findUnique({
        where: { userId },
        include: { user: true }
      });
    },
    'getUserProfile', // operation name for logging
    'userProfile', // model name
    { userId } // operation arguments
  );
}
```

### Retry Pattern for Transient Errors

For operations that may encounter transient failures, use the retry utility:

```typescript
import { withDatabaseRetry } from '@/lib/db-error-handling';

async function createUserWithRetry(userData: UserCreateData) {
  return withDatabaseRetry(
    () => db.user.create({ data: userData }),
    'createUser',
    {
      model: 'user',
      args: { data: userData },
      maxRetries: 3,
      initialDelay: 100,
    }
  );
}
```

### Error Classification

Database errors are automatically classified into categories:

- `CONNECTION`: Issues connecting to the database
- `VALIDATION`: Schema validation errors
- `CONSTRAINT`: Constraint violations (unique, foreign key)
- `TIMEOUT`: Query timeouts
- `AUTHENTICATION`: Database authentication failures
- `AUTHORIZATION`: Permission issues
- `UNKNOWN`: Unclassified errors

## Connection Management

### Connection Pooling

The database client automatically handles connection pooling. No manual connection management is required in most cases.

### Health Checks

Use the provided health check utility:

```typescript
import { checkDatabaseConnection, checkDatabaseHealth } from '@/lib/db-monitoring';

// Simple connection check
const isConnected = await checkDatabaseConnection();

// Comprehensive health check
const healthStatus = await checkDatabaseHealth();
```

### Cleanup in Tests

In test environments, disconnect the client when done:

```typescript
// In test teardown
afterAll(async () => {
  await db.$disconnect();
});
```

## Performance Optimization

### Query Monitoring

Use the query monitoring tools to identify slow queries:

```typescript
import { getDatabasePerformanceMetrics } from '@/lib/db-monitoring';

// Get performance metrics for the last 15 minutes
const metrics = getDatabasePerformanceMetrics(15 * 60 * 1000);
console.log(`Average query time: ${metrics.averageQueryTime}ms`);
```

### Query Optimization Techniques

1. **Select Only Needed Fields**:
   ```typescript
   const users = await db.user.findMany({
     select: {
       id: true,
       name: true,
       email: true,
       // Only select fields you need
     }
   });
   ```

2. **Use Pagination**:
   ```typescript
   import { paginatedQuery } from '@/lib/db-utils';

   const result = await paginatedQuery(
     (params) => db.user.findMany({
       ...params,
       where: { isActive: true }
     }),
     () => db.user.count({ where: { isActive: true } }),
     { page: 1, pageSize: 20 },
     'getActiveUsers'
   );
   ```

3. **Avoid N+1 Queries**:
   ```typescript
   // Good - single query with includes
   const posts = await db.post.findMany({
     include: { author: true, comments: true }
   });

   // Bad - N+1 queries
   const posts = await db.post.findMany();
   for (const post of posts) {
     post.author = await db.user.findUnique({ where: { id: post.authorId } });
     post.comments = await db.comment.findMany({ where: { postId: post.id } });
   }
   ```

## Testing Database Code

### Test Isolation

Use transactions for test isolation:

```typescript
import { db } from '@/lib/db';

// Run tests in a transaction
beforeEach(async () => {
  await db.$executeRaw`START TRANSACTION`;
});

afterEach(async () => {
  await db.$executeRaw`ROLLBACK`;
});
```

### Mocking the Database

For unit tests, you can mock the database client:

```typescript
import { db } from '@/lib/db';

// Mock the database client
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test User' }),
    },
  },
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'Test User' }),
    },
  }
}));
```

## Health Monitoring

### API Endpoint

Use the built-in health check API endpoint for monitoring:

```
GET /api/health/db
```

Sample response:

```json
{
  "isHealthy": true,
  "status": "healthy",
  "connectionOk": true,
  "responseTime": 45,
  "timestamp": "2023-05-09T12:34:56.789Z",
  "details": {
    "accessibleTables": 15,
    "schemaAccessOk": true
  }
}
```

### Scheduled Health Checks

For long-running services, schedule periodic health checks:

```typescript
import { scheduleHealthChecks } from '@/lib/db-monitoring';

// Start scheduled health checks (every 5 minutes)
const stopHealthChecks = scheduleHealthChecks(5 * 60 * 1000);

// Stop health checks when shutting down
process.on('SIGTERM', () => {
  stopHealthChecks();
});
```

## Common Utility Functions

### General Database Operations

Use the provided utility functions for common operations:

```typescript
import {
  safeCreate,
  safeUpdate,
  safeDelete,
  safeFindUnique,
  safeFindMany,
  safeUpsert,
  recordExists,
  safeDbTransaction
} from '@/lib/db-utils';

// Check if record exists
const exists = await recordExists('user', { email: 'user@example.com' });

// Create a record with error handling
const user = await safeCreate('user', { 
  name: 'New User',
  email: 'user@example.com' 
});

// Update a record with error handling
const updatedUser = await safeUpdate('user', 
  { id: '123' }, 
  { name: 'Updated Name' }
);

// Find a record with error handling
const user = await safeFindUnique('user', { 
  where: { id: '123' },
  include: { profile: true }
});

// Transaction with error handling
const result = await safeDbTransaction(async (tx) => {
  const user = await tx.user.create({ data: { name: 'Test' } });
  await tx.profile.create({ data: { userId: user.id } });
  return user;
}, 'createUserWithProfile');
```

## Migration Best Practices

### Running Migrations

- Development: `pnpm prisma:migrate:dev --name descriptive-name`
- Production: `pnpm prisma:migrate:deploy`

### Migration Verification

Always verify migrations in a staging environment before deploying to production.

### Schema Changes

Follow these guidelines for schema changes:

1. Add new fields as nullable or with defaults first
2. Deploy the schema change
3. Update the application code to use the new fields
4. Deploy the application changes
5. If needed, make the fields required in a subsequent migration

### Rollback Strategy

Have a rollback plan for every migration:

1. Document rollback steps for each migration
2. Test rollback procedures in development
3. Have database backups before running migrations in production