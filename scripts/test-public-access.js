/**
 * Test Script for Public Resource Access
 * 
 * This script tests that all static resources and public routes
 * are accessible without authentication. It should be run with
 * the development server running on http://localhost:3000
 */

const publicResources = [
  // Hero images
  '/hero-light.png',
  '/hero-dark.png',
  
  // Logos
  '/logos/supabase-logo.svg',
  '/logos/anthropic-logo.svg',
  '/logos/neon-logo.svg',
  '/logos/lovable-logo.svg',
  '/logos/perplexity-logo.svg',
  '/logos/vercel-logo.svg',
  
  // Fonts
  '/fonts/Inter-VariableFont_opsz,wght.ttf',
  '/fonts/Inter-Italic-VariableFont_opsz,wght.ttf',
  '/fonts/Interceptor.otf',
  '/fonts/OpenDyslexic-Regular.otf',
  
  // Images
  '/images/default-avatar.svg',
  
  // Public pages
  '/marketplace',
  '/toolkit',
  '/how-it-works',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  
  // API endpoints
  '/api/marketplace/builders',
  '/api/marketplace/featured',
  
  // Static files
  '/favicon.ico',
  '/robots.txt',
];

async function testPublicAccess() {
  console.log('Testing public resource access...\n');
  
  let passedCount = 0;
  let failedCount = 0;
  const failures = [];
  
  for (const resource of publicResources) {
    try {
      const response = await fetch(`http://localhost:3000${resource}`, {
        credentials: 'omit', // No authentication
        headers: {
          'User-Agent': 'Public-Access-Test/1.0',
        },
      });
      
      const status = response.status;
      const isSuccess = status === 200 || status === 304;
      
      console.log(`${isSuccess ? '✓' : '✗'} ${resource}: ${status}`);
      
      if (isSuccess) {
        passedCount++;
      } else {
        failedCount++;
        failures.push({ resource, status });
      }
    } catch (error) {
      console.log(`✗ ${resource}: ERROR - ${error.message}`);
      failedCount++;
      failures.push({ resource, error: error.message });
    }
  }
  
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  
  if (failures.length > 0) {
    console.log('\nFailed resources:');
    failures.forEach(({ resource, status, error }) => {
      console.log(`  - ${resource}: ${status || error}`);
    });
  }
  
  console.log('\n=== Recommendations ===');
  if (failedCount === 0) {
    console.log('✓ All public resources are accessible without authentication!');
  } else {
    console.log('Some resources are still being blocked. Please check:');
    console.log('  1. Middleware configuration matches the patterns');
    console.log('  2. Server needs to be restarted after middleware changes');
    console.log('  3. Check browser console for CORS or CSP errors');
    console.log('  4. Verify the resource paths are correct');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testPublicAccess().catch(console.error);
}

module.exports = { testPublicAccess };