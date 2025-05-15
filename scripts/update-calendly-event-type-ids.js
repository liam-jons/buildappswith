/**
 * Update Calendly Event Type IDs in Database
 * 
 * This script fetches actual event type IDs from Calendly API
 * and updates our database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock Calendly event type IDs (in a real scenario, these would come from Calendly API)
// These are example IDs - you'll need to replace with actual ones from Calendly
const CALENDLY_EVENT_TYPE_IDS = {
  'getting-started-businesses': 'ABCD1234',
  'getting-started-content-creators': 'EFGH5678',
  'getting-started-developers': 'IJKL9012',
  'growth-strategy-session': 'MNOP3456',
  'business-partnership-discussion': 'QRST7890',
  'ai-integration-consultation': 'UVWX1234',
  'content-creator-partnership': 'YZAB5678',
  'developer-partnership': 'CDEF9012'
};

async function updateCalendlyEventTypeIds() {
  console.log('Updating Calendly Event Type IDs...\n');
  
  try {
    // Fetch all session types
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1' // Liam's builder ID
      }
    });
    
    console.log(`Found ${sessionTypes.length} session types to update\n`);
    
    let updatedCount = 0;
    
    for (const sessionType of sessionTypes) {
      // Extract slug from calendlyEventUri
      let slug = '';
      
      if (sessionType.calendlyEventUri) {
        const parts = sessionType.calendlyEventUri.split('/');
        slug = parts[parts.length - 1];
      }
      
      const eventTypeId = CALENDLY_EVENT_TYPE_IDS[slug];
      
      if (eventTypeId) {
        console.log(`Updating ${sessionType.title}:`);
        console.log(`  Slug: ${slug}`);
        console.log(`  Event Type ID: ${eventTypeId}`);
        
        // Update the database
        await prisma.sessionType.update({
          where: { id: sessionType.id },
          data: { 
            calendlyEventTypeId: eventTypeId
          }
        });
        
        updatedCount++;
      } else {
        console.warn(`⚠️  No event type ID mapping found for: ${sessionType.title} (${slug})`);
      }
    }
    
    console.log(`\nUpdated ${updatedCount} session types with event type IDs.`);
    
    // Verify the updates
    console.log('\nVerifying updates:');
    const updatedSessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1'
      },
      select: {
        title: true,
        calendlyEventUri: true,
        calendlyEventTypeId: true
      }
    });
    
    console.log('\nFinal state:');
    updatedSessionTypes.forEach(st => {
      console.log(`${st.title}:`);
      console.log(`  URI: ${st.calendlyEventUri}`);
      console.log(`  Event Type ID: ${st.calendlyEventTypeId || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('Error updating Calendly event type IDs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateCalendlyEventTypeIds()
  .then(() => {
    console.log('\nScript completed successfully');
    console.log('\nNOTE: The event type IDs used here are examples.');
    console.log('You need to fetch the actual IDs from Calendly API or your Calendly dashboard.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });