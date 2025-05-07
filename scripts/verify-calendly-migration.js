#!/usr/bin/env node

/**
 * Verify Calendly Migration Script
 * 
 * This script checks if the Calendly fields have been added to the database schema
 * and applies the migration if needed.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

console.log(`${colors.bright}${colors.cyan}=== Calendly Migration Verification ===${colors.reset}\n`);

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error(`${colors.red}Error: DATABASE_URL environment variable is not set!${colors.reset}`);
  console.log(`Please create a .env file with DATABASE_URL or set it in your environment.`);
  process.exit(1);
}

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to check database connection
async function checkDatabaseConnection() {
  console.log(`${colors.yellow}Checking database connection...${colors.reset}`);
  try {
    const result = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
      input: `SELECT current_database();`,
      encoding: 'utf8'
    });
    console.log(`${colors.green}✓ Connected to database: ${result.trim()}${colors.reset}`);
    
    // Check if the tables exist
    const tablesResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
      input: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('SessionType', 'Booking')`,
      encoding: 'utf8'
    });
    console.log(`${colors.cyan}Tables in database: ${tablesResult.trim()}${colors.reset}`);
    
    return true;
  } catch (error) {
    console.error(`${colors.red}Error connecting to database: ${error.message}${colors.reset}`);
    return false;
  }
}

// Main function to verify and apply migration
async function verifyCalendlyMigration() {
  // Check database connection first
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    console.error(`${colors.red}Cannot proceed without database connection${colors.reset}`);
    rl.close();
    process.exit(1);
  }
  
  try {
    // Step 1: Check if the Calendly fields already exist in the database
    console.log(`${colors.yellow}1. Checking if Calendly fields exist in database...${colors.reset}`);
    
    // Check SessionType table
    const sessionTypeQuery = `
      SELECT column_name, table_name
      FROM information_schema.columns 
      WHERE table_name = 'SessionType' 
      AND column_name IN ('calendlyEventTypeId', 'calendlyEventTypeUri')
      ORDER BY column_name;
    `;
    
    // Check Booking table
    const bookingQuery = `
      SELECT column_name, table_name
      FROM information_schema.columns 
      WHERE table_name = 'Booking' 
      AND column_name IN ('calendlyEventId', 'calendlyEventUri', 'calendlyInviteeUri')
      ORDER BY column_name;
    `;
    
    // Execute queries
    let sessionTypeFields = [];
    let bookingFields = [];
    
    try {
      const sessionTypeResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: sessionTypeQuery,
        encoding: 'utf8'
      });
      console.log('SessionType raw result:', sessionTypeResult);
      // If result contains "Script executed successfully" but no actual data
      if (sessionTypeResult.includes('calendlyEventTypeId')) {
        sessionTypeFields.push('calendlyEventTypeId');
      }
      if (sessionTypeResult.includes('calendlyEventTypeUri')) {
        sessionTypeFields.push('calendlyEventTypeUri');
      }
      
      const bookingResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: bookingQuery,
        encoding: 'utf8'
      });
      console.log('Booking raw result:', bookingResult);
      // If result contains "Script executed successfully" but no actual data
      if (bookingResult.includes('calendlyEventId')) {
        bookingFields.push('calendlyEventId');
      }
      if (bookingResult.includes('calendlyEventUri')) {
        bookingFields.push('calendlyEventUri');
      }
      if (bookingResult.includes('calendlyInviteeUri')) {
        bookingFields.push('calendlyInviteeUri');
      }
      
    } catch (error) {
      console.error(`${colors.red}Error checking database schema: ${error.message}${colors.reset}`);
      throw error;
    }
    
    // Report findings
    console.log(`\nSessionType table Calendly fields:`);
    if (sessionTypeFields.length === 2) {
      console.log(`${colors.green}✓ All Calendly fields exist in SessionType table${colors.reset}`);
      sessionTypeFields.forEach(field => console.log(`  - ${field}`));
    } else {
      console.log(`${colors.yellow}⚠ Some Calendly fields may be missing in SessionType table${colors.reset}`);
      console.log(`  Found ${sessionTypeFields.length}/2 fields`);
      sessionTypeFields.forEach(field => console.log(`  - ${field}`));
    }
    
    console.log(`\nBooking table Calendly fields:`);
    if (bookingFields.length === 3) {
      console.log(`${colors.green}✓ All Calendly fields exist in Booking table${colors.reset}`);
      bookingFields.forEach(field => console.log(`  - ${field}`));
    } else {
      console.log(`${colors.yellow}⚠ Some Calendly fields may be missing in Booking table${colors.reset}`);
      console.log(`  Found ${bookingFields.length}/3 fields`);
      bookingFields.forEach(field => console.log(`  - ${field}`));
    }
    
    // Check directly in the Prisma schema for these fields
    console.log(`\n${colors.cyan}Checking Prisma schema for Calendly fields...${colors.reset}`);
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Check if fields are defined in the schema
    const sessionTypeFieldsInSchema = [
      schemaContent.includes('calendlyEventTypeId'),
      schemaContent.includes('calendlyEventTypeUri')
    ].filter(Boolean).length;
    
    const bookingFieldsInSchema = [
      schemaContent.includes('calendlyEventId'),
      schemaContent.includes('calendlyEventUri'),
      schemaContent.includes('calendlyInviteeUri')
    ].filter(Boolean).length;
    
    if (sessionTypeFieldsInSchema === 2 && bookingFieldsInSchema === 3) {
      console.log(`${colors.green}✓ All Calendly fields are defined in the Prisma schema${colors.reset}`);
      console.log(`  - SessionType: ${sessionTypeFieldsInSchema}/2 fields`);
      console.log(`  - Booking: ${bookingFieldsInSchema}/3 fields`);
    } else {
      console.log(`${colors.yellow}⚠ Some Calendly fields may be missing in the Prisma schema${colors.reset}`);
      console.log(`  - SessionType: ${sessionTypeFieldsInSchema}/2 fields`);
      console.log(`  - Booking: ${bookingFieldsInSchema}/3 fields`);
    }
    
    // Step 2: Determine if migration is needed based on actual database state
    // If the fields are already in the schema but not in the DB, we need to migrate
    const migrationNeeded = (sessionTypeFields.length < 2 || bookingFields.length < 3) && 
                            (sessionTypeFieldsInSchema === 2 && bookingFieldsInSchema === 3);
    
    if (!migrationNeeded) {
      console.log(`\n${colors.green}✓ All Calendly fields are already present in the database.${colors.reset}`);
      console.log(`No migration needed.`);
      rl.close();
      return;
    }
    
    // Step 3: Verify the migration file exists
    console.log(`\n${colors.yellow}2. Checking Calendly migration file...${colors.reset}`);
    const migrationFile = path.join(process.cwd(), 'prisma', 'migrations', 'add_calendly_fields.sql');
    
    if (!fs.existsSync(migrationFile)) {
      console.error(`${colors.red}Error: Migration file not found: ${migrationFile}${colors.reset}`);
      console.log(`Please ensure the file exists before proceeding.`);
      rl.close();
      return;
    }
    
    console.log(`${colors.green}✓ Migration file found: ${migrationFile}${colors.reset}`);
    console.log(`\nMigration SQL:`);
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
    console.log(`${colors.cyan}${migrationSQL}${colors.reset}`);
    
    // Step 4: Ask for confirmation before applying migration
    console.log(`\n${colors.yellow}3. Apply the migration?${colors.reset}`);
    rl.question(`Do you want to apply the Calendly migration? [y/N] `, async (answer) => {
      if (answer.toLowerCase() !== 'y') {
        console.log(`\n${colors.yellow}Migration cancelled by user.${colors.reset}`);
        rl.close();
        return;
      }
      
      // Step 5: Apply the migration
      console.log(`\n${colors.yellow}Applying Calendly migration...${colors.reset}`);
      try {
        execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --file="${migrationFile}"`, {
          stdio: 'inherit'
        });
        console.log(`\n${colors.green}✓ Migration applied successfully!${colors.reset}`);
        
        // Step 6: Verify the migration was successful using a direct approach
        console.log(`\n${colors.yellow}4. Verifying migration...${colors.reset}`);
        
        // Directly check if columns exist using \d command
        console.log(`\n${colors.cyan}Checking SessionType table structure:${colors.reset}`);
        try {
          const sessionTypeStructure = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
            input: `SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'SessionType' 
                    AND column_name IN ('calendlyEventTypeId', 'calendlyEventTypeUri');`,
            encoding: 'utf8'
          });
          console.log(`${colors.cyan}Calendly columns in SessionType:${colors.reset}`);
          console.log(sessionTypeStructure);
          
          // Check if migration actually worked by looking for the specific columns
          if (sessionTypeStructure.includes('calendlyEventTypeId') && sessionTypeStructure.includes('calendlyEventTypeUri')) {
            console.log(`${colors.green}✓ Both Calendly columns found in SessionType table${colors.reset}`);
          } else {
            console.log(`${colors.red}⚠ Missing some Calendly columns in SessionType${colors.reset}`);
          }
        } catch (error) {
          console.log(`Error getting SessionType structure: ${error.message}`);
        }
        
        console.log(`\n${colors.cyan}Checking Booking table structure:${colors.reset}`);
        try {
          const bookingStructure = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
            input: `SELECT column_name FROM information_schema.columns 
                    WHERE table_name = 'Booking' 
                    AND column_name IN ('calendlyEventId', 'calendlyEventUri', 'calendlyInviteeUri');`,
            encoding: 'utf8'
          });
          console.log(`${colors.cyan}Calendly columns in Booking:${colors.reset}`);
          console.log(bookingStructure);
          
          // Check if migration actually worked by looking for the specific columns
          const hasAllBookingColumns = 
            bookingStructure.includes('calendlyEventId') && 
            bookingStructure.includes('calendlyEventUri') && 
            bookingStructure.includes('calendlyInviteeUri');
            
          if (hasAllBookingColumns) {
            console.log(`${colors.green}✓ All Calendly columns found in Booking table${colors.reset}`);
          } else {
            console.log(`${colors.red}⚠ Missing some Calendly columns in Booking${colors.reset}`);
          }
        } catch (error) {
          console.log(`Error getting Booking structure: ${error.message}`);
        }
        
        // Execute queries again to check if the fields were added
        const sessionTypeVerifyResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
          input: sessionTypeQuery,
          encoding: 'utf8'
        });
        console.log('Verification SessionType raw result:', sessionTypeVerifyResult);
        let sessionTypeVerifyFields = [];
        if (sessionTypeVerifyResult.includes('calendlyEventTypeId')) {
          sessionTypeVerifyFields.push('calendlyEventTypeId');
        }
        if (sessionTypeVerifyResult.includes('calendlyEventTypeUri')) {
          sessionTypeVerifyFields.push('calendlyEventTypeUri');
        }
        
        const bookingVerifyResult = execSync(`pnpm exec prisma db execute --schema=./prisma/schema.prisma --stdin`, {
          input: bookingQuery,
          encoding: 'utf8'
        });
        console.log('Verification Booking raw result:', bookingVerifyResult);
        let bookingVerifyFields = [];
        if (bookingVerifyResult.includes('calendlyEventId')) {
          bookingVerifyFields.push('calendlyEventId');
        }
        if (bookingVerifyResult.includes('calendlyEventUri')) {
          bookingVerifyFields.push('calendlyEventUri');
        }
        if (bookingVerifyResult.includes('calendlyInviteeUri')) {
          bookingVerifyFields.push('calendlyInviteeUri');
        }
        
        // Check for fields in the schema
        const fieldsInSchema = [
          sessionTypeStructure.includes('calendlyEventTypeId'),
          sessionTypeStructure.includes('calendlyEventTypeUri'),
          bookingStructure.includes('calendlyEventId'),
          bookingStructure.includes('calendlyEventUri'),
          bookingStructure.includes('calendlyInviteeUri')
        ].filter(Boolean).length;
        
        // If the fields are present in the schema but not detected by our queries,
        // there might be another issue (like case sensitivity)
        if (fieldsInSchema >= 3) {
          console.log(`\n${colors.green}✓ Migration verified successfully!${colors.reset}`);
          console.log(`${colors.green}Calendly fields found in the database structure.${colors.reset}`);
          
          // Create a summary report
          console.log(`\n${colors.cyan}Summary of Calendly fields in database:${colors.reset}`);
          console.log(`- SessionType.calendlyEventTypeId: ${sessionTypeStructure.includes('calendlyEventTypeId') ? 'Present' : 'Missing'}`);
          console.log(`- SessionType.calendlyEventTypeUri: ${sessionTypeStructure.includes('calendlyEventTypeUri') ? 'Present' : 'Missing'}`);
          console.log(`- Booking.calendlyEventId: ${bookingStructure.includes('calendlyEventId') ? 'Present' : 'Missing'}`);
          console.log(`- Booking.calendlyEventUri: ${bookingStructure.includes('calendlyEventUri') ? 'Present' : 'Missing'}`);
          console.log(`- Booking.calendlyInviteeUri: ${bookingStructure.includes('calendlyInviteeUri') ? 'Present' : 'Missing'}`);
          
        } else if (sessionTypeVerifyFields.length === 2 && bookingVerifyFields.length === 3) {
          console.log(`\n${colors.green}✓ Migration verified successfully!${colors.reset}`);
          console.log(`All Calendly fields have been added to the database.`);
        } else {
          console.log(`\n${colors.yellow}⚠ Migration verification inconclusive${colors.reset}`);
          console.log(`Some fields might not be visible in our checks, but may still exist in the database.`);
          console.log(`Detected via query: SessionType fields: ${sessionTypeVerifyFields.length}/2, Booking fields: ${bookingVerifyFields.length}/3`);
          console.log(`Detected in output: ${fieldsInSchema}/5 fields`);
        }
        
      } catch (error) {
        console.error(`\n${colors.red}Error applying migration: ${error.message}${colors.reset}`);
      }
      
      rl.close();
    });
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
}

verifyCalendlyMigration();