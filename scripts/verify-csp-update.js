#!/usr/bin/env node

/**
 * Script to verify CSP updates for Clerk custom domain
 * Ensures clerk.buildappswith.com is properly allowed for images
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const filesToCheck = [
  {
    path: path.join(__dirname, '../next.config.mjs'),
    name: 'next.config.mjs',
    patterns: {
      'img-src with clerk.buildappswith.com': /img-src[^;]*clerk\.buildappswith\.com/,
      'remotePatterns with clerk.buildappswith.com': /hostname:\s*['"]clerk\.buildappswith\.com['"]/
    }
  },
  {
    path: path.join(__dirname, '../lib/middleware/config.ts'),
    name: 'lib/middleware/config.ts',
    patterns: {
      'img-src with clerk.buildappswith.com': /img-src[^"]*clerk\.buildappswith\.com/
    }
  }
];

console.log('🔍 Verifying CSP updates for Clerk custom domain...\n');

let allChecksPass = true;

filesToCheck.forEach(file => {
  console.log(`📄 Checking ${file.name}:`);
  
  try {
    const content = fs.readFileSync(file.path, 'utf8');
    
    Object.entries(file.patterns).forEach(([description, pattern]) => {
      if (pattern.test(content)) {
        console.log(`  ✅ ${colors.green}${description}${colors.reset}`);
      } else {
        console.log(`  ❌ ${colors.red}${description} - NOT FOUND${colors.reset}`);
        allChecksPass = false;
      }
    });
  } catch (error) {
    console.log(`  ❌ ${colors.red}Error reading file: ${error.message}${colors.reset}`);
    allChecksPass = false;
  }
  
  console.log('');
});

if (allChecksPass) {
  console.log(`${colors.green}✨ All CSP updates verified successfully!${colors.reset}`);
  console.log('\nNext steps:');
  console.log('1. Deploy to staging environment');
  console.log('2. Test image loading without authentication');
  console.log('3. Monitor browser console for CSP violations');
  console.log('4. Deploy to production if tests pass');
} else {
  console.log(`${colors.red}⚠️  Some CSP updates are missing or incorrect.${colors.reset}`);
  console.log('\nPlease review the files and ensure clerk.buildappswith.com is added to:');
  console.log('- img-src directive in CSP');
  console.log('- remotePatterns in Next.js image config');
  process.exit(1);
}