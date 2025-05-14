#!/usr/bin/env node

/**
 * Script to verify CSP and CORS configurations for Clerk
 */

const fs = require('fs');
const path = require('path');

// Color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Required domains for Clerk to work properly
const requiredDomains = {
  scriptSrc: [
    'https://*.clerk.accounts.dev',
    'https://flying-troll-12.clerk.accounts.dev',
    'https://clerk.io',
    'https://*.clerk.com',
    'https://clerk.buildappswith.com',
  ],
  connectSrc: [
    'https://*.clerk.accounts.dev',
    'https://flying-troll-12.clerk.accounts.dev',
    'https://clerk.io',
    'https://*.clerk.com',
    'https://clerk.buildappswith.com',
  ],
  imgSrc: [
    'https://*.clerk.com',
    'https://img.clerk.com',
    'https://images.clerk.dev',
    'https://clerk.buildappswith.com',
  ],
  frameSrc: [
    'https://*.clerk.accounts.dev',
  ]
};

// Files to check
const filesToCheck = [
  {
    path: path.join(__dirname, '../next.config.mjs'),
    name: 'next.config.mjs'
  },
  {
    path: path.join(__dirname, '../lib/middleware/config.ts'),
    name: 'lib/middleware/config.ts'
  },
  {
    path: path.join(__dirname, '../middleware.ts'),
    name: 'middleware.ts'
  }
];

console.log('🔍 Verifying CSP and CORS configurations for Clerk...\n');

let allChecksPass = true;

// Check CSP configurations
console.log('📋 Checking CSP configurations:');

filesToCheck.forEach(file => {
  if (file.name === 'middleware.ts') {
    console.log(`\n📄 ${file.name} (Checking public routes):`);
    
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      
      // Check for important public routes
      const requiredPublicRoutes = [
        '/images/(.*)',
        '/fonts/(.*)',
        '/static/(.*)',
      ];
      
      requiredPublicRoutes.forEach(route => {
        if (content.includes(route)) {
          console.log(`  ✅ ${colors.green}Public route: ${route}${colors.reset}`);
        } else {
          console.log(`  ❌ ${colors.red}Missing public route: ${route}${colors.reset}`);
          allChecksPass = false;
        }
      });
      
      // Check for ignored routes
      const requiredIgnoredRoutes = [
        '/_next/(.*)',
        '/favicon.ico',
      ];
      
      requiredIgnoredRoutes.forEach(route => {
        if (content.includes(route)) {
          console.log(`  ✅ ${colors.green}Ignored route: ${route}${colors.reset}`);
        } else {
          console.log(`  ❌ ${colors.red}Missing ignored route: ${route}${colors.reset}`);
          allChecksPass = false;
        }
      });
      
    } catch (error) {
      console.log(`  ❌ ${colors.red}Error reading file: ${error.message}${colors.reset}`);
      allChecksPass = false;
    }
  } else {
    console.log(`\n📄 ${file.name}:`);
    
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      
      // Check each CSP directive
      Object.entries(requiredDomains).forEach(([directive, domains]) => {
        const directiveName = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
        console.log(`  ${directiveName}:`);
        
        domains.forEach(domain => {
          // Special handling for wildcard domains
          const domainPattern = domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(domainPattern);
          
          if (regex.test(content)) {
            console.log(`    ✅ ${colors.green}${domain}${colors.reset}`);
          } else {
            console.log(`    ❌ ${colors.red}${domain} - NOT FOUND${colors.reset}`);
            allChecksPass = false;
          }
        });
      });
    } catch (error) {
      console.log(`  ❌ ${colors.red}Error reading file: ${error.message}${colors.reset}`);
      allChecksPass = false;
    }
  }
});

// Summary
console.log('\n📊 Summary:');

if (allChecksPass) {
  console.log(`${colors.green}✅ All CSP and CORS configurations are correct!${colors.reset}`);
  console.log('\nNext steps:');
  console.log('1. Restart your development server');
  console.log('2. Clear browser cache and cookies');
  console.log('3. Test in incognito/private browsing mode');
  console.log('4. Check browser console for any remaining errors');
} else {
  console.log(`${colors.red}❌ Some configurations are missing or incorrect.${colors.reset}`);
  console.log('\nRequired fixes:');
  console.log('1. Add missing domains to CSP directives');
  console.log('2. Update middleware public and ignored routes');
  console.log('3. Ensure all Clerk domains are properly configured');
}

// Additional recommendations
console.log('\n💡 Additional recommendations:');
console.log('1. Consider using environment variables for Clerk domains');
console.log('2. Test with production Clerk instance if available');
console.log('3. Monitor browser console for CSP violations');
console.log('4. Use Clerk dashboard to verify custom domain settings');