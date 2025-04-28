#!/usr/bin/env node

/**
 * Script to fix barrel export files to use relative paths
 * 
 * Usage:
 *   node scripts/fix-barrel-exports.js [--dry-run]
 * 
 * This script updates barrel export files (index.ts) to use relative paths
 * instead of absolute paths with @/components/...
 * 
 * Options:
 *   --dry-run    Show changes without modifying files
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Fix a single barrel file
function fixBarrelFile(filePath, directory) {
  console.log(`Checking ${filePath}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  File doesn't exist, skipping`);
      return 0;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changes = 0;
    
    // Pattern for exports using absolute path within the same directory
    const absolutePathRegex = new RegExp(`export \\* from "@\\/components\\/${directory.replace(/\//g, '\\/')}(\\/[^"]*)";`, 'g');
    const matches = [...content.matchAll(absolutePathRegex)];
    
    if (matches.length > 0) {
      console.log(`  Found ${matches.length} absolute path exports to update`);
      
      // Replace absolute paths with relative paths
      updatedContent = content.replace(absolutePathRegex, (match, componentPath) => {
        const relativePath = `.${componentPath}`;
        changes++;
        return `export * from "${relativePath}";`;
      });
      
      if (!isDryRun && updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`  Updated ${filePath} (${changes} changes)`);
      } else if (updatedContent !== content) {
        console.log(`  Would update ${filePath} (${changes} changes) (dry run)`);
        console.log('  Example change:');
        console.log(`    From: ${matches[0][0]}`);
        console.log(`    To:   export * from ".${matches[0][1]}";`);
      }
    } else {
      console.log(`  ✅ Already using relative paths`);
    }
    
    return changes;
  } catch (error) {
    console.error(`  Error processing ${filePath}:`, error);
    return 0;
  }
}

// Get all barrel files
function getAllBarrelFiles() {
  const result = [];
  const componentsDir = path.join(process.cwd(), 'components');
  
  // Get all directories within components
  const items = fs.readdirSync(componentsDir);
  items.forEach(item => {
    const itemPath = path.join(componentsDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      // Add main barrel file for the domain
      const indexPath = path.join(itemPath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        result.push({
          path: indexPath,
          directory: item
        });
      }
      
      // Check for subdirectories (e.g., ui, hooks)
      const subdirs = fs.readdirSync(itemPath);
      subdirs.forEach(subdir => {
        const subdirPath = path.join(itemPath, subdir);
        if (fs.statSync(subdirPath).isDirectory()) {
          const subIndexPath = path.join(subdirPath, 'index.ts');
          if (fs.existsSync(subIndexPath)) {
            result.push({
              path: subIndexPath,
              directory: `${item}/${subdir}`
            });
          }
        }
      });
    }
  });
  
  return result;
}

// Main function
function main() {
  console.log(`Running barrel export fix script${isDryRun ? ' (dry run)' : ''}`);
  
  const barrelFiles = getAllBarrelFiles();
  console.log(`Found ${barrelFiles.length} barrel files to check`);
  
  let totalChanges = 0;
  barrelFiles.forEach(file => {
    const changes = fixBarrelFile(file.path, file.directory);
    totalChanges += changes;
  });
  
  // Summary
  console.log(`\nTotal: ${totalChanges} exports ${isDryRun ? 'would be' : 'were'} updated`);
  
  if (isDryRun && totalChanges > 0) {
    console.log('\nRun without --dry-run to apply these changes');
  }
}

main();
