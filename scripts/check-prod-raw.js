#!/usr/bin/env node

/**
 * Check production data with raw SQL
 */

require('dotenv').config({ path: '.env.production.local' });

const PROD_DB_URL = process.env.DATABASE_URL || "postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require";
process.env.DATABASE_URL = PROD_DB_URL;

const { PrismaClient } = require('@prisma/client');

async function checkProdRaw() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });
  
  try {
    console.log('Checking PRODUCTION with raw SQL...\n');
    
    // 1. Check users
    const users = await prisma.$queryRaw`
      SELECT id, name, email FROM "User"
    `;
    
    console.log(`Users (${users.length}):`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email})`);
    });
    
    // 2. Check builder profiles
    const builders = await prisma.$queryRaw`
      SELECT 
        bp.id,
        bp."userId",
        bp.searchable,
        bp."completedProjects",
        u.name,
        u.email
      FROM "BuilderProfile" bp
      JOIN "User" u ON u.id = bp."userId"
    `;
    
    console.log(`\nBuilder profiles (${builders.length}):`);
    builders.forEach(b => {
      console.log(`- ${b.name} (${b.email}): searchable=${b.searchable}, projects=${b.completedProjects}`);
    });
    
    // 3. Update to make searchable if needed
    const unsearchable = builders.filter(b => !b.searchable);
    if (unsearchable.length > 0) {
      console.log(`\nMaking ${unsearchable.length} builders searchable...`);
      
      await prisma.$executeRaw`
        UPDATE "BuilderProfile" 
        SET searchable = true,
            "completedProjects" = COALESCE("completedProjects", 50)
      `;
      
      console.log('✅ All builders now searchable');
    }
    
    // 4. Final check
    const searchableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "BuilderProfile"
      WHERE searchable = true
    `;
    
    console.log(`\n✅ Final state: ${searchableCount[0].count} searchable builders`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProdRaw();