#!/usr/bin/env node
/**
 * Logger Migration Script
 * 
 * This script automatically updates imports from enhanced-logger to the new unified logger
 * and identifies files that may need additional manual review.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== Logger Migration Script ===${colors.reset}`);
console.log(`Finding and updating references to enhanced-logger...`);

// Search patterns
const IMPORT_PATTERN = /(import\s+(?:(?:\{[^}]*\})|(?:[^{}\s,]+))(?:\s*,\s*(?:(?:\{[^}]*\})|(?:[^{}\s,]+)))*\s+from\s+['"])(@\/lib\/enhanced-logger|\.\/enhanced-logger)(['"])/g;
const REQUIRE_PATTERN = /(const\s+(?:(?:\{[^}]*\})|(?:[^{}\s,]+))(?:\s*,\s*(?:(?:\{[^}]*\})|(?:[^{}\s,]+)))*\s+=\s+require\(['"])(@\/lib\/enhanced-logger|\.\/enhanced-logger)(['"])/g;

// Complex pattern indicators
const COMPLEX_PATTERNS = [
  'ErrorSeverity', 
  'ErrorCategory', 
  'EnhancedLogger', 
  'enhancedLogger.',
  'new EnhancedLogger',
  'createDomainLogger'
];

// Find all TypeScript and JavaScript files, excluding generated files and node_modules
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  ignore: [
    'node_modules/**', 
    '**/dist/**', 
    '.next/**', 
    '**/scripts/migrate-logger.js',
    'scripts/migrate-logger.js',
    '**/enhanced-logger.client.ts',
    '**/enhanced-logger.server.ts',
    '**/enhanced-logger.ts'
  ],
});

// Initialize counters and lists
let updatedFiles = 0;
let unchangedFiles = 0;
let complexFiles = [];

// Process each file
for (const file of files) {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  let origContent = content;
  let isComplex = false;

  // Check if this file imports enhanced-logger
  const hasEnhancedLoggerImport = content.includes('@/lib/enhanced-logger') || 
                                 content.includes('./enhanced-logger');

  if (hasEnhancedLoggerImport) {
    console.log(`${colors.blue}Processing ${file}...${colors.reset}`);

    // Replace import declarations
    content = content.replace(IMPORT_PATTERN, (match, prefix, importPath, suffix) => {
      return `${prefix}${importPath.replace('enhanced-logger', 'logger')}${suffix}`;
    });

    // Replace require statements
    content = content.replace(REQUIRE_PATTERN, (match, prefix, importPath, suffix) => {
      return `${prefix}${importPath.replace('enhanced-logger', 'logger')}${suffix}`;
    });

    // Check for complex usage patterns
    for (const pattern of COMPLEX_PATTERNS) {
      if (content.includes(pattern)) {
        isComplex = true;
        console.log(`  ${colors.yellow}⚠️  Contains complex pattern: ${pattern}${colors.reset}`);
      }
    }

    // Write back if changed
    if (content !== origContent) {
      fs.writeFileSync(filePath, content);
      updatedFiles++;
      console.log(`  ${colors.green}✓ Updated imports${colors.reset}`);
    } else {
      unchangedFiles++;
      console.log(`  ${colors.yellow}⚠️ No changes made${colors.reset}`);
    }

    // Add to complex files list if needed
    if (isComplex) {
      complexFiles.push({
        path: file,
        patterns: COMPLEX_PATTERNS.filter(pattern => content.includes(pattern))
      });
    }
  }
}

// Generate report
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const reportPath = path.resolve(`logger-migration-report-${timestamp}.md`);

const reportContent = `# Logger Migration Report
Generated: ${new Date().toLocaleString()}

## Summary
- Total files processed: ${files.length}
- Files with updated imports: ${updatedFiles}
- Files with no changes: ${unchangedFiles}
- Files that may need manual review: ${complexFiles.length}

## Files Needing Manual Review

${complexFiles.map(file => `### ${file.path}
- Complex patterns found: ${file.patterns.join(', ')}
`).join('\n')}

## Next Steps
1. Check files listed above for manual review
2. Test the application to ensure logger functionality is maintained
3. Run build to verify no errors are introduced
`;

fs.writeFileSync(reportPath, reportContent);

// Print summary
console.log(`\n${colors.cyan}=== Migration Summary ===${colors.reset}`);
console.log(`Total files processed: ${files.length}`);
console.log(`${colors.green}Files with updated imports: ${updatedFiles}${colors.reset}`);
console.log(`${colors.yellow}Files that may need manual review: ${complexFiles.length}${colors.reset}`);
console.log(`\nReport written to: ${reportPath}`);
console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
console.log(`1. Review files with complex patterns (see report)`);
console.log(`2. Test logger functionality in different environments`);
console.log(`3. Verify build completes without errors`);