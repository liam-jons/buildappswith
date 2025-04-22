# Buildappswith Project Maintenance Guide

## Project Overview

Buildappswith is a platform designed to democratize AI application development through a human-centered approach. The platform connects users with verified builders while providing accessible education resources for AI literacy.

## Documentation Updates

The project documentation has been updated to reflect the latest changes and best practices:

1. **Updated Documentation**:
   - Enhanced Stripe integration documentation with deployment notes
   - Created comprehensive CI/CD pipeline documentation
   - Added required scripts documentation
   - Created Stripe troubleshooting guide

2. **New Documentation Files**:
   - `docs/CI_CD_PIPELINE.md` - Complete CI/CD workflow
   - `REQUIRED_SCRIPTS.md` - Essential scripts for development and deployment
   - `docs/STRIPE_TROUBLESHOOTING.md` - Solutions for common Stripe issues

## CI/CD Pipeline

### Branch Management Strategy

The repository uses a trunk-based development approach with two primary branches:

1. **`main`** - Production branch (stable, always deployable)
2. **`develop`** - Development branch (integration branch for features)

### Feature Branch Naming Conventions

- **`feature/[feature-name]`** - For new features
- **`bugfix/[issue-name]`** - For bug fixes
- **`hotfix/[issue-name]`** - For urgent production fixes
- **`chore/[task-name]`** - For maintenance tasks
- **`doc/[doc-name]`** - For documentation updates

### Development Workflow

1. Create a feature branch from `develop`
2. Implement changes and push to the feature branch
3. Create a pull request to `develop`
4. After review and approval, merge to `develop`
5. For production release, create a PR from `develop` to `main`

### Hotfix Process

For urgent fixes to production:

1. Create a hotfix branch from `main`
2. Implement the fix and create a PR directly to `main`
3. After the fix is merged to `main`, also merge to `develop`

## Required Scripts

For a comprehensive list of scripts, refer to `REQUIRED_SCRIPTS.md`. Key scripts include:

### Development Scripts
```bash
# Start development server
pnpm run dev

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

### Build Scripts
```bash
# Standard build
pnpm run build

# Clean build (removes cached files)
pnpm run build:clean
```

### Database Scripts
```bash
# Generate Prisma client
pnpm run prisma:generate

# Update database schema
pnpm run prisma:push

# Synchronize database
pnpm run db:sync
```

### Deployment Scripts
```bash
# Production checklist
pnpm run production:check

# Set up production database
pnpm run production:setup
```

## Deployment Error Analysis

The current deployment error:

```
Error: Neither apiKey nor config.authenticator provided
 at r._setAuthenticator (.next/server/chunks/1376.js:1:82630)
 at new r (.next/server/chunks/1376.js:1:77427)
 at 56649 (.next/server/app/api/checkout/session/route.js:1:3254)
```

### Cause

The error occurs because the Stripe client cannot be initialized due to a missing API key. The `STRIPE_SECRET_KEY` environment variable is not properly set in your deployment environment.

### Solution

1. **Add Missing Environment Variable**:
   - Go to your Vercel project settings
   - Add or update the `STRIPE_SECRET_KEY` environment variable
   - Redeploy the application

2. **Alternative Solution - Handle Missing Key Gracefully**:
   - Modify Stripe client initialization to handle missing API keys
   - Update API routes to check if Stripe is initialized before using it

For detailed instructions, refer to `docs/STRIPE_TROUBLESHOOTING.md`.

## Best Practices

1. **Environment Variables**:
   - Always set required environment variables in your deployment platform
   - Keep sensitive keys separate for each environment (dev, staging, prod)

2. **Code Quality**:
   - Run linting and type checking before committing changes
   - Ensure all tests pass before merging to main branches

3. **Database Management**:
   - Always run database synchronization scripts after schema changes
   - Verify migration status before deploying to production

4. **Branch Hygiene**:
   - Keep branches short-lived and focused on specific tasks
   - Regularly sync feature branches with `develop`
   - Delete branches after merging

5. **Deployment Verification**:
   - Verify application functionality after each deployment
   - Check for performance and security issues

## Version Management

The project uses semantic versioning (MAJOR.MINOR.PATCH):

1. Version numbers are maintained in `package.json`
2. Increment the version with each meaningful change
3. Update the CHANGELOG.md with version details

## Recommended Next Steps

1. **Fix Deployment Issue**:
   - Add the missing `STRIPE_SECRET_KEY` to your Vercel environment
   - Implement the error handling improvements from the troubleshooting guide

2. **Clean Up Branches**:
   - Remove unnecessary branches after successful synchronization
   - Keep only `main` and `develop` as permanent branches

3. **Review Documentation**:
   - Familiarize yourself with the updated documentation
   - Share relevant documentation with team members

4. **Implement CI/CD Improvements**:
   - Consider adding automated version bumping
   - Enhance testing coverage in the CI pipeline
