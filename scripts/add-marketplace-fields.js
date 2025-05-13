#!/usr/bin/env node

/**
 * Add Missing Marketplace Fields to Production Database
 * 
 * This script adds the required fields to the BuilderProfile table
 * to support marketplace visibility and search.
 */

const { PrismaClient } = require('@prisma/client');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

async function addMarketplaceFields() {
  // Use production database URL or default
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
  });

  console.log(`${colors.bright}${colors.cyan}Adding missing marketplace fields to database...${colors.reset}\n`);
  
  try {
    // Check if database is accessible
    console.log(`${colors.yellow}Testing database connection...${colors.reset}`);
    
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    console.log(`${colors.green}Connected to database. Found ${tables.length} tables.${colors.reset}`);
    
    // 1. Check and add searchable field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'searchable' field...${colors.reset}`);
    
    const hasSearchable = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'searchable'
      ) as exists
    `;
    
    if (!hasSearchable[0].exists) {
      console.log(`Adding 'searchable' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "searchable" BOOLEAN NOT NULL DEFAULT TRUE
      `;
      
      // Create index for searchable
      await prisma.$executeRaw`
        CREATE INDEX "BuilderProfile_searchable_idx" ON "BuilderProfile" ("searchable")
      `;
      
      console.log(`${colors.green}Successfully added 'searchable' column and index${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'searchable' column already exists${colors.reset}`);
    }
    
    // 2. Check and add featured field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'featured' field...${colors.reset}`);
    
    const hasFeatured = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'featured'
      ) as exists
    `;
    
    if (!hasFeatured[0].exists) {
      console.log(`Adding 'featured' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT FALSE
      `;
      
      // Set featuredBuilder profiles to featured = true
      await prisma.$executeRaw`
        UPDATE "BuilderProfile" 
        SET "featured" = "featuredBuilder"
      `;
      
      // Create index for featured
      await prisma.$executeRaw`
        CREATE INDEX "BuilderProfile_featured_idx" ON "BuilderProfile" ("featured")
      `;
      
      console.log(`${colors.green}Successfully added 'featured' column and index${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'featured' column already exists${colors.reset}`);
    }
    
    // 3. Check and add topSkills field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'topSkills' field...${colors.reset}`);
    
    const hasTopSkills = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'topSkills'
      ) as exists
    `;
    
    if (!hasTopSkills[0].exists) {
      console.log(`Adding 'topSkills' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "topSkills" TEXT[] DEFAULT ARRAY[]::TEXT[]
      `;
      
      console.log(`${colors.green}Successfully added 'topSkills' column${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'topSkills' column already exists${colors.reset}`);
    }
    
    // 4. Check and add expertiseAreas field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'expertiseAreas' field...${colors.reset}`);
    
    const hasExpertiseAreas = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'expertiseAreas'
      ) as exists
    `;
    
    if (!hasExpertiseAreas[0].exists) {
      console.log(`Adding 'expertiseAreas' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "expertiseAreas" JSONB
      `;
      
      console.log(`${colors.green}Successfully added 'expertiseAreas' column${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'expertiseAreas' column already exists${colors.reset}`);
    }
    
    // 5. Check and add displayName field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'displayName' field...${colors.reset}`);
    
    const hasDisplayName = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'displayName'
      ) as exists
    `;
    
    if (!hasDisplayName[0].exists) {
      console.log(`Adding 'displayName' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "displayName" TEXT
      `;
      
      console.log(`${colors.green}Successfully added 'displayName' column${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'displayName' column already exists${colors.reset}`);
    }
    
    // 6. Check and add tagline field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'tagline' field...${colors.reset}`);
    
    const hasTagline = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'tagline'
      ) as exists
    `;
    
    if (!hasTagline[0].exists) {
      console.log(`Adding 'tagline' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "tagline" TEXT
      `;
      
      console.log(`${colors.green}Successfully added 'tagline' column${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'tagline' column already exists${colors.reset}`);
    }
    
    // 7. Check and add availability field to BuilderProfile
    console.log(`\n${colors.yellow}Checking 'availability' field...${colors.reset}`);
    
    const hasAvailability = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'BuilderProfile' AND column_name = 'availability'
      ) as exists
    `;
    
    if (!hasAvailability[0].exists) {
      console.log(`Adding 'availability' column to BuilderProfile table...`);
      await prisma.$executeRaw`
        ALTER TABLE "BuilderProfile" 
        ADD COLUMN "availability" TEXT NOT NULL DEFAULT 'available'
      `;
      
      // Create index for availability
      await prisma.$executeRaw`
        CREATE INDEX "BuilderProfile_availability_idx" ON "BuilderProfile" ("availability")
      `;
      
      console.log(`${colors.green}Successfully added 'availability' column and index${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'availability' column already exists${colors.reset}`);
    }
    
    // 8. Check and ensure validationTier index exists
    console.log(`\n${colors.yellow}Checking 'validationTier' index...${colors.reset}`);
    
    const hasValidationTierIndex = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE tablename = 'BuilderProfile' AND indexname = 'BuilderProfile_validationTier_idx'
      ) as exists
    `;
    
    if (!hasValidationTierIndex[0].exists) {
      console.log(`Creating index on 'validationTier' column...`);
      await prisma.$executeRaw`
        CREATE INDEX "BuilderProfile_validationTier_idx" ON "BuilderProfile" ("validationTier")
      `;
      
      console.log(`${colors.green}Successfully created 'validationTier' index${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'validationTier' index already exists${colors.reset}`);
    }
    
    // 9. Check and add calendly fields to Booking and SessionType
    console.log(`\n${colors.yellow}Checking Calendly integration fields...${colors.reset}`);
    
    // Booking table
    const hasCalendlyEventId = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'Booking' AND column_name = 'calendlyEventId'
      ) as exists
    `;
    
    if (!hasCalendlyEventId[0].exists) {
      console.log(`Adding Calendly fields to Booking table...`);
      await prisma.$executeRaw`
        ALTER TABLE "Booking" 
        ADD COLUMN "calendlyEventId" TEXT,
        ADD COLUMN "calendlyEventUri" TEXT,
        ADD COLUMN "calendlyInviteeUri" TEXT
      `;
      
      console.log(`${colors.green}Successfully added Calendly fields to Booking table${colors.reset}`);
    } else {
      console.log(`${colors.green}Calendly fields already exist in Booking table${colors.reset}`);
    }
    
    // SessionType table
    const hasCalendlyEventTypeId = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'SessionType' AND column_name = 'calendlyEventTypeId'
      ) as exists
    `;
    
    if (!hasCalendlyEventTypeId[0].exists) {
      console.log(`Adding Calendly fields to SessionType table...`);
      await prisma.$executeRaw`
        ALTER TABLE "SessionType" 
        ADD COLUMN "calendlyEventTypeId" TEXT,
        ADD COLUMN "calendlyEventTypeUri" TEXT
      `;
      
      console.log(`${colors.green}Successfully added Calendly fields to SessionType table${colors.reset}`);
    } else {
      console.log(`${colors.green}Calendly fields already exist in SessionType table${colors.reset}`);
    }
    
    // 10. Check if imageUrl field exists on User (instead of image)
    console.log(`\n${colors.yellow}Checking User.image vs imageUrl field...${colors.reset}`);
    
    const hasImageField = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'image'
      ) as exists
    `;
    
    const hasImageUrlField = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'imageUrl'
      ) as exists
    `;
    
    if (hasImageField[0].exists && !hasImageUrlField[0].exists) {
      console.log(`Renaming User.image column to imageUrl...`);
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        RENAME COLUMN "image" TO "imageUrl"
      `;
      
      console.log(`${colors.green}Successfully renamed 'image' to 'imageUrl'${colors.reset}`);
    } else if (!hasImageField[0].exists && !hasImageUrlField[0].exists) {
      console.log(`Adding 'imageUrl' column to User table...`);
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "imageUrl" TEXT
      `;
      
      console.log(`${colors.green}Successfully added 'imageUrl' column${colors.reset}`);
    } else if (hasImageUrlField[0].exists) {
      console.log(`${colors.green}The 'imageUrl' column already exists${colors.reset}`);
    }
    
    // 11. Add isDemo field to User if it doesn't exist
    console.log(`\n${colors.yellow}Checking 'isDemo' field in User...${colors.reset}`);
    
    const hasIsDemo = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'User' AND column_name = 'isDemo'
      ) as exists
    `;
    
    if (!hasIsDemo[0].exists) {
      console.log(`Adding 'isDemo' column to User table...`);
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT FALSE
      `;
      
      console.log(`${colors.green}Successfully added 'isDemo' column${colors.reset}`);
    } else {
      console.log(`${colors.green}The 'isDemo' column already exists${colors.reset}`);
    }
    
    // 12. Update Liam's profile with required marketplace values
    console.log(`\n${colors.yellow}Updating Liam's profile...${colors.reset}`);
    
    // Find Liam's user
    const liamUser = await prisma.$queryRaw`
      SELECT * FROM "User" 
      WHERE name ILIKE '%Liam%' OR email ILIKE '%liam%'
      LIMIT 1
    `;
    
    if (liamUser.length === 0) {
      console.log(`${colors.red}Could not find Liam's user profile${colors.reset}`);
    } else {
      console.log(`Found Liam's user: ${liamUser[0].id}`);
      
      // Get Liam's builder profile
      const liamProfile = await prisma.$queryRaw`
        SELECT * FROM "BuilderProfile" 
        WHERE "userId" = ${liamUser[0].id}
        LIMIT 1
      `;
      
      if (liamProfile.length === 0) {
        console.log(`${colors.red}Could not find Liam's builder profile${colors.reset}`);
      } else {
        console.log(`Found Liam's builder profile: ${liamProfile[0].id}`);
        
        // These fields should exist now, so we can safely update them
        await prisma.$executeRaw`
          UPDATE "BuilderProfile" 
          SET 
            "searchable" = TRUE,
            "featured" = TRUE,
            "displayName" = 'Liam Jons',
            "tagline" = 'Turning ideas into AI-powered solutions',
            "availability" = 'available',
            "topSkills" = ARRAY['AI Integration', 'Next.js', 'React', 'TypeScript']::TEXT[],
            "expertiseAreas" = '{"AI": ["Large Language Models", "AI Integration", "Prompt Engineering"], "Web": ["Next.js", "React", "TypeScript", "Node.js"], "Architecture": ["System Design", "API Design", "Database Modeling"]}'::JSONB
          WHERE id = ${liamProfile[0].id}
        `;
        
        console.log(`${colors.green}Successfully updated Liam's profile${colors.reset}`);
      }
    }
    
    console.log(`\n${colors.bright}${colors.green}Database migration completed successfully!${colors.reset}`);
    console.log(`All required marketplace fields have been added.\n`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error:${colors.reset}`, error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addMarketplaceFields();