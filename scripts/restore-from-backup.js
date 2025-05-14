#!/usr/bin/env node

/**
 * Script to restore database from JSON backup
 * This will clear existing data and restore from backup
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Initialize Prisma with proper config
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function restoreFromBackup(backupFile) {
  console.log(chalk.blue('🔄 Starting database restore from backup...'));
  console.log(`Backup file: ${backupFile}`);
  
  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`Backup timestamp: ${backupData.timestamp}`);
    
    // Clear existing data (in reverse order of dependencies)
    console.log(chalk.yellow('\n📥 Clearing existing data...'));
    await prisma.sessionType.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.builderProfile.deleteMany();
    await prisma.clientProfile.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    
    // Restore users
    console.log(chalk.green('\n👤 Restoring users...'));
    for (const user of backupData.users) {
      const { builderProfile, clientProfile, sessionTypes, ...userData } = user;
      await prisma.user.create({
        data: userData
      });
    }
    console.log(`✅ Restored ${backupData.users.length} users`);
    
    // Restore builder profiles
    console.log(chalk.green('\n🔨 Restoring builder profiles...'));
    let builderCount = 0;
    for (const user of backupData.users) {
      if (user.builderProfile) {
        await prisma.builderProfile.create({
          data: user.builderProfile
        });
        builderCount++;
      }
    }
    console.log(`✅ Restored ${builderCount} builder profiles`);
    
    // Restore client profiles
    console.log(chalk.green('\n👥 Restoring client profiles...'));
    let clientCount = 0;
    for (const user of backupData.users) {
      if (user.clientProfile) {
        await prisma.clientProfile.create({
          data: user.clientProfile
        });
        clientCount++;
      }
    }
    console.log(`✅ Restored ${clientCount} client profiles`);
    
    // Restore session types
    console.log(chalk.green('\n📅 Restoring session types...'));
    let sessionCount = 0;
    for (const user of backupData.users) {
      if (user.sessionTypes && user.sessionTypes.length > 0) {
        for (const sessionType of user.sessionTypes) {
          await prisma.sessionType.create({
            data: sessionType
          });
          sessionCount++;
        }
      }
    }
    console.log(`✅ Restored ${sessionCount} session types`);
    
    // Verify restoration
    console.log(chalk.blue('\n🔍 Verifying restoration...'));
    const userCount = await prisma.user.count();
    const searchableBuilders = await prisma.builderProfile.count({ where: { searchable: true } });
    const demoUsers = await prisma.user.count({ where: { isDemo: true } });
    
    console.log(`\n📊 Restoration Summary:`);
    console.log(`  Total Users: ${chalk.green(userCount)}`);
    console.log(`  Builder Profiles: ${chalk.green(builderCount)}`);
    console.log(`  Searchable Builders: ${chalk.green(searchableBuilders)}`);
    console.log(`  Demo Users: ${chalk.green(demoUsers)}`);
    console.log(`  Session Types: ${chalk.green(sessionCount)}`);
    
    // Check for Liam's account
    const liam = await prisma.user.findFirst({
      where: { email: 'liam@buildappswith.com' }
    });
    
    if (liam) {
      console.log(chalk.green(`\n✅ Found Liam's account (ID: ${liam.id})`));
    } else {
      console.log(chalk.yellow('\n⚠️  Liam\'s account not found'));
    }
    
    console.log(chalk.green('\n✅ Database restoration completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Restoration failed:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get backup file from command line or use most recent
const backupFile = process.argv[2] || './backups/2025-05-14/clean-slate-1747210667481.json';

if (!fs.existsSync(backupFile)) {
  console.error(chalk.red(`❌ Backup file not found: ${backupFile}`));
  process.exit(1);
}

restoreFromBackup(backupFile);