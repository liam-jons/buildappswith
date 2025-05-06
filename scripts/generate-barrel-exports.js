/**
 * Barrel Export Generator Script
 * 
 * This script automates the creation or updating of barrel export files (index.ts)
 * for component directories in the project.
 * 
 * Usage: node scripts/generate-barrel-exports.js [--dry-run] [--dir=components/ui]
 * 
 * Options:
 * --dry-run: Show changes without writing files
 * --dir: Specify a specific directory to process (default: all component directories)
 * --verbose: Show detailed logs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const dirArg = args.find(arg => arg.startsWith('--dir='));
const targetDir = dirArg ? dirArg.split('=')[1] : null;

// Configuration
const HEADER_TEMPLATE = (dirName) => `/**
 * ${dirName} components barrel export file
 * Version: 1.0.0
 */
`;

/**
 * Generate import statement for a component file
 */
function generateImport(file, baseDir) {
  const relativePath = path.relative(baseDir, file);
  const dirName = path.dirname(relativePath);
  const baseName = path.basename(file, path.extname(file));
  
  // Handle default vs named exports
  const fileContent = fs.readFileSync(file, 'utf-8');
  
  // Special case for core UI components that use variable exports
  if (fileContent.includes('export const') && fileContent.includes('= React.forwardRef')) {
    // Extract the component name from "export const ComponentName = React.forwardRef"
    const match = fileContent.match(/export const (\w+)/);
    if (match && match[1]) {
      return `export { ${match[1]} } from './${baseName}';`;
    }
  }
  
  // Check if the file has a default export
  if (fileContent.includes('export default') || fileContent.match(/export\s+class\s+\w+/) || fileContent.match(/export\s+function\s+\w+/)) {
    if (dirName === '.') {
      return `export { default as ${baseName} } from './${baseName}';`;
    } else {
      const normalizedPath = dirName.split(path.sep).join('/');
      return `export { default as ${baseName} } from './${normalizedPath}/${baseName}';`;
    }
  }
  
  // Use a star export for files that don't have a clear default export
  if (dirName === '.') {
    return `export * from './${baseName}';`;
  } else {
    const normalizedPath = dirName.split(path.sep).join('/');
    return `export * from './${normalizedPath}/${baseName}';`;
  }
}

/**
 * Process a directory to create or update its barrel file
 */
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    return;
  }
  
  const dirName = path.basename(dir);
  const indexPath = path.join(dir, 'index.ts');
  
  // Find all .ts and .tsx files, excluding index files and test files
  const files = glob.sync(path.join(dir, '**/*.{ts,tsx}'), {
    ignore: [
      path.join(dir, 'index.ts'),
      path.join(dir, '**/*.test.{ts,tsx}'),
      path.join(dir, '**/*.spec.{ts,tsx}'),
      path.join(dir, '**/node_modules/**')
    ]
  });
  
  // Filter out index.ts files and directories
  const componentFiles = files.filter(file => {
    return !file.endsWith('index.ts') && 
           !file.endsWith('index.tsx') && 
           fs.statSync(file).isFile();
  });
  
  if (verbose) {
    console.log(`\nFound ${componentFiles.length} files in ${dir}`);
    componentFiles.forEach(file => console.log(`  - ${path.relative(dir, file)}`));
  }
  
  // Check for subdirectories with index.ts files to re-export
  const subdirs = fs.readdirSync(dir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== 'node_modules')
    .map(dirent => dirent.name);
  
  const subdirExports = [];
  
  for (const subdir of subdirs) {
    const subdirIndexPath = path.join(dir, subdir, 'index.ts');
    if (fs.existsSync(subdirIndexPath)) {
      subdirExports.push(`export * from './${subdir}';`);
    }
  }
  
  // Generate imports for component files
  const imports = componentFiles.map(file => generateImport(file, dir));
  
  // Check if we have existing barrel file
  let existingContent = '';
  let existingImports = [];
  let hasSubdirExports = false;
  
  if (fs.existsSync(indexPath)) {
    existingContent = fs.readFileSync(indexPath, 'utf-8');
    
    // Extract existing imports to preserve manual changes
    existingImports = existingContent.split('\n')
      .filter(line => line.trim().startsWith('export'))
      .map(line => line.trim());
    
    // Check if we already have subdirectory exports
    hasSubdirExports = subdirExports.some(exp => existingContent.includes(exp));
  }
  
  // Combine existing and new imports
  const allImports = [...new Set([...imports, ...existingImports])];
  
  // Sort imports: subdirectory exports first, then component exports
  const formattedExports = [
    ...subdirExports,
    ...allImports.filter(imp => !subdirExports.includes(imp))
  ];
  
  // Generate new barrel content
  let newContent = HEADER_TEMPLATE(dirName);
  
  // Add subdirectory exports
  if (subdirExports.length > 0 && !hasSubdirExports) {
    newContent += '\n// Re-export subdirectory exports\n';
    newContent += subdirExports.join('\n');
    newContent += '\n';
  }
  
  // Add component exports
  if (imports.length > 0) {
    newContent += '\n// Export components\n';
    newContent += formattedExports.filter(exp => !subdirExports.includes(exp) || !hasSubdirExports).join('\n');
    newContent += '\n';
  }
  
  // Don't create empty barrel files
  if (formattedExports.length === 0) {
    if (verbose) {
      console.log(`Skipping ${indexPath} - no exports found`);
    }
    return;
  }
  
  // Check if content has changed
  if (existingContent === newContent) {
    console.log(`No changes needed for ${indexPath}`);
    return;
  }
  
  console.log(`${dryRun ? '[DRY RUN] Would update' : 'Updating'} barrel file: ${indexPath}`);
  
  if (dryRun) {
    console.log('\nNew content would be:');
    console.log('---------------------------');
    console.log(newContent);
    console.log('---------------------------');
  } else {
    fs.writeFileSync(indexPath, newContent);
  }
}

/**
 * Main function to run the script
 */
function main() {
  console.log('🛢️  Barrel Export Generator');
  console.log('----------------------------');
  
  if (dryRun) {
    console.log('Running in dry-run mode (no files will be changed)');
  }
  
  try {
    if (targetDir) {
      // Process a specific directory
      const fullPath = path.resolve(targetDir);
      console.log(`Processing directory: ${fullPath}`);
      processDirectory(fullPath);
      
      // Also process subdirectories if it's a domain directory
      if (targetDir.startsWith('components/') && !targetDir.includes('ui/')) {
        const uiDir = path.join(fullPath, 'ui');
        if (fs.existsSync(uiDir)) {
          console.log(`Processing UI subdirectory: ${uiDir}`);
          processDirectory(uiDir);
        }
      }
    } else {
      // Process all component directories
      console.log('Processing all component directories');
      
      // Process main components directory
      processDirectory(path.resolve('components'));
      
      // Process domain directories
      const componentDirs = glob.sync('components/*', {
        ignore: ['components/index.ts']
      });
      
      componentDirs.forEach(dir => {
        if (fs.statSync(dir).isDirectory()) {
          processDirectory(path.resolve(dir));
          
          // Also process UI subdirectory if it exists
          const uiDir = path.join(dir, 'ui');
          if (fs.existsSync(uiDir)) {
            processDirectory(path.resolve(uiDir));
          }
        }
      });
    }
    
    console.log('\n✅ Barrel export generation completed successfully!');
    
    if (dryRun) {
      console.log('\nRun without --dry-run to apply changes');
    }
  } catch (error) {
    console.error('❌ Error generating barrel exports:', error);
    process.exit(1);
  }
}

main();