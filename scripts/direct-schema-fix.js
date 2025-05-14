#!/usr/bin/env node

/**
 * Direct schema fix for production database
 * Adds missing columns without full reset
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function fixProductionSchema() {
  console.log('🔧 Applying direct schema fixes to production...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // 1. Check current state
    console.log('Step 1: Checking current database state...');
    const beforeCheck = await prisma.builderProfile.findMany({
      take: 1,
      select: { id: true }
    });
    console.log('✅ Database connection verified');
    
    // 2. Add missing columns
    console.log('\nStep 2: Adding missing columns...');
    
    const alterStatements = [
      // BuilderProfile missing columns
      {
        name: 'completedProjects',
        sql: `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "completedProjects" INTEGER DEFAULT 0`
      },
      {
        name: 'responseRate',
        sql: `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "responseRate" DECIMAL`
      },
      {
        name: 'slug',
        sql: `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "slug" TEXT`
      },
      {
        name: 'clerkUserId',
        sql: `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT`
      },
      {
        name: 'searchable',
        sql: `ALTER TABLE "BuilderProfile" ADD COLUMN IF NOT EXISTS "searchable" BOOLEAN DEFAULT false`
      },
      // User missing columns
      {
        name: 'isDemo',
        sql: `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false`
      }
    ];
    
    for (const statement of alterStatements) {
      try {
        console.log(`  - Adding column: ${statement.name}`);
        await prisma.$executeRawUnsafe(statement.sql);
        console.log(`    ✅ ${statement.name} added`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`    ⚠️  ${statement.name} already exists`);
        } else {
          throw error;
        }
      }
    }
    
    // 3. Update default values for existing records
    console.log('\nStep 3: Setting default values for existing records...');
    
    await prisma.$executeRaw`
      UPDATE "BuilderProfile" 
      SET "completedProjects" = 0 
      WHERE "completedProjects" IS NULL
    `;
    
    await prisma.$executeRaw`
      UPDATE "BuilderProfile" 
      SET "searchable" = false 
      WHERE "searchable" IS NULL
    `;
    
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "isDemo" = false 
      WHERE "isDemo" IS NULL
    `;
    
    console.log('✅ Default values set');
    
    // 4. Mark Liam as searchable
    console.log('\nStep 4: Updating Liam\'s builder profile...');
    
    const liam = await prisma.user.findUnique({
      where: { email: 'liam@buildappswith.ai' },
      include: { builderProfile: true }
    });
    
    if (liam && liam.builderProfile) {
      await prisma.builderProfile.update({
        where: { id: liam.builderProfile.id },
        data: {
          searchable: true,
          completedProjects: 50,
          responseRate: 0.95
        }
      });
      console.log('✅ Liam\'s profile updated');
    }
    
    // 5. Add demo accounts
    console.log('\nStep 5: Creating demo accounts...');
    await createDemoAccounts(prisma);
    
    // 6. Verify the fix
    console.log('\nStep 6: Verifying marketplace functionality...');
    const builders = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            isDemo: true
          }
        }
      }
    });
    
    console.log(`\n📊 Final Results:`);
    console.log(`  - Total searchable builders: ${builders.length}`);
    console.log(`  - Demo builders: ${builders.filter(b => b.user.isDemo).length}`);
    console.log(`  - Real builders: ${builders.filter(b => !b.user.isDemo).length}`);
    
    // Test the problematic fields
    const testQuery = await prisma.builderProfile.findFirst({
      select: {
        completedProjects: true,
        responseRate: true,
        searchable: true
      }
    });
    
    console.log(`\n✅ All required fields accessible!`);
    console.log('🎉 Schema fix completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createDemoAccounts(prisma) {
  const demos = [
    {
      email: 'sarah.chen@demo.buildappswith.ai',
      firstName: 'Sarah',
      lastName: 'Chen',
      clerkUserId: 'demo_sarah_chen',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['React', 'TypeScript', 'AWS'],
        rate: 150,
        availability: 'Full-time',
        bio: 'Full-stack developer specializing in React and cloud architecture.',
        yearsOfExperience: 8,
        searchable: true,
        completedProjects: 42,
        responseRate: 0.98
      }
    },
    {
      email: 'marcus.johnson@demo.buildappswith.ai',
      firstName: 'Marcus',
      lastName: 'Johnson',
      clerkUserId: 'demo_marcus_johnson',
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['Python', 'Django', 'PostgreSQL'],
        rate: 175,
        availability: 'Part-time',
        bio: 'Backend specialist with expertise in Python and database design.',
        yearsOfExperience: 10,
        searchable: true,
        completedProjects: 67,
        responseRate: 0.95
      }
    },
    {
      email: 'emily.davis@demo.buildappswith.ai',
      firstName: 'Emily',
      lastName: 'Davis',
      clerkUserId: 'demo_emily_davis',  
      role: 'BUILDER',
      isDemo: true,
      builderProfile: {
        expertise: ['Vue.js', 'Nuxt', 'TailwindCSS'],
        rate: 140,
        availability: 'Full-time',
        bio: 'Frontend developer passionate about creating beautiful user experiences.',
        yearsOfExperience: 5,
        searchable: true,
        completedProjects: 28,
        responseRate: 0.92
      }
    }
  ];
  
  for (const demo of demos) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: demo.email }
      });
      
      if (!existing) {
        const { builderProfile, ...userData } = demo;
        
        await prisma.user.create({
          data: {
            ...userData,
            builderProfile: {
              create: builderProfile
            }
          }
        });
        
        console.log(`  - Created demo: ${demo.firstName} ${demo.lastName}`);
      } else {
        console.log(`  - Demo already exists: ${demo.firstName} ${demo.lastName}`);
      }
    } catch (error) {
      console.error(`  - Failed to create ${demo.email}:`, error.message);
    }
  }
}

// Run it
fixProductionSchema()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });