#!/usr/bin/env node

/**
 * Remove Field Mapper Script
 * 
 * This script removes the field mapper utility and updates any references
 * after the image to imageUrl migration has been applied.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Remove Field Mapper Utility ===${colors.reset}\n`);

async function removeFieldMapper() {
  try {
    // Step 1: Update marketplace-service.ts to remove the field mapper usage
    console.log(`${colors.yellow}Updating marketplace service...${colors.reset}`);
    const serviceFile = path.join(process.cwd(), 'lib', 'marketplace', 'data', 'marketplace-service.ts');
    
    if (!fs.existsSync(serviceFile)) {
      console.error(`${colors.red}Error: Service file not found: ${serviceFile}${colors.reset}`);
      return;
    }
    
    let serviceContent = fs.readFileSync(serviceFile, 'utf8');
    
    // Remove import
    serviceContent = serviceContent.replace(`import { mapUserFields } from './user-mapper';`, '');
    
    // Replace mapUserFields usage with direct access
    serviceContent = serviceContent.replace(/const mappedUser = mapUserFields\(builder\.user\);/g, 
      '// Field mapping no longer needed after schema change\n        const mappedUser = builder.user;');
    
    // Update references to imageUrl (these should now directly use the field from the DB)
    serviceContent = serviceContent.replace(/avatarUrl: mappedUser\.imageUrl/g, 'avatarUrl: mappedUser.imageUrl');
    
    fs.writeFileSync(serviceFile, serviceContent);
    console.log(`${colors.green}✓ Updated marketplace service${colors.reset}`);
    
    // Step 2: Update any SELECT statements to use imageUrl
    console.log(`\n${colors.yellow}Checking for SQL queries that need updating...${colors.reset}`);
    try {
      const result = execSync('grep -r "image: true" --include="*.ts" --include="*.tsx" ./lib', {
        encoding: 'utf8'
      });
      
      if (result) {
        console.log(`${colors.yellow}⚠ Found potential SQL queries that might need updating:${colors.reset}`);
        console.log(result);
        console.log(`${colors.yellow}Please manually update these to use 'imageUrl: true' instead.${colors.reset}`);
      } else {
        console.log(`${colors.green}✓ No SQL queries found that need updating${colors.reset}`);
      }
    } catch (error) {
      // No results found is expected
      console.log(`${colors.green}✓ No SQL queries found that need updating${colors.reset}`);
    }
    
    // Step 3: Run tests to make sure nothing broke
    console.log(`\n${colors.yellow}Running tests...${colors.reset}`);
    try {
      execSync('npm run test:marketplace', {
        stdio: 'inherit'
      });
      console.log(`${colors.green}✓ Tests passed!${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}⚠ Some tests failed. Please fix them before proceeding.${colors.reset}`);
      console.log(`Error: ${error.message}`);
    }
    
    console.log(`\n${colors.bright}${colors.green}Field mapper removal completed!${colors.reset}`);
    console.log(`\nThe user-mapper.ts file can now be safely deleted if no other parts of the code use it.`);
    console.log(`\nTo delete the file, run:`);
    console.log(`rm -f lib/marketplace/data/user-mapper.ts`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  }
}

removeFieldMapper();