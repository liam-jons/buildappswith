#!/usr/bin/env node

/**
 * Production Database Fix for Liam's Profile
 * 
 * This script specifically ensures Liam's profile is properly configured
 * in the production database for marketplace visibility and booking.
 * 
 * Usage:
 *   node scripts/update-liam-prod.js
 * 
 * For production:
 *   DATABASE_URL=your_production_db_url node scripts/update-liam-prod.js
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
 * Profile data for Liam
 */
const liamProfileData = {
  // Basic profile data
  displayName: "Liam Jons",
  bio: "Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications that solve real problems. Specialized in ADHD productivity strategies and creating value through thoughtful AI integration. With over 10 years of experience in software development and AI, I focus on practical implementations that deliver tangible results.",
  headline: "AI Application Builder & ADHD Productivity Specialist",
  tagline: "Building AI applications with focus on ADHD productivity and business value",
  validationTier: 3,
  searchable: true,
  featured: true,
  availability: "available",
  adhd_focus: true,
  completedProjects: 87,
  responseRate: 98,
  rating: 4.9,
  domains: ["AI", "Web Development", "Productivity"],
  badges: ["Verified", "Expert"],
  topSkills: ["AI", "React", "TypeScript", "NextJS", "Node.js"],
  hourlyRate: 150,
  
  // Social links
  socialLinks: {
    website: "https://buildappswith.ai",
    linkedin: "https://linkedin.com/in/liamjones",
    github: "https://github.com/buildappswith",
    twitter: "https://twitter.com/buildappswith"
  },
  
  // Example expertise areas
  expertiseAreas: {
    aiImplementation: 5,
    uiDesign: 4,
    productStrategy: 4,
    webDevelopment: 5,
    adhd: 5
  }
};

/**
 * Session types for Liam
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
  },
  {
    title: "ADHD Productivity Session",
    description: "Specialized guidance on designing systems and workflows for ADHD-friendly productivity.",
    durationMinutes: 60,
    price: 150,
    currency: "USD",
    isActive: true,
    color: "#9C27B0"
  }
];

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
    const confirmation = await question(`${colors.yellow}This will update Liam's profile in the database. Continue? (y/n): ${colors.reset}`);
    if (confirmation.toLowerCase() !== 'y') {
      logColored('Operation cancelled.', colors.yellow);
      return;
    }
    
    logColored('\n=== Checking for existing Liam user ===', colors.cyan);
    
    // Look for existing user with Liam in name or email
    let liamUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Liam', mode: 'insensitive' } },
          { email: { contains: 'liam', mode: 'insensitive' } }
        ]
      }
    });
    
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
      
      liamUser = await prisma.user.create({
        data: {
          name: "Liam Jons",
          email: email,
          clerkId: clerkId,
          roles: ["CLIENT", "BUILDER", "ADMIN"],
          emailVerified: new Date(),
          imageUrl: "/images/builders-test/builder.png"
        }
      });
      
      logColored(`Created user with ID: ${liamUser.id}`, colors.green);
    } else {
      logColored(`Found existing user for Liam: ${liamUser.id}`, colors.green);
      
      // Update user if needed
      if (!liamUser.clerkId || liamUser.clerkId !== clerkId) {
        await prisma.user.update({
          where: { id: liamUser.id },
          data: { 
            clerkId: clerkId,
            roles: ["CLIENT", "BUILDER", "ADMIN"]
          }
        });
        logColored(`Updated Clerk ID for user ${liamUser.id}`, colors.green);
      }
    }
    
    logColored('\n=== Checking for existing builder profile ===', colors.cyan);
    
    // Check for existing builder profile
    let builderProfile = await prisma.builderProfile.findFirst({
      where: { 
        userId: liamUser.id 
      },
      include: {
        sessionTypes: true
      }
    });
    
    // Create or update builder profile
    if (!builderProfile) {
      logColored('Creating new builder profile for Liam...', colors.cyan);
      
      builderProfile = await prisma.builderProfile.create({
        data: {
          userId: liamUser.id,
          ...liamProfileData
        }
      });
      
      logColored(`Created builder profile with ID: ${builderProfile.id}`, colors.green);
    } else {
      logColored(`Found existing builder profile: ${builderProfile.id}`, colors.green);
      
      // Update profile to ensure all fields are set correctly
      await prisma.builderProfile.update({
        where: { id: builderProfile.id },
        data: liamProfileData
      });
      
      logColored(`Updated builder profile ${builderProfile.id}`, colors.green);
    }
    
    logColored('\n=== Checking session types ===', colors.cyan);
    
    // Get existing session types or create new ones
    const existingSessionTypes = builderProfile.sessionTypes || [];
    logColored(`Found ${existingSessionTypes.length} existing session types`, colors.green);
    
    if (existingSessionTypes.length === 0) {
      logColored('Creating session types...', colors.cyan);
      
      for (const sessionType of liamSessionTypes) {
        await prisma.sessionType.create({
          data: {
            builderId: builderProfile.id,
            ...sessionType
          }
        });
      }
      
      logColored(`Created ${liamSessionTypes.length} session types`, colors.green);
    } else {
      // Update session types if needed
      logColored('Updating existing session types...', colors.cyan);
      
      for (let i = 0; i < existingSessionTypes.length && i < liamSessionTypes.length; i++) {
        await prisma.sessionType.update({
          where: { id: existingSessionTypes[i].id },
          data: liamSessionTypes[i]
        });
      }
      
      // Create any additional session types
      if (existingSessionTypes.length < liamSessionTypes.length) {
        for (let i = existingSessionTypes.length; i < liamSessionTypes.length; i++) {
          await prisma.sessionType.create({
            data: {
              builderId: builderProfile.id,
              ...liamSessionTypes[i]
            }
          });
        }
      }
      
      logColored(`Updated session types`, colors.green);
    }
    
    logColored('\n=== Verification ===', colors.cyan);
    
    // Verify profile
    const verifiedProfile = await prisma.builderProfile.findUnique({
      where: { id: builderProfile.id },
      include: {
        user: true,
        sessionTypes: true
      }
    });
    
    // Check searchable flag
    if (!verifiedProfile.searchable) {
      logColored('WARNING: Builder profile is not searchable!', colors.red);
      
      const fixSearchable = await question(`${colors.yellow}Fix searchable flag? (y/n): ${colors.reset}`);
      if (fixSearchable.toLowerCase() === 'y') {
        await prisma.builderProfile.update({
          where: { id: builderProfile.id },
          data: { searchable: true }
        });
        logColored('Searchable flag set to true', colors.green);
      }
    } else {
      logColored('Searchable flag is correctly set to true', colors.green);
    }
    
    // Check session types
    if (verifiedProfile.sessionTypes.length === 0) {
      logColored('WARNING: No session types found!', colors.red);
    } else {
      logColored(`Verified ${verifiedProfile.sessionTypes.length} session types`, colors.green);
    }
    
    logColored('\n=== Success ===', colors.green);
    logColored('Liam\'s profile has been successfully configured!', colors.green);
    
    // Summary
    console.log('\nProfile Summary:');
    console.log(`- User ID: ${liamUser.id}`);
    console.log(`- Clerk ID: ${liamUser.clerkId}`);
    console.log(`- Builder Profile ID: ${builderProfile.id}`);
    console.log(`- Searchable: ${verifiedProfile.searchable}`);
    console.log(`- Featured: ${verifiedProfile.featured}`);
    console.log(`- Session Types: ${verifiedProfile.sessionTypes.length}`);
    
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