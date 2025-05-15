const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// These are the actual Calendly session types from https://calendly.com/liam-buildappswith
// Based on your requirements
const realCalendlySessionTypes = [
  // Free sessions (no auth required)
  {
    title: 'Getting Started - Businesses',
    description: 'Free consultation for businesses looking to build apps',
    durationMinutes: 30,
    price: 0,
    requiresAuth: false,
    eventTypeCategory: 'free',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/getting-started-businesses'
  },
  {
    title: 'Getting Started - Individuals',
    description: 'Free consultation for individuals looking to build apps',
    durationMinutes: 30,
    price: 0,
    requiresAuth: false,
    eventTypeCategory: 'free',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/getting-started-individuals'
  },
  {
    title: 'Back to Work Session',
    description: 'Quick catch-up session',
    durationMinutes: 15,
    price: 0,
    requiresAuth: false,
    eventTypeCategory: 'free',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/back-to-work-session'
  },
  
  // Pathway sessions (auth required)
  {
    title: '30 Minute Consultation',
    description: 'Platform member consultation - 30 minutes',
    durationMinutes: 30,
    price: 50,
    requiresAuth: true,
    eventTypeCategory: 'pathway',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/30-minute-consultation'
  },
  {
    title: '60 Minute Consultation',
    description: 'Platform member consultation - 60 minutes',
    durationMinutes: 60,
    price: 100,
    requiresAuth: true,
    eventTypeCategory: 'pathway',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/60-minute-consultation'
  },
  {
    title: '90 Minute Deep Dive',
    description: 'Platform member consultation - 90 minutes',
    durationMinutes: 90,
    price: 150,
    requiresAuth: true,
    eventTypeCategory: 'pathway',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/90-minute-deep-dive'
  },
  
  // Specialized sessions (no auth required)
  {
    title: 'Group Build - Half Day Session',
    description: 'Half day group building session',
    durationMinutes: 240,
    price: 500,
    requiresAuth: false,
    eventTypeCategory: 'specialized',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/group-build-half-day'
  },
  {
    title: 'Group Build - Full Day Session',
    description: 'Full day group building session',
    durationMinutes: 480,
    price: 1000,
    requiresAuth: false,
    eventTypeCategory: 'specialized',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/group-build-full-day'
  }
];

async function syncRealCalendlySessions() {
  try {
    const builderId = 'cmacaujmz00018oa34hehwic1'; // Liam's ID
    
    console.log('Syncing REAL Calendly session types...');
    
    // First, deactivate all existing session types
    await prisma.sessionType.updateMany({
      where: { builderId },
      data: { isActive: false }
    });
    console.log('Deactivated all existing session types');
    
    // Then create or update the real Calendly session types
    for (const [index, sessionType] of realCalendlySessionTypes.entries()) {
      const existing = await prisma.sessionType.findFirst({
        where: {
          builderId,
          title: sessionType.title
        }
      });
      
      if (existing) {
        // Update existing
        const updated = await prisma.sessionType.update({
          where: { id: existing.id },
          data: {
            ...sessionType,
            builderId,
            currency: 'GBP',
            isActive: true,
            displayOrder: index
          }
        });
        console.log(`Updated: ${updated.title}`);
      } else {
        // Create new
        const created = await prisma.sessionType.create({
          data: {
            ...sessionType,
            builderId,
            currency: 'GBP',
            isActive: true,
            displayOrder: index
          }
        });
        console.log(`Created: ${created.title}`);
      }
    }
    
    // Verify the results
    const allSessions = await prisma.sessionType.findMany({
      where: { 
        builderId,
        isActive: true 
      },
      orderBy: { displayOrder: 'asc' }
    });
    
    console.log('\nActive Session Types:');
    console.log('\nFree (No Auth Required):');
    allSessions.filter(st => !st.requiresAuth && st.eventTypeCategory === 'free').forEach(st => {
      console.log(`- ${st.title}: £${st.price}`);
    });
    
    console.log('\nPathway (Auth Required):');
    allSessions.filter(st => st.requiresAuth && st.eventTypeCategory === 'pathway').forEach(st => {
      console.log(`- ${st.title}: £${st.price}`);
    });
    
    console.log('\nSpecialized (No Auth Required):');
    allSessions.filter(st => !st.requiresAuth && st.eventTypeCategory === 'specialized').forEach(st => {
      console.log(`- ${st.title}: £${st.price}`);
    });
    
  } catch (error) {
    console.error('Error syncing Calendly sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncRealCalendlySessions();