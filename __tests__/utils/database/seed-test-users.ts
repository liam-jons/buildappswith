/**
 * Seed utility for Clerk test users
 * 
 * This module provides functionality to seed the test database with
 * users that match Clerk test accounts, ensuring proper integration
 * between Clerk's authentication and our database records.
 */
import { PrismaClient } from '@prisma/client';
import { testClerkIds } from '../models';

/**
 * Create users with the specified Clerk IDs in the database
 * @param prisma PrismaClient instance
 */
export async function seedTestUsers(prisma: PrismaClient): Promise<void> {
  try {
    console.log('🌱 Seeding test users with Clerk IDs...');
    
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
    throw error;
  }
}

/**
 * Check if a test user exists with the specified Clerk ID
 * @param prisma PrismaClient instance
 * @param clerkId Clerk user ID to check
 */
export async function checkTestUserExists(
  prisma: PrismaClient, 
  clerkId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId }
  });
  
  return !!user;
}

/**
 * Synchronize database with all test Clerk users
 * @param prisma PrismaClient instance
 */
export async function syncAllTestUsers(prisma: PrismaClient): Promise<void> {
  try {
    // Seed all test users
    await seedTestUsers(prisma);
    
    // Verify each test user exists
    for (const [key, clerkId] of Object.entries(testClerkIds)) {
      const exists = await checkTestUserExists(prisma, clerkId);
      if (exists) {
        console.log(`✓ Test user ${key} synchronized (clerkId: ${clerkId})`);
      } else {
        console.error(`✗ Failed to synchronize test user ${key} (clerkId: ${clerkId})`);
      }
    }
  } catch (error) {
    console.error('Error synchronizing test users:', error);
    throw error;
  }
}