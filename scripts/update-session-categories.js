const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSessionCategories() {
  try {
    // Update session categories for Liam's sessions
    const updates = [
      {
        id: 'cmaokniuf00019k3aq8flqqr1',
        title: 'Initial Consultation',
        eventTypeCategory: 'free',
        requiresAuth: false
      },
      {
        id: 'cmaoknix000039k3auxxgb3gf',
        title: '1:1 Developer Consultation',
        eventTypeCategory: 'specialized',
        requiresAuth: true
      },
      {
        id: 'cmaokniy000059k3ahvivlelm',
        title: 'Code Review Session',
        eventTypeCategory: 'specialized',
        requiresAuth: true
      }
    ];
    
    for (const update of updates) {
      await prisma.sessionType.update({
        where: { id: update.id },
        data: {
          eventTypeCategory: update.eventTypeCategory,
          requiresAuth: update.requiresAuth
        }
      });
      console.log(`✅ Updated "${update.title}": category=${update.eventTypeCategory}, requiresAuth=${update.requiresAuth}`);
    }
    
    // Create a new pathway session for demo purposes
    const pathwaySession = await prisma.sessionType.create({
      data: {
        builderId: 'cmacaujmz00018oa34hehwic1',
        title: 'Pathway Discovery Session',
        description: 'Discover which learning pathway (Accelerate, Pivot, or Play) best suits your goals',
        durationMinutes: 45,
        price: 0,
        currency: 'USD',
        requiresAuth: true,
        eventTypeCategory: 'pathway',
        isActive: true,
        calendlyEventTypeUri: 'https://calendly.com/liamjones-buildappswith-1/pathway-discovery'
      }
    });
    
    console.log(`✅ Created new pathway session: "${pathwaySession.title}"`);
    
    // Verify the updates
    const allSessions = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1'
      },
      select: {
        title: true,
        eventTypeCategory: true,
        requiresAuth: true,
        price: true
      }
    });
    
    console.log('\n📋 All sessions after update:');
    allSessions.forEach(session => {
      console.log({
        title: session.title,
        category: session.eventTypeCategory,
        requiresAuth: session.requiresAuth,
        price: session.price.toNumber()
      });
    });
    
  } catch (error) {
    console.error('Error updating session categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSessionCategories();