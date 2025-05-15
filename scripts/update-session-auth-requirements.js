const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSessionAuthRequirements() {
  try {
    console.log('Updating session type authentication requirements...');
    
    // Update Initial Consultation to be a free session (no auth required)
    const initialConsultation = await prisma.sessionType.update({
      where: { id: 'cmapb4kiz00018o22jy8uxtyy' },
      data: {
        requiresAuth: false,
        eventTypeCategory: 'free',
        price: 0
      }
    });
    console.log(`Updated ${initialConsultation.title} to free/no-auth`);
    
    // Update other sessions to require auth and be in pathway/specialized categories
    const consultation = await prisma.sessionType.update({
      where: { id: 'cmapb4klh00038o22zing7e4y' },
      data: {
        requiresAuth: true,
        eventTypeCategory: 'pathway'
      }
    });
    console.log(`Updated ${consultation.title} to pathway/auth-required`);
    
    const codeReview = await prisma.sessionType.update({
      where: { id: 'cmapb4kmm00058o22umygrpwv' },
      data: {
        requiresAuth: true,
        eventTypeCategory: 'specialized'
      }
    });
    console.log(`Updated ${codeReview.title} to specialized/auth-required`);
    
    // Verify the updates
    const allSessions = await prisma.sessionType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        requiresAuth: true,
        eventTypeCategory: true,
        price: true
      }
    });
    
    console.log('\nUpdated session types:');
    allSessions.forEach(s => {
      console.log(`- ${s.title}: category=${s.eventTypeCategory}, requiresAuth=${s.requiresAuth}, price=${s.price}`);
    });
    
  } catch (error) {
    console.error('Error updating session types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSessionAuthRequirements();