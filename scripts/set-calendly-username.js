const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setCalendlyUsername(builderId, calendlyUsername) {
  try {
    const builder = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      select: { socialLinks: true }
    });
    
    const currentSocialLinks = builder.socialLinks || {};
    
    const updatedProfile = await prisma.builderProfile.update({
      where: { id: builderId },
      data: {
        socialLinks: {
          ...currentSocialLinks,
          calendlyUsername: calendlyUsername
        }
      }
    });
    
    console.log(`✅ Updated Calendly username for builder ${builderId}`);
    console.log('Social links:', updatedProfile.socialLinks);
    
  } catch (error) {
    console.error('Error setting Calendly username:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage:
// setCalendlyUsername('cmacaujmz00018oa34hehwic1', 'liamjones-buildappswith-1');

// For production, you might want to accept command line arguments
if (process.argv.length === 4) {
  const builderId = process.argv[2];
  const calendlyUsername = process.argv[3];
  setCalendlyUsername(builderId, calendlyUsername);
} else {
  console.log('Usage: node set-calendly-username.js <builderId> <calendlyUsername>');
}