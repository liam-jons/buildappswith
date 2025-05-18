# Database Setup Guide

This document provides instructions for setting up and managing the Buildappswith database.

## Overview

Buildappswith uses PostgreSQL (hosted on Neon) as the database and Prisma ORM for database access. Our implementation includes:

- Complete schema design for all platform entities
- Database migrations for schema changes
- Seeding scripts for initial data
- Environment-aware configuration

## Initial Setup

### Prerequisites

- Node.js 16+
- PostgreSQL connection string
- Environment variables properly configured

### Step 1: Install Dependencies

```bash
pnpm install
# or
npm install
```

### Step 2: Set Up Environment Variables

Create or update your `.env.local` file with the required database connection string:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

For example, using Neon PostgreSQL:
```
DATABASE_URL=postgresql://Buildappswith-dev_owner:your_password@ep-example-id.region.aws.neon.tech/database-name?sslmode=require
```

You can verify your environment configuration by running:

```bash
pnpm env:check
```

### Step 3: Generate Prisma Client

```bash
pnpm prisma:generate
```

This creates type-safe client code based on your schema.

### Step 4: Run Migrations

For initial setup or major changes:

```bash
pnpm prisma:migrate:dev --name initial-setup
```

For applying existing migrations in production:

```bash
pnpm prisma:migrate:deploy
```

### Step 5: Seed the Database

```bash
pnpm db:seed
```

This populates the database with initial data, including timeline entries.

## Development Workflow

### Schema Changes

1. Edit the schema in `prisma/schema.prisma`
2. Generate a migration with a descriptive name:
   ```bash
   pnpm prisma:migrate:dev --name add-new-entity
   ```
3. Update related service and API code to use the new schema

### Viewing Database

To explore the database through a visual interface:

```bash
pnpm prisma:studio
```

This opens Prisma Studio, where you can browse and edit data.

### Reset Development Database

```bash
pnpm prisma:migrate:reset
```

**Warning:** This completely resets your development database, deleting all data. It then applies all migrations and runs the seed script.

## Database Access in Code

### Data Service Pattern

Buildappswith follows a data service pattern for database access:

```typescript
// Example service file (/lib/timeline/real-data/timeline-service.ts)

import { db } from '@/lib/db';
import { AICapability, Domain } from '@/lib/timeline/types';

export async function fetchCapabilities() {
  // Implementation using Prisma client (db)
}
```

### API Endpoints

API endpoints use these services to provide data to the frontend:

```typescript
// Example API route (/app/api/timeline/capabilities/route.ts)

import { NextRequest, NextResponse } from 'next/server';
import { fetchCapabilities } from '@/lib/timeline/real-data/timeline-service';

export async function GET(request: NextRequest) {
  try {
    const capabilities = await fetchCapabilities();
    return NextResponse.json(capabilities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch capabilities' }, { status: 500 });
  }
}
```

## Database Seeding

The database seeding process populates the database with initial data. We use a specialized script that properly handles environment variables and database connections:

```bash
pnpm db:seed
```

### Seeding Implementation Details

Our seeding system uses two key files:

1. **`scripts/seed-with-env.js`** - Main seeding script that:
   - Loads environment variables properly
   - Initializes the Prisma client
   - Seeds the database with initial data
   - Handles error reporting

2. **`prisma/schema.prisma`** - Contains the `seed` configuration in the `prisma` section of `package.json`:
   ```json
   "prisma": {
     "seed": "node scripts/seed-with-env.js"
   }
   ```

### Customizing the Seed Data

To modify the seed data:

1. Edit the `mockCapabilities` array in `scripts/seed-with-env.js`
2. Add or update seed functions for other entity types
3. Run `pnpm db:seed` to apply your changes

## Error Handling

Our database implementation includes:

- Try/catch blocks around all database operations
- Consistent error response format
- Detailed logging for debugging
- Graceful fallbacks for non-critical failures

## Troubleshooting

### Common Issues

- **Connection Errors**: Verify your DATABASE_URL is correct and the database is accessible
- **Migration Errors**: Check for conflicts with existing schema or data
- **Type Errors**: Run `pnpm prisma:generate` after schema changes
- **Seeding Errors**: Ensure seed data is valid and properly formatted
- **Environment Variables**: Make sure DATABASE_URL is correctly set in your `.env.local` file
- **Missing Environment Variables**: If your seed script can't find the DATABASE_URL, make sure it's properly loading the .env files

### Environment Variable Loading

If you're experiencing issues with environment variables, our environment management system includes:

1. A structured approach to loading .env files in order of precedence:
   - `.env` (base defaults)
   - `.env.[environment]` (environment-specific defaults)
   - `.env.local` (local overrides)
   - `.env.[environment].local` (environment-specific local overrides)

2. Scripts that handle environment variable loading:
   - `scripts/setup-env.js` - General-purpose environment loader
   - `scripts/seed-with-env.js` - Specialized for database seeding

See [ENVIRONMENT_MANAGEMENT.md](./ENVIRONMENT_MANAGEMENT.md) for more details.

### Schema Changes After Deployment

For production environments, always use `prisma:migrate:deploy` instead of `prisma:migrate:dev` to avoid accidental data loss.

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js with Prisma](https://authjs.dev/reference/adapter/prisma)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
