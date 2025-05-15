/**
 * Script to update dummy builder profiles with placeholder avatar images
 * Uses pravatar.cc service for placeholder avatars
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map of builder names to pravatar.cc IDs for consistent avatars
const avatarMapping = {
  'Kenny': 'https://i.pravatar.cc/150?img=3',
  'Ryan': 'https://i.pravatar.cc/150?img=8',
  'Sheri': 'https://i.pravatar.cc/150?img=5',
  'Troy': 'https://i.pravatar.cc/150?img=7',
  'Sarah': 'https://i.pravatar.cc/150?img=9'
};

async function updateDummyAvatars() {
  try {
    console.log('Updating dummy builder avatars...');
    
    // Get all builders except Liam
    const builders = await prisma.user.findMany({
      where: {
        roles: {
          has: 'BUILDER'
        },
        name: {
          not: 'Liam Johnson'
        }
      }
    });
    
    for (const builder of builders) {
      const avatarUrl = avatarMapping[builder.name] || `https://i.pravatar.cc/150?u=${builder.email}`;
      
      await prisma.user.update({
        where: { id: builder.id },
        data: { imageUrl: avatarUrl }
      });
      
      console.log(`Updated ${builder.name} with avatar: ${avatarUrl}`);
    }
    
    console.log('All dummy builder avatars updated successfully!');
  } catch (error) {
    console.error('Error updating avatars:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDummyAvatars();