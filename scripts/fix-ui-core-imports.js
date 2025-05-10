#!/usr/bin/env node

/**
 * Fix UI Component Imports Script
 * 
 * This script finds and updates UI component imports to use the /core/ path
 * instead of direct imports from the ui directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Fixing UI component imports to use /core/ path...');

// Find all files with UI component imports
const findCommand = "grep -r --include='*.tsx' --include='*.jsx' \"import .* from '@/components/ui/\" . | grep -v \"from '@/components/ui/core/\"";

try {
  const output = execSync(findCommand, { encoding: 'utf8', cwd: process.cwd() });
  const lines = output.trim().split('\n');
  
  // Group by file
  const fileMatches = {};
  lines.forEach(line => {
    const [filePath, match] = line.split(':', 2);
    if (!fileMatches[filePath]) {
      fileMatches[filePath] = [];
    }
    fileMatches[filePath].push(match.trim());
  });
  
  // Process each file
  let totalReplacements = 0;
  Object.entries(fileMatches).forEach(([filePath, matches]) => {
    console.log(`Processing ${filePath}...`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let replacements = 0;
      
      // Replace each match
      matches.forEach(match => {
        const originalImport = match;
        const fixedImport = originalImport.replace("from '@/components/ui/", "from '@/components/ui/core/");
        
        if (content.includes(originalImport)) {
          content = content.replace(originalImport, fixedImport);
          replacements++;
        }
      });
      
      // Write back the file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${replacements} imports in ${filePath}`);
      totalReplacements += replacements;
    } catch (err) {
      console.error(`❌ Error processing ${filePath}:`, err);
    }
  });
  
  console.log('Done! Fixed', totalReplacements, 'UI imports in', Object.keys(fileMatches).length, 'files');
} catch (err) {
  console.error('Error finding files:', err);
}