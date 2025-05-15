#!/usr/bin/env node

/**
 * Check avatar issues between dev and prod
 */

const { PrismaClient } = require('@prisma/client');

// Separate connections for dev and prod
const devPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL_DEV || process.env.DATABASE_URL
});

const prodPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL_PROD
});

async function checkAvatarIssues() {
  try {
    console.log('🔍 Checking avatar issues in dev and prod...\n');
    
    // Check Liam's profile in both environments
    const devLiam = await devPrisma.user.findUnique({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    const prodLiam = await prodPrisma.user.findUnique({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    console.log('📊 Liam\'s Avatar Status:');
    console.log('Dev:');
    console.log(`  - Avatar URL: ${devLiam?.builderProfile?.avatarUrl || 'Not set'}`);
    console.log(`  - Image URL: ${devLiam?.builderProfile?.imageUrl || 'Not set'}`);
    
    console.log('\nProd:');
    console.log(`  - Avatar URL: ${prodLiam?.builderProfile?.avatarUrl || 'Not set'}`);
    console.log(`  - Image URL: ${prodLiam?.builderProfile?.imageUrl || 'Not set'}`);
    
    // Check all builders with avatars
    console.log('\n🖼 Checking all builders with avatars:');
    
    const devBuildersWithAvatars = await devPrisma.builderProfile.findMany({
      where: {
        OR: [
          { avatarUrl: { not: null } },
          { imageUrl: { not: null } }
        ]
      },
      include: { user: true }
    });
    
    const prodBuildersWithAvatars = await prodPrisma.builderProfile.findMany({
      where: {
        OR: [
          { avatarUrl: { not: null } },
          { imageUrl: { not: null } }
        ]
      },
      include: { user: true }
    });
    
    console.log(`\nDev: ${devBuildersWithAvatars.length} builders with avatars`);
    devBuildersWithAvatars.forEach(builder => {
      console.log(`  - ${builder.user.email}: ${builder.avatarUrl || builder.imageUrl}`);
    });
    
    console.log(`\nProd: ${prodBuildersWithAvatars.length} builders with avatars`);
    prodBuildersWithAvatars.forEach(builder => {
      console.log(`  - ${builder.user.email}: ${builder.avatarUrl || builder.imageUrl}`);
    });
    
    // Check if the issue is with the path structure
    console.log('\n🔗 Checking avatar path structures:');
    const allAvatarUrls = new Set();
    
    [...devBuildersWithAvatars, ...prodBuildersWithAvatars].forEach(builder => {
      if (builder.avatarUrl) allAvatarUrls.add(builder.avatarUrl);
      if (builder.imageUrl) allAvatarUrls.add(builder.imageUrl);
    });
    
    allAvatarUrls.forEach(url => {
      if (url) {
        console.log(`  - ${url}`);
        if (url.startsWith('/')) {
          console.log('    ⚠️  Relative path - may not work in production');
        } else if (!url.startsWith('http')) {
          console.log('    ⚠️  Invalid URL format');
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking avatars:', error);
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkAvatarIssues();