# Calendly Integration Migration Guide

This guide outlines the database migration process for implementing Calendly integration with the BuildAppsWith platform.

## Table of Contents

1. [Overview](#overview)
2. [Migration Details](#migration-details)
3. [Migration Scripts](#migration-scripts)
4. [Verification Process](#verification-process)
5. [Manual Migration Steps](#manual-migration-steps)
6. [Rollback Procedure](#rollback-procedure)
7. [Troubleshooting](#troubleshooting)

## Overview

The Calendly integration enhances our platform's booking capabilities by connecting with Calendly's scheduling system. This integration requires several database schema changes to store Calendly-specific information for session types and bookings.

## Migration Details

The migration adds the following fields to our database schema:

### SessionType Table
- `calendlyEventTypeId` (TEXT): Stores the Calendly event type ID
- `calendlyEventTypeUri` (TEXT): Stores the Calendly event type URI for API access

### Booking Table
- `calendlyEventId` (TEXT): Stores the Calendly event ID after booking
- `calendlyEventUri` (TEXT): Stores the Calendly event URI for API access
- `calendlyInviteeUri` (TEXT): Stores the Calendly invitee URI for API access

The migration SQL is as follows:

```sql
-- Add Calendly fields to SessionType table
ALTER TABLE "SessionType" ADD COLUMN "calendlyEventTypeId" TEXT;
ALTER TABLE "SessionType" ADD COLUMN "calendlyEventTypeUri" TEXT;

-- Add Calendly fields to Booking table
ALTER TABLE "Booking" ADD COLUMN "calendlyEventId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "calendlyEventUri" TEXT;
ALTER TABLE "Booking" ADD COLUMN "calendlyInviteeUri" TEXT;
```

## Migration Scripts

We've created several scripts to help with the migration process:

### 1. Verification Script

The `verify-calendly-migration.js` script checks if the Calendly fields have been added to the database schema and applies the migration if needed.

```bash
# Run the verification script
node scripts/verify-calendly-migration.js
```

This script will:
1. Check if the Calendly fields already exist in the database
2. Inform you if a migration is needed
3. Apply the migration if you confirm
4. Verify the migration was successful

### 2. Environment-specific Migration Script

The `apply-calendly-migration.sh` script applies the migration to a specific environment.

```bash
# Apply to development environment
./scripts/apply-calendly-migration.sh dev

# Apply to preview environment
./scripts/apply-calendly-migration.sh preview

# Apply to production environment
./scripts/apply-calendly-migration.sh prod
```

This script will:
1. Check for the proper environment configuration
2. Verify if migration is needed
3. Apply the migration if needed
4. Verify the migration was successful

## Verification Process

After running the migration, you should verify that the fields were added correctly:

1. Check the database schema directly:

```sql
-- Check SessionType table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'SessionType' 
AND column_name IN ('calendlyEventTypeId', 'calendlyEventTypeUri');

-- Check Booking table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Booking' 
AND column_name IN ('calendlyEventId', 'calendlyEventUri', 'calendlyInviteeUri');
```

2. Verify the fields are accessible in the application:

```typescript
// Example code to verify fields are accessible
async function getSessionTypeWithCalendlyFields(id: string) {
  const sessionType = await prisma.sessionType.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      // Calendly fields
      calendlyEventTypeId: true,
      calendlyEventTypeUri: true
    }
  });
  
  return sessionType;
}
```

## Manual Migration Steps

If you need to apply the migration manually:

1. Connect to your database using a PostgreSQL client
2. Run the migration SQL:

```sql
-- Add Calendly fields to SessionType table
ALTER TABLE "SessionType" ADD COLUMN IF NOT EXISTS "calendlyEventTypeId" TEXT;
ALTER TABLE "SessionType" ADD COLUMN IF NOT EXISTS "calendlyEventTypeUri" TEXT;

-- Add Calendly fields to Booking table
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calendlyEventId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calendlyEventUri" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "calendlyInviteeUri" TEXT;
```

3. Verify the fields were added correctly using the verification queries

## Rollback Procedure

If you need to roll back the migration:

1. Connect to your database using a PostgreSQL client
2. Run the rollback SQL:

```sql
-- Remove Calendly fields from SessionType table
ALTER TABLE "SessionType" DROP COLUMN IF EXISTS "calendlyEventTypeId";
ALTER TABLE "SessionType" DROP COLUMN IF EXISTS "calendlyEventTypeUri";

-- Remove Calendly fields from Booking table
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "calendlyEventId";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "calendlyEventUri";
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "calendlyInviteeUri";
```

**IMPORTANT**: Only roll back if the Calendly integration is not in use, as this will delete all Calendly-related data.

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables

If you encounter errors about missing environment variables:

```
Error: DATABASE_URL environment variable is not set!
```

Solution: Ensure your `.env` file or environment variables are properly set up with the `DATABASE_URL`.

#### 2. Permission Issues

If you encounter permission errors when running the migration:

```
ERROR: permission denied for schema public
```

Solution: Ensure the database user has ALTER privileges on the tables.

#### 3. Migration Already Applied

If some columns already exist:

```
ERROR: column "calendlyEventTypeId" of relation "SessionType" already exists
```

Solution: You can safely ignore this error, as it means the column already exists. Use the `IF NOT EXISTS` clause if applying manually.

#### 4. Database Connection Issues

If you cannot connect to the database:

```
Error: connect ECONNREFUSED
```

Solution: Verify the database connection details, ensure the database is running, and check network access.

### Getting Help

If you encounter issues not covered in this guide:

1. Run the verification script with verbose output:
   ```bash
   DEBUG=1 node scripts/verify-calendly-migration.js
   ```

2. Check the Prisma logs:
   ```bash
   DEBUG="prisma:*" npx prisma db execute --file=...
   ```

3. Contact the database administrator for assistance with database-specific issues