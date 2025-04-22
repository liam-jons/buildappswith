# Required Scripts for Buildappswith Platform

This document outlines the essential scripts that should be run at various stages of development, deployment, and maintenance.

## Pre-Commit Scripts

Run these scripts before committing changes to ensure code quality:

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Test
pnpm run test:verify
```

## Build Testing Scripts

Run these scripts to verify your build locally before pushing:

```bash
# Clean build (removes cached files)
pnpm run build:clean

# Production build with analysis
pnpm run build:analyze
```

## Database Management Scripts

Run these scripts when working with the database:

```bash
# Generate Prisma client
pnpm run prisma:generate

# Update database schema
pnpm run prisma:push

# Open Prisma Studio for database inspection
pnpm run prisma:studio

# Seed the database with initial data
pnpm run db:seed

# Synchronize database
pnpm run db:sync
```

## Deployment Verification Scripts

Run these scripts before and during deployment:

```bash
# Production checklist
pnpm run production:check

# Set up production database
pnpm run production:setup

# Check migration status
pnpm run check:migrations
```

## Troubleshooting Scripts

Run these scripts when encountering issues:

```bash
# Fix Tailwind CSS issues
pnpm run fix-tailwind

# Fix schema drift issues
pnpm run fix:drift

# Fix migration synchronization issues
pnpm run fix:migrations

# Reconcile migrations
pnpm run reconcile:migrations
```

## Script Execution Order for Common Scenarios

### 1. Initial Development Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm run prisma:generate

# Update database schema
pnpm run prisma:push

# Seed database
pnpm run db:seed

# Start development server
pnpm run dev
```

### 2. Pre-Push Code Quality Check

```bash
# Lint code
pnpm run lint

# Type check
pnpm run type-check

# Run tests
pnpm run test

# Verify build
pnpm run build
```

### 3. Deployment to Production

```bash
# Run production checklist
pnpm run production:check

# Check migrations
pnpm run check:migrations

# Build application
pnpm run build

# Deploy (if using manual deployment)
./scripts/deploy.sh
```

## Critical Scripts for Common Issues

### Fixing Tailwind Issues

If you encounter styling issues or Tailwind configuration problems:

```bash
pnpm run fix-tailwind
```

This script:
- Ensures the correct Tailwind CSS version is installed
- Fixes configuration issues
- Cleans build artifacts for a fresh build

### Database Migration Issues

If you encounter database migration issues:

```bash
# Check migration status
pnpm run check:migrations

# If issues are found, fix migrations
pnpm run fix:migrations

# For complex issues, reconcile migrations
pnpm run reconcile:migrations
```

### Build Failures

If the build fails:

```bash
# Clean build cache
pnpm run build:clean

# Try full clean
pnpm run build:clean:full
```

## Automation Scripts

These scripts can be run automatically by CI/CD pipelines:

```bash
# CI/CD build
pnpm run build

# CI/CD tests
pnpm run test:ci

# Database synchronization
pnpm run db:sync
```

## Script Documentation

For more detailed information about all available scripts, refer to [SCRIPTS_DOCUMENTATION.md](./SCRIPTS_DOCUMENTATION.md).
