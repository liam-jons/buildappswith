/**
 * Database Synchronization Script
 * 
 * This script helps to ensure your database schema matches the Prisma schema.
 * Run this script when you encounter schema-related errors or after schema changes.
 * 
 * Usage:
 * node scripts/sync-database.js
 */

// Load environment variables from .env files (same approach as seed.js)
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.development' });
require('dotenv').config({ path: '.env.development.local' });

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Verify DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error(`${colors.red}Error: DATABASE_URL environment variable is not set!${colors.reset}`);
  console.error(`${colors.yellow}Make sure it is defined in your .env.local file${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.bright}${colors.cyan}=== Buildappswith Database Sync Tool ===${colors.reset}\n`);
console.log(`${colors.yellow}DATABASE_URL is configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}${colors.reset}\n`);

try {
  // Step 1: Generate Prisma client
  console.log(`${colors.yellow}Step 1: Generating Prisma client...${colors.reset}`);
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Prisma client generated successfully${colors.reset}\n`);

  // Step 2: Push schema changes to the database
  console.log(`${colors.yellow}Step 2: Pushing schema changes to database...${colors.reset}`);
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Database schema updated successfully${colors.reset}\n`);

  // Step 3: Create blank migration (optional for development)
  console.log(`${colors.yellow}Step 3: Creating blank migration (dev only)...${colors.reset}`);
  try {
    execSync('npx prisma migrate dev --create-only --name sync_schema', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Migration created successfully${colors.reset}\n`);
  } catch (error) {
    console.log(`${colors.yellow}ℹ Migration step skipped - this is normal in some environments${colors.reset}\n`);
  }

  // Step 4: Suggest running the seeding process if needed
  console.log(`${colors.bright}${colors.green}Database synchronization completed!${colors.reset}`);
  console.log(`\nNext steps:`);
  console.log(`1. Run '${colors.cyan}npm run db:seed${colors.reset}' to populate the database with initial data`);
  console.log(`2. Run '${colors.cyan}npm run dev${colors.reset}' to start the development server`);
  console.log(`3. Visit ${colors.cyan}http://localhost:3000/api/dev/seed-users${colors.reset} to create test users\n`);

} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
