// Script for ongoing synchronization between Clerk and database
// Updated to use Clerk Express SDK
const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/express');

const prisma = new PrismaClient();

async function syncClerkUsers() {
  try {
    console.log('Starting Clerk-Database user synchronization...');
    
    // Initialize Clerk client with secret key
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY environment variable is not defined');
    }
    
    // Get all users from Clerk
    const clerkListUsers = clerkClient.users.listUsers;
    if (!clerkListUsers) {
      throw new Error('Clerk users.listUsers API not available');
    }
    
    const usersPage = await clerkListUsers({
      limit: 100,
    });
    
    const clerkUsers = usersPage.data || [];
    console.log(`Found ${clerkUsers.length} users in Clerk`);
    
    // Process each Clerk user
    for (const clerkUser of clerkUsers) {
      const primaryEmail = clerkUser.emailAddresses.find(email => 
        email.id === clerkUser.primaryEmailAddressId
      );
      
      const email = primaryEmail?.emailAddress;
      if (!email) {
        console.log(`Skipping user without email: ${clerkUser.id}`);
        continue;
      }
      
      // Extract roles from metadata
      const roles = clerkUser.publicMetadata?.roles || ['CLIENT'];
      
      // Check if user exists in database
      let dbUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { clerkId: clerkUser.id },
            { email }
          ]
        },
        include: { builderProfile: true, clientProfile: true, subscriberProfile: true }
      });
      
      if (dbUser) {
        console.log(`Updating existing user: ${email}`);
        
        // Update user data
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            clerkId: clerkUser.id,
            email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || dbUser.name,
            imageUrl: clerkUser.imageUrl || dbUser.imageUrl,
            roles,
            emailVerified: primaryEmail?.verification?.status === 'verified' 
              ? new Date() 
              : dbUser.emailVerified
          },
          include: { builderProfile: true, clientProfile: true, subscriberProfile: true }
        });
      } else {
        console.log(`Creating new user: ${email}`);
        
        // Create new user
        dbUser = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            imageUrl: clerkUser.imageUrl,
            roles,
            emailVerified: primaryEmail?.verification?.status === 'verified' 
              ? new Date() 
              : null,
            isDemo: false // New users are not demo accounts by default
          },
          include: { builderProfile: true, clientProfile: true, subscriberProfile: true }
        });
      }
      
      // Create necessary profiles based on roles
      await ensureUserProfiles(dbUser, roles);
    }
    
    // Check for DB users without valid Clerk IDs
    const orphanedUsers = await prisma.user.findMany({
      where: {
        clerkId: { not: null },
        NOT: { 
          clerkId: { in: clerkUsers.map(u => u.id) }
        },
        // Don't include demo users in this check
        isDemo: false
      }
    });
    
    console.log(`Found ${orphanedUsers.length} users with invalid Clerk IDs`);
    
    // Nullify invalid Clerk IDs
    if (orphanedUsers.length > 0) {
      for (const user of orphanedUsers) {
        console.log(`Nullifying invalid Clerk ID for ${user.email}`);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { clerkId: null }
        });
      }
    }
    
    console.log('Clerk-Database user synchronization completed');
    
  } catch (error) {
    console.error('Error syncing Clerk users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureUserProfiles(user, roles) {
  // Create builder profile if needed
  if (roles.includes('BUILDER') && !user.builderProfile) {
    console.log(`Creating builder profile for ${user.email}`);
    
    await prisma.builderProfile.create({
      data: {
        userId: user.id,
        searchable: true,
        validationTier: 1,
        domains: [],
        badges: [],
        availability: 'available',
        expertiseAreas: {
          BUILDING_WITH_AI: {
            level: 3,
            description: "Expert in creating AI-powered applications and workflows",
            yearsExperience: 2,
            bulletPoints: [
              "Creates AI automation workflows",
              "Builds custom AI integrations",
              "Develops AI-enabled applications"
            ],
            testimonials: []
          }
        }
      }
    });
  }
  
  // Create client profile if needed
  if (roles.includes('CLIENT') && !user.clientProfile) {
    console.log(`Creating client profile for ${user.email}`);
    
    await prisma.clientProfile.create({
      data: {
        userId: user.id
      }
    });
  }
  
  // Create subscriber profile if needed
  if (roles.includes('SUBSCRIBER') && !user.subscriberProfile) {
    console.log(`Creating subscriber profile for ${user.email}`);
    
    try {
      await prisma.subscriberProfile.create({
        data: {
          userId: user.id,
          interests: [],
          newsletterFrequency: 'weekly'
        }
      });
    } catch (error) {
      console.log(`Note: Could not create subscriber profile - ${error.message}`);
    }
  }
}

// Add a specific function for Liam's account to ensure it's properly set up
async function ensureLiamAccount() {
  console.log("Ensuring Liam's account is properly set up...");
  
  const LIAM_ACCOUNT = {
    name: 'Liam Jons',
    email: 'liam.jones@buildappswith.com',
    clerkId: 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx', // From documentation
    roles: ['ADMIN', 'BUILDER', 'CLIENT'],
    isDemo: false
  };
  
  // Find Liam's account
  let dbUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { clerkId: LIAM_ACCOUNT.clerkId },
        { email: LIAM_ACCOUNT.email }
      ]
    },
    include: { builderProfile: true }
  });
  
  if (dbUser) {
    console.log(`Found Liam's account: ${dbUser.email}`);
    
    // Update Liam's roles and ensure they include ADMIN
    const roles = [...new Set([...dbUser.roles, ...LIAM_ACCOUNT.roles])];
    
    // Update user info
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        clerkId: LIAM_ACCOUNT.clerkId,
        roles,
        isDemo: LIAM_ACCOUNT.isDemo
      }
    });
    
    // Ensure Liam has a builder profile that's featured and searchable
    if (dbUser.builderProfile) {
      await prisma.builderProfile.update({
        where: { id: dbUser.builderProfile.id },
        data: {
          searchable: true,
          featured: true,
          validationTier: 3
        }
      });
    }
    
    console.log("Liam's account updated successfully");
  } else {
    console.log("Liam's account not found - this should be created during general sync");
  }
}

// Run the sync
async function main() {
  try {
    await syncClerkUsers();
    await ensureLiamAccount();
  } catch (error) {
    console.error("Error running sync:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();