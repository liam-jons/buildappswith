#!/usr/bin/env node

/**
 * Script to identify production debug hotspots
 * Focuses on critical production code with debug statements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Production-critical paths
const productionPaths = {
  api: 'app/api/**/*.{ts,tsx,js}',
  lib: 'lib/**/*.{ts,tsx,js}',
  components: 'components/**/*.{ts,tsx,js}',
  middleware: 'middleware.ts'
};

// Exclude test files and non-production code
const excludePaths = [
  '**/node_modules/**',
  '**/.next/**',
  '**/build/**',
  '**/dist/**',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/__tests__/**',
  '**/scripts/**',
  '**/docs/**',
  '**/*.md',
  '**/mocks/**'
];

// Files that should keep debug statements
const allowedDebugFiles = [
  'logger.ts',
  'enhanced-logger.ts',
  'enhanced-logger.client.ts',
  'enhanced-logger.server.ts',
  'error-handling.ts',
  'error-boundaries/**',
  'debug-utils.ts'
];

console.log('🚨 Production Debug Hotspots Analysis\n');

const results = {};
let totalDebugStatements = 0;

// Analyze each production area
Object.entries(productionPaths).forEach(([area, pattern]) => {
  const files = glob.sync(pattern, {
    ignore: excludePaths,
    nodir: true
  });
  
  results[area] = {
    files: 0,
    debugStatements: 0,
    criticalFiles: []
  };
  
  files.forEach(file => {
    // Skip allowed debug files
    if (allowedDebugFiles.some(allowed => file.includes(allowed))) {
      return;
    }
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Count console statements
    const consoleMatches = (content.match(/console\.(log|error|warn|debug|info)/g) || []).length;
    
    // Count debug flags
    const debugFlags = (content.match(/debug\s*=\s*true|DEBUG.*true|process\.env\.DEBUG/g) || []).length;
    
    const totalDebug = consoleMatches + debugFlags;
    
    if (totalDebug > 0) {
      results[area].files++;
      results[area].debugStatements += totalDebug;
      totalDebugStatements += totalDebug;
      
      results[area].criticalFiles.push({
        file: file.replace(process.cwd() + '/', ''),
        statements: totalDebug,
        types: {
          console: consoleMatches,
          debugFlags: debugFlags
        }
      });
    }
  });
  
  // Sort by number of debug statements
  results[area].criticalFiles.sort((a, b) => b.statements - a.statements);
});

// Display results
Object.entries(results).forEach(([area, data]) => {
  console.log(`${colors.cyan}${area.toUpperCase()}${colors.reset}`);
  console.log(`Files with debug code: ${data.files}`);
  console.log(`Total debug statements: ${data.debugStatements}`);
  
  if (data.criticalFiles.length > 0) {
    console.log('\nTop files:');
    data.criticalFiles.slice(0, 5).forEach(({ file, statements, types }) => {
      console.log(`  ${colors.red}${file}${colors.reset}`);
      console.log(`  └─ ${statements} statements (${types.console} console, ${types.debugFlags} debug flags)`);
    });
  }
  
  console.log('');
});

// Identify most critical files
console.log(`${colors.yellow}HIGHEST PRIORITY FILES${colors.reset}`);
const allFiles = Object.values(results).flatMap(r => r.criticalFiles);
allFiles.sort((a, b) => b.statements - a.statements);

allFiles.slice(0, 10).forEach(({ file, statements }) => {
  console.log(`${colors.red}${file}${colors.reset} - ${statements} debug statements`);
});

// Summary
console.log(`\n${colors.cyan}SUMMARY${colors.reset}`);
console.log(`Total production debug statements: ${colors.red}${totalDebugStatements}${colors.reset}`);

// Recommendations
console.log(`\n${colors.green}RECOMMENDATIONS${colors.reset}`);
console.log('1. Start with API routes - these are user-facing and should not have debug logs');
console.log('2. Clean lib/marketplace/ - this is critical production code');
console.log('3. Review components for any console.log statements');
console.log('4. Replace console.log with proper logging using enhanced-logger');

// Generate removal script
console.log(`\n${colors.yellow}TO REMOVE DEBUG STATEMENTS${colors.reset}`);
console.log('Run the following command to remove debug statements:');
console.log(`${colors.green}node scripts/remove-debug-from-prod.js remove --dry-run${colors.reset}`);
console.log('\nTo apply changes (after dry run):');
console.log(`${colors.green}node scripts/remove-debug-from-prod.js remove${colors.reset}`);