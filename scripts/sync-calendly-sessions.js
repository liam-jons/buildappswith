const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// These are the actual Calendly session types from https://calendly.com/liam-buildappswith
const calendlySessionTypes = [
  {
    title: 'Initial Consultation (Free)',
    description: 'A free 30-minute consultation to discuss your project needs',
    durationMinutes: 30,
    price: 0,
    requiresAuth: false,
    eventTypeCategory: 'free',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/free-consultation'
  },
  {
    title: 'Platform User - 1:1 Developer Consultation',
    description: '60-minute consultation for platform members',
    durationMinutes: 60,
    price: 125,
    requiresAuth: true,
    eventTypeCategory: 'pathway',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/60-minute-1-1-consultation'
  },
  {
    title: 'Code Review and Architecture Planning',
    description: '90-minute deep dive into your codebase and architecture',
    durationMinutes: 90,
    price: 200,
    requiresAuth: true,
    eventTypeCategory: 'specialized',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/code-review-session'
  },
  {
    title: 'Pair Programming Session',
    description: 'Hands-on coding session working together on your project',
    durationMinutes: 120,
    price: 300,
    requiresAuth: true,
    eventTypeCategory: 'specialized',
    calendlyEventTypeUri: 'https://calendly.com/liam-buildappswith/pair-programming'
  }
];

async function syncCalendlySessions() {
  try {
    const builderId = 'cmacaujmz00018oa34hehwic1'; // Liam's ID
    
    console.log('Syncing Calendly session types...');
    
    // First, deactivate all existing session types
    await prisma.sessionType.updateMany({
      where: { builderId },
      data: { isActive: false }
    });
    console.log('Deactivated existing session types');
    
    // Then create or update the Calendly session types
    for (const [index, sessionType] of calendlySessionTypes.entries()) {
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
    allSessions.forEach(st => {
      console.log(`- ${st.title}: ${st.requiresAuth ? 'Auth Required' : 'No Auth'} - £${st.price}`);
    });
    
  } catch (error) {
    console.error('Error syncing Calendly sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncCalendlySessions();