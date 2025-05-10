/**
 * Script to seed test database with Clerk test users
 * This file is used by GitHub Actions to provision test users
 */
const { PrismaClient } = require('@prisma/client');

// Map of Clerk test user IDs from the implementation plan
const testClerkIds = {
  clientOne: 'user_2wtz5pWuoIXbbkdndL6n5f0tMLT',
  premiumOne: 'user_2wtzoD4QCQCCYs4Z4MKUFAdMYQq',
  newBuilder: 'user_2wu00KHccnL1FoCIIzEQYlzVjpW',
  establishedBuilder: 'user_2wu07wHNdf7LolavvVZxbrmdEqg',
  adminOne: 'user_2wu0TwPYijtMmMrzvdiP7ys5Mmh',
  dualRole: 'user_2wu0bNqtVmt4E7WfGwrzlWSxd1k',
  tripleRole: 'user_2wu0EluO69r3MDAMSKy5ORgpz1Z',
};

async function seedTestUsers() {
  console.log('🌱 Seeding test users with Clerk IDs...');
  
  const prisma = new PrismaClient();
  
  try {
    // Create basic client user
    await prisma.user.upsert({
      where: { clerkId: testClerkIds.clientOne },
      update: {},
      create: {
        clerkId: testClerkIds.clientOne,
        email: 'client-test@buildappswith-test.com',
        name: 'Test Client',
        role: 'CLIENT',
        imageUrl: 'https://ui-avatars.com/api/?name=Test+Client',
        clientProfile: {
          create: {
            bio: 'I am a test client looking to build apps',
          }
        }
      }
    });
    
    // Create premium client user
    await prisma.user.upsert({
      where: { clerkId: testClerkIds.premiumOne },
      update: {},
      create: {
        clerkId: testClerkIds.premiumOne,
        email: 'premium-client@buildappswith-test.com',
        name: 'Premium Client',
        role: 'CLIENT',
        imageUrl: 'https://ui-avatars.com/api/?name=Premium+Client',
        clientProfile: {
          create: {
            bio: 'Premium client with advanced needs',
          }
        }
      }
    });
    
    // Create new builder user
    await prisma.user.upsert({
      where: { clerkId: testClerkIds.newBuilder },
      update: {},
      create: {
        clerkId: testClerkIds.newBuilder,
        email: 'new-builder@buildappswith-test.com',
        name: 'New Builder',
        role: 'BUILDER',
        imageUrl: 'https://ui-avatars.com/api/?name=New+Builder',
        builderProfile: {
          create: {
            bio: 'New to app building but eager to help',
            title: 'Junior Developer',
            socialLinks: {
              create: {
                platform: 'github',
                url: 'https://github.com/newbuilder'
              }
            },
            expertise: ['React', 'TypeScript'],
            hourlyRate: 75
          }
        }
      }
    });
    
    // Create established builder user
    await prisma.user.upsert({
      where: { clerkId: testClerkIds.establishedBuilder },
      update: {},
      create: {
        clerkId: testClerkIds.establishedBuilder,
        email: 'established-builder@buildappswith-test.com',
        name: 'Established Builder',
        role: 'BUILDER',
        imageUrl: 'https://ui-avatars.com/api/?name=Established+Builder',
        builderProfile: {
          create: {
            bio: 'Experienced builder with many successful projects',
            title: 'Senior Full-Stack Developer',
            socialLinks: {
              create: [
                {
                  platform: 'github',
                  url: 'https://github.com/establishedbuilder'
                },
                {
                  platform: 'linkedin',
                  url: 'https://linkedin.com/in/establishedbuilder'
                }
              ]
            },
            expertise: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
            hourlyRate: 150
          }
        }
      }
    });
    
    // Create admin user
    await prisma.user.upsert({
      where: { clerkId: testClerkIds.adminOne },
      update: {},
      create: {
        clerkId: testClerkIds.adminOne,
        email: 'admin@buildappswith-test.com',
        name: 'Admin User',
        role: 'ADMIN',
        imageUrl: 'https://ui-avatars.com/api/?name=Admin+User'
      }
    });
    
    // Create dual role user (builder and client)
    await prisma.user.upsert({
      where: { clerkId: testClerkIds.dualRole },
      update: {},
      create: {
        clerkId: testClerkIds.dualRole,
        email: 'dual-role@buildappswith-test.com',
        name: 'Dual Role User',
        role: 'BUILDER', // Primary role
        imageUrl: 'https://ui-avatars.com/api/?name=Dual+Role+User',
        builderProfile: {
          create: {
            bio: 'I build apps and also hire others',
            title: 'Developer & Entrepreneur',
            expertise: ['React', 'Vue.js', 'JavaScript'],
            hourlyRate: 120
          }
        },
        clientProfile: {
          create: {
            bio: 'Looking for specialists for my projects'
          }
        }
      }
    });
    
    console.log('✅ Test users seeded successfully');
  } catch (error) {
    console.error('Failed to seed test users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTestUsers();