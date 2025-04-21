#!/usr/bin/env node

/**
 * Database Synchronization Script
 * 
 * Ensures development and production databases are aligned
 */

const { execSync } = require('child_process');

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

console.log(`${colors.bright}${colors.cyan}=== Database Synchronization Check ===${colors.reset}\n`);

const devDatabaseUrl = process.env.DATABASE_URL;
const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!devDatabaseUrl || !prodDatabaseUrl) {
  console.error(`${colors.red}Error: Both DATABASE_URL and PRODUCTION_DATABASE_URL must be set.${colors.reset}`);
  process.exit(1);
}

async function checkSync() {
  try {
    // Step 1: Check development database migrations
    console.log(`${colors.yellow}1. Checking development database migrations...${colors.reset}`);
    try {
      const devStatus = execSync(`npx prisma migrate status`, {
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: devDatabaseUrl }
      });
      console.log(devStatus);
    } catch (error) {
      console.log(`${colors.red}Development migration check failed${colors.reset}`);
      console.log(error.stdout?.toString() || error.message);
    }
    
    // Step 2: Check production database migrations
    console.log(`\n${colors.yellow}2. Checking production database migrations...${colors.reset}`);
    try {
      const prodStatus = execSync(`npx prisma migrate status`, {
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
      });
      console.log(prodStatus);
    } catch (error) {
      console.log(`${colors.red}Production migration check failed${colors.reset}`);
      console.log(error.stdout?.toString() || error.message);
    }
    
    // Step 3: Compare schemas
    console.log(`\n${colors.yellow}3. Comparing schemas...${colors.reset}`);
    try {
      const diff = execSync(`npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-url="${prodDatabaseUrl}" --script`, {
        encoding: 'utf8'
      });
      
      if (diff.trim() === '' || diff.includes('No difference detected') || diff.includes('This is an empty migration')) {
        console.log(`${colors.green}✓ Databases are in sync${colors.reset}`);
      } else {
        console.log(`${colors.yellow}Schema differences found:${colors.reset}`);
        console.log(diff);
      }
    } catch (error) {
      console.log(`${colors.red}Schema comparison failed${colors.reset}`);
      console.log(error.message);
    }
    
    // Step 4: If not in sync, provide recommendations
    console.log(`\n${colors.yellow}4. Recommendations:${colors.reset}`);
    console.log(`If databases are not in sync:`);
    console.log(`1. For development: npx prisma migrate dev`);
    console.log(`2. For production: DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate deploy`);
    console.log(`3. Always test changes in development first`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

checkSync();
