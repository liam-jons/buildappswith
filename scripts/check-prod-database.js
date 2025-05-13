#!/usr/bin/env node

/**
 * Production Database Verification Script
 * 
 * This script performs comprehensive checks on the production database
 * to ensure builder profiles are properly configured and visible in the marketplace.
 * 
 * Usage:
 *   node scripts/check-prod-database.js
 * 
 * To use with production database:
 *   DATABASE_URL=your_production_db_url node scripts/check-prod-database.js
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Initialize Prisma client
const prisma = new PrismaClient();

// Track issues
const issues = [];
const warnings = [];

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
 * Add an issue to the issues list
 */
function addIssue(message, severity = 'high') {
  issues.push({ message, severity });
}

/**
 * Add a warning to the warnings list
 */
function addWarning(message) {
  warnings.push({ message });
}

/**
 * Check if the database has users with clerkId
 */
async function checkClerkUsers() {
  logColored('\n=== Checking Clerk User Integration ===', colors.cyan);
  
  try {
    const users = await prisma.user.findMany({
      where: {
        clerkId: {
          not: null
        }
      }
    });
    
    logColored(`Found ${users.length} users with Clerk IDs`, colors.green);
    
    if (users.length === 0) {
      addIssue('No users with Clerk IDs found. Authentication integration may be broken.');
    }
    
    const liamUsers = users.filter(u => 
      (u.name && u.name.toLowerCase().includes('liam')) || 
      (u.email && u.email.toLowerCase().includes('liam'))
    );
    
    if (liamUsers.length > 0) {
      logColored('Found Liam user(s):', colors.green);
      liamUsers.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    Name: ${user.name || 'Not set'}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Clerk ID: ${user.clerkId}`);
        console.log(`    Created: ${user.createdAt}`);
      });
    } else {
      addIssue('No users for Liam found. Need to create or fix Liam user record.');
    }
    
    return { users, liamUsers };
  } catch (error) {
    logColored(`Error checking Clerk users: ${error.message}`, colors.red);
    addIssue(`Database error when checking users: ${error.message}`);
    return { users: [], liamUsers: [] };
  }
}

/**
 * Check builder profiles
 */
async function checkBuilderProfiles(users) {
  logColored('\n=== Checking Builder Profiles ===', colors.cyan);
  
  try {
    const profiles = await prisma.builderProfile.findMany({
      include: {
        user: true,
        sessionTypes: true
      }
    });
    
    logColored(`Found ${profiles.length} builder profiles`, colors.green);
    
    if (profiles.length === 0) {
      addIssue('No builder profiles found in the database.');
      return { profiles: [], liamProfiles: [] };
    }
    
    // Check searchable flag
    const searchableProfiles = profiles.filter(p => p.searchable);
    logColored(`Found ${searchableProfiles.length} searchable builder profiles`, colors.green);
    
    if (searchableProfiles.length === 0) {
      addIssue('No searchable builder profiles found. Profiles will not appear in marketplace.');
    }
    
    // Check session types
    const profilesWithSessionTypes = profiles.filter(p => p.sessionTypes.length > 0);
    logColored(`Found ${profilesWithSessionTypes.length} profiles with session types`, colors.green);
    
    if (profilesWithSessionTypes.length < profiles.length) {
      addWarning(`${profiles.length - profilesWithSessionTypes.length} profiles are missing session types.`);
    }
    
    // Check for orphaned profiles (no user)
    const orphanedProfiles = profiles.filter(p => !p.user);
    if (orphanedProfiles.length > 0) {
      addIssue(`Found ${orphanedProfiles.length} orphaned profiles (no associated user).`);
    }
    
    // Find Liam's profiles
    const liamProfiles = profiles.filter(p => 
      (p.user && p.user.name && p.user.name.toLowerCase().includes('liam')) ||
      (p.displayName && p.displayName.toLowerCase().includes('liam'))
    );
    
    if (liamProfiles.length > 0) {
      logColored('Found Liam builder profile(s):', colors.green);
      liamProfiles.forEach(profile => {
        console.log(`  - ID: ${profile.id}`);
        console.log(`    User ID: ${profile.userId}`);
        console.log(`    Display Name: ${profile.displayName || 'Not set'}`);
        console.log(`    Searchable: ${profile.searchable}`);
        console.log(`    Featured: ${profile.featured}`);
        console.log(`    Session Types: ${profile.sessionTypes.length}`);
        console.log(`    Clerk User ID: ${profile.user?.clerkId || 'Not set'}`);
      });
    } else {
      addIssue('No builder profiles for Liam found. Need to create or fix Liam profile.');
    }
    
    // Users with BUILDER role but no builder profile
    const builderUsers = users.filter(u => u.roles && u.roles.includes('BUILDER'));
    const usersWithoutProfiles = builderUsers.filter(u => 
      !profiles.some(p => p.userId === u.id)
    );
    
    if (usersWithoutProfiles.length > 0) {
      addWarning(`Found ${usersWithoutProfiles.length} users with BUILDER role but no builder profile.`);
    }
    
    return { profiles, liamProfiles };
  } catch (error) {
    logColored(`Error checking builder profiles: ${error.message}`, colors.red);
    addIssue(`Database error when checking profiles: ${error.message}`);
    return { profiles: [], liamProfiles: [] };
  }
}

/**
 * Check session types
 */
async function checkSessionTypes(liamProfiles) {
  logColored('\n=== Checking Session Types ===', colors.cyan);
  
  try {
    const allSessionTypes = await prisma.sessionType.findMany();
    logColored(`Found ${allSessionTypes.length} total session types`, colors.green);
    
    if (liamProfiles.length > 0) {
      for (const profile of liamProfiles) {
        const sessionTypes = await prisma.sessionType.findMany({
          where: {
            builderId: profile.id
          }
        });
        
        logColored(`Found ${sessionTypes.length} session types for Liam's profile ${profile.id}`, colors.green);
        
        if (sessionTypes.length === 0) {
          addWarning(`Liam's profile ${profile.id} has no session types. Booking will not work.`);
        } else {
          sessionTypes.forEach(session => {
            console.log(`  - ID: ${session.id}`);
            console.log(`    Title: ${session.title}`);
            console.log(`    Duration: ${session.durationMinutes} minutes`);
            console.log(`    Price: ${session.price} ${session.currency}`);
            console.log(`    Active: ${session.isActive}`);
            console.log(`    Calendly Event Type ID: ${session.calendlyEventTypeId || 'Not set'}`);
          });
        }
      }
    }
  } catch (error) {
    logColored(`Error checking session types: ${error.message}`, colors.red);
    addIssue(`Database error when checking session types: ${error.message}`);
  }
}

/**
 * Suggest fixes based on the issues found
 */
function suggestFixes(usersResult, profilesResult) {
  logColored('\n=== Recommended Fixes ===', colors.cyan);
  
  const { users, liamUsers } = usersResult;
  const { profiles, liamProfiles } = profilesResult;
  
  // Case 1: No Liam user exists
  if (liamUsers.length === 0) {
    logColored('1. Create Liam user record with Clerk ID:', colors.yellow);
    console.log(`
    // Create a user record for Liam
    await prisma.user.create({
      data: {
        name: "Liam Jons",
        email: "liam@example.com", // Replace with actual email
        clerkId: "YOUR_CLERK_ID", // Replace with actual Clerk ID
        roles: ["CLIENT", "BUILDER", "ADMIN"],
        // Add other required fields
      }
    });
    `);
  }
  
  // Case 2: Liam user exists but no builder profile
  if (liamUsers.length > 0 && liamProfiles.length === 0) {
    logColored('2. Create builder profile for Liam:', colors.yellow);
    console.log(`
    // Create a builder profile for Liam
    await prisma.builderProfile.create({
      data: {
        userId: "${liamUsers[0].id}", // User ID from the database
        displayName: "Liam Jons",
        bio: "Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications.",
        headline: "AI Application Builder & ADHD Productivity Specialist",
        validationTier: 3,
        searchable: true,
        featured: true,
        availability: "available",
        adhd_focus: true,
        // Add other required fields
      }
    });
    `);
  }
  
  // Case 3: Liam profile exists but not searchable
  if (liamProfiles.length > 0 && !liamProfiles.some(p => p.searchable)) {
    logColored('3. Make Liam profile searchable:', colors.yellow);
    console.log(`
    // Update searchable flag for Liam's profile
    await prisma.builderProfile.update({
      where: { id: "${liamProfiles[0].id}" },
      data: { searchable: true }
    });
    `);
  }
  
  // Case 4: Liam profile exists but no session types
  if (liamProfiles.length > 0 && liamProfiles.some(p => p.sessionTypes.length === 0)) {
    const profileWithoutSessions = liamProfiles.find(p => p.sessionTypes.length === 0);
    if (profileWithoutSessions) {
      logColored('4. Add session types for Liam:', colors.yellow);
      console.log(`
    // Create session types for Liam
    await prisma.sessionType.create({
      data: {
        builderId: "${profileWithoutSessions.id}",
        title: "AI Strategy Consultation",
        description: "A focused session to strategize your AI implementation.",
        durationMinutes: 60,
        price: 150,
        currency: "USD",
        isActive: true,
        color: "#4CAF50"
      }
    });
      `);
    }
  }
  
  // General fix script
  logColored('\n5. Complete fix script for Liam:', colors.magenta);
  console.log(`
  // Production database fix script for Liam's profile
  async function fixLiamProfile() {
    // 1. Find or create Liam user
    let liamUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: "Liam", mode: "insensitive" } },
          { email: { contains: "liam", mode: "insensitive" } }
        ]
      }
    });
    
    if (!liamUser) {
      console.log("Creating Liam user...");
      liamUser = await prisma.user.create({
        data: {
          name: "Liam Jons",
          email: "liam@example.com", // Replace with actual email
          clerkId: "YOUR_CLERK_ID", // Replace with actual Clerk ID
          roles: ["CLIENT", "BUILDER", "ADMIN"],
          emailVerified: new Date(),
          imageUrl: "/images/builders-test/builder.png"
        }
      });
    } else {
      console.log("Found Liam user:", liamUser.id);
    }
    
    // 2. Find or create Liam's builder profile
    let liamProfile = await prisma.builderProfile.findFirst({
      where: {
        userId: liamUser.id
      },
      include: {
        sessionTypes: true
      }
    });
    
    if (!liamProfile) {
      console.log("Creating Liam builder profile...");
      liamProfile = await prisma.builderProfile.create({
        data: {
          userId: liamUser.id,
          displayName: "Liam Jons",
          bio: "Founder of BuildAppsWith, helping individuals and businesses leverage AI to build applications that solve real problems. Specialized in ADHD productivity strategies and creating value through thoughtful AI integration.",
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
          topSkills: ["AI", "React", "TypeScript"],
          hourlyRate: 150
        }
      });
    } else {
      console.log("Found Liam builder profile:", liamProfile.id);
      
      // Update profile to ensure searchable is true
      if (!liamProfile.searchable) {
        console.log("Updating searchable flag to true...");
        await prisma.builderProfile.update({
          where: { id: liamProfile.id },
          data: { searchable: true }
        });
      }
    }
    
    // 3. Add session types if needed
    if (liamProfile.sessionTypes.length === 0) {
      console.log("Adding session types...");
      await prisma.sessionType.createMany({
        data: [
          {
            builderId: liamProfile.id,
            title: "AI Strategy Consultation",
            description: "A focused session to strategize your AI implementation.",
            durationMinutes: 60,
            price: 150,
            currency: "USD",
            isActive: true,
            color: "#4CAF50"
          },
          {
            builderId: liamProfile.id,
            title: "Implementation Support",
            description: "Hands-on support for implementing AI solutions.",
            durationMinutes: 90,
            price: 200,
            currency: "USD",
            isActive: true,
            color: "#2196F3"
          }
        ]
      });
    }
    
    console.log("Fix completed successfully!");
  }
  
  // Run the fix function
  fixLiamProfile()
    .catch(e => console.error("Error:", e))
    .finally(() => prisma.$disconnect());
  `);
}

/**
 * Generate instructions for next steps
 */
function generateNextSteps() {
  logColored('\n=== Next Steps ===', colors.cyan);
  console.log(`
1. Run this script against your production database:
   DATABASE_URL=your_production_db_url node scripts/check-prod-database.js

2. Based on the results, use one of the suggested fix scripts

3. After applying fixes, verify that:
   - Liam's profile appears in marketplace searches
   - Session types are available for booking
   - Profile editing works correctly

4. To manually update profiles for testing:
   - Use the update-liam-profile.js script against production
   - Ensure clerkId mapping is correct for authentication
   - Verify searchable flag is set to true
  `);
}

/**
 * Main function
 */
async function main() {
  logColored('=== Production Database Verification Script ===', colors.bright + colors.cyan);
  logColored('This script checks for issues with builder profiles in the production database.\n', colors.bright);
  
  try {
    // Check database connection
    await prisma.$connect();
    logColored('Database connection successful!', colors.green);
    
    // Get database URL (sanitized)
    const dbUrl = process.env.DATABASE_URL || 'default connection';
    const sanitizedUrl = dbUrl.replace(/([\w-]*):\/\/([\w-]*):([^@]*)@/, '$1://$2:****@');
    logColored(`Using database: ${sanitizedUrl}`, colors.blue);
    
    // Check users
    const usersResult = await checkClerkUsers();
    
    // Check builder profiles
    const profilesResult = await checkBuilderProfiles(usersResult.users);
    
    // Check session types
    await checkSessionTypes(profilesResult.liamProfiles);
    
    // Display summary of issues
    logColored('\n=== Issues Summary ===', colors.cyan);
    if (issues.length === 0) {
      logColored('No critical issues found!', colors.green);
    } else {
      logColored(`Found ${issues.length} issues:`, colors.red);
      issues.forEach((issue, i) => {
        logColored(`${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`, 
          issue.severity === 'high' ? colors.red : colors.yellow);
      });
    }
    
    // Display warnings
    if (warnings.length > 0) {
      logColored(`\nWarnings:`, colors.yellow);
      warnings.forEach((warning, i) => {
        logColored(`${i + 1}. ${warning.message}`, colors.yellow);
      });
    }
    
    // Suggest fixes
    suggestFixes(usersResult, profilesResult);
    
    // Generate next steps
    generateNextSteps();
    
  } catch (error) {
    logColored(`Script error: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the script
main();