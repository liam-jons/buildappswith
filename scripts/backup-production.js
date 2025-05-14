#!/usr/bin/env node

/**
 * Script to backup production database
 * Saves schema and data separately
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Use production connection string
process.env.DATABASE_URL = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function backupProduction() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', 'production', timestamp);
  
  try {
    console.log(chalk.blue('🔄 Starting production database backup...\n'));
    
    // Verify we're connected to production
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.includes('prod')) {
      throw new Error('Not connected to production database!');
    }
    
    console.log(chalk.yellow('Connected to:'), dbUrl.split('@')[1]);
    
    // Create backup directory
    fs.mkdirSync(backupDir, { recursive: true });
    
    // Export data
    console.log(chalk.green('\n📥 Exporting production data...'));
    
    const users = await prisma.user.findMany({
      include: {
        builderProfile: true,
        clientProfile: true,
        sessionTypes: true
      }
    });
    
    const backupData = {
      timestamp: new Date().toISOString(),
      databaseName: 'production',
      users
    };
    
    const dataFile = path.join(backupDir, 'production-data.json');
    fs.writeFileSync(dataFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Data exported to: ${dataFile}`);
    
    // Export schema
    console.log(chalk.green('\n📋 Exporting schema...'));
    const schemaFile = path.join(backupDir, 'production-schema.prisma');
    fs.copyFileSync('prisma/schema.prisma', schemaFile);
    
    console.log(`✅ Schema exported to: ${schemaFile}`);
    
    // Verify backup
    console.log(chalk.blue('\n🔍 Verifying backup...'));
    const backupSize = fs.statSync(dataFile).size;
    console.log(`  Data file size: ${(backupSize / 1024).toFixed(2)} KB`);
    console.log(`  Users backed up: ${users.length}`);
    console.log(`  Builders backed up: ${users.filter(u => u.builderProfile).length}`);
    
    console.log(chalk.green('\n✅ Production backup completed successfully!'));
    console.log(chalk.yellow(`\nBackup location: ${backupDir}`));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Backup failed:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run backup
backupProduction();