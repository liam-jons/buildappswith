const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugFullBookingPage() {
  try {
    const builderId = 'cmacaujmz00018oa34hehwic1'; // Liam's ID
    
    // Get builder profile with all session types
    const builderProfile = await prisma.builderProfile.findUnique({
      where: { id: builderId },
      include: {
        user: true,
        sessionTypes: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });
    
    console.log('=== FULL BOOKING PAGE DEBUG ===\n');
    
    console.log('Builder:', builderProfile.displayName);
    console.log('Total Session Types:', builderProfile.sessionTypes.length);
    
    // Simulate what unauthenticated users see
    const unauthSessions = builderProfile.sessionTypes.filter(s => !s.requiresAuth);
    
    console.log('\n=== UNAUTHENTICATED USER VIEW ===');
    console.log(`Will see ${unauthSessions.length} sessions total\n`);
    
    // Group by category
    const groups = {
      free: [],
      pathway: [],
      specialized: [],
      other: []
    };
    
    unauthSessions.forEach(session => {
      const category = session.eventTypeCategory || 'other';
      if (groups[category]) {
        groups[category].push(session);
      } else {
        groups.other.push(session);
      }
    });
    
    console.log('By Category:');
    Object.entries(groups).forEach(([category, sessions]) => {
      if (sessions.length > 0) {
        console.log(`\n${category.toUpperCase()} (${sessions.length} sessions):`);
        sessions.forEach(s => {
          console.log(`  - ${s.title} (£${s.price})`);
        });
      }
    });
    
    console.log('\n=== AUTHENTICATED USER VIEW ===');
    console.log(`Will see all ${builderProfile.sessionTypes.length} sessions\n`);
    
    // Group all sessions
    const allGroups = {
      free: [],
      pathway: [],
      specialized: [],
      other: []
    };
    
    builderProfile.sessionTypes.forEach(session => {
      const category = session.eventTypeCategory || 'other';
      if (allGroups[category]) {
        allGroups[category].push(session);
      } else {
        allGroups.other.push(session);
      }
    });
    
    console.log('By Category:');
    Object.entries(allGroups).forEach(([category, sessions]) => {
      if (sessions.length > 0) {
        console.log(`\n${category.toUpperCase()} (${sessions.length} sessions):`);
        sessions.forEach(s => {
          console.log(`  - ${s.title} (£${s.price}) ${s.requiresAuth ? '[AUTH]' : ''}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFullBookingPage();