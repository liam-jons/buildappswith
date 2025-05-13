// Script to ensure builder profiles have correct visibility settings
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fixing builder profile visibility...');
    
    // Find all users with BUILDER role
    const builders = await prisma.user.findMany({
      where: {
        roles: {
          has: 'BUILDER'
        }
      },
      include: {
        builderProfile: true
      }
    });
    
    console.log(`Found ${builders.length} users with BUILDER role`);
    
    // Count users missing builder profiles
    const missingProfiles = builders.filter(user => !user.builderProfile);
    console.log(`Found ${missingProfiles.length} builders missing builder profiles`);
    
    // Create missing builder profiles
    if (missingProfiles.length > 0) {
      for (const user of missingProfiles) {
        console.log(`Creating builder profile for ${user.email}`);
        
        await prisma.builderProfile.create({
          data: {
            userId: user.id,
            searchable: true,
            featured: false,
            validationTier: 1,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: {
              BUILDING_WITH_AI: {
                level: 3,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 2
              }
            }
          }
        });
      }
    }
    
    // Update existing builder profiles to be searchable
    const updatedCount = await prisma.builderProfile.updateMany({
      where: {
        searchable: false,
        user: {
          roles: {
            has: 'BUILDER'
          }
        }
      },
      data: {
        searchable: true
      }
    });
    
    console.log(`Updated ${updatedCount.count} builder profiles to be searchable`);
    
    // Verify fixed builder profiles
    const searchableBuilders = await prisma.builderProfile.count({
      where: {
        searchable: true
      }
    });
    
    console.log(`Total searchable builder profiles after fix: ${searchableBuilders}`);
    
  } catch (error) {
    console.error('Error fixing builder profiles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();