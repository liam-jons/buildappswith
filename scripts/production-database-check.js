#!/usr/bin/env node

/**
 * Production Database Check Script
 * 
 * Comprehensive check of production database state for deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.production.local' });
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

console.log(`${colors.bright}${colors.cyan}=== Production Database Check ===${colors.reset}\n`);

// Use PRODUCTION_DATABASE_URL as the primary variable name
const prodDatabaseUrl = process.env.PRODUCTION_DATABASE_URL;

if (!prodDatabaseUrl) {
  console.error(`${colors.red}Error: PRODUCTION_DATABASE_URL not found. ${colors.reset}`);
  console.error(`\nYou can:`);
  console.error(`1. Set PRODUCTION_DATABASE_URL in .env.production or .env.production.local`);
  console.error(`2. Download production environment variables from Vercel:`);
  console.error(`   vercel env pull --environment=production .env.production.local`);
  console.error(`3. Run this script with the URL directly:`);
  console.error(`   PRODUCTION_DATABASE_URL=<your-prod-url> node scripts/production-database-check.js`);
  process.exit(1);
}

// Check if this looks like a production database
if (prodDatabaseUrl.includes('-dev')) {
  console.warn(`${colors.yellow}WARNING: The PRODUCTION_DATABASE_URL contains '-dev'. Make sure this is your production database.${colors.reset}`);
  console.warn(`Current URL: ${prodDatabaseUrl.split('@')[1] || prodDatabaseUrl}`);
  console.warn(`\nIf this is incorrect, please run:`);
  console.warn(`vercel env pull --environment=production .env.production.local`);
  console.warn(`to refresh your production environment variables.\n`);
}

console.log(`${colors.yellow}Using PRODUCTION_DATABASE_URL${colors.reset}`);

try {
  // Step 1: Check connection to production database
  console.log(`\n${colors.yellow}1. Testing database connection...${colors.reset}`);
  try {
    execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
      input: 'SELECT NOW();',
      stdio: 'pipe'
    });
    
    console.log(`${colors.green}✓ Database connection successful${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Database connection failed${colors.reset}`);
    console.log(`${colors.yellow}Error details:${colors.reset}`);
    console.log(error.stdout ? error.stdout.toString() : error.message);
    if (error.stderr) {
      console.log(`${colors.red}Error output:${colors.reset}`);
      console.log(error.stderr.toString());
    }
    console.log(`\n${colors.yellow}Troubleshooting tips:${colors.reset}`);
    console.log(`1. Check if the database URL is correct and accessible`);
    console.log(`2. Ensure your IP is whitelisted in the database provider's settings`);
    console.log(`3. Verify the database exists and is not paused/suspended`);
    console.log(`4. Try running: npx prisma db execute --url="YOUR_URL" --stdin`);
    throw error;
  }

  // Step 2: Check production migration history
  console.log(`\n${colors.yellow}2. Checking migration history...${colors.reset}`);
  try {
    const result = execSync(`DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate status`, {
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
    });
    
    console.log(result);
  } catch (error) {
    if (error.status === 1) {
      console.log(`${colors.red}⚠ Migration drift detected:${colors.reset}`);
      console.log(error.stdout || error.message);
    } else {
      console.log(`${colors.red}Error checking migration status:${colors.reset}`);
      console.log(error.stdout ? error.stdout.toString() : error.message);
      if (error.stderr) {
        console.log(`${colors.red}Error output:${colors.reset}`);
        console.log(error.stderr.toString());
      }
      throw error;
    }
  }

  // Step 3: Check if the socialLinks column exists in production
  console.log(`\n${colors.yellow}3. Checking for socialLinks column...${colors.reset}`);
  try {
    const query = `SELECT column_name 
                   FROM information_schema.columns 
                   WHERE table_name = 'BuilderProfile' AND column_name = 'socialLinks';`;
    
    const result = execSync(`npx prisma db execute --url="${prodDatabaseUrl}" --stdin`, {
      input: query,
      encoding: 'utf8'
    });
    
    if (result.includes('socialLinks')) {
      console.log(`${colors.green}✓ socialLinks column exists${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ socialLinks column not found${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}Error checking for socialLinks: ${error.message}${colors.reset}`);
    if (error.stderr) {
      console.log(`${colors.red}Error output:${colors.reset}`);
      console.log(error.stderr.toString());
    }
  }

  // Step 4: Compare local and production schema differences
  console.log(`\n${colors.yellow}4. Comparing local schema with production...${colors.reset}`);
  try {
    const diffResult = execSync(`DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script`, {
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: prodDatabaseUrl }
    });
    
    if (diffResult.trim()) {
      console.log(`${colors.red}Schema differences found:${colors.reset}`);
      console.log(diffResult);
    } else {
      console.log(`${colors.green}✓ No schema differences found${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}Error comparing schemas: ${error.message}${colors.reset}`);
    if (error.stderr) {
      console.log(`${colors.red}Error output:${colors.reset}`);
      console.log(error.stderr.toString());
    }
  }

  // Step 5: Provide recommendations
  console.log(`\n${colors.bright}${colors.yellow}Recommended Actions:${colors.reset}`);
  
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  const fileMigrations = fs.readdirSync(migrationsDir)
    .filter(dir => dir.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    .sort();
  
  const socialLinksMigrations = fileMigrations.filter(m => m.includes('add_social_links'));
  
  if (socialLinksMigrations.length > 1) {
    console.log(`
${colors.yellow}You have ${socialLinksMigrations.length} duplicate 'add_social_links' migrations:${colors.reset}
${socialLinksMigrations.map(m => `  - ${m}`).join('\n')}

${colors.cyan}To fix this issue:${colors.reset}

1. First, check if the production database already has the socialLinks column (see above).

2. If the column exists in production:
   - Run: DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate resolve --applied 20250420104035_add_social_links
   - Then remove the duplicate migrations:
     ${socialLinksMigrations.slice(1).map(m => `rm -rf prisma/migrations/${m}`).join('\n     ')}

3. If the column doesn't exist:
   - Remove the duplicate migrations:
     ${socialLinksMigrations.slice(1).map(m => `rm -rf prisma/migrations/${m}`).join('\n     ')}
   - Then apply the migrations:
     DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate deploy

4. After fixing:
   - Verify with: DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate status
   - Run your production check script again to confirm everything is resolved

Note: All Prisma commands will use the PRODUCTION_DATABASE_URL you've provided.
`);
  } else {
    console.log(`\n${colors.green}No duplicate migrations found.${colors.reset}`);
    console.log(`If you're still experiencing issues, try:`);
    console.log(`DATABASE_URL="${prodDatabaseUrl}" npx prisma migrate deploy`);
  }

} catch (error) {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}

console.log(`\n${colors.bright}${colors.green}Check completed.${colors.reset}`);
