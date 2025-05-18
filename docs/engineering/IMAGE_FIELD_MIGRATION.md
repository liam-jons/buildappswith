# Image Field Migration Guide

This document provides step-by-step instructions for migrating the User model's `image` field to `imageUrl` to align the database schema with application code expectations.

## Background

The application was experiencing issues due to a mismatch between the database schema (`image` field) and application code expectations (`imageUrl` field). A temporary field mapper was implemented as a workaround, but this introduced runtime overhead.

## Migration Overview

The migration involves:
1. Updating the Prisma schema to rename the field
2. Creating and applying a database migration
3. Removing the field mapper utility
4. Updating code references

## Prerequisites

- Local development environment with access to the database
- Permission to run migrations
- Backup of the database (if applicable)
- Application running without errors before proceeding

## Step 1: Update Prisma Schema

The Prisma schema has been updated to change the field name from `image` to `imageUrl`:

```prisma
model User {
  id               String          @id @default(cuid())
  name             String?
  email            String          @unique
  emailVerified    DateTime?
  imageUrl         String?         // Renamed from 'image'
  isFounder        Boolean         @default(false)
  // ... other fields ...
}
```

## Step 2: Create Migration File

A migration SQL file has been created at:
```
/prisma/migrations/rename_image_to_imageurl.sql
```

With the following contents:
```sql
-- Rename image field to imageUrl in User table
ALTER TABLE "User" RENAME COLUMN "image" TO "imageUrl";
```

## Step 3: Apply the Migration

To apply the migration, run:

```bash
node scripts/apply-image-migration.js
```

This script:
- Checks database connection
- Verifies current schema state
- Creates a backup of User table data
- Applies the migration
- Verifies successful field renaming
- Generates an updated Prisma client

## Step 4: Update Code References

The following files have been updated to reference `imageUrl` instead of `image`:

1. `/lib/marketplace/data/marketplace-service.ts`
   - Removed import of `mapUserFields`
   - Changed all references to `image` to `imageUrl`
   - Removed field mapping logic
   - Updated logging statements

2. (Additional files as necessary)

## Step 5: Remove Field Mapper

The field mapper utility can now be safely removed:

```bash
node scripts/remove-field-mapper.js
```

This script:
- Updates any remaining references to the mapper
- Checks for lingering SQL queries that might need updating
- Runs tests to verify functionality

## Verification

To verify the migration:

1. Run the application locally
2. Access the marketplace page
3. Verify that builder profiles and images display correctly
4. Verify that no errors related to `image` or `imageUrl` appear in the logs

## Rollback Procedure

If issues are encountered:

1. Run the following SQL to revert the change:
   ```sql
   ALTER TABLE "User" RENAME COLUMN "imageUrl" TO "image";
   ```

2. Revert code changes or restore the field mapper utility

## Migration Impact

This migration:
- Aligns database schema with code expectations
- Removes runtime overhead from field mapping
- Simplifies the codebase by removing adapter patterns
- Improves code maintainability

## Future Considerations

- Continue to align schema and code naming conventions
- Consider creating naming standards for database fields
- Review other potential schema-code mismatches