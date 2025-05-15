/**
 * Fix Calendly URLs in Database
 * 
 * This script will update all Calendly URLs to use the correct format
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Proper URL mappings based on actual Calendly event slugs
const URL_FIXES = {
  // Free sessions
  'Getting Started - Businesses': {
    uri: '/getting-started-businesses',
    url: 'https://calendly.com/liam-buildappswith/getting-started-businesses'
  },
  'Getting Started - Content Creators': {
    uri: '/getting-started-content-creators',
    url: 'https://calendly.com/liam-buildappswith/getting-started-content-creators'
  },
  'Getting Started - Developers': {
    uri: '/getting-started-developers',
    url: 'https://calendly.com/liam-buildappswith/getting-started-developers'
  },
  // Pathway sessions
  'Growth Strategy Session': {
    uri: '/growth-strategy-session',
    url: 'https://calendly.com/liam-buildappswith/growth-strategy-session'
  },
  'Business Partnership Discussion': {
    uri: '/business-partnership-discussion',
    url: 'https://calendly.com/liam-buildappswith/business-partnership-discussion'
  },
  'AI Integration Consultation': {
    uri: '/ai-integration-consultation',
    url: 'https://calendly.com/liam-buildappswith/ai-integration-consultation'
  },
  // Specialized sessions
  'Content Creator Partnership': {
    uri: '/content-creator-partnership',
    url: 'https://calendly.com/liam-buildappswith/content-creator-partnership'
  },
  'Developer Partnership': {
    uri: '/developer-partnership',
    url: 'https://calendly.com/liam-buildappswith/developer-partnership'
  },
  // Missing sessions
  'Getting Started - Individuals': {
    uri: '/getting-started-individuals',
    url: 'https://calendly.com/liam-buildappswith/getting-started-individuals'
  },
  'Back to Work Session': {
    uri: '/back-to-work-session',
    url: 'https://calendly.com/liam-buildappswith/back-to-work-session'
  },
  '30 Minute Consultation': {
    uri: '/30-minute-consultation',
    url: 'https://calendly.com/liam-buildappswith/30-minute-consultation'
  },
  '60 Minute Consultation': {
    uri: '/60-minute-consultation',
    url: 'https://calendly.com/liam-buildappswith/60-minute-consultation'
  },
  '90 Minute Deep Dive': {
    uri: '/90-minute-deep-dive',
    url: 'https://calendly.com/liam-buildappswith/90-minute-deep-dive'
  }
};

async function fixCalendlyUrls() {
  console.log('Fixing Calendly URLs in database...\n');
  
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
      const fix = URL_FIXES[sessionType.title];
      
      if (!fix) {
        console.warn(`⚠️  No URL mapping found for: ${sessionType.title}`);
        continue;
      }
      
      // Check if update is needed (only URI since URL field doesn't exist)
      const needsUpdate = sessionType.calendlyEventTypeUri !== fix.uri;
      
      if (needsUpdate) {
        console.log(`Updating ${sessionType.title}:`);
        console.log(`  Old URI: ${sessionType.calendlyEventTypeUri}`);
        console.log(`  New URI: ${fix.uri}\n`);
        
        // Update the database
        await prisma.sessionType.update({
          where: { id: sessionType.id },
          data: { 
            calendlyEventTypeUri: fix.uri
          }
        });
        
        updatedCount++;
      } else {
        console.log(`✓ ${sessionType.title} already has correct URLs`);
      }
    }
    
    console.log(`\nUpdated ${updatedCount} session types.`);
    
    // Verify the updates
    console.log('\nVerifying all URLs:');
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
      console.log(`  URI: ${st.calendlyEventUri}`);
      console.log(`  URL: ${st.calendlyUrl}`);
    });
    
  } catch (error) {
    console.error('Error fixing Calendly URLs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixCalendlyUrls()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });