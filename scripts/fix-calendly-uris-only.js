/**
 * Fix Calendly URIs in Database
 * 
 * This script will update all Calendly URIs to use the correct format
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCalendlyUris() {
  console.log('Fixing Calendly URIs in database...\n');
  
  try {
    // Fetch all session types
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: 'cmacaujmz00018oa34hehwic1' // Liam's builder ID
      }
    });
    
    console.log(`Found ${sessionTypes.length} session types to check\n`);
    
    let updatedCount = 0;
    
    for (const sessionType of sessionTypes) {
      // Check if URI needs fixing
      const currentUri = sessionType.calendlyEventTypeUri;
      let newUri = currentUri;
      
      // If it's a full path like "liam-buildappswith/getting-started-businesses"
      // convert it to "/getting-started-businesses"
      if (currentUri && !currentUri.startsWith('/')) {
        const parts = currentUri.split('/');
        if (parts.length > 1) {
          newUri = '/' + parts[parts.length - 1];
        } else {
          newUri = '/' + currentUri;
        }
      }
      
      if (currentUri !== newUri) {
        console.log(`Updating ${sessionType.title}:`);
        console.log(`  Old URI: ${currentUri}`);
        console.log(`  New URI: ${newUri}\n`);
        
        // Update the database
        await prisma.sessionType.update({
          where: { id: sessionType.id },
          data: { 
            calendlyEventTypeUri: newUri
          }
        });
        
        updatedCount++;
      } else {
        console.log(`✓ ${sessionType.title} already has correct URI: ${currentUri}`);
      }
    }
    
    console.log(`\nUpdated ${updatedCount} session types.`);
    
    // Verify the updates
    console.log('\nVerifying all URIs:');
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
    console.error('Error fixing Calendly URIs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixCalendlyUris()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });