#!/usr/bin/env node

/**
 * Import Standardization Script
 * 
 * This script analyzes and fixes non-standard import patterns in the codebase.
 * It focuses on standardizing imports to use barrel files and fixing direct imports.
 * 
 * Usage: node scripts/standardize-imports.js [--analyze] [--preview] [--fix] [--verbose] [--dir=path/to/directory]
 * 
 * Options:
 * --analyze: Only analyze imports and report issues without making changes
 * --preview: Show changes that would be made without actually changing files
 * --fix: Apply fixes to found issues (default if no mode is specified)
 * --verbose: Show detailed logs
 * --dir: Specify a directory to process (default: all directories)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const analyzeMode = args.includes('--analyze');
const previewMode = args.includes('--preview');
const fixMode = args.includes('--fix') || (!analyzeMode && !previewMode);
const verbose = args.includes('--verbose');
const dirArg = args.find(arg => arg.startsWith('--dir='));
const targetDir = dirArg ? dirArg.split('=')[1] : null;

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Configuration
const ROOT_DIR = process.cwd();
const COMPONENTS_DIR = path.join(ROOT_DIR, 'components');

// Track statistics
const stats = {
  filesAnalyzed: 0,
  filesWithIssues: 0,
  issuesFound: 0,
  issuesFixed: 0,
  componentImportIssues: 0,
  uiImportIssues: 0,
  validationTierBadgeIssues: 0
};

console.log(`${colors.bright}${colors.cyan}=== Import Standardization Tool ===${colors.reset}`);
console.log(`Mode: ${analyzeMode ? 'Analyze' : previewMode ? 'Preview' : 'Fix'}`);
if (targetDir) {
  console.log(`Target directory: ${targetDir}`);
}
console.log();

/**
 * Get all components exported from barrel files
 * @returns {Map<string, Set<string>>} Map of barrel paths to sets of exported component names
 */
function getBarrelExports() {
  const barrels = new Map();
  
  // Find all barrel files
  const barrelFiles = glob.sync('components/**/index.ts', { cwd: ROOT_DIR });
  
  barrelFiles.forEach(barrelFile => {
    const fullPath = path.join(ROOT_DIR, barrelFile);
    const barrelDir = path.dirname(barrelFile);
    const content = fs.readFileSync(fullPath, 'utf8');
    const exports = new Set();
    
    // Match default exports: export { default as ComponentName } from './component';
    const defaultExportRegex = /export\s*{\s*default\s+as\s+(\w+)\s*}\s*from\s+['"](\.\/.*)['"]/g;
    let match;
    while ((match = defaultExportRegex.exec(content)) !== null) {
      exports.add(match[1]);
    }
    
    // Match named exports: export { ComponentName } from './component';
    const namedExportRegex = /export\s*{\s*(?!default)(\w+)\s*}\s*from\s+['"](\.\/.*)['"]/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.add(match[1]);
    }
    
    // Match star exports: export * from './component';
    const starExportRegex = /export\s*\*\s*from\s+['"](\.\/.+)['"]/g;
    while ((match = starExportRegex.exec(content)) !== null) {
      // For star exports, we need to look at the actual exported component
      const exportedFile = path.join(path.dirname(fullPath), match[1]);
      
      // Handle .ts or .tsx extensions
      let resolvedPath = exportedFile;
      if (!fs.existsSync(resolvedPath) && !resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx')) {
        if (fs.existsSync(`${resolvedPath}.ts`)) {
          resolvedPath = `${resolvedPath}.ts`;
        } else if (fs.existsSync(`${resolvedPath}.tsx`)) {
          resolvedPath = `${resolvedPath}.tsx`;
        }
      }
      
      if (fs.existsSync(resolvedPath)) {
        const componentContent = fs.readFileSync(resolvedPath, 'utf8');
        
        // Look for named exports in the component file
        const compNamedExportRegex = /export\s+const\s+(\w+)/g;
        let compMatch;
        while ((compMatch = compNamedExportRegex.exec(componentContent)) !== null) {
          exports.add(compMatch[1]);
        }
        
        // Look for default exports in the component file
        const compDefaultExportRegex = /export\s+default\s+(\w+)|export\s+default\s+function\s+(\w+)/g;
        while ((compMatch = compDefaultExportRegex.exec(componentContent)) !== null) {
          const name = compMatch[1] || compMatch[2];
          if (name) exports.add(name);
        }
      }
    }
    
    barrels.set(barrelDir, exports);
  });
  
  if (verbose) {
    console.log(`${colors.blue}Found ${barrelFiles.length} barrel files${colors.reset}`);
    for (const [barrel, exports] of barrels.entries()) {
      console.log(`  ${barrel}: ${Array.from(exports).join(', ')}`);
    }
    console.log();
  }
  
  return barrels;
}

/**
 * Find the barrel file that exports a component
 * @param {string} componentName - Name of the component
 * @param {Map<string, Set<string>>} barrels - Map of barrel paths to exported components
 * @returns {string|null} Path to the barrel that exports the component, or null if not found
 */
function findBarrelForComponent(componentName, barrels) {
  for (const [barrel, exports] of barrels.entries()) {
    if (exports.has(componentName)) {
      return barrel;
    }
  }
  return null;
}

/**
 * Analyze and fix imports in a file
 * @param {string} filePath - Path to the file to analyze
 * @param {Map<string, Set<string>>} barrels - Map of barrel paths to exported components
 */
function processFile(filePath, barrels) {
  const fullPath = path.join(ROOT_DIR, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let modified = false;
  
  stats.filesAnalyzed++;
  
  // Map to track combined imports
  const combinedImports = new Map();
  
  // 1. Fix direct UI component imports
  // Pattern: import { Button } from '@/components/ui/core/button';
  // Should be: import { Button } from '@/components/ui/core';
  const uiImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui\/core\/([a-z-]+)['"];/g;
  let uiMatch;
  
  while ((uiMatch = uiImportRegex.exec(originalContent)) !== null) {
    const componentList = uiMatch[1].trim().split(/\s*,\s*/);
    
    // Add components to the combined imports map
    for (const component of componentList) {
      const componentName = component.trim();
      
      // Skip if already tracked
      if (combinedImports.has(componentName)) continue;
      
      const barrel = 'components/ui/core';
      
      if (!combinedImports.has(barrel)) {
        combinedImports.set(barrel, new Set());
      }
      combinedImports.get(barrel).add(componentName);
      
      stats.uiImportIssues++;
      stats.issuesFound++;
    }
    
    if (verbose) {
      console.log(`${colors.yellow}Found UI import in ${filePath}:${colors.reset} ${uiMatch[0].trim()}`);
    }
  }
  
  // 2. Fix direct component imports for domain components
  // Pattern: import { ComponentName } from '@/components/domain/component-name';
  // Should be: import { ComponentName } from '@/components/domain';
  const componentImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/([a-z-]+)\/([a-z-]+)['"];/g;
  let componentMatch;
  
  while ((componentMatch = componentImportRegex.exec(originalContent)) !== null) {
    // Skip UI core imports which are handled separately
    if (componentMatch[2] === 'ui' && componentMatch[3] === 'core') continue;
    
    // Skip subdirectory imports like 'ui'
    if (componentMatch[3] === 'ui') continue;
    
    const componentList = componentMatch[1].trim().split(/\s*,\s*/);
    const domain = componentMatch[2];
    
    // Add components to the combined imports map
    for (const component of componentList) {
      const componentName = component.trim();
      
      // Skip if already tracked
      if (combinedImports.has(componentName)) continue;
      
      const barrel = `components/${domain}`;
      
      if (!combinedImports.has(barrel)) {
        combinedImports.set(barrel, new Set());
      }
      combinedImports.get(barrel).add(componentName);
      
      stats.componentImportIssues++;
      stats.issuesFound++;
    }
    
    if (verbose) {
      console.log(`${colors.yellow}Found component import in ${filePath}:${colors.reset} ${componentMatch[0].trim()}`);
    }
  }
  
  // 3. Fix ValidationTierBadge imports
  // This is a special case where the component moved from profile to trust
  if (content.includes('@/components/profile/validation-tier-badge') || 
      content.includes('@/components/profile/ui/validation-tier-badge')) {
    
    // Handle import with braces
    const validationTierRegex = /import\s+{\s*ValidationTierBadge\s*}\s+from\s+['"]@\/components\/profile\/(ui\/)?validation-tier-badge['"];/g;
    if (validationTierRegex.test(content)) {
      content = content.replace(
        validationTierRegex,
        'import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";'
      );
      modified = true;
      stats.validationTierBadgeIssues++;
      stats.issuesFound++;
      stats.issuesFixed++;
      
      if (verbose || previewMode) {
        console.log(`${colors.yellow}Found ValidationTierBadge import in ${filePath}${colors.reset}`);
      }
    }
  }
  
  // 4. Apply combined imports
  if (combinedImports.size > 0) {
    // Create new import statements
    const newImports = [];
    
    for (const [barrel, components] of combinedImports.entries()) {
      if (components.size === 0) continue;
      
      const componentNames = Array.from(components).sort().join(', ');
      const importPath = `@/${barrel}`;
      
      newImports.push(`import { ${componentNames} } from "${importPath}";`);
    }
    
    if (newImports.length > 0) {
      // Process direct UI imports first
      if (combinedImports.has('components/ui/core')) {
        const uiComponents = Array.from(combinedImports.get('components/ui/core')).sort().join(', ');
        
        // Replace all UI component imports
        const allUiPattern = new RegExp(
          `import\\s+{[^}]+}\\s+from\\s+['"]@\\/components\\/ui\\/core\\/[a-z-]+['"];`,
          'g'
        );
        const matches = content.match(allUiPattern) || [];
        
        if (matches.length > 0) {
          // Replace first occurrence with new combined import
          content = content.replace(
            allUiPattern,
            `import { ${uiComponents} } from "@/components/ui/core";`
          );
          
          // Remove any additional matches
          for (let i = 1; i < matches.length; i++) {
            content = content.replace(matches[i], '');
          }
          
          modified = true;
          stats.issuesFixed += matches.length;
        }
      }
      
      // Process domain component imports
      for (const [barrel, components] of combinedImports.entries()) {
        if (barrel === 'components/ui/core') continue; // Already handled
        
        const domain = barrel.split('/')[1];
        const componentNames = Array.from(components);
        
        // Create pattern to find imports for these components
        for (const component of componentNames) {
          const componentPattern = new RegExp(
            `import\\s+{[^}]*\\b${component}\\b[^}]*}\\s+from\\s+['"]@\\/components\\/${domain}\\/[a-z-]+['"];`,
            'g'
          );
          
          const matches = content.match(componentPattern) || [];
          
          if (matches.length > 0) {
            // Create replacement pattern
            const importPattern = `import { ${component} } from "@/${barrel}";`;
            
            // Replace all occurrences
            for (const match of matches) {
              content = content.replace(match, '');
            }
            
            // Add new import if not already present
            if (!content.includes(importPattern)) {
              const lines = content.split('\n');
              let lastImportIndex = -1;
              
              // Find the last import statement
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('import ')) {
                  lastImportIndex = i;
                }
              }
              
              if (lastImportIndex >= 0) {
                lines.splice(lastImportIndex + 1, 0, importPattern);
              } else {
                lines.unshift(importPattern);
              }
              
              content = lines.join('\n');
            }
            
            modified = true;
            stats.issuesFixed += matches.length;
          }
        }
      }
    }
  }
  
  // Check if any issues were found
  if (modified) {
    stats.filesWithIssues++;
    
    if (previewMode) {
      console.log(`${colors.cyan}Changes for ${filePath}:${colors.reset}`);
      console.log(`${colors.green}--- Original${colors.reset}`);
      console.log(originalContent.substring(0, 500) + (originalContent.length > 500 ? '...' : ''));
      console.log(`${colors.green}+++ Modified${colors.reset}`);
      console.log(content.substring(0, 500) + (content.length > 500 ? '...' : ''));
      console.log();
    }
    
    if (fixMode) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`${colors.green}✓ Fixed imports in ${filePath}${colors.reset}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Get component exports from barrel files
    const barrels = getBarrelExports();
    
    // Find files to process
    const filePatterns = targetDir
      ? [`${targetDir}/**/*.ts?(x)`]
      : ['app/**/*.ts?(x)', 'components/**/*.ts?(x)', 'lib/**/*.ts?(x)'];
    
    const filesToProcess = filePatterns.flatMap(pattern => 
      glob.sync(pattern, {
        cwd: ROOT_DIR,
        ignore: [
          '**/node_modules/**',
          '**/*.d.ts',
          '**/*.test.ts?(x)',
          '**/index.ts',
          '**/generated/**'
        ]
      })
    );
    
    console.log(`${colors.blue}Found ${filesToProcess.length} files to analyze${colors.reset}`);
    
    // Process each file
    filesToProcess.forEach(file => {
      processFile(file, barrels);
    });
    
    // Print summary
    console.log(`\n${colors.bright}${colors.cyan}=== Import Standardization Summary ===${colors.reset}`);
    console.log(`Files analyzed: ${stats.filesAnalyzed}`);
    console.log(`Files with issues: ${stats.filesWithIssues}`);
    console.log(`Issues found: ${stats.issuesFound}`);
    if (fixMode) {
      console.log(`Issues fixed: ${stats.issuesFixed}`);
    }
    
    console.log(`\nIssue breakdown:`);
    console.log(`- UI component direct imports: ${stats.uiImportIssues}`);
    console.log(`- Domain component direct imports: ${stats.componentImportIssues}`);
    console.log(`- ValidationTierBadge imports: ${stats.validationTierBadgeIssues}`);
    
    if (analyzeMode) {
      console.log(`\n${colors.yellow}To preview fixes, run:${colors.reset} node scripts/standardize-imports.js --preview`);
      console.log(`${colors.yellow}To apply fixes, run:${colors.reset} node scripts/standardize-imports.js --fix`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();