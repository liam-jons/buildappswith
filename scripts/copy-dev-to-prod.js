#!/usr/bin/env node

/**
 * Script to copy data from development to production
 * Both databases now have matching schemas
 */

const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const fs = require('fs');

// Create separate Prisma clients for dev and prod
const devClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const prodUrl = fs.existsSync('.env.production.local') ? 
  fs.readFileSync('.env.production.local', 'utf8')
    .split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    ?.split('=')[1]
    ?.replace(/["']/g, '') : null;

if (!prodUrl || !prodUrl.includes('prod')) {
  throw new Error('Production DATABASE_URL not found');
}

const prodClient = new PrismaClient({
  datasources: {
    db: {
      url: prodUrl
    }
  }
});

async function copyDevToProd() {
  console.log(chalk.blue('🔄 Copying data from development to production...\n'));
  
  try {
    // First, clear production data (we have a backup)
    console.log(chalk.yellow('📥 Clearing existing production data...'));
    await prodClient.sessionType.deleteMany();
    await prodClient.builderProfile.deleteMany();
    await prodClient.clientProfile.deleteMany();
    await prodClient.user.deleteMany();
    console.log(chalk.green('✅ Production data cleared\n'));
    
    // Copy users
    console.log(chalk.green('👤 Copying users...'));
    const devUsers = await devClient.user.findMany();
    for (const user of devUsers) {
      await prodClient.user.create({ data: user });
    }
    console.log(`✅ Copied ${devUsers.length} users`);
    
    // Copy builder profiles
    console.log(chalk.green('\n🔨 Copying builder profiles...'));
    const devBuilders = await devClient.builderProfile.findMany();
    for (const builder of devBuilders) {
      await prodClient.builderProfile.create({ data: builder });
    }
    console.log(`✅ Copied ${devBuilders.length} builder profiles`);
    
    // Copy client profiles
    console.log(chalk.green('\n👥 Copying client profiles...'));
    const devClients = await devClient.clientProfile.findMany();
    for (const client of devClients) {
      await prodClient.clientProfile.create({ data: client });
    }
    console.log(`✅ Copied ${devClients.length} client profiles`);
    
    // Copy session types
    console.log(chalk.green('\n📅 Copying session types...'));
    const devSessions = await devClient.sessionType.findMany();
    for (const session of devSessions) {
      await prodClient.sessionType.create({ data: session });
    }
    console.log(`✅ Copied ${devSessions.length} session types`);
    
    // Verify the copy
    console.log(chalk.blue('\n🔍 Verifying production data...'));
    const prodUserCount = await prodClient.user.count();
    const prodBuilderCount = await prodClient.builderProfile.count();
    const prodSearchableCount = await prodClient.builderProfile.count({
      where: { searchable: true }
    });
    const prodDemoCount = await prodClient.user.count({
      where: { isDemo: true }
    });
    
    console.log(`\n📊 Production Database Summary:`);
    console.log(`  Total Users: ${chalk.green(prodUserCount)}`);
    console.log(`  Builder Profiles: ${chalk.green(prodBuilderCount)}`);
    console.log(`  Searchable Builders: ${chalk.green(prodSearchableCount)}`);
    console.log(`  Demo Users: ${chalk.green(prodDemoCount)}`);
    
    // Verify Liam's account
    const liam = await prodClient.user.findFirst({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    if (liam) {
      console.log(chalk.green(`\n✅ Liam's account verified:`));
      console.log(`  ID: ${liam.id}`);
      console.log(`  Has Builder Profile: ${!!liam.builderProfile}`);
      console.log(`  Is Searchable: ${liam.builderProfile?.searchable || false}`);
    }
    
    console.log(chalk.green('\n✅ Data copy completed successfully!'));
    console.log(chalk.yellow('\nProduction marketplace should now show all builders!'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Copy failed:'), error);
    process.exit(1);
  } finally {
    await devClient.$disconnect();
    await prodClient.$disconnect();
  }
}

// Run the copy
copyDevToProd();