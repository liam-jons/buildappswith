#!/usr/bin/env node

/**
 * Final marketplace fix with correct types
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function finalMarketplaceFix() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Final marketplace fix...\n');
    
    // 1. Check Liam's current state
    console.log('Step 1: Checking Liam\'s current state...');
    
    const liam = await prisma.$queryRaw`
      SELECT u.id, u.email, u.name, bp.searchable, bp."completedProjects"
      FROM "User" u
      LEFT JOIN "BuilderProfile" bp ON bp."userId" = u.id
      WHERE u.email = 'liam@buildappswith.ai'
    `;
    
    console.log('Liam\'s current state:', liam[0]);
    
    if (liam[0] && !liam[0].searchable) {
      // Update Liam's profile
      await prisma.$executeRaw`
        UPDATE "BuilderProfile" 
        SET "searchable" = true,
            "completedProjects" = 50,
            "responseRate" = 0.95,
            "availableForHire" = true,
            "hourlyRate" = 250
        WHERE "userId" = ${liam[0].id}
      `;
      console.log('✅ Updated Liam\'s profile to be searchable');
    }
    
    // 2. Create demo builders with correct role type
    console.log('\nStep 2: Creating demo builders...');
    
    const demos = [
      {
        email: 'sarah.chen@demo.buildappswith.ai',
        name: 'Sarah Chen',
        clerkId: 'demo_sarah_chen',
        role: 'BUILDER'
      },
      {
        email: 'marcus.johnson@demo.buildappswith.ai',
        name: 'Marcus Johnson',
        clerkId: 'demo_marcus_johnson',
        role: 'BUILDER'
      }
    ];
    
    for (const demo of demos) {
      try {
        // Check if exists
        const existing = await prisma.$queryRaw`
          SELECT id FROM "User" WHERE email = ${demo.email}
        `;
        
        if (existing.length === 0) {
          // Create user with correct role casting
          await prisma.$executeRaw`
            INSERT INTO "User" (email, name, "clerkId", "isDemo", "createdAt", "updatedAt", roles)
            VALUES (
              ${demo.email}, 
              ${demo.name}, 
              ${demo.clerkId}, 
              true, 
              NOW(), 
              NOW(), 
              ARRAY[${demo.role}::"UserRole"]
            )
          `;
          
          // Get the user ID
          const [user] = await prisma.$queryRaw`
            SELECT id FROM "User" WHERE email = ${demo.email}
          `;
          
          // Create builder profile
          await prisma.$executeRaw`
            INSERT INTO "BuilderProfile" (
              "userId", bio, "hourlyRate", badges, rating, "availableForHire", 
              searchable, "completedProjects", "responseRate", "createdAt", "updatedAt"
            )
            VALUES (
              ${user.id},
              'Expert developer with years of experience',
              150,
              ARRAY['React', 'TypeScript', 'AWS'],
              4.8,
              true,
              true,
              30,
              0.95,
              NOW(),
              NOW()
            )
          `;
          
          console.log(`  ✅ Created demo: ${demo.name}`);
        } else {
          // Update existing to be searchable
          await prisma.$executeRaw`
            UPDATE "BuilderProfile" 
            SET searchable = true,
                "completedProjects" = 30,
                "responseRate" = 0.95
            WHERE "userId" = ${existing[0].id}
          `;
          console.log(`  ✅ Updated existing demo: ${demo.name}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to create ${demo.email}:`, error.message);
      }
    }
    
    // 3. Final verification
    console.log('\nStep 3: Final marketplace verification...');
    
    const builders = await prisma.$queryRaw`
      SELECT 
        bp.id,
        bp.searchable,
        bp."completedProjects",
        bp."responseRate",
        bp."availableForHire",
        u.name,
        u.email,
        u."isDemo"
      FROM "BuilderProfile" bp
      JOIN "User" u ON u.id = bp."userId"
      WHERE bp.searchable = true
      ORDER BY u."isDemo", u.name
    `;
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total searchable builders: ${builders.length}`);
    console.log(`  - Demo builders: ${builders.filter(b => b.isDemo).length}`);
    console.log(`  - Real builders: ${builders.filter(b => !b.isDemo).length}`);
    
    console.log('\nSearchable builders:');
    builders.forEach(b => {
      console.log(`  - ${b.name} (${b.isDemo ? 'Demo' : 'Real'}): ${b.completedProjects} projects`);
    });
    
    // Test the marketplace API endpoint
    console.log('\n🧪 Testing marketplace API...');
    const testQuery = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: { user: true },
      take: 5
    });
    
    console.log(`API Query returned ${testQuery.length} builders`);
    
    console.log('\n🎉 Marketplace fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalMarketplaceFix();