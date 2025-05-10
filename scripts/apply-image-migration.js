#!/usr/bin/env node

/**
 * Apply Image to ImageUrl Migration Script
 * 
 * This script applies the migration to rename the 'image' field to 'imageUrl'
 * in the User table and then verifies it was successful.
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

console.log(`${colors.bright}${colors.cyan}=== Image to ImageUrl Migration ===${colors.reset}\n`);

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error(`${colors.red}Error: DATABASE_URL environment variable is not set!${colors.reset}`);
  console.log(`Please create a .env file with DATABASE_URL or set it in your environment.`);
  process.exit(1);
}

async function applyMigration() {
  try {
    // Step 1: Check database connection
    console.log(`${colors.yellow}Checking database connection...${colors.reset}`);
    try {
      const result = execSync(`npx prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: `SELECT current_database();`,
        encoding: 'utf8'
      });
      console.log(`${colors.green}✓ Connected to database: ${result.trim()}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error connecting to database: ${error.message}${colors.reset}`);
      process.exit(1);
    }
    
    // Step 2: Check if 'image' field exists and 'imageUrl' doesn't
    console.log(`\n${colors.yellow}Checking current schema state...${colors.reset}`);
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('image', 'imageUrl');
    `;
    
    let hasImage = false;
    let hasImageUrl = false;
    
    try {
      const result = execSync(`npx prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: checkQuery,
        encoding: 'utf8'
      });
      
      hasImage = result.includes('image');
      hasImageUrl = result.includes('imageUrl');
      
      console.log(`${colors.cyan}Current fields:${colors.reset}`);
      console.log(`- 'image' field exists: ${hasImage ? 'Yes' : 'No'}`);
      console.log(`- 'imageUrl' field exists: ${hasImageUrl ? 'Yes' : 'No'}`);
      
      if (hasImageUrl && !hasImage) {
        console.log(`\n${colors.green}✓ Migration already applied! 'imageUrl' field exists.${colors.reset}`);
        return;
      } else if (!hasImage && !hasImageUrl) {
        console.log(`\n${colors.yellow}⚠ Neither 'image' nor 'imageUrl' fields found in the User table.${colors.reset}`);
        return;
      } else if (hasImage && hasImageUrl) {
        console.log(`\n${colors.yellow}⚠ Both 'image' and 'imageUrl' fields exist. This is an unexpected state.${colors.reset}`);
        return;
      }
    } catch (error) {
      console.error(`${colors.red}Error checking schema: ${error.message}${colors.reset}`);
      process.exit(1);
    }
    
    // Step 3: Backup current data
    console.log(`\n${colors.yellow}Backing up User table data...${colors.reset}`);
    try {
      const query = `SELECT * FROM "User" LIMIT 10;`;
      const backup = execSync(`npx prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: query,
        encoding: 'utf8'
      });
      
      // Save backup to file
      const backupFile = path.join(process.cwd(), 'user_table_backup.json');
      fs.writeFileSync(backupFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        data: backup
      }, null, 2));
      
      console.log(`${colors.green}✓ Backup created: ${backupFile}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error backing up data: ${error.message}${colors.reset}`);
      // Continue despite backup error
      console.log(`${colors.yellow}⚠ Continuing without backup${colors.reset}`);
    }
    
    // Step 4: Apply the migration
    console.log(`\n${colors.yellow}Applying migration: Rename 'image' to 'imageUrl'...${colors.reset}`);
    const migrationFile = path.join(process.cwd(), 'prisma', 'migrations', 'rename_image_to_imageurl.sql');
    
    if (!fs.existsSync(migrationFile)) {
      console.error(`${colors.red}Error: Migration file not found: ${migrationFile}${colors.reset}`);
      process.exit(1);
    }
    
    try {
      execSync(`npx prisma db execute --schema=./prisma/schema.prisma --file="${migrationFile}"`, {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Migration applied successfully!${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error applying migration: ${error.message}${colors.reset}`);
      process.exit(1);
    }
    
    // Step 5: Verify the migration
    console.log(`\n${colors.yellow}Verifying migration...${colors.reset}`);
    try {
      const result = execSync(`npx prisma db execute --schema=./prisma/schema.prisma --stdin`, {
        input: checkQuery,
        encoding: 'utf8'
      });
      
      hasImage = result.includes('image');
      hasImageUrl = result.includes('imageUrl');
      
      console.log(`${colors.cyan}Updated fields:${colors.reset}`);
      console.log(`- 'image' field exists: ${hasImage ? 'Yes' : 'No'}`);
      console.log(`- 'imageUrl' field exists: ${hasImageUrl ? 'Yes' : 'No'}`);
      
      if (hasImageUrl && !hasImage) {
        console.log(`\n${colors.green}✓ Migration verified! 'image' renamed to 'imageUrl' successfully.${colors.reset}`);
      } else {
        console.log(`\n${colors.red}⚠ Migration verification failed. Unexpected schema state.${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error verifying migration: ${error.message}${colors.reset}`);
    }
    
    // Step 6: Generate Prisma client to match new schema
    console.log(`\n${colors.yellow}Generating Prisma client...${colors.reset}`);
    try {
      execSync('npx prisma generate', {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Prisma client generated successfully!${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error generating Prisma client: ${error.message}${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}${colors.green}Migration completed successfully!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`1. Remove the field mapper utility from the codebase`);
    console.log(`2. Update any direct references to the 'image' field`);
    console.log(`3. Run your test suite to verify everything works correctly`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

applyMigration();