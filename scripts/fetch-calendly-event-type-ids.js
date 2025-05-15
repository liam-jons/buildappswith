/**
 * Fetch Calendly Event Type IDs from API
 * 
 * This script fetches all event types from Calendly API
 * and updates our database with the actual IDs
 */

const { PrismaClient } = require('@prisma/client');
const { CalendlyApiClient, getCalendlyApiClient } = require('../lib/scheduling/calendly/api-client');
const { CalendlyService } = require('../lib/scheduling/calendly/service');

const prisma = new PrismaClient();

async function fetchAndUpdateCalendlyEventTypeIds() {
  console.log('Fetching Calendly Event Type IDs from API...\n');
  
  try {
    // Initialize Calendly API client
    const apiClient = getCalendlyApiClient();
    const calendlyService = new CalendlyService(apiClient);
    
    // Fetch all event types from Calendly
    console.log('Fetching event types from Calendly API...');
    const eventTypes = await calendlyService.getEventTypes();
    console.log(`Found ${eventTypes.length} event types in Calendly\n`);
    
    // Create a map of event slugs to IDs
    const eventTypeMap = new Map();
    eventTypes.forEach(eventType => {
      const slug = eventType.calendlyEventTypeUri.split('/').pop();
      const id = eventType.calendlyEventTypeId;
      eventTypeMap.set(slug, id);
      console.log(`Calendly Event: ${eventType.title}`);
      console.log(`  Slug: ${slug}`);
      console.log(`  ID: ${id}\n`);
    });
    
    // Fetch all session types from database
    console.log('Fetching session types from database...');
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1' // Liam's builder ID
      }
    });
    console.log(`Found ${sessionTypes.length} session types in database\n`);
    
    // Update each session type with the correct event type ID
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const sessionType of sessionTypes) {
      // Extract slug from calendlyEventUri
      let slug = '';
      
      if (sessionType.calendlyEventUri) {
        const parts = sessionType.calendlyEventUri.split('/');
        slug = parts[parts.length - 1];
      }
      
      const eventTypeId = eventTypeMap.get(slug);
      
      if (eventTypeId) {
        console.log(`Updating ${sessionType.title}:`);
        console.log(`  Slug: ${slug}`);
        console.log(`  Current ID: ${sessionType.calendlyEventTypeId || 'NOT SET'}`);
        console.log(`  New ID: ${eventTypeId}`);
        
        // Update the database
        await prisma.sessionType.update({
          where: { id: sessionType.id },
          data: { 
            calendlyEventTypeId: eventTypeId
          }
        });
        
        updatedCount++;
        console.log('  ✓ Updated\n');
      } else {
        console.warn(`⚠️  No Calendly event found for: ${sessionType.title} (${slug})`);
        notFoundCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`  Updated: ${updatedCount} session types`);
    console.log(`  Not found in Calendly: ${notFoundCount} session types`);
    
    // Verify the updates
    console.log('\nVerifying updates:');
    const updatedSessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1'
      },
      orderBy: {
        displayOrder: 'asc'
      },
      select: {
        title: true,
        calendlyEventUri: true,
        calendlyEventTypeId: true,
        eventTypeCategory: true
      }
    });
    
    console.log('\nFinal state:');
    updatedSessionTypes.forEach(st => {
      console.log(`\n${st.title} (${st.eventTypeCategory}):`);
      console.log(`  URI: ${st.calendlyEventUri}`);
      console.log(`  Event Type ID: ${st.calendlyEventTypeId || 'NOT SET'}`);
    });
    
    // Show any missing mappings
    if (notFoundCount > 0) {
      console.log('\n⚠️  Action Required:');
      console.log('Some session types could not be matched with Calendly events.');
      console.log('Please check your Calendly account and ensure all event types exist.');
    }
    
  } catch (error) {
    console.error('Error fetching Calendly event type IDs:', error);
    
    if (error.message.includes('CALENDLY_API_TOKEN')) {
      console.error('\n❌ Missing Calendly API credentials');
      console.error('Please ensure CALENDLY_API_TOKEN is set in your .env file');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fetchAndUpdateCalendlyEventTypeIds()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });