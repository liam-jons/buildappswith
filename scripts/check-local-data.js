/**
 * Check Local Database Data
 * 
 * This script checks what data exists in your local database
 * to help with testing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkLocalData() {
  try {
    console.log('🔍 Checking Local Database Data\n');
    
    // Check Users
    console.log('=== Users ===');
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        isDemo: true,
        createdAt: true
      }
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.roles}) - ID: ${user.id}${user.isDemo ? ' [DEMO]' : ''}`);
    });
    
    // Check Builders
    console.log('\n=== Builders ===');
    const builders = await prisma.builderProfile.findMany({
      take: 5,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        sessionTypes: {
          select: {
            id: true,
            title: true,
            eventTypeCategory: true,
            price: true
          }
        }
      }
    });
    
    console.log(`Found ${builders.length} builders:`);
    builders.forEach(builder => {
      console.log(`\n- ${builder.user?.name || 'Unknown'} (${builder.user?.email})`);
      console.log(`  ID: ${builder.id}`);
      console.log(`  Searchable: ${builder.searchable}`);
      console.log(`  Session Types: ${builder.sessionTypes.length}`);
      builder.sessionTypes.forEach(session => {
        console.log(`    - ${session.title} (${session.eventTypeCategory || 'uncategorized'}) - $${session.price}`);
      });
    });
    
    // Check Session Types
    console.log('\n=== All Session Types ===');
    const sessionTypes = await prisma.sessionType.findMany({
      take: 10,
      include: {
        builder: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    console.log(`Found ${sessionTypes.length} session types:`);
    sessionTypes.forEach(session => {
      console.log(`- ${session.title} by ${session.builder.user?.name}`);
      console.log(`  Category: ${session.eventTypeCategory || 'uncategorized'}`);
      console.log(`  Price: $${session.price}`);
      console.log(`  ID: ${session.id}`);
    });
    
    // Check Recent Bookings
    console.log('\n=== Recent Bookings ===');
    const bookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        sessionType: true,
        builder: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log(`Found ${bookings.length} recent bookings:`);
    bookings.forEach(booking => {
      console.log(`\n- ${booking.title}`);
      console.log(`  Client: ${booking.client?.name || 'Anonymous'} (${booking.client?.email || 'No email'})`);
      console.log(`  Builder: ${booking.builder.user?.name}`);
      console.log(`  Status: ${booking.status}`);
      console.log(`  Payment: ${booking.paymentStatus}`);
      console.log(`  ID: ${booking.id}`);
    });
    
    // Summary
    console.log('\n=== Summary ===');
    const counts = {
      users: await prisma.user.count(),
      builders: await prisma.builderProfile.count(),
      sessionTypes: await prisma.sessionType.count(),
      bookings: await prisma.booking.count()
    };
    
    console.log('Total counts:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`${table}: ${count}`);
    });
    
    // Test Data Recommendations
    console.log('\n=== Recommendations ===');
    
    if (counts.builders === 0) {
      console.log('⚠️  No builders found. Create some test builders:');
      console.log('   1. Sign up as a new user');
      console.log('   2. Create a builder profile');
      console.log('   3. Add session types');
    }
    
    if (counts.sessionTypes === 0) {
      console.log('⚠️  No session types found. Add some via:');
      console.log('   1. Prisma Studio (npx prisma studio)');
      console.log('   2. Or create via the UI');
    }
    
    console.log('\nTo add test data manually:');
    console.log('1. Run: npx prisma studio');
    console.log('2. Add records through the UI');
    console.log('3. Or create a seed script');
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
console.log('Local Database Data Check\n');
checkLocalData();