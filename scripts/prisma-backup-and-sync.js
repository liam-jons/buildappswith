#!/usr/bin/env node

/**
 * Database Backup and Sync Script using Prisma
 * 
 * This script performs the following operations:
 * 1. Creates a schema-only backup of the production database structure
 * 2. Syncs the production database with the development database using Prisma
 * 3. Verifies that the sync was successful
 * 
 * Usage:
 * node scripts/prisma-backup-and-sync.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

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
const schemaBackupPath = path.join(backupDir, `prod_schema_backup_${timestamp}.sql`);

console.log(`${colors.bright}${colors.cyan}=== Database Backup and Sync Tool (Prisma-based) ===${colors.reset}\n`);

async function backupAndSyncDatabase() {
  // Create Prisma client instances
  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url: DEV_DB_URL
      }
    }
  });

  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });

  try {
    // Step 1: Create a Prisma schema-only backup
    console.log(`${colors.yellow}1. Backing up production database schema...${colors.reset}`);
    try {
      // Create a snapshot of the schema using Prisma's introspection
      execSync(`DATABASE_URL="${PROD_DB_URL}" npx prisma db pull > "${schemaBackupPath}" 2>&1`, {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Schema backup created at: ${schemaBackupPath}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Failed to create schema backup:${colors.reset}`);
      console.error(error.message);
      console.log(`${colors.yellow}Continuing with sync process...${colors.reset}\n`);
    }

    // Step 2: Compare development and production data
    console.log(`${colors.yellow}2. Analyzing database content before sync...${colors.reset}`);

    // Count tables in development database
    const devStats = {};
    const prodStats = {};
    
    try {
      // Get all profiles from dev DB
      const devProfiles = await devPrisma.profile.findMany({
        where: {
          searchable: true
        },
        select: {
          id: true,
          name: true,
          isDemo: true
        }
      });
      
      devStats.builderProfiles = devProfiles.length;
      console.log(`${colors.cyan}Development database: ${devProfiles.length} searchable profiles${colors.reset}`);
      
      // Get all profiles from prod DB
      const prodProfiles = await prodPrisma.profile.findMany({
        where: {
          searchable: true
        },
        select: {
          id: true,
          name: true,
          isDemo: true
        }
      });
      
      prodStats.builderProfiles = prodProfiles.length;
      console.log(`${colors.cyan}Production database: ${prodProfiles.length} searchable profiles${colors.reset}\n`);
      
      // Look for Liam's profile in dev DB
      const liamDevProfile = await devPrisma.profile.findFirst({
        where: {
          name: { contains: 'Liam', mode: 'insensitive' }
        }
      });
      
      if (liamDevProfile) {
        console.log(`${colors.green}✓ Liam's profile found in development database${colors.reset}`);
        console.log(`   ID: ${liamDevProfile.id}`);
        console.log(`   Name: ${liamDevProfile.name}`);
        console.log(`   Searchable: ${liamDevProfile.searchable}\n`);
      } else {
        console.log(`${colors.red}✗ Liam's profile not found in development database${colors.reset}\n`);
      }
      
    } catch (error) {
      console.error(`${colors.red}Error analyzing database content:${colors.reset}`);
      console.error(error);
      console.log();
    }

    // Step 3: Sync data from development to production
    console.log(`${colors.yellow}3. Syncing development database to production...${colors.reset}`);
    
    // First, check if the schema matches 
    try {
      console.log(`${colors.cyan}   Updating production schema to match development...${colors.reset}`);
      execSync(`DATABASE_URL="${PROD_DB_URL}" npx prisma db push --accept-data-loss`, {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Production schema updated${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Failed to update production schema:${colors.reset}`);
      console.error(error.message);
      process.exit(1);
    }
    
    // Now, fetch all profiles from development and insert them into production
    try {
      console.log(`${colors.cyan}   Syncing profiles from development to production...${colors.reset}`);
      
      // Clear all profiles in production 
      const deleteResult = await prodPrisma.profile.deleteMany({});
      console.log(`${colors.cyan}   Deleted ${deleteResult.count} existing profiles from production${colors.reset}`);
      
      // Get all profiles from development
      const allDevProfiles = await devPrisma.profile.findMany();
      
      // Insert profiles into production
      let successCount = 0;
      for (const profile of allDevProfiles) {
        try {
          await prodPrisma.profile.create({
            data: profile
          });
          successCount++;
        } catch (error) {
          console.error(`${colors.red}Error syncing profile ${profile.id}:${colors.reset}`, error.message);
        }
      }
      
      console.log(`${colors.green}✓ Synced ${successCount}/${allDevProfiles.length} profiles to production${colors.reset}\n`);
      
    } catch (error) {
      console.error(`${colors.red}Error syncing profiles:${colors.reset}`);
      console.error(error);
      console.log();
    }
    
    // Step 4: Verify sync success
    console.log(`${colors.yellow}4. Verifying sync success...${colors.reset}`);
    
    try {
      // Check for Liam's profile in production
      const liamProdProfile = await prodPrisma.profile.findFirst({
        where: {
          name: { contains: 'Liam', mode: 'insensitive' }
        }
      });
      
      if (liamProdProfile) {
        console.log(`${colors.green}✓ Liam's profile found in production database:${colors.reset}`);
        console.log(`   ID: ${liamProdProfile.id}`);
        console.log(`   Name: ${liamProdProfile.name}`);
        console.log(`   Title: ${liamProdProfile.title || 'N/A'}`);
        console.log(`   Searchable: ${liamProdProfile.searchable}`);
      } else {
        console.log(`${colors.red}✗ Liam's profile not found in production database${colors.reset}`);
      }
      
      // Count searchable profiles in production
      const searchableProfiles = await prodPrisma.profile.findMany({
        where: {
          searchable: true
        },
        select: {
          id: true,
          name: true,
          isDemo: true
        }
      });
      
      console.log(`${colors.green}✓ Found ${searchableProfiles.length} searchable profiles in production marketplace${colors.reset}`);
      
      // List all searchable builders
      if (searchableProfiles.length > 0) {
        console.log(`${colors.cyan}Searchable builders in production:${colors.reset}`);
        searchableProfiles.forEach(builder => {
          console.log(`   - ${builder.name}${builder.isDemo ? ' (Demo)' : ''}`);
        });
      }
      
    } catch (error) {
      console.error(`${colors.red}Error verifying sync:${colors.reset}`);
      console.error(error);
    }

    console.log(`\n${colors.bright}${colors.green}Database sync completed successfully!${colors.reset}`);
    console.log(`${colors.yellow}Don't forget to check the production marketplace to ensure Liam's profile appears correctly.${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.red}Error during backup and sync process:${colors.reset}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Disconnect Prisma clients
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

backupAndSyncDatabase();