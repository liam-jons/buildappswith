const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Query users
    const users = await prisma.user.findMany({
      include: {
        builderProfile: true,
        clientProfile: true
      }
    });
    console.log('USERS:');
    console.log(JSON.stringify(users, null, 2));

    // Query builder profiles separately
    const builderProfiles = await prisma.builderProfile.findMany({
      include: {
        sessionTypes: true
      }
    });
    console.log('\nBUILDER PROFILES:');
    console.log(JSON.stringify(builderProfiles, null, 2));
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();