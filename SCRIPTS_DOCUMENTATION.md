# Scripts Documentation

This document provides a comprehensive overview of all scripts in the Buildappswith project. Scripts are categorized by their function and purpose.

## Database Migration Scripts

### Active and Required
1. **`scripts/production-database-check.js`**
   - Purpose: Comprehensive check of production database state
   - Use Case: Run before deployments to verify database integrity
   - Status: KEEP - Essential for production deployment checks

2. **`scripts/production-checklist.js`**
   - Purpose: Pre-deployment production checklist
   - Use Case: Ensures all requirements are met before deploying
   - Status: KEEP - Critical for safe deployments

3. **`scripts/init-production-database.js`**
   - Purpose: Initialize production database with proper migrations
   - Use Case: First-time setup of production database
   - Status: KEEP - Essential for new production environments

4. **`scripts/check-migration-status.js`**
   - Purpose: Check current migration status
   - Use Case: Debugging migration issues
   - Status: KEEP - Useful for troubleshooting

5. **`scripts/debug-migration-check.js`**
   - Purpose: Detailed migration debugging information
   - Use Case: Deep investigation of migration problems
   - Status: KEEP - Valuable for complex migration issues

6. **`scripts/sync-database.js`**
   - Purpose: Synchronize development and production databases
   - Use Case: Keeping environments in sync
   - Status: KEEP - Important for development workflow

7. **`scripts/sync-dev-prod-databases.js`**
   - Purpose: Database synchronization check between dev and prod
   - Use Case: Ensuring environments are aligned
   - Status: KEEP - Important for maintaining consistency

### Historical Migration Fix Scripts (Still present but may be removed once stable)
1. **`scripts/fix-migration-drift.js`** - Previous migration drift fixes
2. **`scripts/fix-social-links-drift.js`** - Specific fix for social links column
3. **`scripts/fix-duplicate-migrations.js`** - Resolved duplicate migration issues
4. **`scripts/investigate-social-links.js`** - Investigation script for column issues
5. **`scripts/diagnose-migration-drift.js`** - Diagnostic tool for migration drift
6. **`scripts/create-baseline-migration.js`** - One-time baseline migration creation
7. **`scripts/reconcile-migrations.js`** - Migration reconciliation tool
8. **`scripts/fix-migration-sync.js`** - Migration sync fixes
9. **`scripts/check-migration-history.js`** - Migration history check

## Build and Deployment Scripts

### Active and Required
1. **`scripts/fix-build-issues.js`**
   - Purpose: Resolves common build issues
   - Use Case: Troubleshooting build failures
   - Status: KEEP - Useful for build problem solving

2. **`scripts/deploy.sh`**
   - Purpose: Deployment automation script
   - Use Case: Streamlining deployment process
   - Status: KEEP - Important for deployment workflow

3. **`test-build.sh`** (located in project root - to be moved to scripts)
   - Purpose: Local build testing
   - Use Case: Verifying build before pushing
   - Status: KEEP - Critical for CI/CD workflow

## Database Seeding Scripts

### Active and Required
1. **`scripts/seed-db.js`**
   - Purpose: Seeds the database with initial data
   - Use Case: Development and testing
   - Status: KEEP - Essential for development

2. **`scripts/seed-with-env.js`**
   - Purpose: Environment-aware seeding
   - Use Case: Different seed data per environment
   - Status: KEEP - Important for flexible seeding

## Type and Code Fix Scripts

### Active and Required
1. **`scripts/fix-prisma-types.js`**
   - Purpose: Fixes TypeScript type issues with Prisma
   - Use Case: Resolving type conflicts
   - Status: KEEP - Necessary for type safety

2. **`scripts/check-typescript-fixes.js`**
   - Purpose: Checks TypeScript errors
   - Use Case: Pre-commit type checking
   - Status: KEEP - Important for maintaining type safety

3. **`scripts/fix-tailwind.sh`**
   - Purpose: Fixes Tailwind configuration issues
   - Use Case: Resolving CSS conflicts
   - Status: KEEP - Useful for styling issues

## Environment Setup Scripts

### Active and Required
1. **`scripts/setup-production-db.js`**
   - Purpose: Production database configuration
   - Use Case: Setting up production environment
   - Status: KEEP - Critical for production setup

## Diagnostic and Check Scripts

### Active and Required
1. **`scripts/check-current-status.js`**
   - Purpose: Current project status check
   - Use Case: Quick status overview
   - Status: KEEP - Useful for debugging

2. **`scripts/diagnose-database-state.js`**
   - Purpose: Database state diagnosis
   - Use Case: Deep database investigation
   - Status: KEEP - Important for troubleshooting

3. **`scripts/check-final.js`**
   - Purpose: Final checks before deployment
   - Use Case: Last-minute verification
   - Status: KEEP - Part of deployment process

4. **`scripts/check-git-branches.js`**
   - Purpose: Checks git branch alignment
   - Use Case: Ensuring develop and main are in sync
   - Status: KEEP - Important for source control

## Subdirectories

### Active and Required
1. **`scripts/seed-data/`**
   - Purpose: Contains seed data files
   - Use Case: Database seeding data
   - Status: KEEP - Required for seeding functionality

## Quick Reference by Category

### Essential Production Scripts
- `production-database-check.js`
- `production-checklist.js`
- `init-production-database.js`
- `setup-production-db.js`
- `deploy.sh`

### Development Scripts
- `seed-db.js`
- `seed-with-env.js`
- `sync-database.js`
- `sync-dev-prod-databases.js`
- `fix-build-issues.js`
- `fix-tailwind.sh`

### Type and Build Check Scripts
- `fix-prisma-types.js`
- `check-typescript-fixes.js`
- `test-build.sh`

### Diagnostic Scripts
- `check-migration-status.js`
- `debug-migration-check.js`
- `check-current-status.js`
- `diagnose-database-state.js`
- `check-final.js`
- `check-git-branches.js`

## Usage Guidelines

1. **Before Deployment**: Always run `production-checklist.js` and `production-database-check.js`
2. **Database Issues**: Use diagnostic scripts in this order: `check-current-status.js`, `check-migration-status.js`, `debug-migration-check.js`
3. **Build Problems**: Run `fix-build-issues.js` first, then specific fix scripts as needed
4. **Development Setup**: Use `setup-env.js` followed by `seed-db.js` for initial setup
5. **Environment Sync**: Use `sync-dev-prod-databases.js` to ensure databases are aligned

## Maintenance Notes

1. **Regular Updates**: Update scripts as the project evolves
2. **Documentation**: Keep this document in sync with script changes
3. **Cleanup**: Regularly review and remove obsolete scripts
4. **Migration Scripts**: Once the project is stable, historical migration fix scripts can be archived or removed
