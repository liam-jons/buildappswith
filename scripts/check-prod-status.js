const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Check if clientId is nullable
    const columnInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Booking' AND column_name = 'clientId';
    `;
    console.log('ClientId column info:', columnInfo);
    
    // Check session types
    const sessionTypes = await prisma.sessionType.findMany({
      where: { isActive: true },
      include: {
        builder: {
          select: {
            displayName: true,
            userId: true
          }
        }
      }
    });
    console.log(`\nFound ${sessionTypes.length} active session types:`);
    sessionTypes.forEach(st => {
      console.log(`- ${st.title} (${st.id}) by ${st.builder.displayName} - Auth required: ${st.requiresAuth}`);
    });
    
    // Check builders
    const builders = await prisma.builderProfile.findMany({
      where: { 
        searchable: true,
        availableForHire: true 
      },
      select: { 
        id: true, 
        displayName: true,
        _count: {
          select: { sessionTypes: true }
        }
      }
    });
    console.log(`\nFound ${builders.length} searchable builders:`);
    builders.forEach(b => {
      console.log(`- ${b.displayName} (${b.id}) - ${b._count.sessionTypes} session types`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();