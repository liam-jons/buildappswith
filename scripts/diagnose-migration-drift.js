#!/usr/bin/env node

/**
 * Diagnose Migration Drift Script
 * 
 * This script helps identify and resolve migration drift issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Diagnosing Migration Drift ===${colors.reset}\n`);

try {
  // Step 1: List all migrations in the migrations directory
  console.log(`${colors.yellow}1. Checking file system migrations...${colors.reset}`);
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  const fileMigrations = fs.readdirSync(migrationsDir)
    .filter(dir => dir.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    .sort();
  
  console.log(`Found ${fileMigrations.length} migrations in file system:`);
  fileMigrations.forEach(m => console.log(`  - ${m}`));
  
  // Check for duplicate migrations
  const socialLinksMigrations = fileMigrations.filter(m => m.includes('add_social_links'));
  if (socialLinksMigrations.length > 1) {
    console.log(`\n${colors.red}Found ${socialLinksMigrations.length} duplicate 'add_social_links' migrations:${colors.reset}`);
    socialLinksMigrations.forEach(m => console.log(`  - ${m}`));
  }

  // Step 2: Check migrations in the database
  console.log(`\n${colors.yellow}2. Checking database migrations...${colors.reset}`);
  try {
    const dbMigrations = execSync('npx prisma migrate status --schema=prisma/schema.prisma', { encoding: 'utf8' });
    console.log(dbMigrations);
  } catch (error) {
    if (error.status === 1) {
      // This is expected if there's drift
      console.log(error.stdout || error.message);
    } else {
      throw error;
    }
  }
  
  // Step 3: Check current database schema
  console.log(`\n${colors.yellow}3. Checking database schema for socialLinks column...${colors.reset}`);
  try {
    const dbInfo = execSync(`npx prisma db execute --schema=prisma/schema.prisma --stdin`, {
      input: `SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'BuilderProfile' AND column_name = 'socialLinks';`,
      encoding: 'utf8'
    });
    
    if (dbInfo.includes('socialLinks')) {
      console.log(`${colors.green}✓ socialLinks column exists in database${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ socialLinks column not found in database${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}Error checking database schema: ${error.message}${colors.reset}`);
  }
  
  // Step 4: Propose solution
  console.log(`\n${colors.yellow}4. Proposed Solution:${colors.reset}`);
  console.log(`
The issue is caused by having multiple duplicate migrations for 'add_social_links'.
To fix this:

Option 1: Clean up duplicate migrations (recommended for pre-production)
- Remove the duplicate migration directories:
  ${socialLinksMigrations.slice(1).map(m => `rm -rf prisma/migrations/${m}`).join('\n  ')}
- Run: npx prisma migrate deploy

Option 2: Create a new migration to resolve drift (safer for production)
- Run: npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script
- This will show actual differences between schema and database
- If needed, create a migration to apply missing changes

Option 3: Reset and recreate migrations (only for development)
- Run: npx prisma migrate reset
- Run: npx prisma migrate dev --name init
`);

} catch (error) {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
