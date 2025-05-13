const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    // Query users with builder profiles
    console.log('Querying users with builder profiles...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        clerkId: true,
        roles: true,
        builderProfile: {
          select: {
            id: true,
            searchable: true
          }
        }
      }
    });

    console.log('Total users:', users.length);
    console.log('Users with builder role:', users.filter(u => u.roles && u.roles.includes('BUILDER')).length);
    console.log('Users with builder profile:', users.filter(u => u.builderProfile).length);
    
    // Print details of users with builder profiles
    console.log('\nBuilder Profile Details:');
    for (const user of users.filter(u => u.builderProfile)) {
      console.log(`User ${user.name || 'Unknown'} (${user.id}): Builder Profile ID ${user.builderProfile.id} | searchable: ${user.builderProfile.searchable} | clerk ID: ${user.clerkId || 'None'}`);
    }

    // Query builder profiles directly
    console.log('\nSearchable Builder Profiles:');
    const searchableBuilders = await prisma.builderProfile.findMany({
      where: {
        searchable: true
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            clerkId: true
          }
        },
        sessionTypes: {
          select: {
            id: true
          }
        }
      }
    });
    
    console.log('Total searchable builder profiles:', searchableBuilders.length);
    
    // Check if builders have session types
    const buildersWithSessionTypes = searchableBuilders.filter(b => b.sessionTypes.length > 0);
    console.log('Builders with session types:', buildersWithSessionTypes.length);
    
    for (const builder of searchableBuilders) {
      console.log(`Builder Profile ${builder.id}: User ${builder.user.name || 'Unknown'} | Session Types: ${builder.sessionTypes.length} | Clerk ID: ${builder.user.clerkId || 'None'}`);
    }

    // Check for clerk users
    console.log('\nUsers with Clerk IDs:');
    const clerkUsers = users.filter(u => u.clerkId);
    console.log('Total users with Clerk ID:', clerkUsers.length);
    
    for (const user of clerkUsers) {
      console.log(`User ${user.name || 'Unknown'} (${user.id}): Clerk ID ${user.clerkId} | Has Builder Profile: ${user.builderProfile ? 'Yes' : 'No'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

run();