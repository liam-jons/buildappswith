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
    
    console.log('📊 Liam\'s Image Status:');
    console.log('Dev:');
    console.log(`  - User imageUrl: ${devLiam?.imageUrl || 'Not set'}`);
    console.log(`  - Builder exists: ${devLiam?.builderProfile ? 'Yes' : 'No'}`);
    
    console.log('\nProd:');
    console.log(`  - User imageUrl: ${prodLiam?.imageUrl || 'Not set'}`);
    console.log(`  - Builder exists: ${prodLiam?.builderProfile ? 'Yes' : 'No'}`);
    
    // Check all users with avatars
    console.log('\n🖼 Checking all users with images:');
    
    const devUsersWithImages = await devPrisma.user.findMany({
      where: {
        imageUrl: { not: null }
      },
      include: { builderProfile: true }
    });
    
    const prodUsersWithImages = await prodPrisma.user.findMany({
      where: {
        imageUrl: { not: null }
      },
      include: { builderProfile: true }
    });
    
    console.log(`\nDev: ${devUsersWithImages.length} users with images`);
    devUsersWithImages.forEach(user => {
      console.log(`  - ${user.email}: ${user.imageUrl}`);
    });
    
    console.log(`\nProd: ${prodUsersWithImages.length} users with images`);
    prodUsersWithImages.forEach(user => {
      console.log(`  - ${user.email}: ${user.imageUrl}`);
    });
    
    // Check if the issue is with the path structure
    console.log('\n🔗 Checking image path structures:');
    const allImageUrls = new Set();
    
    [...devUsersWithImages, ...prodUsersWithImages].forEach(user => {
      if (user.imageUrl) allImageUrls.add(user.imageUrl);
    });
    
    allImageUrls.forEach(url => {
      if (url) {
        console.log(`  - ${url}`);
        if (url.startsWith('/')) {
          console.log('    ⚠️  Relative path - may not work in production');
        } else if (!url.startsWith('http')) {
          console.log('    ⚠️  Invalid URL format');
        }
      }
    });
    
    // Check for any builders using the correct field name
    console.log('\n📍 Builder profiles:');
    const devBuilders = await devPrisma.builderProfile.findMany({
      include: { user: true }
    });
    
    console.log(`Dev builder count: ${devBuilders.length}`);
    console.log('First few builder users:');
    devBuilders.slice(0, 3).forEach(builder => {
      console.log(`  - ${builder.user.email}: ${builder.user.imageUrl || 'No image'}`);
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