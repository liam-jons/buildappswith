#!/usr/bin/env node

/**
 * Update Liam's Clerk ID Script (Fixed)
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

console.log(`${colors.bright}${colors.cyan}=== Update Liam's Clerk ID Tool (Fixed) ===${colors.reset}\n`);

async function updateLiamClerkId() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_DB_URL
      }
    }
  });

  try {
    // First, let's check the structure of the User table
    console.log(`${colors.yellow}Checking User table structure...${colors.reset}`);
    
    const userTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;
    
    console.log(`${colors.cyan}User table columns:${colors.reset}`);
    userTableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    console.log();
    
    // Step 1: Update Liam's user record in production
    console.log(`${colors.yellow}1. Finding Liam's user record in production...${colors.reset}`);
    
    let liamUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: 'Liam',
          mode: 'insensitive'
        }
      }
    });
    
    if (liamUser) {
      console.log(`${colors.green}✓ Found Liam's user: ${liamUser.name} (ID: ${liamUser.id})${colors.reset}`);
      
      // Update Liam's user with Clerk ID if not already set
      if (liamUser.clerkId !== LIAM_CLERK_ID) {
        const updateData = {
          email: LIAM_EMAIL,
          clerkId: LIAM_CLERK_ID,
          verified: true,
          roles: ['BUILDER', 'ADMIN']
        };
        
        // Add image field if it exists in the schema
        if (userTableInfo.some(col => col.column_name === 'image')) {
          updateData.image = LIAM_IMAGE_URL;
        } else if (userTableInfo.some(col => col.column_name === 'imageUrl')) {
          updateData.imageUrl = LIAM_IMAGE_URL;
        }
        
        liamUser = await prisma.user.update({
          where: { id: liamUser.id },
          data: updateData
        });
        
        console.log(`${colors.green}✓ Updated Liam's user with Clerk ID: ${LIAM_CLERK_ID}${colors.reset}\n`);
      } else {
        console.log(`${colors.cyan}   Liam's Clerk ID already correct${colors.reset}\n`);
      }
      
      // Step 2: Ensure Liam's builder profile is featured
      console.log(`${colors.yellow}2. Updating Liam's builder profile...${colors.reset}`);
      
      let liamProfile = await prisma.builderProfile.findFirst({
        where: {
          userId: liamUser.id
        }
      });
      
      if (liamProfile) {
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
      } else {
        console.log(`${colors.red}✗ Liam's builder profile not found${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.red}✗ Liam's user not found in production database${colors.reset}\n`);
    }
    
    // Step 3: Verify the update was successful
    console.log(`${colors.yellow}3. Verifying update...${colors.reset}`);
    
    const updatedLiam = await prisma.user.findFirst({
      where: {
        clerkId: LIAM_CLERK_ID
      },
      include: {
        builderProfile: true
      }
    });
    
    if (updatedLiam) {
      console.log(`${colors.green}✓ Clerk ID successfully updated${colors.reset}`);
      console.log(`  User: ${updatedLiam.name} (${updatedLiam.email})`);
      console.log(`  Clerk ID: ${updatedLiam.clerkId}`);
      
      if (updatedLiam.builderProfile) {
        console.log(`  Builder Profile: ${updatedLiam.builderProfile.id}`);
        console.log(`  Featured: ${updatedLiam.builderProfile.featuredBuilder}`);
        console.log(`  Available for hire: ${updatedLiam.builderProfile.availableForHire}`);
      } else {
        console.log(`  No builder profile found`);
      }
    } else {
      console.log(`${colors.red}✗ Failed to update Clerk ID${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}${colors.green}Update completed!${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error during update:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLiamClerkId();