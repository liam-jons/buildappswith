#!/usr/bin/env node

/**
 * Create Baseline Migration Script
 * 
 * This script creates a baseline migration by treating the current database
 * state as the initial state, which resolves drift issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Creating Baseline Migration ===${colors.reset}\n`);

async function main() {
  try {
    // Step 1: Ensure schema.prisma is up to date
    console.log(`${colors.yellow}Step 1: Validating schema...${colors.reset}`);
    execSync('npx prisma validate', { stdio: 'inherit' });
    
    // Step 2: Create a baseline migration
    console.log(`\n${colors.yellow}Step 2: Creating baseline migration...${colors.reset}`);
    
    // Use prisma migrate resolve to mark the current state as baseline
    execSync('npx prisma migrate resolve --applied 0000_baseline', { stdio: 'inherit' });
    
    // Step 3: Generate a new migration that will capture any differences
    console.log(`\n${colors.yellow}Step 3: Creating reconciliation migration...${colors.reset}`);
    execSync('npx prisma migrate dev --name reconcile_schema', { stdio: 'inherit' });
    
    // Step 4: Regenerate Prisma client
    console.log(`\n${colors.yellow}Step 4: Regenerating Prisma client...${colors.reset}`);
    execSync('npx prisma generate');
    console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);
    
    console.log(`\n${colors.green}Baseline migration process complete!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Run ${colors.cyan}npm run production:check${colors.reset} to verify everything is ready`);
    console.log(`2. Commit your migration files`);
    console.log(`3. Deploy to production`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
