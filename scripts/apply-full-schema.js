#!/usr/bin/env node

/**
 * Script to apply the full schema to both dev and prod databases
 * This restores all 19 models that the application needs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function applyFullSchema() {
  console.log(chalk.blue('🔄 Applying full schema to both databases...\n'));
  
  try {
    // Step 1: Backup current schema just in case
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    console.log(chalk.yellow('📋 Backing up current schema...'));
    fs.copyFileSync('prisma/schema.prisma', `prisma/schema.prisma.backup-${timestamp}`);
    
    // Step 2: Copy the full schema to be active
    console.log(chalk.yellow('\n📋 Activating full schema...'));
    fs.copyFileSync('prisma/schema.prisma.new', 'prisma/schema.prisma');
    console.log(chalk.green('✅ Full schema activated (19 models)'));
    
    // Step 3: Apply to development database
    console.log(chalk.yellow('\n🔨 Applying schema to DEVELOPMENT...'));
    execSync('npx prisma db push --force-reset', {
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log(chalk.green('✅ Development schema updated'));
    
    // Step 4: Apply to production database
    console.log(chalk.yellow('\n🔨 Applying schema to PRODUCTION...'));
    
    // Get production URL
    const prodUrl = fs.existsSync('.env.production.local') ? 
      fs.readFileSync('.env.production.local', 'utf8')
        .split('\n')
        .find(line => line.startsWith('DATABASE_URL='))
        ?.split('=')[1]
        ?.replace(/["']/g, '') : null;
    
    if (!prodUrl) {
      throw new Error('Production DATABASE_URL not found');
    }
    
    execSync('npx prisma db push --force-reset', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: prodUrl }
    });
    console.log(chalk.green('✅ Production schema updated'));
    
    // Step 5: Generate Prisma client
    console.log(chalk.yellow('\n🔧 Generating Prisma client...'));
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log(chalk.green('✅ Prisma client generated'));
    
    console.log(chalk.green('\n✅ Full schema applied to both databases!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('  1. Restore data to both databases');
    console.log('  2. Verify marketplace functionality');
    
  } catch (error) {
    console.error(chalk.red('\n❌ Schema update failed:'), error.message);
    process.exit(1);
  }
}

// Run the update
applyFullSchema();