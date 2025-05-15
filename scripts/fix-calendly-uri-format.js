const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCalendlyUriFormat() {
  try {
    // Get all session types that need updating
    const sessions = await prisma.sessionType.findMany({
      where: {
        isActive: true,
        calendlyEventTypeUri: {
          startsWith: '/'
        }
      }
    });

    console.log(`Found ${sessions.length} sessions to update`);

    // Update each session with the correct format
    for (const session of sessions) {
      const eventSlug = session.calendlyEventTypeUri.replace('/', '');
      const correctUri = `liam-buildappswith/${eventSlug}`;
      
      console.log(`\nUpdating: ${session.title}`);
      console.log(`From: ${session.calendlyEventTypeUri}`);
      console.log(`To: ${correctUri}`);
      
      await prisma.sessionType.update({
        where: { id: session.id },
        data: {
          calendlyEventTypeUri: correctUri
        }
      });
    }

    // Verify the updates
    const updatedSessions = await prisma.sessionType.findMany({
      where: { isActive: true },
      select: {
        title: true,
        calendlyEventTypeUri: true
      }
    });

    console.log('\n=== Updated Session URIs ===');
    updatedSessions.forEach(session => {
      console.log(`${session.title}: ${session.calendlyEventTypeUri}`);
    });

  } catch (error) {
    console.error('Error updating Calendly URIs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Add confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('This will update all Calendly URIs to the format: liam-buildappswith/{event}');
rl.question('Do you want to proceed? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    fixCalendlyUriFormat().then(() => {
      console.log('\nUpdate complete!');
      rl.close();
    });
  } else {
    console.log('Update cancelled');
    rl.close();
  }
});