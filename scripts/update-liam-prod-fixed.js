#!/usr/bin/env node

/**
 * Production Database Fix for Liam's Profile (Schema Compatible)
 * 
 * This script is specifically designed to work with the production database schema
 * to ensure Liam's profile is properly configured in the production database.
 * 
 * Usage:
 *   DATABASE_URL=your_production_db_url node scripts/update-liam-prod-fixed.js
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m'
};

// Initialize Prisma client
const prisma = new PrismaClient();

// Create readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt the user for confirmation
 */
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Log a message with color
 */
function logColored(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Profile data for Liam (compatible with production schema)
 * This will be adjusted based on the actual schema
 */
const liamProfileData = {
  // Default profile data - will be filtered based on schema
  displayName: "Liam Jons",
  bio: "Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications that solve real problems. Specialized in productivity strategies and creating value through thoughtful AI integration.",
  headline: "AI Application Builder & Productivity Specialist",
  tagline: "Building AI applications with focus on productivity and business value",
  validationTier: 3,
  searchable: true,
  featured: true,
  rating: 4.9,
  domains: ["AI", "Web Development", "Productivity"],
  badges: ["Verified", "Expert"],
  topSkills: ["AI", "React", "TypeScript", "NextJS", "Node.js"],
  hourlyRate: 150
};

/**
 * Session types for Liam (compatible with production schema)
 */
const liamSessionTypes = [
  {
    title: "AI Strategy Consultation",
    description: "A focused session to strategize your AI implementation and identify the best approaches for your specific needs.",
    durationMinutes: 60,
    price: 150,
    currency: "USD",
    isActive: true,
    color: "#4CAF50"
  },
  {
    title: "Implementation Support",
    description: "Hands-on support for implementing AI solutions, troubleshooting, and optimizing your application.",
    durationMinutes: 90,
    price: 200,
    currency: "USD",
    isActive: true,
    color: "#2196F3"
  }
];

/**
 * Filter object properties based on available columns in schema
 */
async function filterObjectForSchema(obj, tableName) {
  try {
    // Get table schema
    const schema = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
    `;
    
    // Extract column names
    const columnNames = schema.map(col => col.column_name);
    
    // Filter object to only include properties that match column names
    const filteredObj = {};
    Object.keys(obj).forEach(key => {
      // Convert camelCase to snake_case for checking
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      if (columnNames.includes(key) || columnNames.includes(snakeKey)) {
        filteredObj[key] = obj[key];
      }
    });
    
    return filteredObj;
  } catch (error) {
    logColored(`Error filtering object: ${error.message}`, colors.red);
    console.error(error);
    return obj; // Return original object on error
  }
}

/**
 * Check if a column exists in a table
 */
async function columnExists(tableName, columnName) {
  try {
    const result = await prisma.$queryRaw`
      SELECT 1
      FROM information_schema.columns 
      WHERE table_name = ${tableName}
        AND column_name = ${columnName}
    `;
    return result.length > 0;
  } catch (error) {
    logColored(`Error checking column: ${error.message}`, colors.red);
    return false;
  }
}

/**
 * Main function to fix Liam's profile
 */
async function fixLiamProfile() {
  try {
    // Get database URL (sanitized)
    const dbUrl = process.env.DATABASE_URL || 'default connection';
    const sanitizedUrl = dbUrl.replace(/([\w-]*):\/\/([\w-]*):([^@]*)@/, '$1://$2:****@');
    logColored(`Using database: ${sanitizedUrl}`, colors.blue);
    
    // Confirm before proceeding
    const confirmation = await question(`${colors.yellow}This will update Liam's profile in the production database. Continue? (y/n): ${colors.reset}`);
    if (confirmation.toLowerCase() !== 'y') {
      logColored('Operation cancelled.', colors.yellow);
      return;
    }
    
    // Check if the database has the required tables
    logColored('\n=== Verifying Database Schema ===', colors.cyan);
    
    // Check table existence using raw queries
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('User', 'BuilderProfile', 'SessionType')
      ORDER BY table_name;
    `;
    
    const tableNames = tables.map(t => t.table_name);
    
    if (!tableNames.includes('User') || !tableNames.includes('BuilderProfile') || !tableNames.includes('SessionType')) {
      logColored('Required tables are missing from the database schema.', colors.red);
      console.log(`Found tables: ${tableNames.join(', ')}`);
      return;
    }
    
    logColored('All required tables exist.', colors.green);
    
    // Check for Clerk ID column
    const hasClerkId = await columnExists('User', 'clerkId');
    if (!hasClerkId) {
      logColored('WARNING: User table does not have clerkId column. Authentication might not work.', colors.red);
      return;
    }
    
    logColored('\n=== Checking for existing Liam user ===', colors.cyan);
    
    // Look for existing user with Liam in name or email using raw query
    const existingUsers = await prisma.$queryRaw`
      SELECT *
      FROM "User"
      WHERE name ILIKE '%Liam%'
         OR email ILIKE '%liam%'
      LIMIT 1
    `;
    
    let liamUser = existingUsers.length > 0 ? existingUsers[0] : null;
    
    // Prompt for Clerk ID if needed
    let clerkId;
    if (!liamUser || !liamUser.clerkId) {
      clerkId = await question(`${colors.yellow}Enter Liam's Clerk ID (required): ${colors.reset}`);
      if (!clerkId) {
        logColored('Clerk ID is required. Exiting.', colors.red);
        return;
      }
    } else {
      clerkId = liamUser.clerkId;
      logColored(`Found existing Clerk ID: ${clerkId}`, colors.green);
    }
    
    // Get email for user
    let email;
    if (!liamUser || !liamUser.email) {
      email = await question(`${colors.yellow}Enter email for Liam: ${colors.reset}`);
      if (!email) {
        logColored('Email is required. Exiting.', colors.red);
        return;
      }
    } else {
      email = liamUser.email;
      logColored(`Using existing email: ${email}`, colors.green);
    }
    
    // Create or update user
    if (!liamUser) {
      logColored('Creating new user for Liam...', colors.cyan);
      
      // Use raw query for creation to ensure compatibility
      const newUserResult = await prisma.$executeRaw`
        INSERT INTO "User" (id, name, email, "clerkId", roles, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid()::text, 
          'Liam Jons', 
          ${email}, 
          ${clerkId}, 
          ARRAY['CLIENT', 'BUILDER', 'ADMIN']::text[], 
          NOW(), 
          NOW()
        )
        RETURNING id
      `;
      
      // Get the newly created user
      const newUser = await prisma.$queryRaw`
        SELECT * FROM "User" WHERE "clerkId" = ${clerkId}
      `;
      
      if (newUser.length === 0) {
        logColored('Error: Failed to create or retrieve user.', colors.red);
        return;
      }
      
      liamUser = newUser[0];
      logColored(`Created user with ID: ${liamUser.id}`, colors.green);
    } else {
      logColored(`Found existing user for Liam: ${liamUser.id}`, colors.green);
      
      // Update user if needed
      if (!liamUser.clerkId || liamUser.clerkId !== clerkId) {
        await prisma.$executeRaw`
          UPDATE "User"
          SET "clerkId" = ${clerkId},
              roles = ARRAY['CLIENT', 'BUILDER', 'ADMIN']::text[]
          WHERE id = ${liamUser.id}
        `;
        logColored(`Updated Clerk ID for user ${liamUser.id}`, colors.green);
      }
    }
    
    logColored('\n=== Checking for existing builder profile ===', colors.cyan);
    
    // Check for existing builder profile using raw query
    const existingProfiles = await prisma.$queryRaw`
      SELECT *
      FROM "BuilderProfile"
      WHERE "userId" = ${liamUser.id}
      LIMIT 1
    `;
    
    let builderProfile = existingProfiles.length > 0 ? existingProfiles[0] : null;
    
    // Filter profile data based on actual schema
    const filteredProfileData = await filterObjectForSchema(liamProfileData, 'BuilderProfile');
    
    // Create or update builder profile
    if (!builderProfile) {
      logColored('Creating new builder profile for Liam...', colors.cyan);
      
      // Basic required fields for creation
      let createColumns = ['userId', 'validationTier', 'searchable', 'featured', 'createdAt', 'updatedAt'];
      let optionalColumns = ['displayName', 'bio', 'headline', 'tagline', 'domains', 'badges', 'topSkills', 'hourlyRate'];
      
      // Check which optional columns exist
      const columnQueries = await Promise.all(
        optionalColumns.map(col => columnExists('BuilderProfile', col))
      );
      
      // Filter to include only existing columns
      const existingOptionalColumns = optionalColumns.filter((_, index) => columnQueries[index]);
      const allColumns = [...createColumns, ...existingOptionalColumns];
      
      // Create dynamic query for insertion
      const columnsList = allColumns.map(col => `"${col}"`).join(', ');
      const placeholders = allColumns.map((col, i) => `$${i + 1}`).join(', ');
      
      // Prepare values based on existing columns
      const values = [];
      values.push(
        liamUser.id, // userId
        filteredProfileData.validationTier || 3, // validationTier
        true, // searchable
        true, // featured
        new Date(), // createdAt
        new Date() // updatedAt
      );
      
      // Add values for optional columns
      for (const col of existingOptionalColumns) {
        values.push(filteredProfileData[col] !== undefined ? filteredProfileData[col] : null);
      }
      
      // Execute the query
      try {
        const insertQuery = `
          INSERT INTO "BuilderProfile" (${columnsList})
          VALUES (${placeholders})
          RETURNING id
        `;
        
        await prisma.$executeRawUnsafe(insertQuery, ...values);
        
        // Get the created profile
        const newProfile = await prisma.$queryRaw`
          SELECT * FROM "BuilderProfile" WHERE "userId" = ${liamUser.id}
        `;
        
        builderProfile = newProfile[0];
        logColored(`Created builder profile with ID: ${builderProfile.id}`, colors.green);
      } catch (error) {
        logColored(`Error creating builder profile: ${error.message}`, colors.red);
        console.error(error);
        return;
      }
    } else {
      logColored(`Found existing builder profile: ${builderProfile.id}`, colors.green);
      
      // Update searchable flag to ensure visibility
      await prisma.$executeRaw`
        UPDATE "BuilderProfile"
        SET searchable = true
        WHERE id = ${builderProfile.id}
      `;
      
      logColored(`Updated searchable flag to true`, colors.green);
    }
    
    logColored('\n=== Checking for session types ===', colors.cyan);
    
    // Check for existing session types
    const existingSessionTypes = await prisma.$queryRaw`
      SELECT *
      FROM "SessionType"
      WHERE "builderId" = ${builderProfile.id}
    `;
    
    logColored(`Found ${existingSessionTypes.length} existing session types`, colors.green);
    
    // Create session types if none exist
    if (existingSessionTypes.length === 0) {
      logColored('Creating session types...', colors.cyan);
      
      for (const sessionType of liamSessionTypes) {
        await prisma.$executeRaw`
          INSERT INTO "SessionType" (
            id, 
            "builderId", 
            title, 
            description, 
            "durationMinutes", 
            price, 
            currency, 
            "isActive", 
            color, 
            "createdAt", 
            "updatedAt"
          )
          VALUES (
            gen_random_uuid()::text,
            ${builderProfile.id},
            ${sessionType.title},
            ${sessionType.description},
            ${sessionType.durationMinutes},
            ${sessionType.price},
            ${sessionType.currency},
            ${sessionType.isActive},
            ${sessionType.color},
            NOW(),
            NOW()
          )
        `;
      }
      
      logColored(`Created ${liamSessionTypes.length} session types`, colors.green);
    }
    
    logColored('\n=== Verification ===', colors.cyan);
    
    // Verify profile searchable flag
    const verifiedProfile = await prisma.$queryRaw`
      SELECT * FROM "BuilderProfile" WHERE id = ${builderProfile.id}
    `;
    
    if (verifiedProfile.length === 0) {
      logColored('Error: Could not verify profile.', colors.red);
      return;
    }
    
    // Check searchable flag
    if (!verifiedProfile[0].searchable) {
      logColored('WARNING: Builder profile is not searchable!', colors.red);
      
      const fixSearchable = await question(`${colors.yellow}Fix searchable flag? (y/n): ${colors.reset}`);
      if (fixSearchable.toLowerCase() === 'y') {
        await prisma.$executeRaw`
          UPDATE "BuilderProfile"
          SET searchable = true
          WHERE id = ${builderProfile.id}
        `;
        logColored('Searchable flag set to true', colors.green);
      }
    } else {
      logColored('Searchable flag is correctly set to true', colors.green);
    }
    
    // Verify session types
    const verifiedSessionTypes = await prisma.$queryRaw`
      SELECT * FROM "SessionType" WHERE "builderId" = ${builderProfile.id}
    `;
    
    if (verifiedSessionTypes.length === 0) {
      logColored('WARNING: No session types found!', colors.red);
    } else {
      logColored(`Verified ${verifiedSessionTypes.length} session types`, colors.green);
    }
    
    logColored('\n=== Success ===', colors.green);
    logColored('Liam\'s profile has been successfully configured!', colors.green);
    
    // Summary
    console.log('\nProfile Summary:');
    console.log(`- User ID: ${liamUser.id}`);
    console.log(`- Clerk ID: ${liamUser.clerkId}`);
    console.log(`- Builder Profile ID: ${builderProfile.id}`);
    console.log(`- Searchable: ${verifiedProfile[0].searchable}`);
    console.log(`- Featured: ${verifiedProfile[0].featured}`);
    console.log(`- Session Types: ${verifiedSessionTypes.length}`);
    
    logColored('\nNext Steps:', colors.cyan);
    console.log('1. Verify Liam\'s profile appears in marketplace search');
    console.log('2. Test booking flow with the created session types');
    console.log('3. Verify profile editing works correctly in the dashboard');
    
  } catch (error) {
    logColored(`Error: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
fixLiamProfile();