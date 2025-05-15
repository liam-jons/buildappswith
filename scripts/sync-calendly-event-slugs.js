/**
 * Sync Calendly Event Slugs with Database
 * 
 * This script will:
 * 1. Fetch all Calendly event types from the API
 * 2. Compare them with our database session types
 * 3. Update the database to match Calendly's actual URIs
 */

const { PrismaClient } = require('@prisma/client');
const { CalendlyApiClient, getCalendlyApiClient } = require('../lib/scheduling/calendly/api-client');
const { CalendlyService } = require('../lib/scheduling/calendly/service');

const prisma = new PrismaClient();

// Map our database session type titles to expected Calendly slugs
const SLUG_MAPPING = {
  'Getting Started - Businesses': 'getting-started-businesses',
  'Getting Started - Content Creators': 'getting-started-content-creators',
  'Getting Started - Developers': 'getting-started-developers',
  'Growth Strategy Session': 'growth-strategy-session',
  'Business Partnership Discussion': 'business-partnership-discussion',
  'AI Integration Consultation': 'ai-integration-consultation',
  'Content Creator Partnership': 'content-creator-partnership',
  'Developer Partnership': 'developer-partnership'
};

async function syncCalendlyEventSlugs() {
  console.log('Starting Calendly event slug synchronization...');
  
  try {
    // Initialize Calendly API client
    const apiClient = getCalendlyApiClient();
    const calendlyService = new CalendlyService(apiClient);
    
    // Fetch all Calendly event types
    console.log('Fetching Calendly event types...');
    const eventTypes = await calendlyService.getEventTypes();
    console.log(`Found ${eventTypes.length} Calendly event types`);
    
    // Create a map of Calendly event types by slug
    const calendlyEventMap = new Map();
    eventTypes.forEach(eventType => {
      const slug = eventType.calendlyEventTypeUri.split('/').pop();
      calendlyEventMap.set(slug, eventType);
      console.log(`Calendly event: ${eventType.title} -> ${slug}`);
    });
    
    // Fetch all session types from database
    console.log('\nFetching database session types...');
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1' // Liam's builder ID
      }
    });
    console.log(`Found ${sessionTypes.length} database session types`);
    
    // Update each session type with correct Calendly URI
    let updatedCount = 0;
    for (const sessionType of sessionTypes) {
      const expectedSlug = SLUG_MAPPING[sessionType.title];
      
      if (!expectedSlug) {
        console.warn(`⚠️  No slug mapping found for: ${sessionType.title}`);
        continue;
      }
      
      const calendlyEvent = calendlyEventMap.get(expectedSlug);
      
      if (!calendlyEvent) {
        console.warn(`⚠️  No Calendly event found for slug: ${expectedSlug} (${sessionType.title})`);
        continue;
      }
      
      // Check if update is needed
      const newUri = `/${expectedSlug}`;
      if (sessionType.calendlyEventUri !== newUri) {
        console.log(`Updating ${sessionType.title}:`);
        console.log(`  Old URI: ${sessionType.calendlyEventUri}`);
        console.log(`  New URI: ${newUri}`);
        
        // Update the database
        await prisma.sessionType.update({
          where: { id: sessionType.id },
          data: { 
            calendlyEventUri: newUri,
            // Also update the full Calendly URL if needed
            calendlyUrl: `https://calendly.com/liam-buildappswith/${expectedSlug}`
          }
        });
        
        updatedCount++;
      } else {
        console.log(`✓ ${sessionType.title} already has correct URI: ${newUri}`);
      }
    }
    
    console.log(`\nSync complete! Updated ${updatedCount} session types.`);
    
    // Verify the updates
    console.log('\nVerifying updates...');
    const updatedSessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1'
      },
      select: {
        title: true,
        calendlyEventUri: true,
        calendlyUrl: true
      }
    });
    
    console.log('\nFinal state:');
    updatedSessionTypes.forEach(st => {
      console.log(`${st.title}:`);
      console.log(`  URI: ${st.calendlyEventUri}`);
      console.log(`  URL: ${st.calendlyUrl}`);
    });
    
  } catch (error) {
    console.error('Error syncing Calendly event slugs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
syncCalendlyEventSlugs()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });