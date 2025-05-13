// Script to verify Liam's account in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Known info for Liam's account
const LIAM_ACCOUNT = {
  name: 'Liam Jons',
  email: 'liam.jones@buildappswith.com',
  clerkId: 'user_2wiigzHyOhaAl4PPIhkKyT2yAkx', // From documentation
  roles: ['ADMIN', 'BUILDER', 'CLIENT'],
  isDemo: false
};

async function verifyLiamAccount() {
  try {
    console.log('Checking for Liam\'s account in database...');
    
    // Find Liam's account by email
    let dbUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { clerkId: LIAM_ACCOUNT.clerkId },
          { email: LIAM_ACCOUNT.email }
        ]
      },
      include: { 
        builderProfile: true, 
        clientProfile: true,
        subscriberProfile: true
      }
    });
    
    if (dbUser) {
      console.log(`Found existing user: ${dbUser.email}`);
      console.log(`Current roles: ${dbUser.roles.join(', ')}`);
      console.log(`Has builderProfile: ${!!dbUser.builderProfile}`);
      console.log(`Has clientProfile: ${!!dbUser.clientProfile}`);
      console.log(`Has subscriberProfile: ${!!dbUser.subscriberProfile}`);
      console.log(`Is demo account: ${dbUser.isDemo}`);
      
      // Update Liam's account with the correct data
      console.log('Updating Liam\'s account with correct data...');
      
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          clerkId: LIAM_ACCOUNT.clerkId,
          name: LIAM_ACCOUNT.name,
          roles: LIAM_ACCOUNT.roles,
          isDemo: LIAM_ACCOUNT.isDemo
        },
        include: { 
          builderProfile: true, 
          clientProfile: true 
        }
      });
      
      // Ensure builder profile is correctly set up
      if (dbUser.builderProfile) {
        console.log('Updating builder profile...');
        
        await prisma.builderProfile.update({
          where: { id: dbUser.builderProfile.id },
          data: {
            searchable: true,
            featured: true,
            validationTier: 3, // Expert level
            expertiseAreas: {
              BUILDING_WITH_AI: {
                level: 4,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 3,
                bulletPoints: [
                  "Specializes in AI application architecture and deployment",
                  "Builds custom AI agents for workflow automation",
                  "Creates seamless integrations between AI services"
                ],
                testimonials: []
              },
              AI_LITERACY: {
                level: 4,
                description: "Specializes in making AI concepts accessible to beginners",
                yearsExperience: 2,
                bulletPoints: [
                  "Delivers workshops on practical AI implementation",
                  "Translates technical AI concepts for business audiences",
                  "Creates learning paths for AI skill development"
                ],
                testimonials: []
              }
            }
          }
        });
      } else {
        console.log('Creating builder profile...');
        
        await prisma.builderProfile.create({
          data: {
            userId: dbUser.id,
            searchable: true,
            featured: true,
            validationTier: 3,
            domains: [],
            badges: [],
            availability: 'available',
            expertiseAreas: {
              BUILDING_WITH_AI: {
                level: 4,
                description: "Expert in creating AI-powered applications and workflows",
                yearsExperience: 3,
                bulletPoints: [
                  "Specializes in AI application architecture and deployment",
                  "Builds custom AI agents for workflow automation",
                  "Creates seamless integrations between AI services"
                ],
                testimonials: []
              }
            }
          }
        });
      }
      
      console.log('Liam\'s account verification and update completed');
    } else {
      console.log('Liam\'s account not found in database, creating...');
      
      // Create Liam's account
      dbUser = await prisma.user.create({
        data: {
          clerkId: LIAM_ACCOUNT.clerkId,
          name: LIAM_ACCOUNT.name,
          email: LIAM_ACCOUNT.email,
          roles: LIAM_ACCOUNT.roles,
          isDemo: LIAM_ACCOUNT.isDemo,
          builderProfile: {
            create: {
              validationTier: 3,
              domains: [],
              badges: [],
              searchable: true,
              featured: true,
              availability: 'available',
              expertiseAreas: {
                BUILDING_WITH_AI: {
                  level: 4,
                  description: "Expert in creating AI-powered applications and workflows",
                  yearsExperience: 3,
                  bulletPoints: [
                    "Specializes in AI application architecture and deployment",
                    "Builds custom AI agents for workflow automation", 
                    "Creates seamless integrations between AI services"
                  ],
                  testimonials: []
                }
              }
            }
          },
          clientProfile: {
            create: {}
          }
        }
      });
      
      console.log('Liam\'s account created successfully');
    }
    
    // Final check
    const verifiedUser = await prisma.user.findUnique({
      where: { email: LIAM_ACCOUNT.email },
      include: { 
        builderProfile: true, 
        clientProfile: true 
      }
    });
    
    console.log('Verification complete:');
    console.log(`- Name: ${verifiedUser.name}`);
    console.log(`- Email: ${verifiedUser.email}`);
    console.log(`- Clerk ID: ${verifiedUser.clerkId}`);
    console.log(`- Roles: ${verifiedUser.roles.join(', ')}`);
    console.log(`- IsDemo: ${verifiedUser.isDemo}`);
    console.log(`- Builder profile: ${verifiedUser.builderProfile ? 'Created' : 'Missing'}`);
    console.log(`- Client profile: ${verifiedUser.clientProfile ? 'Created' : 'Missing'}`);
    
  } catch (error) {
    console.error('Error verifying Liam\'s account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyLiamAccount();