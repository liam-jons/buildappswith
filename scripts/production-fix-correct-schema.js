#!/usr/bin/env node

/**
 * Production fix with correct column names
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function fixProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing production with correct schema...\n');
    
    // 1. Update Liam's profile
    console.log('Step 1: Updating Liam\'s builder profile...');
    
    await prisma.$executeRaw`
      UPDATE "BuilderProfile" 
      SET "searchable" = true,
          "completedProjects" = 50,
          "responseRate" = 0.95,
          "availableForHire" = true,
          "hourlyRate" = 250
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
        name: 'Sarah Chen',
        clerkId: 'demo_sarah_chen',
        isDemo: true,
        builderProfile: {
          bio: 'Full-stack developer specializing in React and cloud architecture.',
          hourlyRate: 150,
          completedProjects: 42,
          responseRate: 0.98,
          availableForHire: true,
          searchable: true,
          rating: 4.8,
          badges: ['React', 'TypeScript', 'AWS']
        }
      },
      {
        email: 'marcus.johnson@demo.buildappswith.ai',
        name: 'Marcus Johnson',
        clerkId: 'demo_marcus_johnson',
        isDemo: true,
        builderProfile: {
          bio: 'Backend specialist with expertise in Python and database design.',
          hourlyRate: 175,
          completedProjects: 67,
          responseRate: 0.95,
          availableForHire: true,
          searchable: true,
          rating: 4.9,
          badges: ['Python', 'Django', 'PostgreSQL']
        }
      },
      {
        email: 'emily.davis@demo.buildappswith.ai',
        name: 'Emily Davis',
        clerkId: 'demo_emily_davis',
        isDemo: true,
        builderProfile: {
          bio: 'Frontend developer passionate about creating beautiful user experiences.',
          hourlyRate: 140,
          completedProjects: 28,
          responseRate: 0.92,
          availableForHire: true,
          searchable: true,
          rating: 4.7,
          badges: ['Vue.js', 'Nuxt', 'TailwindCSS']
        }
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
            INSERT INTO "User" (email, name, "clerkId", "isDemo", "createdAt", "updatedAt", roles)
            VALUES (${demo.email}, ${demo.name}, ${demo.clerkId}, ${demo.isDemo}, NOW(), NOW(), ARRAY['BUILDER'])
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
              ${demo.builderProfile.bio},
              ${demo.builderProfile.hourlyRate},
              ${demo.builderProfile.badges},
              ${demo.builderProfile.rating},
              ${demo.builderProfile.availableForHire},
              ${demo.builderProfile.searchable},
              ${demo.builderProfile.completedProjects},
              ${demo.builderProfile.responseRate},
              NOW(),
              NOW()
            )
          `;
          
          console.log(`  ✅ Created demo: ${demo.name}`);
        } else {
          console.log(`  ⚠️ Demo already exists: ${demo.name}`);
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
        bp."availableForHire",
        u.name,
        u."isDemo"
      FROM "BuilderProfile" bp
      JOIN "User" u ON u.id = bp."userId"
      WHERE bp.searchable = true
    `;
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total searchable builders: ${builders.length}`);
    console.log(`  - Demo builders: ${builders.filter(b => b.isDemo).length}`);
    console.log(`  - Real builders: ${builders.filter(b => !b.isDemo).length}`);
    
    // List all builders
    console.log('\nSearchable builders:');
    builders.forEach(b => {
      console.log(`  - ${b.name} (${b.isDemo ? 'Demo' : 'Real'}): ${b.completedProjects} projects, ${b.responseRate}% response rate`);
    });
    
    console.log('\n🎉 Production fix completed!');
    console.log('The marketplace should now show all builders.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProduction();