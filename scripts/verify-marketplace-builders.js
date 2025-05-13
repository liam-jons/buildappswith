#!/usr/bin/env node

/**
 * Marketplace Builders API Verification Script
 * 
 * This script directly tests the marketplace API to verify that builders
 * are being returned correctly with complete profile data.
 * 
 * Usage:
 *   node scripts/verify-marketplace-builders.js
 * 
 * To test against a specific environment:
 *   NEXT_PUBLIC_SITE_URL=https://your-site.com node scripts/verify-marketplace-builders.js
 */

const https = require('https');
const http = require('http');
const { PrismaClient } = require('@prisma/client');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Log a message with color
 */
function logColored(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Make an HTTP request
 */
async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (err) {
          reject(new Error(`Failed to parse response: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Check database for searchable builder profiles
 */
async function checkDatabaseProfiles() {
  logColored('\n=== Database Check ===', colors.cyan);
  
  try {
    // Get searchable builder profiles
    const searchableProfiles = await prisma.builderProfile.findMany({
      where: { searchable: true },
      include: {
        user: true,
        sessionTypes: true
      }
    });
    
    logColored(`Found ${searchableProfiles.length} searchable builder profiles in database`, colors.green);
    
    if (searchableProfiles.length === 0) {
      logColored('No searchable builder profiles found in database!', colors.red);
      return [];
    }
    
    // Log important details about each profile
    for (const profile of searchableProfiles) {
      logColored(`\nProfile: ${profile.displayName || profile.user?.name || 'Unknown'}`, colors.yellow);
      console.log(`  - ID: ${profile.id}`);
      console.log(`  - User ID: ${profile.userId}`);
      console.log(`  - Clerk ID: ${profile.user?.clerkId || 'Not set'}`);
      console.log(`  - Searchable: ${profile.searchable}`);
      console.log(`  - Featured: ${profile.featured}`);
      console.log(`  - Session Types: ${profile.sessionTypes.length}`);
    }
    
    return searchableProfiles;
  } catch (error) {
    logColored(`Error checking database: ${error.message}`, colors.red);
    console.error(error);
    return [];
  }
}

/**
 * Test the marketplace API
 */
async function testMarketplaceAPI() {
  logColored('\n=== API Check ===', colors.cyan);
  
  try {
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    logColored(`Using base URL: ${baseUrl}`, colors.blue);
    
    // Test builder listing API
    const listUrl = `${baseUrl}/api/marketplace/builders`;
    logColored(`Testing builder listing API: ${listUrl}`, colors.blue);
    
    const listResponse = await makeRequest(listUrl);
    
    if (listResponse.statusCode !== 200) {
      logColored(`API returned status code ${listResponse.statusCode}`, colors.red);
      console.log(listResponse.data);
      return null;
    }
    
    const { data: builders, pagination } = listResponse.data;
    
    logColored(`API returned ${builders.length} of ${pagination.total} builders (page ${pagination.page} of ${pagination.totalPages})`, colors.green);
    
    if (builders.length === 0) {
      logColored('No builders returned from API!', colors.red);
      logColored('This indicates a problem with the API or database integration.', colors.red);
      return null;
    }
    
    // Display details about the builders returned by the API
    logColored('\nBuilder Profiles from API:', colors.yellow);
    for (const builder of builders) {
      console.log(`- ${builder.name || builder.displayName || 'Unknown'} (ID: ${builder.id})`);
      console.log(`  * User ID: ${builder.userId}`);
      console.log(`  * Searchable: ${builder.searchable !== false ? 'Yes (or not specified)' : 'No'}`);
      console.log(`  * Featured: ${builder.featured ? 'Yes' : 'No'}`);
      console.log(`  * Skills: ${builder.topSkills?.length || 0} top skills, ${builder.skills?.length || 0} total skills`);
    }
    
    // Check for specific builder (Liam)
    const liamBuilder = builders.find(b => 
      (b.name && b.name.toLowerCase().includes('liam')) || 
      (b.displayName && b.displayName.toLowerCase().includes('liam'))
    );
    
    if (liamBuilder) {
      logColored('\nFound Liam\'s profile in API response!', colors.green);
      console.log(`- ID: ${liamBuilder.id}`);
      console.log(`- Name: ${liamBuilder.name || liamBuilder.displayName}`);
      console.log(`- User ID: ${liamBuilder.userId}`);
    } else {
      logColored('\nLiam\'s profile not found in API response!', colors.red);
    }
    
    return {
      builders,
      pagination,
      liamFound: !!liamBuilder
    };
  } catch (error) {
    logColored(`Error testing API: ${error.message}`, colors.red);
    console.error(error);
    return null;
  }
}

/**
 * Analyze results and suggest fixes
 */
function analyzeResults(dbProfiles, apiResults) {
  logColored('\n=== Analysis ===', colors.cyan);
  
  if (!apiResults) {
    logColored('Unable to analyze: API check failed', colors.red);
    return;
  }
  
  const { builders, pagination, liamFound } = apiResults;
  
  // Compare counts
  const dbCount = dbProfiles.length;
  const apiCount = pagination.total;
  
  if (dbCount === apiCount) {
    logColored(`✓ Counts match: ${dbCount} profiles in database, ${apiCount} reported by API`, colors.green);
  } else {
    logColored(`✗ Count mismatch: ${dbCount} profiles in database, but API reports ${apiCount}`, colors.red);
    logColored('This suggests filtering in the API is excluding some profiles', colors.yellow);
  }
  
  // Check Liam's profile
  const liamInDb = dbProfiles.find(p => 
    (p.displayName && p.displayName.toLowerCase().includes('liam')) || 
    (p.user?.name && p.user.name.toLowerCase().includes('liam'))
  );
  
  if (liamInDb && liamFound) {
    logColored('✓ Liam\'s profile exists in both database and API', colors.green);
  } else if (liamInDb && !liamFound) {
    logColored('✗ Liam\'s profile exists in database but NOT in API', colors.red);
    logColored('This suggests a problem with the API filtering or marketplace query', colors.yellow);
    
    // Check key fields on Liam's profile
    logColored('\nDetailed check of Liam\'s profile in database:', colors.magenta);
    console.log(`- Searchable: ${liamInDb.searchable ? '✓' : '✗'}`);
    console.log(`- Featured: ${liamInDb.featured ? '✓' : '✗'}`);
    console.log(`- User has Clerk ID: ${liamInDb.user?.clerkId ? '✓' : '✗'}`);
    console.log(`- Session Types: ${liamInDb.sessionTypes.length} found`);
    
    logColored('\nPossible issues:', colors.yellow);
    if (!liamInDb.searchable) logColored('- Profile is not marked as searchable', colors.yellow);
    if (!liamInDb.user?.clerkId) logColored('- User record missing Clerk ID', colors.yellow);
    if (liamInDb.sessionTypes.length === 0) logColored('- Profile has no session types', colors.yellow);
  } else if (!liamInDb) {
    logColored('✗ Liam\'s profile not found in database', colors.red);
    logColored('You need to create the profile first with the create-liam-user.js script', colors.yellow);
  }
  
  // Diagnostic information
  logColored('\n=== API Response Analysis ===', colors.cyan);
  console.log(`Total builders returned: ${builders.length}`);
  console.log(`Pagination: Page ${pagination.page} of ${pagination.totalPages}, ${pagination.total} total items`);
  
  // Suggest fixes
  logColored('\n=== Recommended Actions ===', colors.cyan);
  
  if (dbCount > 0 && apiCount === 0) {
    logColored('1. Check API implementation in marketplace-service.ts', colors.yellow);
    logColored('2. Verify environment variables are set correctly', colors.yellow);
    logColored('3. Check API routes in app/api/marketplace/builders/route.ts', colors.yellow);
  } else if (liamInDb && !liamFound) {
    logColored('1. Update Liam\'s profile to ensure searchable=true:', colors.yellow);
    console.log(`
    await prisma.builderProfile.update({
      where: { id: "${liamInDb.id}" },
      data: { searchable: true }
    });
    `);
    
    logColored('2. Check marketplace filtering in marketplace-service.ts', colors.yellow);
  } else if (!liamInDb) {
    logColored('1. Create Liam\'s profile:', colors.yellow);
    console.log(`
    DATABASE_URL=your_production_db_url node scripts/create-liam-user.js
    `);
  }
}

/**
 * Main function
 */
async function main() {
  logColored('=== Marketplace Builders API Verification ===', colors.bright + colors.cyan);
  logColored('This script checks if builder profiles are correctly set up and visible in the API.\n', colors.bright);
  
  try {
    // Check database
    const dbProfiles = await checkDatabaseProfiles();
    
    // Test API
    const apiResults = await testMarketplaceAPI();
    
    // Analyze results
    analyzeResults(dbProfiles, apiResults);
    
  } catch (error) {
    logColored(`Script error: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main().catch(e => {
  console.error(e);
  process.exit(1);
});