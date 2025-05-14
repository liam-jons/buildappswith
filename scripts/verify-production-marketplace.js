#!/usr/bin/env node

/**
 * Script to verify production marketplace data
 * Checks that all builders are properly configured
 */

const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const fs = require('fs');

// Get production URL
const prodUrl = fs.existsSync('.env.production.local') ? 
  fs.readFileSync('.env.production.local', 'utf8')
    .split('\n')
    .find(line => line.startsWith('DATABASE_URL='))
    ?.split('=')[1]
    ?.replace(/["']/g, '') : null;

if (!prodUrl || !prodUrl.includes('prod')) {
  throw new Error('Production DATABASE_URL not found');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: prodUrl
    }
  }
});

async function verifyProduction() {
  console.log(chalk.blue('🔍 Verifying Production Marketplace...\n'));
  
  try {
    // Get all builders
    const builders = await prisma.builderProfile.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(chalk.green(`📊 Total Builder Profiles: ${builders.length}`));
    
    // Check searchable builders
    const searchableBuilders = builders.filter(b => b.searchable);
    console.log(chalk.green(`🔎 Searchable Builders: ${searchableBuilders.length}`));
    
    // Check demo builders
    const demoBuilders = builders.filter(b => b.user.isDemo);
    console.log(chalk.green(`🎭 Demo Builders: ${demoBuilders.length}`));
    
    // List all builders
    console.log(chalk.yellow('\n📋 All Builders:'));
    builders.forEach((builder, index) => {
      console.log(`\n${index + 1}. ${builder.user.name}`);
      console.log(`   Email: ${builder.user.email}`);
      console.log(`   Searchable: ${builder.searchable ? '✅' : '❌'}`);
      console.log(`   Demo: ${builder.user.isDemo ? '✅' : '❌'}`);
      console.log(`   Featured: ${builder.featured ? '✅' : '❌'}`);
      console.log(`   Headline: ${builder.headline || 'None'}`);
    });
    
    // Specific checks
    console.log(chalk.yellow('\n🔍 Specific Checks:'));
    
    // Check Liam
    const liam = builders.find(b => b.user.email === 'liam@buildappswith.com');
    if (liam) {
      console.log(chalk.green('\n✅ Liam\'s account:'));
      console.log(`   ID: ${liam.user.id}`);
      console.log(`   Searchable: ${liam.searchable}`);
      console.log(`   Roles: ${liam.user.roles}`);
    } else {
      console.log(chalk.red('\n❌ Liam\'s account not found'));
    }
    
    // Check demo builders are searchable
    const searchableDemos = demoBuilders.filter(b => b.searchable);
    console.log(chalk.green(`\n✅ Searchable Demo Builders: ${searchableDemos.length}/${demoBuilders.length}`));
    
    // Summary
    console.log(chalk.blue('\n📊 Summary:'));
    console.log(`  Total Builders: ${builders.length}`);
    console.log(`  Visible in Marketplace: ${searchableBuilders.length}`);
    console.log(`  Demo Accounts: ${demoBuilders.length}`);
    console.log(`  Real Accounts: ${builders.length - demoBuilders.length}`);
    
    if (searchableBuilders.length >= 18) {
      console.log(chalk.green('\n✅ Production marketplace is properly configured!'));
      console.log(chalk.green('All expected builders should be visible.'));
    } else {
      console.log(chalk.yellow('\n⚠️  Some builders might not be visible in the marketplace'));
      console.log('Check the searchable flag for each builder.');
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Verification failed:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyProduction();