const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking Liam\'s profile in the database...');
    
    // Query the profile by slug
    const profile = await prisma.$queryRaw`
      SELECT "id", "bio", "headline", "displayName", "slug", "clerkUserId", "expertiseAreas" 
      FROM "BuilderProfile" 
      WHERE "slug" = 'liam-jons'
    `;
    
    console.log('Profile found:', profile);
    
    // Check if expertiseAreas is populated
    if (profile && profile.length > 0 && profile[0].expertiseAreas) {
      console.log('Expertise areas are populated!');
      console.log('Areas included:', Object.keys(profile[0].expertiseAreas));
    } else {
      console.log('Expertise areas not found or empty.');
    }
    
    // Check session types
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: profile[0].id
      }
    });
    
    console.log(`Found ${sessionTypes.length} session types for Liam:`);
    sessionTypes.forEach(sessionType => {
      console.log(`- ${sessionType.title}: ${sessionType.durationMinutes} min, ${sessionType.price} ${sessionType.currency}`);
    });
    
  } catch (error) {
    console.error('Error checking profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();