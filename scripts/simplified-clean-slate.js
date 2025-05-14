#!/usr/bin/env node

/**
 * Simplified clean slate sync for buildappswith
 * Works with current environment setup
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

async function runCleanSlate() {
  console.log('🚀 Starting clean slate database sync...\n');
  
  try {
    // Step 1: Backup production data
    console.log('Step 1: Backing up production data...');
    const backupData = await backupCurrentData();
    const backupPath = await saveBackup(backupData);
    console.log('✅ Backup saved to:', backupPath);
    
    // Step 2: Get confirmation
    console.log('\n⚠️  WARNING: This will reset the production database!');
    console.log('Backup saved at:', backupPath);
    console.log('\nPress ENTER to continue or Ctrl+C to cancel...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
    // Step 3: Reset and migrate
    console.log('\nStep 3: Resetting database with Prisma migrations...');
    await execAsync('npx prisma migrate reset --force --skip-seed');
    console.log('✅ Database reset complete');
    
    // Step 4: Restore data
    console.log('\nStep 4: Restoring user data...');
    await restoreData(backupData);
    console.log('✅ Data restored');
    
    // Step 5: Add demo accounts
    console.log('\nStep 5: Creating demo accounts...');
    await createDemoAccounts();
    console.log('✅ Demo accounts created');
    
    // Step 6: Verify
    console.log('\nStep 6: Verifying marketplace...');
    await verifyMarketplace();
    console.log('✅ Verification complete');
    
    console.log('\n🎉 Clean slate sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

async function backupCurrentData() {
  const prisma = new PrismaClient();
  
  try {
    // Get users with their builder profiles
    const users = await prisma.user.findMany({
      include: { 
        builderProfile: true
      }
    });
    
    // Get session types separately
    const sessionTypes = await prisma.sessionType.findMany();
    
    const data = {
      timestamp: new Date().toISOString(),
      users: users,
      sessionTypes: sessionTypes
    };
    
    console.log(`  - Found ${data.users.length} users`);
    const builders = data.users.filter(u => u.builderProfile);
    console.log(`  - Found ${builders.length} builders`);
    console.log(`  - Found ${data.sessionTypes.length} session types`);
    
    return data;
  } finally {
    await prisma.$disconnect();
  }
}

async function saveBackup(data) {
  const backupDir = path.join(__dirname, '../backups', new Date().toISOString().split('T')[0]);
  await fs.mkdir(backupDir, { recursive: true });
  
  const backupFile = path.join(backupDir, `clean-slate-${Date.now()}.json`);
  await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
  
  return backupFile;
}

async function restoreData(backupData) {
  const prisma = new PrismaClient();
  
  try {
    // Create a map of old user IDs to new user IDs
    const userIdMap = {};
    
    // Restore users first
    for (const userData of backupData.users) {
      const { builderProfile, ...user } = userData;
      
      // Skip demo accounts from backup
      if (user.email.includes('@demo.')) continue;
      
      // Create user
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          clerkUserId: user.clerkUserId,
          role: user.role
        }
      });
      
      // Map old ID to new ID
      userIdMap[user.id] = createdUser.id;
      
      console.log(`  - Restored: ${user.email}`);
      
      // Create builder profile if exists
      if (builderProfile) {
        await prisma.builderProfile.create({
          data: {
            ...builderProfile,
            userId: createdUser.id,
            id: undefined,
            // Ensure all required fields
            completedProjects: builderProfile.completedProjects || 0,
            searchable: builderProfile.searchable || false
          }
        });
        console.log(`    - With builder profile`);
      }
    }
    
    // Restore session types
    for (const sessionType of backupData.sessionTypes) {
      // Only restore if we have the user
      if (userIdMap[sessionType.userId]) {
        await prisma.sessionType.create({
          data: {
            ...sessionType,
            userId: userIdMap[sessionType.userId],
            id: undefined
          }
        });
      }
    }
    
    console.log(`  - Restored ${backupData.sessionTypes.length} session types`);
    
  } finally {
    await prisma.$disconnect();
  }
}

async function createDemoAccounts() {
  const demos = [
    {
      email: 'sarah.chen@demo.buildappswith.ai',
      firstName: 'Sarah',
      lastName: 'Chen',
      clerkUserId: 'demo_sarah_chen',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['React', 'TypeScript', 'AWS'],
        rate: 150,
        availability: 'Full-time',
        bio: 'Full-stack developer specializing in React and cloud architecture.',
        yearsOfExperience: 8,
        searchable: true,
        completedProjects: 42,
        responseRate: 0.98
      }
    },
    {
      email: 'marcus.johnson@demo.buildappswith.ai',
      firstName: 'Marcus',
      lastName: 'Johnson',
      clerkUserId: 'demo_marcus_johnson',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['Python', 'Django', 'PostgreSQL'],
        rate: 175,
        availability: 'Part-time',
        bio: 'Backend specialist with expertise in Python and database design.',
        yearsOfExperience: 10,
        searchable: true,
        completedProjects: 67,
        responseRate: 0.95
      }
    },
    {
      email: 'emily.davis@demo.buildappswith.ai',
      firstName: 'Emily',
      lastName: 'Davis',
      clerkUserId: 'demo_emily_davis',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['Vue.js', 'Nuxt', 'TailwindCSS'],
        rate: 140,
        availability: 'Full-time',
        bio: 'Frontend developer passionate about creating beautiful user experiences.',
        yearsOfExperience: 5,
        searchable: true,
        completedProjects: 28,
        responseRate: 0.92
      }
    }
  ];
  
  const prisma = new PrismaClient();
  
  try {
    for (const demo of demos) {
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

async function verifyMarketplace() {
  const prisma = new PrismaClient();
  
  try {
    const builders = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            isDemo: true
          }
        }
      }
    });
    
    console.log(`\n  Marketplace Status:`);
    console.log(`  - Total builders: ${builders.length}`);
    console.log(`  - Demo builders: ${builders.filter(b => b.user.isDemo).length}`);
    console.log(`  - Real builders: ${builders.filter(b => !b.user.isDemo).length}`);
    
    // Check for required fields
    const missingFields = builders.filter(b => 
      b.completedProjects === null || 
      b.completedProjects === undefined
    );
    
    if (missingFields.length > 0) {
      console.log(`  ⚠️  ${missingFields.length} builders missing required fields`);
    } else {
      console.log(`  ✅ All builders have required fields`);
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run it
runCleanSlate();