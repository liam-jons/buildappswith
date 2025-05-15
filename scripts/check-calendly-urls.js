const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCalendlyUrls() {
  try {
    const sessionTypes = await prisma.sessionType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        calendlyEventTypeUri: true,
        requiresAuth: true,
        eventTypeCategory: true
      }
    });
    
    console.log('Session Types with Calendly URLs:');
    sessionTypes.forEach(st => {
      console.log(`\n${st.title} (${st.id})`);
      console.log(`  Category: ${st.eventTypeCategory}`);
      console.log(`  Requires Auth: ${st.requiresAuth}`);
      console.log(`  Calendly URL: ${st.calendlyEventTypeUri || 'NOT SET'}`);
    });
    
    // Count missing URLs
    const missingUrls = sessionTypes.filter(st => !st.calendlyEventTypeUri);
    console.log(`\n${missingUrls.length} session types are missing Calendly URLs`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCalendlyUrls();