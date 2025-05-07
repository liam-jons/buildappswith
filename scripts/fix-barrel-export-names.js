/**
 * Script to fix kebab-case names in barrel export files
 * This converts kebab-case component names to PascalCase in exports
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Convert kebab-case to PascalCase
function kebabToPascalCase(kebabStr) {
  return kebabStr
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Process a barrel file, fixing kebab-case exports
function processBarrelFile(filePath) {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to find default exports with kebab-case names
  const defaultExportRegex = /export\s*{\s*default\s+as\s+([\w-]+)\s*}\s*from\s+['"](\.\/.*)['"]/g;
  
  // Replace kebab-case with PascalCase in default exports
  content = content.replace(defaultExportRegex, (match, componentName, importPath) => {
    // Only transform if it's kebab-case
    if (componentName.includes('-')) {
      const pascalName = kebabToPascalCase(componentName);
      return `export { default as ${pascalName} } from '${importPath}'`;
    }
    return match;
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

// Find all barrel index.ts files
const barrelFiles = glob.sync(path.join('components', '**', 'index.ts'));

// Process each barrel file
barrelFiles.forEach(processBarrelFile);

console.log('✅ Barrel export names fixed successfully!');