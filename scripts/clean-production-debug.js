#!/usr/bin/env node

/**
 * Clean debug statements from critical production files
 * Focuses on the most important files only
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Critical production files to clean
const criticalFiles = [
  'lib/marketplace/data/marketplace-service.ts',
  'lib/marketplace/data/demo-account-handler.ts',
  'lib/marketplace/api.ts',
  'app/api/marketplace/builders/route.ts',
  'app/api/marketplace/filters/route.ts',
  'app/api/profiles/builder/route.ts',
  'app/api/auth-test/route.ts',
  'app/api/test/auth/route.ts'
];

// Patterns to remove
const patterns = [
  // Console log statements with [PROD DEBUG] prefix
  {
    name: 'Production debug logs',
    pattern: /^\s*console\.log\(\'\[PROD DEBUG[^\n]*\n/gm,
    replacement: ''
  },
  // Regular console.log statements
  {
    name: 'Console.log statements',
    pattern: /^\s*console\.log\([^)]*\);?\s*\n/gm,
    replacement: ''
  },
  // Console.error with DEBUG prefix
  {
    name: 'Debug console.error',
    pattern: /^\s*console\.error\(\s*['"`]DEBUG:.*?\);?\s*\n/gm,
    replacement: ''
  }
];

const dryRun = process.argv.includes('--dry-run');

console.log(`🧹 Cleaning debug statements from critical production files`);
if (dryRun) {
  console.log(`${colors.yellow}DRY RUN - No files will be modified${colors.reset}\n`);
}

let totalRemoved = 0;
let filesModified = 0;

criticalFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`${colors.yellow}⚠️  Skipping: ${filePath} (file not found)${colors.reset}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  let newContent = content;
  let fileChanges = 0;
  
  patterns.forEach(({ name, pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      fileChanges += matches.length;
      newContent = newContent.replace(pattern, replacement);
    }
  });
  
  if (fileChanges > 0) {
    console.log(`\n${colors.green}✓${colors.reset} ${filePath}`);
    console.log(`  Removed ${fileChanges} debug statements`);
    
    totalRemoved += fileChanges;
    filesModified++;
    
    if (!dryRun) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
    }
  } else {
    console.log(`${colors.green}✓${colors.reset} ${filePath} - Clean`);
  }
});

console.log(`\n${colors.green}Summary:${colors.reset}`);
console.log(`Files processed: ${criticalFiles.length}`);
console.log(`Files with debug statements: ${filesModified}`);
console.log(`Total debug statements removed: ${totalRemoved}`);

if (dryRun) {
  console.log(`\n${colors.yellow}This was a DRY RUN. No files were modified.${colors.reset}`);
  console.log('To apply changes, run without --dry-run:');
  console.log(`  ${colors.green}node scripts/clean-production-debug.js${colors.reset}`);
} else {
  console.log(`\n${colors.green}✅ Debug statements removed successfully!${colors.reset}`);
  console.log('\nNext steps:');
  console.log('1. Review changes: git diff');
  console.log('2. Run tests: pnpm test');
  console.log('3. Commit changes: git commit -m "Remove debug statements from production code"');
}

// Create a backup of the changes
if (!dryRun) {
  const backupDir = path.join(process.cwd(), 'scripts', 'backups', 'debug-cleanup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `cleanup-${timestamp}.json`);
  
  fs.writeFileSync(backupFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    filesModified,
    totalRemoved,
    files: criticalFiles.filter((_, i) => i < filesModified)
  }, null, 2));
  
  console.log(`\nBackup saved to: ${backupFile}`);
}