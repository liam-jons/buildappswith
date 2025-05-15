#!/usr/bin/env node

/**
 * Script to set up Calendly session types for Liam
 */

const { PrismaClient } = require('@prisma/client');

// Separate connections for dev and prod
const devPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL_DEV || process.env.DATABASE_URL
});

const prodPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL_PROD
});

async function setupLiamCalendly() {
  try {
    console.log('🚀 Setting up Calendly session types for Liam...\n');
    
    // First check if we're connected to the right databases
    const devLiam = await devPrisma.user.findUnique({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    const prodLiam = await prodPrisma.user.findUnique({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    if (!devLiam || !prodLiam) {
      console.error('❌ Could not find Liam in both environments');
      console.log('Dev:', devLiam ? 'Found' : 'Not found');
      console.log('Prod:', prodLiam ? 'Found' : 'Not found');
      process.exit(1);
    }
    
    console.log('📊 Found Liam in both environments:');
    console.log('Dev Builder ID:', devLiam.builderProfile?.id);
    console.log('Prod Builder ID:', prodLiam.builderProfile?.id);
    console.log('');
    
    // Calendly session types to create
    const sessionTypes = [
      {
        title: "Initial Consultation",
        description: "30-minute discovery call to discuss your project needs",
        durationMinutes: 30,
        price: 0,
        currency: "USD",
        isActive: true,
        color: "#10B981",
        calendlyEventTypeId: "initial-consultation",
        calendlyEventTypeUri: "https://calendly.com/buildappswith/initial-consultation"
      },
      {
        title: "1:1 Developer Consultation",
        description: "60-minute deep-dive technical consultation",
        durationMinutes: 60,
        price: 150,
        currency: "USD",
        isActive: true,
        color: "#3B82F6",
        calendlyEventTypeId: "1-on-1-consultation",
        calendlyEventTypeUri: "https://calendly.com/buildappswith/1-on-1-consultation"
      },
      {
        title: "Code Review Session",
        description: "90-minute comprehensive code review and architecture discussion",
        durationMinutes: 90,
        price: 200,
        currency: "USD",
        isActive: true,
        color: "#8B5CF6",
        calendlyEventTypeId: "code-review",
        calendlyEventTypeUri: "https://calendly.com/buildappswith/code-review"
      }
    ];
    
    // Create session types in dev
    console.log('📝 Creating session types in development...');
    for (const sessionType of sessionTypes) {
      const created = await devPrisma.sessionType.create({
        data: {
          ...sessionType,
          builderId: devLiam.builderProfile.id
        }
      });
      console.log(`✅ Created: ${created.title}`);
    }
    
    // Create session types in prod
    console.log('\n📝 Creating session types in production...');
    for (const sessionType of sessionTypes) {
      const created = await prodPrisma.sessionType.create({
        data: {
          ...sessionType,
          builderId: prodLiam.builderProfile.id
        }
      });
      console.log(`✅ Created: ${created.title}`);
    }
    
    // Update Liam's profile with Calendly username (if needed)
    console.log('\n🔧 Updating profile with Calendly data...');
    
    const profileUpdate = {
      socialLinks: {
        calendlyUsername: "buildappswith",
        linkedin: "https://linkedin.com/in/buildappswith",
        twitter: "https://twitter.com/buildappswith"
      }
    };
    
    await devPrisma.builderProfile.update({
      where: { id: devLiam.builderProfile.id },
      data: profileUpdate
    });
    
    await prodPrisma.builderProfile.update({
      where: { id: prodLiam.builderProfile.id },
      data: profileUpdate
    });
    
    console.log('✅ Updated profile with Calendly username');
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    const devSessionTypes = await devPrisma.sessionType.findMany({
      where: { builderId: devLiam.builderProfile.id }
    });
    
    const prodSessionTypes = await prodPrisma.sessionType.findMany({
      where: { builderId: prodLiam.builderProfile.id }
    });
    
    console.log(`\nDev session types: ${devSessionTypes.length}`);
    devSessionTypes.forEach(st => {
      console.log(`  - ${st.title} (${st.calendlyEventTypeId})`);
    });
    
    console.log(`\nProd session types: ${prodSessionTypes.length}`);
    prodSessionTypes.forEach(st => {
      console.log(`  - ${st.title} (${st.calendlyEventTypeId})`);
    });
    
    console.log('\n✅ Calendly setup complete!');
    console.log('\n📌 Next steps:');
    console.log('1. Ensure these Calendly event types exist in your Calendly account');
    console.log('2. Update the URLs if they differ from the ones used here');
    console.log('3. Set up the Calendly API token in your environment variables');
    console.log('4. Test the booking flow on the marketplace');
    
  } catch (error) {
    console.error('❌ Error setting up Calendly:', error);
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the setup
setupLiamCalendly();