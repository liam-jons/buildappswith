#!/usr/bin/env node

/**
 * Reconcile Migrations Script
 * 
 * This script reconciles migration issues without resetting the database
 * by creating a proper migration history that matches the current state.
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

async function main() {
  console.log(`${colors.bright}${colors.cyan}=== Reconciling Migration History ===${colors.reset}\n`);

  try {
    // Step 1: Create a temporary directory to backup migrations
    const backupDir = path.join(process.cwd(), 'prisma', 'migrations_backup');
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Backup existing migrations
    console.log(`${colors.yellow}Step 1: Backing up existing migrations...${colors.reset}`);
    const migrations = fs.readdirSync(migrationsDir);
    migrations.forEach(item => {
      const sourcePath = path.join(migrationsDir, item);
      const destPath = path.join(backupDir, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        // Copy migration directory
        fs.cpSync(sourcePath, destPath, { recursive: true });
        console.log(`Backed up migration: ${item}`);
      } else {
        // Copy file (like migration_lock.toml)
        fs.copyFileSync(sourcePath, destPath);
      }
    });

    // Step 2: Mark all migrations as applied (to stop drift warnings)
    console.log(`\n${colors.yellow}Step 2: Marking all migrations as applied...${colors.reset}`);
    
    // Create a SQL file to mark migrations as applied
    const markAppliedSQL = `
-- Mark all existing migrations as applied
INSERT INTO "_prisma_migrations" (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
)
SELECT 
  md5(random()::text || clock_timestamp()::text)::uuid,
  md5(pg_read_file(path))::varchar(64),
  now(),
  migration_name,
  NULL,
  NULL,
  now(),
  1
FROM (
  SELECT 
    unnest(string_to_array('${migrations.filter(m => m.match(/^\d+_/)).join(',')}', ',')) as migration_name,
    'prisma/migrations/' || unnest(string_to_array('${migrations.filter(m => m.match(/^\d+_/)).join(',')}', ',')) || '/migration.sql' as path
) subquery
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" WHERE migration_name = subquery.migration_name
);`;

    // Write this SQL to a temporary file
    const tempSQLPath = path.join(process.cwd(), 'temp_reconcile.sql');
    fs.writeFileSync(tempSQLPath, markAppliedSQL);
    
    // Apply the SQL (you'll need to run this manually)
    console.log(`${colors.yellow}SQL file created at: ${tempSQLPath}${colors.reset}`);
    console.log(`${colors.cyan}Please run this SQL against your database manually to mark migrations as applied.${colors.reset}`);
    
    // Step 3: Generate Prisma client
    console.log(`\n${colors.yellow}Step 3: Regenerating Prisma client...${colors.reset}`);
    execSync('npx prisma generate');
    console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);
    
    // Step 4: Instructions for next steps
    console.log(`\n${colors.green}Reconciliation prepared!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Run the SQL in ${colors.cyan}temp_reconcile.sql${colors.reset} against your database`);
    console.log(`2. Run ${colors.cyan}npm run production:check${colors.reset} to verify everything is ready`);
    console.log(`3. If all checks pass, commit your changes and deploy`);
    console.log(`\nBackup of your migrations is in: ${colors.cyan}${backupDir}${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
