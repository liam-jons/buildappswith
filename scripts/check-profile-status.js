#!/usr/bin/env node

/**
 * Check Profile Status Script
 * 
 * A script to check the state of profiles in both databases
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

// Database connection strings
const DEV_DB_URL = 'postgresql://Buildappswith-dev_owner:npg_54LGbgNJuIUj@ep-shiny-star-abb3se6s-pooler.eu-west-2.aws.neon.tech/Buildappswith-dev?sslmode=require';
const PROD_DB_URL = 'postgresql://Buildappswith-prod_owner:npg_gx5DNL4uHChw@ep-purple-paper-ab51kphc-pooler.eu-west-2.aws.neon.tech/Buildappswith-prod?sslmode=require';

console.log(`${colors.bright}${colors.cyan}=== Profile Status Check Tool ===${colors.reset}\n`);

async function checkProfiles() {
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
    // Check dev profiles
    console.log(`${colors.yellow}Checking development profiles:${colors.reset}`);
    
    try {
      // Using raw query to avoid schema issues
      const devUsers = await devPrisma.$queryRaw`SELECT COUNT(*) FROM "User"`;
      console.log(`${colors.cyan}Users in dev: ${devUsers[0].count}${colors.reset}`);
      
      const devBuilders = await devPrisma.$queryRaw`SELECT COUNT(*) FROM "BuilderProfile"`;
      console.log(`${colors.cyan}Builder profiles in dev: ${devBuilders[0].count}${colors.reset}`);
      
      // Look for Liam in dev
      const liamInDev = await devPrisma.$queryRaw`
        SELECT u.name, u.email, u.verified, bp.id, bp."featuredBuilder", bp."availableForHire" 
        FROM "User" u 
        JOIN "BuilderProfile" bp ON u.id = bp."userId"
        WHERE u.name ILIKE '%Liam%'
      `;
      
      if (liamInDev.length > 0) {
        console.log(`${colors.green}Found Liam in dev:${colors.reset}`);
        console.log(`  Name: ${liamInDev[0].name}`);
        console.log(`  Email: ${liamInDev[0].email}`);
        console.log(`  Featured: ${liamInDev[0].featuredBuilder}`);
        console.log(`  BuilderProfile ID: ${liamInDev[0].id}`);
      } else {
        console.log(`${colors.red}Liam not found in dev database${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking dev profiles:${colors.reset}`, error);
    }
    
    console.log("");
    
    // Check prod profiles
    console.log(`${colors.yellow}Checking production profiles:${colors.reset}`);
    
    try {
      // Using raw query to avoid schema issues
      const prodUsers = await prodPrisma.$queryRaw`SELECT COUNT(*) FROM "User"`;
      console.log(`${colors.cyan}Users in prod: ${prodUsers[0].count}${colors.reset}`);
      
      const prodBuilders = await prodPrisma.$queryRaw`SELECT COUNT(*) FROM "BuilderProfile"`;
      console.log(`${colors.cyan}Builder profiles in prod: ${prodBuilders[0].count}${colors.reset}`);
      
      // Look for Liam in prod
      const liamInProd = await prodPrisma.$queryRaw`
        SELECT u.name, u.email, u.verified, u."clerkId", bp.id, bp."featuredBuilder", bp."availableForHire" 
        FROM "User" u 
        JOIN "BuilderProfile" bp ON u.id = bp."userId"
        WHERE u.name ILIKE '%Liam%'
      `;
      
      if (liamInProd.length > 0) {
        console.log(`${colors.green}Found Liam in prod:${colors.reset}`);
        console.log(`  Name: ${liamInProd[0].name}`);
        console.log(`  Email: ${liamInProd[0].email}`);
        console.log(`  ClerkID: ${liamInProd[0].clerkId}`);
        console.log(`  Featured: ${liamInProd[0].featuredBuilder}`);
        console.log(`  BuilderProfile ID: ${liamInProd[0].id}`);
      } else {
        console.log(`${colors.red}Liam not found in prod database${colors.reset}`);
      }
      
      // Check Clerk ID connections
      console.log(`\n${colors.yellow}Checking Clerk ID connections:${colors.reset}`);
      
      const usersWithClerkId = await prodPrisma.$queryRaw`
        SELECT name, email, "clerkId" FROM "User"
        WHERE "clerkId" IS NOT NULL
      `;
      
      if (usersWithClerkId.length > 0) {
        console.log(`${colors.green}Users with Clerk IDs in prod:${colors.reset}`);
        for (const user of usersWithClerkId) {
          console.log(`  ${user.name} (${user.email}): ${user.clerkId}`);
        }
      } else {
        console.log(`${colors.red}No users with Clerk IDs found in prod database${colors.reset}`);
      }
      
      // This should show us if any builders are marked as searchable
      console.log(`\n${colors.yellow}Checking searchable builders:${colors.reset}`);
      
      try {
        const searchableBuilders = await prodPrisma.$queryRaw`
          SELECT u.name, u.email, bp."featuredBuilder", bp."availableForHire"
          FROM "User" u 
          JOIN "BuilderProfile" bp ON u.id = bp."userId"
          WHERE bp."featuredBuilder" = true OR bp."availableForHire" = true
        `;
        
        if (searchableBuilders.length > 0) {
          console.log(`${colors.green}Found ${searchableBuilders.length} searchable builders:${colors.reset}`);
          for (const builder of searchableBuilders) {
            console.log(`  ${builder.name} (${builder.email}): Featured=${builder.featuredBuilder}, Available=${builder.availableForHire}`);
          }
        } else {
          console.log(`${colors.red}No searchable builders found in prod database${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}Error checking searchable builders:${colors.reset}`, error);
      }
      
    } catch (error) {
      console.error(`${colors.red}Error checking prod profiles:${colors.reset}`, error);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

checkProfiles();