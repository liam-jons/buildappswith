#!/usr/bin/env node

/**
 * Script to standardize database client imports
 * 
 * This script will:
 * 1. Find all files that import from @prisma/client directly
 * 2. Find all files that import the Prisma client inconsistently
 * 3. Update imports to use the standardized pattern
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

console.log(`${colors.cyan}====================================${colors.reset}`);
console.log(`${colors.cyan}  Database Import Standardization  ${colors.reset}`);
console.log(`${colors.cyan}====================================${colors.reset}`);

// Find files with direct PrismaClient imports
console.log(`\n${colors.yellow}Finding files with direct PrismaClient imports...${colors.reset}`);
const directPrismaImports = execSync(
  "grep -r --include='*.ts' --include='*.tsx' --include='*.js' 'import.*PrismaClient.*from.*@prisma/client' . --exclude-dir=node_modules"
).toString().trim().split('\n');

// Find files with inconsistent db imports
console.log(`\n${colors.yellow}Finding files with inconsistent db imports...${colors.reset}`);
const inconsistentImports = execSync(
  "grep -r --include='*.ts' --include='*.tsx' --include='*.js' 'import.*{.*db.*}.*from.*@/lib/db' . --exclude-dir=node_modules"
).toString().trim().split('\n');

// Find files with both prisma and db imports
console.log(`\n${colors.yellow}Finding files with both prisma and db imports...${colors.reset}`);
const mixedImports = execSync(
  "grep -r --include='*.ts' --include='*.tsx' --include='*.js' 'import.*{.*db, db.*}.*from.*@/lib/db' . --exclude-dir=node_modules"
).toString().trim().split('\n');

// Process and report findings
const filesToUpdate = new Set();

// Process direct PrismaClient imports
if (directPrismaImports[0] !== '') {
  console.log(`\n${colors.magenta}Found ${directPrismaImports.length} files with direct PrismaClient imports:${colors.reset}`);
  directPrismaImports.forEach(line => {
    const fileName = line.split(':')[0];
    console.log(`  - ${fileName}`);
    filesToUpdate.add(fileName);
  });
}

// Process inconsistent imports using prisma
if (inconsistentImports[0] !== '') {
  console.log(`\n${colors.magenta}Found ${inconsistentImports.length} files with inconsistent imports using 'prisma':${colors.reset}`);
  inconsistentImports.forEach(line => {
    const fileName = line.split(':')[0];
    console.log(`  - ${fileName}`);
    filesToUpdate.add(fileName);
  });
}

// Process mixed imports
if (mixedImports[0] !== '') {
  console.log(`\n${colors.magenta}Found ${mixedImports.length} files importing both 'db' and 'prisma':${colors.reset}`);
  mixedImports.forEach(line => {
    const fileName = line.split(':')[0];
    console.log(`  - ${fileName}`);
    filesToUpdate.add(fileName);
  });
}

// Summary
const totalFilesToUpdate = filesToUpdate.size;
console.log(`\n${colors.green}Summary: ${totalFilesToUpdate} files need updates${colors.reset}`);

// Confirm before proceeding
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question(`\n${colors.yellow}Do you want to update these files? (y/n) ${colors.reset}`, async (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log(`\n${colors.cyan}Updating files...${colors.reset}`);
    
    // Convert Set to Array for iteration
    const fileArray = Array.from(filesToUpdate);
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const filePath of fileArray) {
      try {
        if (fs.existsSync(filePath)) {
          // Read file content
          let content = fs.readFileSync(filePath, 'utf8');
          let originalContent = content;
          
          // Replace direct PrismaClient imports
          content = content.replace(
            /import\s+{\s*PrismaClient\s*}.*from\s+['"]@prisma\/client['"]/g,
            "import { db } from '@/lib/db'"
          );
          
          // Replace PrismaClient direct instantiation
          content = content.replace(
            /new\s+PrismaClient\([^)]*\)/g,
            "/* Use the shared 'db' instance from '@/lib/db' instead */"
          );
          
          // Replace prisma imports with db
          content = content.replace(
            /import\s+{\s*prisma\s*}.*from\s+['"]@\/lib\/db['"]/g,
            "import { db } from '@/lib/db'"
          );
          
          // Replace mixed imports (keep only db)
          content = content.replace(
            /import\s+{\s*db,\s*prisma\s*}.*from\s+['"]@\/lib\/db['"]/g,
            "import { db } from '@/lib/db'"
          );
          
          // Replace prisma usage with db
          content = content.replace(/prisma\./g, 'db.');
          
          // Write back if changed
          if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ${colors.green}✓ Updated:${colors.reset} ${filePath}`);
            updatedCount++;
          } else {
            console.log(`  ${colors.yellow}⚠ No changes needed:${colors.reset} ${filePath}`);
          }
        } else {
          console.log(`  ${colors.red}✗ File not found:${colors.reset} ${filePath}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`  ${colors.red}✗ Error updating ${filePath}:${colors.reset}`, error.message);
        errorCount++;
      }
    }
    
    // Final report
    console.log(`\n${colors.cyan}====================================${colors.reset}`);
    console.log(`${colors.cyan}           Update Complete          ${colors.reset}`);
    console.log(`${colors.cyan}====================================${colors.reset}`);
    console.log(`\n${colors.green}Successfully updated: ${updatedCount} files${colors.reset}`);
    
    if (errorCount > 0) {
      console.log(`${colors.red}Errors encountered: ${errorCount} files${colors.reset}`);
    }
    
    console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
    console.log(`1. Review the updated files for any issues`);
    console.log(`2. Run the type checker to ensure all types are correct`);
    console.log(`3. Run the test suite to ensure functionality is maintained`);
    
  } else {
    console.log(`\n${colors.yellow}Update canceled.${colors.reset}`);
  }
  
  readline.close();
});