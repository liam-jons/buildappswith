#!/usr/bin/env node

/**
 * Production Database Reset and Sync Script
 * 
 * This script provides a clean slate approach to synchronize your production database
 * with your development schema, then recreates essential user data.
 * 
 * IMPORTANT: This will ERASE ALL DATA in the production database!
 * Only use this when you're starting fresh with no critical data.
 * 
 * Usage:
 *   PRODUCTION_DATABASE_URL=your_production_db_url node scripts/reset-and-sync-production.js
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const readline = require('readline');
const fs = require('fs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

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
 * Run a command and return its output
 */
function runCommand(command, env = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      env: { ...process.env, ...env }
    });
  } catch (error) {
    logColored(`Command failed: ${command}`, colors.red);
    logColored(error.stdout || error.message, colors.red);
    return error.stdout || error.message;
  }
}

/**
 * Profile data for Liam (compatible with production schema)
 */
const liamProfileData = {
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
 * Session types for Liam
 */
const liamSessionTypes = [
  {
    title: "Quick Strategy Session",
    description: "A brief session to quickly address specific questions or challenges.",
    durationMinutes: 30,
    price: 75,
    currency: "USD",
    isActive: true,
    color: "#2196F3"
  },
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
    title: "Business AI Assessment",
    description: "Comprehensive evaluation of your business needs and AI implementation opportunities.",
    durationMinutes: 90,
    price: 250,
    currency: "USD",
    isActive: true,
    color: "#FF9800"
  },
  {
    title: "AI Literacy Workshop",
    description: "Educational session to build AI literacy and understanding for teams and individuals.",
    durationMinutes: 120,
    price: 300,
    currency: "USD",
    isActive: true,
    color: "#9C27B0"
  }
];

/**
 * Main function to reset and sync the production database
 */
async function resetAndSyncProduction() {
  // Check that PRODUCTION_DATABASE_URL is set
  const prodDbUrl = process.env.PRODUCTION_DATABASE_URL;
  if (!prodDbUrl) {
    logColored("Error: PRODUCTION_DATABASE_URL environment variable is not set.", colors.red);
    logColored("Usage: PRODUCTION_DATABASE_URL=your_url node scripts/reset-and-sync-production.js", colors.yellow);
    process.exit(1);
  }

  // Show warnings and get confirmation
  logColored("=== PRODUCTION DATABASE RESET AND SYNC ===", colors.bright + colors.magenta);
  logColored("\nWARNING: This script will:", colors.red);
  logColored("1. ERASE ALL DATA in your production database", colors.red);
  logColored("2. Apply all migrations to match development", colors.red);
  logColored("3. Recreate Liam's user and builder profile", colors.red);
  logColored("4. Set up session types for booking", colors.red);
  
  logColored("\nThis should ONLY be used when:", colors.yellow);
  logColored("- You're setting up a fresh production database", colors.yellow);
  logColored("- You have no real user data yet", colors.yellow);
  logColored("- You need to synchronize development and production schemas", colors.yellow);
  
  // Get confirmation
  const confirmation = await question(`\n${colors.bright}${colors.red}Are you ABSOLUTELY SURE you want to erase all production data? (type 'YES RESET' to confirm): ${colors.reset}`);
  if (confirmation !== 'YES RESET') {
    logColored("Operation cancelled.", colors.yellow);
    rl.close();
    return;
  }

  try {
    // Step 1: Display current database status before reset
    logColored("\n=== Current Database Status ===", colors.cyan);
    logColored("Checking production database before reset...", colors.yellow);
    
    runCommand("npx prisma migrate status", { DATABASE_URL: prodDbUrl });
    
    // Step 2: Reset the production database
    logColored("\n=== Resetting Production Database ===", colors.cyan);
    logColored("This will erase all data and apply migrations...", colors.yellow);
    
    runCommand("npx prisma migrate reset --force", { DATABASE_URL: prodDbUrl });
    logColored("✓ Database has been reset and migrations applied", colors.green);
    
    // Step 3: Generate Prisma client with new schema
    logColored("\n=== Regenerating Prisma Client ===", colors.cyan);
    runCommand("npx prisma generate");
    logColored("✓ Prisma client regenerated", colors.green);
    
    // Step 4: Verify migrations are in sync
    logColored("\n=== Verifying Migration Status ===", colors.cyan);
    runCommand("npx prisma migrate status", { DATABASE_URL: prodDbUrl });
    
    // Step 5: Create Liam's user and profile
    logColored("\n=== Creating Liam's User and Profile ===", colors.cyan);
    
    // Gather required information
    const clerkId = await question(`${colors.yellow}Enter Liam's Clerk ID: ${colors.reset}`);
    if (!clerkId) {
      logColored("Clerk ID is required. Exiting.", colors.red);
      rl.close();
      return;
    }
    
    const email = await question(`${colors.yellow}Enter Liam's email: ${colors.reset}`);
    if (!email) {
      logColored("Email is required. Exiting.", colors.red);
      rl.close();
      return;
    }
    
    // Initialize Prisma client
    const prisma = new PrismaClient();
    
    try {
      // Create user
      logColored("Creating user record...", colors.yellow);
      const user = await prisma.user.create({
        data: {
          name: "Liam Jons",
          email: email,
          clerkId: clerkId,
          role: "ADMIN", // Single role field as per production schema
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      logColored(`✓ User created with ID: ${user.id}`, colors.green);
      
      // Create builder profile
      logColored("Creating builder profile...", colors.yellow);
      const profile = await prisma.builderProfile.create({
        data: {
          userId: user.id,
          ...liamProfileData,
          socialLinks: {
            website: "https://buildappswith.ai",
            linkedin: "https://linkedin.com/in/liamjones",
            github: "https://github.com/buildappswith",
            twitter: "https://twitter.com/buildappswith"
          },
          expertiseAreas: {
            aiImplementation: 5,
            webDevelopment: 5,
            productivity: 5,
            userExperience: 4,
            productStrategy: 4
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      logColored(`✓ Builder profile created with ID: ${profile.id}`, colors.green);
      
      // Create session types
      logColored("Creating session types...", colors.yellow);
      for (const sessionType of liamSessionTypes) {
        await prisma.sessionType.create({
          data: {
            builderId: profile.id,
            ...sessionType,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
      logColored(`✓ ${liamSessionTypes.length} session types created`, colors.green);
      
      // Verify data was created
      const verificationProfile = await prisma.builderProfile.findUnique({
        where: { id: profile.id },
        include: {
          user: true,
          sessionTypes: true
        }
      });
      
      logColored("\n=== Verification Results ===", colors.cyan);
      logColored(`User Record: ${verificationProfile.user ? '✓' : '✗'}`, verificationProfile.user ? colors.green : colors.red);
      logColored(`Builder Profile: ${verificationProfile ? '✓' : '✗'}`, verificationProfile ? colors.green : colors.red);
      logColored(`Session Types: ${verificationProfile.sessionTypes.length} found`, colors.green);
      logColored(`Searchable: ${verificationProfile.searchable ? '✓' : '✗'}`, verificationProfile.searchable ? colors.green : colors.red);
      
    } finally {
      await prisma.$disconnect();
    }
    
    // Step 6: Success message and next steps
    logColored("\n=== Success! ===", colors.green);
    logColored("Your production database has been reset, synchronized with development schema, and set up with fresh data.", colors.green);
    
    logColored("\nNext Steps:", colors.cyan);
    logColored("1. Verify Liam's profile appears in marketplace search", colors.reset);
    logColored("2. Test booking flow with the created session types", colors.reset);
    logColored("3. Verify profile editing works correctly in the dashboard", colors.reset);
    
  } catch (error) {
    logColored(`\nError: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run the main function
resetAndSyncProduction();