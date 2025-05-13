#!/usr/bin/env node

/**
 * Update Liam's Clerk ID Script
 * 
 * This script updates Liam's Clerk ID in the production database
 * and ensures the profile is featured and searchable.
 */

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

// Database connection string
const PROD_DB_URL = 'postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require';

// Liam's Clerk ID from the provided JSON
const LIAM_CLERK_ID = 'user_2wBNHJwI9cJdILyvlRnv4zxu090';
const LIAM_NAME = 'Liam Jons';
const LIAM_EMAIL = 'liam@buildappswith.com';
const LIAM_IMAGE_URL = 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ3aVBtQUpNU2tzUzIzdTJIb0VDSGtlZEVhSSJ9';

console.log(`${colors.bright}${colors.cyan}=== Update Liam's Clerk ID Tool ===${colors.reset}\n`);

async function updateLiamClerkId() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });

  try {
    // Step 1: Find Liam's user record in production
    console.log(`${colors.yellow}1. Finding Liam's user record in production...${colors.reset}`);
    
    let liamUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Liam',
          mode: 'insensitive'
        }
      }
    });
    
    // If Liam's user doesn't exist, create it
    if (!liamUser) {
      console.log(`${colors.yellow}   Liam's user not found, creating...${colors.reset}`);
      
      liamUser = await prisma.user.create({
        data: {
          name: LIAM_NAME,
          email: LIAM_EMAIL,
          imageUrl: LIAM_IMAGE_URL,
          clerkId: LIAM_CLERK_ID,
          verified: true,
          roles: ['BUILDER', 'ADMIN']
        }
      });
      
      console.log(`${colors.green}✓ Created Liam's user: ${liamUser.name} (ID: ${liamUser.id})${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✓ Found Liam's user: ${liamUser.name} (ID: ${liamUser.id})${colors.reset}`);
      
      // Update Liam's user with Clerk ID if not already set
      if (liamUser.clerkId !== LIAM_CLERK_ID) {
        liamUser = await prisma.user.update({
          where: { id: liamUser.id },
          data: {
            clerkId: LIAM_CLERK_ID,
            imageUrl: LIAM_IMAGE_URL,
            verified: true,
            roles: ['BUILDER', 'ADMIN']
          }
        });
        
        console.log(`${colors.green}✓ Updated Liam's user with Clerk ID: ${LIAM_CLERK_ID}${colors.reset}\n`);
      } else {
        console.log(`${colors.cyan}   Liam's Clerk ID already correct${colors.reset}\n`);
      }
    }
    
    // Step 2: Find or create Liam's builder profile
    console.log(`${colors.yellow}2. Finding Liam's builder profile...${colors.reset}`);
    
    let liamProfile = await prisma.builderProfile.findFirst({
      where: {
        userId: liamUser.id
      }
    });
    
    // If profile doesn't exist, create it
    if (!liamProfile) {
      console.log(`${colors.yellow}   Liam's builder profile not found, creating...${colors.reset}`);
      
      liamProfile = await prisma.builderProfile.create({
        data: {
          userId: liamUser.id,
          bio: "Experienced software developer and mentor specializing in React, Node.js, and TypeScript.",
          headline: "Senior Software Engineer & Mentor",
          hourlyRate: 150.00,
          featuredBuilder: true,
          domains: ["Frontend", "Backend", "Full Stack"],
          badges: ["Verified", "Senior"],
          rating: 4.9,
          validationTier: 3,
          availableForHire: true,
          portfolioItems: [
            {
              title: "BuildAppsWith Platform",
              description: "A platform connecting developers with clients."
            }
          ]
        }
      });
      
      console.log(`${colors.green}✓ Created Liam's builder profile (ID: ${liamProfile.id})${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✓ Found Liam's builder profile (ID: ${liamProfile.id})${colors.reset}`);
      
      // Update profile to ensure it's featured and available
      liamProfile = await prisma.builderProfile.update({
        where: { id: liamProfile.id },
        data: {
          featuredBuilder: true,
          availableForHire: true,
          validationTier: 3
        }
      });
      
      console.log(`${colors.green}✓ Updated Liam's profile: Featured=${liamProfile.featuredBuilder}, Available=${liamProfile.availableForHire}${colors.reset}\n`);
    }

    // Step 3: Create a session type for Liam if none exists
    console.log(`${colors.yellow}3. Checking for session types...${colors.reset}`);
    
    const sessionTypes = await prisma.sessionType.findMany({
      where: {
        builderId: liamProfile.id
      }
    });
    
    if (sessionTypes.length === 0) {
      console.log(`${colors.yellow}   No session types found, creating one...${colors.reset}`);
      
      const sessionType = await prisma.sessionType.create({
        data: {
          builderId: liamProfile.id,
          title: "1:1 Development Consultation",
          description: "Get personalized guidance on your development projects.",
          durationMinutes: 60,
          price: 150.00,
          currency: "USD",
          isActive: true,
          color: "#4F46E5",
          calendlyEventTypeId: "sch-3cf67b98-c5fe-440c-9fdb-65a12c14d45b" // Example ID, update if needed
        }
      });
      
      console.log(`${colors.green}✓ Created session type: ${sessionType.title} (ID: ${sessionType.id})${colors.reset}\n`);
    } else {
      console.log(`${colors.green}✓ Found ${sessionTypes.length} existing session types for Liam${colors.reset}\n`);
    }
    
    // Step 4: Verify everything is set up correctly
    console.log(`${colors.yellow}4. Verifying setup...${colors.reset}`);
    
    const finalUser = await prisma.user.findUnique({
      where: { id: liamUser.id },
      include: {
        builderProfile: true
      }
    });
    
    console.log(`${colors.cyan}Final user record:${colors.reset}`);
    console.log(`  Name: ${finalUser.name}`);
    console.log(`  Email: ${finalUser.email}`);
    console.log(`  Clerk ID: ${finalUser.clerkId}`);
    console.log(`  Verified: ${finalUser.verified}`);
    console.log(`  Roles: ${finalUser.roles.join(', ')}`);
    console.log(`  Has builder profile: ${finalUser.builderProfile !== null}`);
    
    if (finalUser.builderProfile) {
      console.log(`  Featured: ${finalUser.builderProfile.featuredBuilder}`);
      console.log(`  Available for hire: ${finalUser.builderProfile.availableForHire}`);
      console.log(`  Validation tier: ${finalUser.builderProfile.validationTier}`);
    }
    
    console.log(`\n${colors.bright}${colors.green}Liam's profile has been successfully updated!${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error during update:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLiamClerkId();