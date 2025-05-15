const { db } = require('../lib/db');

async function debugCalendlyBooking() {
  console.log('Debugging Calendly booking flow...\n');

  try {
    // Check if we can connect to the database
    console.log('Testing database connection...');
    const userCount = await db.user.count();
    console.log(`Database connected. Total users: ${userCount}`);

    // Get a sample builder profile
    console.log('\nFetching a sample builder profile...');
    const sampleBuilder = await db.builderProfile.findFirst({
      include: {
        user: true
      }
    });

    if (sampleBuilder) {
      console.log(`\nSample builder found:`);
      console.log(`- ID: ${sampleBuilder.id}`);
      console.log(`- Name: ${sampleBuilder.user.firstName} ${sampleBuilder.user.lastName}`);
      console.log(`- Email: ${sampleBuilder.user.email}`);
      console.log(`- Calendly URL: ${sampleBuilder.calendlyUrl || 'Not set'}`);
      console.log(`- Avatar URL: ${sampleBuilder.avatarUrl || 'Not set'}`);
      
      // Check for session types
      console.log('\nChecking session types for this builder...');
      const sessionTypes = await db.sessionType.findMany({
        where: { builderId: sampleBuilder.id }
      });
      
      console.log(`Found ${sessionTypes.length} session types for this builder`);
      if (sessionTypes.length > 0) {
        sessionTypes.forEach((type, index) => {
          console.log(`  ${index + 1}. ${type.name} - ${type.calendlyEventTypeId || 'No Calendly ID'}`);
        });
      }
    } else {
      console.log('No builder profiles found in the database.');
    }

    // Check if Calendly environment variables are set
    console.log('\n\nChecking Calendly environment variables:');
    console.log(`- CALENDLY_API_KEY: ${process.env.CALENDLY_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`- CALENDLY_ORGANIZATION: ${process.env.CALENDLY_ORGANIZATION ? 'Set' : 'Not set'}`);
    console.log(`- CALENDLY_USER: ${process.env.CALENDLY_USER ? 'Set' : 'Not set'}`);

  } catch (error) {
    console.error('\nError during debugging:', error);
  } finally {
    await db.$disconnect();
  }
}

debugCalendlyBooking();