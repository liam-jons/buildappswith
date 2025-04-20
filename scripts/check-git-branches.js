#!/usr/bin/env node

/**
 * Git Branch Check Script
 * 
 * Ensures only develop and main branches exist and are aligned
 */

const { execSync } = require('child_process');

// Define colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.cyan}=== Git Branch Check ===${colors.reset}\n`);

try {
  // Step 1: Check current branch
  console.log(`${colors.yellow}1. Current branch:${colors.reset}`);
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  console.log(`   ${currentBranch}`);
  
  // Step 2: List all branches
  console.log(`\n${colors.yellow}2. All branches:${colors.reset}`);
  const allBranches = execSync('git branch -a', { encoding: 'utf8' });
  console.log(allBranches);
  
  // Step 3: Check for divergence between main and develop
  console.log(`\n${colors.yellow}3. Checking alignment between main and develop:${colors.reset}`);
  try {
    // Fetch latest from remote
    execSync('git fetch origin', { stdio: 'ignore' });
    
    // Check for commits ahead/behind
    const mainStatus = execSync('git rev-list --left-right --count origin/main...origin/develop', { encoding: 'utf8' }).trim();
    const [ahead, behind] = mainStatus.split('\t');
    
    if (ahead === '0' && behind === '0') {
      console.log(`${colors.green}✓ main and develop are aligned${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Branches are not aligned:${colors.reset}`);
      console.log(`   main is ${ahead} commits ahead and ${behind} commits behind develop`);
    }
  } catch (error) {
    console.log(`${colors.red}Could not check alignment:${colors.reset}`);
    console.log(error.message);
  }
  
  // Step 4: List branches that need removal
  console.log(`\n${colors.yellow}4. Branches that should be removed:${colors.reset}`);
  const branches = execSync('git branch -r', { encoding: 'utf8' })
    .split('\n')
    .map(b => b.trim())
    .filter(b => b && !b.includes('HEAD') && !b.includes('main') && !b.includes('develop'));
  
  if (branches.length > 0) {
    console.log(branches.join('\n'));
    console.log(`\n${colors.red}To remove these branches:${colors.reset}`);
    branches.forEach(branch => {
      const branchName = branch.replace('origin/', '');
      console.log(`git push origin --delete ${branchName}`);
    });
  } else {
    console.log(`${colors.green}✓ No extra branches found${colors.reset}`);
  }
  
  // Step 5: Recommendations
  console.log(`\n${colors.yellow}5. Recommendations:${colors.reset}`);
  console.log(`To align branches:`);
  console.log(`1. git checkout develop`);
  console.log(`2. git pull origin develop`);
  console.log(`3. git checkout main`);
  console.log(`4. git pull origin main`);
  console.log(`5. git merge develop`);
  console.log(`6. git push origin main`);
  
} catch (error) {
  console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
}
