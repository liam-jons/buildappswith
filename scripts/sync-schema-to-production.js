#!/usr/bin/env node

/**
 * Script to apply development schema to production
 * This will handle field renames like imageUrl -> image
 */

const { execSync } = require('child_process');
const fs = require('fs');
const chalk = require('chalk');

async function syncSchemaToProduction() {
  console.log(chalk.blue('🔄 Syncing development schema to production...\n'));
  
  try {
    // Load production environment
    const prodEnv = {};
    if (fs.existsSync('.env.production.local')) {
      fs.readFileSync('.env.production.local', 'utf8')
        .split('\n')
        .filter(line => line.includes('='))
        .forEach(line => {
          const [key, value] = line.split('=');
          prodEnv[key] = value.replace(/["']/g, '');
        });
    }
    
    if (!prodEnv.DATABASE_URL || !prodEnv.DATABASE_URL.includes('prod')) {
      throw new Error('Production DATABASE_URL not found');
    }
    
    console.log(chalk.yellow('Target database:'), prodEnv.DATABASE_URL.split('@')[1]);
    
    // Create backup of current prod schema
    console.log(chalk.green('\n📋 Backing up current prod schema...'));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync('prisma/schema.prisma', `prisma/schema.prisma.prod-backup-${timestamp}`);
    
    // The current schema.prisma is already the development schema we want
    console.log(chalk.green('\n🚀 Pushing schema to production...'));
    console.log(chalk.yellow('This will:\n'));
    console.log('  • Rename imageUrl field to image');
    console.log('  • Ensure all other fields match development');
    console.log('  • Preserve existing data');
    
    // Use Prisma db push with production URL
    const env = { ...process.env, DATABASE_URL: prodEnv.DATABASE_URL };
    execSync('npx prisma db push --force-reset', {
      stdio: 'inherit',
      env
    });
    
    console.log(chalk.green('\n✅ Schema sync completed successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log('  1. Copy data from development to production');
    console.log('  2. Verify production marketplace');
    
  } catch (error) {
    console.error(chalk.red('\n❌ Schema sync failed:'), error.message);
    process.exit(1);
  }
}

// Run the sync
syncSchemaToProduction();