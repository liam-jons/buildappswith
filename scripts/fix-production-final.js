#!/usr/bin/env node

/**
 * Final production fix - update Liam's profile and add demo accounts
 */

require('dotenv').config({ path: '.env.production.local' });

const PROD_DB_URL = process.env.DATABASE_URL || "postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require";
process.env.DATABASE_URL = PROD_DB_URL;

const { PrismaClient } = require('@prisma/client');

async function fixProductionFinal() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });
  
  try {
    console.log('🔧 Final production fix...\n');
    
    // 1. Update Liam's profile
    console.log('1. Updating Liam\'s profile...');
    
    const [liamUpdate] = await prisma.$queryRaw`
      UPDATE "BuilderProfile" 
      SET "completedProjects" = 50,
          "responseRate" = 0.95,
          "availableForHire" = true,
          "hourlyRate" = 250
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE email = 'liam@buildappswith.com'
      )
      RETURNING id
    `;
    
    console.log('✅ Updated Liam\'s profile');
    
    // 2. Create demo builders
    console.log('\n2. Creating demo builders...');
    
    const demos = [
      {
        email: 'sarah.chen@demo.buildappswith.ai',
        name: 'Sarah Chen',
        clerkId: 'demo_sarah_chen'
      },
      {
        email: 'marcus.johnson@demo.buildappswith.ai',
        name: 'Marcus Johnson',
        clerkId: 'demo_marcus_johnson'
      },
      {
        email: 'emily.davis@demo.buildappswith.ai',
        name: 'Emily Davis',
        clerkId: 'demo_emily_davis'
      }
    ];
    
    for (const demo of demos) {
      try {
        // Create user with raw SQL
        await prisma.$executeRaw`
          INSERT INTO "User" (email, name, "clerkId", "isDemo", "createdAt", "updatedAt", roles)
          VALUES (
            ${demo.email}, 
            ${demo.name}, 
            ${demo.clerkId}, 
            true, 
            NOW(), 
            NOW(), 
            ARRAY['BUILDER'::"UserRole"]
          )
          ON CONFLICT (email) DO NOTHING
        `;
        
        // Get user ID
        const [user] = await prisma.$queryRaw`
          SELECT id FROM "User" WHERE email = ${demo.email}
        `;
        
        if (user) {
          // Create builder profile
          await prisma.$executeRaw`
            INSERT INTO "BuilderProfile" (
              "userId", 
              bio, 
              "hourlyRate", 
              badges, 
              rating, 
              "availableForHire", 
              searchable, 
              "completedProjects", 
              "responseRate", 
              "createdAt", 
              "updatedAt"
            )
            VALUES (
              ${user.id},
              'Expert developer specializing in modern web technologies',
              ${150 + Math.floor(Math.random() * 50)},
              ARRAY['React', 'TypeScript', 'Node.js'],
              ${4.5 + Math.random() * 0.5},
              true,
              true,
              ${20 + Math.floor(Math.random() * 40)},
              ${0.90 + Math.random() * 0.09},
              NOW(),
              NOW()
            )
            ON CONFLICT ("userId") DO UPDATE
            SET searchable = true,
                "completedProjects" = EXCLUDED."completedProjects"
          `;
          
          console.log(`  ✅ Created demo: ${demo.name}`);
        }
      } catch (e) {
        console.log(`  ⚠️  ${demo.name}: ${e.message}`);
      }
    }
    
    // 3. Final verification
    console.log('\n3. Final verification...');
    
    const builders = await prisma.$queryRaw`
      SELECT 
        u.name,
        u.email,
        bp.searchable,
        bp."completedProjects",
        bp."responseRate",
        bp."hourlyRate"
      FROM "BuilderProfile" bp
      JOIN "User" u ON u.id = bp."userId"
      WHERE bp.searchable = true
      ORDER BY u."isDemo", u.name
    `;
    
    console.log(`\n✅ Production marketplace now has ${builders.length} searchable builders:`);
    builders.forEach(b => {
      console.log(`- ${b.name}: ${b.completedProjects} projects, $${b.hourlyRate}/hr`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionFinal();