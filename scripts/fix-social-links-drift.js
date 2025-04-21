#!/usr/bin/env node

/**
 * Fix Social Links Schema Drift
 * 
 * This script creates a proper migration for the socialLinks column
 * that was added without migration history
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

console.log(`${colors.bright}${colors.cyan}=== Fixing Social Links Schema Drift ===${colors.reset}\n`);

try {
  // Step 1: Create migration file without applying
  console.log(`${colors.yellow}Creating migration file for social links...${colors.reset}`);
  
  // Find the latest migration directory
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  const existingMigrations = fs.readdirSync(migrationsDir)
    .filter(dir => dir.match(/^\d+_/))
    .sort()
    .reverse();

  // Create a new migration directory with a timestamp
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const migrationDir = path.join(migrationsDir, `${timestamp}_add_social_links`);
  
  fs.mkdirSync(migrationDir);
  
  // Step 2: Create the migration SQL
  const migrationSQL = `-- AlterTable
ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "socialLinks" JSONB;`;
  
  fs.writeFileSync(path.join(migrationDir, 'migration.sql'), migrationSQL);
  
  console.log(`${colors.green}✓ Migration file created${colors.reset}`);
  
  // Step 3: Apply the migration
  console.log(`\n${colors.yellow}Applying migration...${colors.reset}`);
  
  try {
    execSync('npx prisma migrate deploy');
    console.log(`${colors.green}✓ Migration applied successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error applying migration: ${error.message}${colors.reset}`);
  }
  
  // Step 4: Regenerate Prisma client
  console.log(`\n${colors.yellow}Regenerating Prisma client...${colors.reset}`);
  execSync('npx prisma generate');
  console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.green}Schema drift resolved!${colors.reset}`);
  console.log(`\nNext steps:`);
  console.log(`1. Run ${colors.cyan}npm run production:check${colors.reset} to verify everything is correct`);
  console.log(`2. Commit the new migration file`);
  console.log(`3. Continue with production setup`);
  
} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
