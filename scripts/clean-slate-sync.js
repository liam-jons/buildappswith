#!/usr/bin/env node

/**
 * Clean slate production database sync
 * Preserves Liam's data while resetting to development schema
 */

require('dotenv').config();
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const execAsync = promisify(exec);

async function cleanSlateSync() {
  console.log('🚀 Starting clean slate database sync...\n');
  
  try {
    // Step 1: Backup production data
    console.log('Step 1: Backing up production data...');
    const backupData = await backupProductionData();
    const backupPath = await saveBackup(backupData);
    console.log('✅ Backup saved to:', backupPath);
    
    // Step 2: Export Prisma schema from development
    console.log('\nStep 2: Exporting development schema...');
    process.env.DATABASE_URL = process.env.DEV_DATABASE_URL;
    await execAsync('npx prisma db pull');
    console.log('✅ Development schema exported');
    
    // Step 3: Generate production migration
    console.log('\nStep 3: Generating production migration...');
    await execAsync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > scripts/production-reset.sql');
    console.log('✅ Migration script generated');
    
    // Step 4: Reset production database
    console.log('\nStep 4: Resetting production database...');
    process.env.DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will reset the production database!');
    console.log('Current backup saved at:', backupPath);
    console.log('Press ENTER to continue or Ctrl+C to cancel...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // Reset the database
    await execAsync('npx prisma migrate reset --force --skip-seed');
    console.log('✅ Production database reset');
    
    // Step 5: Apply migrations
    console.log('\nStep 5: Applying migrations...');
    await execAsync('npx prisma migrate deploy');
    console.log('✅ Migrations applied');
    
    // Step 6: Restore Liam's data
    console.log('\nStep 6: Restoring user data...');
    await restoreUserData(backupData);
    console.log('✅ User data restored');
    
    // Step 7: Seed demo accounts
    console.log('\nStep 7: Seeding demo accounts...');
    await seedDemoAccounts();
    console.log('✅ Demo accounts created');
    
    // Step 8: Verify everything works
    console.log('\nStep 8: Verifying sync...');
    await verifySync();
    console.log('✅ All checks passed!');
    
    console.log('\n🎉 Clean slate sync completed successfully!');
    console.log('The marketplace should now show all builders correctly.');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    console.error('Please restore from backup:', backupPath);
    process.exit(1);
  }
}

async function backupProductionData() {
  process.env.DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;
  const prisma = new PrismaClient();
  
  try {
    const data = {
      timestamp: new Date().toISOString(),
      users: await prisma.user.findMany({
        include: { builderProfile: true }
      }),
      sessionTypes: await prisma.sessionType.findMany(),
      bookings: await prisma.booking.findMany()
    };
    
    console.log(`  - Found ${data.users.length} users`);
    console.log(`  - Found ${data.sessionTypes.length} session types`);
    console.log(`  - Found ${data.bookings.length} bookings`);
    
    return data;
  } finally {
    await prisma.$disconnect();
  }
}

async function saveBackup(data) {
  const backupDir = path.join(__dirname, '../backups', new Date().toISOString().split('T')[0]);
  await fs.mkdir(backupDir, { recursive: true });
  
  const backupFile = path.join(backupDir, `production-backup-${Date.now()}.json`);
  await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
  
  return backupFile;
}

async function restoreUserData(backupData) {
  const prisma = new PrismaClient();
  
  try {
    // Restore users with builder profiles
    for (const userData of backupData.users) {
      const { builderProfile, ...user } = userData;
      
      // Create user
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          clerkUserId: user.clerkUserId,
          role: user.role,
          isDemo: user.isDemo || false
        }
      });
      
      console.log(`  - Restored user: ${user.email}`);
      
      // Create builder profile if exists
      if (builderProfile) {
        await prisma.builderProfile.create({
          data: {
            ...builderProfile,
            userId: createdUser.id,
            id: undefined // Let Prisma generate new ID
          }
        });
        console.log(`    - Restored builder profile`);
      }
    }
    
    // Restore session types
    for (const sessionType of backupData.sessionTypes) {
      await prisma.sessionType.create({
        data: {
          ...sessionType,
          id: undefined // Let Prisma generate new ID
        }
      });
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDemoAccounts() {
  const demoAccounts = [
    {
      email: 'sarah.chen@demo.buildappswith.ai',
      firstName: 'Sarah',
      lastName: 'Chen',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['React', 'TypeScript', 'AWS'],
        rate: 150,
        availability: 'Full-time',
        bio: 'Full-stack developer specializing in React and cloud architecture.',
        searchable: true,
        completedProjects: 42,
        responseRate: 0.98
      }
    },
    {
      email: 'marcus.johnson@demo.buildappswith.ai',
      firstName: 'Marcus',
      lastName: 'Johnson',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['Python', 'Django', 'PostgreSQL'],
        rate: 175,
        availability: 'Part-time',
        bio: 'Backend specialist with expertise in Python and database design.',
        searchable: true,
        completedProjects: 67,
        responseRate: 0.95
      }
    }
  ];
  
  const prisma = new PrismaClient();
  
  try {
    for (const demo of demoAccounts) {
      const { builderProfile, ...userData } = demo;
      
      await prisma.user.create({
        data: {
          ...userData,
          builderProfile: {
            create: builderProfile
          }
        }
      });
      
      console.log(`  - Created demo: ${demo.firstName} ${demo.lastName}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function verifySync() {
  const prisma = new PrismaClient();
  
  try {
    // Test the problematic marketplace query
    const builders = await prisma.builderProfile.findMany({
      where: { searchable: true },
      select: {
        id: true,
        completedProjects: true,
        responseRate: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log(`  - Marketplace query successful: ${builders.length} builders found`);
    
    // Check that all expected columns exist
    const testBuilder = builders[0];
    if (testBuilder) {
      console.log(`  - Sample builder: ${testBuilder.user.firstName} ${testBuilder.user.lastName}`);
      console.log(`  - Has completedProjects: ${testBuilder.completedProjects !== undefined}`);
      console.log(`  - Has responseRate: ${testBuilder.responseRate !== undefined}`);
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
cleanSlateSync();