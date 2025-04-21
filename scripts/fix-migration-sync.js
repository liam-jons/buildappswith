#!/usr/bin/env node

/**
 * Fix Migration Sync Script
 * 
 * This script comprehensively handles migration sync issues by:
 * 1. Diagnosing the problem
 * 2. Creating a baseline migration if needed
 * 3. Ensuring everything is properly synced
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log(`${colors.bright}${colors.cyan}=== Fixing Migration Sync Issues ===${colors.reset}\n`);

  try {
    // Step 1: Check current migration status
    console.log(`${colors.yellow}Step 1: Checking current migration status...${colors.reset}`);
    let hasDrift = false;
    
    try {
      execSync('npx prisma migrate status', { stdio: 'pipe' });
      console.log(`${colors.green}✓ No drift detected${colors.reset}`);
    } catch (error) {
      hasDrift = true;
      console.log(`${colors.yellow}⚠ Drift detected${colors.reset}`);
    }

    if (!hasDrift) {
      console.log(`\n${colors.green}No migration issues found!${colors.reset}`);
      rl.close();
      return;
    }

    // Step 2: Ask user to confirm they want to proceed
    console.log(`\n${colors.yellow}Migration drift detected. This script will create a baseline migration to fix the issue.${colors.reset}`);
    const proceed = await question(`Continue? (y/n): `);
    
    if (proceed.toLowerCase() !== 'y') {
      console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
      rl.close();
      return;
    }

    // Step 3: Create baseline migration
    console.log(`\n${colors.yellow}Step 2: Creating baseline migration...${colors.reset}`);
    
    // First, reset the database to a known state
    const resetConfirm = await question(`${colors.red}This will reset your database and create a baseline. ALL DATA WILL BE LOST. Continue? (y/n): ${colors.reset}`);
    
    if (resetConfirm.toLowerCase() !== 'y') {
      console.log(`${colors.yellow}Operation cancelled.${colors.reset}`);
      rl.close();
      return;
    }

    // Reset and create baseline
    console.log(`\n${colors.yellow}Resetting database and creating baseline...${colors.reset}`);
    
    try {
      // Delete all existing migrations except migration_lock.toml
      const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
      const migrations = fs.readdirSync(migrationsDir)
        .filter(dir => dir.match(/^\d+_/));
      
      migrations.forEach(migration => {
        const migrationPath = path.join(migrationsDir, migration);
        fs.rmSync(migrationPath, { recursive: true, force: true });
        console.log(`Removed migration: ${migration}`);
      });

      // Reset the database
      execSync('npx prisma migrate reset --force', { stdio: 'ignore' });
      
      // Create baseline migration
      execSync('npx prisma migrate dev --name baseline_production --skip-seed');
      console.log(`${colors.green}✓ Baseline migration created${colors.reset}`);
      
      // Regenerate Prisma client
      execSync('npx prisma generate');
      console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);
      
    } catch (error) {
      console.error(`${colors.red}Error during baseline creation: ${error.message}${colors.reset}`);
      rl.close();
      return;
    }

    // Step 4: Verify everything is now in sync
    console.log(`\n${colors.yellow}Step 3: Verifying migrations are now in sync...${colors.reset}`);
    
    try {
      execSync('npx prisma migrate status', { stdio: 'inherit' });
      console.log(`\n${colors.green}✓ Migrations are now in sync!${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Still not in sync. Please review the error above.${colors.reset}`);
    }

    console.log(`\n${colors.green}Migration sync process complete!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Run ${colors.cyan}npm run db:seed${colors.reset} to repopulate your development database`);
    console.log(`2. Run ${colors.cyan}npm run production:check${colors.reset} to verify everything is ready`);
    console.log(`3. Commit your migration files and deploy`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

main();
