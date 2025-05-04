/**
 * NextAuth Dependency Removal Script
 * 
 * This script removes NextAuth dependencies from package.json and updates lockfiles.
 * 
 * Usage:
 * 1. Run with `node lib/auth/clerk/remove-nextauth-deps.js`
 * 2. Commit the changes to package.json
 * 3. Run `pnpm install` to update the lockfile
 * 
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');

// Function to remove NextAuth dependencies
function removeNextAuthDependencies() {
  try {
    console.log('Reading package.json...');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Dependencies to remove
    const NEXTAUTH_DEPS = [
      'next-auth',
      '@auth/*',
      '@next-auth/*',
    ];
    
    // Check if any NextAuth dependencies exist
    let hasNextAuthDeps = false;
    let removedDeps = [];
    
    // Check dependencies
    if (packageJson.dependencies) {
      for (const dep in packageJson.dependencies) {
        for (const nextAuthDep of NEXTAUTH_DEPS) {
          if (nextAuthDep.endsWith('*')) {
            const prefix = nextAuthDep.replace('*', '');
            if (dep.startsWith(prefix)) {
              hasNextAuthDeps = true;
              removedDeps.push(dep);
              delete packageJson.dependencies[dep];
            }
          } else if (dep === nextAuthDep) {
            hasNextAuthDeps = true;
            removedDeps.push(dep);
            delete packageJson.dependencies[dep];
          }
        }
      }
    }
    
    // Check devDependencies
    if (packageJson.devDependencies) {
      for (const dep in packageJson.devDependencies) {
        for (const nextAuthDep of NEXTAUTH_DEPS) {
          if (nextAuthDep.endsWith('*')) {
            const prefix = nextAuthDep.replace('*', '');
            if (dep.startsWith(prefix)) {
              hasNextAuthDeps = true;
              removedDeps.push(dep);
              delete packageJson.devDependencies[dep];
            }
          } else if (dep === nextAuthDep) {
            hasNextAuthDeps = true;
            removedDeps.push(dep);
            delete packageJson.devDependencies[dep];
          }
        }
      }
    }
    
    // Write updated package.json if changes were made
    if (hasNextAuthDeps) {
      console.log(`Removing NextAuth dependencies: ${removedDeps.join(', ')}`);
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log('Dependencies removed successfully!');
      console.log('Please run "pnpm install" to update the lockfile.');
    } else {
      console.log('No NextAuth dependencies found in package.json.');
    }
  } catch (error) {
    console.error('Error removing NextAuth dependencies:', error);
    process.exit(1);
  }
}

// Run the function
removeNextAuthDependencies();
