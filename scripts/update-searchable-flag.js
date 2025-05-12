const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Update your specific user profile searchable flag
    const updated = await prisma.builderProfile.updateMany({
      where: {
        OR: [
          { clerkUserId: 'user_2wBNHJwI9cJdILyvlRnv4zxu090' }, // Your clerk ID
          { clerkUserId: 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx' } // Your alternative clerk ID
        ]
      },
      data: {
        searchable: true
      }
    });

    console.log(`Updated ${updated.count} builder profiles to be searchable`);

    // Verify the update worked
    const verifyProfiles = await prisma.builderProfile.findMany({
      where: {
        OR: [
          { clerkUserId: 'user_2wBNHJwI9cJdILyvlRnv4zxu090' },
          { clerkUserId: 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx' }
        ]
      },
      select: {
        id: true,
        clerkUserId: true,
        searchable: true,
        slug: true,
        displayName: true
      }
    });

    console.log("Builder profiles status:");
    console.log(JSON.stringify(verifyProfiles, null, 2));

    // Also check all searchable profiles
    const allSearchable = await prisma.builderProfile.findMany({
      where: { searchable: true },
      select: {
        id: true,
        clerkUserId: true,
        slug: true,
        displayName: true
      }
    });

    console.log(`\nTotal searchable profiles: ${allSearchable.length}`);
    console.log("Searchable profiles:");
    console.log(JSON.stringify(allSearchable, null, 2));
  } catch (error) {
    console.error('Error updating searchable flag:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();