#!/usr/bin/env node

/**
 * Check Migration History Script
 * 
 * This script examines the _prisma_migrations table to understand the current state
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.production' });

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Checking Migration History ===${colors.reset}\n`);

try {
  // Step 1: Query the _prisma_migrations table
  console.log(`${colors.yellow}1. Migrations recorded in database:${colors.reset}`);
  
  const query = `SELECT id, migration_name, applied_steps_count, finished_at FROM "_prisma_migrations" ORDER BY finished_at;`;
  
  try {
    const result = execSync(`npx prisma db execute --schema=prisma/schema.prisma --stdin`, {
      input: query,
      encoding: 'utf8'
    });
    
    console.log(result);
  } catch (error) {
    console.log(`${colors.red}Error querying migrations table: ${error.message}${colors.reset}`);
  }

  // Step 2: Compare with file system
  console.log(`\n${colors.yellow}2. Migrations in file system:${colors.reset}`);
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  const fileMigrations = fs.readdirSync(migrationsDir)
    .filter(dir => dir.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    .sort();
  
  fileMigrations.forEach(migration => {
    console.log(`  - ${migration}`);
  });

  // Step 3: Check for discrepancies
  console.log(`\n${colors.yellow}3. Checking for discrepancies...${colors.reset}`);
  
  // Count migrations
  const socialLinksMigrations = fileMigrations.filter(m => m.includes('add_social_links'));
  
  if (socialLinksMigrations.length > 1) {
    console.log(`${colors.red}Issue found:${colors.reset} Multiple 'add_social_links' migrations in file system`);
    console.log(`Found ${socialLinksMigrations.length} duplicates:`);
    socialLinksMigrations.forEach(m => console.log(`  - ${m}`));
    
    console.log(`\n${colors.yellow}Possible solutions:${colors.reset}`);
    console.log(`1. Remove duplicate migrations (if they haven't been applied to production):`);
    console.log(`   ${socialLinksMigrations.slice(1).map(m => `rm -rf prisma/migrations/${m}`).join('\n   ')}`);
    console.log(`   Then run: npx prisma migrate deploy`);
    
    console.log(`\n2. If duplicates already exist in production, baseline the schema:`);
    console.log(`   npx prisma migrate resolve --applied ${socialLinksMigrations.join(' --applied ')}`);
  }
  
} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
