#!/usr/bin/env node

/**
 * Check Migration Status Script
 * 
 * This script helps diagnose migration issues by running prisma migrate status
 * with detailed output.
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

console.log(`${colors.bright}${colors.cyan}=== Checking Migration Status ===${colors.reset}\n`);

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error(`${colors.red}Error: DATABASE_URL environment variable is not set!${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.yellow}Database URL is set: ${process.env.DATABASE_URL ? 'Yes' : 'No'}${colors.reset}\n`);

try {
  // Run prisma migrate status with visible output
  console.log(`${colors.yellow}Running prisma migrate status...${colors.reset}\n`);
  execSync('npx prisma migrate status', { stdio: 'inherit' });
  
  console.log(`\n${colors.green}✓ Migration status check complete${colors.reset}`);
  
} catch (error) {
  console.error(`\n${colors.red}Error running migration status check${colors.reset}`);
  console.error(`${colors.yellow}Error details:${colors.reset}`);
  console.error(error.message);
  
  // Suggest next steps
  console.log(`\n${colors.yellow}Next steps to resolve this:${colors.reset}`);
  console.log(`1. Check your DATABASE_URL is correct`);
  console.log(`2. Ensure you can connect to the database`);
  console.log(`3. Try running 'npx prisma db push' to sync the schema`);
  console.log(`4. If that doesn't work, you may need to create a baseline migration`);
  
  process.exit(1);
}

// Check for migrations directory
const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
console.log(`\n${colors.yellow}Checking migrations directory...${colors.reset}`);
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir)
    .filter(dir => dir.match(/^\d+_/));
  
  console.log(`${colors.green}Found ${migrations.length} migrations:${colors.reset}`);
  migrations.forEach(m => console.log(`  - ${m}`));
} else {
  console.log(`${colors.red}No migrations directory found${colors.reset}`);
}
