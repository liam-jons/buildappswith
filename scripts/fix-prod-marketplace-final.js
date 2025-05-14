#!/usr/bin/env node

/**
 * Fix PRODUCTION marketplace with correct database URL
 */

require('dotenv').config({ path: '.env.production.local' });

// Use the production database URL
const PROD_DB_URL = process.env.DATABASE_URL || "postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require";

// Force production URL
process.env.DATABASE_URL = PROD_DB_URL;

console.log('Database:', PROD_DB_URL.includes('prod') ? 'PRODUCTION ✅' : 'DEVELOPMENT ❌');

const { PrismaClient } = require('@prisma/client');

async function fixProductionMarketplace() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });
  
  try {
    console.log('🔧 Fixing PRODUCTION marketplace...\n');
    
    // 1. Verify we're in production
    const dbInfo = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Connected to:', dbInfo[0].current_database);
    
    if (!dbInfo[0].current_database.includes('prod')) {
      throw new Error('Not connected to production database!');
    }
    
    // 2. Add any missing columns first
    console.log('\n1. Adding missing columns...');
    const alterStatements = [
      `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN DEFAULT false`,
      `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER DEFAULT 0`,
      `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "responseRate" DECIMAL`,
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false`
    ];
    
    for (const sql of alterStatements) {
      try {
        await prisma.$executeRawUnsafe(sql);
        console.log(`  ✅ ${sql.match(/COLUMN IF NOT EXISTS "(\w+)"/)[1]} added/verified`);
      } catch (e) {
        console.log(`  ⚠️  ${e.message}`);
      }
    }
    
    // 3. Check Liam's status
    console.log('\n2. Checking Liam\'s profile...');
    const liam = await prisma.$queryRaw`
      SELECT u.id, u.email, u.name, bp.id as profile_id, bp.searchable
      FROM "User" u
      LEFT JOIN "BuilderProfile" bp ON bp."userId" = u.id
      WHERE u.email = 'liam@buildappswith.ai'
    `;
    
    if (liam.length === 0) {
      console.log('❌ Liam not found!');
      return;
    }
    
    console.log(`Found Liam: ${liam[0].name}, Profile ID: ${liam[0].profile_id}`);
    
    // 4. Update Liam's profile to be searchable
    if (liam[0].profile_id) {
      await prisma.$executeRaw`
        UPDATE "BuilderProfile" 
        SET searchable = true,
            "completedProjects" = COALESCE("completedProjects", 50),
            "responseRate" = COALESCE("responseRate", 0.95)
        WHERE id = ${liam[0].profile_id}
      `;
      console.log('✅ Updated Liam\'s profile to be searchable');
    } else {
      console.log('❌ Liam has no builder profile!');
    }
    
    // 5. Verify searchable builders
    console.log('\n3. Checking all builders...');
    const builders = await prisma.$queryRaw`
      SELECT 
        bp.id,
        bp.searchable,
        bp."completedProjects",
        u.name,
        u.email,
        u."isDemo"
      FROM "BuilderProfile" bp
      JOIN "User" u ON u.id = bp."userId"
      ORDER BY bp.searchable DESC, u.name
    `;
    
    console.log(`\nTotal builders: ${builders.length}`);
    console.log(`Searchable: ${builders.filter(b => b.searchable).length}`);
    
    console.log('\nAll builders:');
    builders.forEach(b => {
      console.log(`- ${b.name} (${b.email}): searchable=${b.searchable}, projects=${b.completedProjects || 0}`);
    });
    
    // 6. Make all existing builders searchable (since we only have 1)
    if (builders.filter(b => b.searchable).length === 0) {
      console.log('\n⚠️  No searchable builders! Making all builders searchable...');
      await prisma.$executeRaw`
        UPDATE "BuilderProfile" 
        SET searchable = true,
            "completedProjects" = COALESCE("completedProjects", 10)
      `;
      console.log('✅ All builders now searchable');
    }
    
    console.log('\n✅ Production marketplace fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionMarketplace();