#!/usr/bin/env node

/**
 * Debug Migration Check Script
 * 
 * This script helps diagnose why the production check thinks migrations are not in sync
 * when they actually appear to be.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production' });  // Load production env
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

console.log(`${colors.bright}${colors.cyan}=== Debugging Migration Check ===${colors.reset}\n`);

try {
  // Test 1: Check migration status with visible output
  console.log(`${colors.yellow}Test 1: Running prisma migrate status with visible output...${colors.reset}`);
  try {
    execSync('npx prisma migrate status', { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ No errors from migrate status${colors.reset}`);
  } catch (error) {
    console.log(`\n${colors.red}✗ Migrate status threw an error${colors.reset}`);
  }

  // Test 2: Check with specific command used in production check
  console.log(`\n${colors.yellow}Test 2: Running the exact command from production check...${colors.reset}`);
  try {
    execSync('npx prisma migrate status', { stdio: 'ignore' });
    console.log(`${colors.green}✓ Command succeeded (no error)${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Command failed (this is what production check sees)${colors.reset}`);
    // Try to get more info about the error
    try {
      const output = execSync('npx prisma migrate status 2>&1', { stdio: 'pipe' }).toString();
      console.log(`${colors.yellow}Error output:${colors.reset}`);
      console.log(output);
    } catch (detailError) {
      console.log(`${colors.yellow}Error details:${colors.reset}`);
      console.log(detailError.stdout?.toString() || detailError.message);
    }
  }

  // Test 3: Check if there's a difference in environments
  console.log(`\n${colors.yellow}Test 3: Checking environment differences...${colors.reset}`);
  console.log(`DATABASE_URL is set: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  
  // Test 4: Check for pending migrations
  console.log(`\n${colors.yellow}Test 4: Checking for pending migrations...${colors.reset}`);
  try {
    const pendingOutput = execSync('npx prisma migrate status --exit-code', { stdio: 'pipe' }).toString();
    console.log(`${colors.green}✓ No pending migrations${colors.reset}`);
  } catch (error) {
    if (error.status === 1) {
      console.log(`${colors.yellow}⚠ Pending migrations or drift detected${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ Unexpected error checking pending migrations${colors.reset}`);
    }
  }

  // Test 5: Check specific production settings
  console.log(`\n${colors.yellow}Test 5: Checking production-specific settings...${colors.reset}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`${colors.yellow}NODE_ENV is set to production${colors.reset}`);
    console.log(`Production DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
  } else {
    console.log(`NODE_ENV is not set to production (currently: ${process.env.NODE_ENV || 'undefined'})`);
  }

} catch (error) {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
