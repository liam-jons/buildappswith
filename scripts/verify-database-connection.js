#!/usr/bin/env node

/**
 * Script to verify current database connection
 * Critical for ensuring we're working with the correct environment
 */

const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying Database Connection...\n');
  
  // Show current environment
  const currentEnv = process.env.NODE_ENV || 'development';
  console.log(`Environment: ${chalk.blue(currentEnv)}`);
  
  // Check which DATABASE_URL is being used
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(chalk.red('❌ No DATABASE_URL found!'));
    process.exit(1);
  }
  
  // Extract database name from URL
  const urlParts = databaseUrl.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  const dbNameWithQuery = lastPart.split('?')[0];
  const dbName = dbNameWithQuery;
  const isDev = dbName.toLowerCase().includes('dev');
  const isProd = dbName.toLowerCase().includes('prod');
  
  console.log(`Database: ${chalk.yellow(dbName)}`);
  console.log(`Type: ${isDev ? chalk.green('DEVELOPMENT') : isProd ? chalk.red('PRODUCTION') : chalk.gray('UNKNOWN')}`);
  
  // Test actual connection
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log(chalk.green('✅ Database connection successful'));
    
    // Count users and builder profiles
    const userCount = await prisma.user.count();
    const builderCount = await prisma.builderProfile.count();
    const searchableBuilders = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    
    console.log(`\n📊 Database Stats:`);
    console.log(`  Users: ${chalk.blue(userCount)}`);
    console.log(`  Builder Profiles: ${chalk.blue(builderCount)}`);
    console.log(`  Searchable Builders: ${chalk.blue(searchableBuilders)}`);
    
    // Check for Liam's account
    const liamUser = await prisma.user.findFirst({
      where: { email: 'liam@buildappswith.com' }
    });
    
    if (liamUser) {
      console.log(`\n✅ Found Liam's account (ID: ${liamUser.id})`);
    } else {
      console.log(`\n⚠️  Liam's account not found with email: liam@buildappswith.com`);
    }
    
    // Check demo builders
    const demoBuilders = await prisma.user.count({
      where: { isDemo: true }
    });
    console.log(`  Demo Builders: ${chalk.blue(demoBuilders)}`);
    
  } catch (error) {
    console.error(chalk.red('\n❌ Database connection failed:'), error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(chalk.yellow('⚠️  CRITICAL REMINDERS:'));
  console.log('  • Production uses liam@buildappswith.com (NOT .ai)');
  console.log('  • Dev and Prod are SEPARATE databases');
  console.log('  • Always verify environment before changes');
  console.log('='.repeat(50) + '\n');
}

// Run the verification
verifyDatabaseConnection().catch(console.error);