#!/usr/bin/env node

/**
 * Final production fix - minimal and direct
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function finalFix() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Final production fix...\n');
    
    // 1. Update Liam's profile with direct SQL to avoid schema issues
    console.log('Step 1: Updating Liam\'s builder profile...');
    
    await prisma.$executeRaw`
      UPDATE "BuilderProfile" 
      SET "searchable" = true,
          "completedProjects" = 50,
          "responseRate" = 0.95
      WHERE "userId" IN (
        SELECT id FROM "User" 
        WHERE email = 'liam@buildappswith.ai'
      )
    `;
    
    console.log('✅ Liam\'s profile updated');
    
    // 2. Create demo builders
    console.log('\nStep 2: Creating demo builders...');
    
    const demos = [
      {
        email: 'sarah.chen@demo.buildappswith.ai',
        firstName: 'Sarah',
        lastName: 'Chen',
        clerkUserId: 'demo_sarah_chen',
        role: 'BUILDER',
        isDemo: true
      },
      {
        email: 'marcus.johnson@demo.buildappswith.ai',
        firstName: 'Marcus',
        lastName: 'Johnson',
        clerkUserId: 'demo_marcus_johnson',
        role: 'BUILDER',
        isDemo: true
      }
    ];
    
    for (const demo of demos) {
      try {
        // Check if exists
        const existing = await prisma.$queryRaw`
          SELECT id FROM "User" WHERE email = ${demo.email}
        `;
        
        if (existing.length === 0) {
          // Create user
          await prisma.$executeRaw`
            INSERT INTO "User" (email, "firstName", "lastName", "clerkUserId", role, "isDemo", "createdAt", "updatedAt")
            VALUES (${demo.email}, ${demo.firstName}, ${demo.lastName}, ${demo.clerkUserId}, ${demo.role}, ${demo.isDemo}, NOW(), NOW())
          `;
          
          // Get the user ID
          const [user] = await prisma.$queryRaw`
            SELECT id FROM "User" WHERE email = ${demo.email}
          `;
          
          // Create builder profile
          await prisma.$executeRaw`
            INSERT INTO "BuilderProfile" ("userId", expertise, rate, availability, bio, "yearsOfExperience", searchable, "completedProjects", "responseRate", "createdAt", "updatedAt")
            VALUES (
              ${user.id},
              ARRAY['React', 'TypeScript', 'AWS'],
              150,
              'Full-time',
              'Expert developer',
              5,
              true,
              30,
              0.95,
              NOW(),
              NOW()
            )
          `;
          
          console.log(`  ✅ Created demo: ${demo.firstName} ${demo.lastName}`);
        } else {
          console.log(`  ⚠️ Demo already exists: ${demo.firstName} ${demo.lastName}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to create ${demo.email}:`, error.message);
      }
    }
    
    // 3. Verify final state
    console.log('\nStep 3: Verifying marketplace...');
    
    const builders = await prisma.$queryRaw`
      SELECT 
        bp.id,
        bp.searchable,
        bp."completedProjects",
        bp."responseRate",
        u."firstName",
        u."lastName",
        u."isDemo"
      FROM "BuilderProfile" bp
      JOIN "User" u ON u.id = bp."userId"
      WHERE bp.searchable = true
    `;
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total searchable builders: ${builders.length}`);
    console.log(`  - Demo builders: ${builders.filter(b => b.isDemo).length}`);
    console.log(`  - Real builders: ${builders.filter(b => !b.isDemo).length}`);
    
    console.log('\n🎉 Production fix completed!');
    console.log('The marketplace should now work correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalFix();