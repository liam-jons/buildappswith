const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCalendlyUrls() {
  try {
    // Check what's in the database
    const sessionTypes = await prisma.sessionType.findMany({
      select: {
        id: true,
        title: true,
        calendlyEventTypeUri: true,
        builderId: true
      },
      where: {
        isActive: true
      }
    });

    console.log('\n=== Current Calendly URLs in Database ===\n');
    
    sessionTypes.forEach(session => {
      console.log(`Title: ${session.title}`);
      console.log(`Current URL: ${session.calendlyEventTypeUri}`);
      console.log(`Builder ID: ${session.builderId}`);
      console.log('---');
    });

    // The Calendly widget expects URLs in this format:
    // https://calendly.com/{username}/{event-type}
    
    // Check if we need to fix the format
    const needsFixing = sessionTypes.filter(session => 
      session.calendlyEventTypeUri && 
      !session.calendlyEventTypeUri.startsWith('https://calendly.com/')
    );

    if (needsFixing.length > 0) {
      console.log('\n=== Sessions that need URL fixing ===\n');
      needsFixing.forEach(session => {
        console.log(`- ${session.title}: ${session.calendlyEventTypeUri}`);
      });
    }

    // For the embed, sometimes you need just the path portion
    console.log('\n=== Required Calendly Widget Format ===');
    console.log('The widget may expect URLs in one of these formats:');
    console.log('1. Full URL: https://calendly.com/liam-buildappswith/getting-started-businesses');
    console.log('2. Just path: liam-buildappswith/getting-started-businesses');
    console.log('3. With username: https://calendly.com/liam-buildappswith');
    
    // Test with a specific builder
    const testBuilder = await prisma.builderProfile.findFirst({
      where: {
        calendlyUsername: {
          not: null
        }
      },
      include: {
        sessionTypes: {
          where: {
            isActive: true
          }
        }
      }
    });

    if (testBuilder) {
      console.log('\n=== Test Builder Sessions ===');
      console.log(`Builder: ${testBuilder.displayName || 'Unknown'}`);
      console.log(`Calendly Username: ${testBuilder.calendlyUsername}`);
      
      testBuilder.sessionTypes.forEach(session => {
        console.log(`\nSession: ${session.title}`);
        console.log(`Current URI: ${session.calendlyEventTypeUri}`);
        
        // What the URL should look like
        if (session.calendlyEventTypeUri && testBuilder.calendlyUsername) {
          const parts = session.calendlyEventTypeUri.split('/');
          const eventType = parts[parts.length - 1];
          const correctUrl = `https://calendly.com/${testBuilder.calendlyUsername}/${eventType}`;
          console.log(`Expected: ${correctUrl}`);
        }
      });
    }

    // Check for null or empty URIs
    const missingUris = sessionTypes.filter(s => !s.calendlyEventTypeUri);
    if (missingUris.length > 0) {
      console.log('\n=== Sessions Missing Calendly URIs ===');
      missingUris.forEach(session => {
        console.log(`- ${session.title} (ID: ${session.id})`);
      });
    }

  } catch (error) {
    console.error('Error debugging Calendly URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCalendlyUrls();