const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSearchableFlag() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as "totalProfiles",
        SUM(CASE WHEN "searchable" = true THEN 1 ELSE 0 END) as "searchableProfiles",
        SUM(CASE WHEN "searchable" = false THEN 1 ELSE 0 END) as "nonSearchableProfiles"
      FROM "BuilderProfile";
    `;
    console.log('Builder Profile Search Status:');
    console.log(result);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSearchableFlag();