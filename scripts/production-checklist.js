#!/usr/bin/env node

/**
 * Production Deployment Checklist Script
 * 
 * This script verifies that all necessary configurations are in place before deployment.
 * It checks:
 * - Environment variables
 * - Database migrations
 * - Build status
 * 
 * Usage:
 * node scripts/production-checklist.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Buildappswith Production Deployment Checklist ===${colors.reset}\n`);

// Load environment files
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.production.local' });

let checksPassed = true;

// Function to check item
function checkItem(description, condition, errorMessage) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${description}`);
  } else {
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    console.log(`  ${colors.yellow}${errorMessage}${colors.reset}`);
    checksPassed = false;
  }
}

// Check 1: Environment file exists
checkItem(
  '.env.production file exists',
  fs.existsSync('.env.production'),
  'Create .env.production file with production-specific variables'
);

// Check 2: Required variables are set
const requiredVars = [
  'NODE_ENV',
  'NEXT_PUBLIC_API_URL',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_APP_ENV',
  'FEATURE_BUILDER_PROFILES'
];

requiredVars.forEach(varName => {
  checkItem(
    `${varName} is defined`,
    process.env[varName] !== undefined,
    `Add ${varName} to .env.production`
  );
});

// Check 3: Database state
try {
  // Use PRODUCTION_DATABASE_URL for production checks
  const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;
  if (prodDatabaseUrl) {
    // Prisma expects DATABASE_URL, so we pass it in the env
    execSync(`npx prisma migrate status`, { 
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
    });
    checkItem(
      'Database migrations are in sync',
      true,
      'Run npx prisma migrate dev to sync migrations'
    );
  } else {
    checkItem(
      'Database migrations are in sync',
      false,
      'PRODUCTION_DATABASE_URL not found. Run vercel env pull --environment=production .env.production.local to get production variables'
    );
  }
} catch (error) {
  checkItem(
    'Database migrations are in sync',
    false,
    'Run scripts/production-database-check.js to view details and resolve migration issues'
  );
}

// Check 4: Build test
console.log(`\n${colors.yellow}Running build test...${colors.reset}`);
try {
  execSync('npm run build', { stdio: 'pipe' });
  checkItem(
    'Build succeeds',
    true,
    'Fix build errors before deployment'
  );
} catch (error) {
  checkItem(
    'Build succeeds',
    false,
    `Fix build errors: ${error.message}`
  );
}

// Check 5: TypeScript check
try {
  execSync('npm run type-check', { stdio: 'ignore' });
  checkItem(
    'TypeScript check passes',
    true,
    'Fix TypeScript errors'
  );
} catch (error) {
  checkItem(
    'TypeScript check passes',
    false,
    'Run npm run type-check to see errors'
  );
}

// Final Summary
console.log(`\n${colors.bright}Summary:${colors.reset}`);
if (checksPassed) {
  console.log(`${colors.green}All checks passed! Ready for production deployment.${colors.reset}`);
  console.log(`\nNext steps:`);
  console.log(`1. Ensure PRODUCTION_DATABASE_URL is set in Vercel`);
  console.log(`2. Update all production environment variables in Vercel`);
  console.log(`3. Deploy to production through Vercel dashboard or CLI`);
  console.log(`4. Monitor deployment logs for any issues`);
} else {
  console.log(`${colors.red}Some checks failed. Please address the issues above before deploying.${colors.reset}`);
  process.exit(1);
}
