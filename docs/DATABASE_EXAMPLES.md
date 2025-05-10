# Database Integration Examples

This document provides practical examples of the standardized database integration patterns for the Buildappswith platform.

## Basic Database Operations

### Reading Data

```typescript
import { db } from '@/lib/db';
import { withDatabaseOperation } from '@/lib/db-error-handling';

// Simple query without error handling
async function getPublishedPosts() {
  return db.post.findMany({
    where: { published: true },
    include: { author: true }
  });
}

// Query with standardized error handling
async function getUserWithProfile(userId: string) {
  return withDatabaseOperation(
    async () => {
      return db.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });
    },
    'getUserWithProfile',
    'user',
    { userId }
  );
}
```

### Writing Data

```typescript
import { db } from '@/lib/db';
import { withDatabaseOperation, withDatabaseRetry } from '@/lib/db-error-handling';

// Create data with error handling
async function createProject(projectData: ProjectCreateData) {
  return withDatabaseOperation(
    async () => {
      return db.project.create({
        data: projectData,
        include: { client: true }
      });
    },
    'createProject',
    'project',
    { data: projectData }
  );
}

// Update data with retry mechanism
async function updateUserStatus(userId: string, status: string) {
  return withDatabaseRetry(
    async () => {
      return db.user.update({
        where: { id: userId },
        data: { status }
      });
    },
    'updateUserStatus',
    {
      model: 'user',
      args: { userId, status },
      maxRetries: 3
    }
  );
}
```

### Deleting Data

```typescript
import { db } from '@/lib/db';
import { withDatabaseOperation } from '@/lib/db-error-handling';

// Delete data with error handling
async function deletePost(postId: string) {
  return withDatabaseOperation(
    async () => {
      return db.post.delete({
        where: { id: postId }
      });
    },
    'deletePost',
    'post',
    { postId }
  );
}
```

## Advanced Database Patterns

### Transactions

```typescript
import { db } from '@/lib/db';
import { safeDbTransaction } from '@/lib/db-utils';

// Complex operation in a transaction
async function createUserWithProfile(userData: UserData, profileData: ProfileData) {
  return safeDbTransaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: userData
    });
    
    // Create profile linked to user
    const profile = await tx.profile.create({
      data: {
        ...profileData,
        userId: user.id
      }
    });
    
    return { user, profile };
  }, 'createUserWithProfile');
}
```

### Batch Operations

```typescript
import { db } from '@/lib/db';
import { withDatabaseOperation } from '@/lib/db-error-handling';

// Batch update multiple records
async function publishPosts(postIds: string[]) {
  return withDatabaseOperation(
    async () => {
      return db.post.updateMany({
        where: {
          id: { in: postIds }
        },
        data: {
          published: true,
          publishedAt: new Date()
        }
      });
    },
    'publishPosts',
    'post',
    { postIds }
  );
}
```

### Pagination

```typescript
import { paginatedQuery } from '@/lib/db-utils';

// Paginated query for blog posts
async function getBlogPosts(options: {
  page?: number;
  pageSize?: number;
  category?: string;
}) {
  const { page = 1, pageSize = 10, category } = options;
  
  return paginatedQuery(
    (paginationParams) => db.post.findMany({
      ...paginationParams,
      where: category ? { category } : undefined,
      include: { author: true }
    }),
    () => db.post.count({
      where: category ? { category } : undefined
    }),
    { page, pageSize },
    'getBlogPosts'
  );
}
```

## Error Handling Examples

### Handling Constraint Violations

```typescript
import { db } from '@/lib/db';
import { 
  withDatabaseOperation, 
  DatabaseErrorCategory 
} from '@/lib/db-error-handling';
import { enhancedLogger } from '@/lib/enhanced-logger';

async function createUniqueUser(email: string, name: string) {
  try {
    return await withDatabaseOperation(
      async () => {
        return db.user.create({
          data: { email, name }
        });
      },
      'createUniqueUser',
      'user',
      { email, name }
    );
  } catch (error) {
    // Check if it's a unique constraint violation
    if (
      error instanceof Error &&
      error.name === 'DatabaseOperationError' &&
      error.code === 'DB_P2002' // Prisma unique constraint error
    ) {
      enhancedLogger.warn('Attempted to create user with existing email', {
        email,
        operation: 'createUniqueUser'
      });
      
      // Return null or throw a domain-specific error
      return null;
    }
    
    // Re-throw other errors
    throw error;
  }
}
```

### Handling Connection Issues

```typescript
import { db } from '@/lib/db';
import { checkDatabaseConnection } from '@/lib/db-monitoring';
import { enhancedLogger } from '@/lib/enhanced-logger';

async function performCriticalOperation() {
  // Check connection before performing operation
  const isConnected = await checkDatabaseConnection();
  
  if (!isConnected) {
    enhancedLogger.error('Database connection unavailable for critical operation');
    throw new Error('Database connection unavailable');
  }
  
  // Proceed with operation
  return db.criticalModel.create({
    data: { /* ... */ }
  });
}
```

## Health Monitoring Examples

### API Health Check

```typescript
// In a Next.js API route handler
import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db-monitoring';

export async function GET(request: NextRequest) {
  const health = await checkDatabaseHealth();
  
  // Return appropriate status based on health
  const status = health.isHealthy ? 200 : 503;
  
  return NextResponse.json(health, { status });
}
```

### Application Startup Check

```typescript
import { checkDatabaseConnection } from '@/lib/db-monitoring';
import { enhancedLogger } from '@/lib/enhanced-logger';

// Check database at application startup
async function validateDatabaseOnStartup() {
  try {
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      enhancedLogger.error('Failed to connect to database during startup');
      // Handle startup failure (exit or fall back to limited mode)
      process.exit(1);
    }
    
    enhancedLogger.info('Successfully connected to database');
  } catch (error) {
    enhancedLogger.error('Error checking database connection during startup', {
      error: error instanceof Error ? error.message : String(error)
    });
    process.exit(1);
  }
}
```

## Testing Examples

### Mock Database for Unit Tests

```typescript
// In test file
import { db } from '@/lib/db';
import { getUserPosts } from '@/lib/user-service';

// Mock database client
jest.mock('@/lib/db', () => ({
  db: {
    post: {
      findMany: jest.fn()
    }
  }
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should get user posts', async () => {
    // Setup mock response
    const mockPosts = [{ id: '1', title: 'Test Post' }];
    (db.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
    
    // Call the function
    const result = await getUserPosts('user-1');
    
    // Verify results
    expect(result).toEqual(mockPosts);
    expect(db.post.findMany).toHaveBeenCalledWith({
      where: { authorId: 'user-1' }
    });
  });
});
```

### Integration Tests with Transaction Rollback

```typescript
import { db } from '@/lib/db';

describe('Database Integration', () => {
  beforeEach(async () => {
    // Start transaction before each test
    await db.$executeRaw`START TRANSACTION`;
  });
  
  afterEach(async () => {
    // Rollback transaction after each test
    await db.$executeRaw`ROLLBACK`;
  });
  
  it('should create and retrieve a user', async () => {
    // Create test data
    const user = await db.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    // Verify creation
    expect(user.id).toBeDefined();
    
    // Verify retrieval
    const retrieved = await db.user.findUnique({
      where: { id: user.id }
    });
    
    expect(retrieved).toMatchObject({
      name: 'Test User',
      email: 'test@example.com'
    });
  });
});
```

## Performance Optimization Examples

### Selective Field Queries

```typescript
import { db } from '@/lib/db';

// Only select required fields
async function getUserEmailsForNewsletter() {
  return db.user.findMany({
    where: {
      subscribed: true,
      emailVerified: true
    },
    select: {
      id: true,
      email: true,
      name: true, 
      // Exclude other fields
    }
  });
}
```

### Using Indexes Effectively

```typescript
import { db } from '@/lib/db';

// Query using indexed fields
async function searchUsersByEmail(emailPattern: string) {
  return db.user.findMany({
    where: {
      // Assuming email is indexed
      email: {
        contains: emailPattern
      }
    },
    take: 20
  });
}
```

### Connection Reuse

```typescript
import { db } from '@/lib/db';

// Good practice - reuse the db client
async function performMultipleOperations() {
  // All operations use the same connection from the pool
  const users = await db.user.findMany();
  const posts = await db.post.findMany();
  const comments = await db.comment.findMany();
  
  return { users, posts, comments };
}

// Bad practice - creating multiple clients
async function badPerformMultipleOperations() {
  // Don't do this - each import creates a new connection
  const { PrismaClient } = require('@prisma/client');
  const client1 = new PrismaClient();
  const client2 = new PrismaClient();
  
  const users = await client1.user.findMany();
  const posts = await client2.post.findMany();
  
  return { users, posts };
}
```