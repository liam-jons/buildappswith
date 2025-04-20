#!/usr/bin/env node

/**
 * Initialize Production Database Script
 * 
 * This script properly initializes and applies migrations to the production database
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

console.log(`${colors.bright}${colors.cyan}=== Initialize Production Database ===${colors.reset}\n`);

const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error(`${colors.red}Error: PRODUCTION_DATABASE_URL not found.${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.yellow}Using database:${colors.reset} ${prodDatabaseUrl.split('@')[1].split('/')[1]}\n`);

async function initializeDatabase() {
  try {
    // Step 1: Apply all migrations to production using deploy
    console.log(`${colors.yellow}1. Applying migrations to production...${colors.reset}`);
    try {
      const output = execSync(`DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate deploy`, {
        encoding: 'utf8',
        stdio: 'inherit'
      });
    } catch (error) {
      if (error.status !== 0) {
        console.error(`${colors.red}Error applying migrations${colors.reset}`);
        throw error;
      }
    }
    
    // Step 2: Verify table creation
    console.log(`\n${colors.yellow}2. Verifying tables were created...${colors.reset}`);
    try {
      const query = `SELECT table_name 
                     FROM information_schema.tables 
                     WHERE table_schema = 'public'
                     ORDER BY table_name;`;
      
      const result = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query,
        encoding: 'utf8'
      });
      
      console.log(`${colors.green}Tables found:${colors.reset}`);
      console.log(result);
    } catch (error) {
      console.error(`${colors.red}Error listing tables: ${error.message}${colors.reset}`);
    }
    
    // Step 3: Verify BuilderProfile and socialLinks column
    console.log(`\n${colors.yellow}3. Verifying BuilderProfile and socialLinks column...${colors.reset}`);
    try {
      const query = `SELECT column_name, data_type 
                     FROM information_schema.columns 
                     WHERE table_name = 'BuilderProfile'
                     ORDER BY ordinal_position;`;
      
      const result = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query,
        encoding: 'utf8'
      });
      
      console.log(`${colors.green}BuilderProfile columns:${colors.reset}`);
      console.log(result);
      
      if (result.includes('socialLinks')) {
        console.log(`${colors.green}✓ socialLinks column found${colors.reset}`);
      } else {
        console.log(`${colors.yellow}! socialLinks column not found${colors.reset}`);
        
        // Try to add it manually
        console.log(`${colors.yellow}Attempting to add socialLinks column...${colors.reset}`);
        try {
          const addColumnQuery = `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "socialLinks" JSONB;`;
          execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
            input: addColumnQuery,
            encoding: 'utf8'
          });
          console.log(`${colors.green}✓ socialLinks column added${colors.reset}`);
        } catch (error) {
          console.error(`${colors.red}Error adding column: ${error.message}${colors.reset}`);
        }
      }
    } catch (error) {
      console.error(`${colors.red}Error checking BuilderProfile: ${error.message}${colors.reset}`);
    }
    
    // Step 4: Final verification
    console.log(`\n${colors.yellow}4. Final verification...${colors.reset}`);
    try {
      const result = execSync(`DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate status`, {
        encoding: 'utf8'
      });
      console.log(result);
      
      if (result.includes('Database schema is up to date')) {
        console.log(`\n${colors.green}${colors.bright}✓ Production database successfully initialized!${colors.reset}`);
        console.log(`\nNext steps:`);
        console.log(`1. Deploy your application to Vercel`);
        console.log(`2. Ensure environment variables are properly set`);
        console.log(`3. Test the production deployment`);
      } else {
        console.log(`\n${colors.yellow}⚠ Some issues may remain - please review the output above${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking final status: ${error.message}${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}If you see connection errors, make sure:`);
    console.error(`1. Your database connection URL is correct`);
    console.error(`2. Your IP address is whitelisted in the database settings`);
    console.error(`3. The database is not paused/suspended${colors.reset}`);
    process.exit(1);
  }
}

initializeDatabase();
