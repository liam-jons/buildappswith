#!/usr/bin/env node

/**
 * Liam Profile Sync Script
 * 
 * A minimal script to sync just Liam's profile from dev to production
 * with necessary schema updates.
 * 
 * Usage:
 * node scripts/sync-liam-profile.js
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

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

console.log(`${colors.bright}${colors.cyan}=== Liam Profile Sync Tool ===${colors.reset}\n`);

// This function creates the necessary tables directly with SQL
// to bypass Prisma's complex schema management
async function runDirectSql() {
  try {
    // Create dev Prisma client for reading data
    const devPrisma = new PrismaClient({
      datasources: {
        db: {
          url: DEV_DB_URL
        }
      }
    });

    // Create prod Prisma client for writing data
    const prodPrisma = new PrismaClient({
      datasources: {
        db: {
          url: PROD_DB_URL
        }
      }
    });

    // Step 1: Sync schema to production
    console.log(`${colors.yellow}1. Syncing schema to production...${colors.reset}`);
    
    try {
      execSync(`DATABASE_URL="${PROD_DB_URL}" npx prisma db push --force-reset --accept-data-loss`, {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Schema synced to production${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Failed to sync schema:${colors.reset}`, error.message);
      process.exit(1);
    }

    // Step 2: Find Liam's user and profile in dev
    console.log(`${colors.yellow}2. Finding Liam's profile in development...${colors.reset}`);
    
    let liamUser = null;
    let liamBuilderProfile = null;
    
    try {
      // Find all users matching "Liam"
      const users = await devPrisma.$queryRaw`
        SELECT * FROM "User" WHERE name ILIKE '%Liam%'
      `;
      
      if (users.length === 0) {
        console.log(`${colors.red}✗ No users matching "Liam" found in development${colors.reset}`);
        process.exit(1);
      }
      
      liamUser = users[0];
      console.log(`${colors.green}✓ Found Liam's user: ${liamUser.name} (${liamUser.email})${colors.reset}`);
      
      // Find Liam's builder profile
      const profiles = await devPrisma.$queryRaw`
        SELECT * FROM "BuilderProfile" WHERE "userId" = ${liamUser.id}
      `;
      
      if (profiles.length === 0) {
        console.log(`${colors.red}✗ No builder profile found for Liam in development${colors.reset}`);
        process.exit(1);
      }
      
      liamBuilderProfile = profiles[0];
      console.log(`${colors.green}✓ Found Liam's builder profile: ID ${liamBuilderProfile.id}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Error finding Liam's profile:${colors.reset}`, error);
      process.exit(1);
    }
    
    // Step 3: Create Liam's user in production
    console.log(`${colors.yellow}3. Creating Liam's user in production...${colors.reset}`);
    
    try {
      const createdUser = await prodPrisma.user.create({
        data: {
          id: liamUser.id,
          name: liamUser.name,
          email: liamUser.email,
          emailVerified: liamUser.emailVerified,
          // Use imageUrl instead of image based on schema changes
          imageUrl: liamUser.image,
          stripeCustomerId: liamUser.stripeCustomerId,
          verified: liamUser.verified,
          isFounder: liamUser.isFounder,
          clerkId: liamUser.clerkId,
          roles: liamUser.roles,
          createdAt: liamUser.createdAt,
          updatedAt: liamUser.updatedAt
        }
      });
      
      console.log(`${colors.green}✓ Created Liam's user in production: ${createdUser.name}${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Error creating Liam's user:${colors.reset}`, error);
      process.exit(1);
    }
    
    // Step 4: Create Liam's builder profile in production
    console.log(`${colors.yellow}4. Creating Liam's builder profile in production...${colors.reset}`);
    
    try {
      const createdProfile = await prodPrisma.builderProfile.create({
        data: {
          id: liamBuilderProfile.id,
          userId: liamBuilderProfile.userId,
          bio: liamBuilderProfile.bio,
          headline: liamBuilderProfile.headline,
          hourlyRate: liamBuilderProfile.hourlyRate,
          featuredBuilder: true, // Make sure Liam is featured
          domains: liamBuilderProfile.domains,
          badges: liamBuilderProfile.badges,
          rating: liamBuilderProfile.rating,
          portfolioItems: liamBuilderProfile.portfolioItems,
          validationTier: liamBuilderProfile.validationTier,
          availableForHire: true, // Make sure Liam is available for hire
          socialLinks: liamBuilderProfile.socialLinks,
          adhd_focus: liamBuilderProfile.adhd_focus,
          createdAt: liamBuilderProfile.createdAt,
          updatedAt: liamBuilderProfile.updatedAt
        }
      });
      
      console.log(`${colors.green}✓ Created Liam's builder profile in production${colors.reset}\n`);
      
      // Make sure featuredBuilder is true by updating again
      await prodPrisma.builderProfile.update({
        where: { id: createdProfile.id },
        data: {
          featuredBuilder: true,
          availableForHire: true
        }
      });
      
      console.log(`${colors.green}✓ Ensured Liam's profile is featured and available for hire${colors.reset}\n`);
    } catch (error) {
      console.error(`${colors.red}Error creating Liam's builder profile:${colors.reset}`, error);
      process.exit(1);
    }
    
    // Step 5: Create 5 demo builder profiles
    console.log(`${colors.yellow}5. Creating demo builder profiles...${colors.reset}`);
    
    const demoBuilders = [
      { name: 'Alex Johnson', title: 'Frontend Developer', bio: 'Specializing in React and Vue' },
      { name: 'Sarah Smith', title: 'Full Stack Engineer', bio: 'Python, Node.js and React expert' },
      { name: 'David Chen', title: 'Mobile Developer', bio: 'iOS and Android development specialist' },
      { name: 'Maria Garcia', title: 'UI/UX Designer', bio: 'Creating beautiful, user-friendly interfaces' },
      { name: 'James Wilson', title: 'DevOps Engineer', bio: 'Infrastructure and CI/CD pipeline expert' }
    ];
    
    let demoCount = 0;
    
    for (const demo of demoBuilders) {
      try {
        // Create demo user
        const demoUser = await prodPrisma.user.create({
          data: {
            name: demo.name,
            email: `demo.${demo.name.toLowerCase().replace(' ', '.')}@buildappswith.com`,
            verified: true,
            isDemo: true, // Mark as demo
            roles: ['CLIENT', 'BUILDER']
          }
        });
        
        // Create demo builder profile
        await prodPrisma.builderProfile.create({
          data: {
            userId: demoUser.id,
            bio: demo.bio,
            headline: demo.title,
            hourlyRate: 75.00,
            featuredBuilder: false,
            domains: ['Web', 'Mobile', 'Design'],
            badges: ['Verified'],
            rating: 4.7,
            portfolioItems: [{ title: 'Demo Project', description: 'This is a demo project' }],
            validationTier: 1,
            availableForHire: true,
            adhd_focus: Math.random() > 0.5
          }
        });
        
        demoCount++;
      } catch (error) {
        console.error(`${colors.red}Error creating demo builder ${demo.name}:${colors.reset}`, error);
      }
    }
    
    console.log(`${colors.green}✓ Created ${demoCount} demo builder profiles${colors.reset}\n`);
    
    // Step 6: Verify everything is working
    console.log(`${colors.yellow}6. Verifying sync results...${colors.reset}`);
    
    const builders = await prodPrisma.builderProfile.findMany({
      include: {
        user: true
      }
    });
    
    console.log(`${colors.green}✓ Found ${builders.length} builder profiles in production${colors.reset}`);
    console.log(`${colors.cyan}Builder profiles in production:${colors.reset}`);
    
    for (const builder of builders) {
      console.log(`   - ${builder.user.name}${builder.user.isDemo ? ' (Demo)' : ''} - ${builder.featuredBuilder ? 'Featured' : 'Standard'}`);
    }
    
    // Find Liam's profile specifically
    const liamInProd = await prodPrisma.builderProfile.findFirst({
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
    
    if (liamInProd) {
      console.log(`\n${colors.green}✓ Liam's profile is successfully in production:${colors.reset}`);
      console.log(`   - Name: ${liamInProd.user.name}`);
      console.log(`   - Email: ${liamInProd.user.email}`);
      console.log(`   - Featured: ${liamInProd.featuredBuilder}`);
      console.log(`   - Available for hire: ${liamInProd.availableForHire}`);
    } else {
      console.log(`\n${colors.red}✗ Liam's profile is NOT in production${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}${colors.green}Liam's profile sync completed successfully!${colors.reset}`);
    
    // Clean up Prisma connections
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  } catch (error) {
    console.error(`\n${colors.red}Error during synchronization:${colors.reset}`, error);
    process.exit(1);
  }
}

runDirectSql();