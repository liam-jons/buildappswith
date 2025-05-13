// Script to check builder details and verify Clerk ID mapping
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking builder profiles and user details...');
  
  try {
    // Get all users with their builder profiles
    const users = await prisma.user.findMany({
      include: {
        builderProfile: true,
      },
    });
    
    console.log(`Found ${users.length} users in the database`);
    
    // Get searchable builder profiles
    const searchableBuilders = await prisma.builderProfile.findMany({
      where: {
        searchable: true,
      },
      include: {
        user: true,
        sessionTypes: true,
      },
    });
    
    console.log(`\nFound ${searchableBuilders.length} searchable builder profiles`);
    
    // Display detailed information about searchable builders
    console.log('\nSearchable Builder Details:');
    searchableBuilders.forEach((builder, index) => {
      console.log(`\n[${index + 1}] Builder: ${builder.user.name || 'No Name'}`);
      console.log(`  ID: ${builder.id}`);
      console.log(`  User ID: ${builder.userId}`);
      console.log(`  Clerk ID: ${builder.user.clerkId || 'No Clerk ID'}`);
      console.log(`  Email: ${builder.user.email || 'No Email'}`);
      console.log(`  Featured: ${builder.featured}`);
      console.log(`  Searchable: ${builder.searchable}`);
      console.log(`  Image URL: ${builder.imageUrl || 'No Image'}`);
      console.log(`  Session Types: ${builder.sessionTypes?.length || 0}`);
      
      // Print any session types
      if (builder.sessionTypes?.length > 0) {
        console.log('  Session Types:');
        builder.sessionTypes.forEach((sessionType, stIndex) => {
          console.log(`    [${stIndex + 1}] ${sessionType.title}`);
          console.log(`      Duration: ${sessionType.durationMinutes} minutes`);
          console.log(`      Price: ${sessionType.price}`);
          console.log(`      CalendlyEventTypeId: ${sessionType.calendlyEventTypeId || 'Not set'}`);
        });
      }
    });
    
    // Check for users without builder profiles
    const usersWithoutProfiles = users.filter(user => !user.builderProfile);
    console.log(`\nFound ${usersWithoutProfiles.length} users without builder profiles`);
    if (usersWithoutProfiles.length > 0) {
      console.log('\nUsers without builder profiles:');
      usersWithoutProfiles.forEach((user, index) => {
        console.log(`  [${index + 1}] ${user.name || 'No Name'} (${user.email || 'No Email'}) - Clerk ID: ${user.clerkId || 'No Clerk ID'}`);
      });
    }
    
    // Check for builder profiles without session types
    const buildersWithoutSessionTypes = searchableBuilders.filter(builder => !builder.sessionTypes?.length);
    console.log(`\nFound ${buildersWithoutSessionTypes.length} searchable builders without session types`);
    if (buildersWithoutSessionTypes.length > 0) {
      console.log('\nSearchable builders without session types:');
      buildersWithoutSessionTypes.forEach((builder, index) => {
        console.log(`  [${index + 1}] ${builder.user.name || 'No Name'} (${builder.user.email || 'No Email'})`);
      });
    }
    
    // Check for Liam's profile specifically
    const liamProfile = searchableBuilders.find(builder => 
      builder.user.email?.toLowerCase().includes('liam') || 
      builder.user.name?.toLowerCase().includes('liam')
    );
    
    if (liamProfile) {
      console.log('\nLiam\'s Profile:');
      console.log(`  Name: ${liamProfile.user.name || 'No Name'}`);
      console.log(`  Email: ${liamProfile.user.email || 'No Email'}`);
      console.log(`  Clerk ID: ${liamProfile.user.clerkId || 'No Clerk ID'}`);
      console.log(`  Featured: ${liamProfile.featured}`);
      console.log(`  Searchable: ${liamProfile.searchable}`);
      console.log(`  Has Session Types: ${(liamProfile.sessionTypes?.length > 0)}`);
    } else {
      console.log('\nLiam\'s profile not found among searchable builders');
    }
    
  } catch (error) {
    console.error('Error checking builder details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });