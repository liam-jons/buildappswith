#!/usr/bin/env node

/**
 * Script to restore development database from backup
 * 1. Copies backup schema to prisma/schema.prisma
 * 2. Pushes schema to database
 * 3. Restores data from backup
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function main() {
  console.log(chalk.blue('🔄 Starting full database restoration process...\n'));
  
  const backupFile = process.argv[2] || './backups/2025-05-14/clean-slate-1747210667481.json';
  
  try {
    // Step 1: Copy the backup schema
    console.log(chalk.yellow('📋 Step 1: Copying backup schema...'));
    const backupSchemaPath = path.join(__dirname, 'backup-schema.prisma');
    const targetSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    
    fs.copyFileSync(backupSchemaPath, targetSchemaPath);
    console.log(chalk.green('✅ Schema copied\n'));
    
    // Step 2: Push schema to database
    console.log(chalk.yellow('🗄️  Step 2: Pushing schema to database...'));
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log(chalk.green('✅ Schema pushed\n'));
    
    // Step 3: Generate Prisma client
    console.log(chalk.yellow('🔧 Step 3: Generating Prisma client...'));
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log(chalk.green('✅ Prisma client generated\n'));
    
    // Step 4: Restore data
    console.log(chalk.yellow('📥 Step 4: Restoring data from backup...'));
    const prisma = new PrismaClient();
    
    try {
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      console.log(`Backup timestamp: ${backupData.timestamp}`);
      
      // Restore users
      console.log(chalk.green('\n👤 Restoring users...'));
      let userCount = 0;
      for (const user of backupData.users) {
        const { builderProfile, clientProfile, sessionTypes, imageUrl, ...userData } = user;
        
        // Map imageUrl to image field
        const userDataToSave = {
          ...userData,
          image: imageUrl || null
        };
        
        await prisma.user.create({
          data: userDataToSave
        });
        userCount++;
      }
      console.log(`✅ Restored ${userCount} users`);
      
      // Restore builder profiles
      console.log(chalk.green('\n🔨 Restoring builder profiles...'));
      let builderCount = 0;
      for (const user of backupData.users) {
        if (user.builderProfile) {
          // Convert hourlyRate from string to float if needed
          const builderData = {
            ...user.builderProfile,
            hourlyRate: user.builderProfile.hourlyRate ? parseFloat(user.builderProfile.hourlyRate) : null,
            responseRate: user.builderProfile.responseRate ? parseFloat(user.builderProfile.responseRate) : null
          };
          
          await prisma.builderProfile.create({
            data: builderData
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
      const totalUsers = await prisma.user.count();
      const searchableBuilders = await prisma.builderProfile.count({ where: { searchable: true } });
      const demoUsers = await prisma.user.count({ where: { isDemo: true } });
      
      console.log(`\n📊 Restoration Summary:`);
      console.log(`  Total Users: ${chalk.green(totalUsers)}`);
      console.log(`  Builder Profiles: ${chalk.green(builderCount)}`);
      console.log(`  Searchable Builders: ${chalk.green(searchableBuilders)}`);
      console.log(`  Demo Users: ${chalk.green(demoUsers)}`);
      console.log(`  Session Types: ${chalk.green(sessionCount)}`);
      
      // Check for Liam's account
      const liam = await prisma.user.findFirst({
        where: { email: 'liam@buildappswith.com' },
        include: { builderProfile: true }
      });
      
      if (liam) {
        console.log(chalk.green(`\n✅ Found Liam's account:`));
        console.log(`  ID: ${liam.id}`);
        console.log(`  Roles: ${liam.roles.join(', ')}`);
        console.log(`  Has Builder Profile: ${!!liam.builderProfile}`);
        console.log(`  Is Searchable: ${liam.builderProfile?.searchable || false}`);
      }
      
      console.log(chalk.green('\n✅ Database restoration completed successfully!'));
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Restoration failed:'), error);
    process.exit(1);
  }
}

main();