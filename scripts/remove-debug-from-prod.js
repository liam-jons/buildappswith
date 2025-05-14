#!/usr/bin/env node

/**
 * Script to identify and remove debug information from production code
 * Removes console.log statements, debug flags, and unnecessary debugging code
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Patterns to search for and remove
const debugPatterns = [
  {
    name: 'console.log statements',
    pattern: /^\s*console\.log\([^)]*\);?\s*$/gm,
    replacement: ''
  },
  {
    name: 'console.error for debugging (not actual errors)',
    pattern: /^\s*console\.error\(\s*['"`]DEBUG:.*?\);?\s*$/gm,
    replacement: ''
  },
  {
    name: 'console.warn for debugging',
    pattern: /^\s*console\.warn\(\s*['"`]DEBUG:.*?\);?\s*$/gm,
    replacement: ''
  },
  {
    name: 'debug flags',
    pattern: /^\s*const\s+debug\s*=\s*true;?\s*$/gm,
    replacement: 'const debug = false;'
  },
  {
    name: 'DEBUG environment checks',
    pattern: /process\.env\.DEBUG\s*===?\s*['"`]true['"`]/g,
    replacement: 'false'
  }
];

// Directories and files to exclude
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
  '**/scripts/debug-*.js',
  '**/docs/**',
  '**/*.md'
];

// Specific files that should keep their debug statements
const keepDebugFiles = [
  'logger.ts',
  'enhanced-logger.ts',
  'enhanced-logger.client.ts',
  'enhanced-logger.server.ts',
  'error-handling.ts',
  'sentry-integration.ts'
];

// Mode: 'identify' or 'remove'
const mode = process.argv[2] || 'identify';
const dryRun = process.argv.includes('--dry-run');

console.log(`🔍 ${mode === 'identify' ? 'Identifying' : 'Removing'} debug information from production code...`);
if (dryRun) {
  console.log(`${colors.yellow}Running in DRY RUN mode - no files will be modified${colors.reset}\n`);
}

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: excludePaths,
  nodir: true
});

let totalMatches = 0;
let filesWithDebug = [];
let modifiedFiles = [];

files.forEach(file => {
  const fileName = path.basename(file);
  
  // Skip files that should keep debug statements
  if (keepDebugFiles.includes(fileName)) {
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  let fileMatches = 0;
  let changes = [];
  
  debugPatterns.forEach(({ name, pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      fileMatches += matches.length;
      
      if (mode === 'remove') {
        newContent = newContent.replace(pattern, replacement);
      }
      
      changes.push({
        pattern: name,
        count: matches.length,
        examples: matches.slice(0, 3)
      });
    }
  });
  
  if (fileMatches > 0) {
    totalMatches += fileMatches;
    filesWithDebug.push({
      file,
      matches: fileMatches,
      changes
    });
    
    if (mode === 'remove' && newContent !== content) {
      if (!dryRun) {
        fs.writeFileSync(file, newContent, 'utf8');
      }
      modifiedFiles.push(file);
    }
  }
});

// Generate report
console.log('\n📊 Summary:');
console.log(`Total files scanned: ${files.length}`);
console.log(`Files with debug code: ${filesWithDebug.length}`);
console.log(`Total debug statements: ${totalMatches}`);

if (mode === 'remove') {
  console.log(`Files modified: ${modifiedFiles.length}`);
}

// Show detailed results
if (filesWithDebug.length > 0) {
  console.log('\n📝 Detailed Results:');
  
  filesWithDebug.forEach(({ file, matches, changes }) => {
    console.log(`\n${colors.blue}${file}${colors.reset} (${matches} matches)`);
    
    changes.forEach(({ pattern, count, examples }) => {
      console.log(`  ${pattern}: ${count}`);
      if (mode === 'identify') {
        examples.forEach(example => {
          console.log(`    ${colors.yellow}${example.trim()}${colors.reset}`);
        });
      }
    });
  });
}

// Production-specific recommendations
console.log('\n🚨 Production Debug Hotspots:');

const productionFiles = filesWithDebug.filter(({ file }) => 
  file.includes('/app/api/') || 
  file.includes('/lib/') || 
  file.includes('/components/')
);

if (productionFiles.length > 0) {
  productionFiles.slice(0, 10).forEach(({ file, matches }) => {
    console.log(`  ${colors.red}${file}${colors.reset} - ${matches} debug statements`);
  });
  
  if (productionFiles.length > 10) {
    console.log(`  ... and ${productionFiles.length - 10} more files`);
  }
}

// Next steps
console.log('\n✅ Next Steps:');

if (mode === 'identify') {
  console.log('1. Review the identified debug statements');
  console.log('2. Run with "remove" argument to clean them up:');
  console.log(`   ${colors.green}node scripts/remove-debug-from-prod.js remove${colors.reset}`);
  console.log('3. Use --dry-run flag to preview changes:');
  console.log(`   ${colors.green}node scripts/remove-debug-from-prod.js remove --dry-run${colors.reset}`);
} else {
  console.log('1. Review the changes in git:');
  console.log(`   ${colors.green}git diff${colors.reset}`);
  console.log('2. Run tests to ensure nothing broke:');
  console.log(`   ${colors.green}pnpm test${colors.reset}`);
  console.log('3. Commit the changes:');
  console.log(`   ${colors.green}git commit -m "Remove debug statements from production code"${colors.reset}`);
}

// Create a detailed log file
const logFileName = `debug-removal-${Date.now()}.json`;
const logPath = path.join(__dirname, 'logs', logFileName);

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

fs.writeFileSync(logPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  mode,
  dryRun,
  summary: {
    totalFiles: files.length,
    filesWithDebug: filesWithDebug.length,
    totalMatches,
    modifiedFiles: modifiedFiles.length
  },
  details: filesWithDebug
}, null, 2));

console.log(`\n📄 Detailed log saved to: ${colors.blue}${logPath}${colors.reset}`);

// Exit with appropriate code
if (mode === 'identify') {
  // In identify mode, exit with 0 to indicate success
  process.exit(0);
} else {
  // In remove mode, exit with non-zero if there were issues
  process.exit(modifiedFiles.length !== filesWithDebug.length ? 1 : 0);
}