const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSessionAuth() {
  try {
    // Get all session types for the builder
    const sessions = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1' // Liam's builder ID
      },
      select: {
        id: true,
        title: true,
        requiresAuth: true,
        eventTypeCategory: true,
        price: true,
        isActive: true,
        calendlyEventTypeUri: true
      }
    });
    
    console.log('Liam\'s session types:');
    sessions.forEach(session => {
      console.log({
        id: session.id,
        title: session.title,
        requiresAuth: session.requiresAuth,
        category: session.eventTypeCategory,
        price: session.price.toNumber(),
        isActive: session.isActive,
        hasCalendlyUri: !!session.calendlyEventTypeUri
      });
    });
    
    // Count sessions by auth requirement
    const authRequired = sessions.filter(s => s.requiresAuth);
    const noAuthRequired = sessions.filter(s => !s.requiresAuth);
    
    console.log(`\nSummary:`);
    console.log(`Total sessions: ${sessions.length}`);
    console.log(`Sessions requiring auth: ${authRequired.length}`);
    console.log(`Sessions NOT requiring auth: ${noAuthRequired.length}`);
    
    // If all sessions require auth, let's fix some to be public
    if (noAuthRequired.length === 0 && sessions.length > 0) {
      console.log('\n⚠️  All sessions require authentication! Updating some to be public...');
      
      // Make free sessions public
      const freeSessions = sessions.filter(s => s.eventTypeCategory === 'free' || s.price.toNumber() === 0);
      
      for (const session of freeSessions) {
        await prisma.sessionType.update({
          where: { id: session.id },
          data: { requiresAuth: false }
        });
        console.log(`✅ Made "${session.title}" public (no auth required)`);
      }
      
      // Make at least one other session public if no free sessions
      if (freeSessions.length === 0 && sessions.length > 0) {
        const firstSession = sessions[0];
        await prisma.sessionType.update({
          where: { id: firstSession.id },
          data: { requiresAuth: false }
        });
        console.log(`✅ Made "${firstSession.title}" public (no auth required)`);
      }
    }
    
  } catch (error) {
    console.error('Error checking session auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSessionAuth();