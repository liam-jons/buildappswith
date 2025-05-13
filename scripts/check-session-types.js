#!/usr/bin/env node

/**
 * Check Session Types Script
 * 
 * A script to check session types in both databases
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

console.log(`${colors.bright}${colors.cyan}=== Session Types Check Tool ===${colors.reset}\n`);

async function checkSessionTypes() {
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
    // Check dev session types
    console.log(`${colors.yellow}Checking session types in development:${colors.reset}`);
    
    try {
      // Find Liam's ID in dev
      const liamInDev = await devPrisma.$queryRaw`
        SELECT bp.id as builderId
        FROM "User" u 
        JOIN "BuilderProfile" bp ON u.id = bp."userId"
        WHERE u.name ILIKE '%Liam%'
        LIMIT 1
      `;
      
      if (liamInDev.length > 0) {
        const builderId = liamInDev[0].builderid;
        console.log(`${colors.cyan}Liam's builder ID in dev: ${builderId}${colors.reset}`);
        
        // Get session types for Liam
        const sessionTypes = await devPrisma.$queryRaw`
          SELECT * FROM "SessionType" 
          WHERE "builderId" = ${builderId}
        `;
        
        if (sessionTypes.length > 0) {
          console.log(`${colors.green}✓ Found ${sessionTypes.length} session types in dev:${colors.reset}`);
          sessionTypes.forEach((st, i) => {
            console.log(`  ${i+1}. ${st.title} - ${st.durationMinutes} mins - ${st.price} ${st.currency}`);
            console.log(`     Calendly Event Type ID: ${st.calendlyEventTypeId || 'Not set'}`);
          });
        } else {
          console.log(`${colors.red}✗ No session types found in dev for Liam${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}✗ Could not find Liam in dev${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking dev session types:${colors.reset}`, error);
    }
    
    console.log("");
    
    // Check prod session types
    console.log(`${colors.yellow}Checking session types in production:${colors.reset}`);
    
    try {
      // Find Liam's ID in prod
      const liamInProd = await prodPrisma.$queryRaw`
        SELECT bp.id as builderId
        FROM "User" u 
        JOIN "BuilderProfile" bp ON u.id = bp."userId"
        WHERE u.name ILIKE '%Liam%'
        LIMIT 1
      `;
      
      if (liamInProd.length > 0) {
        const builderId = liamInProd[0].builderid;
        console.log(`${colors.cyan}Liam's builder ID in prod: ${builderId}${colors.reset}`);
        
        // Get session types for Liam
        const sessionTypes = await prodPrisma.$queryRaw`
          SELECT * FROM "SessionType" 
          WHERE "builderId" = ${builderId}
        `;
        
        if (sessionTypes.length > 0) {
          console.log(`${colors.green}✓ Found ${sessionTypes.length} session types in prod:${colors.reset}`);
          sessionTypes.forEach((st, i) => {
            console.log(`  ${i+1}. ${st.title} - ${st.durationMinutes} mins - ${st.price} ${st.currency}`);
            console.log(`     Calendly Event Type ID: ${st.calendlyEventTypeId || 'Not set'}`);
          });
        } else {
          console.log(`${colors.red}✗ No session types found in prod for Liam${colors.reset}`);
          
          console.log(`\n${colors.yellow}Creating a sample session type in production...${colors.reset}`);
          
          // Create a sample session type
          const newSessionType = await prodPrisma.sessionType.create({
            data: {
              builderId: builderId,
              title: "1:1 Developer Consultation",
              description: "Get personalized guidance on your development projects.",
              durationMinutes: 60,
              price: 150.00,
              currency: "USD",
              isActive: true,
              color: "#4F46E5"
            }
          });
          
          console.log(`${colors.green}✓ Created session type: ${newSessionType.title}${colors.reset}`);
          console.log(`   ID: ${newSessionType.id}`);
          console.log(`   Price: ${newSessionType.price} ${newSessionType.currency}`);
          console.log(`   Duration: ${newSessionType.durationMinutes} minutes`);
        }
      } else {
        console.log(`${colors.red}✗ Could not find Liam in prod${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error checking prod session types:${colors.reset}`, error);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

checkSessionTypes();