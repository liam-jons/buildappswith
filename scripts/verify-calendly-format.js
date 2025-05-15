const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCalendlyFormat() {
  try {
    // Get all session types
    const sessions = await prisma.sessionType.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        calendlyEventTypeUri: true,
        builderId: true
      }
    });

    console.log('\n=== Current Session URIs ===\n');
    sessions.forEach(session => {
      console.log(`Title: ${session.title}`);
      console.log(`Current URI: ${session.calendlyEventTypeUri}`);
      console.log('---');
    });

    // Get builder with calendly username
    const builder = await prisma.builderProfile.findFirst({
      where: {
        id: sessions[0]?.builderId
      },
      select: {
        id: true,
        displayName: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('\n=== Builder Info ===');
    console.log('Builder:', builder?.displayName || builder?.user?.name);
    
    // Calendly embed URLs should be in this format:
    // https://calendly.com/{username}/{event-type}
    
    console.log('\n=== Correct Calendly URL Formats ===');
    console.log('1. For data-url attribute: https://calendly.com/liam-buildappswith/getting-started-businesses');
    console.log('2. For API: https://calendly.com/liam-buildappswith/getting-started-businesses');
    console.log('3. For iframe src: https://calendly.com/liam-buildappswith/getting-started-businesses?embed_domain=localhost:3000&embed_type=Inline');

    // Test what's actually being stored
    console.log('\n=== What should be stored in DB ===');
    console.log('Option 1: Full URL - https://calendly.com/liam-buildappswith/getting-started-businesses');
    console.log('Option 2: Username/event - liam-buildappswith/getting-started-businesses');
    console.log('Option 3: Just event - getting-started-businesses');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCalendlyFormat();