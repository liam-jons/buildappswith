# Environment Management

This document outlines the environment variable management system for the Buildappswith platform.

## Overview

Buildappswith uses a hierarchical environment variable system that supports different environments (development, production, staging) while maintaining ease of use and security.

## Environment Files

The system uses several environment files in order of precedence (lowest to highest):

1. `.env` - Base defaults for all environments
2. `.env.[environment]` - Environment-specific defaults (e.g., `.env.development`)
3. `.env.local` - Local overrides for all environments (not committed to version control)
4. `.env.[environment].local` - Local overrides for specific environments (not committed)

## Required Environment Variables

The following environment variables are required for the platform to function properly:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js authentication
- `NEXTAUTH_URL` - URL for NextAuth.js callbacks

For development, these should be defined in your `.env.local` file.

## Environment Loading Scripts

The platform includes specialized scripts for handling environment variables:

### 1. General-Purpose Environment Loader

`scripts/setup-env.js` is a versatile script that:
- Loads environment variables from appropriate files
- Verifies critical variables are set
- Can run commands with the properly loaded environment

```bash
# Check environment variables
pnpm env:check

# Run a command with properly loaded environment variables
node scripts/setup-env.js [command]
```

### 2. Database Seeding Environment Loader

`scripts/seed-with-env.js` is specialized for database seeding:
- Loads environment variables with proper precedence
- Initializes Prisma client after environment is loaded
- Handles the complete seeding process

```bash
# Run database seeding with environment handling
pnpm db:seed
```

## Best Practices for Environment Variables

### 1. Loading Order

Our scripts load environment variables in the following order:
```javascript
// Files loaded in order (lowest to highest priority)
const envFiles = [
  '.env',                    // Base defaults
  `.env.${NODE_ENV}`,        // Environment-specific defaults
  '.env.local',              // Local overrides
  `.env.${NODE_ENV}.local`,  // Environment-specific local overrides
];
```

### 2. Verifying Required Variables

Always verify critical variables are set:
```javascript
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set!');
  process.exit(1);
}
```

### 3. Debugging Environment Issues

For environment-related issues:
```bash
# Check environment configuration
pnpm env:check

# Add DEBUG=true for more verbose output
DEBUG=true pnpm env:check
```

## Using Environment Variables in Code

### In Next.js Components and Pages

```javascript
// For server-side and client-side variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// For server-side only variables
const dbUrl = process.env.DATABASE_URL;
```

### In API Routes

```javascript
// In app/api/example/route.ts
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  // Use environment variables in your API logic
}
```

### In Prisma Scripts

For scripts that use Prisma, make sure to load environment variables before initializing the client:

```javascript
// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Then initialize Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
```

## Environment-Specific Variables

### Development (`.env.development`)
- `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXTAUTH_URL=http://localhost:3000`

### Production (`.env.production`)
- Production-specific variables are managed through the deployment platform (Vercel)

## Adding New Environment Variables

When adding new environment variables:

1. Add the variable to the appropriate environment file(s)
2. If it's critical, add it to the `criticalVars` array in `scripts/setup-env.js`
3. Document the variable in this file
4. Consider if the variable should be included in `.env.example` for other developers

## Troubleshooting

Common environment-related issues and solutions:

### Database Connection Issues

**Symptom**: Errors related to missing DATABASE_URL when running Prisma commands.

**Solution**: 
1. Verify that DATABASE_URL is properly defined in your `.env.local` file
2. Make sure the URL format is correct: `postgresql://username:password@host:port/database?sslmode=require`
3. Use `pnpm db:seed` instead of direct Prisma commands to ensure proper environment loading

### Environment Variables Not Loading

**Symptom**: Environment variables defined in `.env` files are not accessible in the application.

**Solution**:
1. Check the file naming and location (root of project)
2. Verify variable syntax (no spaces around `=`)
3. Restart the development server after changes
4. Use `pnpm env:check` to debug which variables are being loaded

### NextAuth Configuration Issues

**Symptom**: Authentication errors or redirects not working properly.

**Solution**:
1. Ensure NEXTAUTH_URL is set to the correct base URL of your application
2. Verify NEXTAUTH_SECRET is set and is a secure random string
3. Restart the development server after changes

## Environment Setup in CI/CD

For continuous integration and deployment:

1. **Vercel**: Use the Vercel UI to set environment variables
2. **GitHub Actions**: Use GitHub Secrets and environment files
3. **Other CI/CD**: Create appropriate environment files during the build process

Ensure sensitive variables are never committed to version control.
