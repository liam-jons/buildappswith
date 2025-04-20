#!/usr/bin/env node

/**
 * Diagnose Database State Script
 * 
 * This script performs a complete diagnosis of the production database
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

console.log(`${colors.bright}${colors.cyan}=== Database Diagnosis ===${colors.reset}\n`);

const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error(`${colors.red}Error: PRODUCTION_DATABASE_URL not found.${colors.reset}`);
  process.exit(1);
}

async function diagnoseDatabase() {
  try {
    // 1. List all tables in the database
    console.log(`${colors.yellow}1. Listing all tables in database...${colors.reset}`);
    try {
      const query1 = `SELECT table_name 
                     FROM information_schema.tables 
                     WHERE table_schema = 'public'
                     ORDER BY table_name;`;
      
      const result1 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query1,
        encoding: 'utf8'
      });
      
      console.log(result1);
      
      // Count tables
      const tableCount = (result1.match(/\n/g) || []).length - 2; // Subtract header and footer
      console.log(`${colors.cyan}Total tables found: ${tableCount}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error listing tables: ${error.message}${colors.reset}`);
    }
    
    // 2. Check if _prisma_migrations table exists
    console.log(`\n${colors.yellow}2. Checking for _prisma_migrations table...${colors.reset}`);
    try {
      const query2 = `SELECT EXISTS (
                       SELECT FROM information_schema.tables 
                       WHERE table_schema = 'public'
                       AND table_name = '_prisma_migrations'
                     );`;
      
      const result2 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query2,
        encoding: 'utf8'
      });
      
      console.log(result2);
    } catch (error) {
      console.error(`${colors.red}Error checking migrations table: ${error.message}${colors.reset}`);
    }
    
    // 3. If migrations table exists, show its contents
    console.log(`\n${colors.yellow}3. Checking migration records...${colors.reset}`);
    try {
      const query3 = `SELECT id, migration_name, finished_at, applied_steps_count 
                     FROM "_prisma_migrations" 
                     ORDER BY finished_at DESC;`;
      
      const result3 = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
        input: query3,
        encoding: 'utf8'
      });
      
      console.log(result3);
    } catch (error) {
      if (error.message.includes('relation "_prisma_migrations" does not exist')) {
        console.log(`${colors.yellow}No migration records found - _prisma_migrations table doesn't exist${colors.reset}`);
      } else {
        console.error(`${colors.red}Error checking migration records: ${error.message}${colors.reset}`);
      }
    }
    
    // 4. Check if we need to initialize the database with Prisma
    console.log(`\n${colors.yellow}4. Checking database initialization...${colors.reset}`);
    console.log(`If the database is completely empty, we may need to run:`);
    console.log(`${colors.cyan}DATABASE_URL=<production-url> npx prisma migrate deploy${colors.reset}`);
    
    // 5. Let's try to force reset and re-apply migrations
    console.log(`\n${colors.yellow}5. Suggested fix:${colors.reset}`);
    console.log(`You may need to:`);
    console.log(`1. Clear any partial migration state`);
    console.log(`2. Re-run migrations from scratch`);
    console.log(`\nTry running:`);
    console.log(`${colors.cyan}npx prisma migrate deploy${colors.reset}`);
    console.log(`with the production DATABASE_URL`);
    
    console.log(`\n${colors.bright}Diagnosis complete.${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

diagnoseDatabase();
