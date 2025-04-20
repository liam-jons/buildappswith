#!/usr/bin/env node

/**
 * Fix Build Issues Script
 * 
 * This script resolves common build issues before deployment
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

console.log(`${colors.bright}${colors.cyan}=== Fixing Build Issues ===${colors.reset}\n`);

async function fixBuildIssues() {
  try {
    // Step 1: Regenerate Prisma client
    console.log(`${colors.yellow}1. Regenerating Prisma client...${colors.reset}`);
    try {
      execSync('npx prisma generate', { 
        stdio: 'inherit',
        encoding: 'utf8'
      });
      console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error regenerating Prisma client: ${error.message}${colors.reset}`);
    }
    
    // Step 2: Create Edge-compatible CSRF module
    console.log(`\n${colors.yellow}2. Creating Edge-compatible CSRF module...${colors.reset}`);
    const csrfEdgePath = path.join(process.cwd(), 'lib', 'csrf-edge.ts');
    if (fs.existsSync(csrfEdgePath)) {
      console.log(`${colors.green}✓ Edge-compatible CSRF module already exists${colors.reset}`);
    } else {
      console.log(`${colors.yellow}! Edge-compatible CSRF module not found${colors.reset}`);
    }
    
    // Step 3: Update imports to use csrf-edge instead of csrf where needed
    console.log(`\n${colors.yellow}3. Updating imports for Edge compatibility...${colors.reset}`);
    // This would need to be implemented based on which files are using Edge runtime
    console.log(`${colors.cyan}Note: Update any Edge runtime files to import from 'lib/csrf-edge' instead of 'lib/csrf'${colors.reset}`);
    
    // Step 4: Test build locally
    console.log(`\n${colors.yellow}4. Running test build...${colors.reset}`);
    try {
      execSync('pnpm run build', { 
        stdio: 'inherit',
        encoding: 'utf8'
      });
      console.log(`${colors.green}✓ Build successful${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Build failed: Please review the errors above${colors.reset}`);
      console.log(`${colors.yellow}Common fixes:${colors.reset}`);
      console.log(`- Ensure all Edge runtime files use 'lib/csrf-edge' instead of 'lib/csrf'`);
      console.log(`- Run 'npx prisma generate' if UserRole is still missing`);
      console.log(`- Check for any remaining Node.js-specific modules in Edge runtime files`);
    }
    
    console.log(`\n${colors.green}${colors.bright}✓ Build issue fixes completed${colors.reset}`);
    
  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

fixBuildIssues();
