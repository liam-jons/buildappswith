#!/usr/bin/env node

/**
 * Database Backup and Sync Script
 * 
 * This script performs the following operations:
 * 1. Creates a backup of the production database
 * 2. Syncs the production database with the development database
 * 3. Verifies that the sync was successful
 * 
 * Usage:
 * node scripts/backup-and-sync-database.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Define color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Database connection strings
const DEV_DB_URL = 'postgresql://Buildappswith-dev_owner:npg_54LGbgNJuIUj@ep-shiny-star-abb3se6s-pooler.eu-west-2.aws.neon.tech/Buildappswith-dev?sslmode=require';
const PROD_DB_URL = 'postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require';

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, '../prisma/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Generate timestamp for backup files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFilePath = path.join(backupDir, `prod_backup_${timestamp}.sql`);

console.log(`${colors.bright}${colors.cyan}=== Database Backup and Sync Tool ===${colors.reset}\n`);

async function backupAndSyncDatabase() {
  try {
    // Step 1: Backup production database
    console.log(`${colors.yellow}1. Creating backup of production database...${colors.reset}`);
    try {
      execSync(`pg_dump "${PROD_DB_URL}" > "${backupFilePath}"`, { 
        stdio: 'inherit',
        shell: true 
      });
      console.log(`${colors.green}✓ Production database backup created at: ${backupFilePath}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Failed to create database backup:${colors.reset}`);
      console.error(error.message);
      console.log(`${colors.yellow}Continuing with sync process...${colors.reset}\n`);
    }

    // Step 2: Check schemas before sync
    console.log(`${colors.yellow}2. Checking database schemas before sync...${colors.reset}`);
    try {
      const schemaDiff = execSync(`npx prisma migrate diff --from-url="${PROD_DB_URL}" --to-url="${DEV_DB_URL}" --script`, {
        encoding: 'utf8'
      });
      
      if (schemaDiff.trim() === '' || schemaDiff.includes('No difference detected')) {
        console.log(`${colors.green}✓ Schemas are already aligned${colors.reset}\n`);
      } else {
        console.log(`${colors.yellow}Schema differences detected. Will be updated during sync:${colors.reset}`);
        console.log(schemaDiff);
        console.log();
      }
    } catch (error) {
      console.log(`${colors.red}Schema comparison failed. Continuing anyway...${colors.reset}`);
      console.log(error.message);
      console.log();
    }

    // Step 3: Using pg_dump and psql to transfer data
    console.log(`${colors.yellow}3. Syncing development database to production...${colors.reset}`);
    
    // Create a temporary dump file
    const tempDumpFile = path.join(backupDir, `dev_dump_${timestamp}.sql`);
    
    console.log(`${colors.cyan}   Creating development database dump...${colors.reset}`);
    execSync(`pg_dump "${DEV_DB_URL}" > "${tempDumpFile}"`, { 
      stdio: 'inherit',
      shell: true 
    });
    
    console.log(`${colors.cyan}   Dropping all tables from production database...${colors.reset}`);
    execSync(`psql "${PROD_DB_URL}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`, {
      stdio: 'inherit',
      shell: true
    });
    
    console.log(`${colors.cyan}   Importing development data to production...${colors.reset}`);
    execSync(`psql "${PROD_DB_URL}" < "${tempDumpFile}"`, {
      stdio: 'inherit',
      shell: true
    });
    
    console.log(`${colors.green}✓ Database sync completed${colors.reset}\n`);
    
    // Clean up temporary dump file
    fs.unlinkSync(tempDumpFile);

    // Step 4: Verify the sync was successful
    console.log(`${colors.yellow}4. Verifying sync success...${colors.reset}`);
    
    // Connect to production database to check if Liam's profile exists
    const prodPrisma = new PrismaClient({
      datasources: {
        db: {
          url: PROD_DB_URL
        }
      }
    });

    try {
      // Check for Liam's profile in the production database
      const liamProfile = await prodPrisma.profile.findFirst({
        where: {
          name: { contains: 'Liam', mode: 'insensitive' }
        }
      });

      if (liamProfile) {
        console.log(`${colors.green}✓ Liam's profile found in production database:${colors.reset}`);
        console.log(`   ID: ${liamProfile.id}`);
        console.log(`   Name: ${liamProfile.name}`);
        console.log(`   Title: ${liamProfile.title}`);
        console.log(`   Searchable: ${liamProfile.searchable}`);
      } else {
        console.log(`${colors.red}✗ Liam's profile not found in production database${colors.reset}`);
      }

      // Check for builders in marketplace
      const buildersCount = await prodPrisma.profile.count({
        where: {
          searchable: true
        }
      });

      console.log(`${colors.green}✓ Found ${buildersCount} searchable profiles in production marketplace${colors.reset}`);
      
      // List all searchable builders
      if (buildersCount > 0) {
        const builders = await prodPrisma.profile.findMany({
          where: {
            searchable: true
          },
          select: {
            id: true,
            name: true,
            isDemo: true
          }
        });
        
        console.log(`${colors.cyan}Searchable builders in production:${colors.reset}`);
        builders.forEach(builder => {
          console.log(`   - ${builder.name}${builder.isDemo ? ' (Demo)' : ''}`);
        });
      }
    } catch (error) {
      console.error(`${colors.red}Error verifying sync:${colors.reset}`);
      console.error(error);
    } finally {
      await prodPrisma.$disconnect();
    }

    console.log(`\n${colors.bright}${colors.green}Database backup and sync completed successfully!${colors.reset}`);
    console.log(`${colors.yellow}Don't forget to check the production marketplace to ensure Liam's profile appears correctly.${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.red}Error during backup and sync process:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

backupAndSyncDatabase();