const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSpecializedSessions() {
  try {
    const builderId = 'cmacaujmz00018oa34hehwic1'; // Liam's ID
    
    // Get all specialized sessions
    const specializedSessions = await prisma.sessionType.findMany({
      where: {
        builderId,
        eventTypeCategory: 'specialized',
        isActive: true
      },
      select: {
        id: true,
        title: true,
        requiresAuth: true,
        eventTypeCategory: true,
        price: true,
        calendlyEventTypeUri: true,
        isActive: true,
        displayOrder: true
      }
    });
    
    console.log('Specialized Sessions in Database:');
    specializedSessions.forEach(st => {
      console.log({
        title: st.title,
        requiresAuth: st.requiresAuth,
        category: st.eventTypeCategory,
        price: st.price.toNumber(),
        active: st.isActive,
        order: st.displayOrder
      });
    });
    
    // Check filtering for unauthenticated users
    const unauthenticatedSessions = specializedSessions.filter(s => !s.requiresAuth);
    console.log(`\nUnauthenticated users will see ${unauthenticatedSessions.length} specialized sessions:`);
    unauthenticatedSessions.forEach(s => {
      console.log(`- ${s.title}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSpecializedSessions();