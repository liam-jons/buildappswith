#!/usr/bin/env node

/**
 * Complete production database synchronization
 * Resets production to match development exactly
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

async function syncProductionDatabase() {
  console.log('🚀 Starting production database sync...');
  
  try {
    // 1. Create backup directory
    const backupDir = path.join(__dirname, '../backups', new Date().toISOString());
    await fs.mkdir(backupDir, { recursive: true });
    
    // 2. Backup production data
    console.log('📦 Backing up production data...');
    const backupFile = path.join(backupDir, 'production-backup.sql');
    await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${backupFile}`);
    
    // 3. Export Liam's data specifically
    console.log('💾 Exporting user data...');
    const userData = await exportUserData();
    await fs.writeFile(
      path.join(backupDir, 'user-data.json'), 
      JSON.stringify(userData, null, 2)
    );
    
    // 4. Reset production database
    console.log('🔄 Resetting production database...');
    await execAsync('npx prisma migrate reset --force --skip-seed');
    
    // 5. Apply all migrations
    console.log('📝 Applying migrations...');
    await execAsync('npx prisma migrate deploy');
    
    // 6. Restore user data
    console.log('♻️ Restoring user data...');
    await restoreUserData(userData);
    
    // 7. Seed demo accounts
    console.log('🌱 Seeding demo accounts...');
    await execAsync('npm run seed:demo-builders');
    
    // 8. Verify synchronization
    console.log('✅ Verifying sync...');
    await verifySchema();
    
    console.log('🎉 Production database sync completed!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

async function exportUserData() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'liam@buildappswith.ai' },
      include: { builderProfile: true }
    });
    
    return user;
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreUserData(userData) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // Restore user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        clerkUserId: userData.clerkUserId,
        role: userData.role
      }
    });
    
    // Restore builder profile if exists
    if (userData.builderProfile) {
      await prisma.builderProfile.create({
        data: {
          ...userData.builderProfile,
          userId: user.id
        }
      });
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

async function verifySchema() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    // Test query that uses all problematic fields
    const builders = await prisma.builderProfile.findMany({
      select: {
        completedProjects: true,
        responseRate: true,
        slug: true,
        clerkUserId: true
      }
    });
    
    console.log(`Found ${builders.length} builders with all required fields`);
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  syncProductionDatabase();
}

module.exports = { syncProductionDatabase };