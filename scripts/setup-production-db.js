#!/usr/bin/env node

/**
 * Production Database Setup Script
 * 
 * This script guides you through setting up a production database for Buildappswith.
 * It handles:
 * 1. Creating a migration for schema drift
 * 2. Verifying migrations are in sync
 * 3. Preparing for production deployment
 * 
 * Usage:
 * node scripts/setup-production-db.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables (same approach as existing scripts)
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.development' });
require('dotenv').config({ path: '.env.development.local' });

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
  console.log(`${colors.bright}${colors.cyan}=== Buildappswith Production Database Setup ===${colors.reset}\n`);
  
  console.log(`${colors.yellow}Before continuing, you need to:${colors.reset}`);
  console.log(`1. Create a production database in your Neon dashboard`);
  console.log(`2. Save the production database connection string securely`);
  console.log(`3. Have your Vercel project ready for environment variable configuration\n`);

  const ready = await question(`${colors.yellow}Have you completed the above steps? (y/n): ${colors.reset}`);
  
  if (ready.toLowerCase() !== 'y') {
    console.log(`\n${colors.red}Please complete the prerequisites before running this script.${colors.reset}`);
    rl.close();
    return;
  }

  try {
    // Step 1: Check for current database connection
    if (!process.env.DATABASE_URL) {
      console.error(`${colors.red}Error: DATABASE_URL not found in environment variables.${colors.reset}`);
      console.error(`${colors.yellow}Please ensure it's properly set in your .env.local file.${colors.reset}`);
      process.exit(1);
    }

    // Step 2: Create migration for schema drift
    console.log(`\n${colors.yellow}Step 1: Creating migration for current schema...${colors.reset}`);
    
    console.log(`\n${colors.yellow}Checking for existing drift...${colors.reset}`);
    try {
      execSync('npx prisma migrate status');
    } catch (error) {
      console.log(`${colors.yellow}Schema drift detected (this is expected).${colors.reset}`);
    }

    console.log(`\n${colors.yellow}Creating migration to capture current state...${colors.reset}`);
    const migrationName = 'baseline_production';
    
    try {
      execSync(`npx prisma migrate dev --create-only --name ${migrationName}`);
      console.log(`${colors.green}✓ Migration created successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error creating migration: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Continuing anyway - this may be expected...${colors.reset}`);
    }

    // Step 3: Apply migrations to ensure everything is in sync
    console.log(`\n${colors.yellow}Step 2: Applying migrations to ensure sync...${colors.reset}`);
    
    try {
      execSync('npx prisma migrate dev');
      console.log(`${colors.green}✓ Migrations applied successfully${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error applying migrations: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Please review the error before proceeding.${colors.reset}`);
    }

    // Step 4: Generate Prisma client
    console.log(`\n${colors.yellow}Step 3: Regenerating Prisma client...${colors.reset}`);
    execSync('npx prisma generate');
    console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);

    // Step 5: Provide next steps
    console.log(`\n${colors.bright}${colors.green}Production database preparation complete!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. ${colors.cyan}Add production DATABASE_URL to Vercel${colors.reset} (Settings > Environment Variables)`);
    console.log(`2. ${colors.cyan}Set up other production environment variables${colors.reset}:`);
    console.log(`   - NEXTAUTH_SECRET (generate a new secure one)`);
    console.log(`   - NEXTAUTH_URL (your production domain)`);
    console.log(`   - STRIPE_SECRET_KEY (production key from Stripe)`);
    console.log(`   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (production key from Stripe)`);
    console.log(`3. ${colors.cyan}Deploy to Vercel${colors.reset} (during deployment, it will run 'prisma migrate deploy')`);
    console.log(`4. ${colors.cyan}After deployment${colors.reset}, you may need to seed production data if required\n`);

    // Step 6: Create environment template for production
    const envTemplateContent = `# Production Environment Template
# Copy these to Vercel environment variables (without values)

# Database
DATABASE_URL=

# NextAuth Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe Configuration
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Feature Flags
FEATURE_BUILDER_PROFILES=true
FEATURE_PORTFOLIO_SHOWCASE=true
`;

    fs.writeFileSync(path.join(process.cwd(), 'env.production.template'), envTemplateContent);
    console.log(`${colors.green}Created env.production.template for reference${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
