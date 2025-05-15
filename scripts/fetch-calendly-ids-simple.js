/**
 * Fetch Calendly Event Type IDs - Simple Version
 * 
 * This script fetches event type IDs directly from Calendly API
 * without depending on TypeScript modules
 */

const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

// Calendly API configuration
const CALENDLY_API_BASE_URL = 'https://api.calendly.com';
const CALENDLY_API_TOKEN = process.env.CALENDLY_API_TOKEN;

if (!CALENDLY_API_TOKEN) {
  console.error('Error: CALENDLY_API_TOKEN environment variable is not set');
  console.error('Please add CALENDLY_API_TOKEN to your .env file');
  process.exit(1);
}

async function fetchCalendlyEventTypes() {
  try {
    // First, get the current user
    const userResponse = await fetch(`${CALENDLY_API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user: ${userResponse.status} ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const userUri = userData.resource.uri;
    
    console.log('Fetched user info:', userData.resource.name);
    
    // Now get event types for this user
    const eventTypesResponse = await fetch(`${CALENDLY_API_BASE_URL}/event_types?user=${encodeURIComponent(userUri)}`, {
      headers: {
        'Authorization': `Bearer ${CALENDLY_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!eventTypesResponse.ok) {
      throw new Error(`Failed to get event types: ${eventTypesResponse.status} ${eventTypesResponse.statusText}`);
    }

    const eventTypesData = await eventTypesResponse.json();
    return eventTypesData.collection;
  } catch (error) {
    console.error('Error fetching from Calendly API:', error);
    throw error;
  }
}

async function updateDatabaseWithEventTypeIds() {
  console.log('Fetching Calendly Event Type IDs from API...\n');
  
  try {
    // Fetch event types from Calendly
    console.log('Connecting to Calendly API...');
    const eventTypes = await fetchCalendlyEventTypes();
    console.log(`Found ${eventTypes.length} event types in Calendly\n`);
    
    // Create a map of event slugs to IDs
    const eventTypeMap = new Map();
    eventTypes.forEach(eventType => {
      // Extract slug from scheduling URL
      const scheduling_url = eventType.scheduling_url;
      const slug = scheduling_url.split('/').pop();
      const id = eventType.uri.split('/').pop();
      
      eventTypeMap.set(slug, {
        id: id,
        name: eventType.name,
        duration: eventType.duration
      });
      
      console.log(`Calendly Event: ${eventType.name}`);
      console.log(`  Slug: ${slug}`);
      console.log(`  ID: ${id}`);
      console.log(`  Duration: ${eventType.duration} minutes\n`);
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
      // Extract slug from calendlyEventTypeUri
      let slug = '';
      
      if (sessionType.calendlyEventTypeUri) {
        const parts = sessionType.calendlyEventTypeUri.split('/');
        slug = parts[parts.length - 1];
      }
      
      const eventTypeInfo = eventTypeMap.get(slug);
      
      if (eventTypeInfo) {
        console.log(`Updating ${sessionType.title}:`);
        console.log(`  Slug: ${slug}`);
        console.log(`  Current ID: ${sessionType.calendlyEventTypeId || 'NOT SET'}`);
        console.log(`  New ID: ${eventTypeInfo.id}`);
        
        // Update the database
        await prisma.sessionType.update({
          where: { id: sessionType.id },
          data: { 
            calendlyEventTypeId: eventTypeInfo.id
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
        calendlyEventTypeUri: true,
        calendlyEventTypeId: true,
        eventTypeCategory: true
      }
    });
    
    console.log('\nFinal state:');
    updatedSessionTypes.forEach(st => {
      console.log(`\n${st.title} (${st.eventTypeCategory}):`);
      console.log(`  URI: ${st.calendlyEventTypeUri}`);
      console.log(`  Event Type ID: ${st.calendlyEventTypeId || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    if (error.message.includes('CALENDLY_API_TOKEN')) {
      console.error('\n❌ Missing Calendly API credentials');
      console.error('Please ensure CALENDLY_API_TOKEN is set in your .env file');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if node-fetch is available
try {
  require.resolve('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  const { execSync } = require('child_process');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
}

// Run the script
updateDatabaseWithEventTypeIds()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });