#!/usr/bin/env node

/**
 * Script to identify component imports that need to be updated to use barrel exports
 * 
 * Usage:
 *   node scripts/find-component-imports.js           # Display analysis to console
 *   node scripts/find-component-imports.js --json    # Output JSON data only (for piping)
 * 
 * This script scans the codebase for direct imports of components and identifies
 * which ones should be updated to use barrel exports.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const jsonOnly = args.includes('--json');

// Define primary directories to search
const SEARCH_DIRS = [
  'app',
  'components',
  'hooks',
  'lib'
];

// Define patterns for components that should be imported from barrel exports
const IMPORT_PATTERNS = [
  // UI Component imports
  { 
    regex: /from\s+["']@\/components\/ui\/([^\/"]*)["']/g,
    replacement: 'from "@/components/ui"',
    category: 'UI Component',
    parentDir: 'ui',
  },
  // UI Core Component imports
  { 
    regex: /from\s+["']@\/components\/ui\/core\/([^\/"]*)["']/g,
    replacement: 'from "@/components/ui"',
    category: 'UI Core Component',
    parentDir: 'ui/core',
  },
  // UI Composite Component imports
  { 
    regex: /from\s+["']@\/components\/ui\/composite\/([^\/"]*)["']/g,
    replacement: 'from "@/components/ui"', 
    category: 'UI Composite Component',
    parentDir: 'ui/composite',
  },
  // Domain-specific component imports
  {
    regex: /from\s+["']@\/components\/([^\/]+)\/([^\/"]*)["']/g,
    replacement: 'from "@/components/$1"',
    category: 'Domain Component',
    isDomain: true,
  },
  // Domain-specific UI component imports
  {
    regex: /from\s+["']@\/components\/([^\/]+)\/ui\/([^\/"]*)["']/g,
    replacement: 'from "@/components/$1"',
    category: 'Domain UI Component',
    isDomain: true,
  },
];

// Function to recursively find all TypeScript and React files
function findTsFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (item !== 'node_modules' && item !== '.next' && !item.startsWith('.')) {
        results = results.concat(findTsFiles(fullPath));
      }
    } else {
      // Only include TypeScript and React files
      if (/\.(tsx?|jsx?)$/.test(item)) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

// Log function that only outputs when not in JSON-only mode
function log(message) {
  if (!jsonOnly) {
    console.log(message);
  }
}

// Main function
function main() {
  log('Scanning codebase for component imports to update...\n');
  
  let projectRoot = process.cwd();
  
  // Ensure we're in the project root
  if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
    console.error('Error: Must run this script from the project root');
    process.exit(1);
  }
  
  let files = [];
  for (const dir of SEARCH_DIRS) {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      files = files.concat(findTsFiles(dirPath));
    }
  }
  
  log(`Found ${files.length} TypeScript/React files to scan\n`);
  
  // Track results by category
  const results = {
    total: 0,
    byPattern: {}
  };
  
  // Initialize results for each pattern
  IMPORT_PATTERNS.forEach(pattern => {
    results.byPattern[pattern.category] = {
      count: 0,
      files: {}
    };
  });

  // Scan each file
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let fileHasMatches = false;
    
    // Check each import pattern
    IMPORT_PATTERNS.forEach(pattern => {
      const matches = [...content.matchAll(pattern.regex)];
      
      if (matches.length > 0) {
        fileHasMatches = true;
        results.byPattern[pattern.category].count += matches.length;
        
        if (!results.byPattern[pattern.category].files[file]) {
          results.byPattern[pattern.category].files[file] = [];
        }
        
        matches.forEach(match => {
          let replacement;
          
          if (pattern.isDomain) {
            // For domain-specific imports, we need to extract the domain name
            const domain = match[1];
            replacement = pattern.replacement.replace('$1', domain);
          } else {
            replacement = pattern.replacement;
          }
          
          results.byPattern[pattern.category].files[file].push({
            original: match[0],
            replacement: replacement
          });
        });
      }
    });
    
    if (fileHasMatches) {
      results.total++;
    }
  });
  
  // Print results if not in JSON-only mode
  if (!jsonOnly) {
    log(`Found ${results.total} files with imports to update\n`);
    
    Object.keys(results.byPattern).forEach(category => {
      const patternResult = results.byPattern[category];
      log(`${category}: ${patternResult.count} imports to update`);
      
      Object.keys(patternResult.files).forEach(file => {
        log(`  ${file}`);
        patternResult.files[file].forEach(match => {
          log(`    ${match.original} => ${match.replacement}`);
        });
      });
      log('');
    });
    
    log('\nCreate update script with:');
    log('  node scripts/find-component-imports.js --json > scripts/update-imports.json');
  }
  
  // Output JSON for update script
  const updateData = {
    patterns: IMPORT_PATTERNS.map(pattern => ({
      regex: pattern.regex.source,
      replacement: pattern.replacement,
      isDomain: !!pattern.isDomain
    })),
    files: files.filter(file => {
      // Check if file has any matches
      const fileContent = fs.readFileSync(file, 'utf8');
      return IMPORT_PATTERNS.some(pattern => {
        const regex = new RegExp(pattern.regex.source, 'g');
        return regex.test(fileContent);
      });
    })
  };
  
  // If in JSON-only mode, just output the JSON data
  if (jsonOnly) {
    console.log(JSON.stringify(updateData, null, 2));
  }
}

main();
