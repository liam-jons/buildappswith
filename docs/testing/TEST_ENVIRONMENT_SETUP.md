# Test Environment Setup Guide

This guide provides comprehensive instructions for setting up and managing test environments for the BuildAppsWith platform. It covers database configuration, test user provisioning, and best practices for testing.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Database Setup](#database-setup)
3. [Test User Provisioning](#test-user-provisioning)
4. [Test Data Management](#test-data-management)
5. [Running Tests](#running-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

## Environment Configuration

### Environment Variables

Create a `.env.test` file with the following configuration:

```bash
# Database connection
DATABASE_URL_TEST=postgresql://user:password@localhost:5432/buildappswith_test
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/buildappswith_test

# Clerk (test instance)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Auth settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-auth-secret-do-not-use-in-production

# Feature flags
ENABLE_TEST_FEATURES=true
ENABLE_TEST_MODE=true
```

### Environment File Loading

Update your `.gitignore` to exclude test environment files:

```
# Test environment
.env.test
.env.test.local
.auth/
test-results/
```

## Database Setup

### Test Database Creation

Create a dedicated test database:

```bash
# PostgreSQL
createdb buildappswith_test

# Or with connection parameters
PGPASSWORD=password createdb -h localhost -U user buildappswith_test
```

### Schema Validation

Validate that your test database schema matches the development schema:

```bash
# Run validation script
node scripts/db-schema-validation.js

# Output will be saved to test-results/schema-validation/
```

This ensures that your test environment has the correct database structure.

### Schema Migrations

If schema differences are detected:

```bash
# Apply migrations to test database
DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Test User Provisioning

### Standard Test Users

The platform uses a standardized set of test users for consistent testing. These users are defined in the [Test User Matrix](./TEST_USER_MATRIX.md).

To provision test users:

```bash
# Create all standard test users in the database
node scripts/seed-data/test-users.js

# Verify test users were created correctly
node scripts/seed-data/test-users.js --verify
```

### Important: Pre-Production Clerk ID Synchronization

⚠️ **Critical Before Production**: Before deploying to production, you must create corresponding user accounts in Clerk and update the database records with their real Clerk IDs.

The test user script currently creates placeholder Clerk IDs in the database. For proper authentication flow, follow these steps:

1. Manually create each test user in the Clerk dashboard
2. Set the appropriate roles in `publicMetadata` (e.g., `{"roles": ["CLIENT"]}`)
3. Update the database records with actual Clerk IDs:

```javascript
// Example: Update script for syncing real Clerk IDs
await prisma.user.update({
  where: { email: 'client-test1@buildappswith.com' },
  data: { clerkId: 'actual_clerk_id_from_dashboard' }
});
```

**Note**: This synchronization is critical for testing authentication flows. Without proper Clerk ID mapping, users will be able to log in but won't have access to their profiles.

### User Credentials

| Role | Email | Password |
|------|-------|----------|
| Client | client@buildappswith-test.com | TestClient123! |
| Premium Client | premium-client@buildappswith-test.com | PremiumClient123! |
| New Builder | new-builder@buildappswith-test.com | NewBuilder123! |
| Established Builder | established-builder@buildappswith-test.com | EstablishedBuilder123! |
| Admin | admin@buildappswith-test.com | AdminUser123! |
| Multi-Role | multi-role@buildappswith-test.com | MultiRole123! |

### Clerk Test Configuration

The test users are created in your Clerk test instance. To access them:

1. Log in to the [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your test instance
3. Navigate to the "Users" section
4. Filter by email domain: `buildappswith-test.com`

## Test Data Management

### Resetting the Test Database

To reset the test database to a clean state:

```bash
# Reset everything (including test users)
node scripts/seed-data/reset-test-db.js

# Reset but preserve test users
node scripts/seed-data/reset-test-db.js --preserve-users
```

### Creating Isolated Test Environments

For parallel testing, you can create isolated schema environments:

```bash
# Create an isolated environment for worker 1
node scripts/seed-data/reset-test-db.js --schema=test_worker_1
```

This creates a separate schema with its own copy of tables.

### Test Data Seeding Framework

Our test framework provides utilities for seeding test data:

```typescript
import { seedTestData } from '@/tests/utils/seed-utils';

// Seed specific test data
await seedTestData({
  users: 2,            // Number of random users
  builders: 1,         // Number of builder profiles
  sessionTypes: 2,     // Session types per builder
  bookings: 3          // Bookings per builder
});
```

## Running Tests

### Test Environment Detection

Tests automatically detect the test environment through:

1. `NODE_ENV=test` environment variable
2. Use of `.env.test` configuration
3. Test database URL check

### E2E Test Authentication

E2E tests use authentication states for the standard test users:

```typescript
// In your Playwright test
import { test } from '@playwright/test';
import { AuthUtils } from '@/tests/utils/e2e-auth-utils';

// Test with client user
test('client books a session', async ({ browser }) => {
  const context = await browser.newContext({
    storageState: AuthUtils.getStorageStatePath('client')
  });
  const page = await context.newPage();
  // ...test with authenticated client
});
```

### Test Database Transaction Isolation

Unit and integration tests use transaction isolation:

```typescript
import { withTestTransaction } from '@/tests/utils/database/transaction';

test('creates a booking', async () => {
  await withTestTransaction(async (prisma) => {
    // Test using prisma client
    // All operations are rolled back after the test
  });
});
```

## CI/CD Integration

### GitHub Actions Configuration

Our CI pipeline uses dedicated test configurations:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: buildappswith_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      # Setup Node.js
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      # Install dependencies
      - run: pnpm install
      
      # Setup test database
      - name: Setup test database
        run: |
          npx prisma migrate deploy
          node scripts/seed-data/test-users.js
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/buildappswith_test
          CLERK_SECRET_KEY: ${{ secrets.TEST_CLERK_SECRET_KEY }}
      
      # Run tests
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/buildappswith_test
          CLERK_SECRET_KEY: ${{ secrets.TEST_CLERK_SECRET_KEY }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.TEST_CLERK_PUBLISHABLE_KEY }}
```

### Test Reporting

Tests generate reports in the `test-results` directory:

- Test execution results
- Coverage reports
- Visual test comparisons
- Schema validation reports

## Troubleshooting

### Common Issues

1. **Database Connection Errors**

   ```
   Error: P1001: Can't reach database server
   ```

   **Solution:** Verify your `TEST_DATABASE_URL` is correct and the database server is running.

2. **Missing Test Users**

   ```
   Error: Authentication failed for test user
   ```

   **Solution:** Run `node scripts/seed-data/test-users.js` to recreate test users.

3. **Schema Mismatch**

   ```
   Error: P1012: Schema mismatch - table 'X' does not exist
   ```

   **Solution:** Run database validation and apply migrations:
   
   ```bash
   node scripts/db-schema-validation.js
   DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy
   ```

4. **Clerk API Key Issues**

   ```
   Error: Invalid API key provided
   ```

   **Solution:** Verify your Clerk API keys are for the test instance, not production.

### Getting Help

If you encounter issues not covered here, please:

1. Check the error logs in `test-results/`
2. Review the [Testing Implementation Summary](./TESTING_IMPLEMENTATION_SUMMARY.md)
3. Create an issue in the project repository with the error details

## Best Practices

1. **Test Isolation:** Always use transaction isolation or schema isolation for tests

2. **Reset Between Test Suites:** Clear test data between major test runs
   ```bash
   node scripts/seed-data/reset-test-db.js --preserve-users
   ```

3. **Avoid Production Data:** Never run tests against production data or production Clerk accounts

4. **Standard Users:** Use the standard test users whenever possible instead of creating custom ones

5. **Independent Tests:** Design tests to be independent and not rely on the state from other tests

6. **Consistent Seeding:** Use the standard seeding utilities for consistent test data

Following these guidelines will ensure reliable and consistent testing across the development team.