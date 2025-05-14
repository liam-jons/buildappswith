/**
 * Verify Middleware Configuration
 * 
 * This script checks the middleware configuration to ensure
 * all necessary public routes are included.
 */

const fs = require('fs');
const path = require('path');

// Required public route patterns
const requiredPatterns = [
  // Static resources
  '/hero-light.png',
  '/hero-dark.png',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  
  // Directory patterns
  '/logos/(.*)',
  '/images/(.*)',
  '/fonts/(.*)',
  '/public/(.*)',
  '/assets/(.*)',
  
  // Next.js patterns
  '/_next/static/(.*)',
  '/_next/image/(.*)',
  
  // API endpoints
  '/api/marketplace/builders',
  '/api/marketplace/builders/(.+)',
  
  // Public pages
  '/marketplace',
  '/marketplace/(.*)',
];

function verifyMiddlewareConfig() {
  console.log('Verifying middleware configuration...\n');
  
  // Read middleware.ts file
  const middlewarePath = path.join(process.cwd(), 'middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    console.error('ERROR: middleware.ts not found!');
    return false;
  }
  
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Extract publicRoutes array
  const publicRoutesMatch = middlewareContent.match(/const publicRoutes = \[([\s\S]*?)\];/);
  
  if (!publicRoutesMatch) {
    console.error('ERROR: Could not find publicRoutes array in middleware.ts');
    return false;
  }
  
  const publicRoutesContent = publicRoutesMatch[1];
  
  // Check each required pattern
  let allPassed = true;
  const missing = [];
  
  for (const pattern of requiredPatterns) {
    // Escape special characters for regex
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const found = publicRoutesContent.includes(pattern);
    
    if (found) {
      console.log(`✓ Found: ${pattern}`);
    } else {
      console.log(`✗ Missing: ${pattern}`);
      missing.push(pattern);
      allPassed = false;
    }
  }
  
  console.log('\n=== Verification Summary ===');
  if (allPassed) {
    console.log('✓ All required public routes are configured!');
  } else {
    console.log(`✗ Missing ${missing.length} required routes:`);
    missing.forEach(route => console.log(`  - ${route}`));
    console.log('\nPlease add the missing routes to the publicRoutes array in middleware.ts');
  }
  
  // Check matcher configuration
  console.log('\n=== Matcher Configuration ===');
  if (middlewareContent.includes('matcher: [')) {
    const matcherMatch = middlewareContent.match(/matcher: \[([\s\S]*?)\]/);
    if (matcherMatch) {
      console.log('Current matcher configuration:');
      console.log(matcherMatch[0]);
      
      // Check for recommended patterns
      if (middlewareContent.includes('"/((?!.*\\..*|_next).*)"')) {
        console.log('✓ Using recommended matcher pattern');
      } else {
        console.log('⚠ Consider using the recommended matcher pattern for better static file handling');
      }
    }
  }
  
  return allPassed;
}

// Run verification
if (require.main === module) {
  const passed = verifyMiddlewareConfig();
  process.exit(passed ? 0 : 1);
}

module.exports = { verifyMiddlewareConfig };