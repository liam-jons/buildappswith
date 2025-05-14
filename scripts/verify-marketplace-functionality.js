#!/usr/bin/env node

/**
 * Script to verify marketplace functionality in both environments
 * Checks that builders appear correctly with all required fields
 */

const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const fs = require('fs');

async function verifyEnvironment(prisma, envName) {
  console.log(chalk.blue(`\n🔍 Verifying ${envName} marketplace...`));
  
  try {
    // Check total counts
    const totalUsers = await prisma.user.count();
    const totalBuilders = await prisma.builderProfile.count();
    const searchableBuilders = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    
    console.log(`📊 ${envName} Stats:`);
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Total Builders: ${totalBuilders}`);
    console.log(`  Searchable Builders: ${searchableBuilders}`);
    
    // Get builders with user data
    const builders = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: { user: true },
      take: 5 // Show first 5
    });
    
    console.log(`\n👥 Sample builders:`);
    builders.forEach((builder, i) => {
      console.log(`${i + 1}. ${builder.user.name}`);
      console.log(`   Email: ${builder.user.email}`);
      console.log(`   Headline: ${builder.headline || 'None'}`);
      console.log(`   Image: ${builder.user.imageUrl ? '✅' : '❌'}`);
    });
    
    // Check for Liam specifically
    const liam = await prisma.user.findFirst({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    if (liam) {
      console.log(chalk.green(`\n✅ Liam found:`));
      console.log(`  ID: ${liam.id}`);
      console.log(`  Has Profile: ${!!liam.builderProfile}`);
      console.log(`  Searchable: ${liam.builderProfile?.searchable || false}`);
    } else {
      console.log(chalk.red(`\n❌ Liam not found`));
    }
    
    // Check for critical relationships
    const userWithAllRelations = await prisma.user.findFirst({
      include: {
        accounts: true,
        sessions: true,
        builderProfile: true,
        clientProfile: true,
        bookingsAsClient: true
      }
    });
    
    console.log(`\n🔗 Database relationships:`);
    console.log(`  Accounts table: ${userWithAllRelations?.accounts ? '✅' : '❌'}`);
    console.log(`  Sessions table: ${userWithAllRelations?.sessions ? '✅' : '❌'}`);
    console.log(`  BuilderProfile: ${userWithAllRelations?.builderProfile ? '✅' : '❌'}`);
    console.log(`  Bookings: ${userWithAllRelations?.bookingsAsClient ? '✅' : '❌'}`);
    
    return searchableBuilders >= 18;
  } catch (error) {
    console.error(chalk.red(`❌ ${envName} verification failed:`), error.message);
    return false;
  }
}

async function main() {
  // Check development
  const devClient = new PrismaClient();
  const devOk = await verifyEnvironment(devClient, 'DEVELOPMENT');
  await devClient.$disconnect();
  
  // Check production
  const prodUrl = fs.existsSync('.env.production.local') ? 
    fs.readFileSync('.env.production.local', 'utf8')
      .split('\n')
      .find(line => line.startsWith('DATABASE_URL='))
      ?.split('=')[1]
      ?.replace(/["']/g, '') : null;
  
  if (prodUrl) {
    const prodClient = new PrismaClient({
      datasources: {
        db: {
          url: prodUrl
        }
      }
    });
    const prodOk = await verifyEnvironment(prodClient, 'PRODUCTION');
    await prodClient.$disconnect();
    
    // Final summary
    console.log(chalk.blue('\n📋 Final Status:'));
    console.log(`  Development: ${devOk ? chalk.green('✅ Ready') : chalk.red('❌ Issues')}`);
    console.log(`  Production: ${prodOk ? chalk.green('✅ Ready') : chalk.red('❌ Issues')}`);
    
    if (devOk && prodOk) {
      console.log(chalk.green('\n✅ Both marketplaces are ready!'));
      console.log(chalk.yellow('\nNote: If builders still don\'t appear in UI:'));
      console.log('1. Check for client-side filtering');
      console.log('2. Verify API routes are using correct queries');
      console.log('3. Clear browser cache and cookies');
      console.log('4. Check feature flags in environment');
    }
  }
}

main().catch(console.error);