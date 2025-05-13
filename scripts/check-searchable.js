// Script to check searchable flag on builder profiles and test marketplace API
const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking searchable builder profiles and marketplace API...');
  
  try {
    // Get all searchable builder profiles
    const searchableBuilders = await prisma.builderProfile.findMany({
      where: {
        searchable: true,
      },
      include: {
        user: true,
      },
    });
    
    console.log(`Found ${searchableBuilders.length} searchable builder profiles in database`);
    console.log('Sample of searchable builders:');
    searchableBuilders.slice(0, 3).forEach((builder, index) => {
      console.log(`[${index + 1}] ${builder.user.name || 'No Name'} (${builder.user.email || 'No Email'})`);
    });
    
    // Get featured builders
    const featuredBuilders = await prisma.builderProfile.findMany({
      where: {
        featured: true,
      },
      include: {
        user: true,
      },
    });
    
    console.log(`\nFound ${featuredBuilders.length} featured builder profiles in database`);
    console.log('Featured builders:');
    featuredBuilders.forEach((builder, index) => {
      console.log(`[${index + 1}] ${builder.user.name || 'No Name'} (${builder.user.email || 'No Email'}) - Searchable: ${builder.searchable}`);
    });
    
    // Check local API endpoint
    console.log('\nChecking local API endpoint (requires dev server running)...');
    try {
      const localResponse = await fetch('http://localhost:3000/api/marketplace/builders');
      if (localResponse.ok) {
        const localData = await localResponse.json();
        console.log(`Local API returned ${localData.builders?.length || 0} builders`);
        if (localData.builders?.length > 0) {
          console.log('Sample of builders from local API:');
          localData.builders.slice(0, 3).forEach((builder, index) => {
            console.log(`[${index + 1}] ${builder.name || 'No Name'} (${builder.id || 'No ID'})`);
          });
        }
      } else {
        console.log(`Local API returned status: ${localResponse.status}`);
        console.log(await localResponse.text());
      }
    } catch (error) {
      console.log('Error accessing local API:', error.message);
      console.log('(This is expected if the dev server is not running)');
    }
    
    // Check remote API endpoint (preview)
    console.log('\nChecking preview API endpoint...');
    try {
      const previewUrl = 'https://buildappswith-preview.vercel.app/api/marketplace/builders';
      const previewResponse = await fetch(previewUrl);
      console.log(`Preview API status: ${previewResponse.status}`);
      
      const responseText = await previewResponse.text();
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(responseText);
        console.log(`Preview API returned ${jsonData.builders?.length || 0} builders`);
        if (jsonData.builders?.length > 0) {
          console.log('Sample of builders from preview API:');
          jsonData.builders.slice(0, 3).forEach((builder, index) => {
            console.log(`[${index + 1}] ${builder.name || 'No Name'} (${builder.id || 'No ID'})`);
          });
        }
      } catch (parseError) {
        console.log('Preview API response is not valid JSON:');
        console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      }
    } catch (error) {
      console.log('Error accessing preview API:', error.message);
    }
    
    // Check for Liam specifically
    const liamProfiles = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Liam', mode: 'insensitive' } },
          { email: { contains: 'liam', mode: 'insensitive' } },
        ],
      },
      include: {
        builderProfile: true,
      },
    });
    
    console.log('\nLiam profiles found in database:');
    liamProfiles.forEach((user, index) => {
      console.log(`\n[${index + 1}] ${user.name || 'No Name'} (${user.email || 'No Email'})`);
      console.log(`  Clerk ID: ${user.clerkId || 'No Clerk ID'}`);
      if (user.builderProfile) {
        console.log('  Has builder profile: Yes');
        console.log(`  Builder Profile ID: ${user.builderProfile.id}`);
        console.log(`  Featured: ${user.builderProfile.featured}`);
        console.log(`  Searchable: ${user.builderProfile.searchable}`);
        console.log(`  Expertise areas: ${user.builderProfile.expertise_areas || 'None'}`);
        console.log(`  ADHD Focus: ${user.builderProfile.adhd_focus || false}`);
      } else {
        console.log('  Has builder profile: No');
      }
    });
    
    // Check marketplace data service
    console.log('\nDirect database query test:');
    // Replicating the query used in marketplace data service
    const builders = await prisma.builderProfile.findMany({
      where: {
        searchable: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sessionTypes: true,
      },
    });
    
    console.log(`Direct query returned ${builders.length} builders with searchable=true`);
    
    // Check if all necessary builder fields are populated
    console.log('\nChecking for missing fields on builders:');
    let missingFields = false;
    builders.forEach((builder) => {
      const issues = [];
      if (!builder.user) issues.push('No user record');
      if (!builder.user?.name) issues.push('Missing name');
      if (!builder.user?.email) issues.push('Missing email');
      if (!builder.expertise_areas) issues.push('Missing expertise_areas');
      if (issues.length > 0) {
        missingFields = true;
        console.log(`Builder ${builder.id} has issues: ${issues.join(', ')}`);
      }
    });
    
    if (!missingFields) {
      console.log('All searchable builders have required fields populated');
    }
    
  } catch (error) {
    console.error('Error checking marketplace:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });