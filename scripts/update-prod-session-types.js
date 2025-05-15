#!/usr/bin/env node

/**
 * Script to update production session types for Liam
 * This will DELETE existing session types and recreate them with proper Calendly URIs
 */

const { PrismaClient } = require('@prisma/client');

// Production connection only
const prodPrisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL_PROD || process.env.DATABASE_URL
});

async function updateProdSessionTypes() {
  try {
    console.log('🚀 Updating production session types for Liam...\n');
    
    // Find Liam in production
    const prodLiam = await prodPrisma.user.findUnique({
      where: { email: 'liam@buildappswith.com' },
      include: { builderProfile: true }
    });
    
    if (!prodLiam || !prodLiam.builderProfile) {
      console.error('❌ Could not find Liam or builder profile in production');
      process.exit(1);
    }
    
    console.log('📊 Found Liam in production:');
    console.log('Builder ID:', prodLiam.builderProfile.id);
    console.log('');
    
    // Delete existing session types
    console.log('🗑️  Deleting existing session types...');
    const deleteResult = await prodPrisma.sessionType.deleteMany({
      where: { builderId: prodLiam.builderProfile.id }
    });
    console.log(`✅ Deleted ${deleteResult.count} existing session types`);
    console.log('');
    
    // Calendly session types to create
    const sessionTypes = [
      {
        title: "Initial Consultation",
        description: "30-minute discovery call to discuss your project needs",
        durationMinutes: 30,
        price: 0,
        currency: "GBP",  // Changed to GBP for UK
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
        currency: "GBP",  // Changed to GBP for UK
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
        currency: "GBP",  // Changed to GBP for UK
        isActive: true,
        color: "#8B5CF6",
        calendlyEventTypeId: "code-review",
        calendlyEventTypeUri: "https://calendly.com/buildappswith/code-review"
      }
    ];
    
    // Create session types in prod
    console.log('📝 Creating new session types in production...');
    for (const sessionType of sessionTypes) {
      const created = await prodPrisma.sessionType.create({
        data: {
          ...sessionType,
          builderId: prodLiam.builderProfile.id
        }
      });
      console.log(`✅ Created: ${created.title} - ${created.price} ${created.currency}`);
      console.log(`   Calendly URI: ${created.calendlyEventTypeUri}`);
    }
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    const prodSessionTypes = await prodPrisma.sessionType.findMany({
      where: { builderId: prodLiam.builderProfile.id }
    });
    
    console.log(`\nProduction session types: ${prodSessionTypes.length}`);
    prodSessionTypes.forEach(st => {
      console.log(`  - ${st.title} (${st.calendlyEventTypeId})`);
      console.log(`    URI: ${st.calendlyEventTypeUri}`);
      console.log(`    Price: ${st.price} ${st.currency}`);
    });
    
    console.log('\n✅ Production session types updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating production session types:', error);
    process.exit(1);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the update
updateProdSessionTypes();