# Image to ImageUrl Migration Implementation Instructions

## Overview

This document contains instructions for implementing the migration from `image` to `imageUrl` field in the User model. The migration aligns the database schema with application code expectations, eliminating the need for runtime mapping.

## Prerequisites

- Make sure you have the latest code from the repository
- Ensure you have database access and permissions
- Back up your database before proceeding (if applicable)

## Implementation Steps

### 1. Apply Database Migration

Execute the migration script to rename the `image` field to `imageUrl` in the database:

```bash
# Make the script executable if needed
chmod +x scripts/apply-image-migration.js

# Run the migration script
node scripts/apply-image-migration.js
```

This script will:
- Check if the migration is needed
- Create a backup of User data
- Apply the SQL migration
- Verify the field was renamed successfully
- Generate the updated Prisma client

### 2. Update Code References

The code has been updated to use `imageUrl` instead of `image`. Key changes include:

- Removed field mapper import and usage
- Updated Prisma schema to use `imageUrl`
- Changed database queries to select `imageUrl`
- Updated logging statements

To remove the field mapper and finalize the code updates:

```bash
# Make the script executable if needed
chmod +x scripts/remove-field-mapper.js

# Run the cleanup script
node scripts/remove-field-mapper.js

# Optional: Remove the field mapper file
rm -f lib/marketplace/data/user-mapper.ts
```

### 3. Verify the Changes

Test the application to ensure everything works correctly:

```bash
# Run the development server
npm run dev

# Run tests
npm run test
```

Verification steps:
1. Navigate to the marketplace page and verify builder profiles load correctly
2. Check that builder images display properly
3. Verify no errors appear in the console or logs
4. Test any other features that use the user image field

### 4. Commit the Changes

Once you've verified everything works, commit the changes:

```bash
git add .
git commit -m "Migrate User.image field to imageUrl for schema-code alignment"
```

### 5. Documentation

Review the full migration documentation:
- `/docs/engineering/IMAGE_FIELD_MIGRATION.md`

## Rollback Procedure

If issues are encountered:

1. Execute the following SQL to reverse the change:
   ```sql
   ALTER TABLE "User" RENAME COLUMN "imageUrl" TO "image";
   ```

2. Revert the code changes or restore the field mapper utility

## Contact

If you encounter any issues during implementation, contact [Your Name] for assistance.