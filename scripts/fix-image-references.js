/**
 * Script to fix image field references throughout the codebase
 * 
 * This script searches for potentially problematic references to:
 * - user.image vs user.imageUrl
 * - builder.image vs builder.imageUrl vs builder.avatarUrl
 * - And updates them to use the correct field based on schema analysis
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const targetDirs = [
  './components/marketplace',
  './app/(platform)/marketplace',
  './lib/marketplace',
];

// Map of pattern replacements - will be expanded based on findings
const replacements = [
  // Fix user.image references to use user.imageUrl
  { from: /user\.image/g, to: 'user.imageUrl' },
  
  // Fix BuilderImage props based on field change
  { from: /src\s*=\s*\{builder\.image\}/g, to: 'src={builder.avatarUrl || builder.user.imageUrl}' },
  
  // Fix other common instances
  { from: /builder\.image\b/g, to: 'builder.avatarUrl || builder.user.imageUrl' },
  { from: /user\.image\s*\|\|\s*null/g, to: 'user.imageUrl || null' },
  { from: /\.image\s*\?\s*\.image/g, to: '.imageUrl ? .imageUrl' },
];

// Function to find all files in a directory recursively
function findFiles(dir, pattern) {
  // Initial find command
  const findCmd = `find ${dir} -type f -name "${pattern}" | grep -v node_modules`;
  
  try {
    // Run find and get results as a string
    const output = execSync(findCmd, { encoding: 'utf8' });
    
    // Split output into lines and filter empty lines
    return output.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error(`Error finding files in ${dir}:`, error.message);
    return [];
  }
}

// Function to process a file with replacements
function processFile(filePath, replacements) {
  try {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let matchCount = 0;
    
    // Apply each replacement pattern
    for (const { from, to } of replacements) {
      const matches = content.match(from);
      if (matches) {
        matchCount += matches.length;
        content = content.replace(from, to);
        changed = true;
      }
    }
    
    // Only write back if changes were made
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath} (${matchCount} matches)`);
      return { path: filePath, matches: matchCount };
    } else {
      console.log(`No changes needed in ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

// Main execution function
async function fixImageReferences() {
  console.log('Fixing image field references in the codebase...');
  const changes = [];
  
  // Process TypeScript/JavaScript files in target directories
  for (const dir of targetDirs) {
    console.log(`\nSearching in ${dir}...`);
    
    // Find TS/TSX/JS files
    const tsFiles = findFiles(dir, "*.ts*");
    const jsFiles = findFiles(dir, "*.js*");
    const allFiles = [...tsFiles, ...jsFiles];
    
    // Process each file
    for (const filePath of allFiles) {
      const result = processFile(filePath, replacements);
      if (result) {
        changes.push(result);
      }
    }
  }
  
  // Summary
  console.log('\n--- SUMMARY ---');
  console.log(`Changed ${changes.length} files`);
  changes.forEach(change => {
    console.log(`- ${change.path} (${change.matches} replacements)`);
  });
  
  console.log('\nNext steps:');
  console.log('1. Review the changes to ensure they are correct');
  console.log('2. Test the marketplace page to see if the issue is resolved');
  console.log('3. Run "pnpm run dev" to start the development server');
}

// Run the script
fixImageReferences().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});