#!/usr/bin/env node

/**
 * Pre-commit Import Check
 * 
 * This script checks for non-standard imports in staged files
 * and can be used as a pre-commit hook to enforce import standards.
 * 
 * Usage:
 *   - As a standalone script: node scripts/pre-commit-import-check.js
 *   - As a pre-commit hook: npx lint-staged
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

// Configuration
const VERBOSE = process.argv.includes('--verbose');
const FIX = process.argv.includes('--fix');

console.log(`${colors.bright}${colors.cyan}=== Import Standards Check ===${colors.reset}\n`);

/**
 * Get staged files using git
 * @returns {string[]} Array of staged file paths
 */
function getStagedFiles() {
  try {
    // Get list of staged files that are TypeScript or TSX files
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR "*.ts" "*.tsx"', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file);
  } catch (error) {
    console.error(`${colors.red}Error getting staged files: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Check a file for non-standard imports
 * @param {string} filePath - Path to the file to check
 * @returns {Object} Object containing issues found
 */
function checkFile(filePath) {
  const issues = {
    directUiImports: [],
    directComponentImports: [],
    validationTierBadgeIssues: []
  };
  
  if (!fs.existsSync(filePath)) {
    return issues;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for direct UI component imports
  // Pattern: import { Button } from '@/components/ui/core/button';
  const uiImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/core\/([a-z-]+)['"];/g;
  let uiMatch;
  
  while ((uiMatch = uiImportRegex.exec(content)) !== null) {
    const components = uiMatch[1].trim().split(/\s*,\s*/);
    const importPath = uiMatch[2];
    
    issues.directUiImports.push({
      components,
      importPath,
      line: content.substring(0, uiMatch.index).split('\n').length
    });
  }
  
  // Check for direct component imports
  // Pattern: import { ComponentName } from '@/components/domain/component-name';
  const componentImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/([a-z-]+)\/([a-z-]+)['"];/g;
  let componentMatch;
  
  while ((componentMatch = componentImportRegex.exec(content)) !== null) {
    // Skip UI core imports which are handled separately
    if (componentMatch[2] === 'ui' && componentMatch[3] === 'core') continue;
    
    // Skip subdirectory imports like 'ui'
    if (componentMatch[3] === 'ui') continue;
    
    const components = componentMatch[1].trim().split(/\s*,\s*/);
    const domain = componentMatch[2];
    const importPath = componentMatch[3];
    
    issues.directComponentImports.push({
      components,
      domain,
      importPath,
      line: content.substring(0, componentMatch.index).split('\n').length
    });
  }
  
  // Check for ValidationTierBadge imports
  // Pattern: import { ValidationTierBadge } from '@/components/profile/validation-tier-badge';
  const validationTierRegex = /import\s+{\s*ValidationTierBadge\s*}\s+from\s+['"]@\/components\/profile\/(ui\/)?validation-tier-badge['"];/g;
  let validationMatch;
  
  while ((validationMatch = validationTierRegex.exec(content)) !== null) {
    issues.validationTierBadgeIssues.push({
      line: content.substring(0, validationMatch.index).split('\n').length
    });
  }
  
  return issues;
}

/**
 * Fix non-standard imports in a file
 * @param {string} filePath - Path to the file to fix
 * @param {Object} issues - Issues to fix
 */
function fixFile(filePath, issues) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix ValidationTierBadge imports
  if (issues.validationTierBadgeIssues.length > 0) {
    const validationTierRegex = /import\s+{\s*ValidationTierBadge\s*}\s+from\s+['"]@\/components\/profile\/(ui\/)?validation-tier-badge['"];/g;
    content = content.replace(
      validationTierRegex,
      'import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";'
    );
    modified = true;
  }
  
  // Run standardize-imports.js script to fix other issues
  if (issues.directUiImports.length > 0 || issues.directComponentImports.length > 0) {
    try {
      execSync(`node scripts/standardize-imports.js --fix --dir=${path.dirname(filePath)}`, {
        stdio: VERBOSE ? 'inherit' : 'ignore'
      });
      modified = true;
    } catch (error) {
      console.error(`${colors.red}Error running standardize-imports.js: ${error.message}${colors.reset}`);
    }
  }
  
  return modified;
}

/**
 * Main function
 */
async function main() {
  try {
    // Get staged files
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
      console.log(`${colors.yellow}No TypeScript files staged for commit.${colors.reset}`);
      process.exit(0);
    }
    
    console.log(`${colors.yellow}Checking ${stagedFiles.length} staged files for non-standard imports...${colors.reset}\n`);
    
    let totalIssues = 0;
    let filesWithIssues = 0;
    let fixedFiles = 0;
    
    // Check each file
    for (const file of stagedFiles) {
      const issues = checkFile(file);
      
      const totalFileIssues = 
        issues.directUiImports.length + 
        issues.directComponentImports.length + 
        issues.validationTierBadgeIssues.length;
      
      if (totalFileIssues > 0) {
        console.log(`${colors.yellow}Issues in ${file}:${colors.reset}`);
        
        if (issues.directUiImports.length > 0) {
          console.log(`  ${colors.yellow}${issues.directUiImports.length} direct UI component imports${colors.reset}`);
          if (VERBOSE) {
            issues.directUiImports.forEach(issue => {
              console.log(`    Line ${issue.line}: import { ${issue.components.join(', ')} } from '@/components/ui/core/${issue.importPath}';`);
            });
          }
        }
        
        if (issues.directComponentImports.length > 0) {
          console.log(`  ${colors.yellow}${issues.directComponentImports.length} direct component imports${colors.reset}`);
          if (VERBOSE) {
            issues.directComponentImports.forEach(issue => {
              console.log(`    Line ${issue.line}: import { ${issue.components.join(', ')} } from '@/components/${issue.domain}/${issue.importPath}';`);
            });
          }
        }
        
        if (issues.validationTierBadgeIssues.length > 0) {
          console.log(`  ${colors.yellow}${issues.validationTierBadgeIssues.length} ValidationTierBadge import issues${colors.reset}`);
          if (VERBOSE) {
            issues.validationTierBadgeIssues.forEach(issue => {
              console.log(`    Line ${issue.line}: import { ValidationTierBadge } from '@/components/profile/validation-tier-badge';`);
            });
          }
        }
        
        totalIssues += totalFileIssues;
        filesWithIssues++;
        
        if (FIX) {
          const fixed = fixFile(file, issues);
          if (fixed) {
            console.log(`  ${colors.green}✓ Fixed issues in ${file}${colors.reset}`);
            fixedFiles++;
            
            // Re-stage the file if it was modified
            execSync(`git add ${file}`);
          }
        }
      } else if (VERBOSE) {
        console.log(`${colors.green}✓ No issues in ${file}${colors.reset}`);
      }
    }
    
    // Print summary
    console.log(`\n${colors.bright}${colors.cyan}=== Import Check Summary ===${colors.reset}`);
    console.log(`Files checked: ${stagedFiles.length}`);
    console.log(`Files with issues: ${filesWithIssues}`);
    console.log(`Total issues found: ${totalIssues}`);
    
    if (FIX) {
      console.log(`Files fixed: ${fixedFiles}`);
    } else if (totalIssues > 0) {
      console.log(`\n${colors.yellow}To fix these issues, run:${colors.reset} node scripts/pre-commit-import-check.js --fix`);
    }
    
    // Exit with error if issues were found and not fixed
    if (totalIssues > 0 && !FIX) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();