#!/usr/bin/env node

/**
 * Simple marketplace test with actual production schema
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testMarketplace() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing marketplace with actual schema...\n');
    
    // 1. Count all builders
    const totalBuilders = await prisma.builderProfile.count();
    console.log(`Total builder profiles: ${totalBuilders}`);
    
    // 2. Count searchable builders
    const searchableBuilders = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    console.log(`Searchable builders: ${searchableBuilders}`);
    
    // 3. List builders with basic fields
    const builders = await prisma.builderProfile.findMany({
      select: {
        id: true,
        searchable: true,
        availableForHire: true,
        completedProjects: true,
        responseRate: true,
        User: {
          select: {
            name: true,
            email: true,
            isDemo: true
          }
        }
      },
      where: { searchable: true }
    });
    
    console.log(`\nSearchable builders found: ${builders.length}`);
    builders.forEach(b => {
      console.log(`- ${b.User.name} (${b.User.email}): searchable=${b.searchable}, projects=${b.completedProjects}`);
    });
    
    // 4. Check Liam specifically
    const liam = await prisma.user.findUnique({
      where: { email: 'liam@buildappswith.ai' },
      include: { BuilderProfile: true }
    });
    
    console.log('\nLiam\'s profile:');
    if (liam && liam.BuilderProfile) {
      console.log(`- Has builder profile: Yes`);
      console.log(`- Searchable: ${liam.BuilderProfile.searchable}`);
      console.log(`- Projects: ${liam.BuilderProfile.completedProjects}`);
    } else {
      console.log('- No builder profile found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMarketplace();