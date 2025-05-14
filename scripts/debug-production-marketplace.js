/**
 * Comprehensive production debugging script for marketplace visibility issue
 * Run this directly in production to identify the root cause
 */

const { PrismaClient } = require('@prisma/client');

async function debugProductionMarketplace() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  console.log('=== PRODUCTION MARKETPLACE DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('Time:', new Date().toISOString());
  
  try {
    // 1. Basic connection test
    console.log('\n1. Database Connection Test:');
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✓ Database connected successfully');
    
    // 2. Check BuilderProfile schema
    console.log('\n2. BuilderProfile Schema Check:');
    const schemaCheck = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile' 
      AND column_name IN ('searchable', 'featured', 'displayName', 'topSkills', 'expertiseAreas')
      ORDER BY column_name
    `;
    schemaCheck.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Count total profiles
    console.log('\n3. Profile Counts:');
    const totalProfiles = await prisma.builderProfile.count();
    console.log('   Total profiles:', totalProfiles);
    
    const searchableProfiles = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    console.log('   Searchable profiles:', searchableProfiles);
    
    const featuredProfiles = await prisma.builderProfile.count({
      where: { featured: true }
    });
    console.log('   Featured profiles:', featuredProfiles);
    
    // 4. Check specific profile values
    console.log('\n4. Sample Profile Values:');
    const sampleProfiles = await prisma.builderProfile.findMany({
      take: 3,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true
          }
        }
      }
    });
    
    sampleProfiles.forEach((profile, index) => {
      console.log(`\n   Profile ${index + 1}:`);
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - User: ${profile.user?.name} (${profile.user?.email})`);
      console.log(`   - Searchable: ${profile.searchable}`);
      console.log(`   - Featured: ${profile.featured}`);
      console.log(`   - Display Name: ${profile.displayName}`);
      console.log(`   - Has User Image: ${!!profile.user?.imageUrl}`);
    });
    
    // 5. Test the exact query from marketplace-service.ts
    console.log('\n5. Testing Marketplace Service Query:');
    const marketplaceQuery = await prisma.builderProfile.findMany({
      where: {
        searchable: true
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            isDemo: true
          }
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                slug: true,
                domain: true
              }
            }
          },
          orderBy: {
            proficiency: 'desc'
          },
          take: 10
        }
      }
    });
    console.log('   Query returned', marketplaceQuery.length, 'profiles');
    
    // 6. Check for any errors in the exact service query
    console.log('\n6. Testing Service Query with Error Catching:');
    try {
      const testQuery = await prisma.builderProfile.count({
        where: {
          searchable: true
        }
      });
      console.log('   Count query successful:', testQuery);
    } catch (error) {
      console.log('   Count query error:', error.message);
    }
    
    // 7. Check Liam's profile specifically
    console.log('\n7. Checking Liam\'s Profile:');
    const liamProfile = await prisma.builderProfile.findFirst({
      where: {
        user: {
          OR: [
            { name: { contains: 'Liam', mode: 'insensitive' } },
            { email: { contains: 'liamj', mode: 'insensitive' } }
          ]
        }
      },
      include: {
        user: true
      }
    });
    
    if (liamProfile) {
      console.log('   Found Liam\'s profile:');
      console.log('   - ID:', liamProfile.id);
      console.log('   - Searchable:', liamProfile.searchable);
      console.log('   - Featured:', liamProfile.featured);
      console.log('   - User Name:', liamProfile.user?.name);
      console.log('   - User Email:', liamProfile.user?.email);
    } else {
      console.log('   Liam\'s profile NOT FOUND');
    }
    
    // 8. Test API endpoints
    console.log('\n8. Testing API Endpoints:');
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
      console.log('   Base URL:', baseUrl);
      
      try {
        const fetch = require('node-fetch');
        const response = await fetch(`${baseUrl}/api/marketplace/builders?limit=1`);
        console.log('   API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('   API response data count:', data.data?.length || 0);
          console.log('   API pagination total:', data.pagination?.total || 0);
        }
      } catch (fetchError) {
        console.log('   API fetch error:', fetchError.message);
      }
    } else {
      console.log('   NEXT_PUBLIC_SITE_URL not set, skipping API test');
    }
    
  } catch (error) {
    console.error('\nFATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
}

// Run the debug script
debugProductionMarketplace().catch(console.error);