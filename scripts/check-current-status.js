#!/usr/bin/env node

/**
 * Check Current Migration Status Script
 * 
 * Shows the exact current state of migrations before we make any changes
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

const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error(`${colors.red}Error: PRODUCTION_DATABASE_URL not found.${colors.reset}`);
  process.exit(1);
}

// 1. List local migrations
console.log(`${colors.cyan}=== Local Migrations ===${colors.reset}`);
const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
const fileMigrations = fs.readdirSync(migrationsDir)
  .filter(dir => dir.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, dir)).isDirectory())
  .sort();
console.log(`Found ${fileMigrations.length} migrations:`);
fileMigrations.forEach(m => console.log(`  - ${m}`));

// 2. Check production migration status
console.log(`\n${colors.cyan}=== Production Database Status ===${colors.reset}`);
try {
  const statusOutput = execSync(`DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate status`, {
    encoding: 'utf8',
    env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
  });
  console.log(statusOutput);
} catch (error) {
  console.log(error.stdout?.toString() || error.message);
}

// 3. Check for socialLinks column
console.log(`\n${colors.cyan}=== Checking for socialLinks Column ===${colors.reset}`);
try {
  const query = `SELECT column_name, data_type 
                 FROM information_schema.columns 
                 WHERE table_name = 'BuilderProfile' AND column_name = 'socialLinks';`;
  
  const result = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
    input: query,
    encoding: 'utf8'
  });
  
  if (result.includes('socialLinks')) {
    console.log(`${colors.green}✓ socialLinks column exists${colors.reset}`);
    console.log(result);
  } else {
    console.log(`${colors.yellow}✗ socialLinks column not found${colors.reset}`);
  }
} catch (error) {
  console.error(`${colors.red}Error checking for socialLinks: ${error.message}${colors.reset}`);
}

// 4. Check production tables
console.log(`\n${colors.cyan}=== Production Tables ===${colors.reset}`);
try {
  const query = `SELECT table_name 
                 FROM information_schema.tables 
                 WHERE table_schema = 'public' 
                 ORDER BY table_name;`;
  
  const result = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
    input: query,
    encoding: 'utf8'
  });
  
  console.log(result);
} catch (error) {
  console.error(`${colors.red}Error listing tables: ${error.message}${colors.reset}`);
}
