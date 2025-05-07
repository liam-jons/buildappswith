# Build Apps With Platform - Database Migration and Import Standardization

## Session Context

- **Project**: Build Apps With Platform
- **Current Focus**: Database migrations for Calendly integration and codebase import standardization
- **Prior Work**: Successfully implemented the Calendly integration and booking flow but encountered build issues due to incorrect import paths
- **Current Branch**: feature/calendly-integration-prod

## Part 1: Database Migration Verification and Application

The first objective is to verify and apply the necessary database migrations for the Calendly integration. During our previous work, we identified migration files that need to be properly applied.

### Tasks:

1. **Database Migration Investigation**:
   - Examine the current database schema to verify if Calendly columns are already present
   - Review migration status using Prisma CLI
   - Check existing migrations in the `/prisma/migrations` directory and specifically `add_calendly_fields.sql`

2. **Apply Missing Migrations**:
   - Develop a verification script to safely check if migrations need to be applied
   - Create a migration application script that handles potential errors
   - Test the migration in development before applying to staging/production
   - Document any migration issues or edge cases encountered

3. **Database Schema Verification**:
   - Ensure `SessionType` table has `calendlyEventTypeId` and `calendlyEventTypeUri` columns
   - Verify `Booking` table has `calendlyEventId`, `calendlyEventUri`, and `calendlyInviteeUri` columns
   - Validate data types and constraints for the new columns
   - Test with sample data to ensure the schema works as expected

## Part 2: Import Standardization Tool Development

The second objective is to create tools for standardizing imports throughout the codebase, focusing especially on barrel imports/exports.

### Tasks:

1. **Barrel Import Analysis**:
   - Create a comprehensive script to scan the codebase for non-standard import patterns
   - Focus on detecting direct imports of UI components instead of using barrel files
   - Check consistency between barrel export files and their actual usage
   - Generate a detailed report of files needing updates

2. **Standardization Tool Development**:
   - Build an interactive CLI tool that:
     - Shows proposed changes for each file
     - Allows reviewing and confirming/rejecting changes individually
     - Generates a preview of what each file will look like after changes
     - Provides options for batch processing files by directory

3. **Automated Fix Script**:
   - Enhance our initial `fix-ui-imports.js` script to:
     - Handle more complex import patterns
     - Process exports in barrel files for consistency
     - Include validation testing before and after changes
     - Support command-line options for different modes (analyze, preview, fix)

4. **Documentation and Guidelines**:
   - Create a comprehensive guide for import/export patterns
   - Document the standardization tools with usage examples
   - Develop a pre-commit hook script to enforce standards for new code
   - Update CONTRIBUTING.md with the recommended import practices

## Technical Context

### Database Migration Details:
The migration file `add_calendly_fields.sql` contains:
```sql
-- Add Calendly fields to SessionType table
ALTER TABLE "SessionType" ADD COLUMN "calendlyEventTypeId" TEXT;
ALTER TABLE "SessionType" ADD COLUMN "calendlyEventTypeUri" TEXT;

-- Add Calendly fields to Booking table
ALTER TABLE "Booking" ADD COLUMN "calendlyEventId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "calendlyEventUri" TEXT;
ALTER TABLE "Booking" ADD COLUMN "calendlyInviteeUri" TEXT;
```

### Import Pattern Issues:
The most common import issues relate to:
1. Direct component imports instead of using barrel files:
   - Incorrect: `import { Button } from "@/components/ui/button";`
   - Correct: `import { Button } from "@/components/ui";`

2. Inconsistent export patterns in barrel files:
   - Need to standardize on either named exports or default exports
   - Ensure index.ts files properly re-export all components

3. Duplicate components in different directories:
   - For example, ValidationTierBadge existed in both profile and trust directories
   - Standardize on the trust version: `import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";`

### Build and Testing Procedures:
- All changes should be validated with `pnpm build` to ensure the application compiles
- The import standardization should not change any functionality
- Manual testing of affected components should be performed to verify rendering
- Database migrations should be tested in a development environment before applying to production

## Expected Deliverables

1. A robust database migration verification and application script
2. A comprehensive import analysis tool to identify non-standard imports
3. An interactive tool for reviewing and applying import standardization
4. Documentation on import standards and tool usage
5. Pre-commit hooks to enforce standards going forward

This work will significantly improve codebase maintainability, build reliability, and onboarding experience for new developers.