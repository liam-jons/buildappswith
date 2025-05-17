# Database Reset and Isolation Strategy

## Overview

This document outlines the database reset and isolation approach for test runs in the BuildAppsWith platform. It defines mechanisms to ensure test data is isolated between tests and test runs.

**Date**: May 8, 2025  
**Branch**: feature/testing-enhancement  
**Status**: Approved

## Core Principles

1. **Test Isolation**: Each test should run in an isolated environment
2. **Data Consistency**: Test data should be in a predictable state at the start of each test
3. **Performance**: Database reset operations should be optimized for speed
4. **Parallel Execution**: Support for parallel test execution with isolated data
5. **CI Integration**: Compatible with CI environments

## Implementation Components

### 1. Transaction-Based Test Isolation

```typescript
// test-transaction.ts
import { PrismaClient } from '@prisma/client'

/**
 * Execute a callback within a transaction that is always rolled back
 * Perfect for isolated test operations
 */
export async function withTestTransaction<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = new PrismaClient()

  try {
    // Begin transaction
    await prisma.$executeRaw`BEGIN`

    // Execute test with transaction context
    const result = await callback(prisma)

    // Always rollback after test
    await prisma.$executeRaw`ROLLBACK`

    return result
  } finally {
    await prisma.$disconnect()
  }
}
```

### 2. Dedicated Test Database Configuration

```typescript
// test-database.ts
import { PrismaClient } from '@prisma/client'

/**
 * Get a Prisma client configured for the test database
 */
export function getTestPrismaClient(): PrismaClient {
  // Use a specific test database URL based on environment
  const databaseUrl = process.env.TEST_DATABASE_URL ||
    process.env.DATABASE_URL?.replace(/\/([^/]*)$/, '/test_$1')

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
}
```

### 3. Database Reset Implementation

```typescript
// database-reset.ts
import { PrismaClient } from '@prisma/client'

/**
 * Reset the test database by truncating all tables
 */
export async function resetTestDatabase(prisma: PrismaClient): Promise<void> {
  // Get all tables (excluding Prisma's own tables)
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE '_prisma%'
  `

  // Disable foreign key checks during truncation
  await prisma.$executeRaw`SET session_replication_role = 'replica'`

  // Truncate all tables in reverse order (to handle foreign keys)
  for (const { tablename } of tables.reverse()) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`)
  }

  // Re-enable foreign key checks
  await prisma.$executeRaw`SET session_replication_role = 'origin'`
}
```

### 4. Test Lifecycle Integration

```typescript
// test-lifecycle.ts
import { PrismaClient } from '@prisma/client'
import { resetTestDatabase } from './database-reset'
import { seedTestData } from './test-data-seed'

export class TestDatabaseLifecycle {
  private static prisma: PrismaClient

  /**
   * Initialize test database for test suite
   */
  static async setup(): Promise<void> {
    this.prisma = new PrismaClient()

    // Reset database to clean state
    await resetTestDatabase(this.prisma)

    // Seed with baseline test data
    await seedTestData(this.prisma)
  }

  /**
   * Cleanup after test suite
   */
  static async teardown(): Promise<void> {
    await this.prisma.$disconnect()
  }

  /**
   * Reset database and optionally apply custom seed
   */
  static async resetWithSeed(customSeed?: (prisma: PrismaClient) => Promise<void>): Promise<void> {
    // Reset database
    await resetTestDatabase(this.prisma)

    // Apply baseline seed
    await seedTestData(this.prisma)

    // Apply custom seed if provided
    if (customSeed) {
      await customSeed(this.prisma)
    }
  }
}
```

### 5. E2E Test Database Configuration

```typescript
// playwright.setup.ts
import { TestDatabaseLifecycle } from './test-lifecycle'

/**
 * Global setup for E2E tests
 */
async function globalSetup() {
  // Database setup should run before browser initialization
  await TestDatabaseLifecycle.setup()

  // Continue with browser setup
  // ...
}

/**
 * Global teardown for E2E tests
 */
async function globalTeardown() {
  // Disconnect database
  await TestDatabaseLifecycle.teardown()

  // Continue with browser teardown
  // ...
}
```

### 6. Worker Isolation for Parallel Testing

```typescript
// worker-isolation.ts
import { PrismaClient } from '@prisma/client'

/**
 * Get an isolated database client for a specific worker
 * Enables parallel test execution with isolated data
 */
export async function getIsolatedDatabase(workerId: string): Promise<PrismaClient> {
  // Create schema name based on worker ID
  const schemaName = `test_worker_${workerId}`

  // Create schema if it doesn't exist
  const prisma = new PrismaClient()
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)

  // Return client configured for this schema
  return new PrismaClient({
    datasources: {
      db: {
        url: `${process.env.TEST_DATABASE_URL}?schema=${schemaName}`
      }
    }
  })
}
```

### 7. Database Schema Management

```typescript
// schema-management.ts
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Ensure test database has latest schema
 */
export async function ensureTestSchema(): Promise<void> {
  // Run prisma migrate on test database
  await execAsync(`DATABASE_URL=${process.env.TEST_DATABASE_URL} npx prisma migrate deploy`)
}

/**
 * Complete reset of test schema (useful for CI)
 */
export async function resetTestSchema(): Promise<void> {
  // For complete reset (useful in CI)
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.TEST_DATABASE_URL } }
  })

  // Drop all tables and recreate schema
  await prisma.$executeRaw`DROP SCHEMA public CASCADE`
  await prisma.$executeRaw`CREATE SCHEMA public`

  // Run migrations to rebuild schema
  await execAsync(`DATABASE_URL=${process.env.TEST_DATABASE_URL} npx prisma migrate deploy`)

  await prisma.$disconnect()
}
```

### 8. CI Environment Configuration

```yaml
# .github/workflows/database-setup.yml
name: Setup Test Database

on:
  workflow_call:
    outputs:
      database-url:
        description: "URL to the test database"
        value: ${{ jobs.setup.outputs.database-url }}

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      database-url: ${{ steps.db-setup.outputs.database-url }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup Test Database
        id: db-setup
        run: |
          # Create test-specific PostgreSQL database
          DATABASE_NAME="test_db_${{ github.run_id }}"

          # Setup database container
          docker run -d --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:14

          # Create test database
          docker exec postgres-test psql -U postgres -c "CREATE DATABASE $DATABASE_NAME;"

          # Set output for other jobs
          echo "database-url=postgresql://postgres:postgres@localhost:5432/$DATABASE_NAME" >> $GITHUB_OUTPUT

          # Run migrations
          DATABASE_URL="postgresql://postgres:postgres@localhost:5432/$DATABASE_NAME" npx prisma migrate deploy
```

## Usage Patterns

### Standard Test Reset

For most test suites, use the global setup to reset and seed data:

```typescript
// In Jest beforeAll or Vitest beforeEach
beforeAll(async () => {
  await TestDatabaseLifecycle.setup();
});

afterAll(async () => {
  await TestDatabaseLifecycle.teardown();
});
```

### Transaction-Based Testing

For component or unit tests, use transaction-based isolation:

```typescript
test('creates a new builder profile', async () => {
  await withTestTransaction(async (prisma) => {
    // Test operations inside transaction (will be rolled back)
    const result = await createBuilderProfile(prisma, { 
      name: 'Test Builder',
      hourlyRate: 100
    });
    
    expect(result).toHaveProperty('id');
    
    // Verify database state
    const savedProfile = await prisma.builderProfile.findUnique({
      where: { id: result.id }
    });
    
    expect(savedProfile).not.toBeNull();
    expect(savedProfile!.hourlyRate).toBe(100);
  });
  
  // Transaction automatically rolled back, no cleanup needed
});
```

### Parallel Test Execution

For parallel test execution in CI:

```typescript
// In worker setup
const workerId = process.env.PLAYWRIGHT_WORKER_ID || '1';
const prisma = await getIsolatedDatabase(workerId);

// Use prisma client with isolated schema for this worker
```

## Integration with Test Frameworks

### Jest Integration

```typescript
// jest.setup.ts
import { TestDatabaseLifecycle } from './test-utils/test-lifecycle';

// Global setup
beforeAll(async () => {
  await TestDatabaseLifecycle.setup();
});

// Global teardown
afterAll(async () => {
  await TestDatabaseLifecycle.teardown();
});
```

### Playwright Integration

```typescript
// global-setup.ts
import { TestDatabaseLifecycle } from '../utils/test-lifecycle';

async function globalSetup() {
  // Database setup
  await TestDatabaseLifecycle.setup();
  
  // Other setup
  // ...
}

export default globalSetup;
```

## Performance Optimization

The database reset approach is optimized for performance in several ways:

1. **Truncation vs Drop/Create**: Uses TRUNCATE for faster resets than DROP/CREATE
2. **Transaction Isolation**: Uses transactions where appropriate for zero-cost cleanup
3. **Parallel Schema Isolation**: Supports concurrent test execution with schema isolation
4. **Minimal Seed Data**: Seeds only necessary data for test scenarios

## Scenarios and Edge Cases

### Development Environment

In development environments, use the transaction-based approach to prevent test pollution:

```typescript
// development.test.ts
import { withTestTransaction } from './test-transaction';

test('my development test', async () => {
  await withTestTransaction(async (prisma) => {
    // Test operations that won't affect development database
  });
});
```

### CI Environment

In CI environments, use complete database reset and isolation:

```yaml
# ci-test-job.yml
- name: Setup Test Database
  run: |
    # Use job-specific database
    export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_${{ github.run_id }}"
    
    # Create and migrate database
    npx prisma db push --skip-generate
    
    # Run tests with isolated database
    npm test
```

### Local Fast Testing

For rapid local development testing, optionally skip full resets:

```typescript
// In test utils
export async function optimizedReset(prisma: PrismaClient): Promise<void> {
  if (process.env.FAST_TEST_MODE === 'true') {
    // Only truncate specific tables relevant to current tests
    await prisma.$executeRaw`TRUNCATE TABLE "Booking" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "SessionType" CASCADE`;
  } else {
    // Full reset
    await resetTestDatabase(prisma);
  }
}
```

## Benefits

1. **Reliability**: Ensures consistent test environments for reliable tests
2. **Isolation**: Prevents test interference for accurate results
3. **Performance**: Optimizes database operations for faster tests
4. **Parallelization**: Supports concurrent test execution
5. **Flexibility**: Accommodates different testing requirements and environments

## Implementation Timeline

1. **Phase 1**: Database reset implementation (Completed)
2. **Phase 2**: Transaction-based isolation (Completed)
3. **Phase 3**: Worker isolation for parallel testing (Completed)
4. **Phase 4**: CI pipeline integration (In Progress)
5. **Phase 5**: Performance optimization (Planned)