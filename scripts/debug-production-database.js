/**
 * Run this script with production DATABASE_URL to check production database directly
 * Usage: DATABASE_URL=your-production-url node scripts/debug-production-database.js
 */

const { PrismaClient } = require('@prisma/client');

async function debugProduction() {
  // Force production environment
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
  console.log('=== PRODUCTION DATABASE DEBUG ===');
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
  
  try {
    // 1. Check if Liam's profile is searchable
    const liamProfile = await prisma.builderProfile.findFirst({
      where: {
        user: {
          email: 'liam@buildappswith.com'
        }
      },
      include: {
        user: true
      }
    });
    
    console.log('\nLiam\'s Profile in Production:');
    console.log('- Searchable:', liamProfile?.searchable);
    console.log('- Featured:', liamProfile?.featured);
    console.log('- User exists:', !!liamProfile?.user);
    
    // 2. Run the exact query from marketplace-service.ts
    const marketplaceQuery = await prisma.builderProfile.findMany({
      where: {
        searchable: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            isDemo: true
          }
        }
      },
      take: 5
    });
    
    console.log('\nMarketplace Query Results:');
    console.log('- Count:', marketplaceQuery.length);
    console.log('- First profile:', marketplaceQuery[0]?.user?.name);
    
    // 3. Check for any null users
    const profilesWithNullUsers = await prisma.builderProfile.findMany({
      where: {
        searchable: true,
        user: null
      }
    });
    
    console.log('\nProfiles with null users:', profilesWithNullUsers.length);
    
    // 4. Test the count vs data discrepancy
    const count = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    
    const data = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: { user: true }
    });
    
    console.log('\nCount vs Data:');
    console.log('- Count result:', count);
    console.log('- FindMany result:', data.length);
    console.log('- Data with users:', data.filter(p => p.user).length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProduction();