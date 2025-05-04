#!/usr/bin/env node

/**
 * NextAuth Reference Finder
 * Version: 1.0.0
 * 
 * This script scans the codebase for remaining NextAuth references to
 * assist with the Clerk migration cleanup process.
 * 
 * Usage:
 *   node find-nextauth-refs.js [--verbose] [--json]
 * 
 * Options:
 *   --verbose: Show detailed information about each reference
 *   --json: Output in JSON format for processing by other tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SEARCH_PATTERNS = [
  'next-auth',
  'useSession',
  'getSession',
  'signIn',
  'signOut',
  'getServerSession',
  'SessionProvider',
  'NextAuth',
  'getToken',
  'getCsrfToken',
  'getProviders'
];

const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'scripts',  // Exclude our script directory
  'dist',
  'build',
  'out'
];

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const jsonOutput = args.includes('--json');

// Results storage
const results = {
  totalFiles: 0,
  filesWithReferences: 0,
  totalReferences: 0,
  references: [],
  packageJson: null,
  summary: {}
};

// Check package.json for NextAuth dependency
function checkPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const dependencies = { 
      ...packageData.dependencies, 
      ...packageData.devDependencies 
    };
    
    if (dependencies['next-auth']) {
      results.packageJson = {
        path: packagePath,
        version: dependencies['next-auth']
      };
      
      console.log(`\x1b[31m[CRITICAL]\x1b[0m Found NextAuth dependency in package.json: version ${dependencies['next-auth']}`);
    } else {
      console.log('\x1b[32m[OK]\x1b[0m No NextAuth dependency found in package.json');
    }
  } catch (error) {
    console.error('Error checking package.json:', error.message);
  }
}

// Find all references using grep
function findReferences() {
  console.log('Scanning for NextAuth references...');
  
  SEARCH_PATTERNS.forEach(pattern => {
    try {
      // Use grep to find references
      const cmd = `grep -r "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir={${EXCLUDED_DIRS.join(',')}} .`;
      const output = execSync(cmd, { encoding: 'utf8' });
      
      if (output) {
        const lines = output.trim().split('\n');
        
        results.totalReferences += lines.length;
        
        lines.forEach(line => {
          const [file, match] = line.split(':', 2);
          const remainingLine = line.substring(file.length + 1);
          
          // Store result
          results.references.push({
            file,
            pattern,
            line: remainingLine.trim(),
            critical: isCriticalReference(pattern)
          });
          
          // Update summary
          if (!results.summary[file]) {
            results.summary[file] = {
              patterns: new Set(),
              count: 0,
              critical: false
            };
            results.filesWithReferences++;
          }
          
          results.summary[file].patterns.add(pattern);
          results.summary[file].count++;
          
          if (isCriticalReference(pattern)) {
            results.summary[file].critical = true;
          }
          
          if (verbose) {
            const criticalFlag = isCriticalReference(pattern) ? '\x1b[31m[CRITICAL]\x1b[0m' : '\x1b[33m[REFERENCE]\x1b[0m';
            console.log(`${criticalFlag} ${file}: ${remainingLine.trim()}`);
          }
        });
        
        // Update pattern count in summary
        if (!results.patternSummary) {
          results.patternSummary = {};
        }
        
        results.patternSummary[pattern] = lines.length;
      }
    } catch (error) {
      // No matches found or other error
      if (!error.message.includes('No such file or directory') && !error.message.includes('returned non-zero exit status 1')) {
        console.error(`Error searching for "${pattern}":`, error.message);
      }
    }
  });
}

// Determine if a reference is critical (likely requires code changes)
function isCriticalReference(pattern) {
  return ['useSession', 'getSession', 'getServerSession', 'SessionProvider', 'NextAuth'].includes(pattern);
}

// Display results summary
function displaySummary() {
  // Skip detailed output if JSON output is requested
  if (jsonOutput) {
    console.log(JSON.stringify(results, (key, value) => {
      // Convert Sets to arrays for JSON serialization
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    }, 2));
    return;
  }
  
  console.log('\n=== NextAuth Reference Summary ===');
  console.log(`Total files with references: ${results.filesWithReferences}`);
  console.log(`Total references found: ${results.totalReferences}`);
  
  // Display pattern counts
  if (results.patternSummary) {
    console.log('\nReferences by pattern:');
    Object.entries(results.patternSummary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([pattern, count]) => {
        const color = isCriticalReference(pattern) ? '\x1b[31m' : '\x1b[33m';
        console.log(`  ${color}${pattern}\x1b[0m: ${count}`);
      });
  }
  
  // List critical files
  const criticalFiles = Object.entries(results.summary)
    .filter(([_, info]) => info.critical)
    .map(([file, info]) => ({
      file,
      patterns: Array.from(info.patterns),
      count: info.count
    }))
    .sort((a, b) => b.count - a.count);
  
  if (criticalFiles.length > 0) {
    console.log('\n\x1b[31mCritical files requiring changes:\x1b[0m');
    criticalFiles.forEach(({ file, patterns, count }) => {
      console.log(`  ${file} (${count} references)`);
      if (verbose) {
        console.log(`    Patterns: ${patterns.join(', ')}`);
      }
    });
  }
  
  // List non-critical files
  const nonCriticalFiles = Object.entries(results.summary)
    .filter(([_, info]) => !info.critical)
    .map(([file, _]) => file);
  
  if (nonCriticalFiles.length > 0 && verbose) {
    console.log('\n\x1b[33mNon-critical files with references:\x1b[0m');
    nonCriticalFiles.forEach(file => {
      console.log(`  ${file}`);
    });
  }
  
  // Provide next steps
  console.log('\n=== Recommended Next Steps ===');
  
  if (results.packageJson) {
    console.log('1. Remove NextAuth dependency from package.json');
    console.log(`   "next-auth": "${results.packageJson.version}"`);
  }
  
  if (criticalFiles.length > 0) {
    console.log(`2. Update ${criticalFiles.length} critical files to use Clerk authentication`);
    console.log('   - Replace useSession() with useAuth()');
    console.log('   - Replace SessionProvider with ClerkProvider');
    console.log('   - Replace getServerSession with auth()');
  }
  
  console.log('\nRun this script again after making changes to verify cleanup completion.');
}

// Main execution
checkPackageJson();
findReferences();
displaySummary();
