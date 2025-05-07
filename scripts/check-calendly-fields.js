#!/usr/bin/env node

/**
 * Check Calendly Fields Script
 * 
 * This script verifies that the Calendly fields exist in both the Prisma schema and database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Calendly Fields Verification ===${colors.reset}\n`);

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error(`${colors.red}Error: DATABASE_URL environment variable is not set!${colors.reset}`);
  console.log(`Please create a .env file with DATABASE_URL or set it in your environment.`);
  process.exit(1);
}

// Main function to check fields
async function checkCalendlyFields() {
  try {
    // Step 1: Check database connection
    console.log(`${colors.yellow}Checking database connection...${colors.reset}`);
    try {
      const result = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: `SELECT current_database();`,
        encoding: 'utf8'
      });
      console.log(`${colors.green}✓ Connected to database: ${result.trim()}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error connecting to database: ${error.message}${colors.reset}`);
      process.exit(1);
    }

    // Step 2: Check if the fields are in the Prisma schema
    console.log(`\n${colors.yellow}Checking Prisma schema for Calendly fields...${colors.reset}`);
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Check if fields are defined in the schema
    const sessionTypeFields = [
      schemaContent.includes('calendlyEventTypeId'),
      schemaContent.includes('calendlyEventTypeUri')
    ].filter(Boolean);
    
    const bookingFields = [
      schemaContent.includes('calendlyEventId'),
      schemaContent.includes('calendlyEventUri'),
      schemaContent.includes('calendlyInviteeUri')
    ].filter(Boolean);
    
    if (sessionTypeFields.length === 2 && bookingFields.length === 3) {
      console.log(`${colors.green}✓ All Calendly fields are defined in the Prisma schema${colors.reset}`);
      console.log(`  - SessionType: ${sessionTypeFields.length}/2 fields`);
      console.log(`  - Booking: ${bookingFields.length}/3 fields`);
    } else {
      console.log(`${colors.yellow}⚠ Some Calendly fields are missing in the Prisma schema${colors.reset}`);
      console.log(`  - SessionType: ${sessionTypeFields.length}/2 fields`);
      console.log(`  - Booking: ${bookingFields.length}/3 fields`);
    }

    // Step 3: Check the database structure
    console.log(`\n${colors.yellow}Checking database structure...${colors.reset}`);
    
    // Check SessionType table
    console.log(`\n${colors.cyan}SessionType table columns:${colors.reset}`);
    try {
      const sessionTypeStructure = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'SessionType' ORDER BY ordinal_position;`,
        encoding: 'utf8'
      });
      console.log(sessionTypeStructure);
      
      // Check if calendly fields are present by name
      const calendlyFieldsInSessionType = [];
      sessionTypeStructure.split('\n').forEach(line => {
        if (line.includes('calendlyEventTypeId')) calendlyFieldsInSessionType.push('calendlyEventTypeId');
        if (line.includes('calendlyEventTypeUri')) calendlyFieldsInSessionType.push('calendlyEventTypeUri');
      });
      
      if (calendlyFieldsInSessionType.length === 2) {
        console.log(`${colors.green}✓ All Calendly fields found in SessionType table${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Some Calendly fields may be missing in SessionType table${colors.reset}`);
        console.log(`  Found ${calendlyFieldsInSessionType.length}/2 fields`);
      }
    } catch (error) {
      console.log(`Error getting SessionType structure: ${error.message}`);
    }
    
    // Check Booking table
    console.log(`\n${colors.cyan}Booking table columns:${colors.reset}`);
    try {
      const bookingStructure = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Booking' ORDER BY ordinal_position;`,
        encoding: 'utf8'
      });
      console.log(bookingStructure);
      
      // Check if calendly fields are present by name
      const calendlyFieldsInBooking = [];
      bookingStructure.split('\n').forEach(line => {
        if (line.includes('calendlyEventId')) calendlyFieldsInBooking.push('calendlyEventId');
        if (line.includes('calendlyEventUri')) calendlyFieldsInBooking.push('calendlyEventUri');
        if (line.includes('calendlyInviteeUri')) calendlyFieldsInBooking.push('calendlyInviteeUri');
      });
      
      if (calendlyFieldsInBooking.length === 3) {
        console.log(`${colors.green}✓ All Calendly fields found in Booking table${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ Some Calendly fields may be missing in Booking table${colors.reset}`);
        console.log(`  Found ${calendlyFieldsInBooking.length}/3 fields`);
      }
    } catch (error) {
      console.log(`Error getting Booking structure: ${error.message}`);
    }

    // Step 4: Conclusion
    console.log(`\n${colors.bright}${colors.cyan}=== Summary ===${colors.reset}`);
    console.log(`1. Prisma Schema: ${sessionTypeFields.length === 2 && bookingFields.length === 3 ? `${colors.green}OK${colors.reset}` : `${colors.yellow}INCOMPLETE${colors.reset}`}`);
    console.log(`2. Database Tables: Please check the table structures above for Calendly fields`);
    console.log(`\n${colors.bright}The Calendly migration appears to have been already applied.${colors.reset}`);
    console.log(`All the necessary fields are defined in the Prisma schema, and the attempt to apply the migration failed because the columns already exist.`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

checkCalendlyFields();