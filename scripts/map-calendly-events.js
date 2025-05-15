/**
 * Map Calendly Events to Database Session Types
 * 
 * This script creates manual mappings between Calendly events
 * and database session types based on the API results
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Based on the Calendly API results, here are the correct mappings
const EVENT_MAPPINGS = {
  // Database Title -> Calendly Event ID
  'Group Build - Half Day Session': '97c73383-3e14-4c3b-b062-5ab6b70368c4', // slug: group-build-half-day ✓
  'Group Build - Full Day Session': '2180615e-4d9e-4c10-a8ee-a166807219e0', // slug: group-build (not group-build-full-day)
  'Getting Started - Businesses': '21d1153f-26f1-4b9d-85ce-8ea8ecd0cf93', // slug: getting-started-businesses ✓
  'Getting Started - Individuals': '1efa1318-0ec2-4c9b-acf5-7743df6c8641', // slug: getting-started-individuals ✓
  'Back to Work Session': '6c7dbb10-53ec-4e69-8f07-1a215bcfd183', // slug: back-to-work (not back-to-work-session)
  '30 Minute Consultation': 'a7458d8c-f828-483b-b3c9-b2c30660fd86', // slug: 30-minute-meeting
  '60 Minute Consultation': '569039b3-fc37-4d95-9847-86736965f793', // slug: new-meeting
  '90 Minute Deep Dive': '0a7f9043-40b0-4ba7-ab85-aaeceafd0f67', // slug: 1-hour-30-minute-meeting
};

// Also need to update the URIs to match Calendly's actual slugs
const URI_MAPPINGS = {
  'Group Build - Full Day Session': '/group-build',
  'Back to Work Session': '/back-to-work',
  '30 Minute Consultation': '/30-minute-meeting',
  '60 Minute Consultation': '/new-meeting',
  '90 Minute Deep Dive': '/1-hour-30-minute-meeting',
};

async function mapCalendlyEvents() {
  console.log('Mapping Calendly events to database session types...\n');
  
  try {
    // Fetch all session types for Liam
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1' // Liam's builder ID
      }
    });
    
    console.log(`Found ${sessionTypes.length} session types to update\n`);
    
    let updatedCount = 0;
    
    for (const sessionType of sessionTypes) {
      const eventTypeId = EVENT_MAPPINGS[sessionType.title];
      const newUri = URI_MAPPINGS[sessionType.title] || sessionType.calendlyEventTypeUri;
      
      if (eventTypeId) {
        const needsUpdate = sessionType.calendlyEventTypeId !== eventTypeId || 
                           sessionType.calendlyEventTypeUri !== newUri;
        
        if (needsUpdate) {
          console.log(`Updating ${sessionType.title}:`);
          console.log(`  Current ID: ${sessionType.calendlyEventTypeId || 'NOT SET'}`);
          console.log(`  New ID: ${eventTypeId}`);
          console.log(`  Current URI: ${sessionType.calendlyEventTypeUri}`);
          console.log(`  New URI: ${newUri}`);
          
          // Update the database
          await prisma.sessionType.update({
            where: { id: sessionType.id },
            data: { 
              calendlyEventTypeId: eventTypeId,
              calendlyEventTypeUri: newUri
            }
          });
          
          updatedCount++;
          console.log('  ✓ Updated\n');
        } else {
          console.log(`✓ ${sessionType.title} already up to date`);
        }
      } else {
        console.warn(`⚠️  No mapping found for: ${sessionType.title}`);
      }
    }
    
    console.log(`\nSummary: Updated ${updatedCount} session types`);
    
    // Verify the updates
    console.log('\nVerifying all mappings:');
    const updatedSessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1'
      },
      orderBy: {
        displayOrder: 'asc'
      },
      select: {
        title: true,
        calendlyEventTypeUri: true,
        calendlyEventTypeId: true,
        eventTypeCategory: true,
        durationMinutes: true
      }
    });
    
    console.log('\nFinal state:');
    updatedSessionTypes.forEach(st => {
      console.log(`\n${st.title} (${st.eventTypeCategory}):`);
      console.log(`  URI: ${st.calendlyEventTypeUri}`);
      console.log(`  Event Type ID: ${st.calendlyEventTypeId || 'NOT SET'}`);
      console.log(`  Duration: ${st.durationMinutes} minutes`);
    });
    
  } catch (error) {
    console.error('Error mapping Calendly events:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
mapCalendlyEvents()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });