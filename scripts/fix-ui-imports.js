/**
 * Fix UI Component Imports Script
 * 
 * This script finds and updates UI component imports to use barrel files
 * instead of direct imports from the component files.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern to match imports from @/components/ui/component
const directImportPattern = /@\/components\/ui\/([a-z-]+)/g;

// Pattern to match multiple imports from different UI components
const multipleImportsPattern = /import {[\s\n]+((?:[A-Za-z]+,[\s\n]*)*[A-Za-z]+)[\s\n]*} from ["']@\/components\/ui\/([a-z-]+)["'];/g;

// Files to process
const files = glob.sync('app/**/*.ts?(x)', {
  ignore: ['app/**/*.d.ts', 'app/**/*.test.ts', 'app/**/*.test.tsx'],
  cwd: process.cwd()
});

console.log(`Found ${files.length} files to process`);

let totalReplacements = 0;
let filesModified = 0;

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Track imports to combine
  const uiImports = new Map();
  
  // Check for direct imports like '@/components/ui/button'
  const directMatches = content.match(directImportPattern);
  if (directMatches) {
    console.log(`Found direct imports in ${file}`);
    
    // First pass: collect all component names by import source
    let match;
    const importRegex = /import\s+{\s*([^}]+)\s*}\s+from\s+["']@\/components\/ui\/([a-z-]+)["'];/g;
    
    while ((match = importRegex.exec(content)) !== null) {
      const componentList = match[1].trim().split(/\s*,\s*/);
      const source = match[2];
      
      // Add components to the map
      for (const component of componentList) {
        if (!uiImports.has(component.trim())) {
          uiImports.set(component.trim(), true);
        }
      }
    }
    
    // Second pass: replace all UI component imports with a single import
    if (uiImports.size > 0) {
      // Build the new combined import statement
      const componentNames = Array.from(uiImports.keys()).sort().join(',\n  ');
      const newImport = `import {\n  ${componentNames}\n} from "@/components/ui";`;
      
      // Replace all existing UI imports
      const importPattern = /import\s+{[^}]+}\s+from\s+["']@\/components\/ui\/[a-z-]+["'];/g;
      const originalContent = content;
      content = content.replace(importPattern, '');
      
      // Count replacements
      const replacements = (originalContent.match(importPattern) || []).length;
      
      // Insert the new combined import at the top of the file
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Find a good position after the imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '' && i > 0 && lines[i-1].includes('import ')) {
          insertIndex = i;
          break;
        }
      }
      
      // If we couldn't find a good position, insert after all imports
      if (insertIndex === 0) {
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].includes('import ')) {
            insertIndex = i + 1;
            break;
          }
        }
      }
      
      // Insert the new import
      lines.splice(insertIndex, 0, newImport);
      content = lines.join('\n');
      
      console.log(`Replaced ${replacements} UI imports with a single import in ${file}`);
      totalReplacements += replacements;
      modified = true;
    }
  }
  
  // Update ValidationTierBadge imports
  if (content.includes('@/components/profile/validation-tier-badge')) {
    const updatedContent = content.replace(
      /import\s+{\s*ValidationTierBadge\s*}\s+from\s+["']@\/components\/profile\/validation-tier-badge["'];/g,
      'import { ValidationTierBadge } from "@/components/trust/ui/validation-tier-badge";'
    );
    
    if (updatedContent !== content) {
      content = updatedContent;
      console.log(`Updated ValidationTierBadge import in ${file}`);
      totalReplacements++;
      modified = true;
    }
  }
  
  // Write changes back to file if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
  }
});

console.log(`Completed: Modified ${filesModified} files with ${totalReplacements} replacements`);