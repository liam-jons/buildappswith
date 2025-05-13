#!/usr/bin/env node

/**
 * Create Liam's User and Profile
 * 
 * This script creates a fresh user record, builder profile, and session types
 * for Liam in the production database.
 * 
 * Usage:
 *   DATABASE_URL=your_production_db_url node scripts/create-liam-user.js
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
 * Profile data for Liam
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
 * Main function to create user and profile
 */
async function createLiamUser() {
  try {
    logColored("=== Creating Liam's User and Profile ===", colors.cyan);
    
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      logColored("Error: DATABASE_URL environment variable is not set.", colors.red);
      logColored("Usage: DATABASE_URL=your_url node scripts/create-liam-user.js", colors.yellow);
      process.exit(1);
    }
    
    // Get Clerk ID and email
    const clerkId = await question(`${colors.yellow}Enter Liam's Clerk ID: ${colors.reset}`);
    if (!clerkId) {
      logColored("Clerk ID is required. Exiting.", colors.red);
      return;
    }
    
    const email = await question(`${colors.yellow}Enter Liam's email: ${colors.reset}`);
    if (!email) {
      logColored("Email is required. Exiting.", colors.red);
      return;
    }
    
    // Check if user already exists
    const prisma = new PrismaClient();
    
    try {
      logColored("Checking for existing user...", colors.blue);
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkId },
            { email }
          ]
        }
      });
      
      let userId;
      
      if (existingUser) {
        logColored(`Found existing user: ${existingUser.id}`, colors.green);
        userId = existingUser.id;
        
        // Update user if needed
        await prisma.user.update({
          where: { id: userId },
          data: {
            name: "Liam Jons",
            clerkId,
            roles: ["CLIENT", "BUILDER", "ADMIN"],
            verified: true
          }
        });
        logColored("✓ User updated", colors.green);
      } else {
        // Create user
        logColored("Creating new user record...", colors.yellow);
        const newUser = await prisma.user.create({
          data: {
            name: "Liam Jons",
            email,
            clerkId,
            roles: ["CLIENT", "BUILDER", "ADMIN"],
            verified: true
          }
        });
        userId = newUser.id;
        logColored(`✓ User created with ID: ${userId}`, colors.green);
      }
      
      // Check for existing builder profile
      logColored("Checking for existing builder profile...", colors.blue);
      const existingProfile = await prisma.builderProfile.findFirst({
        where: { userId }
      });
      
      let profileId;
      
      if (existingProfile) {
        logColored(`Found existing profile: ${existingProfile.id}`, colors.green);
        profileId = existingProfile.id;
        
        // Update profile
        await prisma.builderProfile.update({
          where: { id: profileId },
          data: {
            ...liamProfileData,
            searchable: true,
            featured: true,
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
            }
          }
        });
        logColored("✓ Builder profile updated", colors.green);
      } else {
        // Create builder profile
        logColored("Creating builder profile...", colors.yellow);
        const newProfile = await prisma.builderProfile.create({
          data: {
            userId,
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
            }
          }
        });
        profileId = newProfile.id;
        logColored(`✓ Builder profile created with ID: ${profileId}`, colors.green);
      }
      
      // Check for existing session types
      logColored("Checking existing session types...", colors.blue);
      const existingSessionTypes = await prisma.sessionType.findMany({
        where: { builderId: profileId }
      });
      
      if (existingSessionTypes.length > 0) {
        logColored(`Found ${existingSessionTypes.length} existing session types`, colors.green);
        
        // Ask if session types should be recreated
        const recreate = await question(`${colors.yellow}Recreate session types? (y/n): ${colors.reset}`);
        
        if (recreate.toLowerCase() === 'y') {
          // Delete existing session types
          await prisma.sessionType.deleteMany({
            where: { builderId: profileId }
          });
          
          // Create new session types
          for (const sessionType of liamSessionTypes) {
            await prisma.sessionType.create({
              data: {
                builderId: profileId,
                ...sessionType
              }
            });
          }
          logColored(`✓ ${liamSessionTypes.length} session types recreated`, colors.green);
        }
      } else {
        // Create session types
        logColored("Creating session types...", colors.yellow);
        for (const sessionType of liamSessionTypes) {
          await prisma.sessionType.create({
            data: {
              builderId: profileId,
              ...sessionType
            }
          });
        }
        logColored(`✓ ${liamSessionTypes.length} session types created`, colors.green);
      }
      
      // Final verification
      const profile = await prisma.builderProfile.findUnique({
        where: { id: profileId },
        include: {
          user: true,
          sessionTypes: true
        }
      });
      
      logColored("\n=== Verification Results ===", colors.cyan);
      logColored(`User Record: ${profile.user ? '✓' : '✗'}`, profile.user ? colors.green : colors.red);
      logColored(`Builder Profile: ${profile ? '✓' : '✗'}`, profile ? colors.green : colors.red);
      logColored(`Session Types: ${profile.sessionTypes.length} found`, colors.green);
      logColored(`Searchable: ${profile.searchable ? '✓' : '✗'}`, profile.searchable ? colors.green : colors.red);
      logColored(`Featured: ${profile.featured ? '✓' : '✗'}`, profile.featured ? colors.green : colors.red);
      
      logColored("\n=== Success! ===", colors.green);
      logColored("Your profile is now set up in the production database.", colors.green);
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    logColored(`Error: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run main function
createLiamUser();