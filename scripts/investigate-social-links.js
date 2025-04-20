#!/usr/bin/env node

/**
 * Investigate Social Links Column Issue
 * 
 * This script performs a detailed investigation of why the socialLinks column isn't being found
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

console.log(`${colors.bright}${colors.cyan}=== Investigating socialLinks Column Issue ===${colors.reset}\n`);

const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error(`${colors.red}Error: PRODUCTION_DATABASE_URL not found.${colors.reset}`);
  process.exit(1);
}

async function investigateIssue() {
  try {
    // 1. Check if BuilderProfile table exists
    console.log(`${colors.yellow}1. Checking if BuilderProfile table exists...${colors.reset}`);
    try {
      const query1 = `SELECT table_name 
                     FROM information_schema.tables 
                     WHERE table_schema = 'public' 
                     AND table_name = 'BuilderProfile';`;
      
      const result1 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query1,
        encoding: 'utf8'
      });
      
      if (result1.includes('BuilderProfile')) {
        console.log(`${colors.green}✓ BuilderProfile table exists${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ BuilderProfile table not found${colors.reset}`);
        console.log(result1);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking BuilderProfile table: ${error.message}${colors.reset}`);
    }
    
    // 2. List all columns in BuilderProfile table
    console.log(`\n${colors.yellow}2. Listing all columns in BuilderProfile table...${colors.reset}`);
    try {
      const query2 = `SELECT column_name, data_type, is_nullable
                     FROM information_schema.columns 
                     WHERE table_name = 'BuilderProfile'
                     ORDER BY ordinal_position;`;
      
      const result2 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query2,
        encoding: 'utf8'
      });
      
      console.log(result2);
    } catch (error) {
      console.error(`${colors.red}Error listing columns: ${error.message}${colors.reset}`);
    }
    
    // 3. Check for any columns with 'social' in the name (case insensitive)
    console.log(`\n${colors.yellow}3. Looking for columns with 'social' in the name...${colors.reset}`);
    try {
      const query3 = `SELECT table_name, column_name, data_type
                     FROM information_schema.columns 
                     WHERE table_schema = 'public'
                     AND column_name ILIKE '%social%';`;
      
      const result3 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query3,
        encoding: 'utf8'
      });
      
      if (result3.trim()) {
        console.log(result3);
      } else {
        console.log(`${colors.yellow}No columns found with 'social' in the name${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error searching for social columns: ${error.message}${colors.reset}`);
    }
    
    // 4. Check the migration history table
    console.log(`\n${colors.yellow}4. Checking migration history table...${colors.reset}`);
    try {
      const query4 = `SELECT id, migration_name, finished_at, applied_steps_count
                     FROM "_prisma_migrations"
                     ORDER BY finished_at DESC;`;
      
      const result4 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query4,
        encoding: 'utf8'
      });
      
      console.log(result4);
    } catch (error) {
      console.error(`${colors.red}Error checking migration history: ${error.message}${colors.reset}`);
    }
    
    // 5. Let's try to manually add the column
    console.log(`\n${colors.yellow}5. Attempting to manually add socialLinks column...${colors.reset}`);
    try {
      const query5 = `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "socialLinks" JSONB;`;
      
      const result5 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query5,
        encoding: 'utf8'
      });
      
      console.log(`${colors.green}✓ ALTER TABLE command executed${colors.reset}`);
      
      // Now check if it exists
      const checkQuery = `SELECT column_name 
                         FROM information_schema.columns 
                         WHERE table_name = 'BuilderProfile' AND column_name = 'socialLinks';`;
      
      const checkResult = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: checkQuery,
        encoding: 'utf8'
      });
      
      if (checkResult.includes('socialLinks')) {
        console.log(`${colors.green}✓ socialLinks column now exists${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ socialLinks column still not found${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error adding column: ${error.message}${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}Investigation complete.${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Review the results above`);
    console.log(`2. If the column was successfully added manually, update the migration history`);
    console.log(`3. Run ${colors.yellow}node scripts/production-database-check.js${colors.reset} again`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

investigateIssue();
