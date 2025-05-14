#!/usr/bin/env node

/**
 * Fix PRODUCTION marketplace - ensure we're using production database
 */

require('dotenv').config();

// Force production database URL
process.env.DATABASE_URL = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL_PRODUCTION || process.env.DATABASE_URL;

console.log('Database URL check:', process.env.DATABASE_URL.includes('prod') ? 'PRODUCTION' : 'DEVELOPMENT');

const { PrismaClient } = require('@prisma/client');

async function fixProductionMarketplace() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing PRODUCTION marketplace...\n');
    
    // 1. Check database name
    const dbInfo = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Connected to database:', dbInfo[0].current_database);
    
    // 2. Count existing data
    const userCount = await prisma.user.count();
    const builderCount = await prisma.builderProfile.count();
    
    console.log(`Current state: ${userCount} users, ${builderCount} builder profiles`);
    
    // 3. Check Liam
    const liam = await prisma.user.findFirst({
      where: { email: 'liam@buildappswith.ai' },
      include: { BuilderProfile: true }
    });
    
    if (!liam) {
      console.log('❌ Liam not found in this database!');
      console.log('⚠️  Make sure DATABASE_URL points to production!');
      return;
    }
    
    console.log(`\nLiam found: ${liam.name}`);
    
    // 4. Ensure Liam has a builder profile
    if (!liam.BuilderProfile) {
      console.log('Creating builder profile for Liam...');
      await prisma.builderProfile.create({
        data: {
          userId: liam.id,
          bio: 'Founder of BuildAppsWith.ai',
          hourlyRate: 250,
          availableForHire: true,
          searchable: true,
          completedProjects: 50,
          responseRate: 0.95,
          badges: ['Founder', 'React', 'AI', 'TypeScript'],
          rating: 5.0
        }
      });
      console.log('✅ Created builder profile for Liam');
    } else {
      // Update to ensure searchable
      await prisma.builderProfile.update({
        where: { id: liam.BuilderProfile.id },
        data: {
          searchable: true,
          completedProjects: liam.BuilderProfile.completedProjects || 50,
          responseRate: liam.BuilderProfile.responseRate || 0.95
        }
      });
      console.log('✅ Updated Liam\'s profile to be searchable');
    }
    
    // 5. Final verification
    const searchableBuilders = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    
    console.log(`\n✅ Production marketplace now has ${searchableBuilders} searchable builders`);
    
    // 6. List all searchable builders
    const builders = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: { User: true }
    });
    
    console.log('\nSearchable builders:');
    builders.forEach(b => {
      console.log(`- ${b.User.name}: ${b.completedProjects} projects`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure you have the correct production DATABASE_URL!');
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionMarketplace();