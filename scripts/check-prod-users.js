#!/usr/bin/env node

/**
 * Check what users are in production
 */

require('dotenv').config({ path: '.env.production.local' });

const PROD_DB_URL = process.env.DATABASE_URL || "postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require";
process.env.DATABASE_URL = PROD_DB_URL;

const { PrismaClient } = require('@prisma/client');

async function checkProdUsers() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });
  
  try {
    console.log('Checking PRODUCTION users...\n');
    
    // 1. Count everything
    const userCount = await prisma.user.count();
    const builderCount = await prisma.builderProfile.count();
    
    console.log(`Total users: ${userCount}`);
    console.log(`Total builder profiles: ${builderCount}`);
    
    // 2. List all users
    console.log('\nAll users:');
    const users = await prisma.user.findMany({
      include: { BuilderProfile: true },
      take: 10
    });
    
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}): ${u.BuilderProfile ? 'HAS PROFILE' : 'NO PROFILE'}`);
    });
    
    // 3. Check if ANY builder profiles exist
    const builders = await prisma.builderProfile.findMany({
      include: { User: true }
    });
    
    console.log(`\nBuilder profiles (${builders.length} total):`);
    builders.forEach(b => {
      console.log(`- ${b.User.name}: searchable=${b.searchable}, projects=${b.completedProjects}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProdUsers();