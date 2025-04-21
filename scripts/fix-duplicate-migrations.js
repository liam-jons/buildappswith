#!/usr/bin/env node

/**
 * Fix Duplicate Migrations Script
 * 
 * This script helps resolve the issue with duplicate social links migrations
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

console.log(`${colors.bright}${colors.cyan}=== Fixing Duplicate Migrations ===${colors.reset}\n`);

const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');

try {
  // Step 1: Find duplicate migrations
  console.log(`${colors.yellow}1. Analyzing migrations...${colors.reset}`);
  
  const fileMigrations = fs.readdirSync(migrationsDir)
    .filter(dir => dir.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    .sort();
  
  const socialLinksMigrations = fileMigrations.filter(m => m.includes('add_social_links'));
  
  console.log(`Found ${socialLinksMigrations.length} 'add_social_links' migrations:`);
  socialLinksMigrations.forEach(m => console.log(`  - ${m}`));
  
  if (socialLinksMigrations.length <= 1) {
    console.log(`${colors.green}No duplicate migrations found. Nothing to do.${colors.reset}`);
    process.exit(0);
  }
  
  // Step 2: Check which migrations have been applied
  console.log(`\n${colors.yellow}2. Checking which migrations have been applied...${colors.reset}`);
  
  let appliedMigrations = [];
  try {
    const query = `SELECT migration_name FROM "_prisma_migrations" WHERE migration_name LIKE '%add_social_links%';`;
    const result = execSync(`npx prisma db execute --schema=prisma/schema.prisma --stdin`, {
      input: query,
      encoding: 'utf8'
    });
    
    appliedMigrations = result.split('\n')
      .filter(line => line.includes('add_social_links'))
      .map(line => line.trim());
    
    console.log(`Applied migrations:`);
    appliedMigrations.forEach(m => console.log(`  - ${m}`));
  } catch (error) {
    console.log(`${colors.yellow}Could not query _prisma_migrations table directly.${colors.reset}`);
    console.log(`Attempting to use migrate status instead...`);
    
    try {
      const statusOutput = execSync('npx prisma migrate status', { encoding: 'utf8' });
      console.log(statusOutput);
    } catch (statusError) {
      console.log(`${colors.red}Error getting migration status: ${statusError.message}${colors.reset}`);
    }
  }
  
  // Step 3: Create backup
  console.log(`\n${colors.yellow}3. Creating backup of duplicates...${colors.reset}`);
  
  const backupDir = path.join(process.cwd(), 'scripts', 'migration-backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  socialLinksMigrations.slice(1).forEach(migration => {
    const sourcePath = path.join(migrationsDir, migration);
    const backupPath = path.join(backupDir, migration);
    
    // Copy the migration directory
    fs.cpSync(sourcePath, backupPath, { recursive: true });
    console.log(`  Backed up: ${migration}`);
  });
  
  // Step 4: Remove duplicates
  console.log(`\n${colors.yellow}4. Removing duplicate migrations...${colors.reset}`);
  
  socialLinksMigrations.slice(1).forEach(migration => {
    const migrationPath = path.join(migrationsDir, migration);
    fs.rmSync(migrationPath, { recursive: true, force: true });
    console.log(`  Removed: ${migration}`);
  });
  
  // Step 5: Verify the fix
  console.log(`\n${colors.yellow}5. Verifying...${colors.reset}`);
  
  try {
    execSync('npx prisma migrate status', { stdio: 'inherit' });
    console.log(`\n${colors.green}Migration status check passed!${colors.reset}`);
  } catch (error) {
    console.log(`\n${colors.red}Migration status check still reports issues.${colors.reset}`);
    console.log(`Try running: npx prisma migrate resolve --applied 20250420104035_add_social_links`);
  }
  
  console.log(`\n${colors.bright}${colors.green}Completed!${colors.reset}`);
  console.log(`\nBackups are stored in: ${backupDir}`);
  console.log(`\nIf everything works correctly, you can delete the backup.`);
  console.log(`If you need to restore, copy the backup files back to: ${migrationsDir}`);
  
} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
