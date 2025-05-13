// Script to synchronize production Clerk users with database
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');

const prisma = new PrismaClient();

// Known production users
const PRODUCTION_USERS = [
  {
    clerkId: 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx',
    name: 'Liam Jons',
    email: 'liam.jones@buildappswith.com',
    roles: ['ADMIN', 'BUILDER', 'CLIENT'],
    createBuilderProfile: true,
    featured: true,
    searchable: true,
    isDemo: false
  },
  {
    clerkId: 'user_2x0BF1LtHXGViNF3IxOz288fpSk',
    name: 'John Smith',
    email: 'john@example.com',  // Update with actual email
    roles: ['CLIENT'],
    createBuilderProfile: false,
    isDemo: false
  }
  // Demo users to be added - these will be filled in from development
  // But marked as demo accounts
];

async function syncProductionUsers() {
  try {
    console.log('Starting production user synchronization...');
    
    for (const userData of PRODUCTION_USERS) {
      // Check if user exists in database
      let dbUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { clerkId: userData.clerkId },
            { email: userData.email }
          ]
        },
        include: { builderProfile: true }
      });
      
      if (dbUser) {
        console.log(`Updating existing user: ${userData.email}`);
        
        // Update user data
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            clerkId: userData.clerkId,
            name: userData.name,
            email: userData.email,
            roles: userData.roles,
            isDemo: userData.isDemo || false
          },
          include: { builderProfile: true }
        });
      } else {
        console.log(`Creating new user: ${userData.email}`);
        
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: userData.clerkId,
            name: userData.name,
            email: userData.email,
            roles: userData.roles,
            isDemo: userData.isDemo || false
          },
          include: { builderProfile: true }
        });
      }
      
      // Create builder profile if needed
      if (userData.createBuilderProfile && !dbUser.builderProfile) {
        console.log(`Creating builder profile for ${userData.email}`);
        
        await prisma.builderProfile.create({
          data: {
            userId: dbUser.id,
            searchable: userData.searchable || true,
            featured: userData.featured || false,
            validationTier: 2,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: {
              BUILDING_WITH_AI: {
                level: 4,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 3
              },
              AI_LITERACY: {
                level: 4,
                description: "Specializes in making AI concepts accessible to beginners",
                yearsExperience: 2
              },
              ADHD_PRODUCTIVITY: {
                level: 3,
                description: "Helps clients overcome ADHD challenges with practical AI solutions",
                yearsExperience: 2
              }
            }
          }
        });
      } else if (userData.createBuilderProfile && dbUser.builderProfile) {
        // Update existing builder profile
        console.log(`Updating builder profile for ${userData.email}`);
        
        await prisma.builderProfile.update({
          where: { id: dbUser.builderProfile.id },
          data: {
            searchable: userData.searchable || true,
            featured: userData.featured || false,
            expertiseAreas: dbUser.builderProfile.expertiseAreas || {
              BUILDING_WITH_AI: {
                level: 4,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 3
              }
            }
          }
        });
      }
      
      // Verify in Clerk if needed
      try {
        const clerkUser = await clerkClient.users.getUser(userData.clerkId);
        
        // Update Clerk metadata if needed
        if (!clerkUser.publicMetadata?.roles || 
            JSON.stringify(clerkUser.publicMetadata.roles) !== JSON.stringify(userData.roles)) {
          
          console.log(`Updating Clerk roles for ${userData.email}`);
          
          await clerkClient.users.updateUser(userData.clerkId, {
            publicMetadata: {
              ...clerkUser.publicMetadata,
              roles: userData.roles
            }
          });
        }
      } catch (error) {
        console.warn(`Could not verify Clerk user ${userData.clerkId}: ${error.message}`);
      }
    }
    
    console.log('Production user synchronization completed');
    
  } catch (error) {
    console.error('Error syncing production users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncProductionUsers();