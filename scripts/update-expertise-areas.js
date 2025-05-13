// Script to update expertiseAreas field for all builder profiles
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking expertiseAreas field for all builder profiles...');
    
    // 1. Get all builder profiles
    const allProfiles = await prisma.builderProfile.findMany();
    console.log(`Found ${allProfiles.length} builder profiles total`);
    
    // 2. Check which profiles have empty expertiseAreas
    const profilesWithoutExpertise = allProfiles.filter(p => !p.expertiseAreas);
    console.log(`Found ${profilesWithoutExpertise.length} profiles without expertiseAreas`);
    
    if (profilesWithoutExpertise.length > 0) {
      console.log('Sample of profiles without expertiseAreas:');
      profilesWithoutExpertise.slice(0, 3).forEach(p => {
        console.log(`- ID: ${p.id}, User ID: ${p.userId}`);
      });
      
      // 3. Update all profiles without expertiseAreas
      const defaultExpertiseAreas = {
        ADHD_PRODUCTIVITY: {
          level: 3,
          description: "Helps clients overcome ADHD challenges with practical AI solutions",
          yearsExperience: 3
        },
        AI_LITERACY: {
          level: 4,
          description: "Specializes in making AI concepts accessible to beginners",
          yearsExperience: 2
        },
        BUILDING_WITH_AI: {
          level: 4,
          description: "Expert in creating AI-powered applications and workflows",
          yearsExperience: 4
        }
      };
      
      console.log('Updating expertiseAreas for all profiles...');
      
      // Update profiles in batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < profilesWithoutExpertise.length; i += batchSize) {
        const batch = profilesWithoutExpertise.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(profile => 
            prisma.builderProfile.update({
              where: { id: profile.id },
              data: { 
                expertiseAreas: defaultExpertiseAreas 
              }
            })
          )
        );
        
        console.log(`Updated ${Math.min(i + batchSize, profilesWithoutExpertise.length)} of ${profilesWithoutExpertise.length} profiles`);
      }
      
      console.log('Successfully updated all profiles with default expertiseAreas');
    } else {
      console.log('All profiles have expertiseAreas field set');
    }
    
    // 4. Verify a specific profile (Liam's)
    console.log('\nVerifying Liam profiles specifically...');
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
    
    liamProfiles.forEach((user, index) => {
      console.log(`\n[${index + 1}] ${user.name || 'No Name'} (${user.email || 'No Email'})`);
      console.log(`  Clerk ID: ${user.clerkId || 'No Clerk ID'}`);
      if (user.builderProfile) {
        console.log('  Has builder profile: Yes');
        console.log(`  Builder Profile ID: ${user.builderProfile.id}`);
        console.log(`  Featured: ${user.builderProfile.featured}`);
        console.log(`  Searchable: ${user.builderProfile.searchable}`);
        console.log(`  Expertise areas: ${!!user.builderProfile.expertiseAreas ? 'Set' : 'Not set'}`);
        if (user.builderProfile.expertiseAreas) {
          console.log(`  Expertise areas content: ${JSON.stringify(user.builderProfile.expertiseAreas).substring(0, 100)}...`);
        }
      } else {
        console.log('  Has builder profile: No');
      }
    });
    
  } catch (error) {
    console.error('Error updating expertiseAreas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });