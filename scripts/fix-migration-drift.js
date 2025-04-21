#!/usr/bin/env node

/**
 * Fix Migration Drift Script
 * 
 * This script fixes the migration drift in production database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.production.local' });
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

console.log(`${colors.bright}${colors.cyan}=== Fix Migration Drift ===${colors.reset}\n`);

// Use PRODUCTION_DATABASE_URL as the primary variable name
const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error(`${colors.red}Error: PRODUCTION_DATABASE_URL not found.${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.yellow}Using PRODUCTION_DATABASE_URL${colors.reset}`);
console.log(`Database: ${prodDatabaseUrl.split('@')[1].split('/')[1]}\n`);

async function fixMigrationDrift() {
  try {
    // Step 1: Reset local migrations to clean state
    console.log(`${colors.yellow}1. Checking local migrations...${colors.reset}`);
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    const fileMigrations = fs.readdirSync(migrationsDir)
      .filter(dir => dir.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, dir)).isDirectory())
      .sort();
    
    console.log(`Found migrations:`, fileMigrations.join(', '));
    
    // Step 2: Apply migrations to production
    console.log(`\n${colors.yellow}2. Applying migrations to production...${colors.reset}`);
    try {
      const output = execSync(`npx prisma migrate deploy`, {
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
      });
      console.log(output);
      console.log(`${colors.green}✓ Migrations applied successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error applying migrations:${colors.reset}`);
      console.error(error.message);
      if (error.stdout) console.log(error.stdout.toString());
      if (error.stderr) console.error(error.stderr.toString());
      throw error;
    }
    
    // Step 3: Verify the migration status
    console.log(`\n${colors.yellow}3. Verifying migration status...${colors.reset}`);
    try {
      const statusOutput = execSync(`npx prisma migrate status`, {
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
      });
      console.log(statusOutput);
      
      if (statusOutput.includes('Database schema is up to date')) {
        console.log(`${colors.green}✓ Database is in sync${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Database may still have issues${colors.reset}`);
      }
    } catch (error) {
      if (error.status === 1 && error.stdout) {
        console.log(error.stdout.toString());
      } else {
        console.error(`${colors.red}Error checking status:${colors.reset}`);
        console.error(error.message);
      }
    }
    
    // Step 4: Check if socialLinks column exists
    console.log(`\n${colors.yellow}4. Verifying socialLinks column...${colors.reset}`);
    try {
      const query = `SELECT column_name 
                     FROM information_schema.columns 
                     WHERE table_name = 'BuilderProfile' AND column_name = 'socialLinks';`;
      
      const result = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query,
        encoding: 'utf8'
      });
      
      if (result.includes('socialLinks')) {
        console.log(`${colors.green}✓ socialLinks column exists${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ socialLinks column not found${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking for socialLinks: ${error.message}${colors.reset}`);
    }
    
    console.log(`\n${colors.green}${colors.bright}✓ Migration drift fix completed${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Run ${colors.yellow}node scripts/production-database-check.js${colors.reset} to verify`);
    console.log(`2. If everything looks good, proceed with deployment`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

fixMigrationDrift();
