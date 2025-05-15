/**
 * Check Builder IDs in Database
 * 
 * This script will help find the correct builder ID to use
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBuilderIds() {
  console.log('Checking builder IDs in database...\n');
  
  try {
    // First, let's see all builders
    const builders = await prisma.builderProfile.findMany({
      select: {
        id: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    console.log('All builders:');
    builders.forEach(builder => {
      console.log(`ID: ${builder.id}`);
      console.log(`Email: ${builder.user?.email || 'N/A'}`);
      console.log(`Name: ${builder.user?.name || 'N/A'}`);
      console.log('---');
    });
    
    // Now let's look for Liam's builder specifically
    const liamBuilder = await prisma.builderProfile.findFirst({
      where: {
        user: {
          email: 'liam@buildappswith.com'
        }
      },
      select: {
        id: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    if (liamBuilder) {
      console.log('\nLiam\'s builder profile:');
      console.log(`ID: ${liamBuilder.id}`);
      console.log(`Email: ${liamBuilder.user.email}`);
      console.log(`Name: ${liamBuilder.user.name || 'N/A'}`);
    } else {
      console.log('\nCould not find Liam\'s builder profile by email');
      console.log('Trying to find any builder with session types...');
      
      // Find any builder that has session types
      const buildersWithSessions = await prisma.sessionType.groupBy({
        by: ['builderId'],
        _count: {
          id: true
        }
      });
      
      console.log('\nBuilders with session types:');
      for (const result of buildersWithSessions) {
        console.log(`Builder ID: ${result.builderId} has ${result._count.id} session types`);
      }
    }
    
  } catch (error) {
    console.error('Error checking builder IDs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkBuilderIds()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });