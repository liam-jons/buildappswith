# Calendly Integration & Import Standardization

This project contains scripts and documentation for two key tasks:

1. Calendly integration database migration
2. Import standardization across the codebase

## Calendly Integration

The Calendly integration enhances our platform's booking capabilities by connecting with Calendly's scheduling system.

### Key Components

- **Database Migration**: Added Calendly-specific fields to database schema
- **Migration Verification**: Scripts to check and apply migrations safely
- **Documentation**: Comprehensive guide for the migration process

### How to Use

1. **Verify and Apply Migration**:

```bash
# Check and apply Calendly migration
npm run fix:calendly-migration

# Apply to specific environment
npm run apply:calendly-migration dev  # or preview, prod
```

2. **Database Schema Changes**:

- SessionType Table: Added `calendlyEventTypeId` and `calendlyEventTypeUri`
- Booking Table: Added `calendlyEventId`, `calendlyEventUri`, and `calendlyInviteeUri`

## Import Standardization

The import standardization tools ensure consistent import patterns across the codebase.

### Key Features

- **Import Analysis**: Detect non-standard imports
- **Automated Fixes**: Convert direct imports to barrel imports
- **Barrel Export Analysis**: Ensure barrel files properly export all components
- **Pre-commit Hook**: Enforce standards automatically on commit
- **Documentation**: Comprehensive import standards guide

### How to Use

1. **Check Import Standards**:

```bash
# Analyze imports without making changes
npm run check:imports

# Fix non-standard imports
npm run fix:imports
```

2. **Analyze and Fix Barrel Exports**:

```bash
# Check if all components are exported in barrel files
npm run analyze:barrels

# Fix missing exports
npm run fix:barrels
```

3. **Pre-commit Hook**:

A pre-commit hook is set up to automatically check and fix imports before each commit.

## Documentation

Comprehensive documentation has been created for these features:

- **[CALENDLY_MIGRATION_GUIDE.md](./CALENDLY_MIGRATION_GUIDE.md)**: Details on the Calendly integration migration
- **[IMPORT_STANDARDIZATION.md](./IMPORT_STANDARDIZATION.md)**: Guide to import standards and tools

## Scripts

### Calendly Integration

- **verify-calendly-migration.js**: Checks and applies Calendly database migration
- **apply-calendly-migration.sh**: Environment-specific migration script

### Import Standardization

- **standardize-imports.js**: Analyzes and fixes non-standard imports
- **analyze-barrel-exports.js**: Checks barrel files for missing exports
- **pre-commit-import-check.js**: Pre-commit hook for import standards enforcement

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the import standardization tools:

```bash
# Analyze import patterns
npm run check:imports

# Fix non-standard imports
npm run fix:imports
```

3. Apply the Calendly migration:

```bash
# Verify and apply Calendly migration
npm run fix:calendly-migration
```

## Next Steps

1. **CI Integration**: Add import checks to CI pipeline
2. **Further Import Improvements**: Extend standardization to test files
3. **Add Validation**: Add validation for Calendly data in the API
4. **Monitoring**: Set up monitoring for Calendly integration points