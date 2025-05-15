const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateClientIdNullable() {
  console.log('Updating clientId to be nullable in production database...');
  
  try {
    // Run the SQL to make clientId nullable
    await prisma.$executeRaw`
      ALTER TABLE "Booking" 
      ALTER COLUMN "clientId" DROP NOT NULL;
    `;
    
    console.log('Successfully updated clientId to be nullable');
    
    // Verify the change
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Booking' AND column_name = 'clientId';
    `;
    
    console.log('Verification:', tableInfo);
    
  } catch (error) {
    console.error('Error updating clientId:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateClientIdNullable().catch(console.error);