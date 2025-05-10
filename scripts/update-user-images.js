/**
 * Update User Image URLs Script
 * 
 * This script updates all User records to have a default imageUrl value
 * to ensure builder images display correctly.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserImages() {
  try {
    console.log('Updating user imageUrl fields...');
    
    // Update all users to use the test builder image
    const updateResult = await prisma.user.updateMany({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' }
        ]
      },
      data: {
        imageUrl: '/images/builders-test/builder.png'
      }
    });
    
    console.log(`Updated ${updateResult.count} user records`);
    
    // Verify the update
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true
      }
    });
    
    console.log(`\nVerifying user records (${users.length} total):`);
    users.forEach(user => {
      console.log(`- User ${user.id}: ${user.name || 'No name'}`);
      console.log(`  Image URL: ${user.imageUrl || 'No image'}`);
    });
    
    console.log('\nUpdate completed successfully!');
  } catch (error) {
    console.error('Error updating user images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserImages();