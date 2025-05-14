#!/usr/bin/env node

/**
 * Script to restore data to both dev and prod databases
 * Uses the backup we created earlier in this session
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Create clients for both databases
const devClient = new PrismaClient();

const prodUrl = fs.existsSync('.env.production.local') ? 
  fs.readFileSync('.env.production.local', 'utf8')
    .split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    ?.split('=')[1]
    ?.replace(/["']/g, '') : null;

const prodClient = new PrismaClient({
  datasources: {
    db: {
      url: prodUrl
    }
  }
});

async function restoreData(client, dbName) {
  console.log(chalk.blue(`\n🔄 Restoring data to ${dbName} database...`));
  
  // Use the backup we created earlier
  const backupFile = './backups/2025-05-14/clean-slate-1747210667481.json';
  
  try {
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`Using backup from: ${backupData.timestamp}`);
    
    // Clear existing data (careful with order due to foreign keys)
    console.log(chalk.yellow('📥 Clearing existing data...'));
    
    // Clear in reverse order of dependencies
    try {
      if (client.booking) await client.booking.deleteMany();
      if (client.sessionType) await client.sessionType.deleteMany();
      if (client.projectMilestone) await client.projectMilestone.deleteMany();
      if (client.project) await client.project.deleteMany();
      if (client.builderSkill) await client.builderSkill.deleteMany();
      if (client.app) await client.app.deleteMany();
      if (client.builderProfile) await client.builderProfile.deleteMany();
      if (client.clientProfile) await client.clientProfile.deleteMany();
      if (client.subscriberProfile) await client.subscriberProfile.deleteMany();
      if (client.account) await client.account.deleteMany();
      if (client.session) await client.session.deleteMany();
      if (client.verificationToken) await client.verificationToken.deleteMany();
      if (client.user) await client.user.deleteMany();
    } catch (err) {
      console.log(chalk.yellow('Some tables may not exist yet, continuing...'));
    }
    
    // Restore users first
    console.log(chalk.green('👤 Restoring users...'));
    for (const user of backupData.users) {
      const { builderProfile, clientProfile, sessionTypes, imageUrl, ...userData } = user;
      const userDataToSave = {
        ...userData,
        imageUrl: imageUrl || null  // Field is imageUrl in schema
      };
      await client.user.create({
        data: userDataToSave
      });
    }
    console.log(`✅ Restored ${backupData.users.length} users`);
    
    // Restore builder profiles
    console.log(chalk.green('🔨 Restoring builder profiles...'));
    let builderCount = 0;
    for (const user of backupData.users) {
      if (user.builderProfile) {
        // Convert hourlyRate if needed
        const builderData = {
          ...user.builderProfile,
          hourlyRate: user.builderProfile.hourlyRate ? parseFloat(user.builderProfile.hourlyRate) : null,
          responseRate: user.builderProfile.responseRate ? parseFloat(user.builderProfile.responseRate) : null
        };
        await client.builderProfile.create({
          data: builderData
        });
        builderCount++;
      }
    }
    console.log(`✅ Restored ${builderCount} builder profiles`);
    
    // Restore client profiles
    console.log(chalk.green('👥 Restoring client profiles...'));
    let clientCount = 0;
    for (const user of backupData.users) {
      if (user.clientProfile) {
        await client.clientProfile.create({
          data: user.clientProfile
        });
        clientCount++;
      }
    }
    console.log(`✅ Restored ${clientCount} client profiles`);
    
    // Restore session types
    console.log(chalk.green('📅 Restoring session types...'));
    let sessionCount = 0;
    for (const user of backupData.users) {
      if (user.sessionTypes && user.sessionTypes.length > 0) {
        for (const sessionType of user.sessionTypes) {
          // Convert price to Decimal if needed
          const sessionData = {
            ...sessionType,
            price: parseFloat(sessionType.price || '0')
          };
          await client.sessionType.create({
            data: sessionData
          });
          sessionCount++;
        }
      }
    }
    console.log(`✅ Restored ${sessionCount} session types`);
    
    console.log(chalk.green(`\n✅ ${dbName} restoration completed!`));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ ${dbName} restoration failed:`), error);
    throw error;
  }
}

async function main() {
  try {
    // Restore development
    await restoreData(devClient, 'DEVELOPMENT');
    
    // Restore production
    await restoreData(prodClient, 'PRODUCTION');
    
    // Verify both databases
    console.log(chalk.blue('\n🔍 Verifying databases...'));
    
    const devUsers = await devClient.user.count();
    const devBuilders = await devClient.builderProfile.count();
    const prodUsers = await prodClient.user.count();
    const prodBuilders = await prodClient.builderProfile.count();
    
    console.log(`\n📊 Database Summary:`);
    console.log(`  Development: ${devUsers} users, ${devBuilders} builders`);
    console.log(`  Production: ${prodUsers} users, ${prodBuilders} builders`);
    
    // Check for Liam in both
    const devLiam = await devClient.user.findFirst({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    const prodLiam = await prodClient.user.findFirst({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    console.log(`\n✅ Liam's account:`);
    console.log(`  Development: ${devLiam ? 'Found' : 'Not found'}`);
    console.log(`  Production: ${prodLiam ? 'Found' : 'Not found'}`);
    
    console.log(chalk.green('\n✅ All data restoration completed successfully!'));
    console.log(chalk.yellow('\nMarketplace should now show all builders!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Restoration failed:'), error);
    process.exit(1);
  } finally {
    await devClient.$disconnect();
    await prodClient.$disconnect();
  }
}

// Run the restoration
main();