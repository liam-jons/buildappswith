const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugBookingFlow() {
  try {
    const builderId = 'cmacaujmz00018oa34hehwic1'; // Liam's ID
    
    // Get builder profile with session types
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        user: true,
        sessionTypes: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        }
      }
    });
    
    console.log('Builder Profile:', {
      id: builderProfile.id,
      displayName: builderProfile.displayName,
      userName: builderProfile.user.name,
      sessionTypesCount: builderProfile.sessionTypes.length
    });
    
    console.log('\nSession Types:');
    builderProfile.sessionTypes.forEach(st => {
      console.log({
        id: st.id,
        title: st.title,
        requiresAuth: st.requiresAuth,
        eventTypeCategory: st.eventTypeCategory,
        price: st.price.toNumber(),
        calendlyUri: st.calendlyEventTypeUri,
        isActive: st.isActive
      });
    });
    
    // Check for authenticated vs unauthenticated sessions
    const authRequired = builderProfile.sessionTypes.filter(st => st.requiresAuth);
    const noAuthRequired = builderProfile.sessionTypes.filter(st => !st.requiresAuth);
    
    console.log('\nSession Type Breakdown:');
    console.log(`Auth Required: ${authRequired.length}`);
    console.log(`No Auth Required: ${noAuthRequired.length}`);
    
    console.log('\nUnauthenticated user will see:');
    noAuthRequired.forEach(st => {
      console.log(`- ${st.title} (${st.eventTypeCategory})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugBookingFlow();