#!/usr/bin/env node

/**
 * Barrel Export Analyzer
 * 
 * This script analyzes barrel export files (index.ts) for consistency and completeness.
 * It checks if all components in a directory are properly exported in the barrel file.
 * 
 * Usage: node scripts/analyze-barrel-exports.js [--detailed] [--fix]
 * 
 * Options:
 * --detailed: Show detailed analysis of each barrel file
 * --fix: Automatically fix issues by updating barrel files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const detailed = args.includes('--detailed');
const fixMode = args.includes('--fix');

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

// Statistics
const stats = {
  barrelsAnalyzed: 0,
  barrelsWithIssues: 0,
  missingExports: 0,
  inconsistentPatterns: 0,
  fixedBarrels: 0
};

console.log(`${colors.bright}${colors.cyan}=== Barrel Export Analyzer ===${colors.reset}`);
console.log(`Mode: ${fixMode ? 'Analysis & Fix' : 'Analysis Only'}\n`);

/**
 * Get component name from filename
 * @param {string} filename - The component filename
 * @returns {string} The component name in PascalCase
 */
function getComponentNameFromFile(filename) {
  const baseName = path.basename(filename, path.extname(filename));
  
  // Convert kebab-case to PascalCase
  if (baseName.includes('-')) {
    return baseName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
  
  // Already in camelCase or PascalCase
  if (/^[a-z]/.test(baseName)) {
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }
  
  return baseName;
}

/**
 * Check if a component is a UI component with a variable export
 * Used for UI components that use the "export const Component = ..." pattern
 * @param {string} filePath - Path to the component file
 * @returns {string|null} Component name or null if not a variable export
 */
function checkForVariableExport(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const variableExportMatch = content.match(/export\s+const\s+(\w+)\s*=/);
  
  if (variableExportMatch) {
    return variableExportMatch[1];
  }
  
  return null;
}

/**
 * Analyze a barrel file
 * @param {string} barrelDir - Directory containing the barrel file
 */
function analyzeBarrel(barrelDir) {
  const barrelPath = path.join(barrelDir, 'index.ts');
  
  // Skip if barrel file doesn't exist
  if (!fs.existsSync(barrelPath)) {
    return;
  }
  
  stats.barrelsAnalyzed++;
  const relativePath = path.relative(process.cwd(), barrelDir);
  
  if (detailed) {
    console.log(`${colors.bright}Analyzing barrel: ${colors.blue}${relativePath}${colors.reset}`);
  }
  
  // Get barrel content
  const barrelContent = fs.readFileSync(barrelPath, 'utf8');
  
  // Find component files in the directory
  const componentFiles = glob.sync(path.join(barrelDir, '*.{ts,tsx}'), {
    ignore: [
      path.join(barrelDir, 'index.ts'),
      path.join(barrelDir, '*.test.{ts,tsx}'),
      path.join(barrelDir, '*.spec.{ts,tsx}'),
      path.join(barrelDir, '*.d.ts')
    ]
  });
  
  // Track export patterns
  const defaultAsPattern = barrelContent.includes('export { default as');
  const starExportPattern = barrelContent.includes('export * from');
  const namedExportPattern = barrelContent.match(/export\s+{\s*(?!default)(\w+)\s*}/);
  
  // Detect inconsistent export patterns
  const hasInconsistentPatterns = 
    (defaultAsPattern && starExportPattern) || 
    (defaultAsPattern && namedExportPattern) || 
    (starExportPattern && namedExportPattern);
  
  if (hasInconsistentPatterns) {
    stats.inconsistentPatterns++;
    console.log(`${colors.yellow}⚠ Inconsistent export patterns in ${relativePath}${colors.reset}`);
    
    if (detailed) {
      console.log('  Found patterns:');
      if (defaultAsPattern) console.log('  - export { default as Component }');
      if (starExportPattern) console.log('  - export * from');
      if (namedExportPattern) console.log('  - export { Component }');
    }
  }
  
  // Check exported components
  const exportedComponents = new Set();
  
  // Extract components from "export { default as Component }"
  const defaultExportRegex = /export\s*{\s*default\s+as\s+(\w+)\s*}\s*from\s+['"](\.\/.*)['"]/g;
  let match;
  while ((match = defaultExportRegex.exec(barrelContent)) !== null) {
    exportedComponents.add(match[1]);
  }
  
  // Extract components from "export { Component }"
  const namedExportRegex = /export\s*{\s*(?!default)(\w+)\s*}\s*from\s+['"](\.\/.*)['"]/g;
  while ((match = namedExportRegex.exec(barrelContent)) !== null) {
    exportedComponents.add(match[1]);
  }
  
  // Track missing exports
  const missingExports = [];
  
  // Check each component file
  for (const file of componentFiles) {
    const fileName = path.basename(file);
    const componentName = getComponentNameFromFile(fileName);
    
    // Skip type files, etc.
    if (fileName.startsWith('types.') || fileName.startsWith('utils.') || 
        fileName.startsWith('constants.') || fileName.startsWith('helpers.')) {
      continue;
    }
    
    // Check for variable exports (common in UI components)
    const variableExportName = checkForVariableExport(file);
    const expectedName = variableExportName || componentName;
    
    // Check if component is exported
    if (starExportPattern) {
      // Star exports automatically include everything, so we're good
      continue;
    }
    
    if (!exportedComponents.has(expectedName)) {
      missingExports.push({
        file: path.relative(barrelDir, file),
        expectedName
      });
    }
  }
  
  // Report missing exports
  if (missingExports.length > 0) {
    stats.barrelsWithIssues++;
    stats.missingExports += missingExports.length;
    
    console.log(`${colors.yellow}⚠ Missing exports in ${relativePath}:${colors.reset}`);
    missingExports.forEach(({ file, expectedName }) => {
      console.log(`  - ${file} (expected export: ${expectedName})`);
    });
    
    // Fix missing exports if in fix mode
    if (fixMode && missingExports.length > 0) {
      let updatedContent = barrelContent;
      
      for (const { file, expectedName } of missingExports) {
        // Determine export pattern to use based on existing barrel
        if (defaultAsPattern) {
          // Add export { default as Component } from './component';
          const exportLine = `export { default as ${expectedName} } from './${file.replace(/\.(ts|tsx)$/, '')}';`;
          updatedContent += `\n${exportLine}`;
        } else if (namedExportPattern) {
          // Add export { Component } from './component';
          const exportLine = `export { ${expectedName} } from './${file.replace(/\.(ts|tsx)$/, '')}';`;
          updatedContent += `\n${exportLine}`;
        } else {
          // Default to star export if no pattern detected
          const exportLine = `export * from './${file.replace(/\.(ts|tsx)$/, '')}';`;
          updatedContent += `\n${exportLine}`;
        }
      }
      
      // Write updated barrel file
      fs.writeFileSync(barrelPath, updatedContent);
      console.log(`${colors.green}✓ Fixed missing exports in ${relativePath}${colors.reset}`);
      stats.fixedBarrels++;
    }
  } else if (detailed) {
    console.log(`${colors.green}✓ All components properly exported in ${relativePath}${colors.reset}`);
  }
  
  // Check for subdirectories with barrel files
  const subdirectories = fs.readdirSync(barrelDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(barrelDir, dirent.name));
  
  // Check if barrel re-exports subdirectory barrels
  for (const subdir of subdirectories) {
    const subdirName = path.basename(subdir);
    const subdirBarrelPath = path.join(subdir, 'index.ts');
    
    // Skip if subdirectory doesn't have a barrel
    if (!fs.existsSync(subdirBarrelPath)) {
      continue;
    }
    
    // Check if subdirectory barrel is re-exported
    const reExportPattern = `export * from './${subdirName}'`;
    if (!barrelContent.includes(reExportPattern)) {
      console.log(`${colors.yellow}⚠ Missing re-export for subdirectory ${subdirName} in ${relativePath}${colors.reset}`);
      
      // Fix missing re-export if in fix mode
      if (fixMode) {
        const updatedContent = barrelContent + `\n// Re-export subdirectory\n${reExportPattern};\n`;
        fs.writeFileSync(barrelPath, updatedContent);
        console.log(`${colors.green}✓ Fixed missing subdirectory re-export in ${relativePath}${colors.reset}`);
        stats.fixedBarrels++;
      }
    }
  }
  
  // Recursively analyze subdirectories
  for (const subdir of subdirectories) {
    analyzeBarrel(subdir);
  }
}

/**
 * Main function
 */
function main() {
  try {
    // Find all component directories
    const rootComponentsDir = path.join(process.cwd(), 'components');
    
    // Start analysis from the components directory
    analyzeBarrel(rootComponentsDir);
    
    // Print summary
    console.log(`\n${colors.bright}${colors.cyan}=== Barrel Export Analysis Summary ===${colors.reset}`);
    console.log(`Barrels analyzed: ${stats.barrelsAnalyzed}`);
    console.log(`Barrels with issues: ${stats.barrelsWithIssues}`);
    console.log(`Missing exports: ${stats.missingExports}`);
    console.log(`Inconsistent patterns: ${stats.inconsistentPatterns}`);
    
    if (fixMode) {
      console.log(`Barrels fixed: ${stats.fixedBarrels}`);
    } else if (stats.barrelsWithIssues > 0) {
      console.log(`\n${colors.yellow}To fix issues, run:${colors.reset} node scripts/analyze-barrel-exports.js --fix`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main();