const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificSession() {
  try {
    // Get a specific session that should be working
    const session = await prisma.sessionType.findFirst({
      where: {
        title: 'Getting Started - Businesses',
        isActive: true
      }
    });

    if (session) {
      console.log('\n=== Session Details ===');
      console.log('ID:', session.id);
      console.log('Title:', session.title);
      console.log('Calendly URI:', session.calendlyEventTypeUri);
      console.log('Requires Auth:', session.requiresAuth);
      console.log('Category:', session.eventTypeCategory);
      console.log('Is Active:', session.isActive);
      
      // Check if the URL format is correct
      if (session.calendlyEventTypeUri) {
        const urlPattern = /^https:\/\/calendly\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
        const isValidFormat = urlPattern.test(session.calendlyEventTypeUri);
        console.log('\nURL Format Valid:', isValidFormat);
        
        if (!isValidFormat) {
          console.log('Expected format: https://calendly.com/{username}/{event-type}');
        }
      }
    } else {
      console.log('Session not found');
    }

    // Also check all active sessions
    const allSessions = await prisma.sessionType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        calendlyEventTypeUri: true
      }
    });

    console.log('\n=== All Active Sessions ===');
    allSessions.forEach(s => {
      console.log(`${s.title}: ${s.calendlyEventTypeUri || 'NO URI'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificSession();