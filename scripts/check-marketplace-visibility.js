const { PrismaClient } = require('@prisma/client');

async function checkMarketplaceVisibility() {
  const prisma = new PrismaClient();
  
  console.log('=== MARKETPLACE VISIBILITY CHECK ===');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL (first 15 chars):', process.env.DATABASE_URL?.substring(0, 15));
  
  try {
    // 1. Check total builder profiles
    console.log('\n1. Total Builder Profiles:');
    const totalProfiles = await prisma.builderProfile.count();
    console.log('   Total profiles:', totalProfiles);
    
    // 2. Check searchable profiles
    console.log('\n2. Searchable Profiles:');
    const searchableCount = await prisma.builderProfile.count({
      where: { searchable: true }
    });
    console.log('   Searchable count:', searchableCount);
    
    // 3. List all profiles with key fields
    console.log('\n3. All Profiles:');
    const allProfiles = await prisma.builderProfile.findMany({
      select: {
        id: true,
        userId: true,
        searchable: true,
        featured: true,
        displayName: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });
    
    allProfiles.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.user?.name || 'Unknown'} (${profile.user?.email})`);
      console.log(`      - ID: ${profile.id}`);
      console.log(`      - Searchable: ${profile.searchable}`);
      console.log(`      - Featured: ${profile.featured}`);
      console.log(`      - Display Name: ${profile.displayName || 'None'}`);
    });
    
    // 4. Check Liam's profile specifically
    console.log('\n4. Liam\'s Profile:');
    const liamProfile = await prisma.builderProfile.findFirst({
      where: {
        user: {
          OR: [
            { name: { contains: 'Liam' } },
            { email: { contains: 'liamj@' } }
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
      console.log('   - User ID:', liamProfile.userId);
      console.log('   - Searchable:', liamProfile.searchable);
      console.log('   - Featured:', liamProfile.featured);
      console.log('   - Name:', liamProfile.user?.name);
      console.log('   - Email:', liamProfile.user?.email);
    } else {
      console.log('   Liam\'s profile NOT FOUND');
    }
    
    // 5. Test the exact query used in marketplace-service.ts
    console.log('\n5. Test Marketplace Query:');
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
            isDemo: true,
          }
        }
      }
    });
    console.log('   Query returned', marketplaceQuery.length, 'profiles');
    
    // 6. Check for any database errors
    console.log('\n6. Schema Check:');
    const schemaInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'BuilderProfile'
      AND column_name IN ('searchable', 'featured', 'displayName')
      ORDER BY column_name
    `;
    console.log('   BuilderProfile columns:');
    schemaInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('\nERROR:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.meta) {
      console.error('Error metadata:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('\n=== CHECK COMPLETE ===');
}

// Run the check
checkMarketplaceVisibility().catch(console.error);