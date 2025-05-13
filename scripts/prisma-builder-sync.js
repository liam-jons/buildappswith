#!/usr/bin/env node

/**
 * Builder Profile Sync Script using Prisma
 * 
 * This script focuses on synchronizing BuilderProfile records from
 * development to production.
 * 
 * Usage:
 * node scripts/prisma-builder-sync.js
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

// Define color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Database connection strings
const DEV_DB_URL = 'postgresql://Buildappswith-dev_owner:npg_54LGbgNJuIUj@ep-shiny-star-abb3se6s-pooler.eu-west-2.aws.neon.tech/Buildappswith-dev?sslmode=require';
const PROD_DB_URL = 'postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require';

console.log(`${colors.bright}${colors.cyan}=== Builder Profile Sync Tool ===${colors.reset}\n`);

async function syncBuilderProfiles() {
  // Create Prisma client instances
  const devPrisma = new PrismaClient({
    datasources: {
      db: {
        url: DEV_DB_URL
      }
    }
  });

  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });

  try {
    // Step 1: Compare development and production data
    console.log(`${colors.yellow}1. Analyzing builder profiles before sync...${colors.reset}`);
    
    try {
      // Get all builder profiles from dev DB
      const devBuilders = await devPrisma.builderProfile.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log(`${colors.cyan}Development database: ${devBuilders.length} builder profiles${colors.reset}`);
      
      // Get all builder profiles from prod DB
      const prodBuilders = await prodPrisma.builderProfile.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log(`${colors.cyan}Production database: ${prodBuilders.length} builder profiles${colors.reset}\n`);
      
      // Look for Liam's profile in dev DB
      const liamDevProfile = await devPrisma.builderProfile.findFirst({
        where: {
          user: {
            name: {
              contains: 'Liam',
              mode: 'insensitive'
            }
          }
        },
        include: {
          user: true
        }
      });
      
      if (liamDevProfile) {
        console.log(`${colors.green}✓ Liam's profile found in development database${colors.reset}`);
        console.log(`   ID: ${liamDevProfile.id}`);
        console.log(`   User: ${liamDevProfile.user.name}`);
        console.log(`   Featured: ${liamDevProfile.featuredBuilder}`);
        console.log(`   Available for hire: ${liamDevProfile.availableForHire}\n`);
      } else {
        console.log(`${colors.red}✗ Liam's profile not found in development database${colors.reset}\n`);
      }
      
    } catch (error) {
      console.error(`${colors.red}Error analyzing database content:${colors.reset}`);
      console.error(error);
      console.log();
    }

    // Step 2: Push schema changes to production
    console.log(`${colors.yellow}2. Updating production schema...${colors.reset}`);
    
    try {
      console.log(`${colors.cyan}   Running Prisma db push to sync schema...${colors.reset}`);
      execSync(`DATABASE_URL="${PROD_DB_URL}" npx prisma db push --accept-data-loss`, {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Production schema updated${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Failed to update production schema:${colors.reset}`);
      console.error(error.message);
      process.exit(1);
    }
    
    // Step 3: Sync users first (since builder profiles depend on users)
    console.log(`${colors.yellow}3. Syncing users from development to production...${colors.reset}`);
    
    try {
      // Get all users from dev DB
      const devUsers = await devPrisma.user.findMany();
      
      // Create a map of existing prod users by email
      const prodUsers = await prodPrisma.user.findMany();
      const prodUsersByEmail = {};
      
      for (const user of prodUsers) {
        prodUsersByEmail[user.email] = user;
      }
      
      console.log(`${colors.cyan}   Found ${devUsers.length} users in development${colors.reset}`);
      console.log(`${colors.cyan}   Found ${prodUsers.length} users in production${colors.reset}`);
      
      // Sync users
      let userSyncSuccess = 0;
      let userSyncSkipped = 0;
      let userSyncCreated = 0;
      let userSyncUpdated = 0;
      
      for (const devUser of devUsers) {
        try {
          // Check if user exists in production
          const existingUser = prodUsersByEmail[devUser.email];
          
          if (existingUser) {
            // Update existing user
            await prodPrisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: devUser.name,
                image: devUser.image,
                stripeCustomerId: devUser.stripeCustomerId,
                verified: devUser.verified,
                isFounder: devUser.isFounder,
                clerkId: devUser.clerkId,
                roles: devUser.roles
              }
            });
            userSyncUpdated++;
          } else {
            // Create new user
            await prodPrisma.user.create({
              data: {
                id: devUser.id,
                name: devUser.name,
                email: devUser.email,
                emailVerified: devUser.emailVerified,
                image: devUser.image,
                stripeCustomerId: devUser.stripeCustomerId,
                verified: devUser.verified,
                isFounder: devUser.isFounder,
                clerkId: devUser.clerkId,
                roles: devUser.roles,
                createdAt: devUser.createdAt,
                updatedAt: devUser.updatedAt
              }
            });
            userSyncCreated++;
          }
          
          userSyncSuccess++;
        } catch (error) {
          console.error(`${colors.red}Error syncing user ${devUser.email}:${colors.reset}`, error.message);
          userSyncSkipped++;
        }
      }
      
      console.log(`${colors.green}✓ Synced ${userSyncSuccess}/${devUsers.length} users to production${colors.reset}`);
      console.log(`   Created: ${userSyncCreated}, Updated: ${userSyncUpdated}, Skipped: ${userSyncSkipped}\n`);
      
    } catch (error) {
      console.error(`${colors.red}Error syncing users:${colors.reset}`);
      console.error(error);
      console.log();
    }
    
    // Step 4: Sync builder profiles
    console.log(`${colors.yellow}4. Syncing builder profiles from development to production...${colors.reset}`);
    
    try {
      // Get all builder profiles from dev DB
      const devBuilders = await devPrisma.builderProfile.findMany();
      
      // Create a map of existing prod builder profiles by userId
      const prodBuilders = await prodPrisma.builderProfile.findMany();
      const prodBuildersByUserId = {};
      
      for (const builder of prodBuilders) {
        prodBuildersByUserId[builder.userId] = builder;
      }
      
      // Sync builder profiles
      let builderSyncSuccess = 0;
      let builderSyncSkipped = 0;
      let builderSyncCreated = 0;
      let builderSyncUpdated = 0;
      
      for (const devBuilder of devBuilders) {
        try {
          // Check if builder profile exists in production
          const existingBuilder = prodBuildersByUserId[devBuilder.userId];
          
          if (existingBuilder) {
            // Update existing builder profile
            await prodPrisma.builderProfile.update({
              where: { id: existingBuilder.id },
              data: {
                bio: devBuilder.bio,
                headline: devBuilder.headline,
                hourlyRate: devBuilder.hourlyRate,
                featuredBuilder: devBuilder.featuredBuilder,
                domains: devBuilder.domains,
                badges: devBuilder.badges,
                rating: devBuilder.rating,
                portfolioItems: devBuilder.portfolioItems,
                validationTier: devBuilder.validationTier,
                availableForHire: devBuilder.availableForHire,
                socialLinks: devBuilder.socialLinks,
                adhd_focus: devBuilder.adhd_focus
              }
            });
            builderSyncUpdated++;
          } else {
            // Create new builder profile
            await prodPrisma.builderProfile.create({
              data: {
                id: devBuilder.id,
                userId: devBuilder.userId,
                bio: devBuilder.bio,
                headline: devBuilder.headline,
                hourlyRate: devBuilder.hourlyRate,
                featuredBuilder: devBuilder.featuredBuilder,
                domains: devBuilder.domains,
                badges: devBuilder.badges,
                rating: devBuilder.rating,
                portfolioItems: devBuilder.portfolioItems,
                validationTier: devBuilder.validationTier,
                availableForHire: devBuilder.availableForHire,
                socialLinks: devBuilder.socialLinks,
                adhd_focus: devBuilder.adhd_focus,
                createdAt: devBuilder.createdAt,
                updatedAt: devBuilder.updatedAt
              }
            });
            builderSyncCreated++;
          }
          
          builderSyncSuccess++;
        } catch (error) {
          console.error(`${colors.red}Error syncing builder profile ${devBuilder.id}:${colors.reset}`, error.message);
          builderSyncSkipped++;
        }
      }
      
      console.log(`${colors.green}✓ Synced ${builderSyncSuccess}/${devBuilders.length} builder profiles to production${colors.reset}`);
      console.log(`   Created: ${builderSyncCreated}, Updated: ${builderSyncUpdated}, Skipped: ${builderSyncSkipped}\n`);
      
    } catch (error) {
      console.error(`${colors.red}Error syncing builder profiles:${colors.reset}`);
      console.error(error);
      console.log();
    }
    
    // Step 5: Verify sync success
    console.log(`${colors.yellow}5. Verifying sync success...${colors.reset}`);
    
    try {
      // Check for Liam's profile in production
      const liamProdProfile = await prodPrisma.builderProfile.findFirst({
        where: {
          user: {
            name: {
              contains: 'Liam',
              mode: 'insensitive'
            }
          }
        },
        include: {
          user: true
        }
      });
      
      if (liamProdProfile) {
        console.log(`${colors.green}✓ Liam's profile found in production database:${colors.reset}`);
        console.log(`   ID: ${liamProdProfile.id}`);
        console.log(`   User: ${liamProdProfile.user.name}`);
        console.log(`   Featured: ${liamProdProfile.featuredBuilder}`);
        console.log(`   Available for hire: ${liamProdProfile.availableForHire}`);
      } else {
        console.log(`${colors.red}✗ Liam's profile not found in production database${colors.reset}`);
      }
      
      // Count builder profiles with featuredBuilder = true
      const featuredBuilders = await prodPrisma.builderProfile.findMany({
        where: {
          featuredBuilder: true
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      console.log(`${colors.green}✓ Found ${featuredBuilders.length} featured builders in production marketplace${colors.reset}`);
      
      // List all featured builders
      if (featuredBuilders.length > 0) {
        console.log(`${colors.cyan}Featured builders in production:${colors.reset}`);
        featuredBuilders.forEach(builder => {
          console.log(`   - ${builder.user.name} (${builder.user.email})`);
        });
      }
      
    } catch (error) {
      console.error(`${colors.red}Error verifying sync:${colors.reset}`);
      console.error(error);
    }

    console.log(`\n${colors.bright}${colors.green}Builder profile sync completed successfully!${colors.reset}`);
    console.log(`${colors.yellow}Don't forget to check the production marketplace to ensure Liam's profile appears correctly.${colors.reset}`);

  } catch (error) {
    console.error(`\n${colors.red}Error during sync process:${colors.reset}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Disconnect Prisma clients
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

syncBuilderProfiles();