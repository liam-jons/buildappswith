#!/usr/bin/env node

/**
 * NextAuth Cleanup Script
 * Version: 1.0.0
 * 
 * This script assists with the cleanup of NextAuth references by:
 * 1. Identifying files that need to be updated
 * 2. Generating the replacement code for NextAuth imports
 * 3. Creating a detailed report of all required changes
 * 
 * Usage:
 *   node nextauth-cleanup.js [--dry-run] [--verbose]
 * 
 * Options:
 *   --dry-run: Only show what would be changed, don't make any changes
 *   --verbose: Show detailed information about each change
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
  'scripts',
  'dist',
  'build',
  'out'
];

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');

// Results storage
const results = {
  filesToUpdate: [],
  replacementMap: {},
};

// Check package.json for NextAuth dependency
function checkPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log('package.json not found');
      return;
    }
    
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const dependencies = { 
      ...packageData.dependencies, 
      ...packageData.devDependencies 
    };
    
    if (dependencies['next-auth']) {
      console.log(`\x1b[31m[DEPENDENCY]\x1b[0m Found NextAuth dependency in package.json: version ${dependencies['next-auth']}`);
      console.log('Run the following command to remove it:');
      console.log('\x1b[36mpnpm remove next-auth\x1b[0m');
    } else {
      console.log('\x1b[32m[OK]\x1b[0m No NextAuth dependency found in package.json');
    }
  } catch (error) {
    console.error('Error checking package.json:', error.message);
  }
}

// Generate replacement for NextAuth imports
function generateReplacement(line, pattern) {
  const imports = [];
  const replacements = {
    'useSession': 'useAuth',
    'getSession': 'auth',
    'signIn': 'SignIn',
    'signOut': 'useSignOut',
    'getServerSession': 'auth',
    'SessionProvider': 'ClerkProvider',
    'NextAuth': '/* REMOVE: NextAuth */',
    'getToken': '/* REPLACE: Use auth() */',
    'getCsrfToken': '/* REPLACE: Not needed with Clerk */',
    'getProviders': '/* REPLACE: Not needed with Clerk */'
  };
  
  let replacement = line;
  
  // Check if it's an import statement
  if (line.includes('import') && line.includes('from')) {
    // Handle different import patterns
    if (line.includes('{') && line.includes('}')) {
      // Named imports: import { useSession, signIn } from "next-auth/react";
      const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+(['"])([^'"]+)['"]/);
      if (importMatch) {
        const importedItems = importMatch[1].split(',').map(item => item.trim());
        
        // Determine what to import from Clerk
        const clerkImports = [];
        const authHooksImports = [];
        
        importedItems.forEach(item => {
          if (['SignIn', 'SignOut', 'ClerkProvider'].includes(replacements[item])) {
            clerkImports.push(replacements[item]);
          } else if (['useAuth', 'useSignOut'].includes(replacements[item])) {
            authHooksImports.push(replacements[item]);
          }
        });
        
        // Generate replacement import statements
        const replacementImports = [];
        
        if (clerkImports.length > 0) {
          replacementImports.push(`import { ${clerkImports.join(', ')} } from '@clerk/nextjs';`);
        }
        
        if (authHooksImports.length > 0) {
          replacementImports.push(`import { ${authHooksImports.join(', ')} } from '@/hooks/auth';`);
        }
        
        // If we need auth function
        if (importedItems.includes('getServerSession') || importedItems.includes('getSession')) {
          replacementImports.push(`import { auth } from '@clerk/nextjs/server';`);
        }
        
        // Replace the entire line
        replacement = replacementImports.join('\n');
      }
    } else if (line.includes('from "next-auth"') || line.includes("from 'next-auth'")) {
      // Default import: import NextAuth from "next-auth";
      replacement = `/* REMOVE: NextAuth import */`;
    }
  } else if (line.includes('useSession')) {
    // Replace useSession() calls with useAuth() or useState hooks
    replacement = line.replace(/useSession\(\)/g, 'useAuth()');
    replacement = replacement.replace(/const\s+{([^}]+)}\s+=\s+useSession\(\)/g, 'const { $1 } = useAuth()');
  } else if (line.includes('getServerSession')) {
    // Replace getServerSession calls with auth()
    replacement = line.replace(/getServerSession\([^)]*\)/g, 'auth()');
    replacement = replacement.replace(/await\s+getServerSession\([^)]*\)/g, 'auth()');
  } else if (line.includes('SessionProvider')) {
    // Replace SessionProvider with ClerkProvider
    replacement = line.replace(/SessionProvider/g, 'ClerkProvider');
  }
  
  return replacement;
}

// Find files with NextAuth references
function findNextAuthFiles() {
  console.log('Scanning for NextAuth references...');
  
  for (const pattern of SEARCH_PATTERNS) {
    try {
      // Use grep to find references
      const cmd = `grep -r "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir={${EXCLUDED_DIRS.join(',')}} .`;
      const output = execSync(cmd, { encoding: 'utf8' });
      
      if (output) {
        const lines = output.trim().split('\n');
        
        lines.forEach(line => {
          const [filePath, match] = line.split(':', 2);
          
          // Store the file path for updating
          if (!results.filesToUpdate.includes(filePath)) {
            results.filesToUpdate.push(filePath);
          }
          
          if (verbose) {
            console.log(`Found reference in ${filePath}: ${match}`);
          }
        });
      }
    } catch (error) {
      // No matches found or other error
      if (!error.message.includes('No such file or directory') && !error.message.includes('returned non-zero exit status 1')) {
        console.error(`Error searching for "${pattern}":`, error.message);
      }
    }
  }
  
  console.log(`Found ${results.filesToUpdate.length} files with NextAuth references`);
}

// Analyze files and generate replacement suggestions
function analyzeFiles() {
  console.log('\nAnalyzing files and generating replacement suggestions...');
  
  results.filesToUpdate.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      const replacements = [];
      
      lines.forEach((line, index) => {
        for (const pattern of SEARCH_PATTERNS) {
          if (line.includes(pattern)) {
            const replacement = generateReplacement(line, pattern);
            
            if (replacement !== line) {
              replacements.push({
                lineNumber: index + 1,
                original: line,
                replacement,
              });
              break; // Only generate one replacement per line
            }
          }
        }
      });
      
      if (replacements.length > 0) {
        results.replacementMap[filePath] = replacements;
      }
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error.message);
    }
  });
}

// Generate a detailed report
function generateReport() {
  console.log('\n=== NextAuth Cleanup Report ===');
  console.log(`Found ${results.filesToUpdate.length} files with NextAuth references`);
  console.log(`Generated replacements for ${Object.keys(results.replacementMap).length} files`);
  
  // Create a report directory if it doesn't exist
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
  }
  
  // Create a report file with all replacements
  const reportPath = path.join(reportDir, 'nextauth-cleanup-report.md');
  
  let reportContent = '# NextAuth Cleanup Report\n\n';
  reportContent += `Generated on ${new Date().toISOString()}\n\n`;
  reportContent += `## Summary\n\n`;
  reportContent += `- Files with NextAuth references: ${results.filesToUpdate.length}\n`;
  reportContent += `- Files with replacement suggestions: ${Object.keys(results.replacementMap).length}\n\n`;
  
  reportContent += `## Replacements\n\n`;
  
  Object.entries(results.replacementMap).forEach(([filePath, replacements]) => {
    reportContent += `### ${filePath}\n\n`;
    
    replacements.forEach(({ lineNumber, original, replacement }) => {
      reportContent += `Line ${lineNumber}:\n\n`;
      reportContent += '```typescript\n';
      reportContent += `// Original\n${original}\n\n`;
      reportContent += `// Replacement\n${replacement}\n`;
      reportContent += '```\n\n';
    });
  });
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

// Main execution
checkPackageJson();
findNextAuthFiles();
analyzeFiles();
generateReport();

// Display next steps
console.log('\n=== Next Steps ===');
console.log('1. Review the detailed report in reports/nextauth-cleanup-report.md');
console.log('2. Update each file with the suggested replacements');
console.log('3. Run the find-nextauth-refs.js script again to verify all references have been removed');
console.log('4. Remove the NextAuth dependency from package.json');
console.log('5. Remove any NextAuth configuration files');
